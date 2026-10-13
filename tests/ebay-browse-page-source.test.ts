import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { EBAY_OAUTH_TOKEN_URL } from '../lib/ebay-application-auth'
import { EBAY_BROWSE_SOURCE_ENABLED } from '../lib/ebay-browse-adapter'
import { EBAY_EPN_CONFIGURED, EBAY_ES_ADMITTED_CONDITION_IDS } from '../lib/ebay-listing'
import {
  collectEbayListings,
  inspectEbayBrowseEnvironment,
  listingsForSecondHandPage,
  type EbayPageRuntimeConfig,
} from '../lib/ebay-browse-page-source'
import {
  SECOND_HAND_VARIANT_MAPPINGS,
  itemMatchesVariantIdentity,
  secondHandVariantMapping,
  variantAsPendingMapping,
} from '../lib/second-hand-variant-catalog'
import type { SecondHandMarketplaceIdentifier } from '../lib/second-hand-marketplace-id'
import type { SecondHandProductMapping } from '../lib/second-hand-product-mapping'

const WHITE = 'nintendo-switch-oled-blanca'
const NEON = 'nintendo-switch-oled-neon'
const WHITE_EPID = '21048307585'
const NEON_EPID = '23048312547'
const ALLOWLIST = { providers: ['ebay'], scopes: ['epid'] }

function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'content-type': 'application/json' },
  })
}

function whiteBody(overrides: Record<string, unknown> = {}) {
  return {
    itemId: 'v1|267728620693|0',
    legacyItemId: '267728620693',
    epid: WHITE_EPID,
    listingMarketplaceId: 'EBAY_ES',
    gtin: '0045496453435',
    categoryId: 'fixture-category',
    conditionId: '3000',
    price: { value: '250.00', currency: 'EUR' },
    itemWebUrl: 'https://www.ebay.es/itm/267728620693',
    itemCreationDate: '2026-10-01T00:00:00.000Z',
    localizedAspects: [
      { name: 'MPN', value: '10007454' },
      { name: 'Modelo', value: 'HEG-001' },
      { name: 'Capacidad', value: '64 GB' },
      { name: 'Color', value: 'Blanco' },
    ],
    ...overrides,
  }
}

function validatedMapping(productId: string, epid: string): SecondHandProductMapping {
  const variant = secondHandVariantMapping(productId)
  if (!variant) throw new Error(productId)
  const identifier: SecondHandMarketplaceIdentifier = {
    status: 'validated',
    provider: 'ebay',
    scope: 'epid',
    canonicalValue: epid,
    productId,
    verifiedProductRef: 'fixture-ref',
    provenance: 'fixture-detail',
    validationMethod: 'getItem',
    auditRef: 'fixture-audit',
  }
  return {
    ...variantAsPendingMapping(variant),
    reviewStatus: 'verified',
    verificationRef: 'fixture-ref',
    marketplaceIdentifier: identifier,
  }
}

function openConfig(fetchImpl: EbayPageRuntimeConfig['fetchImpl'], productId = WHITE): EbayPageRuntimeConfig {
  return {
    enabled: true,
    clientId: 'fixture-client',
    clientSecret: 'fixture-cert',
    admittedConditionIds: [3000],
    campaignId: null,
    mappings: [validatedMapping(productId, productId === NEON ? NEON_EPID : WHITE_EPID)],
    allowlist: ALLOWLIST,
    fetchImpl,
    now: Date.parse('2026-10-13T00:00:00.000Z'),
  }
}

