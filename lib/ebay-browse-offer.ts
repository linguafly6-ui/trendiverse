/**
 * Puente puro entre un anuncio de Browse y `ebayOfferToObservation`.
 *
 * No llama a eBay, no lee credenciales y no enciende el adapter.
 * `itemId` y `legacyItemId` nombran el anuncio. El único vínculo con el
 * catálogo es un ePID que ya cumpla `asExternalMapping`. Si falta, la oferta
 * queda sin asociar. `itemWebUrl` pasa por `normalizeEbaySourceUrl`: una ficha
 * de eBay o un parámetro de afiliado no se convierten en `sourceUrl`.
 */

import {
  ebayOfferToObservation,
  isEbayListingWithinDisplayWindow,
  normalizeEbayCondition,
  normalizeEbayCurrency,
  normalizeEbayPrice,
  normalizeEbaySourceUrl,
  type EbayProductMapping,
} from './ebay-browse-adapter'
import {
  asExternalMapping,
  SECOND_HAND_PRODUCT_MAPPINGS,
  type SecondHandProductMapping,
} from './second-hand-product-mapping'
import {
  MARKETPLACE_ID_ALLOWLIST,
  type SecondHandMarketplaceIdAllowlist,
} from './second-hand-marketplace-id'
import type { SecondHandPriceObservation } from './second-hand-data'

export const EBAY_BROWSE_MARKETPLACE = 'EBAY_ES'
/** Ningún `conditionId` de `EBAY_ES` está admitido: la categoría no está verificada. */
export const EBAY_ES_ADMITTED_CONDITION_IDS: readonly number[] = []

const PRICE_PATTERN = /^(?:[1-9]\d{0,11}|0)(?:\.\d{1,2})?$/
const CONDITION_ID_PATTERN = /^[0-9]{3,5}$/
const LISTING_ID_PATTERN = /^[A-Za-z0-9|._~-]{1,128}$/
const EPID_PATTERN = /^[0-9A-Za-z][0-9A-Za-z._-]{0,63}$/
const AFFILIATE_KEYS = new Set(['campid', 'customid', 'mkcid', 'mkevt', 'mkrid', 'toolid'])

export const BROWSE_OFFER_BLOCKERS = [
  'not-an-item',
  'missing-epid',
  'listing-id-is-not-a-product-id',
  'no-verified-mapping',
  'ambiguous-mapping',
  'marketplace-mismatch',
  'price-invalid',
  'currency-invalid',
  'condition-absent',
  'condition-not-admitted',
  'condition-not-normalizable',
  'listing-url-rejected',
  'affiliate-parameter-rejected',
  'observed-at-missing',
  'outside-display-window',
  'observation-rejected',
] as const

export type BrowseOfferBlocker = (typeof BROWSE_OFFER_BLOCKERS)[number]

/** Campos leídos de un `Item` o `ItemSummary`. Lo que no viene queda en null. */
export interface EbayBrowseItemFields {
  itemId: string | null
  legacyItemId: string | null
  epid: string | null
  priceValue: string | null
  currency: string | null
  conditionId: string | null
  itemWebUrl: string | null
  listingMarketplaceId: string | null
  categoryId: string | null
}

export type BrowseOfferAssociation = {
  observation: SecondHandPriceObservation | null
  productId: string | null
  listingId: string | null
  epid: string | null
  blockers: BrowseOfferBlocker[]
}

export function readEbayBrowseItemFields(value: unknown): EbayBrowseItemFields | null {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return null
  const record = value as Record<string, unknown>
  const price = readAmount(record.price)
  return {
    itemId: readToken(record.itemId, LISTING_ID_PATTERN),
    legacyItemId: readToken(record.legacyItemId, LISTING_ID_PATTERN),
    epid: readEpid(record.epid, record.itemId, record.legacyItemId),
    priceValue: price.priceValue ?? readToken(record.priceValue, PRICE_PATTERN),
    currency: price.currency ?? (typeof record.currency === 'string' ? record.currency : null),
    conditionId: readToken(record.conditionId, CONDITION_ID_PATTERN),
    itemWebUrl: typeof record.itemWebUrl === 'string' ? record.itemWebUrl : null,
    listingMarketplaceId: typeof record.listingMarketplaceId === 'string' ? record.listingMarketplaceId : null,
    categoryId: typeof record.categoryId === 'string' && record.categoryId.trim() ? record.categoryId : null,
  }
}

