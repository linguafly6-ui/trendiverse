import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import {
  EBAY_APPLICATION_OAUTH_SCOPE,
  EBAY_APPLICATION_TOKEN_MAX_BYTES,
  EBAY_APPLICATION_TOKEN_SKEW_MS,
  EBAY_OAUTH_TOKEN_URL,
  createEbayApplicationAuth,
  createEbayApplicationTokenMemory,
  ebayRequestSignal,
  readEbayApplicationCredentials,
  type EbayFetch,
} from '../lib/ebay-application-auth'

const CLIENT_ID = 'fixture-browse-app'
const CLIENT_SECRET = 'fixture-browse-cert'
const TOKEN = 'fixture-browse-token'

function tokenResponse(token = TOKEN, expiresIn = 7200, status = 200): Response {
  return new Response(JSON.stringify({ access_token: token, expires_in: expiresIn, token_type: 'Application Access Token' }), {
    status,
    headers: { 'content-type': 'application/json' },
  })
}

test('application credentials fail closed without embedding secrets in the status', () => {
  assert.deepEqual(readEbayApplicationCredentials({ clientId: '', clientSecret: '' }), { status: 'absent' })
  assert.equal(readEbayApplicationCredentials({ clientId: CLIENT_ID, clientSecret: '' }).status, 'invalid')
  assert.equal(readEbayApplicationCredentials({ clientId: 'fixture app', clientSecret: CLIENT_SECRET }).status, 'invalid')
  assert.equal(readEbayApplicationCredentials({ clientId: ` ${CLIENT_ID}`, clientSecret: CLIENT_SECRET }).status, 'invalid')
  assert.deepEqual(readEbayApplicationCredentials({ clientId: CLIENT_ID, clientSecret: CLIENT_SECRET }), {
    status: 'ok',
    clientId: CLIENT_ID,
    clientSecret: CLIENT_SECRET,
  })
  const source = readFileSync(new URL('../lib/ebay-application-auth.ts', import.meta.url), 'utf8')
  assert.doesNotMatch(source, /process\.env|console\.|localStorage|indexedDB|caches\.|KVNamespace|node:fs|EBAY_BROWSE_SOURCE_ENABLED\s*=\s*true/)
})

test('a cached application token is reused and renewed before it expires', async () => {
  const calls: Array<{ url: string, method: string, authorization: string, body: string, redirect: RequestRedirect | undefined }> = []
  let token = TOKEN
  const fetchImpl: EbayFetch = async (input, init) => {
    const headers = new Headers(init?.headers)
    const body = init?.body instanceof URLSearchParams ? init.body.toString() : ''
    calls.push({
      url: input,
      method: init?.method ?? 'GET',
      authorization: headers.get('authorization') ?? '',
      body,
      redirect: init?.redirect,
    })
    assert.ok(init?.signal)
    return tokenResponse(token)
  }
  let now = 1_700_000_000_000
  const memory = createEbayApplicationTokenMemory()
  const auth = createEbayApplicationAuth({
    clientId: CLIENT_ID,
    clientSecret: CLIENT_SECRET,
    memory,
    fetchImpl,
    now: () => now,
  })

  const first = await auth.getAccessToken()
  assert.deepEqual(first, { status: 'ok', token: TOKEN, fromCache: false })
  const basic = Buffer.from(`${CLIENT_ID}:${CLIENT_SECRET}`).toString('base64')
  assert.equal(calls[0]?.url, EBAY_OAUTH_TOKEN_URL)
  assert.equal(calls[0]?.method, 'POST')
  assert.equal(calls[0]?.authorization, `Basic ${basic}`)
  assert.equal(calls[0]?.redirect, 'manual')
  const params = new URLSearchParams(calls[0]?.body)
  assert.equal(params.get('grant_type'), 'client_credentials')
  assert.equal(params.get('scope'), EBAY_APPLICATION_OAUTH_SCOPE)
  assert.equal(calls[0]?.body.includes(CLIENT_SECRET), false)
  assert.equal(memory.current?.expiresAtMs, now + 7200 * 1000 - EBAY_APPLICATION_TOKEN_SKEW_MS)

  const cached = await auth.getAccessToken()
  assert.deepEqual(cached, { status: 'ok', token: TOKEN, fromCache: true })
  assert.equal(calls.length, 1)

  now = memory.current!.expiresAtMs - 1
  const stillCached = await auth.getAccessToken()
  assert.equal(stillCached.status, 'ok')
  if (stillCached.status === 'ok') assert.equal(stillCached.fromCache, true)
  assert.equal(calls.length, 1)

  now = memory.current!.expiresAtMs
  token = 'fixture-browse-token-2'
  const renewed = await auth.getAccessToken()
  assert.deepEqual(renewed, { status: 'ok', token: 'fixture-browse-token-2', fromCache: false })
  assert.equal(calls.length, 2)

  const forced = await auth.getAccessToken({ force: true })
  assert.equal(forced.status, 'ok')
  if (forced.status === 'ok') assert.equal(forced.fromCache, false)
  assert.equal(calls.length, 3)
})

