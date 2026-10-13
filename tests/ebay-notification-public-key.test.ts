import test from 'node:test'
import assert from 'node:assert/strict'
import { createSign, generateKeyPairSync } from 'node:crypto'
import {
  EBAY_NOTIFICATION_OAUTH_SCOPE,
  EBAY_OAUTH_TOKEN_URL,
  EBAY_PUBLIC_KEY_CACHE_TTL_MS,
  EBAY_PUBLIC_KEY_URL_PREFIX,
  createEbayNotificationPublicKeyLookup,
  createEbayPublicKeyLookup,
  createEbayPublicKeyMemory,
  createEbayPublicKeyRequest,
  ebayNotificationPublicKeyLookupFromEnv,
  isValidEbayPublicKeyId,
  readEbayNotificationCredentials,
} from '../lib/ebay-notification-public-key'
import {
  EBAY_ACCOUNT_DELETION_LIMITATION,
  createMemoryEbayAccountDeletionStore,
  handleEbayAccountDeletion,
} from '../lib/ebay-account-deletion'

const CLIENT_ID = 'fixture-app-id'
const CLIENT_SECRET = 'fixture-cert-id'
const TOKEN = 'token_token_token_token_token_32'
const ENDPOINT = 'https://trendiverse.org/api/ebay/account-deletion'
const NOW = '2026-10-11T12:00:00.000Z'
const KID = 'fixture-kid'

const primary = generateKeyPairSync('ec', { namedCurve: 'prime256v1' })
const rotated = generateKeyPairSync('ec', { namedCurve: 'prime256v1' })
const PRIMARY_PEM = primary.publicKey.export({ type: 'spki', format: 'pem' }).toString()
const ROTATED_PEM = rotated.publicKey.export({ type: 'spki', format: 'pem' }).toString()

function sign(body: string, key: typeof primary.privateKey, kid = KID): string {
  const signer = createSign('SHA1')
  signer.update(body, 'utf8')
  signer.end()
  return Buffer.from(JSON.stringify({
    alg: 'ECDSA',
    kid,
    signature: signer.sign(key).toString('base64'),
    digest: 'SHA1',
  })).toString('base64')
}

function notificationBody(): string {
  return JSON.stringify({
    metadata: { topic: 'MARKETPLACE_ACCOUNT_DELETION', schemaVersion: '1.0', deprecated: false },
    notification: {
      notificationId: '22222222-2222-2222-2222-222222222222',
      eventDate: NOW,
      publishDate: NOW,
      publishAttemptCount: 1,
      data: { username: 'fixture-user', userId: 'fixture-user-id', eiasToken: 'fixture-eias' },
    },
  })
}

function config() {
  return { verificationToken: TOKEN, endpoint: ENDPOINT, publicKeys: null }
}

async function post(options: {
  body?: string
  signature: string | null
  lookup: ReturnType<typeof createEbayPublicKeyLookup> | null
  publicKeys?: ReadonlyMap<string, string> | null
}) {
  const store = createMemoryEbayAccountDeletionStore()
  const result = await handleEbayAccountDeletion({
    method: 'POST',
    challengeCode: null,
    rawBody: options.body ?? notificationBody(),
    signatureHeader: options.signature,
    config: { ...config(), publicKeys: options.publicKeys === undefined ? null : options.publicKeys },
    store,
    now: () => NOW,
    publicKeyLookup: options.lookup,
  })
  return { result, store }
}

test('a cached public key is reused until the one-hour TTL and then fetched again', async () => {
  assert.equal(EBAY_PUBLIC_KEY_CACHE_TTL_MS, 60 * 60 * 1000)
  let now = 1_700_000_000_000
  let fetches = 0
  const lookup = createEbayPublicKeyLookup({
    now: () => now,
    fetchPublicKey: async () => {
      fetches += 1
      return { status: 'ok', pem: PRIMARY_PEM }
    },
  })
  const first = await lookup.resolve(KID)
  const second = await lookup.resolve(KID)
  assert.equal(first.status, 'ok')
  assert.equal(second.status, 'ok')
  if (first.status === 'ok') assert.equal(first.fromCache, false)
  if (second.status === 'ok') assert.equal(second.fromCache, true)
  assert.equal(fetches, 1)
  now += EBAY_PUBLIC_KEY_CACHE_TTL_MS - 1
  await lookup.resolve(KID)
  assert.equal(fetches, 1)
  now += 1
  const expired = await lookup.resolve(KID)
  assert.equal(fetches, 2)
  assert.equal(expired.status, 'ok')
  if (expired.status === 'ok') assert.equal(expired.fromCache, false)
})

