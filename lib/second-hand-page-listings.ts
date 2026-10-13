/**
 * Anuncios que las páginas de segunda mano pueden recibir.
 * La compuerta usa la misma política que la consulta. Sin flag, sin
 * condiciones admitidas o sin un identificador validado no sale ningún
 * anuncio. La ausencia de campaña no añade ni quita resultados.
 */

import type { EbayListing } from './ebay-listing'
import { listingsForSecondHandPage, type EbayPageRuntimeConfig } from './ebay-browse-page-source'
import { visibleEbayListings } from './ebay-second-hand-gate'

const NO_READINGS: readonly EbayListing[] = []

export function listingsForSecondHandProduct(
  productId: string,
  now = Date.now(),
  readings: readonly EbayListing[] = NO_READINGS,
): EbayListing[] {
  return visibleEbayListings(productId, readings, now)
}

export async function listingsForSecondHandRoute(
  productId: string,
  now = Date.now(),
  config?: EbayPageRuntimeConfig,
): Promise<EbayListing[]> {
  const gated = await listingsForSecondHandPage(productId, now, config)
  return gated.length === 0 ? listingsForSecondHandProduct(productId, now) : gated
}
