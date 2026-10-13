/**
 * Variantes de la Nintendo Switch OLED, aparte del slug editorial.
 *
 * `nintendo-switch` sigue siendo la ficha de fabricante: HEG-001, 64 GB,
 * sin color y sin edición. Sus URLs no cambian porque estos slugs no entran
 * en `SECOND_HAND_PRODUCTS` ni en `SECOND_HAND_PRODUCT_MAPPINGS`.
 *
 * Un ePID de ficha de catálogo queda en `unvalidated`. No es una asociación
 * verificada: eso exigiría una lectura detallada del mismo ePID con
 * marketplace `EBAY_ES`, y después el contrato de
 * `lib/second-hand-marketplace-id.ts`. Este módulo no escribe `validated`,
 * no inventa `categoryId` y no llama a eBay.
 */

import { SECOND_HAND_PRODUCTS } from './second-hand'
import {
  asExternalMapping,
  canComparePrices,
  secondHandProductMapping,
  type SecondHandModelAttribute,
  type SecondHandProductMapping,
} from './second-hand-product-mapping'
import {
  hasValidatedMarketplaceId,
  MARKETPLACE_ID_ALLOWLIST,
  type SecondHandMarketplaceIdAllowlist,
  type SecondHandMarketplaceIdContext,
  type SecondHandMarketplaceIdentifier,
} from './second-hand-marketplace-id'

export const SWITCH_OLED_PARENT_PRODUCT_ID = 'nintendo-switch'

export const SWITCH_OLED_VARIANT_PRODUCT_IDS = [
  'nintendo-switch-oled-blanca',
  'nintendo-switch-oled-neon',
  'nintendo-switch-oled-splatoon-3',
] as const

export type SwitchOledVariantProductId = (typeof SWITCH_OLED_VARIANT_PRODUCT_IDS)[number]

/**
 * ePID visto en una ficha que no es la de eBay España usada como candidata.
 * No se copia al slug neón ni al slug genérico.
 */
export const SWITCH_OLED_NON_ES_CANDIDATE_EPIDS = [
  {
    epid: '8048191202',
    note: 'HEG-001 neón en una ficha distinta de la española. Los identificadores no son los del candidato 23048312547. No es un candidato de EBAY_ES.',
  },
] as const

/** Lo que una persona con acceso tiene que leer en el cuerpo de un anuncio. El catálogo no lo rellena. */
export const EBAY_ES_ITEM_FIELDS_TO_RECORD = [
  'itemId',
  'legacyItemId',
  'epid',
  'listingMarketplaceId',
  'categoryId',
  'gtin',
  'mpn',
  'conditionId',
  'price',
  'currency',
  'itemWebUrl',
  'itemCreationDate',
  'readAt',
] as const

export type EbayEsItemFieldToRecord = (typeof EBAY_ES_ITEM_FIELDS_TO_RECORD)[number]

export const VARIANT_CONFIRMATION_GAPS = [
  'ebay-es-item-detail',
  'category-id-from-ebay-es-item',
  'validated-marketplace-identifier',
  'marketplace-allowlist',
  'admitted-condition-ids',
] as const

export type VariantConfirmationGap = (typeof VARIANT_CONFIRMATION_GAPS)[number]

export interface SecondHandVariantIdentityEvidence {
  manufacturer: 'Nintendo Co., Ltd.'
  exactModel: 'Nintendo Switch – Modelo OLED'
  manufacturerIdentifier: 'HEG-001'
  capacity: '64 GB'
  /** null en una edición que no se define por un color estándar de Joy-Con. */
  joyConColor: string | null
  edition: 'standard' | 'splatoon-3'
  mpn: string | null
  ean: string | null
  /** ePID de la ficha española examinada. null si esa ficha no lo etiqueta. */
  candidateEpid: string | null
  /** Siempre null: no se ha leído el categoryId de un anuncio de EBAY_ES. */
  categoryId: null
}

