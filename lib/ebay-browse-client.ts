/**
 * Búsqueda inicial de eBay Browse API.
 *
 * Llama a item_summary/search, getItem y getItemByLegacyId en EBAY_ES,
 * con un token de aplicación. `searchByEpid` es otra llamada al mismo
 * recurso, con un solo ePID y `limit=10`, sin `q`. Sus filas son
 * candidatos de anuncio, no productos verificados, y no dispara `getItem`.
 * No convierte anuncios en observaciones, no guarda fichas y no enciende
 * `ebayBrowseSecondHandSource`. El proveedor por defecto sigue vacío.
 */

import {
  EBAY_APPLICATION_REQUEST_TIMEOUT_MS,
  ebayRequestSignal,
  isEbayApplicationToken,
  readEbayLimitedJson,
  type EbayApplicationAuth,
  type EbayApplicationTokenMemory,
  type EbayFetch,
  createEbayApplicationAuth,
} from './ebay-application-auth'
import { readEbayBrowseItemFields, type EbayBrowseItemFields } from './ebay-browse-offer'
import { readEbayEpnCampaignId } from './ebay-listing'

export const EBAY_BROWSE_MARKETPLACE_ID = 'EBAY_ES' as const
export const EBAY_BROWSE_SEARCH_URL = 'https://api.ebay.com/buy/browse/v1/item_summary/search'
export const EBAY_BROWSE_ITEM_URL_PREFIX = 'https://api.ebay.com/buy/browse/v1/item/'
export const EBAY_BROWSE_LEGACY_ITEM_URL = 'https://api.ebay.com/buy/browse/v1/item/get_item_by_legacy_id'
export const EBAY_BROWSE_SEARCH_LIMIT_DEFAULT = 1
export const EBAY_BROWSE_SEARCH_LIMIT_MAX = 10
export const EBAY_BROWSE_SEARCH_QUERY_MAX_LENGTH = 100
/** Límite fijo de la búsqueda por ePID. Quien llama no lo elige. */
export const EBAY_BROWSE_EPID_SEARCH_LIMIT = 10
/**
 * Aviso documentado de Browse en un HTTP 200 cuando el ePID no se acepta.
 * Esa respuesta no aporta candidatos.
 */
export const EBAY_BROWSE_EPID_NOT_ACCEPTED_ERROR_ID = 12021
export const EBAY_BROWSE_RESPONSE_MAX_BYTES = 131_072
export const EBAY_BROWSE_MAX_ITEM_SCAN = 200

const ITEM_ID_PATTERN = /^[A-Za-z0-9|._~-]{1,128}$/
/**
 * Preflight local, anterior a cualquier petición.
 * En Browse API OAS Baseline v1.20.4 el query `epid` es un string sin
 * patrón, `minLength` ni `maxLength`. Esta expresión no es una restricción
 * oficial de eBay: descarta vacío, URLs y texto que no puede viajar como
 * un único identificador.
 */
const LOCAL_EPID_PREFLIGHT = /^[0-9A-Za-z][0-9A-Za-z._-]{0,63}$/
/** Id decimal sin ceros a la izquierda. El OpenAPI no publica un patrón; no se reescribe la entrada. */
const LEGACY_ITEM_ID_PATTERN = /^[1-9][0-9]{0,19}$/
const PRICE_PATTERN = /^(?:[1-9]\d{0,11}|0)(?:\.\d{1,2})?$/
const CONDITION_ID_PATTERN = /^[0-9]{3,5}$/
const CURRENCY_PATTERN = /^[A-Z]{3}$/
const TITLE_MAX_LENGTH = 120

export interface EbayBrowseItemSummary {
  itemId: string
  title: string
  priceValue: string
  currency: string
  conditionId: string | null
}

export type EbayBrowseSearchResult =
  | { status: 'invalid-query' }
  | {
    status: 'ok'
    marketplaceId: typeof EBAY_BROWSE_MARKETPLACE_ID
    limit: number
    total: number | null
    items: EbayBrowseItemSummary[]
  }
  | {
    status: 'empty'
    marketplaceId: typeof EBAY_BROWSE_MARKETPLACE_ID
    limit: number
    total: number | null
  }
  | { status: 'invalid-response', marketplaceId: typeof EBAY_BROWSE_MARKETPLACE_ID }
  | { status: 'unauthorized', marketplaceId: typeof EBAY_BROWSE_MARKETPLACE_ID }
  | { status: 'forbidden', marketplaceId: typeof EBAY_BROWSE_MARKETPLACE_ID }
  | { status: 'unavailable', marketplaceId: typeof EBAY_BROWSE_MARKETPLACE_ID }

