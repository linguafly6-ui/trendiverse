import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { EBAY_BROWSE_SOURCE_ENABLED, ebayBrowseSecondHandSource, normalizeEbaySourceUrl } from '../lib/ebay-browse-adapter'
import { EBAY_ES_ADMITTED_CONDITION_IDS } from '../lib/ebay-browse-offer'
import { emptySecondHandDataSource, getSecondHandProducts } from '../lib/second-hand-data'
import { SECOND_HAND_PRODUCT_MAPPINGS, secondHandProductMapping } from '../lib/second-hand-product-mapping'
import { EBAY_OAUTH_TOKEN_URL, type EbayFetch } from '../lib/ebay-application-auth'
import {
  EBAY_BROWSE_EPID_NOT_ACCEPTED_ERROR_ID,
  EBAY_BROWSE_EPID_SEARCH_LIMIT,
  EBAY_BROWSE_MARKETPLACE_ID,
  EBAY_BROWSE_MAX_ITEM_SCAN,
  EBAY_BROWSE_RESPONSE_MAX_BYTES,
  EBAY_BROWSE_SEARCH_LIMIT_MAX,
  EBAY_BROWSE_SEARCH_URL,
  browseEpidSearchUrl,
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

const FIXTURE_EPID = '9000000001'
const EPID_SEARCH_URL = `${EBAY_BROWSE_SEARCH_URL}?epid=${FIXTURE_EPID}&limit=10`

test('epid search requests only epid and limit=10', async () => {
  assert.equal(EBAY_BROWSE_EPID_SEARCH_LIMIT, 10)
  assert.equal(browseEpidSearchUrl(FIXTURE_EPID), EPID_SEARCH_URL)
  const built = new URL(EPID_SEARCH_URL)
  assert.deepEqual([...built.searchParams.keys()], ['epid', 'limit'])
  assert.equal(built.searchParams.get('epid'), FIXTURE_EPID)
  assert.equal(built.searchParams.get('limit'), '10')
  for (const key of ['q', 'offset', 'filter', 'category_ids', 'fieldgroups', 'sort', 'gtin']) {
    assert.equal(built.searchParams.has(key), false, key)
  }

  const recorded = recordedFetch({
    search: () => jsonResponse({
      total: 2,
      itemSummaries: [
        summary({ itemId: 'v1|9000001|0', title: 'No copiar titulo', price: { value: '10.00', currency: 'EUR' } }),
        { itemId: 'v1|9000003|0', title: 'Sin precio' },
      ],
    }),
  })
  const result = await client(recorded.fetchImpl).searchByEpid(FIXTURE_EPID)
  assert.deepEqual(result, {
    status: 'candidates',
    marketplaceId: 'EBAY_ES',
    limit: 10,
    total: 2,
    verifiedProduct: false,
    items: [{ itemId: 'v1|9000001|0' }, { itemId: 'v1|9000003|0' }],
  })
  const encoded = JSON.stringify(result)
  assert.equal(encoded.includes('10.00'), false)
  assert.equal(encoded.includes('No copiar'), false)
  assert.equal(encoded.includes('Sin precio'), false)
  assert.equal(encoded.includes('ebay.es'), false)
  assert.equal(encoded.includes(TOKEN), false)

  assert.equal(recorded.calls[0]?.url, EBAY_OAUTH_TOKEN_URL)
  const search = recorded.calls[1]
  assert.ok(search)
  assert.equal(search.url, EPID_SEARCH_URL)
  assert.equal(search.method, 'GET')
  assert.equal(search.authorization, `Bearer ${TOKEN}`)
  assert.equal(search.marketplace, 'EBAY_ES')
  assert.equal(search.endUser, null)
  assert.equal(search.redirect, 'manual')
  assert.equal(search.cache, 'no-store')
  assert.equal(search.hasSignal, true)
  assert.equal(search.body, '')
  assert.equal(recorded.calls.some((call) => call.url.includes('/buy/browse/v1/item/')), false)
  assert.equal(recorded.searchUses(), 1)
})

test('invalid epid values and extra parameters do not call eBay', async () => {
  assert.equal(client(async () => {
    throw new Error('unused')
  }).searchByEpid.length, 1)
  const rejected = [
    '',
    '   ',
    '\n9000000001',
    '9000000001 ',
    'https://www.ebay.es/p/9000000001',
    'http://api.ebay.com/buy/browse/v1/item_summary/search?epid=9000000001',
    `${EBAY_BROWSE_SEARCH_URL}?epid=${FIXTURE_EPID}&limit=10`,
    '9000000001&q=switch',
    '9000000001&filter=buyingOptions:{FIXED_PRICE}',
    '9000000001?category_ids=139971',
    '?epid=9000000001&offset=10&sort=price',
    '9000000001&fieldgroups=FULL',
    { epid: FIXTURE_EPID, q: 'switch', limit: 50, filter: 'x', offset: 0 },
    [FIXTURE_EPID],
    9000000001,
    `${'9'.repeat(65)}`,
  ]
  for (const value of rejected) {
    const recorded = recordedFetch()
    const result = await client(recorded.fetchImpl).searchByEpid(value as string)
    assert.equal(result.status, 'invalid-epid', JSON.stringify(value))
    assert.equal(recorded.calls.length, 0, JSON.stringify(value))
    assert.equal(recorded.searchUses(), 0)
    assert.equal(recorded.tokenUses(), 0)
    assert.equal(browseEpidSearchUrl(value as string), null)
  }
})

test('keyword search still sends only q and limit', async () => {
  const recorded = recordedFetch()
  const result = await client(recorded.fetchImpl).search({
    q: 'nintendo switch',
    limit: 2,
    epid: FIXTURE_EPID,
    filter: 'buyingOptions:{FIXED_PRICE}',
  } as { q: string, limit: number })
  assert.equal(result.status, 'ok')
  if (result.status === 'ok') {
    assert.equal(result.limit, 2)
    assert.equal(result.items[0]?.priceValue, '10.00')
  }
  const url = new URL(recorded.calls[1]?.url ?? '')
  assert.equal(url.origin + url.pathname, EBAY_BROWSE_SEARCH_URL)
  assert.equal(url.searchParams.get('q'), 'nintendo switch')
  assert.equal(url.searchParams.get('limit'), '2')
  assert.deepEqual([...url.searchParams.keys()].sort(), ['limit', 'q'])
  assert.equal(recorded.calls.some((call) => call.url.includes('epid=')), false)
  assert.equal(recorded.calls.some((call) => call.url.includes('/buy/browse/v1/item/')), false)
})

test('an epid search with no summaries stays empty and unverified', async () => {
  const omitted = await client(recordedFetch({
    search: () => jsonResponse({ total: 0 }),
  }).fetchImpl).searchByEpid(FIXTURE_EPID)
  assert.deepEqual(omitted, {
    status: 'empty',
    marketplaceId: 'EBAY_ES',
    limit: 10,
    total: 0,
    verifiedProduct: false,
  })

  const listed = await client(recordedFetch({
    search: () => jsonResponse({ total: 0, itemSummaries: [] }),
  }).fetchImpl).searchByEpid(FIXTURE_EPID)
  assert.deepEqual(listed, {
    status: 'empty',
    marketplaceId: 'EBAY_ES',
    limit: 10,
    total: 0,
    verifiedProduct: false,
  })
  assert.equal('items' in listed, false)
})

test('epid search refreshes a 401 once and does not retry 403, 409, 500, or redirects', async () => {
  let tokenName = 'expired-fixture-token'
  const refreshed = recordedFetch({
    token: () => {
      const response = jsonResponse({ access_token: tokenName, expires_in: 7200 })
      tokenName = 'fresh-fixture-token'
      return response
    },
    search: (_url, init) => {
      const authorization = new Headers(init.headers).get('authorization')
      if (authorization === 'Bearer expired-fixture-token') return new Response(null, { status: 401 })
      return jsonResponse({ total: 1, itemSummaries: [{ itemId: 'v1|9000004|0' }] })
    },
  })
  const ok = await client(refreshed.fetchImpl).searchByEpid(FIXTURE_EPID)
  assert.equal(ok.status, 'candidates')
  if (ok.status === 'candidates') assert.deepEqual(ok.items, [{ itemId: 'v1|9000004|0' }])
  assert.equal(refreshed.tokenUses(), 2)
  assert.equal(refreshed.searchUses(), 2)
  assert.equal(refreshed.calls.filter((call) => call.url !== EBAY_OAUTH_TOKEN_URL).every((call) => call.url === EPID_SEARCH_URL), true)

  let deniedTokens = 0
  const denied = recordedFetch({
    token: () => {
      deniedTokens += 1
      return jsonResponse({ access_token: `denied-fixture-token-${deniedTokens}`, expires_in: 7200 })
    },
    search: () => new Response(null, { status: 401 }),
  })
  assert.deepEqual(await client(denied.fetchImpl).searchByEpid(FIXTURE_EPID), {
    status: 'unauthorized',
    marketplaceId: 'EBAY_ES',
    httpStatus: 401,
  })
  assert.equal(denied.tokenUses(), 2)
  assert.equal(denied.searchUses(), 2)

  const same = recordedFetch({
    token: () => jsonResponse({ access_token: 'same-fixture-token', expires_in: 7200 }),
    search: () => new Response(null, { status: 401 }),
  })
  assert.equal((await client(same.fetchImpl).searchByEpid(FIXTURE_EPID)).status, 'unauthorized')
  assert.equal(same.tokenUses(), 2)
  assert.equal(same.searchUses(), 1)

  const cases: Array<{ status: number, expected: 'forbidden' | 'unavailable' }> = [
    { status: 403, expected: 'forbidden' },
    { status: 409, expected: 'unavailable' },
    { status: 500, expected: 'unavailable' },
    { status: 302, expected: 'unavailable' },
    { status: 307, expected: 'unavailable' },
  ]
  for (const entry of cases) {
    const recorded = recordedFetch({
      search: () => new Response(null, {
        status: entry.status,
        headers: entry.status === 302 || entry.status === 307 ? { location: 'https://example.invalid/browse' } : {},
      }),
    })
    const result = await client(recorded.fetchImpl).searchByEpid(FIXTURE_EPID)
    assert.equal(result.status, entry.expected)
    if (result.status === 'forbidden') assert.equal(result.httpStatus, 403)
    if (result.status === 'unavailable') assert.equal(result.httpStatus, entry.status)
    assert.equal(recorded.tokenUses(), 1)
    assert.equal(recorded.searchUses(), 1)
    assert.equal(recorded.calls.some((call) => call.url.includes('example.invalid')), false)
    assert.equal(JSON.stringify(result).includes('example.invalid'), false)
  }
})

test('HTTP 200 with errorId 12021 is not a usable candidate list', async () => {
  const warning = 'do-not-copy-warning'
  const bodies = [
    {
      total: 1,
      warnings: [{ errorId: EBAY_BROWSE_EPID_NOT_ACCEPTED_ERROR_ID, message: warning }],
      itemSummaries: [summary({ itemId: 'v1|9000005|0' })],
    },
    {
      total: 1,
      errors: [{ errorId: 12021, message: warning, longMessage: 'https://www.ebay.es/itm/9000005' }],
      itemSummaries: [{ itemId: 'v1|9000006|0', title: 'No candidato', price: { value: '10.00', currency: 'EUR' } }],
    },
  ]
  for (const body of bodies) {
    const recorded = recordedFetch({ search: () => jsonResponse(body) })
    const result = await client(recorded.fetchImpl).searchByEpid(FIXTURE_EPID)
    assert.deepEqual(result, {
      status: 'epid-not-accepted',
      marketplaceId: 'EBAY_ES',
      httpStatus: 200,
    })
    assert.equal('items' in result, false)
    const encoded = JSON.stringify(result)
    assert.equal(encoded.includes('v1|9000005|0'), false)
    assert.equal(encoded.includes('v1|9000006|0'), false)
    assert.equal(encoded.includes(warning), false)
    assert.equal(encoded.includes('10.00'), false)
    assert.equal(encoded.includes('ebay.es'), false)
    assert.equal(recorded.searchUses(), 1)
    assert.equal(recorded.calls.some((call) => call.url.includes('/buy/browse/v1/item/')), false)
  }
})

test('malformed or oversized epid responses are not candidates', async () => {
  const oversized = new Uint8Array(EBAY_BROWSE_RESPONSE_MAX_BYTES + 1)
  const cases: Array<() => Response> = [
    () => new Response('{', { status: 200, headers: { 'content-type': 'application/json' } }),
    () => new Response('ok', { status: 200, headers: { 'content-type': 'text/plain' } }),
    () => jsonResponse([]),
    () => jsonResponse({ errors: [{ errorId: 12000, message: 'do-not-copy-error' }] }),
    () => jsonResponse({ total: -1, itemSummaries: [] }),
    () => jsonResponse({ total: 1, itemSummaries: [{ title: 'Missing id', price: { value: '10.00', currency: 'EUR' } }] }),
    () => jsonResponse({ total: 0, itemSummaries: [{ itemId: 'v1|9000007|0' }] }),
    () => jsonResponse({}, 200, { 'content-length': String(EBAY_BROWSE_RESPONSE_MAX_BYTES + 1) }),
    () => new Response(new ReadableStream({
      start(controller) {
        controller.enqueue(oversized)
        controller.close()
      },
    }), { status: 200, headers: { 'content-type': 'application/json' } }),
    () => jsonResponse({ itemSummaries: Array.from({ length: EBAY_BROWSE_MAX_ITEM_SCAN + 1 }, () => ({ itemId: 'v1|9000008|0' })) }),
  ]
  for (const respond of cases) {
    const recorded = recordedFetch({ search: respond })
    const result = await client(recorded.fetchImpl).searchByEpid(FIXTURE_EPID)
    assert.equal(result.status, 'invalid-response')
    assert.equal('items' in result, false)
    const encoded = JSON.stringify(result)
    assert.equal(encoded.includes('10.00'), false)
    assert.equal(encoded.includes('do-not-copy-error'), false)
    assert.equal(encoded.includes('v1|9000007|0'), false)
    assert.equal(recorded.searchUses(), 1)
    assert.equal(recorded.calls.some((call) => call.url.includes('/buy/browse/v1/item/')), false)
  }

  const capped = await client(recordedFetch({
    search: () => jsonResponse({
      total: 12,
      itemSummaries: Array.from({ length: 12 }, (_item, index) => ({ itemId: `v1|91${index}|0` })),
    }),
  }).fetchImpl).searchByEpid(FIXTURE_EPID)
  assert.equal(capped.status, 'candidates')
  if (capped.status === 'candidates') assert.equal(capped.items.length, 10)
})

test('epid search does not call getItem or change catalog configuration', async () => {
  const browseSource = readFileSync(new URL('../lib/ebay-browse-client.ts', import.meta.url), 'utf8')
  const method = browseSource.slice(browseSource.indexOf('async searchByEpid'), browseSource.indexOf('async getItem'))
  assert.match(method, /browseEpidSearchUrl/)
  assert.doesNotMatch(method, /getItem\(|getItemByLegacyId\(|browseItemUrl\(|browseLegacyItemUrl\(/)
  assert.equal(browseSource.includes('21048307585'), false)
  assert.equal(browseSource.includes('23048312547'), false)

  const recorded = recordedFetch({
    search: (url) => {
      assert.equal(url, EPID_SEARCH_URL)
      return jsonResponse({ total: 1, itemSummaries: [{ itemId: 'v1|9000009|0', itemWebUrl: 'https://www.ebay.es/itm/9000009' }] })
    },
  })
  const result = await client(recorded.fetchImpl).searchByEpid(FIXTURE_EPID)
  assert.equal(result.status, 'candidates')
  assert.equal(JSON.stringify(result).includes('ebay.es'), false)
  assert.equal(recorded.calls.every((call) => call.url === EBAY_OAUTH_TOKEN_URL || call.url === EPID_SEARCH_URL), true)

  assert.equal(EBAY_BROWSE_SOURCE_ENABLED, false)
  assert.equal(emptySecondHandDataSource.id, 'empty')
  assert.equal(EBAY_ES_ADMITTED_CONDITION_IDS.length, 0)
  assert.equal(normalizeEbaySourceUrl('https://www.ebay.es/itm/9000009'), null)
  const mapping = secondHandProductMapping('nintendo-switch')
  assert.equal(mapping?.externalProductId, null)
  assert.equal(mapping?.marketplaceIdentifier, null)
  assert.match(mapping?.verificationRef ?? '', /HEG-001/)
  assert.equal(SECOND_HAND_PRODUCT_MAPPINGS.every((spec) => spec.externalProductId === null), true)
  assert.equal(SECOND_HAND_PRODUCT_MAPPINGS.every((spec) => spec.marketplaceIdentifier === null), true)

  const metadata = readFileSync(new URL('../lib/ebay-metadata-condition-policy-reading.ts', import.meta.url), 'utf8')
  assert.equal(metadata.includes('completePolicy: true'), false)
  assert.match(metadata, /completePolicy: false/)
  const offer = readFileSync(new URL('../lib/ebay-browse-offer.ts', import.meta.url), 'utf8')
  assert.match(offer, /export const EBAY_ES_ADMITTED_CONDITION_IDS: readonly number\[\] = \[\]/)
})