test('the default page loader does not call eBay', async () => {
  assert.equal(EBAY_BROWSE_SOURCE_ENABLED, false)
  assert.equal(EBAY_EPN_CONFIGURED, false)
  assert.deepEqual([...EBAY_ES_ADMITTED_CONDITION_IDS], [])
  let calls = 0
  const fetchImpl: EbayPageRuntimeConfig['fetchImpl'] = async () => {
    calls += 1
    return jsonResponse({})
  }
  assert.deepEqual(await listingsForSecondHandPage('nintendo-switch'), [])
  assert.deepEqual(await listingsForSecondHandPage(WHITE), [])
  const disabled = await collectEbayListings(WHITE, { ...openConfig(fetchImpl), enabled: false })
  const missingCredentials = await collectEbayListings(WHITE, { ...openConfig(fetchImpl), clientId: '', clientSecret: '' })
  const emptyConditions = await collectEbayListings(WHITE, { ...openConfig(fetchImpl), admittedConditionIds: [] })
  const parent = await collectEbayListings('nintendo-switch', openConfig(fetchImpl))
  const unvalidatedVariant = await collectEbayListings(WHITE, openConfig(fetchImpl))
  assert.equal(disabled.status, 'source-disabled')
  assert.equal(missingCredentials.status, 'credentials-missing')
  assert.equal(emptyConditions.status, 'conditions-not-configured')
  assert.equal(parent.status, 'variant-not-validated')
  assert.equal(unvalidatedVariant.status, 'variant-not-validated')
  for (const read of [disabled, missingCredentials, emptyConditions, parent, unvalidatedVariant]) {
    assert.deepEqual(read.listings, [])
  }
  assert.equal(calls, 0)
})

test('a closed category and a mismatched variant do not publish a mocked detail', async () => {
  const white = secondHandVariantMapping(WHITE)
  const neon = secondHandVariantMapping(NEON)
  const splatoon = SECOND_HAND_VARIANT_MAPPINGS.find((item) => item.productId === 'nintendo-switch-oled-splatoon-3')
  assert.ok(white && neon && splatoon)
  assert.equal(itemMatchesVariantIdentity(white, whiteBody()), true)
  assert.equal(itemMatchesVariantIdentity(neon, whiteBody()), false)
  assert.equal(itemMatchesVariantIdentity(white, whiteBody({ epid: NEON_EPID })), false)
  assert.equal(itemMatchesVariantIdentity(white, whiteBody({ gtin: '0045496453442' })), false)
  assert.equal(itemMatchesVariantIdentity(white, whiteBody({ localizedAspects: [{ name: 'Color', value: 'Azul neón y rojo neón' }] })), false)
  assert.equal(itemMatchesVariantIdentity(white, whiteBody({ gtin: undefined })), false)
  assert.equal(itemMatchesVariantIdentity(splatoon, whiteBody()), false)

  let calls = 0
  const fetchImpl: EbayPageRuntimeConfig['fetchImpl'] = async () => {
    calls += 1
    throw new Error('network')
  }
  const blocked = await collectEbayListings(WHITE, openConfig(fetchImpl))
  assert.equal(blocked.status, 'variant-not-validated')
  assert.deepEqual(blocked.listings, [])
  assert.equal(calls, 0)
  assert.equal(white.identity.categoryId, null)
})

