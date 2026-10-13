import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { spawnSync } from 'node:child_process'
import { fileURLToPath } from 'node:url'
import { EBAY_ES_ADMITTED_CONDITION_IDS } from '../lib/ebay-listing'
import { MARKETPLACE_ID_ALLOWLIST } from '../lib/second-hand-marketplace-id'
import { secondHandVariantMapping } from '../lib/second-hand-variant-catalog'
import { runEbayEsCategorySuggestions } from '../scripts/read-ebay-es-category-suggestions'
import {
  categorySuggestionsUrl,
  createCategoryReadingAuth,
  EBAY_ES_REPORTED_CATEGORY_139971,
  EBAY_ES_REPORTED_CATEGORY_TREE_ID,
  EBAY_TAXONOMY_SUGGESTION_CONFIRMATION,
  readCategorySuggestions,
} from '../lib/ebay-es-category-reading'

const SUGGESTION_URL = 'https://api.ebay.com/commerce/taxonomy/v1/category_tree/186/get_category_suggestions?q=Nintendo+Switch'

function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'content-type': 'application/json' },
  })
}

function tokenResponse(): Response {
  return jsonResponse({ access_token: 'fixture-token', expires_in: 7200, token_type: 'Bearer' })
}

function switchSuggestion() {
  return {
    categoryTreeId: '186',
    categoryTreeVersion: '96',
    categorySuggestions: [
      {
        category: { categoryId: '139971', categoryName: 'Consolas' },
        categoryTreeNodeLevel: 3,
        categoryTreeNodeAncestors: [
          { categoryId: '1249', categoryName: 'Videojuegos y consolas', categoryTreeNodeLevel: 2 },
          { categoryId: '1', categoryName: 'Raíz', categoryTreeNodeLevel: 0 },
        ],
      },
      {
        category: { categoryId: '139973', categoryName: 'Nintendo Switch OLED' },
        categoryTreeNodeLevel: 4,
        categoryTreeNodeAncestors: [
          { categoryId: '139971', categoryName: 'Consolas', categoryTreeNodeLevel: 3 },
        ],
      },
    ],
  }
}

test('suggestions use the reported EBAY_ES tree and do not open the whole tree', () => {
  assert.equal(categorySuggestionsUrl('186', 'Nintendo Switch'), SUGGESTION_URL)
  assert.equal(categorySuggestionsUrl('186', 'Nintendo Switch')?.includes('/category_tree/186?'), false)
  assert.equal(categorySuggestionsUrl('186', ''), null)
  assert.equal(EBAY_ES_REPORTED_CATEGORY_139971.categoryName, 'Consolas')
  assert.equal(EBAY_ES_REPORTED_CATEGORY_139971.leafCategoryTreeNode, true)
  assert.equal(EBAY_ES_REPORTED_CATEGORY_139971.specificToNintendoSwitch, false)
  assert.equal(EBAY_ES_REPORTED_CATEGORY_TREE_ID, '186')
})

test('a missing confirmation does not call Taxonomy even when credentials exist', async () => {
  let calls = 0
  const code = await runEbayEsCategorySuggestions({
    clientId: 'fixture-client',
    clientSecret: 'fixture-cert',
    confirmation: undefined,
    query: 'Nintendo Switch',
    extraArguments: 0,
    fetchImpl: async () => {
      calls += 1
      return jsonResponse({})
    },
    write: () => undefined,
  })
  assert.equal(code, 1)
  assert.equal(calls, 0)
})

test('a confirmed query still does not call Taxonomy without credentials', async () => {
  let calls = 0
  const lines: string[] = []
  const code = await runEbayEsCategorySuggestions({
    clientId: undefined,
    clientSecret: undefined,
    confirmation: EBAY_TAXONOMY_SUGGESTION_CONFIRMATION,
    query: 'Nintendo Switch',
    extraArguments: 0,
    fetchImpl: async () => {
      calls += 1
      return jsonResponse({})
    },
    write: (text) => lines.push(text),
  })
  assert.equal(code, 1)
  assert.equal(calls, 0)
  assert.match(lines.join(''), /No hay petición/)
  assert.match(lines.join(''), /categoriaValidada: false/)
  assert.equal(lines.join('').includes('fixture-cert'), false)
})

