/**
 * Un solo getItem de EBAY_ES, anotado después de ejecutarlo fuera de este
 * entorno. No valida la variante, no rellena la allowlist, no admite
 * condiciones y no guarda el precio del anuncio.
 *
 * Cada campo dice de dónde sale. No se mezclan anuncios.
 */

import { normalizeEbayCondition } from './ebay-browse-adapter'
import { EBAY_ES_ADMITTED_CONDITION_IDS } from './ebay-listing'
import { MARKETPLACE_ID_ALLOWLIST } from './second-hand-marketplace-id'
import {
  itemMatchesVariantIdentity,
  secondHandVariantMapping,
  type SecondHandVariantMapping,
} from './second-hand-variant-catalog'

export const WHITE_OLED_OBSERVED_PRODUCT_ID = 'nintendo-switch-oled-blanca'

/** Cuerpo de Browse del anuncio v1|206264425581|0. No incluye el precio. */
export const WHITE_OLED_BROWSE_ITEM = {
  source: 'browse-getItem',
  script: 'scripts/read-ebay-white-oled-detail.ts',
  itemId: 'v1|206264425581|0',
  auditUrl: 'https://www.ebay.es/itm/206264425581',
  listingMarketplaceId: 'EBAY_ES',
  epid: '21048307585',
  gtin: '0045496453435',
  mpn: '10007454',
  modelAspect: 'Nintendo Switch (modelo OLED)',
  capacityAspect: '64 GB',
  colorAspect: 'Blanco',
  categoryId: '139971',
  conditionId: '1000',
} as const

/** Lo que ya decía el catálogo local antes de ese getItem. */
export const WHITE_OLED_CATALOG_CANDIDATE = {
  source: 'local-catalog',
  manufacturerIdentifier: 'HEG-001',
  candidateEpid: '21048307585',
  ean: '0045496453435',
  mpn: '10007454',
  capacity: '64 GB',
  joyConColor: 'Blanco',
} as const

/**
 * Otro anuncio de la misma ejecución. El informe dice que coincide en
 * GTIN, MPN, capacidad, color y categoría, y que no trae ePID.
 * No es el cuerpo de v1|206264425581|0.
 */
export const WHITE_OLED_SEPARATE_CANDIDATE = {
  source: 'execution-report',
  itemId: '158070574781',
  epid: null,
  mergesIntoObservedItem: false,
} as const

/**
 * El id 139971 está en ese anuncio. El repositorio no tiene su nombre,
 * ni si es hoja, ni una lectura del árbol de EBAY_ES.
 */
export const WHITE_OLED_CATEGORY_VERIFICATION: {
  observedCategoryId: string
  categoryName: string | null
  marketplaceTree: string | null
} = {
  observedCategoryId: '139971',
  categoryName: null,
  marketplaceTree: null,
}

/**
 * 1000 es NEW en la guía de IDs que el proyecto ya leyó. Esa guía es de
 * EE. UU. La política de la categoría en EBAY_ES no está leída.
 */
export const WHITE_OLED_CONDITION_POLICY = {
  observedConditionId: '1000',
  ebayEsCategoryPolicyRead: false,
} as const

export const WHITE_OLED_VALIDATION_BLOCKERS = [
  'model-aspect-is-not-heg-001',
  'category-meaning-unverified',
  'condition-policy-unread',
  'condition-1000-is-new',
  'marketplace-allowlist-empty',
  'identifier-not-validated',
] as const

export type WhiteOledValidationBlocker = (typeof WHITE_OLED_VALIDATION_BLOCKERS)[number]

/** El mismo anuncio, en la forma que lee la identidad. Sin precio. */
export function whiteOledObservedItemBody(): Record<string, unknown> {
  const item = WHITE_OLED_BROWSE_ITEM
  return {
    itemId: item.itemId,
    epid: item.epid,
    listingMarketplaceId: item.listingMarketplaceId,
    gtin: item.gtin,
    categoryId: item.categoryId,
    conditionId: item.conditionId,
    itemWebUrl: item.auditUrl,
    localizedAspects: [
      { name: 'MPN', value: item.mpn },
      { name: 'Modelo', value: item.modelAspect },
      { name: 'Capacidad', value: item.capacityAspect },
      { name: 'Color', value: item.colorAspect },
    ],
  }
}

export function whiteOledObservedReadingBlockers(
  variant: SecondHandVariantMapping | undefined = secondHandVariantMapping(WHITE_OLED_OBSERVED_PRODUCT_ID),
): readonly WhiteOledValidationBlocker[] {
  const blockers: WhiteOledValidationBlocker[] = []
  if (!variant || !itemMatchesVariantIdentity(variant, whiteOledObservedItemBody())) {
    blockers.push('model-aspect-is-not-heg-001')
  }
  if (WHITE_OLED_CATEGORY_VERIFICATION.categoryName === null || WHITE_OLED_CATEGORY_VERIFICATION.marketplaceTree !== 'EBAY_ES') {
    blockers.push('category-meaning-unverified')
  }
  if (!WHITE_OLED_CONDITION_POLICY.ebayEsCategoryPolicyRead || EBAY_ES_ADMITTED_CONDITION_IDS.length === 0) {
    blockers.push('condition-policy-unread')
  }
  if (normalizeEbayCondition(Number(WHITE_OLED_CONDITION_POLICY.observedConditionId), true) === null) {
    blockers.push('condition-1000-is-new')
  }
  if (MARKETPLACE_ID_ALLOWLIST.providers.length === 0 || MARKETPLACE_ID_ALLOWLIST.scopes.length === 0) {
    blockers.push('marketplace-allowlist-empty')
  }
  const identifierStatus: string | undefined = variant?.marketplaceIdentifier?.status
  if (identifierStatus !== 'validated') blockers.push('identifier-not-validated')
  return blockers
}
