/**
 * Lectura manual de un anuncio de Browse.
 *
 * No arranca sola, no lee credenciales del entorno y no convierte el anuncio
 * en una observación. Un id solo de dígitos no se envía como `itemId` REST.
 * El `legacyItemId` numérico solo sale por `getItemByLegacyId` cuando la
 * persona lo pasa en ese argumento y confirma la ejecución.
 */

import {
  ebayRequestSignal,
  readEbayLimitedJson,
  createEbayApplicationAuth,
  type EbayFetch,
} from './ebay-application-auth'
import {
  EBAY_BROWSE_ITEM_URL_PREFIX,
  EBAY_BROWSE_MARKETPLACE_ID,
  EBAY_BROWSE_RESPONSE_MAX_BYTES,
  createEbayBrowseClient,
} from './ebay-browse-client'
import type { EbayBrowseItemFields } from './ebay-browse-offer'

const REST_ITEM_ID_PATTERN = /^[A-Za-z0-9|._~-]{1,128}$/
const LEGACY_ITEM_ID_PATTERN = /^[0-9]{1,20}$/
const LISTING_ID_PATTERN = REST_ITEM_ID_PATTERN
const CONDITION_ID_PATTERN = /^[0-9]{3,5}$/
const PRICE_PATTERN = /^(?:[1-9]\d{0,11}|0)(?:\.\d{1,2})?$/
const EPID_PATTERN = /^[0-9A-Za-z][0-9A-Za-z._-]{0,63}$/

export const EBAY_BROWSE_ITEM_READING_KIND = 'browse-item-reading' as const

export type BrowseBodyField<T> =
  | { fromBody: 'absent' }
  | { fromBody: 'present', value: T }
  | { fromBody: 'unusable', value: null }

export interface EbayBrowseItemReading {
  kind: typeof EBAY_BROWSE_ITEM_READING_KIND
  /** La petición lleva EBAY_ES. No afirma que el anuncio sea de ese mercado. */
  requestedMarketplaceId: typeof EBAY_BROWSE_MARKETPLACE_ID
  itemIdRequested: string
  /** El id numérico pedido. Null cuando la lectura usa el `itemId` REST. */
  legacyItemIdRequested: string | null
  fields: {
    itemId: BrowseBodyField<string>
    legacyItemId: BrowseBodyField<string>
    epid: BrowseBodyField<string>
    categoryId: BrowseBodyField<string>
    listingMarketplaceId: BrowseBodyField<string>
    condition: BrowseBodyField<string>
    conditionId: BrowseBodyField<string>
    itemWebUrl: BrowseBodyField<string>
    currency: BrowseBodyField<string>
    priceValue: BrowseBodyField<string>
  }
  missing: string[]
  /** Estas claves no se copian aunque vengan en el cuerpo. */
  discarded: readonly ['seller', 'description', 'title', 'itemAffiliateWebUrl']
  /** La URL del anuncio no pasa a ser sourceUrl. */
  itemWebUrlIsSourceUrl: false
}

export type EbayBrowseItemReadingResult =
  | { status: 'not-run' }
  | { status: 'legacy-item-id-not-supported' }
  | { status: 'invalid-legacy-item-id' }
  | { status: 'identifier-mismatch', requestedMarketplaceId: typeof EBAY_BROWSE_MARKETPLACE_ID }
  | { status: 'invalid-item-id' }
  | { status: 'unauthorized', requestedMarketplaceId: typeof EBAY_BROWSE_MARKETPLACE_ID }
  | { status: 'forbidden', requestedMarketplaceId: typeof EBAY_BROWSE_MARKETPLACE_ID }
  | { status: 'unavailable', requestedMarketplaceId: typeof EBAY_BROWSE_MARKETPLACE_ID }
  | { status: 'invalid-response', requestedMarketplaceId: typeof EBAY_BROWSE_MARKETPLACE_ID }
  | { status: 'ok', reading: EbayBrowseItemReading }

