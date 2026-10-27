import test from 'node:test'
import assert from 'node:assert/strict'
import { existsSync } from 'node:fs'
import { join } from 'node:path'
import type { Article } from '../lib/types'
import { CATEGORIES } from '../lib/constants'
import { EDITORIAL_ARTICLES } from '../lib/editorial-articles'
import { OCTOBER_2026_ARTICLES } from '../lib/october-2026-articles'
import { SEO_BATCH_01_ARTICLES } from '../lib/seo-batch-01'
import { SEO_BATCH_02_ARTICLES } from '../lib/seo-batch-02'
import { SEO_BATCH_03_ARTICLES } from '../lib/seo-batch-03'
import { SEO_BATCH_04_ARTICLES } from '../lib/seo-batch-04'
import { SEO_BATCH_05_ARTICLES } from '../lib/seo-batch-05'
import { AHORRO_BATCH_01_ARTICLES } from '../lib/ahorro-batch-01'
import { ACTUALIDAD_TRENDING_ARTICLES_2026 } from '../lib/actualidad-trending-2026'
import { ACTUALIDAD_TRENDING_ARTICLES_BATCH_12 } from '../lib/actualidad-trending-2026-batch-12'
import { ACTUALIDAD_TRENDING_ARTICLES_BATCH_11 } from '../lib/actualidad-trending-2026-batch-11'
import { ACTUALIDAD_TRENDING_ARTICLES_BATCH_10 } from '../lib/actualidad-trending-2026-batch-10'
import { ACTUALIDAD_TRENDING_ARTICLES_BATCH_9 } from '../lib/actualidad-trending-2026-batch-9'
import { ACTUALIDAD_TRENDING_ARTICLES_BATCH_8 } from '../lib/actualidad-trending-2026-batch-8'
import { ACTUALIDAD_TRENDING_ARTICLES_BATCH_7 } from '../lib/actualidad-trending-2026-batch-7'
import { ACTUALIDAD_TRENDING_ARTICLES_BATCH_6 } from '../lib/actualidad-trending-2026-batch-6'
import { ACTUALIDAD_TRENDING_ARTICLES_BATCH_5 } from '../lib/actualidad-trending-2026-batch-5'
import { ACTUALIDAD_TRENDING_ARTICLES_BATCH_4 } from '../lib/actualidad-trending-2026-batch-4'
import { ACTUALIDAD_TRENDING_ARTICLES_BATCH_3 } from '../lib/actualidad-trending-2026-batch-3'
import { ACTUALIDAD_TRENDING_ARTICLES_BATCH_2 } from '../lib/actualidad-trending-2026-batch-2'
import { TOPTRENDS_ARTICLES } from '../lib/toptrends-articles'
import { EMPRESAS_QUE_TRANSFORMAN_ARTICLES } from '../lib/empresas-que-transforman-2026'
import { MODA_TENDENCIAS_ARTICLES } from '../lib/moda-tendencias-2026'
import { GAMING_TENDENCIAS_ARTICLES } from '../lib/gaming-tendencias-2026'
import { getArticles, getArticleBySlug, getAllArticleSlugs, setEnvResolverForTests } from '../lib/db'
import { SAMPLE_ARTICLES } from '../scripts/legacy-article-data'

