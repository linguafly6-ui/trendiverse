import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { EBAY_BROWSE_SOURCE_ENABLED, ebayBrowseSecondHandSource } from '../lib/ebay-browse-adapter'
import { emptySecondHandDataSource, getSecondHandProducts, observationToMetrics } from '../lib/second-hand-data'
import {
  asExternalMapping,
  canComparePrices,
  SECOND_HAND_PRODUCT_MAPPINGS,
  secondHandProductMapping,
  type SecondHandProductMapping,
} from '../lib/second-hand-product-mapping'
import type { SecondHandMarketplaceIdentifier } from '../lib/second-hand-marketplace-id'
import {
  EBAY_ES_ADMITTED_CONDITION_IDS,
  associateBrowseItem,
  readEbayBrowseItemFields,
} from '../lib/ebay-browse-offer'
import { EBAY_BROWSE_ITEM_URL_PREFIX, createEbayBrowseClient } from '../lib/ebay-browse-client'
import { EBAY_OAUTH_TOKEN_URL, type EbayFetch } from '../lib/ebay-application-auth'

const NOW = Date.parse('2026-10-11T12:00:00.000Z')
const OBSERVED_AT = '2026-10-11T11:59:00.000Z'
const EPID = '9000000001'
const ALLOW = { providers: ['ebay'], scopes: ['EBAY_ES'] } as const

function validatedId(productId: string, canonicalValue: string, verificationRef: string): SecondHandMarketplaceIdentifier {
  return {
    status: 'validated',
    provider: 'ebay',
    scope: 'EBAY_ES',
    canonicalValue,
    productId,
    verifiedProductRef: verificationRef,
    provenance: 'catalog-fixture',
    validationMethod: 'manual-review',
    auditRef: 'audit-fixture',
  }
}

function mapped(productId: string, canonicalValue: string): SecondHandProductMapping {
  const base = secondHandProductMapping('nintendo-switch')
  if (!base?.verificationRef) throw new Error('missing verified mapping')
  return {
    ...base,
    productId,
    marketplaceIdentifier: validatedId(productId, canonicalValue, base.verificationRef),
  }
}

function item(overrides: Record<string, unknown> = {}) {
  return {
    itemId: 'v1|100|0',
    legacyItemId: '100',
    epid: EPID,
    title: 'Nintendo Switch Modelo OLED casi igual',
    price: { value: '10.50', currency: 'EUR' },
    conditionId: '3000',
    itemWebUrl: 'https://fixture.invalid/synthetic-offer',
    itemAffiliateWebUrl: 'https://www.ebay.es/itm/100?campid=1',
    listingMarketplaceId: 'EBAY_ES',
    categoryId: '139971',
    seller: { username: 'fixture-seller' },
    description: 'no copiar',
    ...overrides,
  }
}

test('the catalog cannot associate a Browse item and the provider stays empty', async () => {
  assert.equal(EBAY_ES_ADMITTED_CONDITION_IDS.length, 0)
  assert.equal(EBAY_BROWSE_SOURCE_ENABLED, false)
  assert.equal(emptySecondHandDataSource.id, 'empty')
  assert.equal(await ebayBrowseSecondHandSource.getProductData('nintendo-switch'), null)
  const realistic = {
    itemId: 'v1|100|0',
    legacyItemId: '100',
    title: 'Nintendo Switch – Modelo OLED',
    itemWebUrl: 'https://www.ebay.es/itm/100',
    listingMarketplaceId: 'EBAY_ES',
    categoryId: '139971',
    seller: { username: 'fixture-seller' },
  }
  const blocked = associateBrowseItem(realistic, { observedAt: OBSERVED_AT, now: NOW, requestMarketplaceId: 'EBAY_ES' })
  assert.equal(blocked.observation, null)
  assert.equal(blocked.productId, null)
  assert.equal(blocked.listingId, 'v1|100|0')
  assert.ok(blocked.blockers.includes('missing-epid'))
  assert.ok(blocked.blockers.includes('price-invalid'))
  assert.ok(blocked.blockers.includes('condition-absent'))
  assert.ok(blocked.blockers.includes('listing-url-rejected'))
  assert.equal(JSON.stringify(blocked).includes('fixture-seller'), false)

  const withEpid = associateBrowseItem(item(), { observedAt: OBSERVED_AT, now: NOW })
  assert.equal(withEpid.observation, null)
  assert.equal(withEpid.productId, null)
  assert.ok(withEpid.blockers.includes('no-verified-mapping'))
  assert.equal(SECOND_HAND_PRODUCT_MAPPINGS.every((spec) => spec.marketplaceIdentifier === null), true)
  for (const product of await getSecondHandProducts()) {
    assert.equal(product.metrics.usedPrice, null, product.slug)
    assert.equal(product.metrics.savings, null, product.slug)
    assert.equal(product.metrics.score, null, product.slug)
    assert.equal(product.metrics.trend, null, product.slug)
  }
})