/**
 * Separa los campos pedidos del cuerpo ya recibido. No llama a la red.
 * `seller`, `description`, `title` y `itemAffiliateWebUrl` no se copian.
 */
export function readEbayBrowseItemReading(value: unknown, itemIdRequested: string): EbayBrowseItemReading | null {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return null
  const record = value as Record<string, unknown>
  const itemId = listingField(record.itemId)
  const legacyItemId = listingField(record.legacyItemId)
  const fields = {
    itemId,
    legacyItemId,
    epid: epidField(record.epid, itemId, legacyItemId),
    categoryId: exactTextField(record.categoryId),
    listingMarketplaceId: exactTextField(record.listingMarketplaceId),
    condition: exactTextField(record.condition),
    conditionId: conditionIdField(record.conditionId),
    itemWebUrl: exactTextField(record.itemWebUrl),
    currency: currencyField(record.price),
    priceValue: priceValueField(record.price),
  }
  return {
    kind: EBAY_BROWSE_ITEM_READING_KIND,
    requestedMarketplaceId: EBAY_BROWSE_MARKETPLACE_ID,
    itemIdRequested,
    legacyItemIdRequested: null,
    fields,
    missing: Object.entries(fields).filter(([, field]) => field.fromBody === 'absent').map(([name]) => name),
    discarded: ['seller', 'description', 'title', 'itemAffiliateWebUrl'],
    itemWebUrlIsSourceUrl: false,
  }
}

/**
 * Lectura voluntaria. Sin `confirm: 'run-outside-ci'` y sin `fetchImpl`
 * no hay petición. Las credenciales solo entran como argumentos de esa llamada.
 */
export async function collectBrowseItemReading(input?: {
  confirm?: 'run-outside-ci'
  itemId?: string
  legacyItemId?: string
  clientId?: string
  clientSecret?: string
  fetchImpl?: EbayFetch
}): Promise<EbayBrowseItemReadingResult> {
  if (
    input?.confirm !== 'run-outside-ci'
    || !input.fetchImpl
    || !input.clientId
    || !input.clientSecret
  ) {
    return { status: 'not-run' }
  }
  if (input.legacyItemId !== undefined && input.itemId !== undefined) return { status: 'invalid-item-id' }
  if (input.legacyItemId !== undefined) {
    return collectLegacyItemReading(input.legacyItemId, {
      clientId: input.clientId,
      clientSecret: input.clientSecret,
      fetchImpl: input.fetchImpl,
    })
  }
  if (!input.itemId) return { status: 'not-run' }
  if (LEGACY_ITEM_ID_PATTERN.test(input.itemId)) return { status: 'legacy-item-id-not-supported' }
  const url = browseItemUrl(input.itemId)
  if (!url) return { status: 'invalid-item-id' }

  const fetchImpl = input.fetchImpl
  const auth = createEbayApplicationAuth({
    clientId: input.clientId,
    clientSecret: input.clientSecret,
    fetchImpl,
  })
  const first = await auth.getAccessToken()
  if (first.status === 'unauthorized') return { status: 'unauthorized', requestedMarketplaceId: EBAY_BROWSE_MARKETPLACE_ID }
  if (first.status !== 'ok') return { status: 'unavailable', requestedMarketplaceId: EBAY_BROWSE_MARKETPLACE_ID }

  const firstCall = await callItem(url, first.token, fetchImpl)
  const chosen = firstCall.kind === 'http' && firstCall.status === 401
    ? await refresh(auth, first.token, url, fetchImpl)
    : firstCall
  if (chosen.kind === 'network') return { status: 'unavailable', requestedMarketplaceId: EBAY_BROWSE_MARKETPLACE_ID }
  if (chosen.kind === 'invalid') return { status: 'invalid-response', requestedMarketplaceId: EBAY_BROWSE_MARKETPLACE_ID }
  if (chosen.kind === 'http') {
    if (chosen.status === 401) return { status: 'unauthorized', requestedMarketplaceId: EBAY_BROWSE_MARKETPLACE_ID }
    if (chosen.status === 403) return { status: 'forbidden', requestedMarketplaceId: EBAY_BROWSE_MARKETPLACE_ID }
    return { status: 'unavailable', requestedMarketplaceId: EBAY_BROWSE_MARKETPLACE_ID }
  }
  const reading = readEbayBrowseItemReading(chosen.body, input.itemId)
  const returnedId = reading?.fields.itemId
  if (!reading || returnedId?.fromBody !== 'present' || returnedId.value !== input.itemId) {
    return { status: 'invalid-response', requestedMarketplaceId: EBAY_BROWSE_MARKETPLACE_ID }
  }
  return { status: 'ok', reading }
}

