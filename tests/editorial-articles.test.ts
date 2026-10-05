import test from 'node:test'
import assert from 'node:assert/strict'
import { existsSync } from 'node:fs'
import { join } from 'node:path'
import type { Article } from '../lib/types'
import { CATEGORIES } from '../lib/constants'
import { EDITORIAL_ARTICLES } from '../lib/editorial-articles'
import { getArticles, getArticleBySlug, getAllArticleSlugs, setEnvResolverForTests } from '../lib/db'

const EXPECTED_SLUGS = [
  'alex-sola-detenido-accidente-positivo-alcohol',
  'bateria-externa-philips-action',
  'brasil-segunda-vuelta-lula-flavio-bolsonaro-25-octubre-2026',
  'ciberataque-dinamarca-datos-88-millones-personas',
  'cic-energigune-bateria-flujo-hierro-plomo-10000-ciclos',
  'cnio-osteopontina-cancer-de-mama-resistencia-antiangiogenicos',
  'cristiano-ronaldo-abandona-concentracion-portugal-jorge-jesus',
  'csic-barcelona-area-nanofabricacion-cuantica-imb-cnm',
  'desperdicio-alimentario-espana-2025-plan-red-electrica-2030',
  'doordash-nueva-york-acuerdo-repartidores-131-millones',
  'dos-jovenes-ahogados-guardamar-segura-bandera-roja',
  'elecciones-generales-2026-29-noviembre',
  'frente-amplio-espana-partidos-candidato-programa-29n',
  'como-se-reparten-escanos-voto-provincia-29n',
  'vivienda-elecciones-29n-comparar-propuestas-partidos',
  'euro-minimos-17-meses-incertidumbre-politica-europa',
  'inundaciones-cataluna-alertas-desaparecido-lluvias-octubre-2026',
  'madrid-inteligencia-artificial-sanidad-publica-50-millones',
  'muere-carlos-fernandez-lomana-hermano-carmen-lomana',
  'premios-nacionales-musica-2026-laura-vega-cecilia-bercovich',
  'schneider-electric-compra-ptc-22600-millones-ia-industrial',
  'zelestra-edp-baterias-almacenamiento-espana',
  'vigo-polo-chips-fotonicos-nanosatelites-ia-2026',
  'galdar-inteligencia-artificial-ahorro-agua-agricultura-2026',
  'espana-75-millones-399-proyectos-investigacion-salud-2026',
  'neotec-2026-40-millones-startups-tecnologicas-espana',
  'onalabs-barcelona-monitorizacion-salud-sudor-ia-2026',
  'caixaimpulse-2026-30-proyectos-innovacion-salud',
  'internet-satelite-espana-conexiones-multiplican-diez-cnmc-2026',
  'artemis-ii-medalla-stephen-hawking-tenerife-2026',
  'muncyt-csic-ciencia-primera-persona-2026-2027',
  'espana-innovacion-startups-proyectos-ciencia-ayudas-2026',
  'sateliot-cinco-satelites-5g-espacio-octubre-2026',
  'barcelona-polaris-resonancia-cuantica-q-aid-2026',
  'espana-102-millones-equipamiento-cientifico-investigacion-2026',
  'espana-138-millones-ia-tecnologias-limpias-biotecnologia-2026',
  'ossie-taxi-espacial-espanol-uarx-2026',
  'kapsula-kuantikoa-ciencia-cuantica-147-localidades-euskadi',
  'nodo-nacional-datos-cancer-espana-investigacion-2026',
  'renovables-espana-50-por-ciento-generacion-septiembre-2026',
  'investigacion-espana-1200-millones-ayudas-ciencia-2026',
  'catedra-arrels-innovacion-resiliencia-climatica-2026',
  'espana-724-millones-proyectos-investigacion-formacion-doctoral-2026',
  'ramon-y-cajal-2026-240-millones-talento-investigador-espana',
  'juan-de-la-cierva-2026-61-millones-jovenes-investigadores',
  'torres-quevedo-2026-doctores-empresas-espana',
  'innterconecta-step-2026-138-millones-ia-tecnologia-limpia-biotecnologia',
  'espana-1200-millones-nuevas-ayudas-ciencia-investigacion-2026',
  'ramon-y-cajal-2026-proyecto-propio-200000-euros-investigador',
  'plataformas-tecnologicas-2026-seis-millones-innovacion-empresas',
  'diez-millones-personal-tecnico-gestion-idi-2026',
  '75-millones-399-proyectos-investigacion-salud-espana-2026',
  'desahucios-decretos-vivienda-rechazados-que-sigue-vigente-2026',
  'espana-sin-presupuestos-prorrogados-consecuencias-ciudadanos-2026',
  'reforma-financiacion-autonomica-2026-que-propone-y-que-falta',
  'gobierno-en-funciones-espana-que-puede-hacer-elecciones-2026',
  'leyes-pendientes-elecciones-anticipadas-espana-2026-29n',

]

