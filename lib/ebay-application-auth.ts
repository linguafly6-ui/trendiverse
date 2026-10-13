/**
 * Token de aplicación de eBay (client credentials).
 *
 * La copia vive solo en memoria y se renueva un minuto antes de caducar.
 * No lee el entorno, no escribe el token en disco y no lo registra.
 * El adapter de segunda mano no usa este módulo.
 */

export const EBAY_API_ORIGIN = 'https://api.ebay.com'
export const EBAY_OAUTH_TOKEN_URL = `${EBAY_API_ORIGIN}/identity/v1/oauth2/token`
export const EBAY_APPLICATION_OAUTH_SCOPE = 'https://api.ebay.com/oauth/api_scope'
export const EBAY_APPLICATION_TOKEN_SKEW_MS = 60_000
export const EBAY_APPLICATION_REQUEST_TIMEOUT_MS = 10_000
export const EBAY_APPLICATION_TOKEN_MAX_BYTES = 16_384
export const EBAY_APPLICATION_MAX_EXPIRES_IN_SECONDS = 86_400

const CREDENTIAL_PATTERN = /^[\x21-\x7E]{1,200}$/
const TOKEN_PATTERN = /^[\x21-\x7E]{1,4096}$/

export type EbayFetch = (input: string, init: RequestInit) => Promise<Response>

export interface EbayApplicationToken {
  token: string
  expiresAtMs: number
}

export interface EbayApplicationTokenMemory {
  current: EbayApplicationToken | null
}

export function createEbayApplicationTokenMemory(): EbayApplicationTokenMemory {
  return { current: null }
}

export type EbayApplicationCredentialRead =
  | { status: 'absent' }
  | { status: 'invalid' }
  | { status: 'ok', clientId: string, clientSecret: string }

export function readEbayApplicationCredentials(input: {
  clientId?: string | null
  clientSecret?: string | null
}): EbayApplicationCredentialRead {
  const clientId = credentialField(input.clientId)
  const clientSecret = credentialField(input.clientSecret)
  if (clientId === null || clientSecret === null) return { status: 'invalid' }
  if (!clientId && !clientSecret) return { status: 'absent' }
  if (!CREDENTIAL_PATTERN.test(clientId) || !CREDENTIAL_PATTERN.test(clientSecret)) return { status: 'invalid' }
  return { status: 'ok', clientId, clientSecret }
}

export function isEbayApplicationToken(value: string): boolean {
  return TOKEN_PATTERN.test(value)
}

export function isEbayJsonContentType(value: string | null): boolean {
  if (!value) return false
  return value.split(';', 1)[0].trim().toLowerCase() === 'application/json'
}

export function ebayRequestSignal(timeoutMs: number): AbortSignal | undefined {
  if (!Number.isFinite(timeoutMs) || timeoutMs <= 0) return undefined
  if (typeof AbortSignal !== 'undefined' && typeof AbortSignal.timeout === 'function') {
    return AbortSignal.timeout(timeoutMs)
  }
  return undefined
}

export async function readEbayLimitedJson(
  response: Response,
  maxBytes: number,
): Promise<{ ok: true, value: unknown } | { ok: false }> {
  if (!isEbayJsonContentType(response.headers.get('content-type'))) return { ok: false }
  const text = await readLimitedText(response, maxBytes)
  if (text === null) return { ok: false }
  try {
    return { ok: true, value: JSON.parse(text) as unknown }
  } catch {
    return { ok: false }
  }
}

export type EbayAccessTokenResult =
  | { status: 'ok', token: string, fromCache: boolean }
  | { status: 'unauthorized' }
  | { status: 'unavailable' }

export interface EbayApplicationAuth {
  getAccessToken(options?: { force?: boolean }): Promise<EbayAccessTokenResult>
}

