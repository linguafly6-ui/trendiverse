import { SECOND_HAND_PRODUCTS } from './second-hand'

/**
 * Especificación del modelo que un slug editorial podrá comparar.
 * No es un anuncio ni un permiso para buscar precios.
 *
 * Ningún registro del catálogo está verificado: no hay evidencia documental
 * ni identificador externo. El esquema es compatible con el mapping del
 * adapter de eBay (`productId`, `externalProductId`, `verified`), que sigue
 * desconectado y no se importa aquí.
 *
 * Pasar un registro a `verified` exige el expediente de
 * `lib/second-hand-verification-policy.ts`. Este archivo no lo rellena
 * y no cambia `canComparePrices()`.
 */

export const SECOND_HAND_REVIEW_STATUSES = ['pending', 'verified', 'rejected'] as const
export type SecondHandReviewStatus = (typeof SECOND_HAND_REVIEW_STATUSES)[number]

export const SECOND_HAND_MAPPING_SCOPES = ['family', 'category'] as const
export type SecondHandMappingScope = (typeof SECOND_HAND_MAPPING_SCOPES)[number]

export const SECOND_HAND_ATTRIBUTE_KEYS = [
  'brand',
  'model',
  'generation',
  'capacity',
  'edition',
  'configuration',
] as const
export type SecondHandAttributeKey = (typeof SECOND_HAND_ATTRIBUTE_KEYS)[number]

export interface SecondHandModelAttribute {
  key: SecondHandAttributeKey
  label: string
  /** null hasta que una persona fije el valor. No se rellena por inferencia. */
  value: string | null
  requiredForComparison: boolean
}

export interface SecondHandProductMapping {
  productId: string
  /** `family`: una línea de producto. `category`: el slug agrupa muchos modelos. */
  scope: SecondHandMappingScope
  /** Qué identifica hoy el slug, sin darlo por un modelo comparable. */
  identifies: string
  attributes: readonly SecondHandModelAttribute[]
  reviewStatus: SecondHandReviewStatus
  externalProductId: string | null
  /** Responsable o referencia documental. null si nadie ha verificado el modelo. */
  verificationRef: string | null
}

export type SecondHandMappingIssue =
  | 'incomplete'
  | 'external-id-without-verification'
  | 'ambiguous'
  | 'missing-verification-ref'
  | 'rejected'

const hasText = (value: string | null | undefined): value is string =>
  typeof value === 'string' && value.trim().length > 0 && value.trim() === value

function attr(key: SecondHandAttributeKey, label: string): SecondHandModelAttribute {
  return { key, label, value: null, requiredForComparison: true }
}

function mapping(
  productId: string,
  scope: SecondHandMappingScope,
  identifies: string,
  attributes: readonly SecondHandModelAttribute[],
): SecondHandProductMapping {
  return {
    productId,
    scope,
    identifies,
    attributes,
    reviewStatus: 'pending',
    externalProductId: null,
    verificationRef: null,
  }
}

