import test from 'node:test'
import assert from 'node:assert/strict'
import { createHash, createSign, generateKeyPairSync } from 'node:crypto'
import { readFileSync } from 'node:fs'
import { EBAY_BROWSE_SOURCE_ENABLED } from '../lib/ebay-browse-adapter'
import {
  EBAY_ACCOUNT_DELETION_LIMITATION,
  createD1EbayAccountDeletionStore,
  createMemoryEbayAccountDeletionStore,
  ebayChallengeResponse,
  handleEbayAccountDeletion,
  isValidEbayAccountDeletionEndpoint,
  isValidEbayVerificationToken,
  parseEbayAccountDeletionNotification,
  parseEbayNotificationPublicKeys,
  readEbayAccountDeletionConfig,
  type EbayAccountDeletionConfig,
  type EbayAccountDeletionReceipt,
  type EbayAccountDeletionStore,
  type EbayAccountIdentity,
  type EbayReceiptDatabase,
} from '../lib/ebay-account-deletion'

const TOKEN = 'token_token_token_token_token_32'
const ENDPOINT = 'https://trendiverse.org/api/ebay/account-deletion'
const CHALLENGE = 'ebay-challenge-code'
const CHALLENGE_HASH = '59ab5087e5e0a00c590236999b808f64d912b2f09c5439382ce6585239f62b39'
const NOW = '2026-10-10T12:00:00.000Z'

const { publicKey, privateKey } = generateKeyPairSync('ec', { namedCurve: 'prime256v1' })
const PUBLIC_PEM = publicKey.export({ type: 'spki', format: 'pem' }).toString()
const KEYS = new Map([['fixture-kid', PUBLIC_PEM]])

function config(publicKeys: ReadonlyMap<string, string> | null = KEYS): EbayAccountDeletionConfig {
  return { verificationToken: TOKEN, endpoint: ENDPOINT, publicKeys }
}

function sign(body: string, kid = 'fixture-kid', digest = 'SHA1'): string {
  const signer = createSign('SHA1')
  signer.update(body, 'utf8')
  signer.end()
  const signature = signer.sign(privateKey).toString('base64')
  return Buffer.from(JSON.stringify({ alg: 'ECDSA', kid, signature, digest })).toString('base64')
}

function notificationBody(overrides: Record<string, unknown> = {}): string {
  const data = {
    username: 'fixture-user',
    userId: 'fixture-user-id',
    eiasToken: 'fixture-eias',
    ...(overrides.data as Record<string, unknown> | undefined),
  }
  return JSON.stringify({
    metadata: { topic: 'MARKETPLACE_ACCOUNT_DELETION', schemaVersion: '1.0', deprecated: false, ...(overrides.metadata as object | undefined) },
    notification: {
      notificationId: '11111111-1111-1111-1111-111111111111',
      eventDate: NOW,
      publishDate: NOW,
      publishAttemptCount: 1,
      data,
      ...(overrides.notification as object | undefined),
    },
  })
}

interface TrackedRow {
  id: string
  ebayUserId: string | null
}

function trackingStore(rows: TrackedRow[], options: { failDelete?: boolean, failFinalize?: boolean, delayDeleteMs?: number } = {}) {
  const receipts = new Map<string, EbayAccountDeletionReceipt>()
  let deletions = 0
  const store: EbayAccountDeletionStore = {
    async findReceipt(notificationId) {
      return receipts.get(notificationId) ?? null
    },
    async claimReceipt(notificationId, processedAt) {
      const existing = receipts.get(notificationId)
      if (existing?.outcome === 'acknowledged-deletion-not-implemented' || existing?.outcome === 'linked-personal-data-removed') return 'duplicate'
      if (existing) return 'in-progress'
      receipts.set(notificationId, { notificationId, outcome: 'reserved', processedAt })
      return 'created'
    },
    async finalizeReceipt(notificationId, outcome) {
      if (options.failFinalize) throw new Error('finalize-failed')
      const existing = receipts.get(notificationId)
      if (!existing || existing.outcome !== 'reserved') throw new Error('receipt-not-reserved')
      receipts.set(notificationId, { ...existing, outcome })
    },
    async releaseReceipt(notificationId) {
      const existing = receipts.get(notificationId)
      if (existing?.outcome === 'reserved') receipts.delete(notificationId)
    },
    async deleteLinkedPersonalData(identity: EbayAccountIdentity) {
      if (options.delayDeleteMs) await new Promise((resolve) => setTimeout(resolve, options.delayDeleteMs))
      if (options.failDelete) throw new Error('delete-failed')
      deletions += 1
      const matches = (row: TrackedRow) => row.ebayUserId !== null && (
        row.ebayUserId === identity.userId || row.ebayUserId === identity.username || row.ebayUserId === identity.eiasToken
      )
      const before = rows.length
      for (let index = rows.length - 1; index >= 0; index -= 1) {
        if (matches(rows[index])) rows.splice(index, 1)
      }
      return { deletedRowCount: before - rows.length, implemented: true, limitation: null }
    },
  }
  return { store, receipts, deletions: () => deletions, rows }
}