export function createEbayApplicationAuth(options: {
  clientId: string
  clientSecret: string
  memory?: EbayApplicationTokenMemory
  fetchImpl?: EbayFetch
  now?: () => number
  timeoutMs?: number
}): EbayApplicationAuth {
  const memory = options.memory ?? createEbayApplicationTokenMemory()
  const fetchImpl = options.fetchImpl ?? ((input, init) => fetch(input, init))
  const now = options.now ?? (() => Date.now())
  const timeoutMs = boundedTimeout(options.timeoutMs)
  const credentials = readEbayApplicationCredentials({
    clientId: options.clientId,
    clientSecret: options.clientSecret,
  })

  let generation = 0
  let flight: { generation: number, pending: Promise<EbayAccessTokenResult> } | null = null

  const fetchToken = async (generationAtStart: number): Promise<EbayAccessTokenResult> => {
    if (credentials.status !== 'ok') return { status: 'unavailable' }
    let response: Response
    try {
      response = await fetchImpl(EBAY_OAUTH_TOKEN_URL, {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          Authorization: `Basic ${basicCredentials(credentials.clientId, credentials.clientSecret)}`,
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          grant_type: 'client_credentials',
          scope: EBAY_APPLICATION_OAUTH_SCOPE,
        }),
        redirect: 'manual',
        cache: 'no-store',
        signal: ebayRequestSignal(timeoutMs),
      })
    } catch {
      return { status: 'unavailable' }
    }
    if (isRedirect(response.status) || (response.status !== 200 && response.status !== 401 && response.status !== 403)) {
      await cancelBody(response)
      return { status: 'unavailable' }
    }
    if (response.status === 401 || response.status === 403) {
      await cancelBody(response)
      if (generation === generationAtStart) memory.current = null
      return { status: 'unauthorized' }
    }
    const parsed = await readEbayLimitedJson(response, EBAY_APPLICATION_TOKEN_MAX_BYTES)
    const stored = parsed.ok ? tokenFromPayload(parsed.value, now()) : null
    if (!stored) {
      if (generation === generationAtStart) memory.current = null
      return { status: 'unavailable' }
    }
    if (generation === generationAtStart) memory.current = stored
    return { status: 'ok', token: stored.token, fromCache: false }
  }

  const load = (force: boolean): Promise<EbayAccessTokenResult> => {
    if (credentials.status !== 'ok') return Promise.resolve({ status: 'unavailable' })
    if (force) {
      memory.current = null
      generation += 1
    }
    const generationAtStart = generation
    if (!force) {
      const cached = memory.current
      if (cached && now() < cached.expiresAtMs && isEbayApplicationToken(cached.token)) {
        return Promise.resolve({ status: 'ok', token: cached.token, fromCache: true })
      }
    }
    if (flight && flight.generation === generationAtStart) return flight.pending
    const pending = fetchToken(generationAtStart).finally(() => {
      if (flight?.pending === pending) flight = null
    })
    flight = { generation: generationAtStart, pending }
    return pending
  }

  return {
    getAccessToken(call) {
      return load(call?.force === true)
    },
  }
}

function boundedTimeout(value: number | undefined): number {
  if (typeof value !== 'number' || !Number.isFinite(value) || value <= 0) return EBAY_APPLICATION_REQUEST_TIMEOUT_MS
  return Math.min(value, EBAY_APPLICATION_REQUEST_TIMEOUT_MS)
}

function credentialField(value: string | null | undefined): string | null {
  if (value == null) return ''
  if (value !== value.trim() || /\s/.test(value)) return null
  return value
}

function tokenFromPayload(value: unknown, nowMs: number): EbayApplicationToken | null {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return null
  const record = value as { access_token?: unknown, expires_in?: unknown }
  if (typeof record.access_token !== 'string' || !isEbayApplicationToken(record.access_token)) return null
  if (
    typeof record.expires_in !== 'number'
    || !Number.isInteger(record.expires_in)
    || record.expires_in <= 0
    || record.expires_in > EBAY_APPLICATION_MAX_EXPIRES_IN_SECONDS
  ) {
    return null
  }
  const ttlMs = Math.max(0, record.expires_in * 1000 - EBAY_APPLICATION_TOKEN_SKEW_MS)
  return { token: record.access_token, expiresAtMs: nowMs + ttlMs }
}

function basicCredentials(clientId: string, clientSecret: string): string {
  const bytes = new TextEncoder().encode(`${clientId}:${clientSecret}`)
  let binary = ''
  for (const byte of bytes) binary += String.fromCharCode(byte)
  return btoa(binary)
}

function isRedirect(status: number): boolean {
  return status === 301 || status === 302 || status === 303 || status === 307 || status === 308
}

async function cancelBody(response: Response): Promise<void> {
  try {
    await response.body?.cancel()
  } catch {
    return
  }
}

async function readLimitedText(response: Response, maxBytes: number): Promise<string | null> {
  const declared = Number(response.headers.get('content-length'))
  if (Number.isFinite(declared) && (declared < 0 || declared > maxBytes)) return null
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
      if (total > maxBytes) {
        await reader.cancel()
        return null
      }
      chunks.push(value)
    }
  } catch {
    return null
  }
  if (total === 0) return null
  const merged = new Uint8Array(total)
  let offset = 0
  for (const chunk of chunks) {
    merged.set(chunk, offset)
    offset += chunk.byteLength
  }
  return new TextDecoder().decode(merged)
}