export interface EbayBrowseSearchQuery {
  q: string
  limit?: number
}

/** Id de anuncio devuelto por la búsqueda por ePID. No es un producto verificado. */
export interface EbayBrowseEpidCandidate {
  itemId: string
}

export type EbayBrowseEpidSearchResult =
  | { status: 'invalid-epid' }
  | {
    status: 'candidates'
    marketplaceId: typeof EBAY_BROWSE_MARKETPLACE_ID
    limit: typeof EBAY_BROWSE_EPID_SEARCH_LIMIT
    total: number | null
    verifiedProduct: false
    items: EbayBrowseEpidCandidate[]
  }
  | {
    status: 'empty'
    marketplaceId: typeof EBAY_BROWSE_MARKETPLACE_ID
    limit: typeof EBAY_BROWSE_EPID_SEARCH_LIMIT
    total: number | null
    verifiedProduct: false
  }
  | {
    status: 'epid-not-accepted'
    marketplaceId: typeof EBAY_BROWSE_MARKETPLACE_ID
    httpStatus: 200
  }
  | { status: 'invalid-response', marketplaceId: typeof EBAY_BROWSE_MARKETPLACE_ID }
  | { status: 'unauthorized', marketplaceId: typeof EBAY_BROWSE_MARKETPLACE_ID, httpStatus: 401 }
  | { status: 'forbidden', marketplaceId: typeof EBAY_BROWSE_MARKETPLACE_ID, httpStatus: 403 }
  | { status: 'unavailable', marketplaceId: typeof EBAY_BROWSE_MARKETPLACE_ID, httpStatus: number | null }

export type EbayBrowseItemResult =
  | { status: 'invalid-item-id' }
  | { status: 'ok', marketplaceId: typeof EBAY_BROWSE_MARKETPLACE_ID, item: EbayBrowseItemFields }
  | { status: 'invalid-response', marketplaceId: typeof EBAY_BROWSE_MARKETPLACE_ID }
  | { status: 'unauthorized', marketplaceId: typeof EBAY_BROWSE_MARKETPLACE_ID }
  | { status: 'forbidden', marketplaceId: typeof EBAY_BROWSE_MARKETPLACE_ID }
  | { status: 'unavailable', marketplaceId: typeof EBAY_BROWSE_MARKETPLACE_ID }

/** El cuerpo ya leído, sin filtrar. No se escribe en disco. */
export type EbayBrowseItemBodyResult =
  | { status: 'invalid-item-id' }
  | { status: 'ok', marketplaceId: typeof EBAY_BROWSE_MARKETPLACE_ID, body: unknown }
  | { status: 'invalid-response', marketplaceId: typeof EBAY_BROWSE_MARKETPLACE_ID }
  | { status: 'unauthorized', marketplaceId: typeof EBAY_BROWSE_MARKETPLACE_ID }
  | { status: 'forbidden', marketplaceId: typeof EBAY_BROWSE_MARKETPLACE_ID }
  | { status: 'unavailable', marketplaceId: typeof EBAY_BROWSE_MARKETPLACE_ID }

export type EbayBrowseLegacyItemResult =
  | { status: 'invalid-legacy-item-id' }
  | { status: 'identifier-mismatch', marketplaceId: typeof EBAY_BROWSE_MARKETPLACE_ID }
  | { status: 'ok', marketplaceId: typeof EBAY_BROWSE_MARKETPLACE_ID, item: EbayBrowseItemFields }
  | { status: 'invalid-response', marketplaceId: typeof EBAY_BROWSE_MARKETPLACE_ID }
  | { status: 'unauthorized', marketplaceId: typeof EBAY_BROWSE_MARKETPLACE_ID }
  | { status: 'forbidden', marketplaceId: typeof EBAY_BROWSE_MARKETPLACE_ID }
  | { status: 'unavailable', marketplaceId: typeof EBAY_BROWSE_MARKETPLACE_ID }

