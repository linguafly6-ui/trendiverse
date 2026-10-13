import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { EBAY_BROWSE_SOURCE_ENABLED, ebayBrowseSecondHandSource } from '../lib/ebay-browse-adapter'
import { emptySecondHandDataSource, getSecondHandProducts } from '../lib/second-hand-data'
import { EBAY_OAUTH_TOKEN_URL, type EbayFetch } from '../lib/ebay-application-auth'
import {
  EBAY_BROWSE_MARKETPLACE_ID,
  EBAY_BROWSE_MAX_ITEM_SCAN,
  EBAY_BROWSE_RESPONSE_MAX_BYTES,
  EBAY_BROWSE_SEARCH_LIMIT_MAX,
  EBAY_BROWSE_SEARCH_URL,
  createEbayBrowseClient,
} from '../lib/ebay-browse-client'

const CLIENT_ID = 'fixture-browse-app'
const CLIENT_SECRET = 'fixture-browse-cert'
const TOKEN = 'fixture-browse-token'

interface RecordedCall {
  url: string
  method: string
  authorization: string
  marketplace: string | null
  endUser: string | null
  body: string
  redirect: RequestRedirect | undefined
  cache: RequestCache | undefined
  hasSignal: boolean
}

function jsonResponse(body: unknown, status = 200, extraHeaders: Record<string, string> = {}): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'content-type': 'application/json', ...extraHeaders },
  })
}

function summary(overrides: Record<string, unknown> = {}) {
  return {
    itemId: 'v1|100|0',
    title: 'Fixture summary',
    price: { value: '10.00', currency: 'EUR' },
    conditionId: '3000',
    itemWebUrl: 'https://www.ebay.es/itm/100',
    itemAffiliateWebUrl: 'https://www.ebay.es/itm/100?campid=1',
    ...overrides,
  }
}

function searchBody(items: unknown[], total: number = items.length) {
  return { href: 'https://api.ebay.com/buy/browse/v1/item_summary/search?q=fixture', total, itemSummaries: items }
}

function recordedFetch(options: {
  token?: () => Response | Promise<Response>
  search?: (url: string, init: RequestInit) => Response | Promise<Response>
} = {}) {
  const calls: RecordedCall[] = []
  let tokenUses = 0
  let searchUses = 0
  const fetchImpl: EbayFetch = async (input, init) => {
    const headers = new Headers(init?.headers)
    calls.push({
      url: input,
      method: init?.method ?? 'GET',
      authorization: headers.get('authorization') ?? '',
      marketplace: headers.get('x-ebay-c-marketplace-id'),
      endUser: headers.get('x-ebay-c-enduserctx'),
      body: init?.body instanceof URLSearchParams ? init.body.toString() : '',
      redirect: init?.redirect,
      cache: init?.cache,
      hasSignal: Boolean(init?.signal),
    })
    if (input === EBAY_OAUTH_TOKEN_URL) {
      tokenUses += 1
      return options.token ? options.token() : jsonResponse({ access_token: TOKEN, expires_in: 7200 })
    }
    searchUses += 1
    return options.search ? options.search(input, init ?? {}) : jsonResponse(searchBody([summary()]))
  }
  return { calls, fetchImpl, tokenUses: () => tokenUses, searchUses: () => searchUses }
}

function client(fetchImpl: EbayFetch, now?: () => number) {
  return createEbayBrowseClient({
    clientId: CLIENT_ID,
    clientSecret: CLIENT_SECRET,
    fetchImpl,
    now,
  })
}

