import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { spawnSync } from 'node:child_process'
import { fileURLToPath } from 'node:url'
import { EBAY_ES_ADMITTED_CONDITION_IDS } from '../lib/ebay-listing'
import { MARKETPLACE_ID_ALLOWLIST } from '../lib/second-hand-marketplace-id'
import { secondHandVariantMapping } from '../lib/second-hand-variant-catalog'
import { runEbayEsCategoryRead } from '../scripts/read-ebay-es-category'
import {
  categorySubtreeUrl,
  defaultCategoryTreeUrl,
  itemConditionPoliciesUrl,
  readCategorySubtree,
  readDefaultCategoryTree,
  readItemConditionPolicy,
  usedConditionCandidates,
  createCategoryReadingAuth,
  EBAY_ES_CATEGORY_UNDER_REVIEW,
} from '../lib/ebay-es-category-reading'

const TREE_URL = 'https://api.ebay.com/commerce/taxonomy/v1/get_default_category_tree_id?marketplace_id=EBAY_ES'
const NODE_URL = 'https://api.ebay.com/commerce/taxonomy/v1/category_tree/0/get_category_subtree?category_id=139971'
const POLICY_URL = 'https://api.ebay.com/sell/metadata/v1/marketplace/EBAY_ES/get_item_condition_policies?filter=categoryIds%3A%7B139971%7D'

function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'content-type': 'application/json' },
  })
}

function tokenResponse(): Response {
  return jsonResponse({ access_token: 'fixture-token', expires_in: 7200, token_type: 'Bearer' })
}

function leafBody() {
  return {
    categoryTreeId: '0',
    categoryTreeVersion: '2026',
    categorySubtreeNode: {
      category: { categoryId: '139971', categoryName: 'Consolas Nintendo' },
      categoryTreeNodeLevel: 4,
      leafCategoryTreeNode: true,
      parentCategoryTreeNodeHref: 'https://api.ebay.com/commerce/taxonomy/v1/category_tree/0/get_category_subtree?category_id=139973',
    },
  }
}

test('the documented EBAY_ES urls do not invent another category or marketplace', () => {
  assert.equal(defaultCategoryTreeUrl(), TREE_URL)
  assert.equal(categorySubtreeUrl('0'), NODE_URL)
  assert.equal(categorySubtreeUrl('../other'), null)
  assert.equal(itemConditionPoliciesUrl(), POLICY_URL)
  assert.equal(EBAY_ES_CATEGORY_UNDER_REVIEW, '139971')
})

test('missing credentials do not call Taxonomy or Metadata', async () => {
  let calls = 0
  const code = await runEbayEsCategoryRead({
    clientId: undefined,
    clientSecret: 'fixture-cert',
    fetchImpl: async () => {
      calls += 1
      return jsonResponse({})
    },
    write: () => undefined,
  })
  assert.equal(code, 1)
  assert.equal(calls, 0)
  assert.equal(secondHandVariantMapping('nintendo-switch-oled-blanca')?.identity.categoryId, null)
  assert.equal(secondHandVariantMapping('nintendo-switch-oled-blanca')?.marketplaceIdentifier?.status, 'unvalidated')
  assert.equal(MARKETPLACE_ID_ALLOWLIST.providers.length, 0)
  assert.deepEqual([...EBAY_ES_ADMITTED_CONDITION_IDS], [])
})

