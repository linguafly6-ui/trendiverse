import {
  validateObservation,
  type SecondHandCondition,
  type SecondHandDataSource,
  type SecondHandPriceObservation,
} from './second-hand-data'

/**
 * Esqueleto del adapter de eBay Browse API. No está conectado ni activado.
 *
 * `getProductData` devuelve siempre `null`. El proveedor por defecto de
 * `getSecondHandProducts` sigue siendo `emptySecondHandDataSource`.
 *
 * Activarlo exige completar el gate contractual y operativo descrito en la
 * PR #93 (`docs/second-hand-data-sources-research.md`, «Gate antes de
 * implementar eBay»):
 * 1. Acceso de producción de la Browse API.
 * 2. Autorización de eBay Partner Network.
 * 3. Marketplace `EBAY_ES` en cada llamada.
 * 4. Política de frescura: un anuncio mostrado no puede superar las seis horas
 *    respecto al sitio de eBay, y se borra si deja de ser público. Un fallo de
 *    refresco no alarga ese plazo.
 * 5. Permiso escrito para el uso que Trendiverse haga de los datos. Ahorro,
 *    mínimo, máximo y Second-Hand Score siguen bloqueados.
 * 6. Mapping de producto verificado por una persona. Con
 *    `externalProductId: null` no hay observación publicable.
 * 7. Credenciales solo en el servidor, fuera del repositorio.
 *
 * Este módulo no tiene cliente HTTP, OAuth, cron, KV ni lectura de secretos.
 */

/** Antigüedad máxima de un anuncio de eBay que se pudiera mostrar. */
export const EBAY_LISTING_MAX_AGE_MS = 6 * 60 * 60 * 1000

/**
 * La activación está cerrada. Cambiar este valor no conecta la API: no hay
 * cliente ni credenciales en este módulo.
 */
export const EBAY_BROWSE_SOURCE_ENABLED = false

/** Identificador externo aún no comprobado por una persona. */
export interface EbayProductMapping {
  productId: string
  externalProductId: string | null
  verified: boolean
}

/**
 * Oferta ya separada de cualquier respuesta de red. Los campos `unknown` no
 * se consideran fiables hasta que las funciones puras los acepten.
 * `conditionAdmitted` solo puede ser true si esa categoría y ese mercado
 * admiten el `conditionId`. Un identificador documentado no basta.
 */
export interface EbayNormalizedOffer {
  productId: string
  externalProductId: string | null
  price: unknown
  currency: unknown
  sourceUrl: unknown
  conditionId: unknown
  conditionAdmitted: boolean
  observedAt: unknown
}

/**
 * IDs documentados en la guía de condiciones de eBay (definiciones de EE. UU.).
 * No afirma que el ID exista en `EBAY_ES` ni en una categoría concreta.
 * `7000` (for parts) no entra en la normalización como usado funcional.
 */
const DOCUMENTED_CONDITION_IDS: Record<number, SecondHandCondition> = {
  1000: 'new',
  1500: 'new',
  1750: 'new',
  2000: 'like-new',
  2010: 'like-new',
  2500: 'like-new',
  2750: 'like-new',
  2020: 'good',
  2990: 'good',
  3000: 'good',
  4000: 'good',
  2030: 'fair',
  3010: 'fair',
  5000: 'fair',
  6000: 'poor',
  7000: 'poor',
}

const NORMALIZABLE_CONDITIONS = new Set<SecondHandCondition>(['like-new', 'good', 'fair', 'poor'])

export function normalizeEbayPrice(value: unknown): number | null {
  if (typeof value !== 'number' || !Number.isFinite(value) || value <= 0) return null
  return value
}

export function normalizeEbayCurrency(value: unknown): string | null {
  if (typeof value !== 'string') return null
  const code = value.trim().toUpperCase()
  if (!/^[A-Z]{3}$/.test(code)) return null
  try {
    if (!Intl.supportedValuesOf('currency').includes(code)) return null
  } catch {
    try {
      new Intl.NumberFormat('en', { style: 'currency', currency: code })
    } catch {
      return null
    }
  }
  return code
}

/**
 * Normaliza una URL http(s) de fixture. Rechaza fichas de eBay y parámetros de
 * afiliado. Aceptar otra URL no autoriza a publicarla.
 */
