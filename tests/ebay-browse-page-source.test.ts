import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { EBAY_BROWSE_SOURCE_ENABLED } from '../lib/ebay-browse-adapter'
import { EBAY_EPN_CONFIGURED, EBAY_ES_ADMITTED_CONDITION_IDS } from '../lib/ebay-listing'
import {
  collectEbayListings,
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
    epnConfigured: true,
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
  assert.deepEqual(await collectEbayListings(WHITE, { ...openConfig(fetchImpl), enabled: false }), [])
  assert.deepEqual(await collectEbayListings(WHITE, { ...openConfig(fetchImpl), admittedConditionIds: [] }), [])
  assert.deepEqual(await collectEbayListings(WHITE, { ...openConfig(fetchImpl), epnConfigured: false }), [])
  assert.deepEqual(await collectEbayListings(WHITE, { ...openConfig(fetchImpl), clientId: '', clientSecret: '' }), [])
  assert.deepEqual(await collectEbayListings('nintendo-switch', openConfig(fetchImpl)), [])
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
  assert.deepEqual(await collectEbayListings(WHITE, openConfig(fetchImpl)), [])
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
  const listings = await collectEbayListings('fixture-product', {
    ...openConfig(fetchImpl),
    mappings: [foreign],
  })
  assert.deepEqual(listings, [])
  assert.equal(calls > 0, true)
  const pages = [
    readFileSync(new URL('../app/segunda-mano/page.tsx', import.meta.url), 'utf8'),
    readFileSync(new URL('../app/segunda-mano/[categoria]/page.tsx', import.meta.url), 'utf8'),
  ]
  for (const source of pages) {
    assert.doesNotMatch(source, /fetch\s*\(|api\.ebay\.com|searchByEpid|getItem/)
  }
})
