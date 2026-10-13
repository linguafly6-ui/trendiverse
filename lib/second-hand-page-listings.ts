/**
 * Anuncios que las páginas de segunda mano pueden recibir.
 * No hay lecturas guardadas y no se consulta eBay. La compuerta de
 * producción sigue vacía: sin proveedor, sin condiciones admitidas y
 * sin un identificador validado no sale ningún anuncio.
 */

import type { EbayListing } from './ebay-listing'
import { visibleEbayListings } from './ebay-second-hand-gate'

const NO_READINGS: readonly EbayListing[] = []

export function listingsForSecondHandProduct(
  productId: string,
  now = Date.now(),
  readings: readonly EbayListing[] = NO_READINGS,
): EbayListing[] {
  return visibleEbayListings(productId, readings, now)
}
