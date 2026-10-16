import type { Article } from './types'

 type ArticleImageSource = Pick<Article, 'slug' | 'title' | 'category'> & Partial<Pick<Article, 'image_url' | 'thumbnail_url'>>

/**
 * Prefer an article's existing, topic-specific image asset when one is available.
 * Only fall back to TrendiVerse's generated editorial illustration when the article
 * has no usable HTTPS image. Source ownership/licensing must be verified separately;
 * a publicly reachable URL alone does not grant reuse rights.
 */
export function articleImageUrl(article: ArticleImageSource): string {
  for (const candidate of [article.image_url, article.thumbnail_url]) {
    if (!candidate) continue
    try {
      const url = new URL(candidate)
      if (url.protocol === 'https:' && url.hostname && !url.pathname.startsWith('/api/article-image')) {
        return url.toString()
      }
    } catch {
      // Ignore relative, malformed, or unsupported image URLs and use the fallback.
    }
  }

  const params = new URLSearchParams({
    slug: article.slug,
    title: article.title,
    category: article.category,
  })
  return `/api/article-image?${params.toString()}`
}
