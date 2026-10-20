import test from 'node:test'
import assert from 'node:assert/strict'
import { CATEGORIES, getCategory, TOPICS } from '../lib/constants'
import { concertById, concertsFor } from '../lib/concerts'
import { liveMatchForSlug } from '../lib/laliga-jornada-8-2026'
import {
  actKind,
  articleGraph,
  concertFaqs,
  concertMeta,
  concertPageGraph,
  concertSectionGraph,
  eventNode,
  sectionId,
  siteGraph,
  toolGraph,
  topicGraph,
  topicId,
} from '../lib/structured-data'
import type { Article, Tool } from '../lib/types'

type Node = Record<string, unknown>

function nodes(data: { '@graph': object[] }, type?: string): Node[] {
  return (data['@graph'] as Node[]).filter((node) => !type || node['@type'] === type)
}

test('each section is a distinct topic in the site graph', () => {
  const site = siteGraph()
  const website = nodes(site, 'WebSite')[0]
  const topics = nodes(site, 'Thing')
  const sections = nodes(site, 'CollectionPage')
  assert.equal(topics.length, CATEGORIES.length)
  assert.equal(sections.length, CATEGORIES.length)
  assert.equal((website.hasPart as unknown[]).length, CATEGORIES.length)
  assert.equal(new Set(topics.map((topic) => topic['@id'])).size, CATEGORIES.length)
  assert.equal(new Set(sections.map((section) => section['@id'])).size, CATEGORIES.length)
  const byId = new Map(sections.map((section) => [section['@id'], section]))
  assert.equal(byId.get(sectionId(CATEGORIES.find((c) => c.slug === 'conciertos')!))?.url, 'https://trendiverse.org/conciertos')
  assert.equal(getCategory('astrologia')?.href, '/astrologia')
  assert.equal(CATEGORIES.some((category) => category.slug === 'astrologia' || category.slug === 'segunda-mano'), false)
  for (const removed of ['politica', 'economia', 'deportes', 'gaming', 'virales', 'chollos', 'herramientas']) {
    assert.equal(CATEGORIES.some((category) => category.slug === removed), false)
  }
  for (const category of CATEGORIES) assert.ok(category.seoTitle.length <= 46, category.slug)
})

test('each concert is its own event and pending dates stay undated', () => {
  const concerts = concertsFor()
  const ids = concerts.map((concert) => String(eventNode(concert)['@id']))
  assert.equal(new Set(ids).size, concerts.length)
  for (const concert of concerts) {
    const meta = concertMeta(concert)
    assert.ok(meta.title.length <= 46, `${concert.id} title ${meta.title.length}`)
    assert.ok(meta.description.length <= 155, `${concert.id} description ${meta.description.length}`)
    assert.match(meta.title, /^Entradas /, concert.id)
    assert.match(meta.description, /^Entradas /, concert.id)
    assert.match(concertFaqs(concert)[0].q, /^¿Dónde comprar entradas para /, concert.id)
    actKind(concert.artist)
  }

  const shakira = eventNode(concertById('shakira-madrid-2026')!)
  assert.equal(shakira['@type'], 'MusicEvent')
  assert.equal(shakira.startDate, '2026-10-09')
  assert.equal(shakira.endDate, '2026-10-12')
  assert.equal((shakira.performer as Node)['@type'], 'Person')
  assert.equal(shakira.url, 'https://trendiverse.org/conciertos/shakira-madrid-2026')
  const shakiraOffer = shakira.offers as Node
  assert.equal(shakiraOffer['@type'], 'Offer')
  assert.equal(shakiraOffer.availability, 'https://schema.org/InStock')
  assert.match(String(shakiraOffer.url), /livenation\.es/)
  assert.equal(shakiraOffer.price, undefined)

  const oasisOffer = (eventNode(concertById('oasis-barcelona-2027')!).offers) as Node
  assert.equal(oasisOffer.availability, 'https://schema.org/SoldOut')
  assert.equal(oasisOffer.price, undefined)

  const madOffer = (eventNode(concertById('mad-cool-2027')!).offers) as Node
  assert.equal(madOffer.availability, undefined)
  assert.equal(madOffer.url, 'https://www.madcoolfestival.es/tickets')

  const muse = eventNode(concertById('muse-madrid-2027')!)
  assert.equal((muse.performer as Node)['@type'], 'MusicGroup')
  const carolina = eventNode(concertById('carolina-durante-bilbao-2026')!)
  assert.equal((carolina.performer as Node)['@type'], 'MusicGroup')

  const madCool = eventNode(concertById('mad-cool-2027')!)
  assert.equal(madCool['@type'], 'Festival')
  assert.equal(madCool.startDate, undefined)
  assert.equal(madCool.performer, undefined)
  assert.match(String(madCool.name), /Mad Cool/)

  const primavera = eventNode(concertById('primavera-sound-2027')!)
  assert.equal(primavera['@type'], 'Festival')
  assert.equal(primavera.startDate, '2027-06-02')

  const section = concertSectionGraph(concerts)
  const list = nodes(section, 'CollectionPage')[0]
  assert.equal(list['@id'], 'https://trendiverse.org/conciertos#section')
  assert.equal((list.mainEntity as Node).numberOfItems, concerts.length)
  const filtered = concertSectionGraph(concerts.slice(0, 2), false)
  assert.equal(nodes(filtered, 'CollectionPage')[0]['@id'], 'https://trendiverse.org/conciertos#vista')

  const page = concertPageGraph(concertById('oasis-barcelona-2027')!)
  const event = nodes(page, 'MusicEvent')[0]
  assert.equal(event['@id'], 'https://trendiverse.org/conciertos/oasis-barcelona-2027#event')
  assert.equal((event.performer as Node).name, 'Oasis')
  assert.equal((event.location as Node).name !== undefined, true)
})

