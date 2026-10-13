/**
 * Anuncio de Browse, separado del producto editorial del catálogo.
 *
 * No llama a eBay, no lee credenciales y no enciende el proveedor.
 * Una búsqueda por ePID solo crea candidatos. La asociación verificada
 * exige el cuerpo de una lectura detallada y un identificador que ya cumpla
 * el contrato de marketplace. La lista de condiciones de EBAY_ES sigue vacía,
 * así que ningún anuncio es publicable. Una campaña de EPN, si existe,
 * solo monetiza el enlace.
 */

import {
  EBAY_BROWSE_SOURCE_ENABLED,
  EBAY_LISTING_MAX_AGE_MS,
  isEbayListingWithinDisplayWindow,
  normalizeEbayCurrency,
  normalizeEbayPrice,
} from './ebay-browse-adapter'
import {
  MARKETPLACE_ID_ALLOWLIST,
  type SecondHandMarketplaceIdAllowlist,
} from './second-hand-marketplace-id'
import {
  asExternalMapping,
  SECOND_HAND_PRODUCT_MAPPINGS,
  type SecondHandProductMapping,
} from './second-hand-product-mapping'

/** Ningún conditionId de EBAY_ES está admitido: la política de la categoría no está aprobada. */
export const EBAY_ES_ADMITTED_CONDITION_IDS: readonly number[] = []

/**
 * El repositorio no contiene una campaña. No es el interruptor de la consulta:
 * la monetización lee `EBAY_EPN_CAMPAIGN_ID` en el entorno y, si falta, se apaga.
 */
export const EBAY_EPN_CONFIGURED: boolean = false

/** Diez dígitos, el formato que la guía Browse asigna a `affiliateCampaignId`. Sin valor por defecto. */
export const EBAY_EPN_CAMPAIGN_ID_PATTERN = /^[0-9]{10}$/

export type EbayEpnCampaignRead =
  | { status: 'absent' }
  | { status: 'invalid' }
  | { status: 'ok', campaignId: string }

/**
 * El identificador de campaña no es un booleano. Vacío es ausencia.
 * Cualquier otro valor que no sean diez dígitos queda inválido y no se usa.
 */
export function readEbayEpnCampaignId(value: unknown): EbayEpnCampaignRead {
  if (value == null || value === '') return { status: 'absent' }
  if (typeof value !== 'string' || !EBAY_EPN_CAMPAIGN_ID_PATTERN.test(value)) return { status: 'invalid' }
  return { status: 'ok', campaignId: value }
}

export const EBAY_LISTING_DISCLOSURE = 'El enlace abre un anuncio de eBay. Trendiverse no vende ese artículo y no cobra comisión por él.'

export const EBAY_AFFILIATE_LISTING_DISCLOSURE = 'El enlace abre un anuncio de eBay. Trendiverse no vende ese artículo. Este enlace lleva seguimiento de afiliado: una compra puede generar una comisión.'

const LISTING_ID_PATTERN = /^[A-Za-z0-9|._~-]{1,128}$/
const LEGACY_ITEM_ID_PATTERN = /^[1-9][0-9]{0,19}$/
const EPID_PATTERN = /^[0-9A-Za-z][0-9A-Za-z._-]{0,63}$/
const GTIN_PATTERN = /^[0-9]{8,14}$/
const CONDITION_ID_PATTERN = /^[0-9]{3,5}$/
const PRICE_PATTERN = /^(?:[1-9]\d{0,11}|0)(?:\.\d{1,2})?$/
const CATEGORY_ID_PATTERN = /^[0-9A-Za-z][0-9A-Za-z._-]{0,63}$/
const AFFILIATE_KEYS = new Set(['campid', 'customid', 'mkcid', 'mkevt', 'mkrid', 'toolid'])

export const EBAY_LISTING_ASSOCIATION_STATUSES = ['candidate', 'unverified', 'verified'] as const
export type EbayListingAssociationStatus = (typeof EBAY_LISTING_ASSOCIATION_STATUSES)[number]

