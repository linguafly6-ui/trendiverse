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
  { slug: 'politica', name: 'Política & Actualidad', short: 'Política', icon: '🏛️', color: '#6366F1', seoTitle: 'Política española: elecciones y vivienda', description: 'Análisis de política española: elecciones, vivienda, decisiones del Gobierno, leyes pendientes y financiación autonómica. Contexto, fechas y fuentes.' },
  { slug: 'economia', name: 'Economía & Mercados', short: 'Economía', icon: '📈', color: '#059669', seoTitle: 'Economía y mercados: noticias y análisis', description: 'Economía, mercados, divisas, empresas, adquisiciones y tendencias que afectan a hogares, inversores y negocios.' },
  { slug: 'deportes', name: 'Deportes', short: 'Deportes', icon: '⚽', color: '#F59E0B', seoTitle: 'Deportes: resultados, partidos y actualidad', description: 'Resultados, partidos, horarios, clasificaciones y actualidad de fútbol, ciclismo y otros deportes.' },
  { slug: 'virales', name: 'Virales & Pop Culture', short: 'Virales', icon: '🔥', color: '#EF4444', seoTitle: 'Virales y cultura pop: últimas tendencias', description: 'Noticias virales, tendencias de internet, cultura pop y temas que están dando que hablar en España y el mundo.' },
  { slug: 'gaming', name: 'Gaming & Guías', short: 'Gaming', icon: '🎮', color: '#10B981', seoTitle: 'Gaming y guías: noticias, trucos y códigos', description: 'Noticias de videojuegos, guías, trucos, códigos y novedades de gaming para PC, PlayStation, Xbox, Nintendo y móvil.' },
  { slug: 'herramientas', name: 'Micro-Herramientas', short: 'Herramientas', icon: '🛠️', color: '#3B82F6', seoTitle: 'Herramientas online gratis y útiles', description: 'Herramientas online rápidas y gratuitas para convertir, calcular, generar y resolver tareas cotidianas.' },
  { slug: 'coches', name: 'Coches & Novedades', short: 'Coches', icon: '🚗', color: '#0EA5E9', seoTitle: 'Coches: novedades, lanzamientos y tecnología', description: 'Noticias de coches, nuevos modelos, movilidad, tecnología del automóvil y novedades de la industria.' },
  { slug: 'tecnologia', name: 'Tecnología & Novedades', short: 'Tecnología', icon: '💻', color: '#8B5CF6', seoTitle: 'Tecnología: últimas noticias y tendencias', description: 'Actualidad tecnológica, inteligencia artificial, ciencia aplicada, innovación, dispositivos y avances que están cambiando el mundo.' },
  { slug: 'empresas-que-transforman', name: 'Empresas que transforman', short: 'Empresas que transforman', icon: '🚀', color: '#0F766E', seoTitle: 'Empresas innovadoras: tecnología y futuro', description: 'Reportajes sobre empresas que transforman industrias con inteligencia artificial, baterías, robótica, computación avanzada y tecnología espacial.' },
  { slug: 'moda', name: 'Moda & Tendencias', short: 'Moda', icon: '👗', color: '#DB2777', seoTitle: 'Moda y últimas tendencias: guía de estilo', description: 'Últimas tendencias de moda, colores de temporada, prendas clave, accesorios y consejos prácticos para adaptar las pasarelas al día a día.' },
  { slug: 'chollos', name: 'Chollos & Descuentos', short: 'Chollos', icon: '🏷️', color: '#F97316', seoTitle: 'Chollos y ofertas: descuentos y oportunidades', description: 'Ofertas, descuentos y oportunidades de compra seleccionadas, con precios y condiciones para comparar antes de comprar.' },
  { slug: 'conciertos', name: 'Conciertos & Festivales', short: 'Conciertos', icon: '🎤', color: '#BE123C', seoTitle: 'Entradas conciertos España: agenda 2026-27', description: 'Entradas para conciertos y festivales en España: lo que queda de 2026 y las citas ya fechadas para 2027, con el enlace oficial de compra y la fuente de cada anuncio.', href: '/conciertos' },
  { slug: 'astrologia', name: 'Astrología & Horóscopo', short: 'Astrología', icon: '✨', color: '#312E81', seoTitle: 'Astrología: horóscopos, ascendente y Luna', description: 'Horóscopos semanales y guías de ascendente, signo lunar, carta natal, eclipses, fases de la Luna y Mercurio retrógrado, con referencias y límites.', href: '/astrologia' },
  { slug: 'segunda-mano', name: 'Segunda mano', short: 'Segunda mano', icon: '♻️', color: '#0D9488', seoTitle: 'Segunda mano: tendencias y oportunidades', description: 'Descubre qué productos de segunda mano están ganando popularidad, qué categorías están en tendencia y qué oportunidades merece la pena vigilar.', href: '/segunda-mano' },
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
  { slug: 'inteligencia-artificial', name: 'Inteligencia artificial', seoTitle: 'Inteligencia artificial: noticias y usos', description: 'Noticias y análisis sobre inteligencia artificial, nuevas herramientas, modelos y aplicaciones prácticas.', query: 'inteligencia artificial', category: 'tecnologia' },
  { slug: 'iphone', name: 'iPhone', seoTitle: 'iPhone: novedades, modelos, funciones y guías', description: 'Noticias y guías sobre iPhone, modelos, funciones, actualizaciones y novedades de Apple.', query: 'iPhone', category: 'tecnologia' },
  { slug: 'coches-electricos', name: 'Coches eléctricos', seoTitle: 'Coches eléctricos: modelos y autonomía', description: 'Actualidad sobre coches eléctricos, nuevos modelos, autonomía, tecnología y movilidad.', query: 'coches eléctricos', category: 'coches' },
  { slug: 'vivienda', name: 'Vivienda', seoTitle: 'Vivienda: precios, alquiler e hipotecas', description: 'Noticias y guías sobre vivienda, alquiler, hipotecas, precios y cambios normativos que afectan a los hogares.', query: 'vivienda', category: 'politica' },
]

export const getCategory = (slug: string) => CATEGORIES.find((c) => c.slug === slug)
export const getTopic = (slug: string) => TOPICS.find((t) => t.slug === slug)