export function normalizeEbaySourceUrl(value: unknown): string | null {
  if (typeof value !== 'string') return null
  let url: URL
  try {
    url = new URL(value.trim())
  } catch {
    return null
  }
  if (url.protocol !== 'https:' && url.protocol !== 'http:') return null
  const host = url.hostname.toLowerCase()
  if (host === 'ebay.com' || host.endsWith('.ebay.com') || host === 'ebay.es' || host.endsWith('.ebay.es') || host.includes('ebay')) {
    return null
  }
  for (const key of url.searchParams.keys()) {
    const name = key.toLowerCase()
    if (name === 'campid' || name === 'customid' || name === 'mkcid' || name === 'mkevt' || name === 'mkrid' || name === 'toolid') {
      return null
    }
  }
  return url.toString()
}

export function ebayListingAgeMs(observedAt: unknown, now: number): number | null {
  if (typeof observedAt !== 'string' || !observedAt.trim() || !Number.isFinite(now)) return null
  const time = Date.parse(observedAt)
  if (Number.isNaN(time)) return null
  return now - time
}

/** true solo si la oferta no es futura y no supera las seis horas. No hay periodo de gracia. */
export function isEbayListingWithinDisplayWindow(observedAt: unknown, now: number): boolean {
  const age = ebayListingAgeMs(observedAt, now)
  return age !== null && age >= 0 && age <= EBAY_LISTING_MAX_AGE_MS
}

/**
 * Devuelve la condición normalizada solo si el ID está documentado, la
 * categoría lo admite y el resultado es un usado o reacondicionado normalizable.
 * Nuevo, desconocido, piezas (`7000`) y un ID no admitido devuelven null.
 * El resultado no autoriza a publicar contenido de eBay.
 */
export function normalizeEbayCondition(conditionId: unknown, conditionAdmitted: boolean): SecondHandCondition | null {
  if (conditionAdmitted !== true) return null
  if (typeof conditionId !== 'number' || !Number.isInteger(conditionId)) return null
  if (conditionId === 7000) return null
  const condition = DOCUMENTED_CONDITION_IDS[conditionId]
  if (!condition || !NORMALIZABLE_CONDITIONS.has(condition)) return null
  return condition
}

export function isVerifiedEbayMapping(mapping: EbayProductMapping, productId: string): boolean {
  if (mapping.verified !== true) return false
  if (mapping.productId !== productId) return false
  if (typeof mapping.externalProductId !== 'string') return false
  const id = mapping.externalProductId.trim()
  return id.length > 0 && id === mapping.externalProductId
}

/**
 * Función de normalización. Comprueba la forma de una oferta ya separada de
 * cualquier respuesta de red y, si pasa las reglas de este esqueleto, devuelve
 * un objeto normalizado. No autoriza a publicar contenido de eBay.
 *
 * La publicación sigue bloqueada hasta completar el gate contractual de la PR #93.
 * `getProductData` no llama a esta función y devuelve siempre `null`.
 * Un objeto devuelto aquí no sustituye al proveedor vacío ni habilita una URL
 * de ficha o de afiliado de eBay: esas URL se rechazan.
 *
 * Devuelve null si el mapping no está verificado, la condición no es
 * compatible, la oferta supera las seis horas o la URL no es un fixture
 * http(s). No rellena ahorro, mínimo, máximo ni precios de referencia.
 */
export function ebayOfferToObservation(
  offer: EbayNormalizedOffer,
  mapping: EbayProductMapping,
  now: number,
): SecondHandPriceObservation | null {
  if (typeof offer.productId !== 'string' || !offer.productId.trim()) return null
  const productId = offer.productId.trim()
  if (!isVerifiedEbayMapping(mapping, productId)) return null
  if (offer.externalProductId !== mapping.externalProductId) return null
  if (!isEbayListingWithinDisplayWindow(offer.observedAt, now)) return null
  const condition = normalizeEbayCondition(offer.conditionId, offer.conditionAdmitted)
  if (!condition) return null
  const price = normalizeEbayPrice(offer.price)
  const currency = normalizeEbayCurrency(offer.currency)
  const sourceUrl = normalizeEbaySourceUrl(offer.sourceUrl)
  if (price === null || currency === null || sourceUrl === null) return null

  const result = validateObservation({
    productId,
    price,
    currency,
    condition,
    source: 'ebay',
    sourceUrl,
    observedAt: offer.observedAt,
  })
  if (!result.ok || result.value.productId !== productId) return null
  return {
    ...result.value,
    referencePrice: null,
    minPrice: null,
    maxPrice: null,
  }
}

/** Adapter presente y apagado. No consulta eBay y no publica observaciones. */
export const ebayBrowseSecondHandSource: SecondHandDataSource = {
  id: 'ebay-browse',
  async getProductData(): Promise<SecondHandPriceObservation | null> {
    return null
  },
}
