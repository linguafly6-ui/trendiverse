import { SITE_URL } from './constants'

export const SECOND_HAND_PATH = '/segunda-mano'

export const SECOND_HAND_SEO = {
  title: 'Segunda mano: tendencias, precios y oportunidades',
  description: 'Descubre qué productos de segunda mano están ganando popularidad, qué categorías están en tendencia y qué oportunidades merece la pena vigilar.',
  h1: 'Segunda mano: descubre qué merece la pena comprar usado',
  heroTitle: 'Segunda mano',
  heroSubtitle: 'Descubre qué productos están marcando tendencia en el mercado de segunda mano y cuáles pueden ofrecer las mejores oportunidades.',
}

/** Valores cuantitativos: `null` mientras no exista una fuente de datos real. */
export interface SecondHandMetrics {
  score: number | null
  trend: number | null
  newPrice: number | null
  usedPrice: number | null
  savings: number | null
  currency: string | null
  source: string | null
  updatedAt: string | null
}

export interface SecondHandProduct {
  slug: string
  name: string
  categorySlug: string
  summary: string
  watch: boolean
  metrics: SecondHandMetrics
}

export interface SecondHandCategory {
  slug: string
  name: string
  icon: string
  description: string
  seoTitle: string
  intro: string
}

export const EMPTY_METRICS: SecondHandMetrics = {
  score: null, trend: null, newPrice: null, usedPrice: null, savings: null, currency: null, source: null, updatedAt: null,
}

export const SECOND_HAND_SCORE = {
  name: 'Trendiverse Second-Hand Score',
  status: 'En desarrollo',
  description: 'Una métrica propia que combinará demanda, evolución de búsquedas, diferencia entre precio nuevo y usado, conservación de valor, tendencia y riesgo. Se publicará cuando existan fuentes de datos reales.',
  factors: ['Demanda', 'Evolución de búsquedas', 'Precio nuevo vs. usado', 'Conservación de valor', 'Tendencia', 'Riesgo'],
}

export const SECOND_HAND_CATEGORIES: SecondHandCategory[] = [
  { slug: 'tecnologia', name: 'Tecnología', icon: '💻', description: 'Móviles, portátiles, tabletas y relojes inteligentes.', seoTitle: 'Tecnología de segunda mano: qué mirar antes de comprar', intro: 'Los dispositivos electrónicos pierden valor con rapidez, pero su estado de batería, el soporte de software y la garantía marcan la diferencia.' },
  { slug: 'gaming', name: 'Gaming', icon: '🎮', description: 'Consolas y portátiles de juego.', seoTitle: 'Gaming de segunda mano: consolas y portátiles', intro: 'En consolas importan el estado de los mandos, el almacenamiento, las cuentas vinculadas y si el equipo conserva su embalaje y garantía.' },
  { slug: 'moda', name: 'Moda', icon: '👟', description: 'Zapatillas, bolsos y ropa vintage.', seoTitle: 'Moda de segunda mano: zapatillas, bolsos y vintage', intro: 'En moda pesan la autenticidad, el desgaste real y la talla. Los riesgos de falsificación aumentan en marcas muy buscadas.' },
  { slug: 'hogar', name: 'Hogar', icon: '🏠', description: 'Aspiradores, cafeteras y muebles.', seoTitle: 'Hogar de segunda mano: electrodomésticos y muebles', intro: 'En el hogar conviene comprobar funcionamiento, disponibilidad de recambios y logística de transporte antes de cerrar una compra.' },
  { slug: 'deporte', name: 'Deporte', icon: '🚴', description: 'Bicicletas, material fitness y outdoor.', seoTitle: 'Deporte de segunda mano: bicicletas y material', intro: 'En material deportivo la seguridad y el desgaste de componentes críticos son más importantes que el ahorro inicial.' },
]

const p = (slug: string, name: string, categorySlug: string, summary: string, watch = false): SecondHandProduct => ({
  slug, name, categorySlug, summary, watch, metrics: { ...EMPTY_METRICS },
})

export const SECOND_HAND_PRODUCTS: SecondHandProduct[] = [
  p('iphone', 'iPhone', 'tecnologia', 'Producto muy relevante dentro del mercado de segunda mano. Conviene revisar batería, versión y garantía.', true),
  p('macbook', 'MacBook', 'tecnologia', 'Portátil habitual en el mercado de usados. Importan el chip, el estado de la batería y el soporte de macOS.', true),
  p('ipad', 'iPad', 'tecnologia', 'Tableta con presencia constante en usados. Revisa la generación, el almacenamiento y los accesorios.'),
  p('apple-watch', 'Apple Watch', 'tecnologia', 'Reloj inteligente donde pesan la batería y el bloqueo de cuenta.'),
  p('samsung-galaxy', 'Samsung Galaxy', 'tecnologia', 'Gama amplia de móviles Android; comprueba años de actualizaciones restantes.'),
  p('playstation-5', 'PlayStation 5', 'gaming', 'Consola de actual generación con oferta de usados y reacondicionados. Comprueba versión, mandos y garantía.', true),
  p('nintendo-switch', 'Nintendo Switch', 'gaming', 'Consola con amplio mercado de segunda mano. Revisa el estado de los Joy-Con y de la pantalla.', true),
  p('xbox', 'Xbox', 'gaming', 'Consolas de varias generaciones; verifica el modelo y el almacenamiento incluido.'),
  p('steam-deck', 'Steam Deck', 'gaming', 'Portátil de juego donde importan el estado de los sticks, la batería y el almacenamiento.'),
  p('zapatillas', 'Zapatillas', 'moda', 'Categoría con riesgo de falsificación en modelos muy buscados. Verifica autenticidad y desgaste de suela.', true),
  p('bolsos', 'Bolsos', 'moda', 'Piezas donde la autenticidad y el estado de materiales son clave.'),
  p('ropa-vintage', 'Ropa vintage', 'moda', 'Prendas únicas; revisa tallas reales, tejidos y reparaciones.'),
  p('aspiradores', 'Aspiradores', 'hogar', 'Comprueba la batería, el filtro y la disponibilidad de recambios.'),
  p('cafeteras', 'Cafeteras', 'hogar', 'Revisa limpieza interna, descalcificación y compatibilidad de cápsulas o accesorios.'),
  p('muebles', 'Muebles', 'hogar', 'Valora el estado de la estructura, las medidas y el coste del transporte.'),
  p('bicicletas', 'Bicicletas', 'deporte', 'Revisa el cuadro, la transmisión, los frenos y la talla antes de comprar.'),
  p('material-fitness', 'Material fitness', 'deporte', 'Comprueba el desgaste, la estabilidad y la seguridad del equipo.'),
  p('material-outdoor', 'Material outdoor', 'deporte', 'Inspecciona costuras, cremalleras e impermeabilidad antes de comprar.'),
]

