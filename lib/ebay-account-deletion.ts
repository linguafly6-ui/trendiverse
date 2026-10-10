/**
 * Notificaciones de cierre de cuenta de eBay Marketplace.
 *
 * El endpoint responde al challenge y solo acepta un POST cuya firma ECDSA
 * SHA-1 encaje con una clave pública ya configurada. No llama a eBay: la
 * clave tiene que pegarse desde getPublicKey. Una clave de prueba no es la
 * clave de producción.
 *
 * El esquema revisado no tiene username, userId ni eiasToken. El POST no
 * borra anuncios, precios ni estadísticas. Aceptar la notificación no
 * demuestra que no existan datos personales en otros almacenes.
 *
 * La firma se comprueba con Web Crypto: ECDSA P-256 y SHA-1. La firma DER
 * del SDK oficial se convierte al formato raw de SubtleCrypto. Otra curva
 * se rechaza. El recibo se reserva con un INSERT atómico antes de cualquier
 * borrado, para que dos POST simultáneos no ejecuten el borrado dos veces.
 */

export const EBAY_ACCOUNT_DELETION_ENDPOINT_PATH = '/api/ebay/account-deletion'

export const EBAY_ACCOUNT_DELETION_LIMITATION = 'no-ebay-user-identity-stored' as const

/** 32 a 80 caracteres: letras, cifras, guion bajo y guion. */
export const EBAY_VERIFICATION_TOKEN_PATTERN = /^[A-Za-z0-9_-]{32,80}$/

const MAX_CHALLENGE_CODE_LENGTH = 128
const MAX_NOTIFICATION_ID_LENGTH = 128
const MAX_IDENTITY_LENGTH = 512
export const EBAY_ACCOUNT_DELETION_MAX_BODY_LENGTH = 65_536
/** Una reserva más antigua que esto se puede retomar. Una reserva reciente sigue en curso. */
export const EBAY_RECEIPT_RESERVATION_LEASE_MS = 120_000

export type EbayAccountDeletionOutcome =
  | 'reserved'
  | 'acknowledged-deletion-not-implemented'
  | 'linked-personal-data-removed'

export interface EbayAccountIdentity {
  username: string | null
  userId: string | null
  eiasToken: string | null
}

export interface EbayAccountDeletionNotification extends EbayAccountIdentity {
  notificationId: string
}

export interface EbayAccountDeletionReceipt {
  notificationId: string
  outcome: EbayAccountDeletionOutcome
  processedAt: string
}

export interface EbayDeletionReport {
  deletedRowCount: number
  /** False en el almacén de producción: no hay un índice de identidades que borrar. */
  implemented: boolean
  limitation: typeof EBAY_ACCOUNT_DELETION_LIMITATION | null
}

export type EbayReceiptClaim = 'created' | 'duplicate' | 'in-progress'

export interface EbayAccountDeletionStore {
  findReceipt(notificationId: string): Promise<EbayAccountDeletionReceipt | null>
  /**
   * Reserva el notificationId con una escritura atómica. Solo un llamador
   * recibe `created`. `duplicate` es un recibo ya cerrado. `in-progress`
   * es una reserva aún abierta.
   */
  claimReceipt(notificationId: string, processedAt: string): Promise<EbayReceiptClaim>
  finalizeReceipt(notificationId: string, outcome: EbayAccountDeletionOutcome): Promise<void>
  releaseReceipt(notificationId: string): Promise<void>
  deleteLinkedPersonalData(identity: EbayAccountIdentity): Promise<EbayDeletionReport>
}

export interface EbayAccountDeletionConfig {
  verificationToken: string | null
  endpoint: string | null
  publicKeys: ReadonlyMap<string, string> | null
}

export interface EbayAccountDeletionHttpResult {
  status: number
  body: { challengeResponse: string } | null
}

export function isValidEbayVerificationToken(token: string): boolean {
  return EBAY_VERIFICATION_TOKEN_PATTERN.test(token)
}

export function isValidEbayAccountDeletionEndpoint(endpoint: string): boolean {
  let url: URL
  try {
    url = new URL(endpoint)
  } catch {
    return false
  }
  return url.protocol === 'https:'
    && url.username === ''
    && url.password === ''
    && url.search === ''
    && url.hash === ''
    && url.pathname === EBAY_ACCOUNT_DELETION_ENDPOINT_PATH
}