test('the challenge hash is the sha256 of code, token and endpoint in that order', async () => {
  const independent = createHash('sha256').update(CHALLENGE, 'utf8').update(TOKEN, 'utf8').update(ENDPOINT, 'utf8').digest('hex')
  assert.equal(independent, CHALLENGE_HASH)
  assert.equal(await ebayChallengeResponse(CHALLENGE, TOKEN, ENDPOINT), CHALLENGE_HASH)
  const result = await handleEbayAccountDeletion({
    method: 'GET',
    challengeCode: CHALLENGE,
    rawBody: '',
    signatureHeader: null,
    config: config(),
    store: createMemoryEbayAccountDeletionStore(),
  })
  assert.equal(result.status, 200)
  assert.deepEqual(result.body, { challengeResponse: CHALLENGE_HASH })
})

test('the verification token and endpoint must match the eBay format', () => {
  assert.equal(isValidEbayVerificationToken(TOKEN), true)
  assert.equal(isValidEbayVerificationToken('a'.repeat(31)), false)
  assert.equal(isValidEbayVerificationToken('a'.repeat(81)), false)
  assert.equal(isValidEbayVerificationToken(`${TOKEN} `), false)
  assert.equal(isValidEbayVerificationToken(`${TOKEN.slice(0, 31)}/`), false)
  assert.equal(isValidEbayAccountDeletionEndpoint(ENDPOINT), true)
  assert.equal(isValidEbayAccountDeletionEndpoint('http://trendiverse.org/api/ebay/account-deletion'), false)
  assert.equal(isValidEbayAccountDeletionEndpoint(`${ENDPOINT}?challenge_code=1`), false)
  assert.equal(isValidEbayAccountDeletionEndpoint(`${ENDPOINT}/`), false)
  assert.equal(parseEbayNotificationPublicKeys(JSON.stringify({
    kid: { key: PUBLIC_PEM, algorithm: 'ECDSA', digest: 'SHA1' },
  }))?.get('kid')?.includes('BEGIN PUBLIC KEY'), true)
  assert.equal(parseEbayNotificationPublicKeys(JSON.stringify({
    kid: { key: PUBLIC_PEM, algorithm: 'RSA', digest: 'SHA1' },
  })), null)
  const invalid = readEbayAccountDeletionConfig({ verificationToken: 'short', endpoint: ENDPOINT, publicKeysJson: null })
  assert.equal(invalid.verificationToken, null)
  assert.equal(invalid.endpoint, ENDPOINT)
})

test('a missing or invalid challenge configuration does not return a hash', async () => {
  const store = createMemoryEbayAccountDeletionStore()
  const missingCode = await handleEbayAccountDeletion({
    method: 'GET', challengeCode: '', rawBody: '', signatureHeader: null, config: config(), store,
  })
  assert.equal(missingCode.status, 400)
  assert.equal(missingCode.body, null)
  const missingToken = await handleEbayAccountDeletion({
    method: 'GET',
    challengeCode: CHALLENGE,
    rawBody: '',
    signatureHeader: null,
    config: { verificationToken: null, endpoint: ENDPOINT, publicKeys: KEYS },
    store,
  })
  assert.equal(missingToken.status, 503)
  assert.equal(missingToken.body, null)
})

