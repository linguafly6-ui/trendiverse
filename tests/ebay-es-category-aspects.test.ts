import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { spawnSync } from 'node:child_process'
import { fileURLToPath } from 'node:url'
import { EBAY_APPLICATION_OAUTH_SCOPE } from '../lib/ebay-application-auth'
import { EBAY_ES_ADMITTED_CONDITION_IDS } from '../lib/ebay-listing'
import { MARKETPLACE_ID_ALLOWLIST } from '../lib/second-hand-marketplace-id'
import { secondHandVariantMapping } from '../lib/second-hand-variant-catalog'
import { runEbayEsCategoryAspects } from '../scripts/read-ebay-es-category-aspects'
import {
  categorySubtreeUrlFor,
  createCategoryAspectsAuth,
  createCategoryReadingAuth,
  EBAY_ES_REPORTED_CATEGORY_139971,
  EBAY_ES_REPORTED_CATEGORY_SUGGESTIONS,
  EBAY_TAXONOMY_ASPECTS_CONFIRMATION,
  EBAY_TAXONOMY_ASPECTS_SCOPE,
  EBAY_TAXONOMY_SUBTREE_CONFIRMATION,
  itemAspectsForCategoryUrl,
  readCategoryAspects,
  readConfirmedCategorySubtree,
  reportedLeafForAspects,
} from '../lib/ebay-es-category-reading'

const SUBTREE_139973 = 'https://api.ebay.com/commerce/taxonomy/v1/category_tree/186/get_category_subtree?category_id=139973'
const ASPECTS_139971 = 'https://api.ebay.com/commerce/taxonomy/v1/category_tree/186/get_item_aspects_for_category?category_id=139971'

function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'content-type': 'application/json' },
  })
}

function tokenResponse(): Response {
  return jsonResponse({ access_token: 'fixture-token', expires_in: 7200, token_type: 'Bearer' })
}

function authFetch(extra?: (url: string, init?: RequestInit) => Response | Promise<Response>) {
  return async (url: string, init?: RequestInit) => {
    if (url.includes('/identity/')) return tokenResponse()
    if (!extra) return jsonResponse({})
    return extra(url, init)
  }
}

test('reported suggestions keep leaf absent and do not validate a category', () => {
  assert.equal(categorySubtreeUrlFor('186', '139973'), SUBTREE_139973)
  assert.equal(itemAspectsForCategoryUrl('186', '139971'), ASPECTS_139971)
  assert.equal(itemAspectsForCategoryUrl('186', '139971')?.includes('/category_tree/186?'), false)
  assert.equal(reportedLeafForAspects('139971'), true)
  assert.equal(reportedLeafForAspects('139973'), null)
  assert.equal(EBAY_ES_REPORTED_CATEGORY_139971.validatesCategory, false)
  assert.equal(EBAY_ES_REPORTED_CATEGORY_139971.aspectsRead, false)
  const oled = EBAY_ES_REPORTED_CATEGORY_SUGGESTIONS.find((query) => query.query === 'Nintendo Switch OLED')
  assert.ok(oled)
  assert.equal(oled.httpStatus, 200)
  assert.equal(oled.validatesAnyCategory, false)
  assert.deepEqual(oled.suggestions.map((suggestion) => suggestion.categoryId), ['139971', '171833', '69528', '117042', '182179'])
  assert.equal(oled.suggestions[0]?.parent?.categoryName, 'Consolas y videojuegos')
  assert.equal(oled.suggestions[3]?.parent, null)
  assert.equal(oled.suggestions.every((suggestion) => suggestion.leaf === 'absent' && suggestion.validatesCategory === false), true)
  const portable = EBAY_ES_REPORTED_CATEGORY_SUGGESTIONS.find((query) => query.query === 'consolas portátiles')
  assert.equal(portable && 'unlistedSuggestions' in portable ? portable.unlistedSuggestions : null, 'not-recorded')
  assert.equal(secondHandVariantMapping('nintendo-switch-oled-blanca')?.identity.categoryId, null)
  assert.equal(MARKETPLACE_ID_ALLOWLIST.providers.length, 0)
  assert.deepEqual([...EBAY_ES_ADMITTED_CONDITION_IDS], [])
})

