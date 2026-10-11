/**
 * Clave pública de las notificaciones de eBay.
 *
 * El `kid` sale de `X-EBAY-SIGNATURE`. Si no hay una copia vigente en memoria,
 * se pide a getPublicKey con un token de aplicación. La copia dura una hora.
 * Este módulo no borra datos de usuarios y no elige el host: solo habla con
 * api.ebay.com.
 */

export const EBAY_NOTIFICATION_API_ORIGIN = 'https://api.ebay.com'
export const EBAY_OAUTH_TOKEN_URL = `${EBAY_NOTIFICATION_API_ORIGIN}/identity/v1/oauth2/token`
export const EBAY_PUBLIC_KEY_URL_PREFIX = `${EBAY_NOTIFICATION_API_ORIGIN}/commerce/notification/v1/public_key/`
export const EBAY_NOTIFICATION_OAUTH_SCOPE = 'https://api.ebay.com/oauth/api_scope'
export const EBAY_PUBLIC_KEY_CACHE_TTL_MS = 60 * 60 * 1000
export const EBAY_PUBLIC_KEY_ID_PATTERN = /^[A-Za-z0-9_-]{1,128}$/

const TOKEN_SKEW_MS = 60_000
const MAX_CACHED_PUBLIC_KEYS = 8
const MAX_RESPONSE_BYTES = 16_384
const REQUEST_TIMEOUT_MS = 10_000
const CREDENTIAL_PATTERN = /^[\x21-\x7E]{1,200}$/
const TOKEN_PATTERN = /^[\x21-\x7E]{1,4096}$/

export function isValidEbayPublicKeyId(keyId: string): boolean {
  return EBAY_PUBLIC_KEY_ID_PATTERN.test(keyId)
}

export type EbayPublicKeyFetchResult =
  | { status: 'ok', pem: string }
  | { status: 'unknown' }
  | { status: 'unavailable' }

export type EbayPublicKeyResolution =
  | { status: 'ok', pem: string, fromCache: boolean }
  | { status: 'unknown' }
  | { status: 'unavailable' }

export interface EbayPublicKeyLookup {
  resolve(keyId: string, options?: { refresh?: boolean }): Promise<EbayPublicKeyResolution>
}

export interface EbayCachedPublicKey {
  pem: string
  storedAtMs: number
}

export interface EbayPublicKeyMemory {
  keys: Map<string, EbayCachedPublicKey>
  token: { current: { token: string, expiresAtMs: number } | null }
}

export function createEbayPublicKeyMemory(): EbayPublicKeyMemory {
  return { keys: new Map(), token: { current: null } }
}

type EbayFetch = (input: string, init: RequestInit) => Promise<Response>

interface LookupSession {
  clientId: string
  clientSecret: string
  lookup: EbayPublicKeyLookup
}

const sessions = new WeakMap<EbayPublicKeyMemory, LookupSession>()

const unavailableLookup: EbayPublicKeyLookup = {
  async resolve() {
    return { status: 'unavailable' }
  },
}

export function readEbayNotificationCredentials(input: {
  clientId?: string | null
  clientSecret?: string | null
}): { status: 'absent' } | { status: 'invalid' } | { status: 'ok', clientId: string, clientSecret: string } {
  const clientId = credentialField(input.clientId)
  const clientSecret = credentialField(input.clientSecret)
  if (clientId === null || clientSecret === null) return { status: 'invalid' }
  if (!clientId && !clientSecret) return { status: 'absent' }
  if (!CREDENTIAL_PATTERN.test(clientId) || !CREDENTIAL_PATTERN.test(clientSecret)) return { status: 'invalid' }
  return { status: 'ok', clientId, clientSecret }
}

function credentialField(value: string | null | undefined): string | null {
  if (value == null) return ''
  if (value !== value.trim() || /\s/.test(value)) return null
  return value
}