test('an invalid signature is rejected and does not delete', async () => {
  const tracked = trackingStore([
    { id: 'linked', ebayUserId: 'fixture-user-id' },
    { id: 'global', ebayUserId: null },
  ])
  const body = notificationBody()
  const tampered = await handleEbayAccountDeletion({
    method: 'POST',
    challengeCode: null,
    rawBody: body.replace('fixture-user-id', 'other-user'),
    signatureHeader: sign(body),
    config: config(),
    store: tracked.store,
    now: () => NOW,
  })
  assert.equal(tampered.status, 412)
  assert.equal(tracked.deletions(), 0)
  assert.equal(tracked.rows.length, 2)

  const unknownKid = await handleEbayAccountDeletion({
    method: 'POST',
    challengeCode: null,
    rawBody: body,
    signatureHeader: sign(body, 'other-kid'),
    config: config(),
    store: tracked.store,
    now: () => NOW,
  })
  assert.equal(unknownKid.status, 412)

  const wrongDigest = Buffer.from(JSON.stringify({
    alg: 'ECDSA',
    kid: 'fixture-kid',
    signature: 'aaaa',
    digest: 'SHA256',
  })).toString('base64')
  const digest = await handleEbayAccountDeletion({
    method: 'POST', challengeCode: null, rawBody: body, signatureHeader: wrongDigest, config: config(), store: tracked.store,
  })
  assert.equal(digest.status, 412)
  assert.equal(tracked.receipts.size, 0)
})

test('a signed notification removes only rows linked to that identity and a duplicate does not delete again', async () => {
  const tracked = trackingStore([
    { id: 'linked', ebayUserId: 'fixture-user-id' },
    { id: 'other-seller', ebayUserId: 'another-seller' },
    { id: 'global-stat', ebayUserId: null },
  ])
  const body = notificationBody()
  const first = await handleEbayAccountDeletion({
    method: 'POST',
    challengeCode: null,
    rawBody: body,
    signatureHeader: sign(body),
    config: config(),
    store: tracked.store,
    now: () => NOW,
  })
  assert.equal(first.status, 204)
  assert.equal(first.body, null)
  assert.deepEqual(tracked.rows.map((row) => row.id), ['other-seller', 'global-stat'])
  assert.equal(tracked.deletions(), 1)
  assert.equal(tracked.receipts.get('11111111-1111-1111-1111-111111111111')?.outcome, 'linked-personal-data-removed')

  const second = await handleEbayAccountDeletion({
    method: 'POST',
    challengeCode: null,
    rawBody: body,
    signatureHeader: sign(body),
    config: config(),
    store: tracked.store,
    now: () => NOW,
  })
  assert.equal(second.status, 204)
  assert.equal(tracked.deletions(), 1)
  assert.deepEqual(tracked.rows.map((row) => row.id), ['other-seller', 'global-stat'])
})

test('the production store accepts a notification without deleting unlinked catalog data', async () => {
  const store = createMemoryEbayAccountDeletionStore()
  const body = notificationBody()
  const result = await handleEbayAccountDeletion({
    method: 'POST',
    challengeCode: null,
    rawBody: body,
    signatureHeader: sign(body),
    config: config(),
    store,
    now: () => NOW,
  })
  assert.equal(result.status, 204)
  const receipt = await store.findReceipt('11111111-1111-1111-1111-111111111111')
  assert.equal(receipt?.outcome, 'acknowledged-deletion-not-implemented')
  assert.equal(receipt?.processedAt, NOW)
  assert.equal(JSON.stringify(receipt).includes('fixture-user'), false)
})