export interface EbayBrowseClient {
  search(query: EbayBrowseSearchQuery): Promise<EbayBrowseSearchResult>
  searchByEpid(epid: string): Promise<EbayBrowseEpidSearchResult>
  getItem(itemId: string): Promise<EbayBrowseItemResult>
  /** Conserva el JSON de esa única lectura. No repite la petición de `getItem`. */
  getItemBody(itemId: string): Promise<EbayBrowseItemBodyResult>
  getItemByLegacyId(legacyItemId: string): Promise<EbayBrowseLegacyItemResult>
}

type SearchCall =
  | { kind: 'network' }
  | { kind: 'http', status: number }
  | { kind: 'invalid' }
  | { kind: 'ok', body: unknown }

export function createEbayBrowseClient(options: {
  clientId?: string
  clientSecret?: string
  auth?: EbayApplicationAuth
  memory?: EbayApplicationTokenMemory
  fetchImpl?: EbayFetch
  now?: () => number
  timeoutMs?: number
  /** Solo un `affiliateCampaignId` de diez dígitos. No se inventa ni se añade a la URL. */
  affiliateCampaignId?: string | null
}): EbayBrowseClient {
  const fetchImpl = options.fetchImpl ?? ((input, init) => fetch(input, init))
  const timeoutMs = boundedTimeout(options.timeoutMs)
  const endUser = ebayEndUserContext(options.affiliateCampaignId)
  const auth = options.auth ?? createEbayApplicationAuth({
    clientId: options.clientId ?? '',
    clientSecret: options.clientSecret ?? '',
    memory: options.memory,
    fetchImpl,
    now: options.now,
    timeoutMs,
  })

  const callSearch = async (url: string, token: string): Promise<SearchCall> => {
    // Un token ilegible no se envía. El resultado visible es el mismo que un fallo de red.
    if (!isEbayApplicationToken(token)) return { kind: 'network' }
    let response: Response
    try {
      response = await fetchImpl(url, {
        method: 'GET',
        headers: {
          Accept: 'application/json',
          Authorization: `Bearer ${token}`,
          'X-EBAY-C-MARKETPLACE-ID': EBAY_BROWSE_MARKETPLACE_ID,
          ...(endUser ? { 'X-EBAY-C-ENDUSERCTX': endUser } : {}),
        },
        redirect: 'manual',
        cache: 'no-store',
        signal: ebayRequestSignal(timeoutMs),
      })
    } catch {
      return { kind: 'network' }
    }
    if (response.status !== 200) {
      const status = response.status
      await cancelBody(response)
      return { kind: 'http', status }
    }
    const parsed = await readEbayLimitedJson(response, EBAY_BROWSE_RESPONSE_MAX_BYTES)
    if (!parsed.ok) return { kind: 'invalid' }
    return { kind: 'ok', body: parsed.value }
  }

  const finish = (call: SearchCall, limit: number): EbayBrowseSearchResult => {
    if (call.kind === 'network') return { status: 'unavailable', marketplaceId: EBAY_BROWSE_MARKETPLACE_ID }
    if (call.kind === 'invalid') return { status: 'invalid-response', marketplaceId: EBAY_BROWSE_MARKETPLACE_ID }
    if (call.kind === 'http') {
      if (isRedirect(call.status)) return { status: 'unavailable', marketplaceId: EBAY_BROWSE_MARKETPLACE_ID }
      if (call.status === 401) return { status: 'unauthorized', marketplaceId: EBAY_BROWSE_MARKETPLACE_ID }
      if (call.status === 403) return { status: 'forbidden', marketplaceId: EBAY_BROWSE_MARKETPLACE_ID }
      return { status: 'unavailable', marketplaceId: EBAY_BROWSE_MARKETPLACE_ID }
    }
    const summaries = summariesFromPayload(call.body, limit)
    if (summaries.status === 'invalid-response') {
      return { status: 'invalid-response', marketplaceId: EBAY_BROWSE_MARKETPLACE_ID }
    }
    if (summaries.status === 'empty') {
      return {
        status: 'empty',
        marketplaceId: EBAY_BROWSE_MARKETPLACE_ID,
        limit,
        total: summaries.total,
      }
    }
    return {
      status: 'ok',
      marketplaceId: EBAY_BROWSE_MARKETPLACE_ID,
      limit,
      total: summaries.total,
      items: summaries.items,
    }
  }

  const refresh = async (previousToken: string, url: string): Promise<SearchCall> => {
    const second = await auth.getAccessToken({ force: true })
    if (second.status !== 'ok' || second.token === previousToken) {
      return { kind: 'http', status: second.status === 'unavailable' ? 503 : 401 }
    }
    return callSearch(url, second.token)
  }

  const loadItem = async (url: string): Promise<
    | { status: 'unauthorized' | 'forbidden' | 'unavailable' | 'invalid-response' }
    | { status: 'ok', body: unknown }
  > => {
    const first = await auth.getAccessToken()
    if (first.status === 'unauthorized') return { status: 'unauthorized' }
    if (first.status !== 'ok') return { status: 'unavailable' }
    const firstCall = await callSearch(url, first.token)
    const chosen = firstCall.kind === 'http' && firstCall.status === 401
      ? await refresh(first.token, url)
      : firstCall
    if (chosen.kind === 'network') return { status: 'unavailable' }
    if (chosen.kind === 'invalid') return { status: 'invalid-response' }
    if (chosen.kind === 'http') {
      if (chosen.status === 401) return { status: 'unauthorized' }
      if (chosen.status === 403) return { status: 'forbidden' }
      return { status: 'unavailable' }
    }
    return { status: 'ok', body: chosen.body }
  }

  return {
    async search(query) {
      const q = normalizeQuery(query.q)
      const limit = normalizeLimit(query.limit)
      if (!q || limit === null) return { status: 'invalid-query' }
      const url = browseSearchUrl(q, limit)
      if (!url) return { status: 'invalid-query' }

      const first = await auth.getAccessToken()
      if (first.status === 'unauthorized') return { status: 'unauthorized', marketplaceId: EBAY_BROWSE_MARKETPLACE_ID }
      if (first.status !== 'ok') return { status: 'unavailable', marketplaceId: EBAY_BROWSE_MARKETPLACE_ID }

      const firstCall = await callSearch(url, first.token)
      if (firstCall.kind === 'http' && firstCall.status === 401) {
        const second = await auth.getAccessToken({ force: true })
        if (second.status !== 'ok' || second.token === first.token) {
          return second.status === 'unavailable'
            ? { status: 'unavailable', marketplaceId: EBAY_BROWSE_MARKETPLACE_ID }
            : { status: 'unauthorized', marketplaceId: EBAY_BROWSE_MARKETPLACE_ID }
        }
        return finish(await callSearch(url, second.token), limit)
      }
      return finish(firstCall, limit)
    },
    async searchByEpid(epid) {
      const url = browseEpidSearchUrl(epid)
      if (!url) return { status: 'invalid-epid' }

      const first = await auth.getAccessToken()
      if (first.status === 'unauthorized') {
        return { status: 'unauthorized', marketplaceId: EBAY_BROWSE_MARKETPLACE_ID, httpStatus: 401 }
      }
      if (first.status !== 'ok') {
        return { status: 'unavailable', marketplaceId: EBAY_BROWSE_MARKETPLACE_ID, httpStatus: null }
      }

      const firstCall = await callSearch(url, first.token)
      if (firstCall.kind === 'http' && firstCall.status === 401) {
        const second = await auth.getAccessToken({ force: true })
        if (second.status !== 'ok' || second.token === first.token) {
          return second.status === 'unavailable'
            ? { status: 'unavailable', marketplaceId: EBAY_BROWSE_MARKETPLACE_ID, httpStatus: null }
            : { status: 'unauthorized', marketplaceId: EBAY_BROWSE_MARKETPLACE_ID, httpStatus: 401 }
        }
        return finishEpid(await callSearch(url, second.token))
      }
      return finishEpid(firstCall)
    },
    async getItem(itemId) {
      const url = browseItemUrl(itemId)
      if (!url) return { status: 'invalid-item-id' }
      const loaded = await loadItem(url)
      if (loaded.status !== 'ok') return { status: loaded.status, marketplaceId: EBAY_BROWSE_MARKETPLACE_ID }
      const item = readEbayBrowseItemFields(loaded.body)
      if (!item || item.itemId !== itemId) return { status: 'invalid-response', marketplaceId: EBAY_BROWSE_MARKETPLACE_ID }
      return { status: 'ok', marketplaceId: EBAY_BROWSE_MARKETPLACE_ID, item }
    },
    async getItemBody(itemId) {
      const url = browseItemUrl(itemId)
      if (!url) return { status: 'invalid-item-id' }
      const loaded = await loadItem(url)
      if (loaded.status !== 'ok') return { status: loaded.status, marketplaceId: EBAY_BROWSE_MARKETPLACE_ID }
      const item = readEbayBrowseItemFields(loaded.body)
      if (!item || item.itemId !== itemId) return { status: 'invalid-response', marketplaceId: EBAY_BROWSE_MARKETPLACE_ID }
      return { status: 'ok', marketplaceId: EBAY_BROWSE_MARKETPLACE_ID, body: loaded.body }
    },
    async getItemByLegacyId(legacyItemId) {
      const url = browseLegacyItemUrl(legacyItemId)
      if (!url) return { status: 'invalid-legacy-item-id' }
      const loaded = await loadItem(url)
      if (loaded.status !== 'ok') return { status: loaded.status, marketplaceId: EBAY_BROWSE_MARKETPLACE_ID }
      const item = readEbayBrowseItemFields(loaded.body)
      if (!item) return { status: 'invalid-response', marketplaceId: EBAY_BROWSE_MARKETPLACE_ID }
      if (item.legacyItemId !== legacyItemId) {
        return { status: 'identifier-mismatch', marketplaceId: EBAY_BROWSE_MARKETPLACE_ID }
      }
      if (item.itemId === null) return { status: 'invalid-response', marketplaceId: EBAY_BROWSE_MARKETPLACE_ID }
      return { status: 'ok', marketplaceId: EBAY_BROWSE_MARKETPLACE_ID, item }
    },
  }
}

