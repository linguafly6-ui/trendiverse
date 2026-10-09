import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { SECOND_HAND_PRODUCTS, hasMetrics } from '../lib/second-hand'
import { getSecondHandProducts, observationToMetrics } from '../lib/second-hand-data'
import {
  EBAY_BROWSE_SOURCE_ENABLED,
  EBAY_LISTING_MAX_AGE_MS,
  ebayBrowseSecondHandSource,
  ebayOfferToObservation,
  isEbayListingWithinDisplayWindow,
  normalizeEbayCondition,
  normalizeEbayCurrency,
  normalizeEbayPrice,
  normalizeEbaySourceUrl,
  type EbayNormalizedOffer,
  type EbayProductMapping,
} from '../lib/ebay-browse-adapter'

const NOW = Date.parse('2026-10-09T12:00:00.000Z')
const FIXTURE_ID = 'fixture-synthetic-id'
const FIXTURE_URL = 'https://fixture.invalid/synthetic-offer'
const FIXTURE_PRICE = 1.25

const verifiedMapping: EbayProductMapping = {
  productId: 'iphone',
  externalProductId: FIXTURE_ID,
  verified: true,
}

function offer(overrides: Partial<EbayNormalizedOffer> = {}): EbayNormalizedOffer {
  return {
    productId: 'iphone',
    externalProductId: FIXTURE_ID,
    price: FIXTURE_PRICE,
    currency: 'EUR',
    sourceUrl: FIXTURE_URL,
    conditionId: 3000,
    conditionAdmitted: true,
    observedAt: new Date(NOW - 60_000).toISOString(),
    ...overrides,
  }
}

test('ebay browse source stays disabled and publishes nothing', async () => {
  assert.equal(EBAY_BROWSE_SOURCE_ENABLED, false)
  assert.equal(ebayBrowseSecondHandSource.id, 'ebay-browse')
  for (const product of SECOND_HAND_PRODUCTS) {
    assert.equal(await ebayBrowseSecondHandSource.getProductData(product.slug), null)
  }
  const fromDefault = await getSecondHandProducts()
  const fromEbay = await getSecondHandProducts([ebayBrowseSecondHandSource])
  for (const product of [...fromDefault, ...fromEbay]) {
    assert.equal(hasMetrics(product.metrics), false, product.slug)
    assert.equal(product.metrics.usedPrice, null)
    assert.equal(product.metrics.score, null)
    assert.equal(product.metrics.trend, null)
  }
})