test('concurrent lookups for the same kid share one fetch', async () => {
  let fetches = 0
  const lookup = createEbayPublicKeyLookup({
    fetchPublicKey: async () => {
      fetches += 1
      await new Promise((resolve) => setTimeout(resolve, 20))
      return { status: 'ok', pem: PRIMARY_PEM }
    },
  })
  const [left, right] = await Promise.all([lookup.resolve(KID), lookup.resolve(KID)])
  assert.equal(fetches, 1)
  assert.equal(left.status, 'ok')
  assert.equal(right.status, 'ok')
})

test('an unknown kid is not cached and does not accept the notification', async () => {
  let fetches = 0
  const lookup = createEbayPublicKeyLookup({
    fetchPublicKey: async () => {
      fetches += 1
      return { status: 'unknown' }
    },
  })
  const body = notificationBody()
  const first = await post({ body, signature: sign(body, primary.privateKey), lookup })
  const second = await lookup.resolve(KID)
  assert.equal(first.result.status, 412)
  assert.equal(first.result.body, null)
  assert.equal(await first.store.findReceipt('22222222-2222-2222-2222-222222222222'), null)
  assert.equal(second.status, 'unknown')
  assert.equal(fetches, 2)
})

test('an API failure does not acknowledge the notification or delete', async () => {
  let fetches = 0
  const lookup = createEbayPublicKeyLookup({
    fetchPublicKey: async () => {
      fetches += 1
      return { status: 'unavailable' }
    },
  })
  const body = notificationBody()
  const failed = await post({
    body,
    signature: sign(body, primary.privateKey),
    lookup,
    publicKeys: new Map([[KID, PRIMARY_PEM]]),
  })
  assert.equal(failed.result.status, 503)
  assert.equal(await failed.store.findReceipt('22222222-2222-2222-2222-222222222222'), null)
  assert.equal(fetches, 1)
  const thrown = createEbayPublicKeyLookup({
    fetchPublicKey: async () => {
      throw new Error('socket-down')
    },
  })
  const again = await post({ body, signature: sign(body, primary.privateKey), lookup: thrown })
  assert.equal(again.result.status, 503)
  assert.equal(await again.store.findReceipt('22222222-2222-2222-2222-222222222222'), null)
})

test('an invalid signature is rejected after a fresh key and is not processed', async () => {
  let fetches = 0
  const lookup = createEbayPublicKeyLookup({
    fetchPublicKey: async () => {
      fetches += 1
      return { status: 'ok', pem: PRIMARY_PEM }
    },
  })
  const body = notificationBody()
  const tampered = body.replace('fixture-user', 'other-user')
  const rejected = await post({ body: tampered, signature: sign(body, primary.privateKey), lookup })
  assert.equal(rejected.result.status, 412)
  assert.equal(await rejected.store.findReceipt('22222222-2222-2222-2222-222222222222'), null)
  assert.equal(fetches, 1)
  const missingHeader = await post({ body, signature: null, lookup })
  assert.equal(missingHeader.result.status, 412)
  assert.equal(fetches, 1)
})