export async function ebayChallengeResponse(challengeCode: string, verificationToken: string, endpoint: string): Promise<string> {
  const bytes = bytesToArrayBuffer(new TextEncoder().encode(`${challengeCode}${verificationToken}${endpoint}`))
  const digest = await crypto.subtle.digest('SHA-256', bytes)
  return [...new Uint8Array(digest)].map((byte) => byte.toString(16).padStart(2, '0')).join('')
}

function pemFromPublicKeyEntry(value: unknown): string | null {
  if (typeof value === 'string') {
    return value.includes('BEGIN PUBLIC KEY') && value.includes('END PUBLIC KEY') ? value : null
  }
  if (!value || typeof value !== 'object' || Array.isArray(value)) return null
  const record = value as { key?: unknown, algorithm?: unknown, digest?: unknown }
  if (typeof record.key !== 'string' || !record.key.includes('BEGIN PUBLIC KEY') || !record.key.includes('END PUBLIC KEY')) return null
  if (typeof record.algorithm === 'string' && record.algorithm.toLowerCase() !== 'ecdsa') return null
  if (typeof record.digest === 'string' && record.digest.toUpperCase() !== 'SHA1') return null
  return record.key
}

export function parseEbayNotificationPublicKeys(raw: string): ReadonlyMap<string, string> | null {
  let parsed: unknown
  try {
    parsed = JSON.parse(raw)
  } catch {
    return null
  }
  if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) return null
  const keys = new Map<string, string>()
  for (const [kid, value] of Object.entries(parsed)) {
    if (!kid.trim() || kid.length > 200 || kid !== kid.trim()) return null
    const pem = pemFromPublicKeyEntry(value)
    if (!pem) return null
    keys.set(kid, pem)
  }
  return keys.size > 0 ? keys : null
}

export function readEbayAccountDeletionConfig(input: {
  verificationToken?: string | null
  endpoint?: string | null
  publicKeysJson?: string | null
}): EbayAccountDeletionConfig {
  const token = input.verificationToken?.trim() ?? ''
  const endpoint = input.endpoint?.trim() ?? ''
  const publicKeysJson = input.publicKeysJson?.trim() ?? ''
  return {
    verificationToken: isValidEbayVerificationToken(token) ? token : null,
    endpoint: isValidEbayAccountDeletionEndpoint(endpoint) ? endpoint : null,
    publicKeys: publicKeysJson ? parseEbayNotificationPublicKeys(publicKeysJson) : null,
  }
}

interface EbaySignatureHeader {
  alg: string
  kid: string
  signature: string
  digest: string
}

export async function verifyEbayAccountDeletionSignature(
  rawBody: string,
  signatureHeader: string,
  publicKeys: ReadonlyMap<string, string>,
): Promise<boolean> {
  let header: EbaySignatureHeader
  try {
    const headerBytes = decodeBase64(signatureHeader)
    if (!headerBytes) return false
    const decoded = JSON.parse(new TextDecoder().decode(headerBytes)) as Partial<EbaySignatureHeader>
    if (typeof decoded.alg !== 'string' || decoded.alg.toLowerCase() !== 'ecdsa') return false
    if (typeof decoded.digest !== 'string' || decoded.digest.toUpperCase() !== 'SHA1') return false
    if (typeof decoded.kid !== 'string' || typeof decoded.signature !== 'string' || !decoded.signature) return false
    header = { alg: decoded.alg, kid: decoded.kid, signature: decoded.signature, digest: decoded.digest }
  } catch {
    return false
  }
  const publicKeyPem = publicKeys.get(header.kid)
  if (!publicKeyPem) return false
  try {
    const publicKey = await crypto.subtle.importKey(
      'spki',
      pemToDer(publicKeyPem),
      { name: 'ECDSA', namedCurve: 'P-256' },
      false,
      ['verify'],
    )
    const signature = derSignatureToP1363(decodeBase64(header.signature) ?? new Uint8Array())
    if (!signature) return false
    const signed = await verifySignatureBytes(publicKey, signature, rawBody)
    if (signed) return true
    const compact = compactJson(rawBody)
    if (compact === null || compact === rawBody) return false
    return verifySignatureBytes(publicKey, signature, compact)
  } catch {
    return false
  }
}

async function verifySignatureBytes(publicKey: CryptoKey, signature: Uint8Array, payload: string): Promise<boolean> {
  return crypto.subtle.verify(
    { name: 'ECDSA', hash: 'SHA-1' },
    publicKey,
    bytesToArrayBuffer(signature),
    bytesToArrayBuffer(new TextEncoder().encode(payload)),
  )
}