test('an http failure while reading a non-variant id returns no listings', async () => {
  const mapping = validatedMapping(WHITE, WHITE_EPID)
  const foreign: SecondHandProductMapping = { ...mapping, productId: 'fixture-product' }
  if (foreign.marketplaceIdentifier?.status === 'validated') {
    foreign.marketplaceIdentifier = { ...foreign.marketplaceIdentifier, productId: 'fixture-product' }
  }
  let calls = 0
  const fetchImpl: EbayPageRuntimeConfig['fetchImpl'] = async () => {
    calls += 1
    return jsonResponse({ error: 'down' }, 503)
  }
  const read = await collectEbayListings('fixture-product', {
    ...openConfig(fetchImpl),
    mappings: [foreign],
  })
  assert.equal(read.status, 'browse-error')
  assert.deepEqual(read.listings, [])
  assert.equal(calls > 0, true)
  assert.equal(JSON.stringify(read).includes('down'), false)
  const pages = [
    readFileSync(new URL('../app/segunda-mano/page.tsx', import.meta.url), 'utf8'),
    readFileSync(new URL('../app/segunda-mano/[categoria]/page.tsx', import.meta.url), 'utf8'),
  ]
  for (const source of pages) {
    assert.doesNotMatch(source, /fetch\s*\(|api\.ebay\.com|searchByEpid|getItem/)
    assert.match(source, /productionEbayPageConfig\(\)/)
    assert.match(source, /policy=\{listingPolicy\}/)
    assert.doesNotMatch(source, /source-disabled|credentials-missing|auth-error|browse-error|processing-error/)
  }
})

const PAGE_TOKEN = 'fixture-page-token'

function routedFetch(
  onCall: (input: string, init: RequestInit | undefined) => void,
  search: Response,
  tokenStatus = 200,
): EbayPageRuntimeConfig['fetchImpl'] {
  return async (input, init) => {
    onCall(input, init)
    if (input === EBAY_OAUTH_TOKEN_URL) {
      return jsonResponse({
        access_token: PAGE_TOKEN,
        expires_in: 7200,
        error_description: 'leak-oauth-VALUE',
      }, tokenStatus)
    }
    return search
  }
}

test('a missing campaign does not block a query and an empty response is not an API error', async () => {
  const calls: { url: string, endUser: string | null }[] = []
  const fetchImpl = routedFetch((input, init) => {
    calls.push({ url: input, endUser: new Headers(init?.headers).get('x-ebay-c-enduserctx') })
  }, jsonResponse({ total: 0 }))
  const read = await collectEbayListings('fixture-product', {
    ...openConfig(fetchImpl, WHITE),
    mappings: [validatedMapping(WHITE, WHITE_EPID)].map((mapping) => ({
      ...mapping,
      productId: 'fixture-product',
      marketplaceIdentifier: mapping.marketplaceIdentifier?.status === 'validated'
        ? { ...mapping.marketplaceIdentifier, productId: 'fixture-product' }
        : mapping.marketplaceIdentifier,
    })),
    campaignId: null,
  })
  assert.equal(read.status, 'empty')
  assert.deepEqual(read.listings, [])
  assert.equal(calls.some((call) => call.url.includes('/item_summary/search')), true)
  assert.equal(calls.every((call) => call.endUser === null), true)
  assert.equal(JSON.stringify(read).includes('campid'), false)
})

function fixtureProductMapping(): SecondHandProductMapping {
  const mapping = validatedMapping(WHITE, WHITE_EPID)
  if (mapping.marketplaceIdentifier?.status !== 'validated') return { ...mapping, productId: 'fixture-product' }
  return {
    ...mapping,
    productId: 'fixture-product',
    marketplaceIdentifier: { ...mapping.marketplaceIdentifier, productId: 'fixture-product' },
  }
}

test('API errors stay distinct from an empty response and do not include secrets', async () => {
  const calls: string[] = []
  const fetchImpl = routedFetch((input) => {
    calls.push(input)
  }, jsonResponse({ error: 'leak-browse-VALUE' }, 503), 401)
  const read = await collectEbayListings('fixture-product', {
    ...openConfig(fetchImpl),
    clientId: 'leak-client-VALUE',
    clientSecret: 'leak-cert-VALUE',
    mappings: [fixtureProductMapping()],
    campaignId: '1234567890',
  })
  assert.equal(read.status, 'auth-error')
  assert.notEqual(read.status, 'empty')
  assert.deepEqual(read.listings, [])
  assert.equal(calls.every((url) => url === EBAY_OAUTH_TOKEN_URL), true)
  const encoded = JSON.stringify(read)
  assert.equal(encoded.includes('leak-'), false)
  assert.equal(encoded.includes(PAGE_TOKEN), false)
  assert.equal(encoded.includes('Bearer'), false)
  assert.equal(encoded.includes('1234567890'), false)

  let browseCalls = 0
  const browse = await collectEbayListings('fixture-product', {
    ...openConfig(async () => {
      browseCalls += 1
      return jsonResponse({ error: 'leak-down-VALUE' }, 503)
    }),
    mappings: [fixtureProductMapping()],
  })
  assert.equal(browse.status, 'browse-error')
  assert.notEqual(browse.status, 'empty')
  assert.equal(browseCalls > 0, true)
  assert.equal(JSON.stringify(browse).includes('leak-down-VALUE'), false)
})

test('a thrown read becomes a processing error without the message', async () => {
  let calls = 0
  const fetchImpl: EbayPageRuntimeConfig['fetchImpl'] = async () => {
    calls += 1
    return jsonResponse({})
  }
  const mappings: EbayPageRuntimeConfig['mappings'] = new Proxy([] as EbayPageRuntimeConfig['mappings'], {
    get(_target, prop, receiver) {
      if (prop === 'find') return () => { throw new Error('leak-throw-VALUE') }
      return Reflect.get(_target, prop, receiver)
    },
  })
  const read = await collectEbayListings('fixture-product', { ...openConfig(fetchImpl), mappings })
  assert.equal(read.status, 'processing-error')
  assert.deepEqual(read.listings, [])
  assert.equal(calls, 0)
  assert.equal(JSON.stringify(read).includes('leak-throw-VALUE'), false)
})

test('a valid campaign adds the documented header and an invalid one does not', async () => {
  const calls: { url: string, endUser: string | null }[] = []
  const fetchImpl = routedFetch((input, init) => {
    calls.push({ url: input, endUser: new Headers(init?.headers).get('x-ebay-c-enduserctx') })
  }, jsonResponse({ total: 0 }))
  const read = await collectEbayListings('fixture-product', {
    ...openConfig(fetchImpl),
    mappings: [fixtureProductMapping()],
    campaignId: '1234567890',
  })
  assert.equal(read.status, 'empty')
  assert.deepEqual(read.listings, [])
  const search = calls.find((call) => call.url.includes('/item_summary/search'))
  assert.ok(search)
  assert.equal(search.endUser, 'affiliateCampaignId=1234567890')
  assert.equal(search.url.includes('campid'), false)
  assert.equal(search.url.includes('1234567890'), false)
  assert.equal(JSON.stringify(read).includes('1234567890'), false)

  const invalidCalls: { url: string, endUser: string | null }[] = []
  const invalid = await collectEbayListings('fixture-product', {
    ...openConfig(routedFetch((input, init) => {
      invalidCalls.push({ url: input, endUser: new Headers(init?.headers).get('x-ebay-c-enduserctx') })
    }, jsonResponse({ total: 0 }))),
    mappings: [fixtureProductMapping()],
    campaignId: '1234',
  })
  assert.equal(invalid.status, 'empty')
  const invalidSearch = invalidCalls.find((call) => call.url.includes('/item_summary/search'))
  assert.ok(invalidSearch)
  assert.equal(invalidSearch.endUser, null)
  assert.equal(JSON.stringify(invalid).includes('1234'), false)
})

test('preview and production environments are inspected separately', () => {
  const preview = inspectEbayBrowseEnvironment({
    EBAY_BROWSE_SOURCE_ENABLED: 'true',
    EBAY_CLIENT_ID: 'preview-client-SECRET',
    EBAY_CERT_ID: 'preview-cert-SECRET',
    EBAY_EPN_CAMPAIGN_ID: '1234567890',
  })
  const production = inspectEbayBrowseEnvironment({})
  const invalidCampaign = inspectEbayBrowseEnvironment({
    EBAY_BROWSE_SOURCE_ENABLED: 'true',
    EBAY_CLIENT_ID: 'preview-client-SECRET',
    EBAY_CERT_ID: 'preview-cert-SECRET',
    EBAY_EPN_CAMPAIGN_ID: '1234',
  })
  assert.equal(preview.source, 'enabled')
  assert.equal(preview.credentials, 'present')
  assert.equal(preview.campaign, 'ok')
  assert.equal(preview.conditions, 'unconfigured')
  assert.equal(preview.wouldQuery, false)
  assert.equal(production.source, 'disabled')
  assert.equal(production.credentials, 'missing')
  assert.equal(production.campaign, 'absent')
  assert.equal(production.conditions, 'unconfigured')
  assert.equal(production.wouldQuery, false)
  assert.equal(invalidCampaign.campaign, 'invalid')
  assert.equal(invalidCampaign.wouldQuery, false)
  assert.notEqual(preview.source, production.source)
  const encoded = JSON.stringify({ preview, production, invalidCampaign })
  assert.equal(encoded.includes('preview-client-SECRET'), false)
  assert.equal(encoded.includes('preview-cert-SECRET'), false)
  assert.equal(encoded.includes('1234567890'), false)
  assert.equal(encoded.includes('1234'), false)
  const source = readFileSync(new URL('../lib/ebay-browse-page-source.ts', import.meta.url), 'utf8')
  assert.doesNotMatch(source, /process\.env/)
  assert.equal(source.includes('EBAY_EPN_CONFIGURED'), false)
  assert.match(source, /EBAY_EPN_CAMPAIGN_ID/)
  assert.match(source, /EBAY_BROWSE_SOURCE_ENABLED/)
  assert.match(source, /EBAY_CLIENT_ID/)
  assert.match(source, /EBAY_CERT_ID/)
})