test('a rotated kid is fetched once and replaces the cached key', async () => {
  let pem = PRIMARY_PEM
  let fetches = 0
  const lookup = createEbayPublicKeyLookup({
    fetchPublicKey: async () => {
      fetches += 1
      return { status: 'ok', pem }
    },
  })
  const body = notificationBody()
  const first = await post({ body, signature: sign(body, primary.privateKey), lookup })
  assert.equal(first.result.status, 204)
  assert.equal((await first.store.findReceipt('22222222-2222-2222-2222-222222222222'))?.outcome, 'acknowledged-deletion-not-implemented')
  pem = ROTATED_PEM
  const second = await post({ body, signature: sign(body, rotated.privateKey), lookup })
  assert.equal(second.result.status, 204)
  assert.equal((await second.store.findReceipt('22222222-2222-2222-2222-222222222222'))?.outcome, 'acknowledged-deletion-not-implemented')
  assert.equal(fetches, 2)
  const third = await post({ body, signature: sign(body, rotated.privateKey), lookup })
  assert.equal(third.result.status, 204)
  assert.equal(fetches, 2)
})

test('a cached key that still matches the refetch does not accept a bad signature', async () => {
  let fetches = 0
  const lookup = createEbayPublicKeyLookup({
    fetchPublicKey: async () => {
      fetches += 1
      return { status: 'ok', pem: PRIMARY_PEM }
    },
  })
  const body = notificationBody()
  await lookup.resolve(KID)
  const rejected = await post({ body, signature: sign(body, rotated.privateKey), lookup })
  assert.equal(rejected.result.status, 412)
  assert.equal(await rejected.store.findReceipt('22222222-2222-2222-2222-222222222222'), null)
  assert.equal(fetches, 2)
})

test('a failed rotation refetch does not accept the stale key', async () => {
  let fetches = 0
  const lookup = createEbayPublicKeyLookup({
    fetchPublicKey: async () => {
      fetches += 1
      if (fetches === 1) return { status: 'ok', pem: PRIMARY_PEM }
      return { status: 'unavailable' }
    },
  })
  const body = notificationBody()
  await lookup.resolve(KID)
  const rejected = await post({ body, signature: sign(body, rotated.privateKey), lookup })
  assert.equal(rejected.result.status, 503)
  assert.equal(await rejected.store.findReceipt('22222222-2222-2222-2222-222222222222'), null)
  assert.equal(fetches, 2)
})

test('configured credentials ignore a pasted key and a missing kid is not fetched', async () => {
  let fetches = 0
  const lookup = createEbayPublicKeyLookup({
    fetchPublicKey: async (keyId) => {
      fetches += 1
      assert.equal(keyId, KID)
      return { status: 'unknown' }
    },
  })
  const body = notificationBody()
  const pasted = await post({
    body,
    signature: sign(body, primary.privateKey),
    lookup,
    publicKeys: new Map([[KID, PRIMARY_PEM]]),
  })
  assert.equal(pasted.result.status, 412)
  assert.equal(fetches, 1)
  const unsafe = await post({
    body,
    signature: sign(body, primary.privateKey, '../not-a-key'),
    lookup,
  })
  assert.equal(unsafe.result.status, 412)
  assert.equal(fetches, 1)
  assert.equal(isValidEbayPublicKeyId('../not-a-key'), false)
  assert.equal(isValidEbayPublicKeyId(KID), true)
})