const mk = (id: number, slug: string, published_at: string, category = 'virales', trending = 0): Article => ({ id, slug, title: `D1 ${slug}`, category, content: 'x', excerpt: 'd1 row', image_url: null, thumbnail_url: null,
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
  // stale duplicate of an editorial slug: bundled editorial data must win
  mk(3, EXPECTED_SLUGS[0], '2026-01-02T00:00:00.000Z', 'chollos'),
]

function bind() {
  const { db, calls } = fakeD1(d1Rows)
  setEnvResolverForTests(() => ({ DB: db as never }))
  return calls
}

async function collectAllFeedArticles(): Promise<Article[]> {
  const articles: Article[] = []
  for (let offset = 0; ; offset += 50) {
    const page = await getArticles({ limit: 50, offset })
    articles.push(...page)
    if (page.length < 50) return articles
  }
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

test('D1-bound: all editorial slugs resolve by direct lookup', async () => {
  const calls = bind()
  for (const slug of EXPECTED_SLUGS) {
    const a = await getArticleBySlug(slug)
    assert.equal(a?.slug, slug)
    assert.notEqual(a?.title.startsWith('D1 '), true)
  }
  assert.equal((await getArticleBySlug('old-d1-article'))?.id, 1)
  assert.equal(await getArticleBySlug('missing'), null)
  assert.ok(calls.length > 0, 'D1 was exercised')
})

test('D1-bound: feed includes all editorial slugs, deduped, newest first', async () => {
  const calls = bind()
  const all = await collectAllFeedArticles()
  assert.ok(calls.some((s) => s.includes('FROM articles')), 'D1 was queried')
  const slugs = all.map((a) => a.slug)
  for (const s of EXPECTED_SLUGS) assert.ok(slugs.includes(s), s)
  assert.equal(new Set(slugs).size, slugs.length, 'no duplicates')
  assert.equal(slugs[0], 'newer-d1-article')
  assert.equal(all.find((a) => a.slug === EXPECTED_SLUGS[0])?.category, 'virales')
  for (let i = 1; i < all.length; i++) {
    assert.ok(+new Date(all[i - 1].published_at) >= +new Date(all[i].published_at))
  }
})

test('D1-bound: pagination is exact and gap-free', async () => {
  bind()
  const full = (await getArticles({ limit: 50 })).map((a) => a.slug)
  const paged: string[] = []
  for (let offset = 0; offset < full.length; offset += 4) {
    const page = (await getArticles({ limit: 4, offset })).map((a) => a.slug)
    paged.push(...page.slice(0, full.length - offset))
  }
  assert.deepEqual(paged, full)
})

test('D1-bound: category, search and trending semantics', async () => {
  bind()
  const chollos = await getArticles({ category: 'chollos', limit: 50 })
  assert.ok(chollos.every((a) => a.category === 'chollos'))
  assert.equal(chollos.filter((a) => a.slug === EXPECTED_SLUGS[1]).length, 1)

  const tecnologia = (await getArticles({ category: 'tecnologia', limit: 50 })).map((a) => a.slug)
  for (const s of [EXPECTED_SLUGS[3], EXPECTED_SLUGS[4], EXPECTED_SLUGS[5], EXPECTED_SLUGS[7], EXPECTED_SLUGS[17]]) assert.ok(tecnologia.includes(s), s)

  const search = async (q: string) => (await getArticles({ q, limit: 50 })).map((a) => a.slug)
  assert.ok((await search('osteopontina')).includes('cnio-osteopontina-cancer-de-mama-resistencia-antiangiogenicos'))
  assert.ok((await search('DoorDash')).includes('doordash-nueva-york-acuerdo-repartidores-131-millones'))
  assert.ok((await search('Bercovich')).includes('premios-nacionales-musica-2026-laura-vega-cecilia-bercovich'))
  assert.ok((await search('nanofabricación')).includes('csic-barcelona-area-nanofabricacion-cuantica-imb-cnm'))

  const trending = await getArticles({ trending: true, limit: 50 })
  assert.ok(trending.every((a) => a.trending))
  assert.ok(trending.some((a) => a.slug === 'newer-d1-article'))
  assert.ok(trending.some((a) => a.slug === 'ciberataque-dinamarca-datos-88-millones-personas'))
})

test('D1-bound: sitemap data has all editorial slugs plus D1 rows, deduped', async () => {
  bind()
  const slugs = (await getAllArticleSlugs()).map((a) => a.slug)
  for (const s of EXPECTED_SLUGS) assert.ok(slugs.includes(s), s)
  assert.ok(slugs.includes('old-d1-article') && slugs.includes('newer-d1-article'))
  assert.equal(new Set(slugs).size, slugs.length)
})

test('empty D1 still serves editorial content', async () => {
  const { db } = fakeD1([])
  setEnvResolverForTests(() => ({ DB: db as never }))
  const slugs = (await collectAllFeedArticles()).map((a) => a.slug)
  for (const s of EXPECTED_SLUGS) assert.ok(slugs.includes(s), s)
  assert.equal(slugs.length, EXPECTED_SLUGS.length)
})