export const EBAY_LISTING_ASSOCIATION_REASONS = [
  'search-candidate',
  'search-does-not-verify',
  'incomplete-item',
  'missing-epid',
  'listing-id-is-not-a-product-id',
  'epid-conflict',
  'variant-epid',
  'no-verified-mapping',
  'ambiguous-mapping',
  'missing-marketplace',
  'marketplace-mismatch',
  'category-not-recorded',
  'missing-category',
  'incompatible-category',
  'gtin-does-not-verify',
] as const
export type EbayListingAssociationReason = (typeof EBAY_LISTING_ASSOCIATION_REASONS)[number]

export type EbayListingUrlDiscarded = 'affiliate' | 'unsafe' | null

export interface EbayListingPrice {
  value: string
  currency: string
}

export interface EbayListingProductIdentifiers {
  epid: string | null
  gtin: string | null
}

export interface EbayListingAssociation {
  status: EbayListingAssociationStatus
  productId: string | null
  reasons: EbayListingAssociationReason[]
}

/**
 * Solo contiene datos presentes en el cuerpo o en la marca de lectura que
 * aporta quien ya recibió la respuesta. Lo ausente queda en null.
 */
export interface EbayListing {
  itemId: string | null
  legacyItemId: string | null
  itemWebUrl: string | null
  urlDiscarded: EbayListingUrlDiscarded
  price: EbayListingPrice | null
  condition: string | null
  conditionId: string | null
  originalCondition: string | null
  marketplaceId: string | null
  categoryId: string | null
  readAt: string | null
  itemCreationDate: string | null
  productIdentifiers: EbayListingProductIdentifiers
  association: EbayListingAssociation
  monetized: boolean
}

export type EbayListingSource = 'detail' | 'search-summary' | 'epid-candidate'

export interface EbayListingReadContext {
  source: EbayListingSource
  readAt?: string | null
  queriedEpid?: string | null
  expectedCategoryId?: string | null
  mappings?: readonly SecondHandProductMapping[]
  allowlist?: SecondHandMarketplaceIdAllowlist
}

export interface EbayListingCacheEntry {
  listing: EbayListing
  readAt: number
  expiresAt: number
}

export interface EbayListingEmptyEntry {
  readAt: number
  expiresAt: number
}

export type EbayListingCacheRead =
  | { status: 'hit', listing: EbayListing }
  | { status: 'expired' }
  | { status: 'miss' }

export type EbayListingEmptyRead =
  | { status: 'empty' }
  | { status: 'expired' }
  | { status: 'miss' }

export function listingFromEpidCandidate(
  candidate: Record<string, unknown>,
  readAt?: string | null,
): EbayListing {
  const itemId = readToken(candidate.itemId, LISTING_ID_PATTERN)
  return blankListing({
    itemId,
    readAt: readTimestamp(readAt),
    association: itemId === null
      ? { status: 'unverified', productId: null, reasons: ['incomplete-item'] }
      : { status: 'candidate', productId: null, reasons: ['search-candidate'] },
  })
}

/**
 * Lee un cuerpo de Browse. `source: 'detail'` es la única vía que puede
 * verificar la asociación, y solo con el ePID que venga en ese cuerpo.
 * El ePID de la búsqueda no se copia al anuncio.
 */