test('getPublicKey uses the client-credentials token and rejects bad responses', async () => {
  const calls: Array<{ url: string, method: string, authorization: string, body: string }> = []
  let tokenUses = 0
  let keyStatus = 200
  let keyBody: unknown = { algorithm: 'ECDSA', digest: 'SHA1', key: PRIMARY_PEM }
  let tokenValue = 'fixture-access-token'
  const fetchImpl: typeof fetch = async (input, init) => {
    const url = String(input)
    const headers = new Headers(init?.headers)
    const body = typeof init?.body === 'string'
      ? init.body
      : init?.body instanceof URLSearchParams
        ? init.body.toString()
        : ''
    calls.push({
      url,
      method: init?.method ?? 'GET',
      authorization: headers.get('authorization') ?? '',
      body,
    })
    if (url === EBAY_OAUTH_TOKEN_URL) {
      tokenUses += 1
      return Response.json({ access_token: tokenValue, expires_in: 7200, token_type: 'Application Access Token' })
    }
    assert.equal(url, `${EBAY_PUBLIC_KEY_URL_PREFIX}${KID}`)
    assert.equal(headers.get('authorization'), `Bearer ${tokenValue}`)
    if (keyBody === 'invalid-json') {
      return new Response('{truncated', {
        status: keyStatus,
        headers: { 'content-type': 'application/json' },
      })
    }
    return Response.json(keyBody, { status: keyStatus })
  }
  let now = 1_700_000_000_000
  const memory = createEbayPublicKeyMemory()
  const request = createEbayPublicKeyRequest({
    clientId: CLIENT_ID,
    clientSecret: CLIENT_SECRET,
    fetchImpl: fetchImpl as unknown as (input: string, init: RequestInit) => Promise<Response>,
    now: () => now,
    tokenCache: memory.token,
  })
  const ok = await request(KID)
  assert.equal(ok.status, 'ok')
  if (ok.status === 'ok') assert.equal(ok.pem, PRIMARY_PEM)
  const basic = Buffer.from(`${CLIENT_ID}:${CLIENT_SECRET}`).toString('base64')
  assert.equal(calls[0]?.url, EBAY_OAUTH_TOKEN_URL)
  assert.equal(calls[0]?.method, 'POST')
  assert.equal(calls[0]?.authorization, `Basic ${basic}`)
  const tokenBody = new URLSearchParams(calls[0]?.body)
  assert.equal(tokenBody.get('grant_type'), 'client_credentials')
  assert.equal(tokenBody.get('scope'), EBAY_NOTIFICATION_OAUTH_SCOPE)
  assert.equal(tokenBody.toString().includes(CLIENT_SECRET), false)
  assert.equal(calls[1]?.method, 'GET')
  await request(KID)
  assert.equal(tokenUses, 1)

  keyStatus = 404
  keyBody = { errors: [{ errorId: 195001, domain: 'API_NOTIFICATION', category: 'REQUEST' }] }
  assert.equal((await request(KID)).status, 'unknown')

  keyStatus = 400
  assert.equal((await request(KID)).status, 'unknown')

  keyStatus = 500
  keyBody = { errors: [{ errorId: 195000 }] }
  assert.equal((await request(KID)).status, 'unavailable')

  keyStatus = 200
  keyBody = { algorithm: 'RSA', digest: 'SHA1', key: PRIMARY_PEM }
  assert.equal((await request(KID)).status, 'unavailable')

  keyBody = { algorithm: 'ECDSA', digest: 'SHA1', key: 'not-a-pem' }
  assert.equal((await request(KID)).status, 'unavailable')

  keyBody = 'invalid-json'
  assert.equal((await request(KID)).status, 'unavailable')

  now += 7200 * 1000
  keyBody = { algorithm: 'ECDSA', digest: 'SHA1', key: PRIMARY_PEM }
  tokenValue = 'fixture-access-token-2'
  const refreshed = await request(KID)
  assert.equal(refreshed.status, 'ok')
  assert.equal(tokenUses, 2)
  assert.equal(calls.at(-1)?.authorization, 'Bearer fixture-access-token-2')
})

