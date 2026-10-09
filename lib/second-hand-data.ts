import { EMPTY_METRICS, SECOND_HAND_PRODUCTS, type SecondHandMetrics, type SecondHandProduct } from './second-hand'

export const SECOND_HAND_CONDITIONS = ['new', 'like-new', 'good', 'fair', 'poor', 'unknown'] as const
export type SecondHandCondition = (typeof SECOND_HAND_CONDITIONS)[number]

/** Observación cruda tal y como la entrega una fuente (sin confiar en ella). */
export interface RawSecondHandObservation {
  productId?: unknown
  price?: unknown
  currency?: unknown
  condition?: unknown
  source?: unknown
  sourceUrl?: unknown
  observedAt?: unknown
  referencePrice?: unknown
  minPrice?: unknown
  maxPrice?: unknown
}

/** Observación validada y normalizada. */
export interface SecondHandPriceObservation {
  productId: string
  price: number
  currency: string
  condition: SecondHandCondition
  source: string
  sourceUrl: string
  observedAt: string
  referencePrice: number | null
  minPrice: number | null
  maxPrice: number | null
}

export type ObservationResult =
  | { ok: true; value: SecondHandPriceObservation }
  | { ok: false; error: string }

export interface SecondHandDataSource {
  readonly id: string
  getProductData(productId: string): Promise<SecondHandPriceObservation | null>
}

const CONDITION_ALIASES: Record<string, SecondHandCondition> = {
  new: 'new', nuevo: 'new',
  'like-new': 'like-new', 'like new': 'like-new', 'como nuevo': 'like-new', refurbished: 'like-new', reacondicionado: 'like-new',
  good: 'good', bueno: 'good', 'buen estado': 'good', used: 'good', usado: 'good',
  fair: 'fair', acceptable: 'fair', aceptable: 'fair',
  poor: 'poor', malo: 'poor', 'para piezas': 'poor',
}

export function normalizeCondition(value: unknown): SecondHandCondition {
  if (typeof value !== 'string') return 'unknown'
  return CONDITION_ALIASES[value.trim().toLowerCase().replace(/_/g, '-')] ?? 'unknown'
}

const isPositive = (n: unknown): n is number => typeof n === 'number' && Number.isFinite(n) && n > 0

function validCurrency(value: unknown): string | null {
  if (typeof value !== 'string') return null
  const code = value.trim().toUpperCase()
  if (!/^[A-Z]{3}$/.test(code)) return null
  try {
    new Intl.NumberFormat('en', { style: 'currency', currency: code })
    return code
  } catch {
    return null
  }
}

function validUrl(value: unknown): string | null {
  if (typeof value !== 'string') return null
  try {
    const u = new URL(value.trim())
    return u.protocol === 'https:' || u.protocol === 'http:' ? u.toString() : null
  } catch {
    return null
  }
}

function validTimestamp(value: unknown): string | null {
  if (typeof value !== 'string' || !value.trim()) return null
  const t = Date.parse(value)
  if (Number.isNaN(t)) return null
  return new Date(t).toISOString()
}

/** Valida una observación; nunca rellena datos ausentes con valores inventados. */
export function validateObservation(raw: RawSecondHandObservation | null | undefined): ObservationResult {
  if (!raw || typeof raw !== 'object') return { ok: false, error: 'invalid observation' }
  if (typeof raw.productId !== 'string' || !raw.productId.trim()) return { ok: false, error: 'missing productId' }
  if (typeof raw.source !== 'string' || !raw.source.trim()) return { ok: false, error: 'missing source' }
  if (!isPositive(raw.price)) return { ok: false, error: 'price must be a positive number' }
  const currency = validCurrency(raw.currency)
  if (!currency) return { ok: false, error: 'invalid currency' }
  const sourceUrl = validUrl(raw.sourceUrl)
  if (!sourceUrl) return { ok: false, error: 'invalid sourceUrl' }
  const observedAt = validTimestamp(raw.observedAt)
  if (!observedAt) return { ok: false, error: 'invalid observedAt' }

  const optional = (v: unknown) => (isPositive(v) ? v : null)
  let minPrice = optional(raw.minPrice)
  let maxPrice = optional(raw.maxPrice)
  if (minPrice !== null && maxPrice !== null && minPrice > maxPrice) { minPrice = null; maxPrice = null }

  return {
    ok: true,
    value: {
      productId: raw.productId.trim(),
      price: raw.price,
      currency,
      condition: normalizeCondition(raw.condition),
      source: raw.source.trim(),
      sourceUrl,
      observedAt,
      referencePrice: optional(raw.referencePrice),
      minPrice,
      maxPrice,
    },
  }
}

/** Fuente por defecto: no hay fuente real conectada, por lo que nunca devuelve datos. */
export const emptySecondHandDataSource: SecondHandDataSource = {
  id: 'empty',
  async getProductData() { return null },
}

/** Convierte una observación en métricas de UI. Score y tendencia siguen en null (sin fuente). */
export function observationToMetrics(o: SecondHandPriceObservation | null): SecondHandMetrics {
  if (!o) return { ...EMPTY_METRICS }
  const savings = o.referencePrice !== null && o.referencePrice > o.price ? o.referencePrice - o.price : null
  return {
    ...EMPTY_METRICS,
    usedPrice: o.price,
    newPrice: o.referencePrice,
    savings,
    currency: o.currency,
    source: o.source,
    updatedAt: o.observedAt,
  }
}

/** Consulta las fuentes en orden; la primera observación válida gana. Los errores se convierten en ausencia de dato. */
export async function getSecondHandMetrics(
  productId: string,
  sources: SecondHandDataSource[] = [emptySecondHandDataSource],
): Promise<SecondHandMetrics> {
  for (const source of sources) {
    try {
      const obs = await source.getProductData(productId)
      if (!obs) continue
      const result = validateObservation(obs)
      if (result.ok && result.value.productId === productId) return observationToMetrics(result.value)
    } catch {
      continue
    }
  }
  return { ...EMPTY_METRICS }
}

/** Devuelve los productos con métricas resueltas desde las fuentes (por defecto, vacías). */
export async function getSecondHandProducts(
  sources: SecondHandDataSource[] = [emptySecondHandDataSource],
): Promise<SecondHandProduct[]> {
  return Promise.all(SECOND_HAND_PRODUCTS.map(async (p) => ({ ...p, metrics: await getSecondHandMetrics(p.slug, sources) })))
}