export function readEbayListing(value: unknown, context: EbayListingReadContext): EbayListing {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    return blankListing({
      readAt: readTimestamp(context.readAt),
      association: { status: 'unverified', productId: null, reasons: ['incomplete-item'] },
    })
  }
  const record = value as Record<string, unknown>
  const itemId = readToken(record.itemId, LISTING_ID_PATTERN)
  const legacyItemId = readToken(record.legacyItemId, LEGACY_ITEM_ID_PATTERN)
  const identifiers = readProductIdentifiers(record, itemId, legacyItemId)
  const url = readListingUrl(record.itemWebUrl, record.itemAffiliateWebUrl)
  const listing = blankListing({
    itemId,
    legacyItemId,
    itemWebUrl: url.itemWebUrl,
    urlDiscarded: url.discarded,
    price: readPrice(record.price),
    condition: readExactText(record.condition),
    conditionId: readToken(record.conditionId, CONDITION_ID_PATTERN),
    originalCondition: readExactText(record.conditionDescription),
    marketplaceId: readExactText(record.listingMarketplaceId),
    categoryId: readToken(record.categoryId, CATEGORY_ID_PATTERN),
    readAt: readTimestamp(context.readAt),
    itemCreationDate: readTimestamp(record.itemCreationDate),
    productIdentifiers: { epid: identifiers.epid, gtin: identifiers.gtin },
  })

  if (context.source !== 'detail') {
    if (itemId === null && legacyItemId === null) {
      listing.association = { status: 'unverified', productId: null, reasons: ['incomplete-item'] }
      return listing
    }
    listing.association = {
      status: 'candidate',
      productId: null,
      reasons: [context.source === 'epid-candidate' ? 'search-candidate' : 'search-does-not-verify'],
    }
    return listing
  }

  listing.association = verifyDetail(listing, identifiers, context)
  return listing
}

/** La búsqueda no verifica. Devuelve el id que una lectura detallada tendría que pedir. */
export function detailReadingForCandidate(listing: EbayListing): { itemId: string } | null {
  if (listing.association.status !== 'candidate' || listing.itemId === null) return null
  return { itemId: listing.itemId }
}

export function partitionEbayListings(listings: readonly EbayListing[]): {
  candidates: EbayListing[]
  unverified: EbayListing[]
  verified: EbayListing[]
} {
  const candidates: EbayListing[] = []
  const unverified: EbayListing[] = []
  const verified: EbayListing[] = []
  for (const listing of listings) {
    if (listing.association.status === 'verified' && listing.association.productId !== null) verified.push(listing)
    else if (listing.association.status === 'candidate') candidates.push(listing)
    else unverified.push(listing)
  }
  return { candidates, unverified, verified }
}

export function confirmedListingAssociations(listings: readonly EbayListing[], productId?: string): EbayListing[] {
  return partitionEbayListings(listings).verified.filter((listing) => productId === undefined || listing.association.productId === productId)
}

/**
 * Un anuncio verificado sigue sin poder publicarse mientras el proveedor de
 * métricas esté apagado o la lista de condiciones siga vacía. La campaña de
 * EPN no entra en esta decisión: sin ella el enlace es la ficha ordinaria.
 */
export function ebayListingPublishable(listing: EbayListing, now: number): boolean {
  const providerEnabled: boolean = EBAY_BROWSE_SOURCE_ENABLED
  if (!providerEnabled) return false
  if (EBAY_ES_ADMITTED_CONDITION_IDS.length === 0) return false
  if (listing.association.status !== 'verified' || listing.association.productId === null) return false
  if (listing.price === null || listing.conditionId === null || listing.readAt === null) return false
  if (!ebayListingLinkIsDisplayable(listing)) return false
  if (!isEbayListingWithinDisplayWindow(listing.readAt, now)) return false
  const conditionId = Number(listing.conditionId)
  if (!Number.isInteger(conditionId) || !EBAY_ES_ADMITTED_CONDITION_IDS.includes(conditionId)) return false
  return true
}

/**
 * Usa `itemAffiliateWebUrl` solo si Browse la devolvió y su `campid` es la
 * campaña validada. No añade parámetros a `itemWebUrl`.
 */
export function applyBrowseAffiliateUrl(
  listing: EbayListing,
  itemAffiliateWebUrl: unknown,
  campaignId: string,
): EbayListing {
  const campaign = readEbayEpnCampaignId(campaignId)
  if (campaign.status !== 'ok') return listing
  if (typeof itemAffiliateWebUrl !== 'string' || itemAffiliateWebUrl.length === 0 || itemAffiliateWebUrl !== itemAffiliateWebUrl.trim()) {
    return listing
  }
  const accepted = acceptAffiliateItemUrl(itemAffiliateWebUrl, campaign.campaignId)
  if (!accepted || listing.legacyItemId === null || accepted.itemId !== listing.legacyItemId) return listing
  return {
    ...listing,
    itemWebUrl: itemAffiliateWebUrl,
    urlDiscarded: null,
    monetized: true,
  }
}

