import type { MetadataRoute } from 'next'
import { CATEGORIES, SITE_URL } from '@/lib/constants'
import { getAllArticleSlugs, getTools } from '@/lib/db'

export const runtime = 'edge'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = SITE_URL.replace(/\/$/, '')
  const [articles, tools] = await Promise.all([getAllArticleSlugs(), getTools()])
  const seen = new Set<string>()
  const articleEntries: MetadataRoute.Sitemap = []
  for (const a of articles) {
    if (!a.slug || seen.has(a.slug)) continue
    seen.add(a.slug)
    const d = new Date(a.published_at)
    articleEntries.push({
      url: `${base}/articles/${encodeURIComponent(a.slug)}`,
      ...(isNaN(+d) ? {} : { lastModified: d }),
    })
  }
  return [
    { url: `${base}/` },
    ...CATEGORIES.map((c) => ({ url: `${base}/articles/category/${c.slug}` })),
    ...articleEntries,
    ...tools.map((t) => ({ url: `${base}/tools/${encodeURIComponent(t.slug)}` })),
    { url: `${base}/privacidad` },
    { url: `${base}/terminos` },
  ]
}
