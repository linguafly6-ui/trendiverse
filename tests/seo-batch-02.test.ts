import test from 'node:test'
import assert from 'node:assert/strict'
import { SEO_BATCH_02_ARTICLES } from '../lib/seo-batch-02'
import { getArticleBySlug } from '../lib/db'

const expected = [
  'como-conservar-las-verduras-para-que-duren-mas',
  'como-guardar-las-fresas-para-que-no-se-estropeen',
  'como-conservar-el-pan-fresco-mas-tiempo',
  'que-alimentos-no-conviene-guardar-en-la-nevera',
  'como-organizar-la-nevera-para-conservar-alimentos',
  'cuanto-duran-las-sobras-en-el-frigorifico',
  'como-descongelar-alimentos-correctamente',
  'como-saber-si-un-huevo-esta-fresco',
  'como-cocer-huevos-y-controlar-el-punto',
  'como-hacer-arroz-blanco-suelto',
]

test('SEO batch 02 contains the ten first editorial topics', () => {
  assert.deepEqual(SEO_BATCH_02_ARTICLES.map((article) => article.slug), expected)
})

test('SEO batch 02 articles exceed 2,000 words and have complete metadata', () => {
  for (const article of SEO_BATCH_02_ARTICLES) {
    assert.ok(article.content, `${article.slug} should have content`)
    assert.ok(article.content.trim().split(/\\s+/).length >= 2000, `${article.slug} should contain at least 2,000 words`)
    assert.ok(article.title && article.excerpt && article.published_at, `${article.slug} should have metadata`)
  }
})

test('SEO batch 02 articles are available through the article catalogue', async () => {
  for (const slug of expected) {
    const article = await getArticleBySlug(slug)
    assert.ok(article, `${slug} should be available through getArticleBySlug`)
  }
})
