/**
 * Anuncios que las páginas de segunda mano pueden recibir.
 * No hay lecturas guardadas y no se consulta eBay. La compuerta de
 * producción sigue vacía: sin proveedor, sin condiciones admitidas y
 * sin un identificador validado no sale ningún anuncio.
 */

import type { EbayListing } from './ebay-listing'
import { listingsForSecondHandPage } from './ebay-browse-page-source'
import { visibleEbayListings } from './ebay-second-hand-gate'

const NO_READINGS: readonly EbayListing[] = []

export function listingsForSecondHandProduct(
  productId: string,
  now = Date.now(),
  readings: readonly EbayListing[] = NO_READINGS,
): EbayListing[] {
  return visibleEbayListings(productId, readings, now)
}

export async function listingsForSecondHandRoute(productId: string, now = Date.now()): Promise<EbayListing[]> {
  const gated = await listingsForSecondHandPage(productId, now)
  return gated.length === 0 ? listingsForSecondHandProduct(productId, now) : gated
}