export interface SecondHandVariantMapping {
  productId: SwitchOledVariantProductId
  parentProductId: typeof SWITCH_OLED_PARENT_PRODUCT_ID
  name: string
  identifies: string
  attributes: readonly SecondHandModelAttribute[]
  /** Observación de la ficha. No cierra el mapping editorial ni valida el ePID. */
  verificationRef: string
  identity: SecondHandVariantIdentityEvidence
  /** null si no hay ePID candidato. Nunca `validated` en este catálogo. */
  marketplaceIdentifier: Extract<SecondHandMarketplaceIdentifier, { status: 'unvalidated' }> | null
  decisionNote: string
}

const WHITE_EPID = '21048307585'
const NEON_EPID = '23048312547'

function attribute(
  key: SecondHandModelAttribute['key'],
  label: string,
  value: string,
): SecondHandModelAttribute {
  return { key, label, value, requiredForComparison: true }
}

function unvalidatedEpid(productId: SwitchOledVariantProductId, epid: string): Extract<SecondHandMarketplaceIdentifier, { status: 'unvalidated' }> {
  return {
    status: 'unvalidated',
    provider: 'ebay',
    scope: 'epid',
    canonicalValue: epid,
    productId,
  }
}

const SHARED_IDENTITY = {
  manufacturer: 'Nintendo Co., Ltd.',
  exactModel: 'Nintendo Switch – Modelo OLED',
  manufacturerIdentifier: 'HEG-001',
  capacity: '64 GB',
  categoryId: null,
} as const

export const SECOND_HAND_VARIANT_MAPPINGS: readonly SecondHandVariantMapping[] = [
  {
    productId: 'nintendo-switch-oled-blanca',
    parentProductId: SWITCH_OLED_PARENT_PRODUCT_ID,
    name: 'Nintendo Switch OLED HEG-001 blanca, 64 GB',
    identifies: 'Nintendo Switch – Modelo OLED, HEG-001, 64 GB, Joy-Con blancos. No es el slug nintendo-switch, ni la variante neón, ni la edición Splatoon 3.',
    attributes: [
      attribute('brand', 'Fabricante', SHARED_IDENTITY.manufacturer),
      attribute('model', 'Consola', SHARED_IDENTITY.exactModel),
      attribute('edition', 'Color de los Joy-Con', 'Blanco'),
      attribute('capacity', 'Capacidad', SHARED_IDENTITY.capacity),
      attribute('configuration', 'Número de modelo', SHARED_IDENTITY.manufacturerIdentifier),
    ],
    verificationRef: 'Ficha de catálogo examinada en eBay España para la Nintendo Switch OLED HEG-001 con Joy-Con blancos: ePID 21048307585, MPN 10007454, EAN 0045496453435. No es una lectura detallada de un anuncio y no confirma el marketplace EBAY_ES en el cuerpo de un ítem. Revisión del 2026-10-13.',
    identity: {
      ...SHARED_IDENTITY,
      joyConColor: 'Blanco',
      edition: 'standard',
      mpn: '10007454',
      ean: '0045496453435',
      candidateEpid: WHITE_EPID,
    },
    marketplaceIdentifier: unvalidatedEpid('nintendo-switch-oled-blanca', WHITE_EPID),
    decisionNote: 'Candidata. La ficha española separa esta consola de la neón. El ePID no pasa a asociación verificada hasta una lectura detallada del mismo valor con marketplace EBAY_ES. El slug editorial nintendo-switch no recibe este identificador.',
  },
  {
    productId: 'nintendo-switch-oled-neon',
    parentProductId: SWITCH_OLED_PARENT_PRODUCT_ID,
    name: 'Nintendo Switch OLED HEG-001 neón, 64 GB',
    identifies: 'Nintendo Switch – Modelo OLED, HEG-001, 64 GB, Joy-Con azul neón y rojo neón. No es el slug nintendo-switch, ni la variante blanca, ni la edición Splatoon 3.',
    attributes: [
      attribute('brand', 'Fabricante', SHARED_IDENTITY.manufacturer),
      attribute('model', 'Consola', SHARED_IDENTITY.exactModel),
      attribute('edition', 'Color de los Joy-Con', 'Azul neón y rojo neón'),
      attribute('capacity', 'Capacidad', SHARED_IDENTITY.capacity),
      attribute('configuration', 'Número de modelo', SHARED_IDENTITY.manufacturerIdentifier),
    ],
    verificationRef: 'Ficha de catálogo examinada en eBay España para la Nintendo Switch OLED HEG-001 con Joy-Con azul neón y rojo neón: ePID 23048312547, MPN 10007455, EAN 0045496453442. No es una lectura detallada de un anuncio y no confirma el marketplace EBAY_ES en el cuerpo de un ítem. El ePID 8048191202 queda fuera: otra ficha de HEG-001 neón trae identificadores distintos. Revisión del 2026-10-13.',
    identity: {
      ...SHARED_IDENTITY,
      joyConColor: 'Azul neón y rojo neón',
      edition: 'standard',
      mpn: '10007455',
      ean: '0045496453442',
      candidateEpid: NEON_EPID,
    },
    marketplaceIdentifier: unvalidatedEpid('nintendo-switch-oled-neon', NEON_EPID),
    decisionNote: 'Candidata. La ficha española separa esta consola de la blanca. El ePID 8048191202 no sustituye a 23048312547. El slug editorial nintendo-switch no recibe este identificador.',
  },
  {
    productId: 'nintendo-switch-oled-splatoon-3',
    parentProductId: SWITCH_OLED_PARENT_PRODUCT_ID,
    name: 'Nintendo Switch OLED HEG-001 edición Splatoon 3',
    identifies: 'Edición Splatoon 3 de la Nintendo Switch OLED HEG-001. No es la variante blanca ni la neón, y la ficha examinada no etiqueta un ePID.',
    attributes: [
      attribute('brand', 'Fabricante', SHARED_IDENTITY.manufacturer),
      attribute('model', 'Consola', SHARED_IDENTITY.exactModel),
      attribute('edition', 'Edición', 'Splatoon 3'),
      attribute('capacity', 'Capacidad', SHARED_IDENTITY.capacity),
      attribute('configuration', 'Número de modelo', SHARED_IDENTITY.manufacturerIdentifier),
    ],
    verificationRef: 'Ficha examinada de la edición Splatoon 3 de la Nintendo Switch OLED HEG-001. No muestra un ePID etiquetado. No se reutiliza el ePID blanco 21048307585 ni el neón 23048312547. Revisión del 2026-10-13.',
    identity: {
      ...SHARED_IDENTITY,
      joyConColor: null,
      edition: 'splatoon-3',
      mpn: null,
      ean: null,
      candidateEpid: null,
    },
    marketplaceIdentifier: null,
    decisionNote: 'Separada. Sin ePID etiquetado no hay identificador de marketplace, ni siquiera sin validar. No se asocia a la blanca ni a la neón.',
  },
]