/**
 * Asocia el anuncio solo por ePID validado y publica una observación solo si
 * `ebayOfferToObservation` la acepta. No calcula ahorro, mínimo, máximo, score
 * ni tendencia. La lista de condiciones admitidas por defecto está vacía.
 */
export function associateBrowseItem(
  value: unknown,
  options: {
    mappings?: readonly SecondHandProductMapping[]
    allowlist?: SecondHandMarketplaceIdAllowlist
    admittedConditionIds?: readonly number[]
    observedAt?: string
    now: number
    requestMarketplaceId?: string
  },
): BrowseOfferAssociation {
  const fields = readEbayBrowseItemFields(value)
  if (!fields) {
    return { observation: null, productId: null, listingId: null, epid: null, blockers: ['not-an-item'] }
  }
  const blockers = new Set<BrowseOfferBlocker>()
  const listingId = fields.itemId
  if (fields.epid === null) {
    if (sameListingToken(value, 'epid')) blockers.add('listing-id-is-not-a-product-id')
    else blockers.add('missing-epid')
  }
  const match = fields.epid === null
    ? { productId: null as string | null, externalProductId: null as string | null, ambiguous: false }
    : matchEpid(fields.epid, options.mappings ?? SECOND_HAND_PRODUCT_MAPPINGS, options.allowlist ?? MARKETPLACE_ID_ALLOWLIST)
  if (match.ambiguous) blockers.add('ambiguous-mapping')
  else if (fields.epid !== null && match.productId === null) blockers.add('no-verified-mapping')

  if (!marketplaceIsSpain(fields.listingMarketplaceId, options.requestMarketplaceId)) {
    blockers.add('marketplace-mismatch')
  }

  const price = priceNumber(fields.priceValue)
  if (price === null) blockers.add('price-invalid')
  const currency = normalizeEbayCurrency(fields.currency)
  if (currency === null) blockers.add('currency-invalid')

  const conditionId = conditionNumber(fields.conditionId)
  if (conditionId === null) blockers.add('condition-absent')
  else if (!(options.admittedConditionIds ?? EBAY_ES_ADMITTED_CONDITION_IDS).includes(conditionId)) {
    blockers.add('condition-not-admitted')
  } else if (!normalizeEbayCondition(conditionId, true)) blockers.add('condition-not-normalizable')

  const sourceUrl = acceptedListingUrl(fields.itemWebUrl, blockers)
  if (!options.observedAt) blockers.add('observed-at-missing')
  else if (!isEbayListingWithinDisplayWindow(options.observedAt, options.now)) blockers.add('outside-display-window')

  if (
    blockers.size > 0
    || price === null
    || currency === null
    || conditionId === null
    || sourceUrl === null
    || match.productId === null
    || match.externalProductId === null
    || !options.observedAt
  ) {
    return {
      observation: null,
      productId: match.productId,
      listingId,
      epid: fields.epid,
      blockers: [...blockers],
    }
  }

  const mapping: EbayProductMapping = {
    productId: match.productId,
    externalProductId: match.externalProductId,
    verified: true,
  }
  const observation = ebayOfferToObservation({
    productId: match.productId,
    externalProductId: match.externalProductId,
    price,
    currency,
    sourceUrl,
    conditionId,
    conditionAdmitted: true,
    observedAt: options.observedAt,
  }, mapping, options.now)
  if (!observation) {
    blockers.add('observation-rejected')
    return { observation: null, productId: match.productId, listingId, epid: fields.epid, blockers: [...blockers] }
  }
  return {
    observation: {
      ...observation,
      referencePrice: null,
      minPrice: null,
      maxPrice: null,
    },
    productId: match.productId,
    listingId,
    epid: fields.epid,
    blockers: [],
  }
}