test('a missing confirmation does not call Taxonomy even when credentials exist', async () => {
  let calls = 0
  const code = await runEbayEsCategoryAspects({
    clientId: 'fixture-client',
    clientSecret: 'fixture-cert',
    confirmation: undefined,
    categoryId: '139971',
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

test('aspects for 139973 are refused while its leaf is unconfirmed', async () => {
  let calls = 0
  const lines: string[] = []
  const code = await runEbayEsCategoryAspects({
    clientId: 'fixture-client',
    clientSecret: 'fixture-cert',
    confirmation: EBAY_TAXONOMY_ASPECTS_CONFIRMATION,
    categoryId: '139973',
    extraArguments: 0,
    fetchImpl: async () => {
      calls += 1
      return jsonResponse({})
    },
    write: (text) => lines.push(text),
  })
  const report = lines.join('')
  assert.equal(code, 1)
  assert.equal(calls, 0)
  assert.match(report, /No hay petición/)
  assert.match(report, /categoriaValidada: false/)
  assert.match(report, /hojaEnSugerencia: absent/)
  assert.equal(report.includes('fixture-cert'), false)
})

test('confirmed aspects for 139971 still do not call Taxonomy without credentials', async () => {
  let calls = 0
  const lines: string[] = []
  const code = await runEbayEsCategoryAspects({
    clientId: undefined,
    clientSecret: undefined,
    confirmation: EBAY_TAXONOMY_ASPECTS_CONFIRMATION,
    categoryId: '139971',
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
})

test('a confirmed subtree for 139973 does not call Taxonomy without credentials', async () => {
  let calls = 0
  const code = await runEbayEsCategoryAspects({
    clientId: undefined,
    clientSecret: undefined,
    confirmation: EBAY_TAXONOMY_SUBTREE_CONFIRMATION,
    categoryId: '139973',
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

test('readCategoryAspects does not fetch unless the leaf is exactly true', async () => {
  for (const leaf of ['absent', false, 'conflict'] as const) {
    let calls = 0
    const read = await readCategoryAspects({
      auth: createCategoryAspectsAuth({
        clientId: 'fixture-client',
        clientSecret: 'fixture-cert',
        fetchImpl: async () => {
          calls += 1
          return tokenResponse()
        },
      }),
      fetchImpl: async () => {
        calls += 1
        return jsonResponse({})
      },
      categoryTreeId: '186',
      categoryId: '139973',
      confirmation: EBAY_TAXONOMY_ASPECTS_CONFIRMATION,
      leaf,
    })
    assert.equal(read.status, 'leaf-not-confirmed')
    assert.equal(read.validatesCategory, false)
    assert.equal(calls, 0)
  }
})

test('a mocked aspect list does not validate the category or the variant', async () => {
  const seen: string[] = []
  let scope = ''
  const fetchImpl = async (url: string, init?: RequestInit) => {
    seen.push(url)
    if (url.includes('/identity/')) {
      scope = new URLSearchParams(String(init?.body ?? '')).get('scope') ?? ''
      return tokenResponse()
    }
    return jsonResponse({
      aspects: [
        {
          localizedAspectName: 'Marca',
          aspectConstraint: { aspectRequired: true, aspectUsage: 'RECOMMENDED' },
          aspectValues: [{ localizedValue: 'valor-secreto-de-prueba' }],
        },
        {
          localizedAspectName: 'Modelo',
          aspectConstraint: { aspectRequired: false, aspectUsage: 'OPTIONAL' },
        },
        {
          localizedAspectName: 'Otro',
          aspectConstraint: {},
        },
      ],
    })
  }
  const lines: string[] = []
  const code = await runEbayEsCategoryAspects({
    clientId: 'fixture-client',
    clientSecret: 'fixture-cert',
    confirmation: EBAY_TAXONOMY_ASPECTS_CONFIRMATION,
    categoryId: '139971',
    extraArguments: 0,
    fetchImpl,
    write: (text) => lines.push(text),
  })
  const report = lines.join('')
  assert.equal(code, 0)
  assert.equal(scope, EBAY_TAXONOMY_ASPECTS_SCOPE)
  assert.match(report, /taxonomy: ok/)
  assert.match(report, /httpStatus: 200/)
  assert.match(report, /aspecto: Marca/)
  assert.match(report, /aspecto: Modelo/)
  assert.match(report, /aspectosDeProductoInferidos: Marca, Modelo/)
  assert.match(report, /categoriaValidada: false/)
  assert.match(report, /varianteValidada: false/)
  assert.match(report, /categoryIdEnCuerpo: ausente/)
  assert.equal(report.includes('valor-secreto-de-prueba'), false)
  assert.equal(report.includes('fixture-token'), false)
  assert.equal(report.includes('Bearer'), false)
  assert.equal(report.includes('/sell/metadata/'), false)
  assert.deepEqual(seen.filter((url) => !url.includes('/identity/')), [ASPECTS_139971])
  assert.equal(secondHandVariantMapping('nintendo-switch-oled-blanca')?.identity.categoryId, null)
  assert.equal(secondHandVariantMapping('nintendo-switch-oled-blanca')?.marketplaceIdentifier?.status, 'unvalidated')
  assert.equal(MARKETPLACE_ID_ALLOWLIST.providers.length, 0)
  assert.equal(MARKETPLACE_ID_ALLOWLIST.scopes.length, 0)
  assert.deepEqual([...EBAY_ES_ADMITTED_CONDITION_IDS], [])
})

test('HTTP 62009 and an incomplete body do not become a valid category', async () => {
  const auth = createCategoryAspectsAuth({
    clientId: 'fixture-client',
    clientSecret: 'fixture-cert',
    fetchImpl: async () => tokenResponse(),
  })
  const notLeaf = await readCategoryAspects({
    auth,
    fetchImpl: authFetch(() => jsonResponse({ errors: [{ errorId: 62009, message: 'secret-echo' }] }, 400)),
    categoryTreeId: '186',
    categoryId: '139971',
    confirmation: EBAY_TAXONOMY_ASPECTS_CONFIRMATION,
    leaf: true,
  })
  assert.equal(notLeaf.status, 'not-a-leaf')
  assert.deepEqual(notLeaf.errorIds, [62009])
  assert.deepEqual([...notLeaf.aspects], [])
  assert.equal(notLeaf.validatesCategory, false)
  assert.equal(notLeaf.validatesVariant, false)
  assert.equal(JSON.stringify(notLeaf).includes('secret-echo'), false)

  const incomplete = await readCategoryAspects({
    auth,
    fetchImpl: authFetch(() => jsonResponse({ categoryId: '139971' })),
    categoryTreeId: '186',
    categoryId: '139971',
    confirmation: EBAY_TAXONOMY_ASPECTS_CONFIRMATION,
    leaf: true,
  })
  assert.equal(incomplete.status, 'invalid-response')
  assert.equal(incomplete.categoryIdInBody, 'absent')
  assert.equal(incomplete.validatesCategory, false)

  const nameless = await readCategoryAspects({
    auth,
    fetchImpl: authFetch(() => jsonResponse({ aspects: [{ aspectValues: ['oculto'] }] })),
    categoryTreeId: '186',
    categoryId: '139971',
    confirmation: EBAY_TAXONOMY_ASPECTS_CONFIRMATION,
    leaf: true,
  })
  assert.equal(nameless.status, 'invalid-response')
  assert.equal(JSON.stringify(nameless).includes('oculto'), false)
})

test('a subtree response without the leaf field stays absent and does not validate', async () => {
  const seen: string[] = []
  let scope = ''
  const fetchImpl = async (url: string, init?: RequestInit) => {
    seen.push(url)
    if (url.includes('/identity/')) {
      scope = new URLSearchParams(String(init?.body ?? '')).get('scope') ?? ''
      return tokenResponse()
    }
    return jsonResponse({
      categoryTreeId: '186',
      categoryTreeVersion: '96',
      categorySubtreeNode: {
        category: { categoryId: '139973', categoryName: 'Videojuegos' },
        categoryTreeNodeLevel: 3,
        parentCategoryTreeNodeHref: 'https://api.ebay.com/commerce/taxonomy/v1/category_tree/186/get_category_subtree?category_id=1249',
      },
    })
  }
  const lines: string[] = []
  const code = await runEbayEsCategoryAspects({
    clientId: 'fixture-client',
    clientSecret: 'fixture-cert',
    confirmation: EBAY_TAXONOMY_SUBTREE_CONFIRMATION,
    categoryId: '139973',
    extraArguments: 0,
    fetchImpl,
    write: (text) => lines.push(text),
  })
  const report = lines.join('')
  assert.equal(code, 0)
  assert.equal(scope, EBAY_APPLICATION_OAUTH_SCOPE)
  assert.match(report, /hoja: absent/)
  assert.match(report, /categoryName: Videojuegos/)
  assert.match(report, /padre: 1249/)
  assert.match(report, /categoriaValidada: false/)
  assert.equal(report.includes('/category_tree/186?'), false)
  assert.equal(report.includes('get_item_aspects_for_category'), false)
  assert.deepEqual(seen.filter((url) => !url.includes('/identity/')), [SUBTREE_139973])
  assert.equal(secondHandVariantMapping('nintendo-switch-oled-blanca')?.identity.categoryId, null)
})

test('a subtree error does not replace the category or open the full tree', async () => {
  const auth = createCategoryReadingAuth({
    clientId: 'fixture-client',
    clientSecret: 'fixture-cert',
    fetchImpl: async () => tokenResponse(),
  })
  const seen: string[] = []
  const read = await readConfirmedCategorySubtree({
    auth,
    fetchImpl: async (url) => {
      seen.push(url)
      if (url.includes('/identity/')) return tokenResponse()
      return jsonResponse({ errors: [{ errorId: 62008, message: 'use the whole tree' }] }, 400)
    },
    categoryTreeId: '186',
    categoryId: '139973',
    confirmation: EBAY_TAXONOMY_SUBTREE_CONFIRMATION,
  })
  assert.equal(read.status, 'root-category')
  assert.equal(read.categoryId, null)
  assert.equal(read.validatesCategory, false)
  assert.equal(read.leaf, 'absent')
  assert.equal(JSON.stringify(read).includes('whole tree'), false)
  assert.equal(seen.some((url) => url.endsWith('/category_tree/186')), false)
  assert.deepEqual(seen.filter((url) => !url.includes('/identity/')), [SUBTREE_139973])

  const mismatch = await readConfirmedCategorySubtree({
    auth,
    fetchImpl: authFetch(() => jsonResponse({
      categoryTreeId: '186',
      categorySubtreeNode: { category: { categoryId: '162', categoryName: 'Otra' }, leafCategoryTreeNode: true },
    })),
    categoryTreeId: '186',
    categoryId: '139973',
    confirmation: EBAY_TAXONOMY_SUBTREE_CONFIRMATION,
  })
  assert.equal(mismatch.status, 'category-mismatch')
  assert.equal(mismatch.categoryId, '162')
  assert.equal(mismatch.validatesCategory, false)
  assert.equal(mismatch.queriedCategoryId, '139973')
})

test('the local aspects script stays silent until one confirmed category is supplied', () => {
  const env = { ...process.env }
  delete env.EBAY_CLIENT_ID
  delete env.EBAY_CERT_ID
  const result = spawnSync(process.execPath, ['--import', 'tsx', 'scripts/read-ebay-es-category-aspects.ts'], {
    cwd: fileURLToPath(new URL('..', import.meta.url)),
    env,
    encoding: 'utf8',
  })
  assert.equal(result.status, 1)
  assert.match(result.stdout, /No hay petición/)
  assert.match(result.stdout, /categoriaValidada: false/)
  assert.match(result.stdout, /nodo139971EsNintendoSwitch: no/)
  assert.equal(result.stdout.includes('Bearer'), false)
  const source = readFileSync(new URL('../scripts/read-ebay-es-category-aspects.ts', import.meta.url), 'utf8')
  assert.doesNotMatch(source, /console\.log|sell\/metadata|getCategoryTree\(/)
})
