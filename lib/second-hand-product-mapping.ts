import { SECOND_HAND_PRODUCTS } from './second-hand'

/**
 * Especificación del modelo que un slug editorial podrá comparar.
 * No es un anuncio ni un permiso para buscar precios.
 *
 * Cada registro tiene una decisión auditable. En este catálogo todas están
 * en `pending`: la documentación oficial no cierra un único modelo, así que
 * no se rellenan atributos, no se inventa un identificador de marketplace y
 * no se habilita una comparación. El adapter de eBay sigue desconectado y
 * no se importa aquí.
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
  /** Responsable o referencia de una verificación. null mientras el estado no sea `verified`. */
  verificationRef: string | null
  /** Por qué el estado es el que es. Obligatorio en el catálogo. */
  decisionNote: string
  /** Página oficial que muestra por qué el modelo sigue abierto. null si el slug no es un producto de fabricante. */
  decisionSourceUrl: string | null
  /**
   * Orden para cerrar la identidad antes de buscar un identificador externo.
   * 1 es el primero. null en categorías. No es un ranking de ventas ni de precio.
   */
  reviewPriority: number | null
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
  decisionNote: string,
  decisionSourceUrl: string | null,
  reviewPriority: number | null,
): SecondHandProductMapping {
  return {
    productId,
    scope,
    identifies,
    attributes,
    reviewStatus: 'pending',
    externalProductId: null,
    verificationRef: null,
    decisionNote,
    decisionSourceUrl,
    reviewPriority,
  }
}

const CATEGORY_DECISION = 'Pendiente. El slug agrupa muchos modelos y no hay una ficha de fabricante de un único producto.'

