/**
 * Búsqueda inicial de eBay Browse API.
 *
 * Llama a item_summary/search, getItem y getItemByLegacyId en EBAY_ES,
 * con un token de aplicación.
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

export const EBAY_BROWSE_MARKETPLACE_ID = 'EBAY_ES' as const
export const EBAY_BROWSE_SEARCH_URL = 'https://api.ebay.com/buy/browse/v1/item_summary/search'
export const EBAY_BROWSE_ITEM_URL_PREFIX = 'https://api.ebay.com/buy/browse/v1/item/'
export const EBAY_BROWSE_LEGACY_ITEM_URL = 'https://api.ebay.com/buy/browse/v1/item/get_item_by_legacy_id'
export const EBAY_BROWSE_SEARCH_LIMIT_DEFAULT = 1
export const EBAY_BROWSE_SEARCH_LIMIT_MAX = 10
export const EBAY_BROWSE_SEARCH_QUERY_MAX_LENGTH = 100
export const EBAY_BROWSE_RESPONSE_MAX_BYTES = 131_072
export const EBAY_BROWSE_MAX_ITEM_SCAN = 200

const ITEM_ID_PATTERN = /^[A-Za-z0-9|._~-]{1,128}$/
/** Id decimal sin ceros a la izquierda. El OpenAPI no publica un patrón; no se reescribe la entrada. */
const LEGACY_ITEM_ID_PATTERN = /^[1-9][0-9]{0,19}$/

export function isEbayBrowseLegacyItemId(value: string): boolean {
  return typeof value === 'string' && LEGACY_ITEM_ID_PATTERN.test(value)
}

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

export type EbayBrowseItemResult =
  | { status: 'invalid-item-id' }
  | { status: 'ok', marketplaceId: typeof EBAY_BROWSE_MARKETPLACE_ID, item: EbayBrowseItemFields }
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
  getItem(itemId: string): Promise<EbayBrowseItemResult>
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
}): EbayBrowseClient {
  const fetchImpl = options.fetchImpl ?? ((input, init) => fetch(input, init))
  const timeoutMs = boundedTimeout(options.timeoutMs)
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
    async getItem(itemId) {
      const url = browseItemUrl(itemId)
      if (!url) return { status: 'invalid-item-id' }
      const loaded = await loadItem(url)
      if (loaded.status !== 'ok') return { status: loaded.status, marketplaceId: EBAY_BROWSE_MARKETPLACE_ID }
      const item = readEbayBrowseItemFields(loaded.body)
      if (!item || item.itemId !== itemId) return { status: 'invalid-response', marketplaceId: EBAY_BROWSE_MARKETPLACE_ID }
      return { status: 'ok', marketplaceId: EBAY_BROWSE_MARKETPLACE_ID, item }
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
  if (!isEbayBrowseLegacyItemId(legacyItemId)) return null
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
