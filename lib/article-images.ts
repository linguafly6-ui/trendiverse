import type { Article } from './types'

/** Deterministic, topic-specific local illustration used for article cards and social previews. */
export function articleImageUrl(article: Pick<Article, 'slug' | 'title' | 'category'>): string {
  const params = new URLSearchParams({
    slug: article.slug,
    title: article.title,
    category: article.category,
  })
  return `/api/article-image?${params.toString()}`
}
