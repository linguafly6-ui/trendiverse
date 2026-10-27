import type { Article, Deal, Tool } from './types'
import { withArticleExcerpt } from './article-excerpt'

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

// D1 is the sole runtime source of article content. The bundled records are retained
// only as a one-time migration source in scripts/sync-embedded-articles-to-d1.ts.

export async function getArticles(opts: ArticleQuery = {}): Promise<Article[]> {
  const limit = Math.min(Math.max(opts.limit ?? 12, 1), 50)
  const offset = Math.max(opts.offset ?? 0, 0)
  const { DB } = await getEnv()

  if (!DB) return []

  const where: string[] = []
  const params: unknown[] = []
  if (opts.category) { where.push('category = ?'); params.push(opts.category) }
  if (opts.trending) where.push('trending = 1')
  if (opts.q) {
    where.push("(title LIKE ? ESCAPE '\\' OR excerpt LIKE ? ESCAPE '\\')")
    const like = `%${opts.q.replace(/[\\%_]/g, '\\$&')}%`
    params.push(like, like)
  }
  const fetchLimit = offset + limit
  const sql = `SELECT * FROM articles ${where.length ? 'WHERE ' + where.join(' AND ') : ''}
    ORDER BY published_at DESC LIMIT ?`
  params.push(fetchLimit)
  const run = async () => (await DB.prepare(sql).bind(...params).all<Article>()).results
  const rows = opts.q
    ? await run()
    : await cached(`d1-articles:v2:${opts.category ?? ''}:${opts.trending ? 1 : 0}:${fetchLimit}`, 30, run)
  return rows.filter((x) => matchesQuery(x, opts)).slice(offset, offset + limit).map(withArticleExcerpt)
}

export async function getTopArticles(limit = 5): Promise<Article[]> {
  const { DB } = await getEnv()
  if (!DB) return []
  return cached(`d1-top:v2:${limit}`, 30, async () =>
    (await DB.prepare('SELECT * FROM articles ORDER BY views DESC LIMIT ?').bind(limit).all<Article>()).results.map(withArticleExcerpt)
  )
}

export async function getArticleBySlug(slug: string): Promise<Article | null> {
  const { DB } = await getEnv()
  if (!DB) return null
  const article = (await DB.prepare('SELECT * FROM articles WHERE slug = ?').bind(slug).first<Article>()) ?? null
  return article ? withArticleExcerpt(article) : null
}

export async function getDeals(limit = 10): Promise<Deal[]> {
  const { DB } = await getEnv()
  if (!DB) return []
  return cached(`deals:${limit}`, 60, async () =>
    (await DB.prepare(
      "SELECT * FROM deals WHERE expires_at IS NULL OR expires_at > datetime('now') ORDER BY discount_percent DESC LIMIT ?"
    ).bind(limit).all<Deal>()).results
  )
}

export async function getTools(): Promise<Tool[]> {
  const { DB } = await getEnv()
  if (!DB) return []
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
  if (!DB) return []
  return (await DB.prepare('SELECT slug, published_at FROM articles ORDER BY published_at DESC').all<{ slug: string; published_at: string }>()).results
}