export function createEbayPublicKeyLookup(options: {
  fetchPublicKey: (keyId: string) => Promise<EbayPublicKeyFetchResult>
  now?: () => number
  ttlMs?: number
  cache?: Map<string, EbayCachedPublicKey>
}): EbayPublicKeyLookup {
  const cache = options.cache ?? new Map<string, EbayCachedPublicKey>()
  const now = options.now ?? (() => Date.now())
  const ttlMs = options.ttlMs ?? EBAY_PUBLIC_KEY_CACHE_TTL_MS
  const inflight = new Map<string, Promise<EbayPublicKeyResolution>>()

  const remember = (keyId: string, pem: string) => {
    cache.set(keyId, { pem, storedAtMs: now() })
    if (cache.size <= MAX_CACHED_PUBLIC_KEYS) return
    let oldestId: string | null = null
    let oldestAt = Number.POSITIVE_INFINITY
    for (const [id, entry] of cache) {
      if (id === keyId) continue
      if (entry.storedAtMs <= oldestAt) {
        oldestAt = entry.storedAtMs
        oldestId = id
      }
    }
    if (oldestId) cache.delete(oldestId)
  }

  const load = (keyId: string, refresh: boolean): Promise<EbayPublicKeyResolution> => {
    const flightKey = `${refresh ? 'refresh' : 'fetch'}:${keyId}`
    const existing = inflight.get(flightKey)
    if (existing) return existing
    const pending = Promise.resolve()
      .then(() => options.fetchPublicKey(keyId))
      .then((result): EbayPublicKeyResolution => {
        if (result.status === 'ok') {
          remember(keyId, result.pem)
          return { status: 'ok', pem: result.pem, fromCache: false }
        }
        if (result.status === 'unknown') cache.delete(keyId)
        return result
      })
      .catch((): EbayPublicKeyResolution => ({ status: 'unavailable' }))
    inflight.set(flightKey, pending)
    void pending.finally(() => {
      if (inflight.get(flightKey) === pending) inflight.delete(flightKey)
    })
    return pending
  }

  return {
    async resolve(keyId, call) {
      if (!isValidEbayPublicKeyId(keyId)) return { status: 'unavailable' }
      const refresh = call?.refresh === true
      if (!refresh) {
        const hit = cache.get(keyId)
        if (hit) {
          const age = now() - hit.storedAtMs
          if (age >= 0 && age < ttlMs) return { status: 'ok', pem: hit.pem, fromCache: true }
          cache.delete(keyId)
        }
      }
      return load(keyId, refresh)
    },
  }
}

export function createEbayNotificationPublicKeyLookup(options: {
  clientId: string
  clientSecret: string
  memory?: EbayPublicKeyMemory
  fetchImpl?: EbayFetch
  now?: () => number
}): EbayPublicKeyLookup {
  const memory = options.memory ?? createEbayPublicKeyMemory()
  const fetchImpl = options.fetchImpl ?? ((input, init) => fetch(input, init))
  const now = options.now ?? (() => Date.now())
  const request = createEbayPublicKeyRequest({
    clientId: options.clientId,
    clientSecret: options.clientSecret,
    fetchImpl,
    now,
    tokenCache: memory.token,
  })
  return createEbayPublicKeyLookup({
    cache: memory.keys,
    now,
    fetchPublicKey: request,
  })
}

export function ebayNotificationPublicKeyLookupFromEnv(
  env: { EBAY_NOTIFICATION_CLIENT_ID?: string | null, EBAY_NOTIFICATION_CLIENT_SECRET?: string | null },
  options: { memory: EbayPublicKeyMemory, fetchImpl?: EbayFetch, now?: () => number },
): EbayPublicKeyLookup | null {
  const credentials = readEbayNotificationCredentials({
    clientId: env.EBAY_NOTIFICATION_CLIENT_ID,
    clientSecret: env.EBAY_NOTIFICATION_CLIENT_SECRET,
  })
  if (credentials.status === 'absent') return null
  if (credentials.status === 'invalid') {
    options.memory.keys.clear()
    options.memory.token.current = null
    sessions.delete(options.memory)
    return unavailableLookup
  }
  const current = sessions.get(options.memory)
  if (current && current.clientId === credentials.clientId && current.clientSecret === credentials.clientSecret) {
    return current.lookup
  }
  options.memory.keys.clear()
  options.memory.token.current = null
  const lookup = createEbayNotificationPublicKeyLookup({
    clientId: credentials.clientId,
    clientSecret: credentials.clientSecret,
    memory: options.memory,
    fetchImpl: options.fetchImpl,
    now: options.now,
  })
  sessions.set(options.memory, {
    clientId: credentials.clientId,
    clientSecret: credentials.clientSecret,
    lookup,
  })
  return lookup
}

