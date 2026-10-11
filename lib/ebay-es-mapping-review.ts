/**
 * Revisión del primer mapping de eBay España.
 *
 * No llama a eBay, no crea slugs y no admite condiciones ni URLs de anuncio.
 * `nintendo-switch` sigue siendo el producto base. La propuesta de URL no
 * sustituye a `normalizeEbaySourceUrl`.
 */

import { normalizeEbaySourceUrl } from './ebay-browse-adapter'
import { EBAY_ES_ADMITTED_CONDITION_IDS, readEbayBrowseItemFields } from './ebay-browse-offer'
import {
  EBAY_ES_OBSERVED_CATALOG_PRODUCTS,
  EBAY_ES_UNLABELED_CATALOG_PAGE,
  LISTING_SOURCE_URL_POLICY,
} from './ebay-es-product-dossier'
import { SECOND_HAND_MAPPING_SCOPES, secondHandProductMapping } from './second-hand-product-mapping'

/** El repositorio no incluye el OpenAPI ni un cliente generado de Sell Metadata. */
export const SELL_METADATA_CONDITION_CONTRACT_IN_REPO = false

const AFFILIATE_KEYS = new Set(['campid', 'customid', 'mkcid', 'mkevt', 'mkrid', 'toolid'])

export interface SwitchCatalogVariantDiagnosis {
  productId: 'nintendo-switch'
  keepExistingSlug: true
  scopes: typeof SECOND_HAND_MAPPING_SCOPES
  attributeKeys: readonly string[]
  editionValue: string | null
  colorIsAnAttribute: boolean
  mpnIsAnAttribute: boolean
  colorSplitNote: string | null
}

/**
 * El catálogo solo distingue `family` y `category`. No hay eje de color ni de MPN.
 * La verificación de la Switch dice que la ficha no parte el modelo por color.
 */
export function diagnoseSwitchCatalogVariant(): SwitchCatalogVariantDiagnosis {
  const mapping = secondHandProductMapping('nintendo-switch')
  if (!mapping) throw new Error('nintendo-switch no está en el catálogo')
  const attributeKeys: readonly string[] = mapping.attributes.map((attribute) => attribute.key)
  return {
    productId: 'nintendo-switch',
    keepExistingSlug: true,
    scopes: SECOND_HAND_MAPPING_SCOPES,
    attributeKeys,
    editionValue: mapping.attributes.find((attribute) => attribute.key === 'edition')?.value ?? null,
    colorIsAnAttribute: attributeKeys.includes('color'),
    mpnIsAnAttribute: attributeKeys.includes('mpn'),
    colorSplitNote: mapping.recordedVerification?.ambiguityResolutions.incompatibleRevision ?? null,
  }
}

export interface EpidAssociationEvidence {
  epid: string
  labeled: boolean
  catalogUrl: string | null
  canAssociate: false
  present: readonly string[]
  missing: readonly string[]
}

const ASSOCIATION_MISSING = [
  'single-epid-for-the-verified-product',
  'separate-variant-with-its-own-verificationRef',
  'categoryId-from-getItem-body',
  'listingMarketplaceId-from-getItem-body',
  'condition-policy-for-that-categoryId',
] as const

/** Qué hay y qué falta para asociar un ePID ya etiquetado. Un path no etiqueta. */
export function evidenceForObservedEpid(epid: string): EpidAssociationEvidence {
  const product = EBAY_ES_OBSERVED_CATALOG_PRODUCTS.find((entry) => entry.epid === epid)
  if (!product) {
    return {
      epid,
      labeled: false,
      catalogUrl: null,
      canAssociate: false,
      present: [],
      missing: ['labeled-epid-on-the-catalog-page', ...ASSOCIATION_MISSING],
    }
  }
  return {
    epid: product.epid,
    labeled: true,
    catalogUrl: product.catalogUrl,
    canAssociate: false,
    present: ['labeled-epid', 'model-number', 'storage', 'color', 'mpn', 'ean', 'catalog-page-on-www.ebay.es'],
    missing: [...ASSOCIATION_MISSING],
  }
}

