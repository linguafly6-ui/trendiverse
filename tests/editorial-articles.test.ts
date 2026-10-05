import test from 'node:test'
import assert from 'node:assert/strict'
import { existsSync } from 'node:fs'
import { join } from 'node:path'
import type { Article } from '../lib/types'
import { CATEGORIES } from '../lib/constants'
import { EDITORIAL_ARTICLES } from '../lib/editorial-articles'
import { getArticles, getArticleBySlug, getAllArticleSlugs, setEnvResolverForTests } from '../lib/db'

const EXPECTED_SLUGS = [
  'bateria-externa-philips-action',
  'zelestra-edp-baterias-almacenamiento-espana',
  'cic-energigune-bateria-flujo-hierro-plomo-10000-ciclos',
  'cnio-osteopontina-cancer-de-mama-resistencia-antiangiogenicos',
  'doordash-nueva-york-acuerdo-repartidores-131-millones',
  'madrid-inteligencia-artificial-sanidad-publica-50-millones',
  'csic-barcelona-area-nanofabricacion-cuantica-imb-cnm',
  'desperdicio-alimentario-espana-2025-plan-red-electrica-2030',
  'premios-nacionales-musica-2026-laura-vega-cecilia-bercovich',
]

const mk = (id: number, slug: string, published_at: string, category = 'virales', trending = 0): Article => ({
  id, slug, title: `D1 ${slug}`, category, content: 'x', excerpt: 'd1 row', image_url: null, thumbnail_url: null,
  read_time_minutes: 1, views: 0, trending, published_at,
})

// Minimal in-memory D1 supporting the queries issued by lib/db.ts.
function fakeD1(rows: Article[]) {
  const calls: string[] = []
  const db = {
    prepare(sql: string) {
      calls.push(sql)
      let params: unknown[] = []
      const stmt = {
        bind(...p: unknown[]) { params = p; return stmt },
        async first() { return rows.find((r) => r.slug === params[0]) ?? null },
        async all() {
          let list = [...rows]
          let i = 0
          if (sql.includes('category = ?')) { const c = params[i++]; list = list.filter((r) => r.category === c) }
          if (sql.includes('trending = 1')) list = list.filter((r) => r.trending)
          if (sql.includes('LIKE')) {
            const like = String(params[i]).replace(/^%|%$/g, '').toLowerCase(); i += 2
            list = list.filter((r) => (r.title + ' ' + (r.excerpt ?? '')).toLowerCase().includes(like))
          }
          list.sort((a, b) => +new Date(b.published_at) - +new Date(a.published_at))
          if (sql.includes('LIMIT ?')) list = list.slice(0, Number(params[params.length - 1]))
          return { results: list }
        },
      }
      return stmt
    },
  }
  return { db, calls }
}

const d1Rows = [
  mk(1, 'old-d1-article', '2026-01-01T00:00:00.000Z'),
  mk(2, 'newer-d1-article', '2026-10-06T00:00:00.000Z', 'tecnologia', 1),
  // stale duplicate of an editorial slug: must not appear twice
  mk(3, EXPECTED_SLUGS[0], '2026-01-02T00:00:00.000Z', 'chollos'),
]

function bind() {
  const { db, calls } = fakeD1(d1Rows)
  setEnvResolverForTests(() => ({ DB: db as never }))
  return calls
}

test.afterEach(() => setEnvResolverForTests(null))