test('malformed notifications and a missing key configuration fail closed', async () => {
  const store = createMemoryEbayAccountDeletionStore()
  const valid = notificationBody()
  const otherTopic = notificationBody({ metadata: { topic: 'OTHER' } })
  const missingId = notificationBody({ notification: { notificationId: '' } })
  const missingIdentity = notificationBody({ data: { username: ' ', userId: '', eiasToken: '' } })
  const cases: Array<{ name: string, body: string, signature: string | null, keys: ReadonlyMap<string, string> | null, status: number }> = [
    { name: 'invalid-json', body: '{', signature: sign('{'), keys: KEYS, status: 400 },
    { name: 'unexpected-topic', body: otherTopic, signature: sign(otherTopic), keys: KEYS, status: 400 },
    { name: 'missing-id', body: missingId, signature: sign(missingId), keys: KEYS, status: 400 },
    { name: 'missing-identity', body: missingIdentity, signature: sign(missingIdentity), keys: KEYS, status: 400 },
    { name: 'too-large', body: 'x'.repeat(65_537), signature: sign(valid), keys: KEYS, status: 413 },
    { name: 'keys-missing', body: valid, signature: sign(valid), keys: null, status: 503 },
    { name: 'signature-missing', body: valid, signature: null, keys: KEYS, status: 412 },
  ]
  for (const item of cases) {
    const result = await handleEbayAccountDeletion({
      method: 'POST',
      challengeCode: null,
      rawBody: item.body,
      signatureHeader: item.signature,
      config: config(item.keys),
      store,
    })
    assert.equal(result.status, item.status, item.name)
    assert.equal(result.body, null)
  }
  assert.equal(await store.findReceipt('11111111-1111-1111-1111-111111111111'), null)
  const parsed = parseEbayAccountDeletionNotification(otherTopic)
  assert.equal(parsed.ok, false)
  if (!parsed.ok) assert.equal(parsed.reason, 'unexpected-topic')
})

function receiptDb(options: { failRun?: boolean, holdInserts?: boolean } = {}) {
  const sql: string[] = []
  const rows = new Map<string, { notification_id: string, outcome: string, processed_at: string }>()
  let insertWaiters: Array<() => void> = []
  let heldPair = false
  const db: EbayReceiptDatabase = {
    prepare(statement) {
      sql.push(statement)
      return {
        bind(...values: unknown[]) {
          return {
            async first<T>() {
              return (rows.get(String(values[0])) ?? null) as T | null
            },
            async run() {
              if (options.failRun) throw new Error('d1-unavailable')
              const apply = () => {
                if (statement.startsWith('INSERT')) {
                  const id = String(values[0])
                  if (rows.has(id)) return { meta: { changes: 0 } }
                  rows.set(id, { notification_id: id, outcome: 'reserved', processed_at: String(values[1]) })
                  return { meta: { changes: 1 } }
                }
                if (statement.startsWith('UPDATE')) {
                  const row = rows.get(String(values[1]))
                  if (!row || row.outcome !== 'reserved') return { meta: { changes: 0 } }
                  row.outcome = String(values[0])
                  return { meta: { changes: 1 } }
                }
                if (statement.startsWith('DELETE')) {
                  const row = rows.get(String(values[0]))
                  if (!row || row.outcome !== 'reserved') return { meta: { changes: 0 } }
                  rows.delete(String(values[0]))
                  return { meta: { changes: 1 } }
                }
                throw new Error('unexpected-sql')
              }
              if (options.holdInserts && !heldPair && statement.startsWith('INSERT')) {
                return new Promise((resolve) => {
                  insertWaiters.push(() => resolve(apply()))
                  if (insertWaiters.length === 2) {
                    heldPair = true
                    const pending = insertWaiters.splice(0, 2)
                    pending[0]()
                    pending[1]()
                  }
                })
              }
              return apply()
            },
          }
        },
      }
    },
  }
  return { db, sql, rows }
}

test('the durable receipt store records the notification id and does not issue a catalog delete', async () => {
  const { db, sql, rows } = receiptDb()
  const store = createD1EbayAccountDeletionStore(db)
  const body = notificationBody()
  const result = await handleEbayAccountDeletion({
    method: 'POST', challengeCode: null, rawBody: body, signatureHeader: sign(body), config: config(), store, now: () => NOW,
  })
  assert.equal(result.status, 204)
  assert.equal(rows.get('11111111-1111-1111-1111-111111111111')?.outcome, 'acknowledged-deletion-not-implemented')
  assert.match(sql.join('\n'), /INSERT INTO ebay_account_deletion_receipts/)
  assert.match(sql.join('\n'), /ON CONFLICT\(notification_id\) DO NOTHING/)
  assert.doesNotMatch(sql.join('\n'), /articles|deals|tools|categories/)
  const again = await handleEbayAccountDeletion({
    method: 'POST', challengeCode: null, rawBody: body, signatureHeader: sign(body), config: config(), store, now: () => NOW,
  })
  assert.equal(again.status, 204)
  assert.equal(rows.size, 1)
})