test('a mocked leaf reports name, parent id and no children without validating the variant', async () => {
  const seen: { url: string, headers: Headers }[] = []
  const fetchImpl = async (url: string, init?: RequestInit) => {
    seen.push({ url, headers: new Headers(init?.headers) })
    if (url.includes('/identity/')) return tokenResponse()
    if (url.includes('get_default_category_tree_id')) return jsonResponse({ categoryTreeId: '0', categoryTreeVersion: '2026' })
    return jsonResponse(leafBody())
  }
  const lines: string[] = []
  const code = await runEbayEsCategoryRead({
    clientId: 'fixture-client',
    clientSecret: 'fixture-cert',
    fetchImpl,
    write: (text) => lines.push(text),
  })
  const report = lines.join('')
  assert.equal(code, 0)
  assert.match(report, /taxonomyArbol: ok/)
  assert.match(report, /categoryTreeId: 0/)
  assert.match(report, /taxonomyNodo: ok/)
  assert.match(report, /categoryName: Consolas Nintendo/)
  assert.match(report, /hoja: si/)
  assert.match(report, /padre: 139973/)
  assert.match(report, /hijos: ausente/)
  assert.match(report, /metadata: not-run/)
  assert.match(report, /identidadHEG001: no/)
  assert.match(report, /variante: unvalidated/)
  assert.match(report, /varianteValidada: false/)
  assert.equal(report.includes('fixture-token'), false)
  assert.equal(report.includes('fixture-cert'), false)
  assert.equal(report.includes('Bearer'), false)
  const gets = seen.filter((call) => !call.url.includes('/identity/'))
  assert.deepEqual(gets.map((call) => call.url), [TREE_URL, NODE_URL])
  for (const call of gets) {
    assert.equal(call.headers.get('X-EBAY-C-MARKETPLACE-ID'), null)
    assert.equal(call.headers.get('X-EBAY-C-ENDUSERCTX'), null)
    assert.equal(call.headers.get('authorization'), 'Bearer fixture-token')
  }
  assert.equal(gets.some((call) => call.url.includes('/sell/metadata/')), false)
})

test('a category outside the tree is not replaced with another id', async () => {
  const auth = createCategoryReadingAuth({
    clientId: 'fixture-client',
    clientSecret: 'fixture-cert',
    fetchImpl: async (url) => {
      if (url.includes('/identity/')) return tokenResponse()
      return jsonResponse({ errors: [{ errorId: 62005, message: 'secret-echo' }] }, 400)
    },
  })
  const fetchImpl = async (url: string) => {
    if (url.includes('/identity/')) return tokenResponse()
    return jsonResponse({ errors: [{ errorId: 62005, message: 'secret-echo' }] }, 400)
  }
  const read = await readCategorySubtree({ auth, fetchImpl, categoryTreeId: '0' })
  assert.equal(read.status, 'category-not-in-tree')
  assert.deepEqual(read.errorIds, [62005])
  assert.equal(read.categoryId, null)
  assert.equal(JSON.stringify(read).includes('secret-echo'), false)
})

test('a different category id in the body stays a mismatch', async () => {
  const auth = createCategoryReadingAuth({
    clientId: 'fixture-client',
    clientSecret: 'fixture-cert',
    fetchImpl: async (url) => url.includes('/identity/') ? tokenResponse() : jsonResponse({}),
  })
  const read = await readCategorySubtree({
    auth,
    fetchImpl: async (url) => {
      if (url.includes('/identity/')) return tokenResponse()
      return jsonResponse({
        categorySubtreeNode: {
          category: { categoryId: '162', categoryName: 'Otra' },
          leafCategoryTreeNode: true,
        },
      })
    },
    categoryTreeId: '0',
  })
  assert.equal(read.status, 'category-mismatch')
  assert.equal(read.categoryId, '162')
  assert.equal(secondHandVariantMapping('nintendo-switch-oled-blanca')?.identity.categoryId, null)
})

test('a missing leaf flag stays absent even when the node has children', async () => {
  const auth = createCategoryReadingAuth({
    clientId: 'fixture-client',
    clientSecret: 'fixture-cert',
    fetchImpl: async () => tokenResponse(),
  })
  const read = await readCategorySubtree({
    auth,
    fetchImpl: async (url) => {
      if (url.includes('/identity/')) return tokenResponse()
      return jsonResponse({
        categorySubtreeNode: {
          category: { categoryId: '139971', categoryName: 'Padre' },
          childCategoryTreeNodes: [
            { category: { categoryId: '139972', categoryName: 'Hija' } },
          ],
        },
      })
    },
    categoryTreeId: '0',
  })
  assert.equal(read.status, 'ok')
  assert.equal(read.leaf, 'absent')
  assert.deepEqual(read.children, [{ categoryId: '139972', categoryName: 'Hija' }])
})