function ebayEndUserContext(campaignId: string | null | undefined): string | null {
  const read = readEbayEpnCampaignId(campaignId)
  if (read.status !== 'ok') return null
  return `affiliateCampaignId=${read.campaignId}`
}

function boundedTimeout(value: number | undefined): number {
  if (typeof value !== 'number' || !Number.isFinite(value) || value <= 0) return EBAY_APPLICATION_REQUEST_TIMEOUT_MS
  return Math.min(value, EBAY_APPLICATION_REQUEST_TIMEOUT_MS)
}

function normalizeQuery(value: unknown): string | null {
  if (typeof value !== 'string') return null
  const q = value.trim()
  if (q.length < 1 || q.length > EBAY_BROWSE_SEARCH_QUERY_MAX_LENGTH) return null
  if (/[\u0000-\u001F\u007F]/.test(q)) return null
  return q
}

function normalizeLimit(value: number | undefined): number | null {
  if (value === undefined) return EBAY_BROWSE_SEARCH_LIMIT_DEFAULT
  if (typeof value !== 'number' || !Number.isInteger(value)) return null
  if (value < 1 || value > EBAY_BROWSE_SEARCH_LIMIT_MAX) return null
  return value
}

export function browseEpidSearchUrl(epid: string): string | null {
  const accepted = acceptLocalEpid(epid)
  if (!accepted) return null
  const url = new URL(EBAY_BROWSE_SEARCH_URL)
  url.searchParams.set('epid', accepted)
  url.searchParams.set('limit', String(EBAY_BROWSE_EPID_SEARCH_LIMIT))
  if (url.origin !== 'https://api.ebay.com') return null
  if (url.pathname !== '/buy/browse/v1/item_summary/search') return null
  const keys = [...url.searchParams.keys()]
  if (keys.length !== 2 || keys[0] !== 'epid' || keys[1] !== 'limit') return null
  if (url.searchParams.get('epid') !== accepted) return null
  if (url.searchParams.get('limit') !== String(EBAY_BROWSE_EPID_SEARCH_LIMIT)) return null
  if (url.searchParams.has('q') || url.searchParams.has('offset') || url.searchParams.has('filter')) return null
  if (url.searchParams.has('category_ids') || url.searchParams.has('fieldgroups') || url.searchParams.has('sort')) return null
  return url.toString()
}

