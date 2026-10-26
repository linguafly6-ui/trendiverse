import type { Article, Deal, Tool } from './types'
import { TOPTRENDS_ARTICLES } from './toptrends-articles'
import { SAMPLE_ARTICLES as BASE_SAMPLE_ARTICLES, SAMPLE_DEALS, SAMPLE_TOOLS } from './chollos-otono'
import { EXTRA_ARTICLES } from './extra-articles'
import { MASCARILLAS_PELO_AMAZON_ARTICLE } from './mascarillas-pelo-amazon-article'
import { AUDI_ARTICLES } from './audi-article'
import { IPHONE_ARTICLES } from './iphone-article'
import { BARCELONA_REAL_MADRID_ARTICLES } from './barcelona-real-madrid-article'
import { PORTUGAL_NORUEGA_ARTICLES } from './portugal-noruega-article'
import { GIRONA_MALLORCA_ARTICLES } from './girona-mallorca-article'
import { EVENEPOEL_ARTICLES } from './evenepoel-article'
import { EDITORIAL_ARTICLES } from './editorial-articles'
import { OCTOBER_2026_ARTICLES } from './october-2026-articles'
import { SEO_BATCH_01_ARTICLES } from './seo-batch-01'
import { SEO_BATCH_02_ARTICLES } from './seo-batch-02'
import { SEO_BATCH_03_ARTICLES } from './seo-batch-03'
import { TECNOLOGIA_2026_ARTICLES } from './tecnologia-2026'
import { PREDICCION_TECNOLOGICA_2031_ARTICLES } from './prediccion-tecnologica-2031'
import { INUNDACIONES_CATALUNA_2026_ARTICLES } from './inundaciones-cataluna-2026'
import { SEMANA_MUNDIAL_ESPACIO_2026_ARTICLES } from './semana-mundial-espacio-2026'
import { NOMINA_2027_MEI_ARTICLES } from './nomina-2027-mei'
import { FONDOS_BUITRE_2026_ARTICLES } from './fondos-buitre-2026'
import { ALQUILER_DECRETO_2026_ARTICLES } from './decreto-alquiler-2026'
import { SEGURIDAD_ELECTRICA_BANO_ARTICLES } from './seguridad-electrica-bano'
import { EMPRESAS_QUE_TRANSFORMAN_ARTICLES } from './empresas-que-transforman-2026'
import { MODA_TENDENCIAS_ARTICLES } from './moda-tendencias-2026'
import { GAMING_TENDENCIAS_ARTICLES } from './gaming-tendencias-2026'
import { ACTUALIDAD_TRENDING_ARTICLES_2026 } from './actualidad-trending-2026'
import { ACTUALIDAD_TRENDING_ARTICLES_BATCH_12 } from './actualidad-trending-2026-batch-12'
import { ACTUALIDAD_TRENDING_ARTICLES_BATCH_11 } from './actualidad-trending-2026-batch-11'
import { ACTUALIDAD_TRENDING_ARTICLES_BATCH_10 } from './actualidad-trending-2026-batch-10'
import { ACTUALIDAD_TRENDING_ARTICLES_BATCH_9 } from './actualidad-trending-2026-batch-9'
import { ACTUALIDAD_TRENDING_ARTICLES_BATCH_8 } from './actualidad-trending-2026-batch-8'
import { ACTUALIDAD_TRENDING_ARTICLES_BATCH_7 } from './actualidad-trending-2026-batch-7'
import { ACTUALIDAD_TRENDING_ARTICLES_BATCH_6 } from './actualidad-trending-2026-batch-6'
import { ACTUALIDAD_TRENDING_ARTICLES_BATCH_5 } from './actualidad-trending-2026-batch-5'
import { ACTUALIDAD_TRENDING_ARTICLES_BATCH_4 } from './actualidad-trending-2026-batch-4'
import { ACTUALIDAD_TRENDING_ARTICLES_BATCH_3 } from './actualidad-trending-2026-batch-3'
import { ACTUALIDAD_TRENDING_ARTICLES_BATCH_2 } from './actualidad-trending-2026-batch-2'

// Keeps the first record per slug (earlier entries take precedence).
function dedupeBySlug<T extends { slug: string }>(list: T[]): T[] {
  const seen = new Set<string>()
  return list.filter((x) => (seen.has(x.slug) ? false : (seen.add(x.slug), true)))
}