test('a repeated 401 does not accept the signature and a new token is used once', async () => {
  let keyCalls = 0
  let tokenCalls = 0
  const fetchImpl = async (input: string, init?: RequestInit) => {
    if (String(input) === EBAY_OAUTH_TOKEN_URL) {
      tokenCalls += 1
      const token = tokenCalls === 1 ? 'expired-fixture-token' : 'fresh-fixture-token'
      return Response.json({ access_token: token, expires_in: 7200 })
    }
    keyCalls += 1
    const authorization = new Headers(init?.headers).get('authorization')
    if (authorization === 'Bearer expired-fixture-token') return new Response(null, { status: 401 })
    assert.equal(authorization, 'Bearer fresh-fixture-token')
    return Response.json({ algorithm: 'ECDSA', digest: 'SHA1', key: PRIMARY_PEM })
  }
  const lookup = createEbayNotificationPublicKeyLookup({
    clientId: CLIENT_ID,
    clientSecret: CLIENT_SECRET,
    fetchImpl: fetchImpl as unknown as (input: string, init: RequestInit) => Promise<Response>,
    memory: createEbayPublicKeyMemory(),
  })
  const body = notificationBody()
  const accepted = await post({ body, signature: sign(body, primary.privateKey), lookup })
  assert.equal(accepted.result.status, 204)
  assert.equal((await accepted.store.findReceipt('22222222-2222-2222-2222-222222222222'))?.outcome, 'acknowledged-deletion-not-implemented')
  assert.equal(JSON.stringify(await accepted.store.findReceipt('22222222-2222-2222-2222-222222222222')).includes('fixture-user'), false)
  assert.equal(tokenCalls, 2)
  assert.equal(keyCalls, 2)

  let deniedTokens = 0
  const deny = async (input: string) => {
    if (String(input) === EBAY_OAUTH_TOKEN_URL) {
      deniedTokens += 1
      return Response.json({ access_token: `denied-fixture-token-${deniedTokens}`, expires_in: 7200 })
    }
    return new Response(null, { status: 401 })
  }
  const blocked = createEbayNotificationPublicKeyLookup({
    clientId: CLIENT_ID,
    clientSecret: CLIENT_SECRET,
    fetchImpl: deny as unknown as (input: string, init: RequestInit) => Promise<Response>,
    memory: createEbayPublicKeyMemory(),
  })
  const rejected = await post({ body, signature: sign(body, primary.privateKey), lookup: blocked })
  assert.equal(rejected.result.status, 503)
  assert.equal(await rejected.store.findReceipt('22222222-2222-2222-2222-222222222222'), null)
  assert.equal(deniedTokens, 2)
})

test('credential checks fail closed and do not embed secrets', async () => {
  assert.deepEqual(readEbayNotificationCredentials({ clientId: '', clientSecret: '' }), { status: 'absent' })
  assert.equal(readEbayNotificationCredentials({ clientId: 'fixture-app-id', clientSecret: '' }).status, 'invalid')
  assert.equal(readEbayNotificationCredentials({ clientId: 'fixture app', clientSecret: CLIENT_SECRET }).status, 'invalid')
  assert.deepEqual(readEbayNotificationCredentials({ clientId: CLIENT_ID, clientSecret: CLIENT_SECRET }), {
    status: 'ok',
    clientId: CLIENT_ID,
    clientSecret: CLIENT_SECRET,
  })
  const memory = createEbayPublicKeyMemory()
  assert.equal(ebayNotificationPublicKeyLookupFromEnv({}, { memory }), null)
  const invalid = ebayNotificationPublicKeyLookupFromEnv({
    EBAY_NOTIFICATION_CLIENT_ID: CLIENT_ID,
    EBAY_NOTIFICATION_CLIENT_SECRET: 'has space',
  }, { memory })
  assert.equal((await invalid?.resolve(KID))?.status, 'unavailable')
  assert.equal(EBAY_ACCOUNT_DELETION_LIMITATION, 'no-ebay-user-identity-stored')
})

test('the official client verifies a generated signature and leaves deletion unimplemented', async () => {
  let keyCalls = 0
  const fetchImpl = async (input: string) => {
    if (String(input) === EBAY_OAUTH_TOKEN_URL) {
      return Response.json({ access_token: 'fixture-access-token', expires_in: 7200 })
    }
    keyCalls += 1
    return Response.json({ algorithm: 'ECDSA', digest: 'SHA1', key: PRIMARY_PEM })
  }
  const lookup = createEbayNotificationPublicKeyLookup({
    clientId: CLIENT_ID,
    clientSecret: CLIENT_SECRET,
    fetchImpl: fetchImpl as unknown as (input: string, init: RequestInit) => Promise<Response>,
    memory: createEbayPublicKeyMemory(),
  })
  const body = notificationBody()
  const accepted = await post({ body, signature: sign(body, primary.privateKey), lookup })
  assert.equal(accepted.result.status, 204)
  assert.equal((await accepted.store.findReceipt('22222222-2222-2222-2222-222222222222'))?.outcome, 'acknowledged-deletion-not-implemented')
  const second = await post({ body, signature: sign(body, primary.privateKey), lookup })
  assert.equal(second.result.status, 204)
  assert.equal(keyCalls, 1)
})
