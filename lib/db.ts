import type { Article, Deal, Tool } from './types'
import { SAMPLE_ARTICLES as BASE_SAMPLE_ARTICLES, SAMPLE_DEALS, SAMPLE_TOOLS } from './sample-data'
import { EXTRA_ARTICLES } from './extra-articles'
import { AUDI_ARTICLES } from './audi-article'
import { IPHONE_ARTICLES } from './iphone-article'
import { BARCELONA_REAL_MADRID_ARTICLES } from './barcelona-real-madrid-article'
import { PORTUGAL_NORUEGA_ARTICLES } from './portugal-noruega-article'
import { GIRONA_MALLORCA_ARTICLES } from './girona-mallorca-article'
import { EVENEPOEL_ARTICLES } from './evenepoel-article'

const SAMPLE_ARTICLES: Article[] = [...EVENEPOEL_ARTICLES, ...GIRONA_MALLORCA_ARTICLES, ...PORTUGAL_NORUEGA_ARTICLES, ...BARCELONA_REAL_MADRID_ARTICLES, ...IPHONE_ARTICLES, ...AUDI_ARTICLES, ...EXTRA_ARTICLES, ...BASE_SAMPLE_ARTICLES]

interface Env {
  DB?: D1Database
  CACHE?: KVNamespace
}

// Returns Cloudflare bindings when running on Pages/Workers, otherwise {}
async function getEnv(): Promise<Env> {
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

export async function getArticles(opts: ArticleQuery = {}): Promise<Article[]> {
  const limit = Math.min(Math.max(opts.limit ?? 12, 1), 50)
  const offset = Math.max(opts.offset ?? 0, 0)
  const { DB } = await getEnv()

  if (!DB) {
    let list = [...SAMPLE_ARTICLES]
    if (opts.category) list = list.filter((x) => x.category === opts.category)
    if (opts.trending) list = list.filter((x) => x.trending)
    if (opts.q) {
      const q = opts.q.toLowerCase()
      list = list.filter((x) => (x.title + ' ' + (x.excerpt ?? '')).toLowerCase().includes(q))
    }
    list.sort((x, y) => +new Date(y.published_at) - +new Date(x.published_at))
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
  const sql = `SELECT * FROM articles ${where.length ? 'WHERE ' + where.join(' AND ') : ''}
    ORDER BY published_at DESC LIMIT ? OFFSET ?`
  params.push(limit, offset)
  const run = async () => (await DB.prepare(sql).bind(...params).all<Article>()).results
  if (opts.q) return run()
  return cached(`articles:${opts.category ?? ''}:${opts.trending ? 1 : 0}:${limit}:${offset}`, 60, run)
}

export async function getTopArticles(limit = 5): Promise<Article[]> {
  const { DB } = await getEnv()
  if (!DB) return [...SAMPLE_ARTICLES].sort((a, b) => b.views - a.views).slice(0, limit)
  return cached(`top:${limit}`, 300, async () =>
    (await DB.prepare('SELECT * FROM articles ORDER BY views DESC LIMIT ?').bind(limit).all<Article>()).results
  )
}

export async function getArticleBySlug(slug: string): Promise<Article | null> {
  const { DB } = await getEnv()
  if (!DB) return SAMPLE_ARTICLES.find((a) => a.slug === slug) ?? null
  return DB.prepare('SELECT * FROM articles WHERE slug = ?').bind(slug).first<Article>()
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