async function collectLegacyItemReading(
  legacyItemId: string,
  input: { clientId: string, clientSecret: string, fetchImpl: EbayFetch },
): Promise<EbayBrowseItemReadingResult> {
  const client = createEbayBrowseClient({
    clientId: input.clientId,
    clientSecret: input.clientSecret,
    fetchImpl: input.fetchImpl,
  })
  const result = await client.getItemByLegacyId(legacyItemId)
  if (result.status === 'invalid-legacy-item-id') return { status: 'invalid-legacy-item-id' }
  if (result.status === 'identifier-mismatch') {
    return { status: 'identifier-mismatch', requestedMarketplaceId: EBAY_BROWSE_MARKETPLACE_ID }
  }
  if (result.status !== 'ok') return { status: result.status, requestedMarketplaceId: EBAY_BROWSE_MARKETPLACE_ID }
  const reading = readingFromLegacyItem(result.item, legacyItemId)
  if (!reading) return { status: 'invalid-response', requestedMarketplaceId: EBAY_BROWSE_MARKETPLACE_ID }
  return { status: 'ok', reading }
}

function readingFromLegacyItem(item: EbayBrowseItemFields, legacyItemId: string): EbayBrowseItemReading | null {
  if (item.itemId === null || item.legacyItemId !== legacyItemId) return null
  const fields = {
    itemId: kept(item.itemId, (value) => LISTING_ID_PATTERN.test(value)),
    legacyItemId: kept(item.legacyItemId, (value) => value === legacyItemId && LISTING_ID_PATTERN.test(value)),
    epid: kept(item.epid, (value) => EPID_PATTERN.test(value) && !value.includes('://')),
    categoryId: kept(item.categoryId, exactText),
    listingMarketplaceId: kept(item.listingMarketplaceId, exactText),
    condition: kept(item.condition, exactText),
    conditionId: kept(item.conditionId, (value) => CONDITION_ID_PATTERN.test(value)),
    itemWebUrl: kept(item.itemWebUrl, exactText),
    currency: kept(item.currency, (value) => /^[A-Za-z]{3}$/.test(value)),
    priceValue: kept(item.priceValue, (value) => PRICE_PATTERN.test(value)),
  }
  if (fields.itemId.fromBody !== 'present' || fields.legacyItemId.fromBody !== 'present') return null
  return {
    kind: EBAY_BROWSE_ITEM_READING_KIND,
    requestedMarketplaceId: EBAY_BROWSE_MARKETPLACE_ID,
    itemIdRequested: item.itemId,
    legacyItemIdRequested: legacyItemId,
    fields,
    missing: Object.entries(fields).filter(([, field]) => field.fromBody === 'absent').map(([name]) => name),
    discarded: ['seller', 'description', 'title', 'itemAffiliateWebUrl'],
    itemWebUrlIsSourceUrl: false,
  }
}

function kept(value: string | null, accept: (value: string) => boolean): BrowseBodyField<string> {
  if (value === null) return { fromBody: 'absent' }
  if (!accept(value)) return { fromBody: 'unusable', value: null }
  return { fromBody: 'present', value }
}

function exactText(value: string): boolean {
  return value.length > 0 && value.trim() === value
}

type ItemCall =
  | { kind: 'network' }
  | { kind: 'http', status: number }
  | { kind: 'invalid' }
  | { kind: 'ok', body: unknown }