const NON_ES_EPIDS = new Set<string>(SWITCH_OLED_NON_ES_CANDIDATE_EPIDS.map((item) => item.epid))

export function secondHandVariantMapping(productId: string): SecondHandVariantMapping | undefined {
  return SECOND_HAND_VARIANT_MAPPINGS.find((variant) => variant.productId === productId)
}

/**
 * El ePID candidato coincide con esa variante y con ninguna otra.
 * El slug editorial y los ePID ajenos a la ficha española no coinciden.
 */
export function epidBelongsToVariant(productId: string, epid: string | null): boolean {
  if (epid === null || NON_ES_EPIDS.has(epid)) return false
  if (productId === SWITCH_OLED_PARENT_PRODUCT_ID) return false
  const variant = secondHandVariantMapping(productId)
  if (!variant?.identity.candidateEpid) return false
  return variant.identity.candidateEpid === epid
}

export interface VariantDetailReading {
  epid: string | null
  marketplaceId: string | null
  categoryId: string | null
  source: 'detail' | 'catalog-sheet' | 'search-summary'
}

/**
 * Una lectura, aunque traiga el ePID candidato y `EBAY_ES`, no valida el
 * identificador. El catálogo no tiene `categoryId`, la allowlist sigue
 * vacía y ningún registro pasa a `validated`.
 */
