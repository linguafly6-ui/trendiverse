/**
 * Expediente pendiente de eBay España para `nintendo-switch`.
 *
 * No llama a eBay, no escribe el mapping y no enciende el adapter.
 * Los ePID de este archivo se leyeron en fichas públicas de catálogo.
 * Ninguno es el identificador canónico del producto verificado.
 */

import { normalizeEbaySourceUrl } from './ebay-browse-adapter'
import { EBAY_ES_ADMITTED_CONDITION_IDS } from './ebay-browse-offer'
import { MARKETPLACE_ID_ALLOWLIST } from './second-hand-marketplace-id'
import { secondHandProductMapping } from './second-hand-product-mapping'

export const EBAY_ES_DOSSIER_CHECKED_ON = '2026-10-11'
export const EBAY_ES_DOSSIER_STATUS = 'pending' as const
export const EBAY_ES_CONDITION_HELP_URL = 'https://www.ebay.es/help/selling/listings/creating-managing-listings/item-conditions-category?id=4765'
export const EBAY_ES_MARKETPLACE_DOC_URL = 'https://developer.ebay.com/develop/api/spec/browse_api.json'
/** La política vigente rechaza cualquier host de eBay. Esta constante no la cambia. */
export const LISTING_SOURCE_URL_POLICY = 'reject-ebay-host' as const

const AFFILIATE_KEYS = new Set(['campid', 'customid', 'mkcid', 'mkevt', 'mkrid', 'toolid'])

/**
 * Fichas de www.ebay.es leídas el 2026-10-11.
 * Cada una etiqueta su ePID junto a HEG-001 y 64 GB, y fija un color distinto.
 */
export const EBAY_ES_OBSERVED_CATALOG_PRODUCTS = [
  {
    epid: '21048307585',
    catalogUrl: 'https://www.ebay.es/p/21048307585',
    publishedTitle: 'Nintendo Switch Modelo OLED HEG-001 Consola Portátil - 64GB - Blanco',
    modelNumber: 'HEG-001',
    storage: '64 GB',
    color: 'Blanco',
    mpn: '10007454',
    ean: '0045496453435',
    categoryBreadcrumb: 'Consolas de videojuegos',
  },
  {
    epid: '23048312547',
    catalogUrl: 'https://www.ebay.es/p/23048312547',
    publishedTitle: 'Nintendo Switch Modelo OLED HEG-001 Consola Portátil - 64GB - Negro/Neon Rojo/Neon Azul',
    modelNumber: 'HEG-001',
    storage: '64 GB',
    color: 'Negro/Neon Rojo/Neon Azul',
    mpn: '10007455',
    ean: '0045496453442',
    categoryBreadcrumb: null,
  },
] as const

/**
 * Otra ficha de HEG-001 y 64 GB. El bloque de identificadores no mostró la
 * etiqueta «eBay Product ID (ePID)». El número del path no se copia como ePID.
 */
export const EBAY_ES_UNLABELED_CATALOG_PAGE = {
  catalogUrl: 'https://www.ebay.es/p/5056057863',
  publishedTitle: 'Nintendo Switch (OLED Model) HEG-001 Edición Splatoon 3 - 64GB - Negro/Azul/Amarillo',
  modelNumber: 'HEG-001',
  storage: '64 GB',
  edition: 'Edición Splatoon 3',
  labeledEpid: null,
} as const

/** Nombres leídos en la ayuda de España. No son `conditionId`. */
export const EBAY_ES_CONDITION_SECTIONS_READ = [
  {
    heading: 'DVD y películas, música y videojuegos',
    names: ['Totalmente nuevo', 'Como nuevo', 'Muy bueno', 'Bueno', 'Aceptable'],
  },
  {
    heading: 'Electrónica, Instrumentos musicales y accesorios',
    names: ['Nuevo', 'Abierto, sin usar', 'Reacondicionado certificado', 'Restaurado por el vendedor', 'Usado', 'Para desguace o que no funciona'],
  },
  {
    heading: 'Coleccionismo, Artesanía y manualidades, Muñecas y peluches, Artículos para animales, Juguetes y aficiones',
    names: ['Nuevo', 'Usado'],
  },
] as const

/** Palabra vista en el anuncio embebido de las fichas. No es un `conditionId`. */
export const EBAY_ES_OBSERVED_CONDITION_WORDS = [
  { word: 'Nuevo', conditionId: null },
] as const

export const EBAY_ES_DOSSIER_BLOCKERS = [
  'canonical-epid-absent',
  'catalog-products-split-by-color',
  'category-id-absent',
  'listing-marketplace-id-unconfirmed',
  'condition-ids-not-admitted',
  'listing-url-policy-unchanged',
  'allowlist-empty',
] as const

export type EbayEsDossierBlocker = (typeof EBAY_ES_DOSSIER_BLOCKERS)[number]