function acceptLocalEpid(value: unknown): string | null {
  if (typeof value !== 'string') return null
  if (value.length < 1 || value.length > 64) return null
  if (value.includes('://') || value.includes('/') || value.includes('?') || value.includes('&') || value.includes('=')) return null
  if (/[\u0000-\u001F\u007F]/.test(value)) return null
  if (value !== value.trim()) return null
  if (!LOCAL_EPID_PREFLIGHT.test(value)) return null
  return value
}

function browseSearchUrl(q: string, limit: number): string | null {
  const url = new URL(EBAY_BROWSE_SEARCH_URL)
  url.searchParams.set('q', q)
  url.searchParams.set('limit', String(limit))
  if (url.origin !== 'https://api.ebay.com') return null
  if (url.pathname !== '/buy/browse/v1/item_summary/search') return null
  const keys = [...url.searchParams.keys()]
  if (keys.length !== 2 || !keys.includes('q') || !keys.includes('limit')) return null
  return url.toString()
}

function browseLegacyItemUrl(legacyItemId: string): string | null {
  if (typeof legacyItemId !== 'string' || !LEGACY_ITEM_ID_PATTERN.test(legacyItemId)) return null
  const url = new URL(EBAY_BROWSE_LEGACY_ITEM_URL)
  url.searchParams.set('legacy_item_id', legacyItemId)
  if (url.origin !== 'https://api.ebay.com') return null
  if (url.pathname !== '/buy/browse/v1/item/get_item_by_legacy_id') return null
  const keys = [...url.searchParams.keys()]
  if (keys.length !== 1 || keys[0] !== 'legacy_item_id') return null
  if (url.searchParams.get('legacy_item_id') !== legacyItemId) return null
  return url.toString()
}