export const SECOND_HAND_CRITERIA = [
  { title: 'Diferencia de precio', text: 'El ahorro solo compensa si la diferencia con el producto nuevo o reacondicionado es significativa para el estado ofrecido.' },
  { title: 'Estado y antigüedad', text: 'El uso real, las reparaciones previas y la edad del producto influyen más que el simple anuncio.' },
  { title: 'Garantía', text: 'Un vendedor profesional o un reacondicionado suelen ofrecer garantía; entre particulares, la protección es menor.' },
  { title: 'Depreciación', text: 'Algunos productos conservan mejor su valor y son más fáciles de revender; otros pierden valor rápidamente.' },
  { title: 'Disponibilidad', text: 'Si hay pocas unidades, la comparación entre ofertas es más difícil y el margen de negociación menor.' },
  { title: 'Riesgo de falsificación o defectos', text: 'En productos muy buscados pide fotos, número de serie y prueba de compra, y utiliza pagos con protección.' },
  { title: 'Reacondicionado', text: 'Comparar con equipos reacondicionados puede ofrecer un punto intermedio entre precio y fiabilidad.' },
]

export const secondHandCategory = (slug: string) => SECOND_HAND_CATEGORIES.find((c) => c.slug === slug)
/** Filtra un listado ya resuelto. Sin el segundo argumento usa el catálogo editorial (métricas vacías). */
export const secondHandProductsByCategory = (slug: string, products: readonly SecondHandProduct[] = SECOND_HAND_PRODUCTS) =>
  products.filter((x) => x.categorySlug === slug)
export const secondHandWatchlist = (products: readonly SecondHandProduct[] = SECOND_HAND_PRODUCTS) =>
  products.filter((x) => x.watch)
export const secondHandCategoryPath = (slug: string) => `${SECOND_HAND_PATH}/${slug}`
export const secondHandUrl = (path = SECOND_HAND_PATH) => `${SITE_URL}${path}`

export function hasMetrics(m: SecondHandMetrics) {
  return m.score !== null || m.trend !== null || m.newPrice !== null || m.usedPrice !== null || m.savings !== null
}

export const SECOND_HAND_PENDING_COPY = 'Datos de precio y Second-Hand Score pendientes de fuentes reales.'

/** Importe visible. Omite null, no finitos y valores que se redondearían a 0. */
export function formatSecondHandMoney(amount: number | null, currency: string | null): string | null {
  if (amount === null || !Number.isFinite(amount) || amount <= 0 || Math.round(amount) === 0) return null
  if (!currency || !/^[A-Z]{3}$/.test(currency)) return null
  try {
    const formatted = new Intl.NumberFormat('es-ES', { style: 'currency', currency, maximumFractionDigits: 0 }).format(amount)
    return /^0(?:[.,]0+)?(?:\s|\u00a0)*[^\d\s]+$/.test(formatted.trim()) ? null : formatted
  } catch {
    return null
  }
}

export function formatSecondHandUpdatedAt(value: string | null): string | null {
  if (!value) return null
  const time = Date.parse(value)
  if (Number.isNaN(time)) return null
  return new Intl.DateTimeFormat('es-ES', { dateStyle: 'medium', timeZone: 'UTC' }).format(new Date(time))
}

/** Filas que la UI puede pintar. El ahorro es un importe, no un porcentaje. */
export function secondHandMetricRows(m: SecondHandMetrics): { label: string; value: string }[] {
  const rows: { label: string; value: string }[] = []
  const used = formatSecondHandMoney(m.usedPrice, m.currency)
  const fresh = formatSecondHandMoney(m.newPrice, m.currency)
  const saved = formatSecondHandMoney(m.savings, m.currency)
  if (used) rows.push({ label: 'Precio usado', value: used })
  if (fresh) rows.push({ label: 'Precio nuevo', value: fresh })
  if (saved) rows.push({ label: 'Ahorro', value: saved })
  if (m.currency && /^[A-Z]{3}$/.test(m.currency)) rows.push({ label: 'Moneda', value: m.currency })
  if (typeof m.source === 'string' && m.source.trim()) rows.push({ label: 'Fuente', value: m.source.trim() })
  const updated = formatSecondHandUpdatedAt(m.updatedAt)
  if (updated) rows.push({ label: 'Actualizado', value: updated })
  if (typeof m.score === 'number' && Number.isFinite(m.score)) rows.push({ label: 'Second-Hand Score', value: String(m.score) })
  return rows
}
