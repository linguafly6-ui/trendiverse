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
  assert.equal(reading.legacyItemIdRequested, null)
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
  assert.equal(result.reading.legacyItemIdRequested, null)
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

test('a numeric legacyItemId uses get_item_by_legacy_id and stays a diagnostic', async () => {
  let fetches = 0
  const idle: EbayFetch = async () => {
    fetches += 1
    throw new Error('should not fetch')
  }
  const credentials = {
    confirm: 'run-outside-ci' as const,
    clientId: 'fixture-browse-app',
    clientSecret: 'fixture-browse-cert',
    fetchImpl: idle,
  }
  assert.equal((await collectBrowseItemReading({ legacyItemId: '100', clientId: credentials.clientId, clientSecret: credentials.clientSecret, fetchImpl: idle })).status, 'not-run')
  assert.equal((await collectBrowseItemReading({ confirm: 'run-outside-ci', legacyItemId: '100', clientId: credentials.clientId, clientSecret: credentials.clientSecret })).status, 'not-run')
  assert.equal((await collectBrowseItemReading({ ...credentials, itemId: ITEM_ID, legacyItemId: '100' })).status, 'invalid-item-id')
  for (const legacyItemId of ['', ' 100', '100 ', '0100', '0', '12a', '../admin', '00', '1'.repeat(21)]) {
    assert.equal((await collectBrowseItemReading({ ...credentials, legacyItemId })).status, 'invalid-legacy-item-id', legacyItemId)
  }
  assert.equal(fetches, 0)

  const calls: Array<{ url: string, init?: RequestInit }> = []
  const live = (itemResponse: () => Response | Promise<Response>): EbayFetch => async (input, init) => {
    calls.push({ url: String(input), init })
    if (input === EBAY_OAUTH_TOKEN_URL) {
      return Response.json({ access_token: 'fixture-browse-token', expires_in: 7200 })
    }
    const headers = new Headers(init?.headers)
    assert.equal(headers.get('x-ebay-c-marketplace-id'), 'EBAY_ES')
    assert.equal(headers.get('x-ebay-c-enduserctx'), null)
    assert.equal(headers.get('authorization'), 'Bearer fixture-browse-token')
    assert.equal(init?.redirect, 'manual')
    assert.equal(init?.cache, 'no-store')
    assert.ok(init?.signal)
    return itemResponse()
  }

  const result = await collectBrowseItemReading({
    ...credentials,
    legacyItemId: '100',
    fetchImpl: live(() => Response.json(body())),
  })
  assert.equal(result.status, 'ok')
  if (result.status !== 'ok') return
  assert.equal(result.reading.itemWebUrlIsSourceUrl, false)
  assert.equal(result.reading.legacyItemIdRequested, '100')
  assert.equal(result.reading.itemIdRequested, ITEM_ID)
  assert.equal(result.reading.fields.itemId.fromBody, 'present')
  assert.equal(result.reading.fields.legacyItemId.fromBody, 'present')
  if (result.reading.fields.legacyItemId.fromBody === 'present') {
    assert.equal(result.reading.fields.legacyItemId.value, '100')
  }
  assert.equal(result.reading.fields.condition.fromBody, 'present')
  assert.equal(result.reading.fields.conditionId.fromBody, 'present')
  assert.equal(result.reading.fields.epid.fromBody, 'present')
  const serialized = JSON.stringify(result)
  assert.equal(serialized.includes('fixture-seller'), false)
  assert.equal(serialized.includes('no copiar'), false)
  assert.equal(serialized.includes('campid'), false)
  assert.equal(serialized.includes('fixture-browse-token'), false)
  assert.equal(serialized.includes('fixture-browse-cert'), false)
  const url = new URL(calls[1]?.url ?? '')
  assert.equal(url.origin, 'https://api.ebay.com')
  assert.equal(url.pathname, '/buy/browse/v1/item/get_item_by_legacy_id')
  assert.deepEqual([...url.searchParams.keys()], ['legacy_item_id'])
  assert.equal(url.searchParams.get('legacy_item_id'), '100')
  assert.equal(calls.filter((call) => call.url !== EBAY_OAUTH_TOKEN_URL).length, 1)

  calls.length = 0
  const mismatched = await collectBrowseItemReading({
    ...credentials,
    legacyItemId: '100',
    fetchImpl: live(() => Response.json(body({ legacyItemId: '999' }))),
  })
  assert.equal(mismatched.status, 'identifier-mismatch')
  assert.equal(JSON.stringify(mismatched).includes('fixture-seller'), false)
  assert.equal('reading' in mismatched, false)

  const missingLegacy = await collectBrowseItemReading({
    ...credentials,
    legacyItemId: '100',
    fetchImpl: live(() => Response.json(body({ legacyItemId: undefined }))),
  })
  assert.equal(missingLegacy.status, 'identifier-mismatch')

  const numericLegacy = await collectBrowseItemReading({
    ...credentials,
    legacyItemId: '100',
    fetchImpl: live(() => Response.json(body({ legacyItemId: 100 }))),
  })
  assert.equal(numericLegacy.status, 'identifier-mismatch')

  const missingItemId = await collectBrowseItemReading({
    ...credentials,
    legacyItemId: '100',
    fetchImpl: live(() => Response.json(body({ itemId: undefined }))),
  })
  assert.equal(missingItemId.status, 'invalid-response')

  const unusablePrice = await collectBrowseItemReading({
    ...credentials,
    legacyItemId: '100',
    fetchImpl: live(() => Response.json(body({ price: { value: 'nope', currency: 'EURO' }, condition: ' Used' }))),
  })
  assert.equal(unusablePrice.status, 'ok')
  if (unusablePrice.status === 'ok') {
    assert.equal(unusablePrice.reading.fields.priceValue.fromBody, 'unusable')
    assert.equal(unusablePrice.reading.fields.currency.fromBody, 'unusable')
    assert.equal(unusablePrice.reading.fields.condition.fromBody, 'absent')
  }

  let forbiddenCalls = 0
  const forbidden = await collectBrowseItemReading({
    ...credentials,
    legacyItemId: '100',
    fetchImpl: live(() => {
      forbiddenCalls += 1
      return Response.json({ errors: [{ errorId: 0 }] }, { status: 403 })
    }),
  })
  assert.equal(forbidden.status, 'forbidden')
  assert.equal(forbiddenCalls, 1)

  for (const status of [404, 409, 500]) {
    const failed = await collectBrowseItemReading({
      ...credentials,
      legacyItemId: '100',
      fetchImpl: live(() => Response.json({ errors: [{ errorId: status }] }, { status })),
    })
    assert.equal(failed.status, 'unavailable', String(status))
  }

  let redirectCalls = 0
  const redirected = await collectBrowseItemReading({
    ...credentials,
    legacyItemId: '100',
    fetchImpl: async (input, init) => {
      if (input === EBAY_OAUTH_TOKEN_URL) {
        return Response.json({ access_token: 'fixture-browse-token', expires_in: 7200 })
      }
      redirectCalls += 1
      assert.equal(init?.redirect, 'manual')
      assert.equal(String(input).includes('example.invalid'), false)
      return new Response(null, { status: 302, headers: { Location: 'https://example.invalid/follow' } })
    },
  })
  assert.equal(redirected.status, 'unavailable')
  assert.equal(redirectCalls, 1)

  const timedOut = await collectBrowseItemReading({
    ...credentials,
    legacyItemId: '100',
    fetchImpl: async (input, init) => {
      if (input === EBAY_OAUTH_TOKEN_URL) {
        return Response.json({ access_token: 'fixture-browse-token', expires_in: 7200 })
      }
      assert.ok(init?.signal)
      throw new DOMException('The operation was aborted due to timeout', 'TimeoutError')
    },
  })
  assert.equal(timedOut.status, 'unavailable')

  const broken = await collectBrowseItemReading({
    ...credentials,
    legacyItemId: '100',
    fetchImpl: live(() => new Response('{', { status: 200, headers: { 'content-type': 'application/json' } })),
  })
  assert.equal(broken.status, 'invalid-response')

  const plain = await collectBrowseItemReading({
    ...credentials,
    legacyItemId: '100',
    fetchImpl: live(() => new Response('ok', { status: 200, headers: { 'content-type': 'text/plain' } })),
  })
  assert.equal(plain.status, 'invalid-response')

  const list = await collectBrowseItemReading({
    ...credentials,
    legacyItemId: '100',
    fetchImpl: live(() => Response.json([])),
  })
  assert.equal(list.status, 'invalid-response')

  const oversized = await collectBrowseItemReading({
    ...credentials,
    legacyItemId: '100',
    fetchImpl: live(() => new Response(
      JSON.stringify({ itemId: ITEM_ID, legacyItemId: '100', blob: 'x'.repeat(140_000) }),
      { status: 200, headers: { 'content-type': 'application/json' } },
    )),
  })
  assert.equal(oversized.status, 'invalid-response')

  assert.equal(EBAY_ES_ADMITTED_CONDITION_IDS.length, 0)
  assert.equal(EBAY_BROWSE_SOURCE_ENABLED, false)
  assert.equal(emptySecondHandDataSource.id, 'empty')
  const mapping = secondHandProductMapping('nintendo-switch')
  assert.equal(mapping?.externalProductId, null)
  assert.equal(mapping?.marketplaceIdentifier, null)
  for (const product of EBAY_ES_OBSERVED_CATALOG_PRODUCTS) {
    assert.equal(SECOND_HAND_PRODUCT_MAPPINGS.some((spec) => spec.externalProductId === product.epid), false)
  }
  assert.equal(normalizeEbaySourceUrl('https://www.ebay.es/itm/100'), null)
})
