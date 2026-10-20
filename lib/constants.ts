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
  { slug: 'coches', name: 'Coches & Novedades', short: 'Coches', icon: '🚗', color: '#0EA5E9', seoTitle: 'Coches: novedades, lanzamientos y tecnología', description: 'Noticias de coches, nuevos modelos, movilidad, tecnología del automóvil y novedades de la industria.' },
  { slug: 'tecnologia', name: 'Tecnología & Novedades', short: 'Tecnología', icon: '💻', color: '#8B5CF6', seoTitle: 'Tecnología: últimas noticias y tendencias', description: 'Actualidad tecnológica, inteligencia artificial, ciencia aplicada, innovación, dispositivos y avances que están cambiando el mundo.' },
  { slug: 'empresas-que-transforman', name: 'Empresas que transforman', short: 'Empresas que transforman', icon: '🚀', color: '#0F766E', seoTitle: 'Empresas innovadoras: tecnología y futuro', description: 'Reportajes sobre empresas que transforman industrias con inteligencia artificial, baterías, robótica, computación avanzada y tecnología espacial.' },
  { slug: 'moda', name: 'Moda & Tendencias', short: 'Moda', icon: '👗', color: '#DB2777', seoTitle: 'Moda y últimas tendencias: guía de estilo', description: 'Últimas tendencias de moda, colores de temporada, prendas clave, accesorios y consejos prácticos para adaptar las pasarelas al día a día.' },
  { slug: 'toptrends', name: 'TopTrends', short: 'TopTrends', icon: '⭐', color: '#7C3AED', seoTitle: 'TopTrends: comparativas y guías de compra', description: 'Comparativas y guías de compra de productos en tendencia: hogar, cocina, fitness y tecnología, con criterios claros para comparar antes de comprar.' },
  { slug: 'hogar', name: 'Hogar', short: 'Hogar', icon: '🏠', color: '#0F766E', seoTitle: 'Ofertas de hogar, decoración y tecnología', description: 'Ofertas y guías para el hogar: muebles, decoración, iluminación, textiles y tecnología para comparar precios y condiciones antes de comprar.' },
  { slug: 'conciertos', name: 'Conciertos & Festivales', short: 'Conciertos', icon: '🎤', color: '#BE123C', seoTitle: 'Entradas conciertos España: agenda 2026-27', description: 'Entradas para conciertos y festivales en España: lo que queda de 2026 y las citas ya fechadas para 2027, con el enlace oficial de compra y la fuente de cada anuncio.', href: '/conciertos' },
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
  { slug: 'mundial-2026', name: 'Mundial 2026', seoTitle: 'Mundial 2026: fechas, sedes, grupos y noticias', description: 'Guías y noticias sobre el Mundial 2026: calendario, sedes, formato, grupos y claves del torneo.', query: 'Mundial 2026' },
  { slug: 'inteligencia-artificial', name: 'Inteligencia artificial', seoTitle: 'Inteligencia artificial: noticias y usos', description: 'Noticias y análisis sobre inteligencia artificial, nuevas herramientas, modelos y aplicaciones prácticas.', query: 'inteligencia artificial', category: 'tecnologia' },
  { slug: 'iphone', name: 'iPhone', seoTitle: 'iPhone: novedades, modelos, funciones y guías', description: 'Noticias y guías sobre iPhone, modelos, funciones, actualizaciones y novedades de Apple.', query: 'iPhone', category: 'tecnologia' },
  { slug: 'coches-electricos', name: 'Coches eléctricos', seoTitle: 'Coches eléctricos: modelos y autonomía', description: 'Actualidad sobre coches eléctricos, nuevos modelos, autonomía, tecnología y movilidad.', query: 'coches eléctricos', category: 'coches' },
  { slug: 'vivienda', name: 'Vivienda', seoTitle: 'Vivienda: precios, alquiler e hipotecas', description: 'Noticias y guías sobre vivienda, alquiler, hipotecas, precios y cambios normativos que afectan a los hogares.', query: 'vivienda' },
]

export const getCategory = (slug: string) => CATEGORIES.find((c) => c.slug === slug)
export const getTopic = (slug: string) => TOPICS.find((t) => t.slug === slug)
