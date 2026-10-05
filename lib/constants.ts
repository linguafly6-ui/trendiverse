export const SITE_NAME = 'TrendiVerse'
export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://trendiverse.org'
export const GA_ID = process.env.NEXT_PUBLIC_GA_ID || 'G-EWER6X3E24'

export interface CategoryInfo {
  slug: string
  name: string
  short: string
  icon: string
  color: string
}

export const CATEGORIES: CategoryInfo[] = [
  { slug: 'virales', name: 'Virales & Pop Culture', short: 'Virales', icon: '🔥', color: '#EF4444' },
  { slug: 'gaming', name: 'Gaming & Guías', short: 'Gaming', icon: '🎮', color: '#10B981' },
  { slug: 'herramientas', name: 'Micro-Herramientas', short: 'Herramientas', icon: '🛠️', color: '#3B82F6' },
  { slug: 'coches', name: 'Coches & Novedades', short: 'Coches', icon: '🚗', color: '#0EA5E9' },
  { slug: 'tecnologia', name: 'Tecnología & Novedades', short: 'Tecnología', icon: '💻', color: '#8B5CF6' },
  { slug: 'chollos', name: 'Chollos & Descuentos', short: 'Chollos', icon: '🏷️', color: '#F97316' },
]

export const getCategory = (slug: string) => CATEGORIES.find((c) => c.slug === slug)