test('a contract fixture can become an observation without aggregates', () => {
  const mapping = mapped('nintendo-switch', EPID)
  assert.equal(canComparePrices(mapping, ALLOW), true)
  assert.equal(asExternalMapping(mapping, ALLOW).externalProductId, EPID)
  const result = associateBrowseItem(item(), {
    mappings: [mapping],
    allowlist: ALLOW,
    admittedConditionIds: [3000],
    observedAt: OBSERVED_AT,
    now: NOW,
  })
  assert.deepEqual(result.blockers, [])
  assert.equal(result.productId, 'nintendo-switch')
  assert.equal(result.listingId, 'v1|100|0')
  assert.equal(result.epid, EPID)
  assert.ok(result.observation)
  assert.equal(result.observation.price, 10.5)
  assert.equal(result.observation.currency, 'EUR')
  assert.equal(result.observation.condition, 'good')
  assert.equal(result.observation.sourceUrl, 'https://fixture.invalid/synthetic-offer')
  assert.equal(result.observation.referencePrice, null)
  assert.equal(result.observation.minPrice, null)
  assert.equal(result.observation.maxPrice, null)
  assert.equal(JSON.stringify(result).includes('campid'), false)
  assert.equal(JSON.stringify(result).includes('ebay.es'), false)
  const metrics = observationToMetrics(result.observation)
  assert.equal(metrics.usedPrice, 10.5)
  assert.equal(metrics.savings, null)
  assert.equal(metrics.score, null)
  assert.equal(metrics.trend, null)
  assert.equal(metrics.newPrice, null)
})

test('listing ids, titles, manufacturer codes and unknown listings stay unassociated', () => {
  const mapping = mapped('nintendo-switch', EPID)
  const options = {
    mappings: [mapping, ...SECOND_HAND_PRODUCT_MAPPINGS],
    allowlist: ALLOW,
    admittedConditionIds: [3000],
    observedAt: OBSERVED_AT,
    now: NOW,
  }
  const asListing = associateBrowseItem(item({ epid: 'v1|100|0' }), options)
  assert.equal(asListing.observation, null)
  assert.equal(asListing.productId, null)
  assert.ok(asListing.blockers.includes('listing-id-is-not-a-product-id'))

  const byTitle = associateBrowseItem(item({ epid: undefined, title: 'Nintendo Switch – Modelo OLED' }), options)
  assert.equal(byTitle.productId, null)
  assert.ok(byTitle.blockers.includes('missing-epid'))

  const manufacturer = associateBrowseItem(item({ epid: 'HEG-001' }), options)
  assert.equal(manufacturer.observation, null)
  assert.equal(manufacturer.productId, null)
  assert.ok(manufacturer.blockers.includes('no-verified-mapping'))

  const other = mapped('iphone', EPID)
  const ambiguous = associateBrowseItem(item(), { ...options, mappings: [mapping, other] })
  assert.equal(ambiguous.observation, null)
  assert.equal(ambiguous.productId, null)
  assert.ok(ambiguous.blockers.includes('ambiguous-mapping'))
})

