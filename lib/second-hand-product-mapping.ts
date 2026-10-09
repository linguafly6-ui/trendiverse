import { SECOND_HAND_PRODUCTS } from './second-hand'
import {
  MARKETPLACE_ID_ALLOWLIST,
  hasValidatedMarketplaceId,
  type SecondHandMarketplaceIdAllowlist,
  type SecondHandMarketplaceIdContext,
  type SecondHandMarketplaceIdentifier,
} from './second-hand-marketplace-id'

export {
  MARKETPLACE_ID_ALLOWLIST,
  hasValidatedMarketplaceId,
  validateMarketplaceIdentifier,
  type MarketplaceIdentifierCandidate,
  type MarketplaceIdentifierEvidence,
  type MarketplaceIdentifierProcedureContext,
  type MarketplaceIdentifierValidation,
  type SecondHandMarketplaceIdAllowlist,
  type SecondHandMarketplaceIdContext,
  type SecondHandMarketplaceIdentifier,
} from './second-hand-marketplace-id'

/**
 * Especificación del modelo que un slug editorial podrá comparar.
 * No es un anuncio ni un permiso para buscar precios.
 *
 * Cada registro tiene una decisión auditable. En este catálogo solo
 * `nintendo-switch` está verificado; los otros 17 siguen en `pending`.
 * No se inventa un identificador de marketplace y no se habilita una
 * comparación. El esquema es compatible con el mapping del adapter de eBay
 * (`productId`, `externalProductId`, `verified`), que sigue desconectado
 * y no se importa aquí.
 *
 * Pasar un registro a `verified` exige el expediente de
 * `lib/second-hand-verification-policy.ts`. El único que lo cumple es
 * `nintendo-switch`: Nintendo Switch – Modelo OLED, 64 GB, HEG-001.
 * No lleva `externalProductId` ni un identificador de marketplace.
 * Un texto en `externalProductId` no está validado. La validación es el
 * contrato de `lib/second-hand-marketplace-id.ts`, y el catálogo no lo cumple.
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
  /**
   * Identificador de marketplace y su estado de validación.
   * null es ausencia. No se rellena con el nombre ni con el código del fabricante.
   */
  marketplaceIdentifier: SecondHandMarketplaceIdentifier | null
  /** Responsable o referencia de una verificación. null mientras el estado no sea `verified`. */
  verificationRef: string | null
  /** Expediente de la ficha oficial. null mientras el modelo no esté verificado. */
  recordedVerification: SecondHandRecordedVerification | null
  /** Por qué el estado es el que es. Obligatorio en el catálogo. */
  decisionNote: string
  /** Página oficial que respalda la decisión. null si el slug no es un producto de fabricante. */
  decisionSourceUrl: string | null
  /**
   * Orden para cerrar la identidad antes de buscar un identificador externo.
   * 1 es el primero. null en categorías. No es un ranking de ventas ni de precio.
   */
  reviewPriority: number | null
}

export const SECOND_HAND_MAPPING_AMBIGUITIES = [
  'capacity',
  'disc-vs-digital',
  'size',
  'connectivity',
  'region',
  'incompatible-revision',
] as const
export type SecondHandMappingAmbiguity = (typeof SECOND_HAND_MAPPING_AMBIGUITIES)[number]

/**
 * Lo que la ficha oficial deja demostrado. No incluye un id de marketplace.
 * `openAmbiguities` vacío solo cuenta si `ambiguitiesReviewed` es true.
 */
export interface SecondHandRecordedVerification {
  manufacturer: string
  exactModel: string
  generation: string
  configuration: string
  officialUrl: string
  manufacturerIdentifier: string
  manufacturerIdentifierSourceUrl: string
  demonstratedSourceUrls: {
    manufacturer: string
    exactModel: string
    generation: string
    configuration: string
  }
  ambiguitiesReviewed: boolean
  openAmbiguities: readonly SecondHandMappingAmbiguity[]
  ambiguityResolutions: {
    capacity: string
    discVsDigital: string
    size: string
    connectivity: string
    region: string
    incompatibleRevision: string
  }
  /**
   * Pasaje del documento que publica el número de modelo junto al nombre de la consola.
   * `verificationEvidenceIssues()` no descarga esa URL ni comprueba el texto.
   */
  modelCodeCitation: {
    sourceUrl: string
    productNameAsPublished: string
    modelNumberAsPublished: string
    quotation: string
  }
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
    marketplaceIdentifier: null,
    verificationRef: null,
    recordedVerification: null,
    decisionNote,
    decisionSourceUrl,
    reviewPriority,
  }
}