test('a mocked name match does not validate the category or the variant', async () => {
  const seen: string[] = []
  const fetchImpl = async (url: string) => {
    seen.push(url)
    if (url.includes('/identity/')) return tokenResponse()
    return jsonResponse(switchSuggestion())
  }
  const lines: string[] = []
  const code = await runEbayEsCategorySuggestions({
    clientId: 'fixture-client',
    clientSecret: 'fixture-cert',
    confirmation: EBAY_TAXONOMY_SUGGESTION_CONFIRMATION,
    query: 'Nintendo Switch',
    extraArguments: 0,
    fetchImpl,
    write: (text) => lines.push(text),
  })
  const report = lines.join('')
  assert.equal(code, 0)
  assert.match(report, /taxonomy: ok/)
  assert.match(report, /httpStatus: 200/)
  assert.match(report, /categoryTreeId: 186/)
  assert.match(report, /candidata: 139971 Consolas/)
  assert.match(report, /hoja: absent/)
  assert.match(report, /padre: 1249 Videojuegos y consolas/)
  assert.match(report, /candidata: 139973 Nintendo Switch OLED/)
  assert.match(report, /categoriaValidada: false/)
  assert.match(report, /variante: unvalidated/)
  assert.match(report, /varianteValidada: false/)
  assert.equal(report.includes('fixture-token'), false)
  assert.equal(report.includes('Bearer'), false)
  assert.equal(report.includes('/sell/metadata/'), false)
  assert.deepEqual(seen.filter((url) => !url.includes('/identity/')), [SUGGESTION_URL])
  assert.equal(secondHandVariantMapping('nintendo-switch-oled-blanca')?.identity.categoryId, null)
  assert.equal(secondHandVariantMapping('nintendo-switch-oled-blanca')?.marketplaceIdentifier?.status, 'unvalidated')
  assert.equal(MARKETPLACE_ID_ALLOWLIST.providers.length, 0)
  assert.deepEqual([...EBAY_ES_ADMITTED_CONDITION_IDS], [])
})

test('an API error does not become a valid category', async () => {
  const auth = createCategoryReadingAuth({
    clientId: 'fixture-client',
    clientSecret: 'fixture-cert',
    fetchImpl: async () => tokenResponse(),
  })
  const read = await readCategorySuggestions({
    auth,
    fetchImpl: async (url) => {
      if (url.includes('/identity/')) return tokenResponse()
      return jsonResponse({ errors: [{ errorId: 62004, message: 'secret-echo' }] }, 400)
    },
    categoryTreeId: '186',
    query: 'Nintendo Switch',
    confirmation: EBAY_TAXONOMY_SUGGESTION_CONFIRMATION,
  })
  assert.equal(read.status, 'tree-not-found')
  assert.deepEqual(read.suggestions, [])
  assert.equal(read.validatesAnyCategory, false)
  assert.equal(JSON.stringify(read).includes('secret-echo'), false)
})

test('the local script stays silent until one confirmed query is supplied', () => {
  const env = { ...process.env }
  delete env.EBAY_CLIENT_ID
  delete env.EBAY_CERT_ID
  const result = spawnSync(process.execPath, ['--import', 'tsx', 'scripts/read-ebay-es-category-suggestions.ts'], {
    cwd: fileURLToPath(new URL('..', import.meta.url)),
    env,
    encoding: 'utf8',
  })
  assert.equal(result.status, 1)
  assert.match(result.stdout, /No hay petición/)
  assert.match(result.stdout, /categoriaValidada: false/)
  assert.equal(result.stdout.includes('Bearer'), false)
  const source = readFileSync(new URL('../scripts/read-ebay-es-category-suggestions.ts', import.meta.url), 'utf8')
  assert.doesNotMatch(source, /console\.log|sell\/metadata|getCategoryTree\(/)
})