function compactJson(rawBody: string): string | null {
  try {
    return JSON.stringify(JSON.parse(rawBody))
  } catch {
    return null
  }
}

function bytesToArrayBuffer(bytes: Uint8Array): ArrayBuffer {
  const copy = new ArrayBuffer(bytes.byteLength)
  new Uint8Array(copy).set(bytes)
  return copy
}

function decodeBase64(value: string): Uint8Array | null {
  try {
    const normalized = value.replace(/-/g, '+').replace(/_/g, '/').replace(/\s/g, '')
    const padded = normalized + '='.repeat((4 - (normalized.length % 4)) % 4)
    const binary = atob(padded)
    const bytes = new Uint8Array(binary.length)
    for (let index = 0; index < binary.length; index += 1) bytes[index] = binary.charCodeAt(index)
    return bytes
  } catch {
    return null
  }
}

function pemToDer(pem: string): ArrayBuffer {
  const body = pem.replace(/-----BEGIN PUBLIC KEY-----/g, '').replace(/-----END PUBLIC KEY-----/g, '').replace(/\s/g, '')
  const bytes = decodeBase64(body)
  if (!bytes) throw new Error('invalid-public-key')
  return bytesToArrayBuffer(bytes)
}

function derSignatureToP1363(der: Uint8Array): Uint8Array | null {
  if (der.length < 8 || der[0] !== 0x30) return null
  let offset = 2
  if (der[1] & 0x80) offset = 2 + (der[1] & 0x7f)
  const readInteger = (): Uint8Array | null => {
    if (der[offset] !== 0x02) return null
    const length = der[offset + 1]
    const start = offset + 2
    offset = start + length
    if (offset > der.length) return null
    return fixedInteger(der.slice(start, start + length), 32)
  }
  const r = readInteger()
  const s = readInteger()
  if (!r || !s) return null
  const raw = new Uint8Array(64)
  raw.set(r, 0)
  raw.set(s, 32)
  return raw
}

function fixedInteger(value: Uint8Array, size: number): Uint8Array | null {
  let start = 0
  if (value[0] === 0x00) start = 1
  const trimmed = value.slice(start)
  if (trimmed.length > size) return null
  const out = new Uint8Array(size)
  out.set(trimmed, size - trimmed.length)
  return out
}

export type EbayNotificationParseResult =
  | { ok: true, notification: EbayAccountDeletionNotification }
  | { ok: false, reason: 'invalid-json' | 'unexpected-topic' | 'missing-notification-id' | 'missing-identity' }

export function parseEbayAccountDeletionNotification(rawBody: string): EbayNotificationParseResult {
  let parsed: unknown
  try {
    parsed = JSON.parse(rawBody)
  } catch {
    return { ok: false, reason: 'invalid-json' }
  }
  if (!parsed || typeof parsed !== 'object') return { ok: false, reason: 'invalid-json' }
  const root = parsed as {
    metadata?: { topic?: unknown }
    notification?: { notificationId?: unknown, data?: Record<string, unknown> }
  }
  if (root.metadata?.topic !== 'MARKETPLACE_ACCOUNT_DELETION') return { ok: false, reason: 'unexpected-topic' }
  const notificationId = root.notification?.notificationId
  if (typeof notificationId !== 'string' || !notificationId.trim() || notificationId.length > MAX_NOTIFICATION_ID_LENGTH || notificationId !== notificationId.trim()) {
    return { ok: false, reason: 'missing-notification-id' }
  }
  const data = root.notification?.data
  const username = optionalIdentity(data?.username)
  const userId = optionalIdentity(data?.userId)
  const eiasToken = optionalIdentity(data?.eiasToken)
  if (!username && !userId && !eiasToken) return { ok: false, reason: 'missing-identity' }
  return { ok: true, notification: { notificationId, username, userId, eiasToken } }
}

function optionalIdentity(value: unknown): string | null {
  if (typeof value !== 'string') return null
  const trimmed = value.trim()
  if (!trimmed || trimmed.length > MAX_IDENTITY_LENGTH) return null
  return trimmed
}

export function unlinkedPersonalDataDeletion(): EbayDeletionReport {
  return { deletedRowCount: 0, implemented: false, limitation: EBAY_ACCOUNT_DELETION_LIMITATION }
}