export function variantReadingVerdict(
  productId: string,
  reading: VariantDetailReading,
): { verdict: 'mismatch' } | { verdict: 'unconfirmed', missing: readonly VariantConfirmationGap[] } {
  if (!epidBelongsToVariant(productId, reading.epid)) return { verdict: 'mismatch' }
  const missing: VariantConfirmationGap[] = []
  if (reading.source !== 'detail' || reading.marketplaceId !== 'EBAY_ES') missing.push('ebay-es-item-detail')
  if (reading.categoryId === null || reading.categoryId.trim() === '') missing.push('category-id-from-ebay-es-item')
  missing.push('validated-marketplace-identifier', 'marketplace-allowlist', 'admitted-condition-ids')
  return { verdict: 'unconfirmed', missing }
}

/** Ninguna variante tiene asociación verificada. */
export function verifiedVariantProductIds(): readonly string[] {
  return SECOND_HAND_VARIANT_MAPPINGS.flatMap((variant) => {
    const identifier = variant.marketplaceIdentifier
    if (!identifier) return []
    const context: SecondHandMarketplaceIdContext = {
      productId: variant.productId,
      verificationRef: variant.verificationRef,
      manufacturerIdentifier: variant.identity.manufacturerIdentifier,
      manufacturer: variant.identity.manufacturer,
      exactModel: variant.identity.exactModel,
      identifies: variant.identifies,
    }
    return hasValidatedMarketplaceId(identifier, context, MARKETPLACE_ID_ALLOWLIST) ? [variant.productId] : []
  })
}

/**
 * Proyección al mapping editorial para reutilizar `canComparePrices`.
 * Sigue en `pending`: la referencia de la ficha de catálogo no cierra la
 * revisión de fabricante, y el identificador no está validado.
 */
export function variantAsPendingMapping(variant: SecondHandVariantMapping): SecondHandProductMapping {
  return {
    productId: variant.productId,
    scope: 'family',
    identifies: variant.identifies,
    attributes: variant.attributes,
    reviewStatus: 'pending',
    externalProductId: null,
    marketplaceIdentifier: variant.marketplaceIdentifier,
    verificationRef: null,
    recordedVerification: null,
    decisionNote: variant.decisionNote,
    decisionSourceUrl: null,
    reviewPriority: null,
  }
}

export function variantCanComparePrices(
  variant: SecondHandVariantMapping,
  allowlist: SecondHandMarketplaceIdAllowlist = MARKETPLACE_ID_ALLOWLIST,
): boolean {
  return canComparePrices(variantAsPendingMapping(variant), allowlist)
}

export function variantExternalMapping(
  variant: SecondHandVariantMapping,
  allowlist: SecondHandMarketplaceIdAllowlist = MARKETPLACE_ID_ALLOWLIST,
) {
  return asExternalMapping(variantAsPendingMapping(variant), allowlist)
}

const hasText = (value: string | null | undefined): value is string =>
  typeof value === 'string' && value.trim().length > 0 && value.trim() === value

