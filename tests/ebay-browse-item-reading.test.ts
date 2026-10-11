import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { EBAY_BROWSE_SOURCE_ENABLED, normalizeEbaySourceUrl } from '../lib/ebay-browse-adapter'
import { EBAY_ES_ADMITTED_CONDITION_IDS } from '../lib/ebay-browse-offer'
import { EBAY_OAUTH_TOKEN_URL, type EbayFetch } from '../lib/ebay-application-auth'
import { EBAY_BROWSE_ITEM_URL_PREFIX } from '../lib/ebay-browse-client'
import {
  collectBrowseItemReading,
  readEbayBrowseItemReading,
} from '../lib/ebay-browse-item-reading'
import { EBAY_ES_OBSERVED_CATALOG_PRODUCTS } from '../lib/ebay-es-product-dossier'
import { emptySecondHandDataSource } from '../lib/second-hand-data'
import { SECOND_HAND_PRODUCT_MAPPINGS, secondHandProductMapping } from '../lib/second-hand-product-mapping'

const ITEM_ID = 'v1|100|0'

function body(overrides: Record<string, unknown> = {}) {
  return {
    itemId: ITEM_ID,
    legacyItemId: '100',
    epid: '9000000001',
    categoryId: 'fixture-category',
    listingMarketplaceId: 'EBAY_ES',
    condition: 'Used',
    conditionId: '3000',
    itemWebUrl: 'https://www.ebay.es/itm/100',
    price: { value: '10.50', currency: 'EUR' },
    seller: { username: 'fixture-seller' },
    description: 'no copiar',
    title: 'no copiar titulo',
    itemAffiliateWebUrl: 'https://www.ebay.es/itm/100?campid=1',
    ...overrides,
  }
}

test('a fixture reading keeps the safe fields and drops seller data', () => {
  const reading = readEbayBrowseItemReading(body(), ITEM_ID)
  assert.ok(reading)
  assert.equal(reading.kind, 'browse-item-reading')
  assert.equal(reading.itemWebUrlIsSourceUrl, false)
  assert.equal(reading.fields.itemId.fromBody, 'present')
  assert.equal(reading.fields.legacyItemId.fromBody, 'present')
  assert.equal(reading.fields.epid.fromBody, 'present')
  assert.equal(reading.fields.categoryId.fromBody, 'present')
  assert.equal(reading.fields.listingMarketplaceId.fromBody, 'present')
  assert.equal(reading.fields.condition.fromBody, 'present')
  assert.equal(reading.fields.conditionId.fromBody, 'present')
  assert.equal(reading.fields.currency.fromBody, 'present')
  assert.equal(reading.fields.priceValue.fromBody, 'present')
  assert.deepEqual(reading.missing, [])
  assert.equal(normalizeEbaySourceUrl('https://www.ebay.es/itm/100'), null)

  const sparse = readEbayBrowseItemReading(body({
    epid: undefined,
    categoryId: undefined,
    condition: undefined,
    conditionId: undefined,
    price: undefined,
    listingMarketplaceId: undefined,
  }), ITEM_ID)
  assert.ok(sparse)
  for (const name of ['epid', 'categoryId', 'listingMarketplaceId', 'condition', 'conditionId', 'currency', 'priceValue']) {
    assert.equal(sparse.fields[name as keyof typeof sparse.fields].fromBody, 'absent', name)
    assert.ok(sparse.missing.includes(name), name)
  }
  assert.equal(readEbayBrowseItemReading(body({ categoryId: 1, conditionId: 'NEW', price: { value: 10, currency: 'EURO' } }), ITEM_ID)?.fields.categoryId.fromBody, 'unusable')

  const serialized = JSON.stringify(reading)
  assert.equal(serialized.includes('fixture-seller'), false)
  assert.equal(serialized.includes('no copiar'), false)
  assert.equal(serialized.includes('campid'), false)
  assert.equal(EBAY_ES_ADMITTED_CONDITION_IDS.length, 0)
  assert.equal(EBAY_BROWSE_SOURCE_ENABLED, false)
  assert.equal(emptySecondHandDataSource.id, 'empty')
  const mapping = secondHandProductMapping('nintendo-switch')
  assert.equal(mapping?.externalProductId, null)
  assert.equal(mapping?.marketplaceIdentifier, null)
  for (const product of EBAY_ES_OBSERVED_CATALOG_PRODUCTS) {
    assert.equal(SECOND_HAND_PRODUCT_MAPPINGS.some((spec) => spec.externalProductId === product.epid), false)
  }
})

test('the manual reading stays off and does not call the network for a legacy id', async () => {
  let fetches = 0
  const fetchImpl: EbayFetch = async () => {
    fetches += 1
    throw new Error('should not fetch')
  }
  assert.equal((await collectBrowseItemReading()).status, 'not-run')
  assert.equal((await collectBrowseItemReading({
    confirm: 'run-outside-ci',
    itemId: ITEM_ID,
    clientId: 'fixture-browse-app',
    clientSecret: 'fixture-browse-cert',
  })).status, 'not-run')
  assert.equal((await collectBrowseItemReading({
    confirm: 'run-outside-ci',
    itemId: '123456789012',
    clientId: 'fixture-browse-app',
    clientSecret: 'fixture-browse-cert',
    fetchImpl,
  })).status, 'legacy-item-id-not-supported')
  assert.equal((await collectBrowseItemReading({
    confirm: 'run-outside-ci',
    itemId: '../admin',
    clientId: 'fixture-browse-app',
    clientSecret: 'fixture-browse-cert',
    fetchImpl,
  })).status, 'invalid-item-id')
  assert.equal(fetches, 0)

  const calls: string[] = []
  const live: EbayFetch = async (input, init) => {
    calls.push(String(input))
    if (input === EBAY_OAUTH_TOKEN_URL) {
      return Response.json({ access_token: 'fixture-browse-token', expires_in: 7200 })
    }
    const headers = new Headers(init?.headers)
    assert.equal(headers.get('x-ebay-c-marketplace-id'), 'EBAY_ES')
    assert.equal(headers.get('x-ebay-c-enduserctx'), null)
    assert.equal(headers.get('authorization'), 'Bearer fixture-browse-token')
    return Response.json(body({ epid: undefined }))
  }
  const result = await collectBrowseItemReading({
    confirm: 'run-outside-ci',
    itemId: ITEM_ID,
    clientId: 'fixture-browse-app',
    clientSecret: 'fixture-browse-cert',
    fetchImpl: live,
  })
  assert.equal(result.status, 'ok')
  if (result.status !== 'ok') return
  assert.equal(result.reading.fields.epid.fromBody, 'absent')
  assert.equal(result.reading.fields.condition.fromBody, 'present')
  assert.equal(JSON.stringify(result).includes('fixture-seller'), false)
  assert.equal(JSON.stringify(result).includes('fixture-browse-token'), false)
  const url = new URL(calls[1] ?? '')
  assert.equal(decodeURIComponent(url.pathname), '/buy/browse/v1/item/v1|100|0')
  assert.equal(url.toString().startsWith(EBAY_BROWSE_ITEM_URL_PREFIX), true)

  const source = readFileSync(new URL('../lib/ebay-browse-item-reading.ts', import.meta.url), 'utf8')
  const code = source.replace(/\/\*[\s\S]*?\*\//g, '').replace(/\/\/.*$/gm, '')
  assert.doesNotMatch(code, /process\.env|EBAY_BROWSE_SOURCE_ENABLED\s*=\s*true|associateBrowseItem|SECOND_HAND_PRODUCT_MAPPINGS/)
})