export interface EbayReceiptDatabase {
  prepare(sql: string): {
    bind(...values: unknown[]): {
      first<T>(): Promise<T | null>
      run(): Promise<{ meta?: { changes?: number } }>
    }
  }
}

const SELECT_RECEIPT = 'SELECT notification_id, outcome, processed_at FROM ebay_account_deletion_receipts WHERE notification_id = ?'
const INSERT_RECEIPT = 'INSERT INTO ebay_account_deletion_receipts (notification_id, outcome, processed_at) VALUES (?, \'reserved\', ?) ON CONFLICT(notification_id) DO NOTHING'
const RECLAIM_RECEIPT = 'UPDATE ebay_account_deletion_receipts SET processed_at = ? WHERE notification_id = ? AND outcome = \'reserved\' AND processed_at <= ?'
const FINALIZE_RECEIPT = 'UPDATE ebay_account_deletion_receipts SET outcome = ? WHERE notification_id = ? AND outcome = \'reserved\''
const RELEASE_RECEIPT = 'DELETE FROM ebay_account_deletion_receipts WHERE notification_id = ? AND outcome = \'reserved\''

export function ebayReservationIsStale(processedAt: string, nowIso: string): boolean {
  const nowMs = Date.parse(nowIso)
  const existingMs = Date.parse(processedAt)
  if (Number.isNaN(nowMs) || Number.isNaN(existingMs)) return false
  return nowMs - existingMs >= EBAY_RECEIPT_RESERVATION_LEASE_MS
}

function staleBefore(nowIso: string): string | null {
  const nowMs = Date.parse(nowIso)
  if (Number.isNaN(nowMs)) return null
  return new Date(nowMs - EBAY_RECEIPT_RESERVATION_LEASE_MS).toISOString()
}

const FINAL_OUTCOMES = new Set<EbayAccountDeletionOutcome>([
  'acknowledged-deletion-not-implemented',
  'linked-personal-data-removed',
])

function knownOutcome(value: string): EbayAccountDeletionOutcome | null {
  if (value === 'reserved' || value === 'acknowledged-deletion-not-implemented' || value === 'linked-personal-data-removed') return value
  return null
}

async function confirmedChanges(result: { meta?: { changes?: number } }): Promise<number> {
  const changes = result.meta?.changes
  if (typeof changes !== 'number') throw new Error('receipt-write-unconfirmed')
  return changes
}

export function createD1EbayAccountDeletionStore(db: EbayReceiptDatabase): EbayAccountDeletionStore {
  return {
    async findReceipt(notificationId) {
      const row = await db.prepare(SELECT_RECEIPT).bind(notificationId).first<{
        notification_id: string
        outcome: string
        processed_at: string
      }>()
      if (!row) return null
      const outcome = knownOutcome(row.outcome)
      if (!outcome) return null
      return { notificationId: row.notification_id, outcome, processedAt: row.processed_at }
    },
    async claimReceipt(notificationId, processedAt) {
      const inserted = await confirmedChanges(
        await db.prepare(INSERT_RECEIPT).bind(notificationId, processedAt).run(),
      )
      if (inserted > 0) return 'created'
      const existing = await this.findReceipt(notificationId)
      if (existing && FINAL_OUTCOMES.has(existing.outcome)) return 'duplicate'
      const cutoff = staleBefore(processedAt)
      if (!existing || existing.outcome !== 'reserved' || !cutoff || !ebayReservationIsStale(existing.processedAt, processedAt)) {
        return 'in-progress'
      }
      const reclaimed = await confirmedChanges(
        await db.prepare(RECLAIM_RECEIPT).bind(processedAt, notificationId, cutoff).run(),
      )
      return reclaimed > 0 ? 'created' : 'in-progress'
    },
    async finalizeReceipt(notificationId, outcome) {
      if (!FINAL_OUTCOMES.has(outcome)) throw new Error('invalid-receipt-outcome')
      const updated = await confirmedChanges(await db.prepare(FINALIZE_RECEIPT).bind(outcome, notificationId).run())
      if (updated < 1) throw new Error('receipt-not-reserved')
    },
    async releaseReceipt(notificationId) {
      await confirmedChanges(await db.prepare(RELEASE_RECEIPT).bind(notificationId).run())
    },
    async deleteLinkedPersonalData() {
      return unlinkedPersonalDataDeletion()
    },
  }
}

