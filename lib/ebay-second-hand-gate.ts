/**
 * Compuerta entre un anuncio ya leído y /segunda-mano.
 *
 * No llama a eBay, no lee credenciales y no cambia el flag ni la lista de
 * condiciones. Con la política de producción la compuerta no deja pasar
 * ningún anuncio: el proveedor de métricas sigue apagado, la política de
 * condiciones de EBAY_ES está vacía y no hay un marketplace id validado.
 * La campaña de EPN no cierra esta compuerta.
 */

import {
  EBAY_BROWSE_SOURCE_ENABLED,
  isEbayListingWithinDisplayWindow,
} from './ebay-browse-adapter'
import {
  EBAY_ES_ADMITTED_CONDITION_IDS,
  ebayListingLinkIsDisplayable,
  type EbayListing,
} from './ebay-listing'
import {
  MARKETPLACE_ID_ALLOWLIST,
  type SecondHandMarketplaceIdAllowlist,
} from './second-hand-marketplace-id'
import {
  asExternalMapping,
  SECOND_HAND_PRODUCT_MAPPINGS,
  secondHandProductMapping,
} from './second-hand-product-mapping'

export const EBAY_PUBLICATION_BLOCKERS = [
  'provider-disabled',
  'ebay-es-condition-policy-unapproved',
  'marketplace-id-not-validated',
] as const

export type EbayPublicationBlocker = (typeof EBAY_PUBLICATION_BLOCKERS)[number]

export interface EbayListingPublicationPolicy {
  providerEnabled: boolean
  admittedConditionIds: readonly number[]
}

export const EBAY_PRODUCTION_PUBLICATION_POLICY: EbayListingPublicationPolicy = {
  providerEnabled: EBAY_BROWSE_SOURCE_ENABLED,
  admittedConditionIds: EBAY_ES_ADMITTED_CONDITION_IDS,
}

export function ebayPublicationBlockers(
  productId: string,
  allowlist: SecondHandMarketplaceIdAllowlist = MARKETPLACE_ID_ALLOWLIST,
): EbayPublicationBlocker[] {
  const blockers: EbayPublicationBlocker[] = []
  if (!EBAY_PRODUCTION_PUBLICATION_POLICY.providerEnabled) blockers.push('provider-disabled')
  if (EBAY_PRODUCTION_PUBLICATION_POLICY.admittedConditionIds.length === 0) blockers.push('ebay-es-condition-policy-unapproved')
  const mapping = secondHandProductMapping(productId)
  if (!mapping || !asExternalMapping(mapping, allowlist).verified) blockers.push('marketplace-id-not-validated')
  return blockers
}

/**
 * Anuncios que /segunda-mano puede mostrar para un producto.
 * La política por defecto es la de producción y hoy devuelve una lista vacía.
 * Un fallo de lectura se representa con `listings` vacío: no se inventa un
 * anuncio ni se alarga la caducidad de uno anterior.
 */
export function visibleEbayListings(
  productId: string,
  listings: readonly EbayListing[],
  now: number,
  policy: EbayListingPublicationPolicy = EBAY_PRODUCTION_PUBLICATION_POLICY,
): EbayListing[] {
  if (!policy.providerEnabled || policy.admittedConditionIds.length === 0) return []
  return listings.filter((listing) => listingIsVisible(productId, listing, now, policy.admittedConditionIds))
}

export function listingIsVisible(
  productId: string,
  listing: EbayListing,
  now: number,
  admittedConditionIds: readonly number[],
): boolean {
  if (listing.association.status !== 'verified' || listing.association.productId !== productId) return false
  if (!ebayListingLinkIsDisplayable(listing)) return false
  if (listing.price === null || listing.conditionId === null || listing.readAt === null) return false
  if (!isEbayListingWithinDisplayWindow(listing.readAt, now)) return false
  const conditionId = Number(listing.conditionId)
  if (!Number.isInteger(conditionId) || !admittedConditionIds.includes(conditionId)) return false
  return true
}

/** Ningún producto del catálogo tiene un id de marketplace validado con la allowlist real. */
export function catalogProductsWithValidatedMarketplaceId(
  allowlist: SecondHandMarketplaceIdAllowlist = MARKETPLACE_ID_ALLOWLIST,
): string[] {
  return SECOND_HAND_PRODUCT_MAPPINGS.flatMap((mapping) => (
    asExternalMapping(mapping, allowlist).verified ? [mapping.productId] : []
  ))
}