test('invalid price, currency, condition, url and age do not publish', () => {
  const mapping = mapped('nintendo-switch', EPID)
  const base = {
    mappings: [mapping],
    allowlist: ALLOW,
    admittedConditionIds: [3000],
    observedAt: OBSERVED_AT,
    now: NOW,
  }
  const cases: Array<{ overrides: Record<string, unknown>, blocker: string, extra?: Partial<typeof base> }> = [
    { overrides: { price: { value: '0.00', currency: 'EUR' } }, blocker: 'price-invalid' },
    { overrides: { price: { value: '10.555', currency: 'EUR' } }, blocker: 'price-invalid' },
    { overrides: { price: undefined }, blocker: 'price-invalid' },
    { overrides: { price: { value: '10.50', currency: 'EURO' } }, blocker: 'currency-invalid' },
    { overrides: { conditionId: undefined }, blocker: 'condition-absent' },
    { overrides: { conditionId: '9999' }, blocker: 'condition-not-admitted' },
    { overrides: { conditionId: '1000' }, blocker: 'condition-not-normalizable', extra: { admittedConditionIds: [1000] } },
    { overrides: { conditionId: '7000' }, blocker: 'condition-not-normalizable', extra: { admittedConditionIds: [7000] } },
    { overrides: { itemWebUrl: 'https://www.ebay.es/itm/100' }, blocker: 'listing-url-rejected' },
    { overrides: { itemWebUrl: 'https://fixture.invalid/synthetic-offer?campid=1' }, blocker: 'affiliate-parameter-rejected' },
    { overrides: { listingMarketplaceId: 'EBAY_US' }, blocker: 'marketplace-mismatch' },
  ]
  for (const spec of cases) {
    const result = associateBrowseItem(item(spec.overrides), { ...base, ...spec.extra })
    assert.equal(result.observation, null, spec.blocker)
    assert.ok(result.blockers.includes(spec.blocker as never), `${spec.blocker}: ${result.blockers.join(',')}`)
  }
  const stale = associateBrowseItem(item(), {
    ...base,
    observedAt: new Date(NOW - 7 * 60 * 60 * 1000).toISOString(),
  })
  assert.equal(stale.observation, null)
  assert.ok(stale.blockers.includes('outside-display-window'))
  const undated = associateBrowseItem(item(), { ...base, observedAt: undefined })
  assert.ok(undated.blockers.includes('observed-at-missing'))
  assert.equal(readEbayBrowseItemFields(null), null)
  const fields = readEbayBrowseItemFields(item())
  assert.ok(fields)
  assert.equal(fields.epid, EPID)
  assert.equal(fields.priceValue, '10.50')
})

test('getItem reads one encoded listing and does not call the network for a bad id', async () => {
  const calls: string[] = []
  const fetchImpl: EbayFetch = async (input, init) => {
    calls.push(String(input))
    if (input === EBAY_OAUTH_TOKEN_URL) {
      return Response.json({ access_token: 'fixture-browse-token', expires_in: 7200 })
    }
    const headers = new Headers(init?.headers)
    assert.equal(headers.get('x-ebay-c-marketplace-id'), 'EBAY_ES')
    assert.equal(headers.get('x-ebay-c-enduserctx'), null)
    assert.equal(headers.get('authorization'), 'Bearer fixture-browse-token')
    return Response.json(item())
  }
  const client = createEbayBrowseClient({
    clientId: 'fixture-browse-app',
    clientSecret: 'fixture-browse-cert',
    fetchImpl,
  })
  const result = await client.getItem('v1|100|0')
  assert.equal(result.status, 'ok')
  if (result.status !== 'ok') return
  assert.equal(result.item.itemId, 'v1|100|0')
  assert.equal(result.item.epid, EPID)
  assert.equal(JSON.stringify(result).includes('fixture-seller'), false)
  assert.equal(JSON.stringify(result).includes('no copiar'), false)
  const url = new URL(calls[1] ?? '')
  assert.equal(url.origin, 'https://api.ebay.com')
  assert.equal(decodeURIComponent(url.pathname), '/buy/browse/v1/item/v1|100|0')
  assert.equal(url.toString().startsWith(EBAY_BROWSE_ITEM_URL_PREFIX), true)
  assert.equal(calls.filter((call) => call !== EBAY_OAUTH_TOKEN_URL).length, 1)

  const blocked = associateBrowseItem(result.item, { observedAt: OBSERVED_AT, now: NOW, requestMarketplaceId: 'EBAY_ES' })
  assert.equal(blocked.observation, null)
  assert.ok(blocked.blockers.includes('no-verified-mapping'))

  let fetches = 0
  const idle = createEbayBrowseClient({
    clientId: 'fixture-browse-app',
    clientSecret: 'fixture-browse-cert',
    fetchImpl: async () => {
      fetches += 1
      throw new Error('should not fetch')
    },
  })
  assert.equal((await idle.getItem('../admin')).status, 'invalid-item-id')
  assert.equal(fetches, 0)

  const offerSource = readFileSync(new URL('../lib/ebay-browse-offer.ts', import.meta.url), 'utf8')
  const offerCode = offerSource.replace(/\/\*[\s\S]*?\*\//g, '').replace(/\/\/.*$/gm, '')
  assert.doesNotMatch(offerCode, /\bfetch\s*\(|process\.env|EBAY_BROWSE_SOURCE_ENABLED\s*=\s*true/)
  const adapter = readFileSync(new URL('../lib/ebay-browse-adapter.ts', import.meta.url), 'utf8')
  assert.doesNotMatch(adapter, /ebay-browse-offer|ebay-browse-client/)
})