const SDK_FIXTURE_KID = '9936261a-7d7b-4621-a0f1-96ccb428af49'
const SDK_FIXTURE_PEM = '-----BEGIN PUBLIC KEY-----MFkwEwYHKoZIzj0CAQYIKoZIzj0DAQcDQgAEZhhxXKtR+TOvtDbgTPCkSof02qgBB7IsYOyf76ilExJ/upAa/vKIKheOoCyOpcLmi4t0b4uepb7LLjmMr90FUg==-----END PUBLIC KEY-----'
const SDK_FIXTURE_SIGNATURE = 'eyJhbGciOiJlY2RzYSIsImtpZCI6Ijk5MzYyNjFhLTdkN2ItNDYyMS1hMGYxLTk2Y2NiNDI4YWY0OSIsInNpZ25hdHVyZSI6Ik1FWUNJUUNmeGZJV3V4bVdjSUJRSjljNS9YN2lHREpxczJSQ0dzQkVhQWppbnlycmZBSWhBSVY2d0djVGlCdVY1S0pVaWYyaG9reXJMK1E5c3NIa2FkK214Mm5FRTI1dyIsImRpZ2VzdCI6IlNIQTEifQ=='
const SDK_FIXTURE_BODY = '{"metadata":{"topic":"MARKETPLACE_ACCOUNT_DELETION","schemaVersion":"1.0","deprecated":false},"notification":{"notificationId":"49feeaeb-4982-42d9-a377-9645b8479411_33f7e043-fed8-442b-9d44-791923bd9a6d","eventDate":"2021-03-19T20:43:59.462Z","publishDate":"2021-03-19T20:43:59.679Z","publishAttemptCount":1,"data":{"username":"test_user","userId":"ma8vp1jySJC","eiasToken":"nY+sHZ2PrBmdj6wVnY+sEZ2PrA2dj6wJnY+gAZGEpwmdj6x9nY+seQ=="}}}'

test('a signature in the eBay SDK fixture format is accepted and a mismatched signature is not', async () => {
  const keys = new Map([[SDK_FIXTURE_KID, SDK_FIXTURE_PEM]])
  const store = createMemoryEbayAccountDeletionStore()
  const accepted = await handleEbayAccountDeletion({
    method: 'POST',
    challengeCode: null,
    rawBody: SDK_FIXTURE_BODY,
    signatureHeader: SDK_FIXTURE_SIGNATURE,
    config: config(keys),
    store,
    now: () => NOW,
  })
  assert.equal(accepted.status, 204)
  assert.equal(
    (await store.findReceipt('49feeaeb-4982-42d9-a377-9645b8479411_33f7e043-fed8-442b-9d44-791923bd9a6d'))?.outcome,
    'acknowledged-deletion-not-implemented',
  )
  const spaced = SDK_FIXTURE_BODY.replace('{', '{ ')
  const spacedResult = await handleEbayAccountDeletion({
    method: 'POST',
    challengeCode: null,
    rawBody: spaced,
    signatureHeader: SDK_FIXTURE_SIGNATURE,
    config: config(keys),
    store: createMemoryEbayAccountDeletionStore(),
    now: () => NOW,
  })
  assert.equal(spacedResult.status, 204)
  const tampered = SDK_FIXTURE_BODY.replace('test_user', 'other_user')
  const rejected = await handleEbayAccountDeletion({
    method: 'POST',
    challengeCode: null,
    rawBody: tampered,
    signatureHeader: SDK_FIXTURE_SIGNATURE,
    config: config(keys),
    store: createMemoryEbayAccountDeletionStore(),
    now: () => NOW,
  })
  assert.equal(rejected.status, 412)
})

test('concurrent notifications reserve the id once and do not delete twice', async () => {
  const { db, rows } = receiptDb({ holdInserts: true })
  const inner = createD1EbayAccountDeletionStore(db)
  let deletions = 0
  const store: EbayAccountDeletionStore = {
    findReceipt: (id) => inner.findReceipt(id),
    claimReceipt: (id, at) => inner.claimReceipt(id, at),
    finalizeReceipt: (id, outcome) => inner.finalizeReceipt(id, outcome),
    releaseReceipt: (id) => inner.releaseReceipt(id),
    async deleteLinkedPersonalData() {
      deletions += 1
      await new Promise((resolve) => setTimeout(resolve, 20))
      return { deletedRowCount: 0, implemented: false, limitation: EBAY_ACCOUNT_DELETION_LIMITATION }
    },
  }
  const body = notificationBody()
  const call = () => handleEbayAccountDeletion({
    method: 'POST', challengeCode: null, rawBody: body, signatureHeader: sign(body), config: config(), store, now: () => NOW,
  })
  const [first, second] = await Promise.all([call(), call()])
  assert.deepEqual([first.status, second.status].sort(), [204, 503])
  assert.equal(deletions, 1)
  assert.equal(rows.size, 1)
  const replay = await call()
  assert.equal(replay.status, 204)
  assert.equal(deletions, 1)
})