test('editorial records are valid and unique', () => {
  assert.deepEqual(EDITORIAL_ARTICLES.map((a) => a.slug).sort(), [...EXPECTED_SLUGS].sort())
  assert.equal(new Set(EDITORIAL_ARTICLES.map((a) => a.id)).size, EDITORIAL_ARTICLES.length)
  const cats = new Set(CATEGORIES.map((c) => c.slug))
  for (const a of EDITORIAL_ARTICLES) {
    assert.ok(cats.has(a.category), `${a.slug} category`)
    assert.ok(a.excerpt && a.excerpt.length <= 200, `${a.slug} excerpt`)
    assert.match(a.content ?? '', /## Preguntas frecuentes/, `${a.slug} FAQ`)
    assert.ok(!/^\|/m.test(a.content ?? ''), `${a.slug} no tables`)
    for (const img of [a.image_url, a.thumbnail_url]) {
      assert.ok(img && existsSync(join(process.cwd(), 'public', img)), `${a.slug} image ${img}`)
    }
  }
})

test('D1-bound: all nine slugs resolve by direct lookup', async () => {
  const calls = bind()
  for (const slug of EXPECTED_SLUGS) {
    const a = await getArticleBySlug(slug)
    assert.equal(a?.slug, slug)
    assert.notEqual(a?.title.startsWith('D1 '), true)
  }
  assert.equal((await getArticleBySlug('old-d1-article'))?.id, 1) // falls through to D1
  assert.equal(await getArticleBySlug('missing'), null)
  assert.ok(calls.length > 0, 'D1 was exercised')
})

test('D1-bound: feed includes all nine, deduped, newest first', async () => {
  const calls = bind()
  const all = await getArticles({ limit: 50 })
  assert.ok(calls.some((s) => s.includes('FROM articles')), 'D1 was queried')
  const slugs = all.map((a) => a.slug)
  for (const s of EXPECTED_SLUGS) assert.ok(slugs.includes(s), s)
  assert.equal(new Set(slugs).size, slugs.length, 'no duplicates')
  assert.equal(slugs[0], 'newer-d1-article')
  assert.equal(all.find((a) => a.slug === EXPECTED_SLUGS[0])?.category, 'chollos')
  for (let i = 1; i < all.length; i++) {
    assert.ok(+new Date(all[i - 1].published_at) >= +new Date(all[i].published_at))
  }
  assert.ok(all.some((a) => a.slug === 'old-d1-article'))
})

test('D1-bound: pagination is exact and gap-free', async () => {
  bind()
  const full = (await getArticles({ limit: 50 })).map((a) => a.slug)
  const paged: string[] = []
  for (let offset = 0; offset < full.length; offset += 4) {
    paged.push(...(await getArticles({ limit: 4, offset })).map((a) => a.slug))
  }
  assert.deepEqual(paged, full)
  assert.deepEqual((await getArticles({ limit: 3, offset: 2 })).map((a) => a.slug), full.slice(2, 5))
})

test('D1-bound: category, search and trending semantics', async () => {
  bind()
  const chollos = await getArticles({ category: 'chollos', limit: 50 })
  assert.ok(chollos.every((a) => a.category === 'chollos'))
  assert.equal(chollos.filter((a) => a.slug === EXPECTED_SLUGS[0]).length, 1)
  const tecnologia = (await getArticles({ category: 'tecnologia', limit: 50 })).map((a) => a.slug)
  for (const s of [EXPECTED_SLUGS[1], EXPECTED_SLUGS[2], EXPECTED_SLUGS[3]]) assert.ok(tecnologia.includes(s), s)
  const search = async (q: string) => (await getArticles({ q, limit: 50 })).map((a) => a.slug)
  assert.ok((await search('osteopontina')).includes(EXPECTED_SLUGS[3]))
  assert.ok((await search('DoorDash')).includes(EXPECTED_SLUGS[4]))
  assert.ok((await search('Bercovich')).includes(EXPECTED_SLUGS[8]))
  assert.ok((await search('nanofabricación')).includes(EXPECTED_SLUGS[6]))
  const trending = await getArticles({ trending: true, limit: 50 })
  assert.ok(trending.every((a) => a.trending))
  assert.ok(trending.some((a) => a.slug === 'newer-d1-article'))
  assert.ok(trending.some((a) => a.slug === EXPECTED_SLUGS[3]))
})

test('D1-bound: sitemap data has all nine plus D1 rows, deduped', async () => {
  bind()
  const slugs = (await getAllArticleSlugs()).map((a) => a.slug)
  for (const s of EXPECTED_SLUGS) assert.ok(slugs.includes(s), s)
  assert.ok(slugs.includes('old-d1-article') && slugs.includes('newer-d1-article'))
  assert.equal(new Set(slugs).size, slugs.length)
})

test('empty D1 still serves editorial content', async () => {
  const { db } = fakeD1([])
  setEnvResolverForTests(() => ({ DB: db as never }))
  const slugs = (await getArticles({ limit: 50 })).map((a) => a.slug)
  for (const s of EXPECTED_SLUGS) assert.ok(slugs.includes(s), s)
  assert.equal(slugs.length, EXPECTED_SLUGS.length)
})