/** La ficha visible es una URL de ebay.es ya aceptada. Un enlace monetizado tiene que ser el de afiliado. */
export function ebayListingLinkIsDisplayable(listing: Pick<EbayListing, 'itemWebUrl' | 'urlDiscarded' | 'monetized'>): boolean {
  if (listing.urlDiscarded !== null || listing.itemWebUrl === null) return false
  if (listing.monetized) return affiliateUrlIsWellFormed(listing.itemWebUrl)
  return !urlHasAffiliateKey(listing.itemWebUrl)
}

export function createEbayListingCache() {
  const listings = new Map<string, EbayListingCacheEntry>()
  const emptyQueries = new Map<string, EbayListingEmptyEntry>()

  return {
    remember(listing: EbayListing, readAt: number): 'stored' | 'ignored' {
      if (listing.itemId === null || !Number.isFinite(readAt)) return 'ignored'
      listings.set(listing.itemId, {
        listing,
        readAt,
        expiresAt: readAt + EBAY_LISTING_MAX_AGE_MS,
      })
      return 'stored'
    },
    rememberEmpty(queryKey: string, readAt: number): 'stored' | 'ignored' {
      if (!queryKey || !Number.isFinite(readAt)) return 'ignored'
      emptyQueries.set(queryKey, { readAt, expiresAt: readAt + EBAY_LISTING_MAX_AGE_MS })
      return 'stored'
    },
    noteRefreshFailure(itemId: string): { extended: false, expiresAt: number | null } {
      const current = listings.get(itemId)
      return { extended: false, expiresAt: current?.expiresAt ?? null }
    },
    read(itemId: string, now: number): EbayListingCacheRead {
      const entry = listings.get(itemId)
      if (!entry) return { status: 'miss' }
      if (!Number.isFinite(now) || now > entry.expiresAt) return { status: 'expired' }
      return { status: 'hit', listing: entry.listing }
    },
    readEmpty(queryKey: string, now: number): EbayListingEmptyRead {
      const entry = emptyQueries.get(queryKey)
      if (!entry) return { status: 'miss' }
      if (!Number.isFinite(now) || now > entry.expiresAt) return { status: 'expired' }
      return { status: 'empty' }
    },
  }
}

function verifyDetail(
  listing: EbayListing,
  identifiers: { epid: string | null, gtin: string | null, conflict: boolean, listingIdUsedAsEpid: boolean },
  context: EbayListingReadContext,
): EbayListingAssociation {
  const reasons = new Set<EbayListingAssociationReason>()
  if (listing.itemId === null && listing.legacyItemId === null) reasons.add('incomplete-item')
  if (identifiers.conflict) reasons.add('epid-conflict')
  if (identifiers.listingIdUsedAsEpid) reasons.add('listing-id-is-not-a-product-id')
  if (identifiers.epid === null && !identifiers.conflict && !identifiers.listingIdUsedAsEpid) reasons.add('missing-epid')
  if (identifiers.gtin !== null && identifiers.epid === null) reasons.add('gtin-does-not-verify')

  const queried = readToken(context.queriedEpid, EPID_PATTERN)
  if (queried !== null && identifiers.epid !== null && queried !== identifiers.epid) reasons.add('variant-epid')

  const match = identifiers.epid === null
    ? { productId: null as string | null, ambiguous: false }
    : matchEpid(identifiers.epid, context.mappings ?? SECOND_HAND_PRODUCT_MAPPINGS, context.allowlist ?? MARKETPLACE_ID_ALLOWLIST)
  if (match.ambiguous) reasons.add('ambiguous-mapping')
  else if (identifiers.epid !== null && match.productId === null) reasons.add('no-verified-mapping')

  if (listing.marketplaceId === null) reasons.add('missing-marketplace')
  else if (listing.marketplaceId !== 'EBAY_ES') reasons.add('marketplace-mismatch')

  const expectedCategory = readToken(context.expectedCategoryId, CATEGORY_ID_PATTERN)
  if (expectedCategory === null) reasons.add('category-not-recorded')
  else if (listing.categoryId === null) reasons.add('missing-category')
  else if (listing.categoryId !== expectedCategory) reasons.add('incompatible-category')

  if (reasons.size > 0 || match.productId === null) {
    return { status: 'unverified', productId: null, reasons: [...reasons] }
  }
  return { status: 'verified', productId: match.productId, reasons: [] }
}