async function callItem(url: string, token: string, fetchImpl: EbayFetch): Promise<ItemCall> {
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
      signal: ebayRequestSignal(10_000),
    })
  } catch {
    return { kind: 'network' }
  }
  if (response.status !== 200) {
    const status = response.status
    await response.body?.cancel().catch(() => undefined)
    return { kind: 'http', status }
  }
  const parsed = await readEbayLimitedJson(response, EBAY_BROWSE_RESPONSE_MAX_BYTES)
  if (!parsed.ok) return { kind: 'invalid' }
  return { kind: 'ok', body: parsed.value }
}

async function refresh(
  auth: ReturnType<typeof createEbayApplicationAuth>,
  previousToken: string,
  url: string,
  fetchImpl: EbayFetch,
): Promise<ItemCall> {
  const second = await auth.getAccessToken({ force: true })
  if (second.status !== 'ok' || second.token === previousToken) {
    return { kind: 'http', status: second.status === 'unavailable' ? 503 : 401 }
  }
  return callItem(url, second.token, fetchImpl)
}

function browseItemUrl(itemId: string): string | null {
  if (!REST_ITEM_ID_PATTERN.test(itemId) || LEGACY_ITEM_ID_PATTERN.test(itemId)) return null
  const url = new URL(`${EBAY_BROWSE_ITEM_URL_PREFIX}${encodeURIComponent(itemId)}`)
  if (url.origin !== 'https://api.ebay.com') return null
  if (decodeURIComponent(url.pathname) !== `/buy/browse/v1/item/${itemId}`) return null
  if (url.search) return null
  return url.toString()
}

function listingField(value: unknown): BrowseBodyField<string> {
  if (value == null) return { fromBody: 'absent' }
  if (typeof value !== 'string' || !LISTING_ID_PATTERN.test(value)) return { fromBody: 'unusable', value: null }
  return { fromBody: 'present', value }
}

function exactTextField(value: unknown): BrowseBodyField<string> {
  if (value == null) return { fromBody: 'absent' }
  if (typeof value !== 'string' || !value || value.trim() !== value) return { fromBody: 'unusable', value: null }
  return { fromBody: 'present', value }
}

function conditionIdField(value: unknown): BrowseBodyField<string> {
  if (value == null) return { fromBody: 'absent' }
  if (typeof value !== 'string' || !CONDITION_ID_PATTERN.test(value)) return { fromBody: 'unusable', value: null }
  return { fromBody: 'present', value }
}

function epidField(
  value: unknown,
  itemId: BrowseBodyField<string>,
  legacyItemId: BrowseBodyField<string>,
): BrowseBodyField<string> {
  if (value == null) return { fromBody: 'absent' }
  if (typeof value !== 'string' || !EPID_PATTERN.test(value) || value.includes('://')) {
    return { fromBody: 'unusable', value: null }
  }
  if (
    (itemId.fromBody === 'present' && value === itemId.value)
    || (legacyItemId.fromBody === 'present' && value === legacyItemId.value)
  ) {
    return { fromBody: 'unusable', value: null }
  }
  return { fromBody: 'present', value }
}

function priceRecord(value: unknown): { value?: unknown, currency?: unknown } | null {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return null
  return value as { value?: unknown, currency?: unknown }
}

function priceValueField(price: unknown): BrowseBodyField<string> {
  if (price == null) return { fromBody: 'absent' }
  const record = priceRecord(price)
  if (!record || record.value == null) return { fromBody: 'unusable', value: null }
  if (typeof record.value !== 'string' || !PRICE_PATTERN.test(record.value)) return { fromBody: 'unusable', value: null }
  return { fromBody: 'present', value: record.value }
}

function currencyField(price: unknown): BrowseBodyField<string> {
  if (price == null) return { fromBody: 'absent' }
  const record = priceRecord(price)
  if (!record || record.currency == null) return { fromBody: 'unusable', value: null }
  if (typeof record.currency !== 'string' || !/^[A-Za-z]{3}$/.test(record.currency)) {
    return { fromBody: 'unusable', value: null }
  }
  return { fromBody: 'present', value: record.currency }
}