test('a database failure does not acknowledge the notification or delete twice', async () => {
  const failing = createD1EbayAccountDeletionStore(receiptDb({ failRun: true }).db)
  const body = notificationBody()
  const failed = await handleEbayAccountDeletion({
    method: 'POST', challengeCode: null, rawBody: body, signatureHeader: sign(body), config: config(), store: failing, now: () => NOW,
  })
  assert.equal(failed.status, 500)
  const tracked = trackingStore([
    { id: 'linked', ebayUserId: 'fixture-user-id' },
    { id: 'global', ebayUserId: null },
  ], { failDelete: true })
  const deleteFailed = await handleEbayAccountDeletion({
    method: 'POST', challengeCode: null, rawBody: body, signatureHeader: sign(body), config: config(), store: tracked.store, now: () => NOW,
  })
  assert.equal(deleteFailed.status, 500)
  assert.equal(tracked.deletions(), 0)
  assert.equal(tracked.rows.length, 2)
  assert.equal(tracked.receipts.size, 0)
  const retry = trackingStore(tracked.rows)
  const recovered = await handleEbayAccountDeletion({
    method: 'POST', challengeCode: null, rawBody: body, signatureHeader: sign(body), config: config(), store: retry.store, now: () => NOW,
  })
  assert.equal(recovered.status, 204)
  assert.equal(retry.deletions(), 1)
  assert.deepEqual(retry.rows.map((row) => row.id), ['global'])
})

test('without a D1 binding a valid notification is not acknowledged', async () => {
  const body = notificationBody()
  const result = await handleEbayAccountDeletion({
    method: 'POST', challengeCode: null, rawBody: body, signatureHeader: sign(body), config: config(), store: null, now: () => NOW,
  })
  assert.equal(result.status, 503)
  assert.equal(result.body, null)
  const challenge = await handleEbayAccountDeletion({
    method: 'GET', challengeCode: CHALLENGE, rawBody: '', signatureHeader: null, config: config(), store: null,
  })
  assert.equal(challenge.status, 200)
  assert.equal(challenge.body?.challengeResponse, CHALLENGE_HASH)
})

test('the endpoint module does not call eBay, log secrets, or enable the browse adapter', () => {
  const lib = readFileSync(new URL('../lib/ebay-account-deletion.ts', import.meta.url), 'utf8')
  const route = readFileSync(new URL('../app/api/ebay/account-deletion/route.ts', import.meta.url), 'utf8')
  const doc = readFileSync(new URL('../docs/ebay-account-deletion.md', import.meta.url), 'utf8')
  assert.equal(EBAY_BROWSE_SOURCE_ENABLED, false)
  assert.doesNotMatch(lib, /console\.|fetch\s*\(|api\.ebay\.com/)
  assert.doesNotMatch(route, /console\.|fetch\s*\(|api\.ebay\.com/)
  assert.match(route, /EBAY_ACCOUNT_DELETION_VERIFICATION_TOKEN/)
  assert.match(route, /runtime = 'edge'/)
  assert.match(doc, /https:\/\/trendiverse\.org\/api\/ebay\/account-deletion/)
  assert.match(doc, /acknowledged-deletion-not-implemented/)
  assert.match(doc, new RegExp(EBAY_ACCOUNT_DELETION_LIMITATION))
  assert.match(doc, /no demuestra que no existan datos personales/)
  assert.doesNotMatch(`${lib}\n${route}\n${doc}`, /no-linked-personal-data/)
  assert.doesNotMatch(`${lib}\n${route}\n${doc}`, new RegExp(TOKEN))
  assert.doesNotMatch(`${lib}\n${route}`, /api\.ebay\.com/)
})