const BUNDLED_EDITORIAL_ARTICLES = [...ACTUALIDAD_TRENDING_ARTICLES_BATCH_12, ...ACTUALIDAD_TRENDING_ARTICLES_BATCH_11, ...ACTUALIDAD_TRENDING_ARTICLES_BATCH_10, ...ACTUALIDAD_TRENDING_ARTICLES_BATCH_9, ...ACTUALIDAD_TRENDING_ARTICLES_BATCH_8, ...ACTUALIDAD_TRENDING_ARTICLES_BATCH_7, ...ACTUALIDAD_TRENDING_ARTICLES_BATCH_6, ...ACTUALIDAD_TRENDING_ARTICLES_BATCH_5, ...ACTUALIDAD_TRENDING_ARTICLES_BATCH_4, ...ACTUALIDAD_TRENDING_ARTICLES_BATCH_3, ...ACTUALIDAD_TRENDING_ARTICLES_BATCH_2, ...ACTUALIDAD_TRENDING_ARTICLES_2026, ...TOPTRENDS_ARTICLES, MASCARILLAS_PELO_AMAZON_ARTICLE, ...EDITORIAL_ARTICLES, ...SEO_BATCH_03_ARTICLES, ...SEO_BATCH_02_ARTICLES, ...SEO_BATCH_01_ARTICLES, ...OCTOBER_2026_ARTICLES, ...EMPRESAS_QUE_TRANSFORMAN_ARTICLES, ...MODA_TENDENCIAS_ARTICLES, ...GAMING_TENDENCIAS_ARTICLES]

export const SAMPLE_ARTICLES: Article[] = dedupeBySlug([...BUNDLED_EDITORIAL_ARTICLES, ...PREDICCION_TECNOLOGICA_2031_ARTICLES, ...TECNOLOGIA_2026_ARTICLES, ...SEGURIDAD_ELECTRICA_BANO_ARTICLES, ...SEMANA_MUNDIAL_ESPACIO_2026_ARTICLES, ...NOMINA_2027_MEI_ARTICLES, ...FONDOS_BUITRE_2026_ARTICLES, ...ALQUILER_DECRETO_2026_ARTICLES, ...INUNDACIONES_CATALUNA_2026_ARTICLES, ...EVENEPOEL_ARTICLES, ...GIRONA_MALLORCA_ARTICLES, ...PORTUGAL_NORUEGA_ARTICLES, ...BARCELONA_REAL_MADRID_ARTICLES, ...IPHONE_ARTICLES, ...AUDI_ARTICLES, ...EXTRA_ARTICLES, ...BASE_SAMPLE_ARTICLES])

interface Env {
  DB?: D1Database
  CACHE?: KVNamespace
}

// Returns Cloudflare bindings when running on Pages/Workers, otherwise {}
let envOverride: (() => Env) | null = null
export function setEnvResolverForTests(fn: (() => Env) | null) { envOverride = fn }

async function getEnv(): Promise<Env> {
  if (envOverride) return envOverride()
  try {
    const { getRequestContext } = await import('@cloudflare/next-on-pages')
    return getRequestContext().env as unknown as Env
  } catch {
    return {}
  }
}

async function cached<T>(key: string, ttl: number, load: () => Promise<T>): Promise<T> {
  const { CACHE } = await getEnv()
  if (!CACHE) return load()
  try {
    const hit = await CACHE.get(key, 'json')
    if (hit) return hit as T
  } catch {}
  const value = await load()
  try {
    await CACHE.put(key, JSON.stringify(value), { expirationTtl: ttl })
  } catch {}
  return value
}

export interface ArticleQuery {
  category?: string
  q?: string
  trending?: boolean
  limit?: number
  offset?: number
}

function matchesQuery(x: Article, opts: ArticleQuery): boolean {
  if (opts.category && x.category !== opts.category) return false
  if (opts.trending && !x.trending) return false
  if (opts.q) {
    const q = opts.q.toLowerCase()
    if (!(x.title + ' ' + (x.excerpt ?? '')).toLowerCase().includes(q)) return false
  }
  return true
}

// Newest first; ties broken by slug so ordering is stable across sources.
function byRecency(x: Article, y: Article): number {
  const d = (+new Date(y.published_at) || 0) - (+new Date(x.published_at) || 0)
  return d || x.slug.localeCompare(y.slug)
}

// Bundled editorial records take precedence over D1 rows with the same slug.
function mergeWithEditorial(rows: Article[]): Article[] {
  return dedupeBySlug([...BUNDLED_EDITORIAL_ARTICLES, ...rows])
}

