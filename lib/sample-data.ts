import type { Article, Deal, Tool } from './types'

const day = 86400000
const iso = (ago: number) => new Date(Date.now() - ago * day).toISOString()
const img = (s: string, w: number, h: number) => `https://picsum.photos/seed/${s}/${w}/${h}`

const a = (
  id: number, title: string, slug: string, category: string, excerpt: string,
  seed: string, read: number, views: number, trending: number
): Article => ({
  id, title, slug, category, excerpt, content: excerpt + ' ' + excerpt,
  image_url: img(seed, 1200, 630), thumbnail_url: img(seed, 400, 225),
  read_time_minutes: read, views, trending, published_at: iso(id / 4),
})

export const SAMPLE_ARTICLES: Article[] = [
  a(1, 'Los memes que dominaron internet esta semana', 'memes-de-la-semana', 'virales', 'Repasamos los memes más compartidos y su origen.', 'memes', 4, 9800, 1),
  a(2, 'La celebridad que rompió TikTok con un baile viral', 'baile-viral-tiktok', 'virales', 'Un baile de 15 segundos llegó a millones de vistas.', 'tiktok', 3, 8700, 1),
  a(3, 'Códigos activos de Genshin Impact hoy', 'codigos-genshin-impact', 'gaming', 'Lista actualizada de códigos canjeables.', 'genshin', 2, 12000, 1),
  a(4, 'Guía completa para empezar en Elden Ring', 'guia-elden-ring', 'gaming', 'Clases, armas y primeros jefes explicados.', 'elden', 8, 6400, 0),
  a(5, 'Conversor de divisas en tiempo real', 'conversor-divisas', 'herramientas', 'Convierte entre monedas al instante.', 'divisas', 1, 3100, 0),
  a(6, 'Las mejores ofertas tecnológicas del día', 'ofertas-tecnologicas-del-dia', 'chollos', 'Selección de chollos con mayor descuento.', 'ofertas', 3, 7200, 0),
]

export const SAMPLE_DEALS: Deal[] = [
  { id: 1, product_name: 'Auriculares inalámbricos ANC', original_price: 129.99, discount_price: 79.99, discount_percent: 38, image_url: img('aud', 400, 300), affiliate_url: 'https://example.com/aff/auriculares', expires_at: new Date(Date.now() + 7 * day).toISOString(), category_id: 4 },
  { id: 2, product_name: 'Teclado mecánico RGB', original_price: 89.9, discount_price: 49.9, discount_percent: 44, image_url: img('tec', 400, 300), affiliate_url: 'https://example.com/aff/teclado', expires_at: new Date(Date.now() + 3 * day).toISOString(), category_id: 4 },
]

export const SAMPLE_TOOLS: Tool[] = [
  { id: 1, title: 'Calculadora de porcentajes', slug: 'porcentajes', description: 'Calcula porcentajes rápidamente', type: 'percentage', config: '{}' },
  { id: 2, title: 'Conversor de divisas', slug: 'divisas', description: 'Convierte entre EUR, USD, GBP y MXN', type: 'currency', config: '{"rates":{"EUR":1,"USD":1.08,"GBP":0.85,"MXN":18.5}}' },
  { id: 3, title: 'Generador de contraseñas', slug: 'password', description: 'Crea contraseñas seguras', type: 'password', config: '{}' },
]

export const SAMPLE_CODES = [
  { game: 'Genshin Impact', code: 'GENSHINGIFT', reward: '60 Protogemas', note: 'Canjea en la web oficial o en el juego.' },
  { game: 'Fortnite', code: 'FNCREATIVE', reward: 'Cosmético gratuito', note: 'Solo una vez por cuenta.' },
  { game: 'Honkai Star Rail', code: 'STARRAILGIFT', reward: '50 Jades estelares', note: 'Válido hasta fin de mes.' },
]