test('the adapter module does not call the network or read secrets', () => {
  const source = readFileSync(new URL('../lib/ebay-browse-adapter.ts', import.meta.url), 'utf8')
  assert.doesNotMatch(source, /\bfetch\s*\(/)
  assert.doesNotMatch(source, /api\.ebay\.com/)
  assert.doesNotMatch(source, /EBAY_CLIENT|EBAY_PARTNER|process\.env/)
})

test('a synthetic fresh offer can be normalized without aggregates or score', () => {
  const observation = ebayOfferToObservation(offer(), verifiedMapping, NOW)
  assert.ok(observation)
  assert.equal(observation.price, FIXTURE_PRICE)
  assert.equal(observation.currency, 'EUR')
  assert.equal(observation.condition, 'good')
  assert.equal(observation.referencePrice, null)
  assert.equal(observation.minPrice, null)
  assert.equal(observation.maxPrice, null)
  const metrics = observationToMetrics(observation)
  assert.equal(metrics.usedPrice, FIXTURE_PRICE)
  assert.equal(metrics.newPrice, null)
  assert.equal(metrics.savings, null)
  assert.equal(metrics.score, null)
  assert.equal(metrics.trend, null)
})

test('null or unverified identifiers cannot produce an observation', () => {
  const unverified: EbayProductMapping = { ...verifiedMapping, verified: false }
  const missing: EbayProductMapping = { ...verifiedMapping, externalProductId: null, verified: true }
  const blank: EbayProductMapping = { ...verifiedMapping, externalProductId: '  fixture  ', verified: true }
  const otherProduct: EbayProductMapping = { ...verifiedMapping, productId: 'macbook' }
  assert.equal(ebayOfferToObservation(offer(), unverified, NOW), null)
  assert.equal(ebayOfferToObservation(offer({ externalProductId: null }), missing, NOW), null)
  assert.equal(ebayOfferToObservation(offer(), blank, NOW), null)
  assert.equal(ebayOfferToObservation(offer(), otherProduct, NOW), null)
  assert.equal(ebayOfferToObservation(offer({ externalProductId: 'other-fixture' }), verifiedMapping, NOW), null)
})

test('incompatible conditions cannot produce an observation', () => {
  assert.equal(normalizeEbayCondition(1000, true), null)
  assert.equal(normalizeEbayCondition(1500, true), null)
  assert.equal(normalizeEbayCondition(1750, true), null)
  assert.equal(normalizeEbayCondition(7000, true), null)
  assert.equal(normalizeEbayCondition(3000, false), null)
  assert.equal(normalizeEbayCondition(9999, true), null)
  assert.equal(normalizeEbayCondition('3000', true), null)
  assert.equal(ebayOfferToObservation(offer({ conditionId: 1000 }), verifiedMapping, NOW), null)
  assert.equal(ebayOfferToObservation(offer({ conditionId: 7000 }), verifiedMapping, NOW), null)
  assert.equal(ebayOfferToObservation(offer({ conditionAdmitted: false }), verifiedMapping, NOW), null)
  assert.equal(ebayOfferToObservation(offer({ conditionId: 2000, conditionAdmitted: false }), verifiedMapping, NOW), null)
  const admittedRefurbished = ebayOfferToObservation(offer({ conditionId: 2010, conditionAdmitted: true }), verifiedMapping, NOW)
  assert.equal(admittedRefurbished?.condition, 'like-new')
})

test('an offer older than six hours is discarded and a failed refresh does not extend it', () => {
  const atLimit = new Date(NOW - EBAY_LISTING_MAX_AGE_MS).toISOString()
  const expired = new Date(NOW - EBAY_LISTING_MAX_AGE_MS - 1).toISOString()
  assert.equal(isEbayListingWithinDisplayWindow(atLimit, NOW), true)
  assert.equal(isEbayListingWithinDisplayWindow(expired, NOW), false)
  assert.ok(ebayOfferToObservation(offer({ observedAt: atLimit }), verifiedMapping, NOW))
  assert.equal(ebayOfferToObservation(offer({ observedAt: expired }), verifiedMapping, NOW), null)
  const later = NOW + 60 * 60 * 1000
  assert.equal(ebayOfferToObservation(offer({ observedAt: expired }), verifiedMapping, later), null)
  assert.equal(isEbayListingWithinDisplayWindow(new Date(NOW + 1).toISOString(), NOW), false)
  assert.equal(ebayOfferToObservation(offer({ observedAt: 'not-a-date' }), verifiedMapping, NOW), null)
})

test('price, currency and url normalizers reject anything that is not a synthetic http offer', () => {
  assert.equal(normalizeEbayPrice(0), null)
  assert.equal(normalizeEbayPrice(-1), null)
  assert.equal(normalizeEbayPrice(Number.NaN), null)
  assert.equal(normalizeEbayPrice('1.25'), null)
  assert.equal(normalizeEbayPrice(FIXTURE_PRICE), FIXTURE_PRICE)
  assert.equal(normalizeEbayCurrency('eur'), 'EUR')
  assert.equal(normalizeEbayCurrency('EURO'), null)
  assert.equal(normalizeEbayCurrency('ZZZ'), null)
  assert.equal(normalizeEbaySourceUrl(FIXTURE_URL), FIXTURE_URL)
  assert.equal(normalizeEbaySourceUrl('notaurl'), null)
  assert.equal(normalizeEbaySourceUrl('javascript:alert(1)'), null)
  assert.equal(normalizeEbaySourceUrl('https://www.ebay.es/itm/fixture'), null)
  assert.equal(normalizeEbaySourceUrl('https://fixture.invalid/offer?campid=123'), null)
  assert.equal(ebayOfferToObservation(offer({ price: 0 }), verifiedMapping, NOW), null)
  assert.equal(ebayOfferToObservation(offer({ currency: 'EURO' }), verifiedMapping, NOW), null)
  assert.equal(ebayOfferToObservation(offer({ sourceUrl: 'https://www.ebay.es/itm/fixture' }), verifiedMapping, NOW), null)
})