function matchEpid(
  epid: string,
  mappings: readonly SecondHandProductMapping[],
  allowlist: SecondHandMarketplaceIdAllowlist,
): { productId: string | null, externalProductId: string | null, ambiguous: boolean } {
  const hits = mappings.flatMap((mapping) => {
    const external = asExternalMapping(mapping, allowlist)
    if (!external.verified || external.externalProductId !== epid) return []
    return [{ productId: external.productId, externalProductId: external.externalProductId }]
  })
  if (hits.length !== 1) return { productId: null, externalProductId: null, ambiguous: hits.length > 1 }
  return { productId: hits[0].productId, externalProductId: hits[0].externalProductId, ambiguous: false }
}

function marketplaceIsSpain(listed: string | null, requested: string | undefined): boolean {
  if (requested !== undefined && requested !== EBAY_BROWSE_MARKETPLACE) return false
  if (listed !== null && listed !== EBAY_BROWSE_MARKETPLACE) return false
  return listed === EBAY_BROWSE_MARKETPLACE || requested === EBAY_BROWSE_MARKETPLACE
}

function priceNumber(value: string | null): number | null {
  if (value === null || !PRICE_PATTERN.test(value)) return null
  const amount = Number(value)
  if (!Number.isFinite(amount)) return null
  return normalizeEbayPrice(amount)
}

function conditionNumber(value: string | null): number | null {
  if (value === null || !CONDITION_ID_PATTERN.test(value)) return null
  const parsed = Number(value)
  return Number.isInteger(parsed) ? parsed : null
}

function acceptedListingUrl(value: string | null, blockers: Set<BrowseOfferBlocker>): string | null {
  if (value === null) {
    blockers.add('listing-url-rejected')
    return null
  }
  let url: URL
  try {
    url = new URL(value.trim())
  } catch {
    blockers.add('listing-url-rejected')
    return null
  }
  const host = url.hostname.toLowerCase()
  if (host === 'ebay.com' || host.endsWith('.ebay.com') || host === 'ebay.es' || host.endsWith('.ebay.es') || host.includes('ebay')) {
    blockers.add('listing-url-rejected')
  }
  for (const key of url.searchParams.keys()) {
    if (AFFILIATE_KEYS.has(key.toLowerCase())) blockers.add('affiliate-parameter-rejected')
  }
  const accepted = normalizeEbaySourceUrl(value)
  if (accepted === null) {
    if (!blockers.has('listing-url-rejected') && !blockers.has('affiliate-parameter-rejected')) {
      blockers.add('listing-url-rejected')
    }
    return null
  }
  return accepted
}

function readAmount(value: unknown): { priceValue: string | null, currency: string | null } {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return { priceValue: null, currency: null }
  const record = value as { value?: unknown, currency?: unknown }
  return {
    priceValue: typeof record.value === 'string' ? record.value : null,
    currency: typeof record.currency === 'string' ? record.currency : null,
  }
}

function readToken(value: unknown, pattern: RegExp): string | null {
  if (typeof value !== 'string' || !pattern.test(value)) return null
  return value
}

function readEpid(epid: unknown, itemId: unknown, legacyItemId: unknown): string | null {
  if (typeof epid !== 'string' || !EPID_PATTERN.test(epid)) return null
  if (epid === itemId || epid === legacyItemId) return null
  if (epid.includes('://')) return null
  return epid
}

function sameListingToken(value: unknown, key: 'epid'): boolean {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return false
  const record = value as Record<string, unknown>
  const candidate = record[key]
  if (typeof candidate !== 'string') return false
  return candidate === record.itemId || candidate === record.legacyItemId
}