test('search uses the application token and the Spain marketplace only', async () => {
  const recorded = recordedFetch()
  const result = await client(recorded.fetchImpl).search({ q: ' nintendo switch ' })
  assert.equal(result.status, 'ok')
  if (result.status !== 'ok') return
  assert.equal(result.marketplaceId, EBAY_BROWSE_MARKETPLACE_ID)
  assert.equal(result.limit, 1)
  assert.equal(result.total, 1)
  assert.deepEqual(result.items, [{
    itemId: 'v1|100|0',
    title: 'Fixture summary',
    priceValue: '10.00',
    currency: 'EUR',
    conditionId: '3000',
  }])
  const encoded = JSON.stringify(result)
  assert.equal(encoded.includes('ebay.es'), false)
  assert.equal(encoded.includes('campid'), false)
  assert.equal(encoded.includes(TOKEN), false)
  assert.equal(encoded.includes(CLIENT_SECRET), false)

  assert.equal(recorded.calls[0]?.url, EBAY_OAUTH_TOKEN_URL)
  assert.equal(recorded.calls[0]?.body.includes(CLIENT_SECRET), false)
  const search = recorded.calls[1]
  assert.ok(search)
  const url = new URL(search.url)
  assert.equal(url.origin + url.pathname, EBAY_BROWSE_SEARCH_URL)
  assert.equal(url.searchParams.get('q'), 'nintendo switch')
  assert.equal(url.searchParams.get('limit'), '1')
  assert.deepEqual([...url.searchParams.keys()].sort(), ['limit', 'q'])
  assert.equal(search.method, 'GET')
  assert.equal(search.authorization, `Bearer ${TOKEN}`)
  assert.equal(search.marketplace, 'EBAY_ES')
  assert.equal(search.endUser, null)
  assert.equal(search.redirect, 'manual')
  assert.equal(search.cache, 'no-store')
  assert.equal(search.hasSignal, true)
  assert.equal(search.body, '')

  const again = await client(recorded.fetchImpl).search({ q: 'nintendo switch', limit: EBAY_BROWSE_SEARCH_LIMIT_MAX })
  assert.equal(again.status, 'ok')
  assert.equal(recorded.tokenUses(), 2)
})

test('one token is shared by concurrent searches and reused until the skew', async () => {
  const pending: Array<(response: Response) => void> = []
  let tokenCalls = 0
  const fetchImpl: EbayFetch = async (input) => {
    if (input === EBAY_OAUTH_TOKEN_URL) {
      tokenCalls += 1
      return new Promise((resolve) => {
        pending.push(resolve)
      })
    }
    return jsonResponse(searchBody([summary()], 4))
  }
  const browse = client(fetchImpl)
  const first = browse.search({ q: 'nintendo switch' })
  const second = browse.search({ q: 'nintendo switch oled' })
  assert.equal(tokenCalls, 1)
  const release = pending[0]
  if (!release) throw new Error('token request did not start')
  release(jsonResponse({ access_token: TOKEN, expires_in: 7200 }))
  const [a, b] = await Promise.all([first, second])
  assert.equal(a.status, 'ok')
  assert.equal(b.status, 'ok')
  assert.equal(tokenCalls, 1)

  let now = 10_000
  let laterTokens = 0
  const timed = client(async (input) => {
    if (input === EBAY_OAUTH_TOKEN_URL) {
      laterTokens += 1
      return jsonResponse({ access_token: TOKEN, expires_in: 7200 })
    }
    return jsonResponse(searchBody([summary()]))
  }, () => now)
  assert.equal((await timed.search({ q: 'nintendo switch' })).status, 'ok')
  now += 7200 * 1000 - 60_000 - 1
  assert.equal((await timed.search({ q: 'nintendo switch' })).status, 'ok')
  assert.equal(laterTokens, 1)
  now += 1
  assert.equal((await timed.search({ q: 'nintendo switch' })).status, 'ok')
  assert.equal(laterTokens, 2)
})