export async function getArticles(opts: ArticleQuery = {}): Promise<Article[]> {
  const limit = Math.min(Math.max(opts.limit ?? 12, 1), 50)
  const offset = Math.max(opts.offset ?? 0, 0)
  const { DB } = await getEnv()

  if (!DB) {
    const list = SAMPLE_ARTICLES.filter((x) => matchesQuery(x, opts))
    list.sort(byRecency)
    return list.slice(offset, offset + limit)
  }

  const where: string[] = []
  const params: unknown[] = []
  if (opts.category) { where.push('category = ?'); params.push(opts.category) }
  if (opts.trending) where.push('trending = 1')
  if (opts.q) {
    where.push("(title LIKE ? ESCAPE '\\' OR excerpt LIKE ? ESCAPE '\\')")
    const like = `%${opts.q.replace(/[\\%_]/g, '\\$&')}%`
    params.push(like, like)
  }
  // Fetch enough D1 rows from the top so that, after bundled records are merged in and
  // duplicates removed, the requested page is still exact.
  const fetchLimit = offset + limit + BUNDLED_EDITORIAL_ARTICLES.length
  const sql = `SELECT * FROM articles ${where.length ? 'WHERE ' + where.join(' AND ') : ''}
    ORDER BY published_at DESC LIMIT ?`
  params.push(fetchLimit)
  const run = async () => (await DB.prepare(sql).bind(...params).all<Article>()).results
  const rows = opts.q
    ? await run()
    : await cached(`articles:${opts.category ?? ''}:${opts.trending ? 1 : 0}:${fetchLimit}`, 60, run)
  const merged = mergeWithEditorial(rows).filter((x) => matchesQuery(x, opts))
  merged.sort(byRecency)
  return merged.slice(offset, offset + limit)
}

export async function getTopArticles(limit = 5): Promise<Article[]> {
  const { DB } = await getEnv()
  if (!DB) return [...SAMPLE_ARTICLES].sort((a, b) => b.views - a.views).slice(0, limit)
  const rows = await cached(`top:${limit + BUNDLED_EDITORIAL_ARTICLES.length}`, 300, async () =>
    (await DB.prepare('SELECT * FROM articles ORDER BY views DESC LIMIT ?').bind(limit + BUNDLED_EDITORIAL_ARTICLES.length).all<Article>()).results
  )
  return mergeWithEditorial(rows).sort((a, b) => b.views - a.views || byRecency(a, b)).slice(0, limit)
}

export async function getArticleBySlug(slug: string): Promise<Article | null> {
  const bundled = BUNDLED_EDITORIAL_ARTICLES.find((a) => a.slug === slug)
  if (bundled) return bundled
  const { DB } = await getEnv()
  if (!DB) return SAMPLE_ARTICLES.find((a) => a.slug === slug) ?? null
  return (await DB.prepare('SELECT * FROM articles WHERE slug = ?').bind(slug).first<Article>()) ?? null
}

export async function getDeals(limit = 10): Promise<Deal[]> {
  const { DB } = await getEnv()
  if (!DB) return SAMPLE_DEALS.slice(0, limit)
  return cached(`deals:${limit}`, 60, async () =>
    (await DB.prepare(
      "SELECT * FROM deals WHERE expires_at IS NULL OR expires_at > datetime('now') ORDER BY discount_percent DESC LIMIT ?"
    ).bind(limit).all<Deal>()).results
  )
}

export async function getTools(): Promise<Tool[]> {
  const { DB } = await getEnv()
  if (!DB) return SAMPLE_TOOLS
  return (await DB.prepare('SELECT * FROM tools ORDER BY id').all<Tool>()).results
}

export async function getToolBySlug(slug: string): Promise<Tool | null> {
  const tools = await getTools()
  return tools.find((t) => t.slug === slug) ?? null
}

// Same-category articles first, then trending, then most recent.
export async function getRelatedArticles(article: Article, limit = 4): Promise<Article[]> {
  const pool = (await getArticles({ limit: 50 })).filter((x) => x.id !== article.id)
  const score = (x: Article) => (x.category === article.category ? 2 : 0) + (x.trending ? 1 : 0)
  return pool.sort((x, y) => score(y) - score(x)).slice(0, limit)
}

// All article slugs (no pagination limit) for the sitemap.
export async function getAllArticleSlugs(): Promise<{ slug: string; published_at: string }[]> {
  const { DB } = await getEnv()
  if (!DB) return SAMPLE_ARTICLES.map((a) => ({ slug: a.slug, published_at: a.published_at }))
  const rows = (await DB.prepare('SELECT slug, published_at FROM articles ORDER BY published_at DESC').all<{ slug: string; published_at: string }>()).results
  return dedupeBySlug([
    ...BUNDLED_EDITORIAL_ARTICLES.map((a) => ({ slug: a.slug, published_at: a.published_at })),
    ...rows,
  ])
}