const EXPECTED_SLUGS = [
  'ayudas-auto-plus-coches-electricos-2026-requisitos-plazo',
  'reglamento-ia-ue-agosto-2026-transparencia-obligaciones',
  'ahorrar-energia-casa-invierno-medidas-eficaces',
  'tendencias-moda-otono-invierno-2026-2027-como-llevarlas',
  'puntos-recarga-coche-electrico-espana-datos-2026',
  'ayudas-incendios-extremadura-2026-decreto-boe-requisitos',
  'anthropic-perdidas-80700-millones-ingresos-ia-2026',
  'vulnerabilidades-php-cve-2026-109618-109619-actualizar',
  'bizum-limites-errores-estafas-como-protegerse-2026',
  'dana-adam-inundaciones-valencia-alicante-balance-ayudas-octubre-2026',
  'trump-espana-crisis-migratoria-ceuta-declaraciones-octubre-2026',
  'ayuso-milei-reunion-madrid-21-octubre-2026',
  'ley-nietos-voto-espanoles-extranjero-constitucional-octubre-2026',
  'psg-barcelona-4-2-goles-resumen-champions-octubre-2026',
  'vasco-da-gama-boca-juniors-1-3-goles-final-sudamericana-2026',
  'masa-aire-espana-tiempo-hoy-21-octubre-2026',
  'milei-espana-declaraciones-llegar-fin-mes-octubre-2026',
  'sahara-ray-muere-34-anos-modelo-australiana-octubre-2026',
  'terremoto-espana-como-consultar-magnitud-epicentro-avisos-2026',
  'tribunal-cuentas-causa-1-o-archivo-amnistia-octubre-2026',
  'festivos-noviembre-2026-lunes-2-todos-los-santos-comunidades',
  'la-bola-negra-pelicula-los-javis-trama-reparto-taquilla-2026',
  'francisco-rivera-tana-roca-rey-ruptura-octubre-2026',
  'ayuso-javier-milei-reunion-madrid-octubre-2026',
  'rebeca-torro-nueva-portavoz-psoe-octubre-2026',
  'melani-olivares-secretos-rodaje-aida-embarazo-carmen-machi-2026',
  'sergio-rico-asalto-casa-sevilla-familia-octubre-2026',
  'beso-pedro-sanchez-begona-gomez-imagen-viral-octubre-2026',
  'katrin-ortega-parauta-alcaldesa-deja-psoe-octubre-2026',
  'kim-jong-un-ultima-aparicion-rumores-salud-tensiones-corea-sur-octubre-2026',
  'ivan-espinosa-monteros-ultima-hora-justicia-elecciones-29n-octubre-2026',
  'cristian-dinamarca-primera-cena-estado-heredero-vietnam-octubre-2026',
  'cafeina-cuanto-es-demasiado-efectos-sueno-recomendaciones-2026',
  'muere-gustavo-oliva-referente-padel-catalan-trayectoria-legado',
  'mayoria-absoluta-espana-176-escanos-encuestas-elecciones-2026',
  'revolut-no-funciona-caida-20-octubre-2026',
  'getafe-rayo-vallecano-1-1-cronica-jornada-9-2026',
  'incapacidad-temporal-pension-viudedad-nuevas-medidas-octubre-2026',
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
  'prediccion-tecnologica-proximos-5-anos-2026-2031',
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
  'ayudas-coche-electrico-2026-plan-auto-requisitos-cuanto',
  'coches-electricos-empresas-espana-flotas-auto-plus',
  'viajar-coche-electrico-espana-puntos-carga-rutas-2026',
  'rufian-erc-ultimas-noticias-candidato-29n',
  'pensiones-seguridad-social-novedades-2027',
  'pedro-sanchez-ultimas-noticias-29n',
  'decreto-universidades-privadas-supremo-anula',
  'pep-guardiola-ultimas-noticias-vuelta-etihad',
  'malaga-espanyol-laliga-jornada-8-2026',
  'rayo-athletic-laliga-jornada-8-2026',
  'alaves-atletico-laliga-jornada-8-2026',
  'barcelona-getafe-laliga-jornada-8-2026',
  'real-madrid-villarreal-laliga-jornada-8-2026',
  'elche-celta-laliga-jornada-8-2026',
  'real-sociedad-deportivo-laliga-jornada-8-2026',
  'betis-osasuna-laliga-jornada-8-2026',
  'racing-valencia-laliga-jornada-8-2026',
  'levante-sevilla-laliga-jornada-8-2026',
  'deportivo-levante-laliga-jornada-9-2026',
  'espanyol-atletico-laliga-jornada-9-2026',
  'villarreal-elche-laliga-jornada-9-2026',
  'betis-barcelona-laliga-jornada-9-2026',
  'valencia-athletic-laliga-jornada-9-2026',
  'osasuna-racing-laliga-jornada-9-2026',
  'celta-alaves-laliga-jornada-9-2026',
  'malaga-real-sociedad-laliga-jornada-9-2026',
  'real-madrid-sevilla-laliga-jornada-9-2026',
  'getafe-rayo-laliga-jornada-9-2026',
  'alaves-malaga-laliga-jornada-10-2026',
  'rayo-elche-laliga-jornada-10-2026',
  'racing-espanyol-laliga-jornada-10-2026',
  'valencia-villarreal-laliga-jornada-10-2026',
  'atletico-deportivo-laliga-jornada-10-2026',
  'athletic-getafe-laliga-jornada-10-2026',
  'celta-betis-laliga-jornada-10-2026',
  'real-sociedad-levante-laliga-jornada-10-2026',
  'barcelona-real-madrid-laliga-jornada-10-2026',
  'sevilla-osasuna-laliga-jornada-10-2026',
  'conciertos-espana-agenda-2026-2027',
  'como-leemos-el-horoscopo-astrologia-tropical',
  'nvidia-innovacion-tecnologica-chips-inteligencia-artificial',
  'microsoft-innovacion-tecnologica-ia-computacion-cuantica',
  'tesla-innovacion-tecnologica-conduccion-robotica-optimus',
  'byd-innovacion-tecnologica-baterias-coches-electricos',
  'spacex-innovacion-tecnologica-cohetes-reutilizables-starlink',
  'asml-litografia-ultravioleta-extrema-chips-avanzados',
  'tsmc-fabricacion-chips-avanzados-ia-semiconductores',
  'catl-baterias-almacenamiento-energia-sodio-ion',
  'siemens-ia-industrial-gemelos-digitales-automatizacion',
  'moderna-arn-mensajero-biotecnologia-vacunas-personalizadas',
  'moda-colores-tendencia-otono-invierno-2026-2027',
  'chaqueta-bomber-tendencia-otono-invierno-2026',
  'tejido-jacquard-texturas-tendencia-moda-otono-2026',
  'sastreria-hombros-marcados-tendencia-moda-2026',
  'accesorios-tendencia-cinturones-bailarinas-otono-2026',
  'tendencias-gaming-2026-videojuegos-espana',
  'inteligencia-artificial-videojuegos-npc-2026',
  'cloud-gaming-espana-requisitos-ventajas-2026',
  'worlds-2026-league-of-legends-fechas-espana',
  'juegos-creados-usuarios-roblox-fortnite-mods-2026',
  'mejores-ofertas-hogar-tecnologia-octubre-2026',
  'black-friday-moda-2026-ofertas-tiendas',
  'cyber-monday-moda-2026-ofertas-ropa',
  'mejores-freidoras-aire-amazon-espana-2026',
  'mejores-mancuernas-entrenar-casa-2026',
  'mejores-bicicletas-2026',
  'mejores-bicicletas-electricas-2026',
  'mejores-ordenadores-amazon-espana-2026',
  'mejores-teclados-ordenador-amazon-espana-2026',
  'mejores-gafas-inteligencia-artificial-amazon-espana-2026',
  'mejores-colagenos-amazon-espana-2026',
  'mejores-mascarillas-pelo-amazon-espana-2026',
  'mejores-mascarillas-faciales-amazon-espana-2026',
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
  ...SAMPLE_ARTICLES,
  mk(9001, 'old-d1-article', '2026-01-01T00:00:00.000Z'),
  mk(9002, 'newer-d1-article', '2026-10-06T00:00:00.000Z', 'tecnologia', 1),
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

test('runtime does not serve article content from bundled files when D1 is unavailable', async () => {
  setEnvResolverForTests(() => ({}))
  assert.equal(await getArticleBySlug(EXPECTED_SLUGS[0]), null)
  assert.deepEqual(await getArticles({ limit: 10 }), [])
  assert.deepEqual(await getAllArticleSlugs(), [])
})

test('editorial records are valid and unique', () => {
  const editorialSlugs = [...ACTUALIDAD_TRENDING_ARTICLES_BATCH_12, ...ACTUALIDAD_TRENDING_ARTICLES_BATCH_11, ...ACTUALIDAD_TRENDING_ARTICLES_BATCH_10, ...ACTUALIDAD_TRENDING_ARTICLES_BATCH_9, ...ACTUALIDAD_TRENDING_ARTICLES_BATCH_8, ...ACTUALIDAD_TRENDING_ARTICLES_BATCH_7, ...ACTUALIDAD_TRENDING_ARTICLES_BATCH_6, ...ACTUALIDAD_TRENDING_ARTICLES_BATCH_5, ...ACTUALIDAD_TRENDING_ARTICLES_BATCH_4, ...ACTUALIDAD_TRENDING_ARTICLES_BATCH_3, ...ACTUALIDAD_TRENDING_ARTICLES_BATCH_2, ...ACTUALIDAD_TRENDING_ARTICLES_2026, ...EDITORIAL_ARTICLES, ...OCTOBER_2026_ARTICLES, ...EMPRESAS_QUE_TRANSFORMAN_ARTICLES, ...MODA_TENDENCIAS_ARTICLES, ...GAMING_TENDENCIAS_ARTICLES].map((a) => a.slug)
  assert.deepEqual(editorialSlugs.sort(), EXPECTED_SLUGS.filter((slug) => !['mejores-freidoras-aire-amazon-espana-2026', 'mejores-mancuernas-entrenar-casa-2026', 'mejores-bicicletas-2026', 'mejores-bicicletas-electricas-2026', 'mejores-ordenadores-amazon-espana-2026', 'mejores-teclados-ordenador-amazon-espana-2026', 'mejores-gafas-inteligencia-artificial-amazon-espana-2026', 'mejores-colagenos-amazon-espana-2026', 'mejores-mascarillas-pelo-amazon-espana-2026', 'mejores-mascarillas-faciales-amazon-espana-2026'].includes(slug)).sort())
  assert.equal(new Set(EDITORIAL_ARTICLES.map((a) => a.id)).size, EDITORIAL_ARTICLES.length)
  const cats = new Set(CATEGORIES.map((c) => c.slug))
  for (const a of EDITORIAL_ARTICLES) {
    assert.ok(cats.has(a.category), `${a.slug} category`)
    assert.ok(a.excerpt && a.excerpt.length <= 200, `${a.slug} excerpt`)
    assert.match(a.content ?? '', /## Preguntas frecuentes/, `${a.slug} FAQ`)
    if (!['mejores-ofertas-hogar-tecnologia-octubre-2026', 'black-friday-moda-2026-ofertas-tiendas'].includes(a.slug)) assert.ok(!/^\|/m.test(a.content ?? ''), `${a.slug} no tables`)
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

test('D1-bound: feed includes all migrated editorial slugs, unique and newest first', async () => {
  const calls = bind()
  const all = await collectAllFeedArticles()
  assert.ok(calls.some((s) => s.includes('FROM articles')), 'D1 was queried')
  const slugs = all.map((a) => a.slug)
  for (const s of EXPECTED_SLUGS) assert.ok(slugs.includes(s), s)
  assert.equal(new Set(slugs).size, slugs.length, 'no duplicates')
  assert.equal(all[0].published_at, all.reduce((latest, article) => +new Date(article.published_at) > +new Date(latest) ? article.published_at : latest, all[0].published_at))
  assert.equal(all.find((a) => a.slug === EXPECTED_SLUGS[0])?.category, SAMPLE_ARTICLES.find((a) => a.slug === EXPECTED_SLUGS[0])?.category)
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
  const chollos = await getArticles({ category: 'toptrends', limit: 50 })
  assert.ok(chollos.every((a) => a.category === 'toptrends'))
  assert.ok(chollos.length > 0, 'toptrends category returns articles')
  assert.ok(!chollos.some((a) => ['politica', 'economia', 'deportes', 'gaming', 'virales', 'chollos', 'herramientas'].includes(a.category)))

  const tecnologia = (await getArticles({ category: 'tecnologia', limit: 50 })).map((a) => a.slug)
  assert.ok(tecnologia.includes('newer-d1-article'))

  const search = async (q: string) => (await getArticles({ q, limit: 50 })).map((a) => a.slug)
  assert.ok((await search('Rufián')).includes('rufian-erc-ultimas-noticias-candidato-29n'))
  assert.ok((await search('Saiz')).includes('pensiones-seguridad-social-novedades-2027'))
  assert.ok((await search('Dos Hermanas')).includes('pedro-sanchez-ultimas-noticias-29n'))
  assert.ok((await search('905/2025')).includes('decreto-universidades-privadas-supremo-anula'))
  assert.ok((await search('Etihad')).includes('pep-guardiola-ultimas-noticias-vuelta-etihad'))
  assert.ok((await search('Bernabéu')).includes('real-madrid-villarreal-laliga-jornada-8-2026'))
  assert.ok((await search('Rosaleda')).includes('malaga-espanyol-laliga-jornada-8-2026'))
  assert.ok((await search('Riazor')).includes('deportivo-levante-laliga-jornada-9-2026'))
  for (const a of (await collectAllFeedArticles()).filter((x) => /laliga-jornada-\d+-2026$/.test(x.slug))) {
    assert.match(a.title, /^Entradas /, a.slug)
    assert.match(a.excerpt ?? '', /^Entradas y previa del /, a.slug)
    assert.match(a.content ?? '', /## Entradas para el /, a.slug)
    assert.match(a.content ?? '', /### ¿Dónde comprar entradas para el /, a.slug)
  }
  assert.ok((await search('Cartuja')).includes('betis-barcelona-laliga-jornada-9-2026'))
  assert.ok((await search('Kobetamendi')).includes('conciertos-espana-agenda-2026-2027'))
  assert.ok((await search('zodiaco tropical')).includes('como-leemos-el-horoscopo-astrologia-tropical'))
  assert.ok((await search('osteopontina')).includes('cnio-osteopontina-cancer-de-mama-resistencia-antiangiogenicos'))
  assert.ok((await search('DoorDash')).includes('doordash-nueva-york-acuerdo-repartidores-131-millones'))
  assert.ok((await search('Bercovich')).includes('premios-nacionales-musica-2026-laura-vega-cecilia-bercovich'))
  assert.ok((await search('nanofabricación')).includes('csic-barcelona-area-nanofabricacion-cuantica-imb-cnm'))

  const trending: Article[] = []
  for (let offset = 0; ; offset += 50) {
    const page = await getArticles({ trending: true, limit: 50, offset })
    trending.push(...page)
    if (page.length < 50) break
  }
  assert.ok(trending.every((a) => a.trending))
  assert.ok(trending.some((a) => a.slug === 'newer-d1-article'))
  assert.ok(trending.some((a) => a.slug === 'kim-jong-un-ultima-aparicion-rumores-salud-tensiones-corea-sur-octubre-2026'))
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
  assert.equal(slugs.length, new Set([...ACTUALIDAD_TRENDING_ARTICLES_BATCH_12, ...ACTUALIDAD_TRENDING_ARTICLES_BATCH_11, ...ACTUALIDAD_TRENDING_ARTICLES_BATCH_10, ...ACTUALIDAD_TRENDING_ARTICLES_BATCH_9, ...ACTUALIDAD_TRENDING_ARTICLES_BATCH_8, ...ACTUALIDAD_TRENDING_ARTICLES_BATCH_7, ...ACTUALIDAD_TRENDING_ARTICLES_BATCH_6, ...ACTUALIDAD_TRENDING_ARTICLES_BATCH_5, ...ACTUALIDAD_TRENDING_ARTICLES_BATCH_4, ...ACTUALIDAD_TRENDING_ARTICLES_BATCH_3, ...ACTUALIDAD_TRENDING_ARTICLES_BATCH_2, ...ACTUALIDAD_TRENDING_ARTICLES_2026, ...TOPTRENDS_ARTICLES, ...EDITORIAL_ARTICLES, ...OCTOBER_2026_ARTICLES, ...EMPRESAS_QUE_TRANSFORMAN_ARTICLES, ...MODA_TENDENCIAS_ARTICLES, ...GAMING_TENDENCIAS_ARTICLES, ...SEO_BATCH_01_ARTICLES, ...SEO_BATCH_02_ARTICLES, ...SEO_BATCH_03_ARTICLES, ...SEO_BATCH_04_ARTICLES, ...SEO_BATCH_05_ARTICLES, ...AHORRO_BATCH_01_ARTICLES].map((a) => a.slug)).size)
})


test('Empresas que transforman articles are valid and discoverable', async () => {
  const expected = [
    'nvidia-innovacion-tecnologica-chips-inteligencia-artificial',
    'microsoft-innovacion-tecnologica-ia-computacion-cuantica',
    'tesla-innovacion-tecnologica-conduccion-robotica-optimus',
    'byd-innovacion-tecnologica-baterias-coches-electricos',
    'spacex-innovacion-tecnologica-cohetes-reutilizables-starlink',
    'asml-litografia-ultravioleta-extrema-chips-avanzados',
    'tsmc-fabricacion-chips-avanzados-ia-semiconductores',
    'catl-baterias-almacenamiento-energia-sodio-ion',
    'siemens-ia-industrial-gemelos-digitales-automatizacion',
    'moderna-arn-mensajero-biotecnologia-vacunas-personalizadas',
  ]
  assert.deepEqual(EMPRESAS_QUE_TRANSFORMAN_ARTICLES.map((a) => a.slug).sort(), expected.sort())
  assert.equal(EMPRESAS_QUE_TRANSFORMAN_ARTICLES.length, 10)
  assert.equal(new Set(EMPRESAS_QUE_TRANSFORMAN_ARTICLES.map((a) => a.id)).size, 10)
  const categories = new Set(CATEGORIES.map((c) => c.slug))
  for (const a of EMPRESAS_QUE_TRANSFORMAN_ARTICLES) {
    assert.ok(categories.has(a.category), a.slug + ' category')
    assert.ok(a.excerpt && a.excerpt.length <= 200, a.slug + ' excerpt')
    assert.match(a.content ?? '', /## Preguntas frecuentes/, a.slug + ' FAQ')
    assert.ok((a.content ?? '').length > 5000, a.slug + ' substantive content')
    for (const img of [a.image_url, a.thumbnail_url]) {
      assert.ok(img && existsSync(join(process.cwd(), 'public', img)), a.slug + ' image ' + img)
    }
  }
  setEnvResolverForTests(() => ({}))
  const categoryArticles = await getArticles({ category: 'empresas-que-transforman', limit: 10 })
  assert.equal(categoryArticles.length, 10)
  assert.ok(EMPRESAS_QUE_TRANSFORMAN_ARTICLES.every((a) => categoryArticles.some((x) => x.slug === a.slug)))
})


test('fashion category has six substantive, discoverable articles', async () => {
  assert.equal(MODA_TENDENCIAS_ARTICLES.length, 6)
  assert.equal(new Set(MODA_TENDENCIAS_ARTICLES.map((a) => a.id)).size, 6)
  const categories = new Set(CATEGORIES.map((c) => c.slug))
  assert.ok(categories.has('moda'))
  for (const article of MODA_TENDENCIAS_ARTICLES) {
    assert.equal(article.category, 'moda')
    assert.ok(article.excerpt && article.excerpt.length <= 200, article.slug + ' excerpt')
    assert.match(article.content ?? '', /## Preguntas frecuentes/, article.slug + ' FAQ')
    assert.ok((article.content ?? '').length > 2500, article.slug + ' substantive content')
    for (const img of [article.image_url, article.thumbnail_url]) {
      assert.ok(img && existsSync(join(process.cwd(), 'public', img)), article.slug + ' image ' + img)
    }
  }
  setEnvResolverForTests(() => ({}))
  const categoryArticles = await getArticles({ category: 'moda', limit: 10 })
  assert.equal(categoryArticles.length, 8)
  assert.ok(MODA_TENDENCIAS_ARTICLES.every((a) => categoryArticles.some((x) => x.slug === a.slug)))
})


test('gaming trend articles are classified under technology', async () => {
  assert.equal(GAMING_TENDENCIAS_ARTICLES.length, 5)
  assert.equal(new Set(GAMING_TENDENCIAS_ARTICLES.map((a) => a.id)).size, 5)
  const categories = new Set(CATEGORIES.map((c) => c.slug))
  assert.ok(categories.has('tecnologia'))
  for (const article of GAMING_TENDENCIAS_ARTICLES) {
    assert.equal(article.category, 'tecnologia')
    assert.ok(article.excerpt && article.excerpt.length <= 200, article.slug + ' excerpt')
    assert.match(article.content ?? '', /## Preguntas frecuentes/, article.slug + ' FAQ')
    assert.ok((article.content ?? '').length > 2500, article.slug + ' substantive content')
    assert.match(article.content ?? '', /## Fuentes/, article.slug + ' sources')
    for (const img of [article.image_url, article.thumbnail_url]) {
      assert.ok(img && existsSync(join(process.cwd(), 'public', img)), article.slug + ' image ' + img)
    }
  }
  setEnvResolverForTests(() => ({}))
  const categoryArticles = await getArticles({ category: 'tecnologia', limit: 10 })
  assert.ok(categoryArticles.length >= 5)
  assert.ok(GAMING_TENDENCIAS_ARTICLES.every((a) => categoryArticles.some((x) => x.slug === a.slug)))
})


test('ahorro SEO batch 01 has a complete long-form article and unique slug', () => {
  assert.equal(AHORRO_BATCH_01_ARTICLES.length, 1)
  const article = AHORRO_BATCH_01_ARTICLES[0]
  assert.equal(article.slug, 'como-ahorrar-dinero-cada-mes')
  assert.ok(article.title && article.excerpt && article.category)
  assert.ok(article.content, 'article content must not be null')
  assert.ok((article.content.match(/\b[\p{L}\p{N}]+\b/gu) ?? []).length >= 2000)
})