/** Forma del catálogo de variantes. No descarga fichas ni acepta un ePID validado. */
export function variantCatalogIssues(variant: SecondHandVariantMapping): string[] {
  const issues: string[] = []
  const editorialSlugs = new Set(SECOND_HAND_PRODUCTS.map((product) => product.slug))
  const productId: string = variant.productId
  const parentProductId: string = variant.parentProductId
  if (parentProductId !== SWITCH_OLED_PARENT_PRODUCT_ID) issues.push('unexpected-parent')
  if (!editorialSlugs.has(parentProductId)) issues.push('missing-parent')
  if (productId === parentProductId || editorialSlugs.has(productId)) issues.push('reuses-editorial-slug')
  if (!hasText(variant.verificationRef) || !hasText(variant.decisionNote) || !hasText(variant.identifies)) issues.push('missing-decision')
  if (variant.identity.manufacturerIdentifier !== 'HEG-001') issues.push('unexpected-model')
  if (variant.identity.capacity !== '64 GB') issues.push('unexpected-capacity')
  const categoryId: string | null = variant.identity.categoryId
  if (categoryId !== null) issues.push('invented-category')
  if (variant.identity.edition === 'splatoon-3') {
    if (variant.identity.candidateEpid !== null || variant.marketplaceIdentifier !== null) issues.push('splatoon-has-marketplace-id')
    if (variant.identity.mpn !== null || variant.identity.ean !== null) issues.push('splatoon-identifiers-invented')
  } else if (variant.identity.candidateEpid === null || variant.marketplaceIdentifier === null) {
    issues.push('standard-variant-missing-candidate')
  }
  const identifier = variant.marketplaceIdentifier
  if (identifier) {
    const status: SecondHandMarketplaceIdentifier['status'] = identifier.status
    if (status !== 'unvalidated') issues.push('validated-too-soon')
    const identifierProductId: string = identifier.productId
    if (identifierProductId !== productId || identifierProductId === parentProductId) issues.push('identifier-product-mismatch')
    if (identifier.canonicalValue !== variant.identity.candidateEpid) issues.push('canonical-epid-mismatch')
    if (identifier.provider !== 'ebay' || identifier.scope !== 'epid') issues.push('unexpected-provider-scope')
    if (NON_ES_EPIDS.has(identifier.canonicalValue)) issues.push('excluded-epid')
  }
  const others = SECOND_HAND_VARIANT_MAPPINGS.filter((item) => item.productId !== variant.productId)
  if (variant.identity.candidateEpid && others.some((item) => item.identity.candidateEpid === variant.identity.candidateEpid)) {
    issues.push('shared-candidate-epid')
  }
  return issues
}

/** El slug editorial sigue sin identificador de marketplace. */
export function editorialParentHasNoMarketplaceId(): boolean {
  const parent = secondHandProductMapping(SWITCH_OLED_PARENT_PRODUCT_ID)
  return parent?.externalProductId === null && parent?.marketplaceIdentifier === null
}

function aspectValue(item: Record<string, unknown>, names: readonly string[]): string | null {
  if (!Array.isArray(item.localizedAspects)) return null
  for (const aspect of item.localizedAspects) {
    if (!aspect || typeof aspect !== 'object' || Array.isArray(aspect)) continue
    const record = aspect as Record<string, unknown>
    if (typeof record.name !== 'string' || typeof record.value !== 'string') continue
    const name = record.name.trim().toLowerCase().replace(/\s+/g, ' ')
    if (names.includes(name) && record.value.trim() !== '') return record.value.trim()
  }
  return null
}

/**
 * El cuerpo de un getItem coincide con esa variante.
 * Cada dato tiene que venir en el cuerpo. Un campo ausente no se copia del catálogo.
 * La ficha genérica y Splatoon 3 no coinciden.
 */
export function itemMatchesVariantIdentity(variant: SecondHandVariantMapping, item: unknown): boolean {
  if (!item || typeof item !== 'object' || Array.isArray(item)) return false
  if (variant.identity.edition === 'splatoon-3') return false
  if (!variant.identity.candidateEpid || !variant.identity.ean || !variant.identity.mpn || !variant.identity.joyConColor) return false
  const record = item as Record<string, unknown>
  if (record.epid !== variant.identity.candidateEpid) return false
  if (record.listingMarketplaceId !== 'EBAY_ES') return false
  if (record.gtin !== variant.identity.ean) return false
  if (typeof record.epid === 'string' && NON_ES_EPIDS.has(record.epid)) return false
  if (aspectValue(record, ['mpn']) !== variant.identity.mpn) return false
  if (aspectValue(record, ['model', 'modelo']) !== 'HEG-001') return false
  const capacity = aspectValue(record, ['capacidad', 'almacenamiento', 'storage', 'capacity', 'capacidad de almacenamiento'])
  if (capacity === null || !capacity.includes('64')) return false
  const color = aspectValue(record, ['color', 'colour'])
  if (color === null) return false
  if (variant.identity.joyConColor === 'Blanco') return /blanc/i.test(color) && !/ne[oó]n|splatoon/i.test(color)
  if (variant.identity.joyConColor === 'Azul neón y rojo neón') return /ne[oó]n/i.test(color) && !/blanc|splatoon/i.test(color)
  return false
}