test('token requests share one flight and a short lifetime is not reused', async () => {
  const pending: Array<(response: Response) => void> = []
  let tokenCalls = 0
  const fetchImpl: EbayFetch = () => {
    tokenCalls += 1
    return new Promise((resolve) => {
      pending.push(resolve)
    })
  }
  const auth = createEbayApplicationAuth({
    clientId: CLIENT_ID,
    clientSecret: CLIENT_SECRET,
    fetchImpl,
  })
  const first = auth.getAccessToken()
  const second = auth.getAccessToken()
  assert.equal(tokenCalls, 1)
  const release = pending[0]
  if (!release) throw new Error('token request did not start')
  release(tokenResponse())
  const [a, b] = await Promise.all([first, second])
  assert.deepEqual(a, { status: 'ok', token: TOKEN, fromCache: false })
  assert.deepEqual(b, { status: 'ok', token: TOKEN, fromCache: false })

  let now = 5_000
  let shortCalls = 0
  const short = createEbayApplicationAuth({
    clientId: CLIENT_ID,
    clientSecret: CLIENT_SECRET,
    now: () => now,
    fetchImpl: async () => {
      shortCalls += 1
      return tokenResponse(TOKEN, 60)
    },
  })
  assert.equal((await short.getAccessToken()).status, 'ok')
  assert.equal((await short.getAccessToken()).status, 'ok')
  assert.equal(shortCalls, 2)
})

test('token endpoint failures do not cache a token or throw the response', async () => {
  const cases: Array<{ response: Response | 'network', status: 'unauthorized' | 'unavailable' }> = [
    { response: new Response(null, { status: 401 }), status: 'unauthorized' },
    { response: new Response(null, { status: 403 }), status: 'unauthorized' },
    { response: new Response(null, { status: 302, headers: { location: 'https://example.invalid/token' } }), status: 'unavailable' },
    { response: new Response(null, { status: 500 }), status: 'unavailable' },
    { response: new Response('{', { status: 200, headers: { 'content-type': 'application/json' } }), status: 'unavailable' },
    { response: new Response('{}', { status: 200, headers: { 'content-type': 'text/plain' } }), status: 'unavailable' },
    { response: new Response('{}', { status: 200, headers: { 'content-type': 'application/json', 'content-length': String(EBAY_APPLICATION_TOKEN_MAX_BYTES + 1) } }), status: 'unavailable' },
    { response: tokenResponse('', 7200), status: 'unavailable' },
    { response: new Response(JSON.stringify({ access_token: TOKEN, expires_in: 0 }), { status: 200, headers: { 'content-type': 'application/json' } }), status: 'unavailable' },
    { response: new Response(JSON.stringify({ access_token: TOKEN, expires_in: '7200' }), { status: 200, headers: { 'content-type': 'application/json' } }), status: 'unavailable' },
    { response: 'network', status: 'unavailable' },
  ]
  for (const item of cases) {
    const memory = createEbayApplicationTokenMemory()
    const auth = createEbayApplicationAuth({
      clientId: CLIENT_ID,
      clientSecret: CLIENT_SECRET,
      memory,
      fetchImpl: async () => {
        if (item.response === 'network') throw new Error('socket reset')
        return item.response
      },
    })
    const result = await auth.getAccessToken()
    assert.equal(result.status, item.status)
    assert.equal(JSON.stringify(result).includes(CLIENT_SECRET), false)
    assert.equal(memory.current, null)
  }

  const invalid = createEbayApplicationAuth({
    clientId: 'bad id',
    clientSecret: CLIENT_SECRET,
    fetchImpl: async () => {
      throw new Error('should not fetch')
    },
  })
  assert.equal((await invalid.getAccessToken()).status, 'unavailable')
})

test('the request signal aborts when the timeout elapses', async () => {
  const signal = ebayRequestSignal(20)
  assert.ok(signal)
  assert.equal(signal.aborted, false)
  await new Promise((resolve, reject) => {
    const watchdog = setTimeout(() => reject(new Error('timeout did not abort')), 500)
    signal.addEventListener('abort', () => {
      clearTimeout(watchdog)
      resolve(undefined)
    }, { once: true })
  })
  assert.equal(signal.aborted, true)
  assert.equal(ebayRequestSignal(0), undefined)
})
