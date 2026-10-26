import type { Article } from './types'

type ArticleImageSource = Pick<Article, 'slug' | 'title' | 'category'> & Partial<Pick<Article, 'image_url' | 'thumbnail_url'>>

/**
 * Prefer an article's existing, topic-specific image asset when one is available.
 * Local public assets and HTTPS URLs are supported. Source ownership/licensing must
 * be verified separately; a publicly reachable URL alone does not grant reuse rights.
 */
export function articleImageUrl(article: ArticleImageSource): string {
  // Use the high-quality raster hero image for this article.
  if (article.slug === 'como-ahorrar-electricidad-en-casa-sin-obras') {
    return '/images/como-ahorrar-electricidad-en-casa-sin-obras-hq.webp'
  }

  for (const candidate of [article.image_url, article.thumbnail_url]) {
    if (!candidate) continue

    // Root-relative files in public/ are first-party assets and should be served directly.
    // Restrict the accepted path to /images/ to avoid protocol-relative or traversal URLs.
    if (candidate.startsWith('/images/') && !candidate.startsWith('//') && !candidate.split('/').includes('..')) {
      return candidate
    }

    try {
      const url = new URL(candidate)
      if (url.protocol === 'https:' && url.hostname && !url.pathname.startsWith('/api/article-image')) {
        return url.toString()
      }
    } catch {
      // Ignore relative, malformed, or unsupported image URLs and use the fallback.
    }
  }

  // Keep the fallback on a static public asset so it works on Cloudflare Pages
  // static deployments, where request-time API routes may not be available.
  return '/images/article-placeholder.svg'
}