function matchEpid(
  epid: string,
  mappings: readonly SecondHandProductMapping[],
  allowlist: SecondHandMarketplaceIdAllowlist,
): { productId: string | null, ambiguous: boolean } {
  const hits = mappings.flatMap((mapping) => {
    const external = asExternalMapping(mapping, allowlist)
    if (!external.verified || external.externalProductId !== epid) return []
    return [external.productId]
  })
  if (hits.length !== 1) return { productId: null, ambiguous: hits.length > 1 }
  return { productId: hits[0], ambiguous: false }
}

function readProductIdentifiers(
  record: Record<string, unknown>,
  itemId: string | null,
  legacyItemId: string | null,
): { epid: string | null, gtin: string | null, conflict: boolean, listingIdUsedAsEpid: boolean } {
  const top = readEpid(record.epid, itemId, legacyItemId)
  const nestedRecord = record.product
  const nested = nestedRecord && typeof nestedRecord === 'object' && !Array.isArray(nestedRecord)
    ? readEpid((nestedRecord as Record<string, unknown>).epid, itemId, legacyItemId)
    : null
  const listingIdUsedAsEpid = typeof record.epid === 'string' && (record.epid === itemId || record.epid === legacyItemId)
  if (top !== null && nested !== null && top !== nested) {
    return { epid: null, gtin: readToken(record.gtin, GTIN_PATTERN), conflict: true, listingIdUsedAsEpid }
  }
  return {
    epid: top ?? nested,
    gtin: readToken(record.gtin, GTIN_PATTERN),
    conflict: false,
    listingIdUsedAsEpid,
  }
}

function readEpid(value: unknown, itemId: string | null, legacyItemId: string | null): string | null {
  if (typeof value !== 'string' || !EPID_PATTERN.test(value)) return null
  if (value === itemId || value === legacyItemId) return null
  if (value.includes('://')) return null
  return value
}

function readPrice(value: unknown): EbayListingPrice | null {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return null
  const amount = value as { value?: unknown, currency?: unknown }
  if (typeof amount.value !== 'string' || !PRICE_PATTERN.test(amount.value)) return null
  if (normalizeEbayPrice(Number(amount.value)) === null) return null
  const currency = normalizeEbayCurrency(amount.currency)
  if (currency === null) return null
  return { value: amount.value, currency }
}

function readListingUrl(itemWebUrl: unknown, itemAffiliateWebUrl: unknown): { itemWebUrl: string | null, discarded: EbayListingUrlDiscarded } {
  const affiliateFieldPresent = typeof itemAffiliateWebUrl === 'string' && itemAffiliateWebUrl.trim().length > 0
  const parsed = parseListingUrl(itemWebUrl)
  if (parsed.itemWebUrl !== null) return parsed
  if (parsed.discarded === 'affiliate') return parsed
  if (affiliateFieldPresent && (typeof itemWebUrl !== 'string' || itemWebUrl.trim() === '')) {
    return { itemWebUrl: null, discarded: 'affiliate' }
  }
  return parsed
}