export function createEbayPublicKeyRequest(options: {
  clientId: string
  clientSecret: string
  fetchImpl: EbayFetch
  now: () => number
  tokenCache: EbayPublicKeyMemory['token']
}): (keyId: string) => Promise<EbayPublicKeyFetchResult> {
  let tokenFlight: Promise<string | null> | null = null

  const requestToken = (): Promise<string | null> => {
    if (tokenFlight) return tokenFlight
    const flight = fetchApplicationToken(options).finally(() => {
      if (tokenFlight === flight) tokenFlight = null
    })
    tokenFlight = flight
    return flight
  }

  const token = async (force: boolean): Promise<string | null> => {
    if (force) options.tokenCache.current = null
    const cached = options.tokenCache.current
    if (!force && cached && options.now() < cached.expiresAtMs) return cached.token
    return requestToken()
  }

  return async (keyId) => {
    const url = publicKeyUrl(keyId)
    if (!url) return { status: 'unavailable' }
    const firstToken = await token(false)
    if (!firstToken) return { status: 'unavailable' }
    const first = await callPublicKey(options.fetchImpl, url, firstToken)
    if (first === 'unauthorized') {
      const secondToken = await token(true)
      if (!secondToken || secondToken === firstToken) return { status: 'unavailable' }
      const second = await callPublicKey(options.fetchImpl, url, secondToken)
      if (second === 'unauthorized') return { status: 'unavailable' }
      return second
    }
    return first
  }
}

function publicKeyUrl(keyId: string): string | null {
  if (!isValidEbayPublicKeyId(keyId)) return null
  return `${EBAY_PUBLIC_KEY_URL_PREFIX}${encodeURIComponent(keyId)}`
}

