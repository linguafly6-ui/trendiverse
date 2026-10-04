import type { Article, Deal, Tool } from './types'
import { SAMPLE_ARTICLES, SAMPLE_DEALS, SAMPLE_TOOLS } from './sample-data'

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

export async function getTopArticles(limit = 5): Promise<Article[]> {
  return [...SAMPLE_ARTICLES].sort((a, b) => b.views - a.views).slice(0, limit)
}

export async function getArticleBySlug(slug: string): Promise<Article | null> {
  return SAMPLE_ARTICLES.find((a) => a.slug === slug) ?? null
}

export async function getDeals(limit = 10): Promise<Deal[]> {
  return SAMPLE_DEALS.slice(0, limit)
}

export async function getTools(): Promise<Tool[]> {
  return SAMPLE_TOOLS
}

export async function getToolBySlug(slug: string): Promise<Tool | null> {
  const tools = await getTools()
  return tools.find((t) => t.slug === slug) ?? null
}