export function createMemoryEbayAccountDeletionStore(
  receipts = new Map<string, EbayAccountDeletionReceipt>(),
): EbayAccountDeletionStore {
  return {
    async findReceipt(notificationId) {
      return receipts.get(notificationId) ?? null
    },
    async claimReceipt(notificationId, processedAt) {
      const existing = receipts.get(notificationId)
      if (existing && FINAL_OUTCOMES.has(existing.outcome)) return 'duplicate'
      if (existing?.outcome === 'reserved' && ebayReservationIsStale(existing.processedAt, processedAt)) {
        receipts.set(notificationId, { ...existing, processedAt })
        return 'created'
      }
      if (existing) return 'in-progress'
      receipts.set(notificationId, { notificationId, outcome: 'reserved', processedAt })
      return 'created'
    },
    async finalizeReceipt(notificationId, outcome) {
      if (!FINAL_OUTCOMES.has(outcome)) throw new Error('invalid-receipt-outcome')
      const existing = receipts.get(notificationId)
      if (!existing || existing.outcome !== 'reserved') throw new Error('receipt-not-reserved')
      receipts.set(notificationId, { ...existing, outcome })
    },
    async releaseReceipt(notificationId) {
      const existing = receipts.get(notificationId)
      if (existing?.outcome === 'reserved') receipts.delete(notificationId)
    },
    async deleteLinkedPersonalData() {
      return unlinkedPersonalDataDeletion()
    },
  }
}

export async function handleEbayAccountDeletion(input: {
  method: string
  challengeCode: string | null
  rawBody: string
  signatureHeader: string | null
  config: EbayAccountDeletionConfig
  store: EbayAccountDeletionStore | null
  now?: () => string
}): Promise<EbayAccountDeletionHttpResult> {
  if (input.method === 'GET') return await handleChallenge(input)
  if (input.method === 'POST') return handleNotification(input)
  return { status: 405, body: null }
}

async function handleChallenge(input: {
  challengeCode: string | null
  config: EbayAccountDeletionConfig
}): Promise<EbayAccountDeletionHttpResult> {
  if (!input.config.verificationToken || !input.config.endpoint) return { status: 503, body: null }
  const challengeCode = input.challengeCode ?? ''
  if (!challengeCode || challengeCode.length > MAX_CHALLENGE_CODE_LENGTH) return { status: 400, body: null }
  return {
    status: 200,
    body: {
      challengeResponse: await ebayChallengeResponse(challengeCode, input.config.verificationToken, input.config.endpoint),
    },
  }
}

function outcomeForReport(report: EbayDeletionReport): EbayAccountDeletionOutcome {
  if (report.implemented && report.deletedRowCount > 0) return 'linked-personal-data-removed'
  return 'acknowledged-deletion-not-implemented'
}

async function handleNotification(input: {
  rawBody: string
  signatureHeader: string | null
  config: EbayAccountDeletionConfig
  store: EbayAccountDeletionStore | null
  now?: () => string
}): Promise<EbayAccountDeletionHttpResult> {
  if (!input.config.publicKeys) return { status: 503, body: null }
  if (input.rawBody.length > EBAY_ACCOUNT_DELETION_MAX_BODY_LENGTH) return { status: 413, body: null }
  const signatureIsValid = input.signatureHeader
    ? await verifyEbayAccountDeletionSignature(input.rawBody, input.signatureHeader, input.config.publicKeys)
    : false
  if (!signatureIsValid) return { status: 412, body: null }
  const parsed = parseEbayAccountDeletionNotification(input.rawBody)
  if (!parsed.ok) return { status: 400, body: null }
  if (!input.store) return { status: 503, body: null }
  const processedAt = (input.now ?? (() => new Date().toISOString()))()
  let claim: EbayReceiptClaim
  try {
    claim = await input.store.claimReceipt(parsed.notification.notificationId, processedAt)
  } catch {
    return { status: 500, body: null }
  }
  if (claim === 'duplicate') return { status: 204, body: null }
  if (claim === 'in-progress') return { status: 503, body: null }
  let deleted = false
  try {
    const report = await input.store.deleteLinkedPersonalData(parsed.notification)
    deleted = true
    await input.store.finalizeReceipt(parsed.notification.notificationId, outcomeForReport(report))
    return { status: 204, body: null }
  } catch {
    if (!deleted) {
      try {
        await input.store.releaseReceipt(parsed.notification.notificationId)
      } catch {
        return { status: 500, body: null }
      }
    }
    return { status: 500, body: null }
  }
}