async function fetchApplicationToken(options: {
  clientId: string
  clientSecret: string
  fetchImpl: EbayFetch
  now: () => number
  tokenCache: EbayPublicKeyMemory['token']
}): Promise<string | null> {
  let response: Response
  try {
    response = await options.fetchImpl(EBAY_OAUTH_TOKEN_URL, {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        Authorization: `Basic ${basicCredentials(options.clientId, options.clientSecret)}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        grant_type: 'client_credentials',
        scope: EBAY_NOTIFICATION_OAUTH_SCOPE,
      }),
      redirect: 'manual',
      cache: 'no-store',
      signal: timeoutSignal(),
    })
  } catch {
    return null
  }
  const token = await readApplicationToken(response, options.now())
  if (!token) {
    options.tokenCache.current = null
    return null
  }
  options.tokenCache.current = token
  return token.token
}

async function callPublicKey(
  fetchImpl: EbayFetch,
  url: string,
  token: string,
): Promise<EbayPublicKeyFetchResult | 'unauthorized'> {
  let response: Response
  try {
    response = await fetchImpl(url, {
      method: 'GET',
      headers: {
        Accept: 'application/json',
        Authorization: `Bearer ${token}`,
      },
      redirect: 'manual',
      cache: 'no-store',
      signal: timeoutSignal(),
    })
  } catch {
    return { status: 'unavailable' }
  }
  return classifyPublicKeyResponse(response)
}

async function classifyPublicKeyResponse(response: Response): Promise<EbayPublicKeyFetchResult | 'unauthorized'> {
  if (response.status === 301 || response.status === 302 || response.status === 303 || response.status === 307 || response.status === 308) {
    return { status: 'unavailable' }
  }
  if (response.status === 401 || response.status === 403) return 'unauthorized'
  const text = await readLimitedText(response)
  const parsed = text === null ? null : parseJson(text)
  if (response.status === 404 || (response.status === 400 && parsed?.ok && hasInvalidKeyId(parsed.value))) {
    return { status: 'unknown' }
  }
  if (response.status !== 200 || !parsed?.ok || !isJsonContentType(response.headers.get('content-type'))) {
    return { status: 'unavailable' }
  }
  const pem = await publicKeyPemFromPayload(parsed.value)
  if (!pem) return { status: 'unavailable' }
  return { status: 'ok', pem }
}

function hasInvalidKeyId(value: unknown): boolean {
  if (!value || typeof value !== 'object') return false
  const errors = (value as { errors?: unknown }).errors
  if (!Array.isArray(errors)) return false
  return errors.some((error) => {
    if (!error || typeof error !== 'object') return false
    const id = (error as { errorId?: unknown }).errorId
    return id === 195001 || id === '195001'
  })
}

async function readApplicationToken(
  response: Response,
  nowMs: number,
): Promise<{ token: string, expiresAtMs: number } | null> {
  if (response.status !== 200 || !isJsonContentType(response.headers.get('content-type'))) return null
  const text = await readLimitedText(response)
  if (text === null) return null
  const parsed = parseJson(text)
  if (!parsed.ok || !parsed.value || typeof parsed.value !== 'object') return null
  const record = parsed.value as { access_token?: unknown, expires_in?: unknown }
  if (typeof record.access_token !== 'string' || !TOKEN_PATTERN.test(record.access_token)) return null
  if (typeof record.expires_in !== 'number' || !Number.isInteger(record.expires_in) || record.expires_in <= 0 || record.expires_in > 86_400) {
    return null
  }
  const ttlMs = Math.max(0, record.expires_in * 1000 - TOKEN_SKEW_MS)
  return { token: record.access_token, expiresAtMs: nowMs + ttlMs }
}

async function publicKeyPemFromPayload(value: unknown): Promise<string | null> {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return null
  const record = value as { key?: unknown, algorithm?: unknown, digest?: unknown }
  if (typeof record.algorithm !== 'string' || record.algorithm.toLowerCase() !== 'ecdsa') return null
  if (typeof record.digest !== 'string' || record.digest.toUpperCase() !== 'SHA1') return null
  if (typeof record.key !== 'string' || record.key.length > 8_192) return null
  if (!record.key.includes('BEGIN PUBLIC KEY') || !record.key.includes('END PUBLIC KEY')) return null
  if (record.key.includes('PRIVATE')) return null
  try {
    await crypto.subtle.importKey(
      'spki',
      pemToDer(record.key),
      { name: 'ECDSA', namedCurve: 'P-256' },
      false,
      ['verify'],
    )
  } catch {
    return null
  }
  return record.key
}

function pemToDer(pem: string): ArrayBuffer {
  const body = pem.replace(/-----BEGIN PUBLIC KEY-----/g, '').replace(/-----END PUBLIC KEY-----/g, '').replace(/\s/g, '')
  const bytes = decodeBase64(body)
  if (!bytes) throw new Error('invalid-public-key')
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

function basicCredentials(clientId: string, clientSecret: string): string {
  const bytes = new TextEncoder().encode(`${clientId}:${clientSecret}`)
  let binary = ''
  for (const byte of bytes) binary += String.fromCharCode(byte)
  return btoa(binary)
}

function isJsonContentType(value: string | null): boolean {
  if (!value) return false
  return value.split(';', 1)[0].trim().toLowerCase() === 'application/json'
}

function parseJson(text: string): { ok: true, value: unknown } | { ok: false } {
  try {
    return { ok: true, value: JSON.parse(text) as unknown }
  } catch {
    return { ok: false }
  }
}

async function readLimitedText(response: Response): Promise<string | null> {
  const declared = Number(response.headers.get('content-length'))
  if (Number.isFinite(declared) && (declared < 0 || declared > MAX_RESPONSE_BYTES)) return null
  const body = response.body
  if (!body) return null
  const reader = body.getReader()
  const chunks: Uint8Array[] = []
  let total = 0
  try {
    while (true) {
      const { done, value } = await reader.read()
      if (done) break
      if (!value) continue
      total += value.byteLength
      if (total > MAX_RESPONSE_BYTES) {
        await reader.cancel()
        return null
      }
      chunks.push(value)
    }
  } catch {
    return null
  }
  const merged = new Uint8Array(total)
  let offset = 0
  for (const chunk of chunks) {
    merged.set(chunk, offset)
    offset += chunk.byteLength
  }
  return new TextDecoder().decode(merged)
}

function timeoutSignal(): AbortSignal | undefined {
  if (typeof AbortSignal !== 'undefined' && typeof AbortSignal.timeout === 'function') {
    return AbortSignal.timeout(REQUEST_TIMEOUT_MS)
  }
  return undefined
}