test('a 401 refreshes the token once and a 403 does not', async () => {
  let tokenName = 'expired-fixture-token'
  let searches = 0
  const refreshed = recordedFetch({
    token: () => {
      const response = jsonResponse({ access_token: tokenName, expires_in: 7200 })
      tokenName = 'fresh-fixture-token'
      return response
    },
    search: (_url, init) => {
      searches += 1
      const authorization = new Headers(init.headers).get('authorization')
      if (authorization === 'Bearer expired-fixture-token') return new Response(null, { status: 401 })
      assert.equal(authorization, 'Bearer fresh-fixture-token')
      return jsonResponse(searchBody([summary({ itemId: 'v1|200|0' })]))
    },
  })
  const ok = await client(refreshed.fetchImpl).search({ q: 'nintendo switch' })
  assert.equal(ok.status, 'ok')
  if (ok.status === 'ok') assert.equal(ok.items[0]?.itemId, 'v1|200|0')
  assert.equal(refreshed.tokenUses(), 2)
  assert.equal(searches, 2)

  let deniedTokens = 0
  const denied = recordedFetch({
    token: () => {
      deniedTokens += 1
      return jsonResponse({ access_token: `denied-fixture-token-${deniedTokens}`, expires_in: 7200 })
    },
    search: () => new Response(null, { status: 401 }),
  })
  assert.equal((await client(denied.fetchImpl).search({ q: 'nintendo switch' })).status, 'unauthorized')
  assert.equal(deniedTokens, 2)
  assert.equal(denied.searchUses(), 2)

  const same = recordedFetch({
    token: () => jsonResponse({ access_token: 'same-fixture-token', expires_in: 7200 }),
    search: () => new Response(null, { status: 401 }),
  })
  assert.equal((await client(same.fetchImpl).search({ q: 'nintendo switch' })).status, 'unauthorized')
  assert.equal(same.tokenUses(), 2)
  assert.equal(same.searchUses(), 1)

  const forbidden = recordedFetch({
    search: () => new Response(null, { status: 403 }),
  })
  assert.equal((await client(forbidden.fetchImpl).search({ q: 'nintendo switch' })).status, 'forbidden')
  assert.equal(forbidden.tokenUses(), 1)
  assert.equal(forbidden.searchUses(), 1)

  const tokenDenied = recordedFetch({
    token: () => new Response(null, { status: 401 }),
  })
  assert.equal((await client(tokenDenied.fetchImpl).search({ q: 'nintendo switch' })).status, 'unauthorized')
  assert.equal(tokenDenied.searchUses(), 0)
})

test('network, empty, and invalid browse responses stay closed', async () => {
  const network = recordedFetch({
    search: () => {
      throw new Error('network down')
    },
  })
  const down = await client(network.fetchImpl).search({ q: 'nintendo switch' })
  assert.equal(down.status, 'unavailable')
  assert.equal(JSON.stringify(down).includes('network down'), false)

  const empty = await client(recordedFetch({
    search: () => jsonResponse({ total: 0, itemSummaries: [] }),
  }).fetchImpl).search({ q: 'nintendo switch' })
  assert.deepEqual(empty, { status: 'empty', marketplaceId: 'EBAY_ES', limit: 1, total: 0 })

  const missing = await client(recordedFetch({
    search: () => jsonResponse({ total: 265985 }),
  }).fetchImpl).search({ q: 'nintendo switch' })
  assert.deepEqual(missing, { status: 'empty', marketplaceId: 'EBAY_ES', limit: 1, total: 265985 })

  const cases: Array<() => Response> = [
    () => new Response('{', { status: 200, headers: { 'content-type': 'application/json' } }),
    () => new Response('ok', { status: 200, headers: { 'content-type': 'text/plain' } }),
    () => jsonResponse({ errors: [{ errorId: 12000 }] }),
    () => jsonResponse({ total: -1, itemSummaries: [] }),
    () => jsonResponse({ total: 1.5, itemSummaries: [summary()] }),
    () => jsonResponse({ itemSummaries: [{ title: 'Missing id' }] }),
    () => jsonResponse(searchBody([summary({ price: { value: '0.00', currency: 'EUR' } })])),
    () => jsonResponse(searchBody([summary({ price: { value: '10', currency: 'eur' } })])),
    () => jsonResponse({ total: 0, itemSummaries: [summary()] }),
    () => new Response(null, { status: 302, headers: { location: 'https://example.invalid/browse' } }),
    () => new Response(null, { status: 429 }),
    () => new Response(null, { status: 500 }),
    () => jsonResponse({}, 200, { 'content-length': String(EBAY_BROWSE_RESPONSE_MAX_BYTES + 1) }),
    () => jsonResponse({ itemSummaries: Array.from({ length: EBAY_BROWSE_MAX_ITEM_SCAN + 1 }, () => summary()) }),
  ]
  for (const respond of cases) {
    const result = await client(recordedFetch({ search: respond }).fetchImpl).search({ q: 'nintendo switch' })
    assert.notEqual(result.status, 'ok', result.status)
    assert.equal(JSON.stringify(result).includes(CLIENT_SECRET), false)
    assert.equal(JSON.stringify(result).includes('ebay.es'), false)
  }
})

