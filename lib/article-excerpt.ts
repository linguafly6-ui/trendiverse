import type { Article } from './types'
import { truncateWords } from './seo-overrides'

function plainText(value: string): string {
  return value
    .replace(/^#{1,6}\s+/gm, '')
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
    .replace(/[*_`>]/g, '')
    .replace(/\s+/g, ' ')
    .trim()
}

/**
 * Los artículos de suplementos antiguos comparten extractos editoriales genéricos.
 * Para la ficha, las tarjetas y los metadatos SEO, deriva una descripción breve del
 * enfoque concreto del contenido en vez de repetir ese texto de plantilla.
 */
export function articleExcerpt(article: Pick<Article, 'category' | 'title' | 'content' | 'excerpt'>): string | null {
  if (article.category !== 'suplementos' || !article.content) return article.excerpt

  const blocks = article.content.split(/\n\s*\n/).map((block) => block.trim()).filter(Boolean)
  const focusBlock = blocks.find((block) => /la pregunta práctica es/i.test(block))
  if (focusBlock) {
    const text = plainText(focusBlock)
    const match = /la pregunta práctica es\s+(.+)$/i.exec(text)
    if (match?.[1]) {
      const candidate = match[1].replace(/[«»]/g, '').trim()
      if (candidate.length > 35) return truncateWords(candidate, 155)
    }
  }

  // Fallback for older articles that do not use the editorial focus marker.
  const candidates = blocks
    .filter((block) => !/^#{1,6}\s/.test(block))
    .map(plainText)
    .filter((text) => text.length >= 75 && !/^(esta guía|este artículo|el objetivo de esta guía|no sustituye|en esta guía)/i.test(text))
  const titleNormalized = article.title.toLocaleLowerCase('es')
  const distinct = candidates.find((text) => text.toLocaleLowerCase('es') !== titleNormalized)
  return distinct ? truncateWords(distinct, 155) : article.excerpt
}

export function withArticleExcerpt<T extends Article>(article: T): T {
  const excerpt = articleExcerpt(article)
  return excerpt === article.excerpt ? article : { ...article, excerpt } as T
}
