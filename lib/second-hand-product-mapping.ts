import { SECOND_HAND_PRODUCTS } from './second-hand'

/**
 * Especificación del modelo que un slug editorial podrá comparar.
 * No es un anuncio ni un permiso para buscar precios.
 *
 * El esquema es compatible con el mapping del adapter de eBay
 * (`productId`, `externalProductId`, `verified`), que sigue desconectado
 * y no se importa aquí.
 *
 * Pasar un registro a `verified` exige el expediente de
 * `lib/second-hand-verification-policy.ts`. El único que lo cumple es
 * `nintendo-switch`: Nintendo Switch – Modelo OLED, 64 GB, HEG-001.
 * No lleva `externalProductId`. Un texto en ese campo no es un id validado
 * para comparar: ese contrato todavía no existe.
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
  /** Expediente de la ficha oficial. null mientras el modelo no esté verificado. */
  recordedVerification: SecondHandRecordedVerification | null
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
): SecondHandProductMapping {
  return {
    productId,
    scope,
    identifies,
    attributes,
    reviewStatus: 'pending',
    externalProductId: null,
    verificationRef: null,
    recordedVerification: null,
  }
}

const SWITCH_OLED_SPEC_URL = 'https://www.nintendo.com/es-es/Hardware/Familia-Nintendo-Switch/Nintendo-Switch-Modelo-OLED/Nintendo-Switch-Modelo-OLED-2000984.html'
const SWITCH_OLED_DOC_URL = 'https://www.nintendo.com/eu/media/downloads/support_1/nintendoswitch/NSwitchOledModel_DeclarationOfConformity.pdf'

/**
 * Único mapping verificado. La ficha de Nintendo ES fija el nombre, los 64 GB
 * y la pantalla de 7 pulgadas. La declaración UE de conformidad publica HEG-001
 * para esa consola. No hay externalProductId.
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
  verifiedSwitchOled(),
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

/**
 * Un valor presente no está validado ni autorizado para comparar.
 * El contrato del identificador de marketplace pertenece al adapter y aún no existe.
 * No consulta eBay ni decide si el texto es un id real.
 */
export function hasValidatedMarketplaceId(externalProductId: string | null): boolean {
  void externalProductId
  return false
}

/**
 * Listo para comparar precios. Exige identidad cerrada y un id de marketplace
 * validado por el contrato del adapter. Un `externalProductId` arbitrario no basta.
 * No consulta precios ni publica métricas.
 */
export function canComparePrices(spec: SecondHandProductMapping): boolean {
  return spec.reviewStatus === 'verified'
    && hasValidatedMarketplaceId(spec.externalProductId)
    && mappingIssues(spec).length === 0
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