export const SECOND_HAND_PRODUCT_MAPPINGS: readonly SecondHandProductMapping[] = [
  mapping('iphone', 'family', 'Familia iPhone, sin generación ni capacidad.', [
    attr('brand', 'Fabricante'),
    attr('model', 'Línea'),
    attr('generation', 'Generación'),
    attr('capacity', 'Capacidad'),
  ], 'Pendiente. La ficha del iPhone 17 lista 256 GB y 512 GB, y hay fichas distintas para iPhone 17 Pro y iPhone 17 Pro Max. El slug no elige generación ni capacidad.', 'https://support.apple.com/en-us/125089', 5),
  mapping('macbook', 'family', 'Familia MacBook, sin chip, tamaño ni configuración.', [
    attr('brand', 'Fabricante'),
    attr('model', 'Línea, Air o Pro'),
    attr('generation', 'Generación o chip'),
    attr('configuration', 'Pantalla, memoria y almacenamiento'),
  ], 'Pendiente. La ficha de 14 pulgadas cubre M5 Pro y M5 Max, con 24 GB y SSD de 1 TB o 2 TB, y más de un recuento de núcleos. No es un único equipo.', 'https://support.apple.com/en-us/126318', 8),
  mapping('ipad', 'family', 'Familia iPad, sin línea, generación ni capacidad.', [
    attr('brand', 'Fabricante'),
    attr('model', 'Línea: iPad, Air, Pro o mini'),
    attr('generation', 'Generación'),
    attr('capacity', 'Capacidad'),
  ], 'Pendiente. El iPad Pro 11 pulgadas (M5) lista 256 GB, 512 GB, 1 TB y 2 TB, y no elige Wi-Fi o Cellular. El slug también incluye otras líneas.', 'https://support.apple.com/en-us/125406', 6),
  mapping('apple-watch', 'family', 'Familia Apple Watch, sin serie, caja ni conectividad.', [
    attr('brand', 'Fabricante'),
    attr('model', 'Línea: SE, Series o Ultra'),
    attr('generation', 'Generación'),
    attr('edition', 'Tamaño de caja y GPS o Cellular'),
  ], 'Pendiente. En Series 12 los 64 GB figuran en el chip de la serie, no unidos a la altura de 42 mm o 46 mm. No hay identificador de modelo ni elección GPS o Cellular.', 'https://www.apple.com/apple-watch-series-12/specs/', 9),
  mapping('samsung-galaxy', 'family', 'Familia Samsung Galaxy, sin serie, generación ni capacidad.', [
    attr('brand', 'Fabricante'),
    attr('model', 'Serie, por ejemplo S, A o Z'),
    attr('generation', 'Generación'),
    attr('capacity', 'Capacidad'),
  ], 'Pendiente. La ficha de España lista Galaxy S25 en 128 GB, 256 GB y 512 GB, S25+ en 256 GB y 512 GB, y S25 Ultra en 256 GB, 512 GB y 1 TB. La diagonal no está en esa ficha.', 'https://www.samsung.com/es/smartphones/galaxy-s25/specs/', 7),
  mapping('playstation-5', 'family', 'PlayStation 5, sin edición ni capacidad.', [
    attr('brand', 'Fabricante'),
    attr('model', 'Consola'),
    attr('edition', 'Con lector, Digital o Slim'),
    attr('capacity', 'Capacidad'),
  ], 'Pendiente. La página de EE. UU. separa PS5 console - 1TB con Blu-ray y PS5 Digital Edition - 825GB sin lector, y no asigna un código CFI. No se trata el lector como si fuera la digital.', 'https://www.playstation.com/en-us/ps5/', 1),
  mapping('nintendo-switch', 'family', 'Nintendo Switch, sin modelo ni capacidad.', [
    attr('brand', 'Fabricante'),
    attr('model', 'Consola'),
    attr('edition', 'Modelo original, OLED o Lite'),
    attr('capacity', 'Capacidad'),
  ], 'Pendiente. La ficha nombra el OLED de 64 GB, la consola HAC-001(-01) de 32 GB y la Lite HDH-001 de 32 GB. HAC-001(-01) no cubre las otras.', 'https://www.nintendo.com/us/gaming-systems/switch/tech-specs/', 3),
  mapping('xbox', 'family', 'Marca Xbox, sin generación ni capacidad. Cubre varias consolas.', [
    attr('brand', 'Fabricante'),
    attr('model', 'Consola'),
    attr('generation', 'Generación, por ejemplo Series X o Series S'),
    attr('capacity', 'Capacidad'),
  ], 'Pendiente. La ficha separa Series X Carbon Black de 1 TB con lector y Series X 1TB Digital Edition. Esas dos líneas no comparten un código de modelo. Series S es otra consola.', 'https://www.xbox.com/en-US/consoles/xbox-series-x', 2),
  mapping('steam-deck', 'family', 'Steam Deck, sin revisión ni capacidad.', [
    attr('brand', 'Fabricante'),
    attr('model', 'Consola'),
    attr('edition', 'LCD u OLED'),
    attr('capacity', 'Capacidad'),
  ], 'Pendiente. La ficha técnica lista Steam Deck OLED de 512 GB y de 1 TB. No publica la capacidad LCD.', 'https://www.steamdeck.com/en/tech', 4),
  mapping('zapatillas', 'category', 'Categoría de calzado, no un modelo.', [
    attr('brand', 'Fabricante'),
    attr('model', 'Modelo'),
  ], CATEGORY_DECISION, null, null),
  mapping('bolsos', 'category', 'Categoría de bolsos, no un modelo.', [
    attr('brand', 'Fabricante'),
    attr('model', 'Modelo'),
  ], CATEGORY_DECISION, null, null),
  mapping('ropa-vintage', 'category', 'Categoría de prendas únicas, no un producto comparable.', [
    attr('brand', 'Fabricante o casa'),
    attr('model', 'Tipo de prenda'),
    attr('generation', 'Época'),
  ], CATEGORY_DECISION, null, null),
  mapping('aspiradores', 'category', 'Categoría de aspiradores, no un modelo.', [
    attr('brand', 'Fabricante'),
    attr('model', 'Modelo'),
  ], CATEGORY_DECISION, null, null),
  mapping('cafeteras', 'category', 'Categoría de cafeteras, no un modelo.', [
    attr('brand', 'Fabricante'),
    attr('model', 'Modelo'),
    attr('edition', 'Tipo: cápsulas, espresso o superautomática'),
  ], CATEGORY_DECISION, null, null),
  mapping('muebles', 'category', 'Categoría de muebles, no una pieza.', [
    attr('model', 'Tipo de mueble'),
    attr('configuration', 'Medidas'),
  ], CATEGORY_DECISION, null, null),
  mapping('bicicletas', 'category', 'Categoría de bicicletas, no un modelo.', [
    attr('brand', 'Fabricante'),
    attr('model', 'Modelo'),
    attr('edition', 'Tipo: carretera, montaña, urbana u otro'),
    attr('configuration', 'Talla'),
  ], CATEGORY_DECISION, null, null),
  mapping('material-fitness', 'category', 'Categoría de material fitness, no un aparato.', [
    attr('brand', 'Fabricante'),
    attr('model', 'Aparato'),
  ], CATEGORY_DECISION, null, null),
  mapping('material-outdoor', 'category', 'Categoría de material outdoor, no un equipo.', [
    attr('brand', 'Fabricante'),
    attr('model', 'Tipo de equipo'),
  ], CATEGORY_DECISION, null, null),
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

const OFFICIAL_DECISION_HOSTS = new Set([
  'support.apple.com',
  'www.apple.com',
  'www.samsung.com',
  'www.playstation.com',
  'www.nintendo.com',
  'www.xbox.com',
  'www.steamdeck.com',
])

/** La URL de una decisión pendiente tiene que ser una ficha https del fabricante. */
export function isOfficialMappingDecisionSource(url: string | null): boolean {
  if (!hasText(url)) return false
  try {
    const parsed = new URL(url)
    return parsed.protocol === 'https:' && OFFICIAL_DECISION_HOSTS.has(parsed.hostname)
  } catch {
    return false
  }
}

/**
 * La decisión se puede auditar. Un pendiente no lleva identificador ni
 * referencia de verificación. Una familia pendiente cita una ficha oficial.
 */
export function mappingDecisionIsExplicit(spec: SecondHandProductMapping): boolean {
  if (!hasText(spec.decisionNote)) return false
  if (spec.reviewStatus === 'rejected') return true
  if (spec.reviewStatus === 'verified') {
    return hasText(spec.verificationRef) && missingRequiredAttributes(spec).length === 0
  }
  if (spec.externalProductId !== null || spec.verificationRef !== null) return false
  if (spec.scope === 'category') return spec.decisionSourceUrl === null && spec.reviewPriority === null
  return isOfficialMappingDecisionSource(spec.decisionSourceUrl) && typeof spec.reviewPriority === 'number'
}

/** El catálogo editorial y el de mapping nombran los mismos slugs, en el mismo orden. */
export function secondHandMappingCoversCatalog(): boolean {
  if (SECOND_HAND_PRODUCT_MAPPINGS.length !== SECOND_HAND_PRODUCTS.length) return false
  return SECOND_HAND_PRODUCT_MAPPINGS.every((spec, index) => spec.productId === SECOND_HAND_PRODUCTS[index]?.slug)
}