function browseItemUrl(itemId: string): string | null {
  if (!ITEM_ID_PATTERN.test(itemId)) return null
  const url = new URL(`${EBAY_BROWSE_ITEM_URL_PREFIX}${encodeURIComponent(itemId)}`)
  if (url.origin !== 'https://api.ebay.com') return null
  if (decodeURIComponent(url.pathname) !== `/buy/browse/v1/item/${itemId}`) return null
  if (url.search) return null
  return url.toString()
}

function summariesFromPayload(
  value: unknown,
  limit: number,
): { status: 'ok', total: number | null, items: EbayBrowseItemSummary[] }
  | { status: 'empty', total: number | null }
  | { status: 'invalid-response' } {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return { status: 'invalid-response' }
  const record = value as { total?: unknown, itemSummaries?: unknown, errors?: unknown }
  if (record.errors != null) return { status: 'invalid-response' }
  const total = readTotal(record.total)
  if (total === 'invalid') return { status: 'invalid-response' }
  if (record.itemSummaries == null) return { status: 'empty', total }
  if (!Array.isArray(record.itemSummaries)) return { status: 'invalid-response' }
  if (record.itemSummaries.length > EBAY_BROWSE_MAX_ITEM_SCAN) return { status: 'invalid-response' }
  if (record.itemSummaries.length === 0) return { status: 'empty', total }
  const items: EbayBrowseItemSummary[] = []
  for (const entry of record.itemSummaries) {
    const item = readItem(entry)
    if (!item) continue
    items.push(item)
    if (items.length >= limit) break
  }
  if (items.length === 0) return { status: 'invalid-response' }
  if (total === 0 || (total !== null && items.length > total)) return { status: 'invalid-response' }
  return { status: 'ok', total, items }
}

function readTotal(value: unknown): number | null | 'invalid' {
  if (value == null) return null
  if (typeof value !== 'number' || !Number.isInteger(value) || value < 0 || value > 1_000_000_000) return 'invalid'
  return value
}

function readItem(value: unknown): EbayBrowseItemSummary | null {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return null
  const record = value as {
    itemId?: unknown
    title?: unknown
    price?: unknown
    conditionId?: unknown
  }
  if (typeof record.itemId !== 'string' || !ITEM_ID_PATTERN.test(record.itemId)) return null
  if (typeof record.title !== 'string' || /[\u0000-\u001F\u007F]/.test(record.title)) return null
  const title = record.title.trim()
  if (title.length < 1 || title.length > TITLE_MAX_LENGTH) return null
  const price = readPrice(record.price)
  if (!price) return null
  if (record.conditionId == null) {
    return { itemId: record.itemId, title, priceValue: price.priceValue, currency: price.currency, conditionId: null }
  }
  if (typeof record.conditionId !== 'string' || !CONDITION_ID_PATTERN.test(record.conditionId)) return null
  return {
    itemId: record.itemId,
    title,
    priceValue: price.priceValue,
    currency: price.currency,
    conditionId: record.conditionId,
  }
}

function readPrice(value: unknown): { priceValue: string, currency: string } | null {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return null
  const record = value as { value?: unknown, currency?: unknown }
  if (typeof record.value !== 'string' || !PRICE_PATTERN.test(record.value)) return null
  const amount = Number(record.value)
  if (!Number.isFinite(amount) || amount <= 0) return null
  if (typeof record.currency !== 'string' || !CURRENCY_PATTERN.test(record.currency)) return null
  return { priceValue: record.value, currency: record.currency }
}

