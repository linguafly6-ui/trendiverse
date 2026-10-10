/**
 * Notificaciones de cierre de cuenta de eBay Marketplace.
 *
 * El endpoint responde al challenge y solo acepta un POST cuya firma ECDSA
 * SHA-1 encaje con una clave pública ya configurada. No llama a eBay.
 *
 * Trendiverse no guarda username, userId ni eiasToken. El borrado no toca
 * anuncios, precios ni estadísticas que no estén unidos a esa identidad.
 * Hoy no hay ninguna tabla unida, así que una notificación válida se acepta
 * y deja constancia de que no había datos personales asociados. Eso no
 * equivale a haber borrado el contenido de un vendedor.
 *
 * La firma se comprueba con Web Crypto: ECDSA P-256 y SHA-1, que es la
 * curva de las claves públicas de esta notificación. La firma DER de eBay
 * se convierte al formato raw que exige SubtleCrypto. Otra curva se rechaza.
 */

export const EBAY_ACCOUNT_DELETION_ENDPOINT_PATH = '/api/ebay/account-deletion'

export const EBAY_ACCOUNT_DELETION_LIMITATION = 'no-ebay-user-identity-stored' as const

/** 32 a 80 caracteres: letras, cifras, guion bajo y guion. */
export const EBAY_VERIFICATION_TOKEN_PATTERN = /^[A-Za-z0-9_-]{32,80}$/

const MAX_CHALLENGE_CODE_LENGTH = 128
const MAX_NOTIFICATION_ID_LENGTH = 128
const MAX_IDENTITY_LENGTH = 512
const MAX_BODY_LENGTH = 65_536

export type EbayAccountDeletionOutcome = 'no-linked-personal-data' | 'linked-personal-data-removed'

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
  limitation: typeof EBAY_ACCOUNT_DELETION_LIMITATION | null
}

export interface EbayAccountDeletionStore {
  findReceipt(notificationId: string): Promise<EbayAccountDeletionReceipt | null>
  saveReceipt(receipt: EbayAccountDeletionReceipt): Promise<'created' | 'exists'>
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
    && url.pathname.length > 1
}

export async function ebayChallengeResponse(challengeCode: string, verificationToken: string, endpoint: string): Promise<string> {
  const bytes = bytesToArrayBuffer(new TextEncoder().encode(`${challengeCode}${verificationToken}${endpoint}`))
  const digest = await crypto.subtle.digest('SHA-256', bytes)
  return [...new Uint8Array(digest)].map((byte) => byte.toString(16).padStart(2, '0')).join('')
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
    if (typeof value !== 'string' || !value.includes('BEGIN PUBLIC KEY') || !value.includes('END PUBLIC KEY')) return null
    keys.set(kid, value)
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
    if (decoded.alg !== 'ECDSA' || decoded.digest !== 'SHA1') return false
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
    return crypto.subtle.verify(
      { name: 'ECDSA', hash: 'SHA-1' },
      publicKey,
      bytesToArrayBuffer(signature),
      bytesToArrayBuffer(new TextEncoder().encode(rawBody)),
    )
  } catch {
    return false
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
  return { deletedRowCount: 0, limitation: EBAY_ACCOUNT_DELETION_LIMITATION }
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
const INSERT_RECEIPT = 'INSERT INTO ebay_account_deletion_receipts (notification_id, outcome, processed_at) VALUES (?, ?, ?) ON CONFLICT(notification_id) DO NOTHING'

export function createD1EbayAccountDeletionStore(db: EbayReceiptDatabase): EbayAccountDeletionStore {
  return {
    async findReceipt(notificationId) {
      const row = await db.prepare(SELECT_RECEIPT).bind(notificationId).first<{
        notification_id: string
        outcome: string
        processed_at: string
      }>()
      if (!row) return null
      if (row.outcome !== 'no-linked-personal-data' && row.outcome !== 'linked-personal-data-removed') return null
      return { notificationId: row.notification_id, outcome: row.outcome, processedAt: row.processed_at }
    },
    async saveReceipt(receipt) {
      const result = await db.prepare(INSERT_RECEIPT).bind(receipt.notificationId, receipt.outcome, receipt.processedAt).run()
      return (result.meta?.changes ?? 0) > 0 ? 'created' : 'exists'
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
    async saveReceipt(receipt) {
      if (receipts.has(receipt.notificationId)) return 'exists'
      receipts.set(receipt.notificationId, receipt)
      return 'created'
    },
    async deleteLinkedPersonalData() {
      return unlinkedPersonalDataDeletion()
    },
  }
}

const isolateReceipts = new Map<string, EbayAccountDeletionReceipt>()

export function getIsolateEbayAccountDeletionStore(): EbayAccountDeletionStore {
  return createMemoryEbayAccountDeletionStore(isolateReceipts)
}

export function resetIsolateEbayAccountDeletionStoreForTests(): void {
  isolateReceipts.clear()
}

export async function handleEbayAccountDeletion(input: {
  method: string
  challengeCode: string | null
  rawBody: string
  signatureHeader: string | null
  config: EbayAccountDeletionConfig
  store: EbayAccountDeletionStore
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
  const challengeCode = input.challengeCode?.trim() ?? ''
  if (!challengeCode || challengeCode.length > MAX_CHALLENGE_CODE_LENGTH) return { status: 400, body: null }
  return {
    status: 200,
    body: {
      challengeResponse: await ebayChallengeResponse(challengeCode, input.config.verificationToken, input.config.endpoint),
    },
  }
}

async function handleNotification(input: {
  rawBody: string
  signatureHeader: string | null
  config: EbayAccountDeletionConfig
  store: EbayAccountDeletionStore
  now?: () => string
}): Promise<EbayAccountDeletionHttpResult> {
  if (!input.config.publicKeys) return { status: 503, body: null }
  if (input.rawBody.length > MAX_BODY_LENGTH) return { status: 413, body: null }
  const signatureIsValid = input.signatureHeader
    ? await verifyEbayAccountDeletionSignature(input.rawBody, input.signatureHeader, input.config.publicKeys)
    : false
  if (!signatureIsValid) return { status: 412, body: null }
  const parsed = parseEbayAccountDeletionNotification(input.rawBody)
  if (!parsed.ok) return { status: 400, body: null }
  const existing = await input.store.findReceipt(parsed.notification.notificationId)
  if (existing) return { status: 204, body: null }
  const report = await input.store.deleteLinkedPersonalData(parsed.notification)
  const outcome: EbayAccountDeletionOutcome = report.deletedRowCount > 0
    ? 'linked-personal-data-removed'
    : 'no-linked-personal-data'
  await input.store.saveReceipt({
    notificationId: parsed.notification.notificationId,
    outcome,
    processedAt: (input.now ?? (() => new Date().toISOString()))(),
  })
  return { status: 204, body: null }
}