export interface GetItemCategoryEvidence {
  categoryId: string | null
  listingMarketplaceId: string | null
  ignoredCategoryPath: true
  ignoredItemWebUrl: true
}

/**
 * Lee `categoryId` y `listingMarketplaceId` solo si el cuerpo de `getItem`
 * trae esas propiedades como texto no vacío. No usa `categoryPath`,
 * `categoryIdPath`, la miga de pan ni el path de una URL.
 */
export function readGetItemCategoryEvidence(value: unknown): GetItemCategoryEvidence {
  const fields = readEbayBrowseItemFields(value)
  const record = value && typeof value === 'object' && !Array.isArray(value)
    ? value as Record<string, unknown>
    : null
  return {
    categoryId: exactText(fields?.categoryId ?? null, record?.categoryId),
    listingMarketplaceId: exactText(fields?.listingMarketplaceId ?? null, record?.listingMarketplaceId),
    ignoredCategoryPath: true,
    ignoredItemWebUrl: true,
  }
}

export type ProposedItemUrlDecision =
  | { applied: false, proposal: 'would-admit', sourceUrl: string }
  | { applied: false, proposal: 'rejected', reason: ProposedItemUrlRejection }

export type ProposedItemUrlRejection =
  | 'not-a-url'
  | 'not-https'
  | 'host-not-www-ebay-es'
  | 'not-item-path'
  | 'legacy-id-mismatch'
  | 'affiliate-parameter'
  | 'query-present'
  | 'fragment-present'
  | 'marketplace-not-ebay-es'

/**
 * Comprueba la propuesta de `itemWebUrl`. `applied` es siempre false:
 * la URL vigente sigue saliendo de `appliedListingSourceUrl`.
 */
export function evaluateProposedEbayEsItemUrl(input: {
  itemWebUrl: unknown
  legacyItemId: unknown
  listingMarketplaceId: unknown
}): ProposedItemUrlDecision {
  if (typeof input.itemWebUrl !== 'string') return rejected('not-a-url')
  let url: URL
  try {
    url = new URL(input.itemWebUrl.trim())
  } catch {
    return rejected('not-a-url')
  }
  if (url.protocol !== 'https:') return rejected('not-https')
  if (url.hostname.toLowerCase() !== 'www.ebay.es') return rejected('host-not-www-ebay-es')
  if (url.hash) return rejected('fragment-present')
  for (const key of url.searchParams.keys()) {
    if (AFFILIATE_KEYS.has(key.toLowerCase())) return rejected('affiliate-parameter')
  }
  if (url.search) return rejected('query-present')
  if (typeof input.legacyItemId !== 'string' || !input.legacyItemId || input.legacyItemId.includes('/')) {
    return rejected('legacy-id-mismatch')
  }
  if (url.pathname !== `/itm/${input.legacyItemId}`) return rejected('not-item-path')
  if (input.listingMarketplaceId !== 'EBAY_ES') return rejected('marketplace-not-ebay-es')
  return { applied: false, proposal: 'would-admit', sourceUrl: url.toString() }
}

/** Política vigente. Un host de eBay sigue sin ser `sourceUrl`. */
export function appliedListingSourceUrl(value: unknown): string | null {
  return normalizeEbaySourceUrl(value)
}

export function conditionAdmissionRemainsEmpty(): boolean {
  return SELL_METADATA_CONDITION_CONTRACT_IN_REPO === false
    && EBAY_ES_ADMITTED_CONDITION_IDS.length === 0
    && LISTING_SOURCE_URL_POLICY === 'reject-ebay-host'
    && EBAY_ES_UNLABELED_CATALOG_PAGE.labeledEpid === null
}

function exactText(read: string | null, raw: unknown): string | null {
  if (typeof raw !== 'string' || !raw || raw.trim() !== raw) return null
  return read === raw ? read : null
}

function rejected(reason: ProposedItemUrlRejection): ProposedItemUrlDecision {
  return { applied: false, proposal: 'rejected', reason }
}