function finishEpid(call: SearchCall): EbayBrowseEpidSearchResult {
  if (call.kind === 'network') {
    return { status: 'unavailable', marketplaceId: EBAY_BROWSE_MARKETPLACE_ID, httpStatus: null }
  }
  if (call.kind === 'invalid') {
    return { status: 'invalid-response', marketplaceId: EBAY_BROWSE_MARKETPLACE_ID }
  }
  if (call.kind === 'http') {
    if (call.status === 401) {
      return { status: 'unauthorized', marketplaceId: EBAY_BROWSE_MARKETPLACE_ID, httpStatus: 401 }
    }
    if (call.status === 403) {
      return { status: 'forbidden', marketplaceId: EBAY_BROWSE_MARKETPLACE_ID, httpStatus: 403 }
    }
    return { status: 'unavailable', marketplaceId: EBAY_BROWSE_MARKETPLACE_ID, httpStatus: call.status }
  }
  const parsed = epidCandidatesFromPayload(call.body)
  if (parsed.status === 'epid-not-accepted') {
    return { status: 'epid-not-accepted', marketplaceId: EBAY_BROWSE_MARKETPLACE_ID, httpStatus: 200 }
  }
  if (parsed.status === 'invalid-response') {
    return { status: 'invalid-response', marketplaceId: EBAY_BROWSE_MARKETPLACE_ID }
  }
  if (parsed.status === 'empty') {
    return {
      status: 'empty',
      marketplaceId: EBAY_BROWSE_MARKETPLACE_ID,
      limit: EBAY_BROWSE_EPID_SEARCH_LIMIT,
      total: parsed.total,
      verifiedProduct: false,
    }
  }
  return {
    status: 'candidates',
    marketplaceId: EBAY_BROWSE_MARKETPLACE_ID,
    limit: EBAY_BROWSE_EPID_SEARCH_LIMIT,
    total: parsed.total,
    verifiedProduct: false,
    items: parsed.items,
  }
}

function epidCandidatesFromPayload(
  value: unknown,
): { status: 'candidates', total: number | null, items: EbayBrowseEpidCandidate[] }
  | { status: 'empty', total: number | null }
  | { status: 'epid-not-accepted' }
  | { status: 'invalid-response' } {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return { status: 'invalid-response' }
  if (payloadHasErrorId(value, EBAY_BROWSE_EPID_NOT_ACCEPTED_ERROR_ID)) return { status: 'epid-not-accepted' }
  const record = value as { total?: unknown, itemSummaries?: unknown, errors?: unknown }
  if (record.errors != null) return { status: 'invalid-response' }
  const total = readTotal(record.total)
  if (total === 'invalid') return { status: 'invalid-response' }
  if (record.itemSummaries == null) return { status: 'empty', total }
  if (!Array.isArray(record.itemSummaries)) return { status: 'invalid-response' }
  if (record.itemSummaries.length > EBAY_BROWSE_MAX_ITEM_SCAN) return { status: 'invalid-response' }
  if (record.itemSummaries.length === 0) return { status: 'empty', total }
  const items: EbayBrowseEpidCandidate[] = []
  for (const entry of record.itemSummaries) {
    const itemId = readCandidateItemId(entry)
    if (!itemId) continue
    items.push({ itemId })
    if (items.length >= EBAY_BROWSE_EPID_SEARCH_LIMIT) break
  }
  if (items.length === 0) return { status: 'invalid-response' }
  if (total === 0 || (total !== null && items.length > total)) return { status: 'invalid-response' }
  return { status: 'candidates', total, items }
}

function readCandidateItemId(value: unknown): string | null {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return null
  const itemId = (value as { itemId?: unknown }).itemId
  if (typeof itemId !== 'string' || !ITEM_ID_PATTERN.test(itemId)) return null
  return itemId
}

function payloadHasErrorId(value: unknown, errorId: number): boolean {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return false
  const record = value as { warnings?: unknown, errors?: unknown }
  return listHasErrorId(record.warnings, errorId) || listHasErrorId(record.errors, errorId)
}

function listHasErrorId(value: unknown, errorId: number): boolean {
  if (!Array.isArray(value)) return false
  return value.some((entry) => {
    if (!entry || typeof entry !== 'object' || Array.isArray(entry)) return false
    const id = (entry as { errorId?: unknown }).errorId
    return typeof id === 'number' && Number.isInteger(id) && id === errorId
  })
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