test('results are capped and invalid queries do not call eBay', async () => {
  const items = [
    summary({ itemId: 'bad id', title: 'Skipped' }),
    summary({ itemId: 'v1|1|0', title: ' First ' }),
    summary({ itemId: 'v1|2|0', title: 'Second' }),
    summary({ itemId: 'v1|3|0', title: 'Third' }),
  ]
  const recorded = recordedFetch({
    search: () => jsonResponse({ total: 90, itemSummaries: items }),
  })
  const result = await client(recorded.fetchImpl).search({ q: 'nintendo switch', limit: 2 })
  assert.equal(result.status, 'ok')
  if (result.status !== 'ok') return
  assert.equal(result.total, 90)
  assert.deepEqual(result.items.map((item) => item.itemId), ['v1|1|0', 'v1|2|0'])
  assert.equal(result.items[0]?.title, 'First')
  assert.equal(new URL(recorded.calls[1]?.url ?? '').searchParams.get('limit'), '2')

  const noCondition = await client(recordedFetch({
    search: () => jsonResponse(searchBody([summary({ conditionId: undefined })])),
  }).fetchImpl).search({ q: 'nintendo switch' })
  assert.equal(noCondition.status, 'ok')
  if (noCondition.status === 'ok') assert.equal(noCondition.items[0]?.conditionId, null)

  const fetchImpl: EbayFetch = async () => {
    throw new Error('should not fetch')
  }
  const browse = client(fetchImpl)
  for (const query of [
    { q: '' },
    { q: '   ' },
    { q: 'nintendo\nswitch' },
    { q: 'x'.repeat(101) },
    { q: 'nintendo switch', limit: 0 },
    { q: 'nintendo switch', limit: 11 },
    { q: 'nintendo switch', limit: 1.5 },
  ]) {
    assert.equal((await browse.search(query)).status, 'invalid-query')
  }
  const invalidCredentials = createEbayBrowseClient({
    clientId: 'bad id',
    clientSecret: CLIENT_SECRET,
    fetchImpl,
  })
  assert.equal((await invalidCredentials.search({ q: 'nintendo switch' })).status, 'unavailable')
})

test('the browse client stays disconnected from the default second-hand provider', async () => {
  assert.equal(EBAY_BROWSE_SOURCE_ENABLED, false)
  assert.equal(emptySecondHandDataSource.id, 'empty')
  assert.equal(await ebayBrowseSecondHandSource.getProductData('nintendo-switch'), null)
  const products = await getSecondHandProducts()
  for (const product of products) {
    assert.equal(product.metrics.usedPrice, null, product.slug)
    assert.equal(product.metrics.source, null, product.slug)
  }
  const browseSource = readFileSync(new URL('../lib/ebay-browse-client.ts', import.meta.url), 'utf8')
  const adapterSource = readFileSync(new URL('../lib/ebay-browse-adapter.ts', import.meta.url), 'utf8')
  assert.doesNotMatch(browseSource, /second-hand-data|ebay-browse-adapter|process\.env|EBAY_BROWSE_SOURCE_ENABLED\s*=\s*true|console\./)
  assert.doesNotMatch(adapterSource, /ebay-browse-client|ebay-application-auth/)
  assert.match(adapterSource, /export const EBAY_BROWSE_SOURCE_ENABLED = false/)
})