const SWITCH_OLED_SPEC_URL = 'https://www.nintendo.com/es-es/Hardware/Familia-Nintendo-Switch/Nintendo-Switch-Modelo-OLED/Nintendo-Switch-Modelo-OLED-2000984.html'
const SWITCH_OLED_DOC_URL = 'https://www.nintendo.com/eu/media/downloads/support_1/nintendoswitch/NSwitchOledModel_DeclarationOfConformity.pdf'

/**
 * Único mapping verificado. La ficha de Nintendo ES fija el nombre, los 64 GB
 * y la pantalla de 7 pulgadas. La declaración UE de conformidad publica HEG-001
 * para esa consola. No hay externalProductId ni identificador de marketplace.
 */
function verifiedSwitchOled(): SecondHandProductMapping {
  const manufacturer = 'Nintendo Co., Ltd.'
  const exactModel = 'Nintendo Switch – Modelo OLED'
  const generation = 'Modelo OLED'
  const configuration = '64 GB de almacenamiento interno. Pantalla táctil capacitiva / OLED 7 pulgadas / resolución de 1280x720'
  return {
    productId: 'nintendo-switch',
    scope: 'family',
    identifies: 'Nintendo Switch – Modelo OLED, 64 GB, número de modelo HEG-001. No incluye la consola HAC-001(-01) ni la Lite HDH-001.',
    attributes: [
      { key: 'brand', label: 'Fabricante', value: manufacturer, requiredForComparison: true },
      { key: 'model', label: 'Consola', value: exactModel, requiredForComparison: true },
      { key: 'edition', label: 'Modelo original, OLED o Lite', value: generation, requiredForComparison: true },
      { key: 'capacity', label: 'Capacidad', value: '64 GB', requiredForComparison: true },
    ],
    reviewStatus: 'verified',
    externalProductId: null,
    marketplaceIdentifier: null,
    verificationRef: 'Declaración UE de conformidad de Nintendo Co., Ltd., número de modelo HEG-001, y ficha de hardware de Nintendo ES. Revisión del 2026-10-09.',
    recordedVerification: {
      manufacturer,
      exactModel,
      generation,
      configuration,
      officialUrl: SWITCH_OLED_SPEC_URL,
      manufacturerIdentifier: 'HEG-001',
      manufacturerIdentifierSourceUrl: SWITCH_OLED_DOC_URL,
      demonstratedSourceUrls: {
        manufacturer: SWITCH_OLED_DOC_URL,
        exactModel: SWITCH_OLED_SPEC_URL,
        generation: SWITCH_OLED_SPEC_URL,
        configuration: SWITCH_OLED_SPEC_URL,
      },
      ambiguitiesReviewed: true,
      openAmbiguities: [],
      ambiguityResolutions: {
        capacity: 'La ficha de Nintendo ES publica una sola memoria interna: 64 GB. La microSD es una ampliación aparte, no otra capacidad del modelo.',
        discVsDigital: 'Esa ficha describe una sola consola, con ranura solo para tarjetas de juego de Nintendo Switch. No separa una edición digital.',
        size: 'La ficha publica una pantalla: OLED de 7 pulgadas, 1280x720.',
        connectivity: 'Wi-Fi, Bluetooth y la LAN del modo TV figuran en la misma ficha, no como consolas distintas.',
        region: 'La capacidad sale de la ficha de Nintendo ES y el número HEG-001 de la declaración UE de conformidad, las dos en www.nintendo.com. La ficha de EE. UU. no publica ese número y no se usa como fuente del código.',
        incompatibleRevision: 'HEG-001 es el número de la declaración para la consola OLED. No es HAC-001(-01) ni HDH-001. La ficha no parte el modelo por el color de los Joy-Con.',
      },
      modelCodeCitation: {
        sourceUrl: SWITCH_OLED_DOC_URL,
        productNameAsPublished: 'Nintendo Switch – OLED Model console',
        modelNumberAsPublished: 'HEG-001',
        quotation: '1. Product name Nintendo Switch – OLED Model console. 3. Model number HEG-001.',
      },
    },
    decisionNote: 'Verificado. La ficha de Nintendo ES describe Nintendo Switch – Modelo OLED, con 64 GB y pantalla OLED de 7 pulgadas. La declaración UE de conformidad publica, en el mismo documento, «Product name Nintendo Switch – OLED Model console» y «Model number HEG-001». No cubre HAC-001(-01) ni la Lite HDH-001. HEG-001 es el código del fabricante, no un identificador de marketplace.',
    decisionSourceUrl: SWITCH_OLED_SPEC_URL,
    reviewPriority: 3,
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
  verifiedSwitchOled(),
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

function marketplaceIdContext(spec: SecondHandProductMapping): SecondHandMarketplaceIdContext {
  const record = spec.recordedVerification
  const attribute = (key: SecondHandAttributeKey) => {
    const value = spec.attributes.find((item) => item.key === key)?.value
    return hasText(value) ? value : null
  }
  return {
    productId: spec.productId,
    verificationRef: spec.verificationRef,
    manufacturerIdentifier: record?.manufacturerIdentifier ?? null,
    manufacturer: record?.manufacturer ?? attribute('brand'),
    exactModel: record?.exactModel ?? attribute('model'),
    identifies: spec.identifies,
  }
}

/**
 * Listo para comparar precios. Exige la revisión cerrada, sin problemas de
 * mapping, y un identificador que cumpla el contrato completo.
 * Un `externalProductId` presente no basta. La lista por defecto no autoriza
 * a ningún proveedor. No consulta precios ni publica métricas.
 */
export function canComparePrices(
  spec: SecondHandProductMapping,
  allowlist: SecondHandMarketplaceIdAllowlist = MARKETPLACE_ID_ALLOWLIST,
): boolean {
  return spec.reviewStatus === 'verified'
    && mappingIssues(spec).length === 0
    && hasValidatedMarketplaceId(spec.marketplaceIdentifier, marketplaceIdContext(spec), allowlist)
}

/**
 * Proyección hacia el mapping externo del adapter.
 * Solo expone el valor canónico cuando el identificador está validado y el
 * mapping cumple el resto de requisitos. No copia `externalProductId`.
 */
export function asExternalMapping(
  spec: SecondHandProductMapping,
  allowlist: SecondHandMarketplaceIdAllowlist = MARKETPLACE_ID_ALLOWLIST,
): {
  productId: string
  externalProductId: string | null
  verified: boolean
} {
  const identifier = spec.marketplaceIdentifier
  const verified = identifier?.status === 'validated' && canComparePrices(spec, allowlist)
  return {
    productId: spec.productId,
    externalProductId: verified ? identifier.canonicalValue : null,
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

/**
 * Forma válida de `reviewPriority`: `null`, o un entero del 1 al 9.
 * No interpreta ventas, precios ni identificadores de marketplace.
 * El alcance del slug decide cuál de las dos formas corresponde.
 */
export function isValidReviewPriority(value: unknown): boolean {
  if (value === null) return true
  return typeof value === 'number' && Number.isInteger(value) && value >= 1 && value <= 9
}

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
  if (spec.externalProductId !== null || spec.marketplaceIdentifier !== null || spec.verificationRef !== null) return false
  if (!isValidReviewPriority(spec.reviewPriority)) return false
  if (spec.scope === 'category') return spec.decisionSourceUrl === null && spec.reviewPriority === null
  return isOfficialMappingDecisionSource(spec.decisionSourceUrl) && typeof spec.reviewPriority === 'number'
}

/** El catálogo editorial y el de mapping nombran los mismos slugs, en el mismo orden. */
export function secondHandMappingCoversCatalog(): boolean {
  if (SECOND_HAND_PRODUCT_MAPPINGS.length !== SECOND_HAND_PRODUCTS.length) return false
  return SECOND_HAND_PRODUCT_MAPPINGS.every((spec, index) => spec.productId === SECOND_HAND_PRODUCTS[index]?.slug)
}
