import { test } from 'node:test'
import assert from 'node:assert/strict'
import { SEO_BATCH_04_ARTICLES } from '../lib/seo-batch-04'
import { getArticleBySlug } from '../lib/db'

const expectedSlug = 'que-frutas-y-verduras-son-de-temporada-en-invierno'

test('el artículo 21 del plan editorial tiene metadatos y contenido completos', () => {
  assert.equal(SEO_BATCH_04_ARTICLES.length, 1)
  const article = SEO_BATCH_04_ARTICLES[0]
  assert.equal(article.id, 299)
  assert.equal(article.slug, expectedSlug)
  assert.equal(article.category, 'Alimentación, cocina y conservación')
  assert.ok(article.title)
  assert.ok(article.excerpt)
  assert.ok(article.content)
  assert.ok(article.content.trim().split(/\\s+/).length >= 2000, 'el artículo debe superar 2.000 palabras')
  assert.equal(article.image_url, '/images/article-placeholder.svg')
  assert.equal(article.thumbnail_url, '/images/article-placeholder.svg')
  assert.ok(article.read_time_minutes && article.read_time_minutes > 0)
})

test('el artículo 21 se resuelve por slug en el catálogo', async () => {
  assert.equal((await getArticleBySlug(expectedSlug))?.slug, expectedSlug)
})