test('metadata is not called without a token and an application token is not a complete policy', async () => {
  let calls = 0
  const skipped = await readItemConditionPolicy({
    fetchImpl: async () => {
      calls += 1
      return jsonResponse({})
    },
    grant: 'user',
  })
  assert.equal(skipped.status, 'not-run')
  assert.equal(calls, 0)

  const partial = await readItemConditionPolicy({
    accessToken: 'fixture-token',
    grant: 'application',
    fetchImpl: async () => jsonResponse({
      itemConditionPolicies: [
        {
          categoryId: '139971',
          itemConditions: [
            { conditionId: '1000', conditionDescription: 'Nuevo' },
            { conditionId: '3000', conditionDescription: 'Usado' },
          ],
        },
        {
          categoryId: '162',
          itemConditions: [{ conditionId: '5000', conditionDescription: 'Otra categoría' }],
        },
      ],
    }),
  })
  assert.equal(partial.status, 'ok')
  assert.equal(partial.completePolicy, false)
  assert.deepEqual(partial.conditions.map((row) => row.conditionId), ['1000', '3000'])
  assert.deepEqual(partial.otherCategoryIds, ['162'])
  assert.deepEqual(partial.usedConditionCandidates, [])
  assert.deepEqual([...EBAY_ES_ADMITTED_CONDITION_IDS], [])
})

test('a simulated user policy can name a used candidate without admitting it', () => {
  const rows = [
    { conditionId: '1000', conditionDescription: 'Nuevo', usage: 'absent' as const },
    { conditionId: '2000', conditionDescription: 'Reacondicionado', usage: 'RESTRICTED' as const },
    { conditionId: '3000', conditionDescription: 'Usado', usage: 'absent' as const },
    { conditionId: '7000', conditionDescription: 'Para piezas', usage: 'absent' as const },
  ]
  assert.deepEqual(usedConditionCandidates('user', rows), [3000])
  assert.deepEqual(usedConditionCandidates('application', rows), [])
  assert.deepEqual([...EBAY_ES_ADMITTED_CONDITION_IDS], [])
})

test('an unknown marketplace error does not invent a tree id', async () => {
  const auth = createCategoryReadingAuth({
    clientId: 'fixture-client',
    clientSecret: 'fixture-cert',
    fetchImpl: async () => tokenResponse(),
  })
  const read = await readDefaultCategoryTree({
    auth,
    fetchImpl: async (url) => {
      if (url.includes('/identity/')) return tokenResponse()
      return jsonResponse({ errors: [{ errorId: 62003 }] }, 400)
    },
  })
  assert.equal(read.status, 'marketplace-not-found')
  assert.equal(read.categoryTreeId, null)
})

test('the local script exits before any request when credentials are absent', () => {
  const env = { ...process.env }
  delete env.EBAY_CLIENT_ID
  delete env.EBAY_CERT_ID
  const result = spawnSync(process.execPath, ['--import', 'tsx', 'scripts/read-ebay-es-category.ts'], {
    cwd: fileURLToPath(new URL('..', import.meta.url)),
    env,
    encoding: 'utf8',
  })
  assert.equal(result.status, 1)
  assert.match(result.stdout, /No hay petición/)
  assert.match(result.stdout, /metadata: not-run/)
  assert.match(result.stdout, /varianteValidada: false/)
  assert.equal(result.stdout.includes('Bearer'), false)
  const source = readFileSync(new URL('../scripts/read-ebay-es-category.ts', import.meta.url), 'utf8')
  const library = readFileSync(new URL('../lib/ebay-es-category-reading.ts', import.meta.url), 'utf8')
  assert.doesNotMatch(source, /console\.log/)
  assert.doesNotMatch(library, /EBAY_ES_ADMITTED_CONDITION_IDS\s*=/)
  assert.doesNotMatch(library, /status:\s*'validated'/)
})
