import type { MetadataRoute } from 'next'
import { CATEGORIES, SITE_URL, TOPICS } from '@/lib/constants'
import { currentWeek, WEEKS } from '@/lib/astrology'
import { ASTROLOGY_GUIDES, astrologyGuidePath } from '@/lib/astrology-guides'
import { concertsFor } from '@/lib/concerts'
import { getAllArticleSlugs, getArticles, getTools } from '@/lib/db'

export const runtime = 'edge'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = SITE_URL.replace(/\/$/, '')
  const [articles, tools, topicArticles] = await Promise.all([
    getAllArticleSlugs(),
    getTools(),
    Promise.all(TOPICS.map(async (topic) => ({
      topic,
      count: (await getArticles({ q: topic.query, category: topic.category, limit: 50 })).length,
    }))),
  ])
  const seen = new Set<string>()
  const articleEntries: MetadataRoute.Sitemap = []

  for (const a of articles) {
    if (!a.slug || seen.has(a.slug)) continue
    seen.add(a.slug)
    const d = new Date(a.published_at)
    articleEntries.push({
      url: base + '/articles/' + encodeURIComponent(a.slug),
      ...(isNaN(+d) ? {} : { lastModified: d }),
      changeFrequency: 'weekly',
      priority: 0.8,
    })
  }

  const topicEntries = topicArticles
    .filter(({ count }) => count >= 3)
    .map(({ topic }) => ({
      url: base + '/articles/topic/' + topic.slug,
      changeFrequency: 'weekly' as const,
      priority: 0.85,
    }))

  return [
    { url: base + '/', changeFrequency: 'daily', priority: 1 },
    { url: base + '/conciertos', changeFrequency: 'weekly', priority: 0.9 },
    ...concertsFor().map((concert) => ({
      url: base + '/conciertos/' + concert.id,
      changeFrequency: 'weekly' as const,
      priority: 0.7,
    })),
    { url: base + '/astrologia', changeFrequency: 'weekly', priority: 0.9 },
    { url: base + '/astrologia/guias', changeFrequency: 'monthly', priority: 0.8 },
    ...ASTROLOGY_GUIDES.map((guide) => ({
      url: base + astrologyGuidePath(guide.slug),
      lastModified: new Date(guide.updated),
      changeFrequency: 'monthly' as const,
      priority: 0.8,
    })),
    ...currentWeek().signs.map((sign) => ({
      url: base + '/astrologia/' + sign.slug,
      changeFrequency: 'weekly' as const,
      priority: 0.85,
    })),
    ...WEEKS.filter((week) => week.id !== currentWeek().id).flatMap((week) => [
      { url: base + '/astrologia/semana/' + week.slug, changeFrequency: 'weekly' as const, priority: 0.7 },
      ...week.signs.map((sign) => ({
        url: base + '/astrologia/' + sign.slug + '/' + week.slug,
        changeFrequency: 'weekly' as const,
        priority: 0.75,
      })),
    ]),
    { url: base + '/articles', changeFrequency: 'daily', priority: 0.95 },
    { url: base + '/autor/equipo-editorial', changeFrequency: 'monthly', priority: 0.6 },
    ...CATEGORIES.map((c) => ({
      url: base + '/articles/category/' + c.slug,
      changeFrequency: 'daily' as const,
      priority: 0.9,
    })),
    ...topicEntries,
    ...articleEntries,
    ...tools.map((t) => ({
      url: base + '/tools/' + encodeURIComponent(t.slug),
      changeFrequency: 'monthly' as const,
      priority: 0.7,
    })),
    { url: base + '/privacidad', changeFrequency: 'yearly' as const, priority: 0.2 },
    { url: base + '/terminos', changeFrequency: 'yearly' as const, priority: 0.2 },
  ]
}