export interface EbayEsProductDossier {
  productId: 'nintendo-switch'
  canonicalEpid: null
  verificationRef: string
  catalogUrl: null
  observedCatalogProducts: typeof EBAY_ES_OBSERVED_CATALOG_PRODUCTS
  unlabeledCatalogPage: typeof EBAY_ES_UNLABELED_CATALOG_PAGE
  checkedOn: typeof EBAY_ES_DOSSIER_CHECKED_ON
  checkSource: string
  marketplace: {
    documentedMarketplaceId: 'EBAY_ES'
    siteHost: 'www.ebay.es'
    marketplaceDocUrl: typeof EBAY_ES_MARKETPLACE_DOC_URL
    categoryId: null
    listingMarketplaceId: null
  }
  admittedConditionIds: typeof EBAY_ES_ADMITTED_CONDITION_IDS
  status: 'pending' | 'verified'
}

export function createEbayEsSwitchDossier(): EbayEsProductDossier {
  const mapping = secondHandProductMapping('nintendo-switch')
  if (mapping?.reviewStatus !== 'verified' || !mapping.verificationRef) {
    throw new Error('nintendo-switch no tiene un verificationRef verificado')
  }
  return {
    productId: 'nintendo-switch',
    canonicalEpid: null,
    verificationRef: mapping.verificationRef,
    catalogUrl: null,
    observedCatalogProducts: EBAY_ES_OBSERVED_CATALOG_PRODUCTS,
    unlabeledCatalogPage: EBAY_ES_UNLABELED_CATALOG_PAGE,
    checkedOn: EBAY_ES_DOSSIER_CHECKED_ON,
    checkSource: 'Fichas públicas de catálogo en www.ebay.es, leídas el 2026-10-11. No se llamó a la Browse API.',
    marketplace: {
      documentedMarketplaceId: 'EBAY_ES',
      siteHost: 'www.ebay.es',
      marketplaceDocUrl: EBAY_ES_MARKETPLACE_DOC_URL,
      categoryId: null,
      listingMarketplaceId: null,
    },
    admittedConditionIds: EBAY_ES_ADMITTED_CONDITION_IDS,
    status: EBAY_ES_DOSSIER_STATUS,
  }
}

export function ebayEsDossierBlockers(dossier: EbayEsProductDossier = createEbayEsSwitchDossier()): EbayEsDossierBlocker[] {
  const blockers: EbayEsDossierBlocker[] = []
  if (dossier.canonicalEpid === null) blockers.push('canonical-epid-absent')
  if (distinctEpids(dossier.observedCatalogProducts).length !== 1) blockers.push('catalog-products-split-by-color')
  if (dossier.marketplace.categoryId === null) blockers.push('category-id-absent')
  if (dossier.marketplace.listingMarketplaceId === null) blockers.push('listing-marketplace-id-unconfirmed')
  if (dossier.admittedConditionIds.length === 0) blockers.push('condition-ids-not-admitted')
  if (LISTING_SOURCE_URL_POLICY === 'reject-ebay-host') blockers.push('listing-url-policy-unchanged')
  if (MARKETPLACE_ID_ALLOWLIST.providers.length === 0 || MARKETPLACE_ID_ALLOWLIST.scopes.length === 0) {
    blockers.push('allowlist-empty')
  }
  return blockers
}

function distinctEpids(products: readonly { epid: string }[]): string[] {
  return [...new Set(products.map((product) => product.epid))]
}

/** El expediente pendiente no autoriza una observación. */
export function ebayEsDossierCanPublish(dossier: EbayEsProductDossier = createEbayEsSwitchDossier()): boolean {
  return dossier.status === 'verified' && ebayEsDossierBlockers(dossier).length === 0
}

export type ListingSourceUrlAssessment =
  | { outcome: 'rejected', reason: 'invalid-url' | 'affiliate-parameter' | 'ebay-host' | 'rejected-by-normalizer' }
  | { outcome: 'accepted-by-current-normalizer', sourceUrl: string }

/**
 * Aplica la política vigente. Un host de eBay y un parámetro de afiliado
 * siguen fuera. Una ficha `/p/` no se convierte en `sourceUrl`.
 */
export function assessListingSourceUrl(value: string): ListingSourceUrlAssessment {
  let url: URL
  try {
    url = new URL(value)
  } catch {
    return { outcome: 'rejected', reason: 'invalid-url' }
  }
  for (const key of url.searchParams.keys()) {
    if (AFFILIATE_KEYS.has(key.toLowerCase())) return { outcome: 'rejected', reason: 'affiliate-parameter' }
  }
  const host = url.hostname.toLowerCase()
  if (host === 'ebay.com' || host.endsWith('.ebay.com') || host === 'ebay.es' || host.endsWith('.ebay.es') || host.includes('ebay')) {
    return { outcome: 'rejected', reason: 'ebay-host' }
  }
  const accepted = normalizeEbaySourceUrl(value)
  if (accepted === null) return { outcome: 'rejected', reason: 'rejected-by-normalizer' }
  return { outcome: 'accepted-by-current-normalizer', sourceUrl: accepted }
}