function acceptAffiliateItemUrl(value: string, campaignId: string): { itemId: string } | null {
  const url = readEbayItemUrl(value)
  if (!url) return null
  const campids = url.searchParams.getAll('campid')
  if (campids.length !== 1 || campids[0] !== campaignId) return null
  for (const key of url.searchParams.keys()) {
    if (!AFFILIATE_KEYS.has(key.toLowerCase())) return null
  }
  const itemId = url.pathname.match(/^\/itm\/([A-Za-z0-9|._~-]{1,128})\/?$/)?.[1]
  return itemId ? { itemId } : null
}

function affiliateUrlIsWellFormed(value: string): boolean {
  const url = readEbayItemUrl(value)
  if (!url) return false
  const campids = url.searchParams.getAll('campid')
  if (campids.length !== 1 || !EBAY_EPN_CAMPAIGN_ID_PATTERN.test(campids[0])) return false
  for (const key of url.searchParams.keys()) {
    if (!AFFILIATE_KEYS.has(key.toLowerCase())) return false
  }
  return /^\/itm\/[A-Za-z0-9|._~-]{1,128}\/?$/.test(url.pathname)
}

function urlHasAffiliateKey(value: string): boolean {
  let url: URL
  try {
    url = new URL(value)
  } catch {
    return true
  }
  for (const key of url.searchParams.keys()) {
    if (AFFILIATE_KEYS.has(key.toLowerCase())) return true
  }
  return false
}

function readEbayItemUrl(value: string): URL | null {
  let url: URL
  try {
    url = new URL(value)
  } catch {
    return null
  }
  if (url.protocol !== 'https:' || url.username || url.password || url.port || url.hash) return null
  const host = url.hostname.toLowerCase()
  if (host !== 'www.ebay.es' && host !== 'ebay.es') return null
  if (!/^\/itm\/[A-Za-z0-9|._~-]{1,128}\/?$/.test(url.pathname)) return null
  return url
}

function parseListingUrl(itemWebUrl: unknown): { itemWebUrl: string | null, discarded: EbayListingUrlDiscarded } {
  if (typeof itemWebUrl !== 'string' || itemWebUrl.trim() === '') return { itemWebUrl: null, discarded: null }
  let url: URL
  try {
    url = new URL(itemWebUrl)
  } catch {
    return { itemWebUrl: null, discarded: 'unsafe' }
  }
  if (url.protocol !== 'https:' || url.username || url.password) return { itemWebUrl: null, discarded: 'unsafe' }
  const host = url.hostname.toLowerCase()
  if (host !== 'www.ebay.es' && host !== 'ebay.es') return { itemWebUrl: null, discarded: 'unsafe' }
  if (!/^\/itm\/[A-Za-z0-9|._~-]{1,128}\/?$/.test(url.pathname)) return { itemWebUrl: null, discarded: 'unsafe' }
  for (const key of url.searchParams.keys()) {
    if (AFFILIATE_KEYS.has(key.toLowerCase())) return { itemWebUrl: null, discarded: 'affiliate' }
  }
  return { itemWebUrl: url.toString(), discarded: null }
}

function readExactText(value: unknown): string | null {
  if (typeof value !== 'string' || value.length < 1 || value.trim() !== value) return null
  return value
}

function readToken(value: unknown, pattern: RegExp): string | null {
  if (typeof value !== 'string' || !pattern.test(value)) return null
  return value
}

function readTimestamp(value: unknown): string | null {
  if (typeof value !== 'string' || value.length < 1 || value.trim() !== value) return null
  if (Number.isNaN(Date.parse(value))) return null
  return value
}

function blankListing(overrides: Partial<EbayListing> & { association?: EbayListingAssociation } = {}): EbayListing {
  return {
    itemId: null,
    legacyItemId: null,
    itemWebUrl: null,
    urlDiscarded: null,
    price: null,
    condition: null,
    conditionId: null,
    originalCondition: null,
    marketplaceId: null,
    categoryId: null,
    readAt: null,
    itemCreationDate: null,
    productIdentifiers: { epid: null, gtin: null },
    association: { status: 'unverified', productId: null, reasons: ['incomplete-item'] },
    monetized: false,
    ...overrides,
  }
}