test('a match article is a news piece about a sports event in deportes', () => {
  const slug = 'malaga-espanyol-laliga-jornada-8-2026'
  const article: Article = {
    id: 366,
    title: 'Málaga-Espanyol',
    slug,
    category: 'deportes',
    content: null,
    excerpt: 'Previa',
    image_url: null,
    thumbnail_url: null,
    read_time_minutes: 11,
    views: 0,
    trending: 1,
    published_at: '2026-10-09T00:10:00.000Z',
  }
  const graph = articleGraph({
    article,
    url: `https://trendiverse.org/articles/${slug}`,
    faqItems: [],
    match: liveMatchForSlug(slug),
  })
  const news = nodes(graph, 'NewsArticle')[0]
  const match = nodes(graph, 'SportsEvent')[0]
  assert.equal(news.articleSection, undefined)
  assert.equal(news.isPartOf, undefined)
  assert.equal(match.isPartOf, undefined)
  assert.equal(match.startDate, '2026-10-09T21:00:00+02:00')
  assert.equal((match.location as Node).name, 'La Rosaleda')
  assert.equal((match.homeTeam as Node).name, 'Málaga')
  assert.equal(match.score, undefined)

  const politics = articleGraph({
    article: { ...article, slug: 'pedro-sanchez-ultimas-noticias-29n', category: 'politica' },
    url: 'https://trendiverse.org/articles/pedro-sanchez-ultimas-noticias-29n',
    faqItems: [],
  })
  const politicsNews = nodes(politics, 'NewsArticle')[0]
  assert.equal(politicsNews.about, undefined)
  assert.equal(politicsNews.isPartOf, undefined)
  assert.equal(nodes(politics, 'SportsEvent').length, 0)
  assert.equal(news.about && (news.about as Node[]).some((item) => item['@id'] === topicId('deportes')), false)
})

test('topic clusters and tools stay inside their section', () => {
  const vivienda = TOPICS.find((topic) => topic.slug === 'vivienda')!
  const topic = topicGraph(vivienda, [])
  const page = nodes(topic, 'CollectionPage')[0]
  const about = nodes(topic, 'Thing')[0]
  assert.equal(about['@id'], 'https://trendiverse.org/#cluster-vivienda')
  assert.notEqual(about['@id'], topicId('politica'))
  assert.equal((page.isPartOf as Node)['@id'], 'https://trendiverse.org/#website')
  assert.match(String(about.sameAs), /Vivienda_en_Espa/)

  const tool: Tool = { id: 1, title: 'Conversor', slug: 'conversor', description: 'Convierte unidades.', type: 'unit', config: null }
  const app = nodes(toolGraph(tool), 'WebApplication')[0]
  assert.equal(app['@type'], 'WebApplication')
  assert.equal((app.isPartOf as Node)['@id'], 'https://trendiverse.org/#website')
  assert.equal((app.offers as Node).price, '0')
})
