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
}

export const CATEGORIES: CategoryInfo[] = [
  { slug: 'deportes', name: 'Deportes', short: 'Deportes', icon: '⚽', color: '#F59E0B', seoTitle: 'Deportes: resultados, partidos y actualidad', description: 'Resultados, partidos, horarios, clasificaciones y actualidad de fútbol, ciclismo y otros deportes.' },
  { slug: 'virales', name: 'Virales & Pop Culture', short: 'Virales', icon: '🔥', color: '#EF4444', seoTitle: 'Virales y cultura pop: últimas tendencias', description: 'Noticias virales, tendencias de internet, cultura pop y temas que están dando que hablar en España y el mundo.' },
  { slug: 'gaming', name: 'Gaming & Guías', short: 'Gaming', icon: '🎮', color: '#10B981', seoTitle: 'Gaming y guías: noticias, trucos y códigos', description: 'Noticias de videojuegos, guías, trucos, códigos y novedades de gaming para PC, PlayStation, Xbox, Nintendo y móvil.' },
  { slug: 'herramientas', name: 'Micro-Herramientas', short: 'Herramientas', icon: '🛠️', color: '#3B82F6', seoTitle: 'Herramientas online gratis y útiles', description: 'Herramientas online rápidas y gratuitas para convertir, calcular, generar y resolver tareas cotidianas.' },
  { slug: 'coches', name: 'Coches & Novedades', short: 'Coches', icon: '🚗', color: '#0EA5E9', seoTitle: 'Coches: novedades, lanzamientos y tecnología', description: 'Noticias de coches, nuevos modelos, movilidad, tecnología del automóvil y novedades de la industria.' },
  { slug: 'tecnologia', name: 'Tecnología & Novedades', short: 'Tecnología', icon: '💻', color: '#8B5CF6', seoTitle: 'Tecnología: últimas noticias y tendencias', description: 'Actualidad tecnológica, inteligencia artificial, ciencia aplicada, innovación, dispositivos y avances que están cambiando el mundo.' },
  { slug: 'chollos', name: 'Chollos & Descuentos', short: 'Chollos', icon: '🏷️', color: '#F97316', seoTitle: 'Chollos y ofertas: descuentos y oportunidades', description: 'Ofertas, descuentos y oportunidades de compra seleccionadas, con precios y condiciones para comparar antes de comprar.' },
]

export const getCategory = (slug: string) => CATEGORIES.find((c) => c.slug === slug)