export const SECOND_HAND_PRODUCT_MAPPINGS: readonly SecondHandProductMapping[] = [
  mapping('iphone', 'family', 'Familia iPhone, sin generación ni capacidad.', [
    attr('brand', 'Fabricante'),
    attr('model', 'Línea'),
    attr('generation', 'Generación'),
    attr('capacity', 'Capacidad'),
  ]),
  mapping('macbook', 'family', 'Familia MacBook, sin chip, tamaño ni configuración.', [
    attr('brand', 'Fabricante'),
    attr('model', 'Línea, Air o Pro'),
    attr('generation', 'Generación o chip'),
    attr('configuration', 'Pantalla, memoria y almacenamiento'),
  ]),
  mapping('ipad', 'family', 'Familia iPad, sin línea, generación ni capacidad.', [
    attr('brand', 'Fabricante'),
    attr('model', 'Línea: iPad, Air, Pro o mini'),
    attr('generation', 'Generación'),
    attr('capacity', 'Capacidad'),
  ]),
  mapping('apple-watch', 'family', 'Familia Apple Watch, sin serie, caja ni conectividad.', [
    attr('brand', 'Fabricante'),
    attr('model', 'Línea: SE, Series o Ultra'),
    attr('generation', 'Generación'),
    attr('edition', 'Tamaño de caja y GPS o Cellular'),
  ]),
  mapping('samsung-galaxy', 'family', 'Familia Samsung Galaxy, sin serie, generación ni capacidad.', [
    attr('brand', 'Fabricante'),
    attr('model', 'Serie, por ejemplo S, A o Z'),
    attr('generation', 'Generación'),
    attr('capacity', 'Capacidad'),
  ]),
  mapping('playstation-5', 'family', 'PlayStation 5, sin edición ni capacidad.', [
    attr('brand', 'Fabricante'),
    attr('model', 'Consola'),
    attr('edition', 'Con lector, Digital o Slim'),
    attr('capacity', 'Capacidad'),
  ]),
  mapping('nintendo-switch', 'family', 'Nintendo Switch, sin modelo ni capacidad.', [
    attr('brand', 'Fabricante'),
    attr('model', 'Consola'),
    attr('edition', 'Modelo original, OLED o Lite'),
    attr('capacity', 'Capacidad'),
  ]),
  mapping('xbox', 'family', 'Marca Xbox, sin generación ni capacidad. Cubre varias consolas.', [
    attr('brand', 'Fabricante'),
    attr('model', 'Consola'),
    attr('generation', 'Generación, por ejemplo Series X o Series S'),
    attr('capacity', 'Capacidad'),
  ]),
  mapping('steam-deck', 'family', 'Steam Deck, sin revisión ni capacidad.', [
    attr('brand', 'Fabricante'),
    attr('model', 'Consola'),
    attr('edition', 'LCD u OLED'),
    attr('capacity', 'Capacidad'),
  ]),
  mapping('zapatillas', 'category', 'Categoría de calzado, no un modelo.', [
    attr('brand', 'Fabricante'),
    attr('model', 'Modelo'),
  ]),
  mapping('bolsos', 'category', 'Categoría de bolsos, no un modelo.', [
    attr('brand', 'Fabricante'),
    attr('model', 'Modelo'),
  ]),
  mapping('ropa-vintage', 'category', 'Categoría de prendas únicas, no un producto comparable.', [
    attr('brand', 'Fabricante o casa'),
    attr('model', 'Tipo de prenda'),
    attr('generation', 'Época'),
  ]),
  mapping('aspiradores', 'category', 'Categoría de aspiradores, no un modelo.', [
    attr('brand', 'Fabricante'),
    attr('model', 'Modelo'),
  ]),
  mapping('cafeteras', 'category', 'Categoría de cafeteras, no un modelo.', [
    attr('brand', 'Fabricante'),
    attr('model', 'Modelo'),
    attr('edition', 'Tipo: cápsulas, espresso o superautomática'),
  ]),
  mapping('muebles', 'category', 'Categoría de muebles, no una pieza.', [
    attr('model', 'Tipo de mueble'),
    attr('configuration', 'Medidas'),
  ]),
  mapping('bicicletas', 'category', 'Categoría de bicicletas, no un modelo.', [
    attr('brand', 'Fabricante'),
    attr('model', 'Modelo'),
    attr('edition', 'Tipo: carretera, montaña, urbana u otro'),
    attr('configuration', 'Talla'),
  ]),
  mapping('material-fitness', 'category', 'Categoría de material fitness, no un aparato.', [
    attr('brand', 'Fabricante'),
    attr('model', 'Aparato'),
  ]),
  mapping('material-outdoor', 'category', 'Categoría de material outdoor, no un equipo.', [
    attr('brand', 'Fabricante'),
    attr('model', 'Tipo de equipo'),
  ]),
]

export function missingRequiredAttributes(spec: SecondHandProductMapping): SecondHandModelAttribute[] {
  return spec.attributes.filter((attribute) => attribute.requiredForComparison && !hasText(attribute.value))
}

/** Un identificador externo solo cuenta si la revisión está verificada y hay referencia. */
export function hasUnverifiedExternalId(spec: SecondHandProductMapping): boolean {
  if (!hasText(spec.externalProductId)) return false
  return spec.reviewStatus !== 'verified' || !hasText(spec.verificationRef)
}

/**
 * El slug aún no nombra un único modelo comparable.
 * Una categoría sigue siendo ambigua hasta una revisión verificada y completa.
 * Una familia lo es mientras falte un atributo requerido.
 */
export function isTooAmbiguousToCompare(spec: SecondHandProductMapping): boolean {
  if (missingRequiredAttributes(spec).length > 0) return true
  return spec.scope === 'category' && spec.reviewStatus !== 'verified'
}

export function mappingIssues(spec: SecondHandProductMapping): SecondHandMappingIssue[] {
  const issues: SecondHandMappingIssue[] = []
  if (spec.reviewStatus === 'rejected') issues.push('rejected')
  if (missingRequiredAttributes(spec).length > 0) issues.push('incomplete')
  if (isTooAmbiguousToCompare(spec)) issues.push('ambiguous')
  if (hasUnverifiedExternalId(spec)) issues.push('external-id-without-verification')
  if (spec.reviewStatus === 'verified' && !hasText(spec.verificationRef)) issues.push('missing-verification-ref')
  return issues
}

/** Listo para una comparación futura. No consulta precios ni publica métricas. */
export function canComparePrices(spec: SecondHandProductMapping): boolean {
  return spec.reviewStatus === 'verified' && mappingIssues(spec).length === 0
}

/**
 * Proyección hacia el mapping externo del adapter. Si la revisión no está
 * cerrada, el identificador no sale de aquí y `verified` queda en false.
 */
export function asExternalMapping(spec: SecondHandProductMapping): {
  productId: string
  externalProductId: string | null
  verified: boolean
} {
  const verified = canComparePrices(spec) && hasText(spec.externalProductId)
  return {
    productId: spec.productId,
    externalProductId: verified ? spec.externalProductId : null,
    verified,
  }
}

export function secondHandProductMapping(productId: string): SecondHandProductMapping | undefined {
  return SECOND_HAND_PRODUCT_MAPPINGS.find((spec) => spec.productId === productId)
}

/** El catálogo editorial y el de mapping nombran los mismos slugs, en el mismo orden. */
export function secondHandMappingCoversCatalog(): boolean {
  if (SECOND_HAND_PRODUCT_MAPPINGS.length !== SECOND_HAND_PRODUCTS.length) return false
  return SECOND_HAND_PRODUCT_MAPPINGS.every((spec, index) => spec.productId === SECOND_HAND_PRODUCTS[index]?.slug)
}
