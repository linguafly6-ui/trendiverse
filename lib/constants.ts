export const SITE_NAME = 'TrendiVerse'
export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://trendiverse.org'
export const GA_ID = process.env.NEXT_PUBLIC_GA_ID || 'G-EWER6X3E24'

export interface CategoryInfo {
  slug: string
  name: string
  short: string
  icon: string
  color: string
  seoTitle: string
  description: string
  href?: string
}

export const CATEGORIES: CategoryInfo[] = [
  { slug: 'politica', name: 'Política & Actualidad', short: 'Política', icon: '🏛️', color: '#6366F1', seoTitle: 'Política española: elecciones, vivienda y leyes', description: 'Guías y análisis de política española: elecciones, vivienda, decisiones del Gobierno, leyes pendientes y financiación autonómica. Contexto, fechas y fuentes.' },
  { slug: 'economia', name: 'Economía & Mercados', short: 'Economía', icon: '📈', color: '#059669', seoTitle: 'Economía y mercados: últimas noticias y análisis', description: 'Economía, mercados, divisas, empresas, adquisiciones y tendencias que afectan a hogares, inversores y negocios.' },
  { slug: 'deportes', name: 'Deportes', short: 'Deportes', icon: '⚽', color: '#F59E0B', seoTitle: 'Deportes: resultados, partidos y actualidad', description: 'Resultados, partidos, horarios, clasificaciones y actualidad de fútbol, ciclismo y otros deportes.' },
  { slug: 'virales', name: 'Virales & Pop Culture', short: 'Virales', icon: '🔥', color: '#EF4444', seoTitle: 'Virales y cultura pop: últimas tendencias', description: 'Noticias virales, tendencias de internet, cultura pop y temas que están dando que hablar en España y el mundo.' },
  { slug: 'gaming', name: 'Gaming & Guías', short: 'Gaming', icon: '🎮', color: '#10B981', seoTitle: 'Gaming y guías: noticias, trucos y códigos', description: 'Noticias de videojuegos, guías, trucos, códigos y novedades de gaming para PC, PlayStation, Xbox, Nintendo y móvil.' },
  { slug: 'herramientas', name: 'Micro-Herramientas', short: 'Herramientas', icon: '🛠️', color: '#3B82F6', seoTitle: 'Herramientas online gratis y útiles', description: 'Herramientas online rápidas y gratuitas para convertir, calcular, generar y resolver tareas cotidianas.' },
  { slug: 'coches', name: 'Coches & Novedades', short: 'Coches', icon: '🚗', color: '#0EA5E9', seoTitle: 'Coches: novedades, lanzamientos y tecnología', description: 'Noticias de coches, nuevos modelos, movilidad, tecnología del automóvil y novedades de la industria.' },
  { slug: 'tecnologia', name: 'Tecnología & Novedades', short: 'Tecnología', icon: '💻', color: '#8B5CF6', seoTitle: 'Tecnología: últimas noticias y tendencias', description: 'Actualidad tecnológica, inteligencia artificial, ciencia aplicada, innovación, dispositivos y avances que están cambiando el mundo.' },
  { slug: 'chollos', name: 'Chollos & Descuentos', short: 'Chollos', icon: '🏷️', color: '#F97316', seoTitle: 'Chollos y ofertas: descuentos y oportunidades', description: 'Ofertas, descuentos y oportunidades de compra seleccionadas, con precios y condiciones para comparar antes de comprar.' },
  { slug: 'astrologia', name: 'Astrología & Horóscopo', short: 'Astrología', icon: '✨', color: '#312E81', seoTitle: 'Horóscopo semanal y guía de astrología', description: 'Horóscopo semanal por signo solar, con el cielo de la semana y una guía del método: zodiaco tropical, casas y límites de la lectura.', href: '/astrologia' },
]

export interface TopicInfo {
  slug: string
  name: string
  seoTitle: string
  description: string
  query: string
  category?: string
}

export const TOPICS: TopicInfo[] = [
  { slug: 'mundial-2026', name: 'Mundial 2026', seoTitle: 'Mundial 2026: fechas, sedes, grupos y noticias', description: 'Guías y noticias sobre el Mundial 2026: calendario, sedes, formato, grupos y claves del torneo.', query: 'Mundial 2026', category: 'deportes' },
  { slug: 'inteligencia-artificial', name: 'Inteligencia artificial', seoTitle: 'Inteligencia artificial: noticias, herramientas y tendencias', description: 'Noticias y análisis sobre inteligencia artificial, nuevas herramientas, modelos y aplicaciones prácticas.', query: 'inteligencia artificial', category: 'tecnologia' },
  { slug: 'iphone', name: 'iPhone', seoTitle: 'iPhone: novedades, modelos, funciones y guías', description: 'Noticias y guías sobre iPhone, modelos, funciones, actualizaciones y novedades de Apple.', query: 'iPhone', category: 'tecnologia' },
  { slug: 'coches-electricos', name: 'Coches eléctricos', seoTitle: 'Coches eléctricos: modelos, autonomía y novedades', description: 'Actualidad sobre coches eléctricos, nuevos modelos, autonomía, tecnología y movilidad.', query: 'coches eléctricos', category: 'coches' },
  { slug: 'vivienda', name: 'Vivienda', seoTitle: 'Vivienda: precios, alquiler, hipotecas y actualidad', description: 'Noticias y guías sobre vivienda, alquiler, hipotecas, precios y cambios normativos que afectan a los hogares.', query: 'vivienda', category: 'politica' },
]

export const getCategory = (slug: string) => CATEGORIES.find((c) => c.slug === slug)
export const getTopic = (slug: string) => TOPICS.find((t) => t.slug === slug)
