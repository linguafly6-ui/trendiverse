import { test } from 'node:test'
import assert from 'node:assert/strict'
import { SEO_BATCH_03_ARTICLES } from '../lib/seo-batch-03'
import { getArticleBySlug } from '../lib/db'

const expectedSlugs = [
  'como-cocer-pasta-al-dente',
  'como-calcular-las-raciones-de-comida-por-persona',
  'como-preparar-un-menu-semanal-economico',
  'como-limpiar-una-sarten-quemada-sin-danarla',
  'freidora-de-aire-o-horno-consumo-y-resultados',
  'que-significa-la-fecha-de-consumo-preferente',
  'fecha-de-caducidad-y-consumo-preferente-diferencias',
  'como-planificar-la-compra-para-desperdiciar-menos-comida',
  'que-recipientes-son-aptos-para-microondas',
  'que-frutas-y-verduras-son-de-temporada-en-otono',
]

test('el segundo bloque editorial contiene diez artículos completos', () => {
  assert.deepEqual(SEO_BATCH_03_ARTICLES.map((article) => article.slug), expectedSlugs)
  for (const article of SEO_BATCH_03_ARTICLES) {
    assert.ok(article.content)
    assert.ok(article.content.trim().split(/\s+/).length >= 2000, `${article.slug} debe superar 2.000 palabras`)
    assert.ok(article.title)
    assert.ok(article.excerpt)
    assert.equal(article.category, 'Alimentación, cocina y conservación')
    assert.equal(article.image_url, '/images/article-placeholder.svg')
    assert.equal(article.thumbnail_url, '/images/article-placeholder.svg')
    assert.ok(article.read_time_minutes && article.read_time_minutes > 0)
  }
})

test('los diez artículos nuevos se resuelven por slug en el catálogo', () => {
  for (const slug of expectedSlugs) {
    assert.equal((await getArticleBySlug(slug))?.slug, slug)
  }
})
