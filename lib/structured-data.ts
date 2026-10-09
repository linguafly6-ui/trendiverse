import { concertsFor, type Concert } from './concerts'
import { ticketNote, ticketsFor } from './concert-tickets'
import { CATEGORIES, getCategory, SITE_NAME, SITE_URL, type CategoryInfo, type TopicInfo } from './constants'
import type { LiveFixtureRef } from './laliga-jornada-8-2026'
import { truncateWords } from './seo-overrides'
import type { Article, Tool } from './types'
import { WEEK_LABEL, type SignReading } from './astrology'

const WEEK_START = '2026-10-08'
const WEEK_END = '2026-10-14'

export const websiteId = `${SITE_URL}/#website`
export const organizationId = `${SITE_URL}/#organization`
export const editorialTeamId = `${SITE_URL}/#editorial-team`

const SECTION_SAME_AS: Record<string, string> = {
  politica: 'https://es.wikipedia.org/wiki/Pol%C3%ADtica_de_Espa%C3%B1a',
  economia: 'https://es.wikipedia.org/wiki/Econom%C3%ADa_de_Espa%C3%B1a',
  deportes: 'https://es.wikipedia.org/wiki/Deporte_en_Espa%C3%B1a',
  astrologia: 'https://es.wikipedia.org/wiki/Astrolog%C3%ADa',
}

const TOPIC_SAME_AS: Record<string, string> = {
  'mundial-2026': 'https://es.wikipedia.org/wiki/Copa_Mundial_de_F%C3%BAtbol_de_2026',
  'inteligencia-artificial': 'https://es.wikipedia.org/wiki/Inteligencia_artificial',
  iphone: 'https://es.wikipedia.org/wiki/IPhone',
  'coches-electricos': 'https://es.wikipedia.org/wiki/Veh%C3%ADculo_el%C3%A9ctrico',
  vivienda: 'https://es.wikipedia.org/wiki/Vivienda_en_Espa%C3%B1a',
}

const SIGN_SAME_AS: Record<string, string> = {
  aries: 'https://es.wikipedia.org/wiki/Aries_(astrolog%C3%ADa)',
  tauro: 'https://es.wikipedia.org/wiki/Tauro_(astrolog%C3%ADa)',
  geminis: 'https://es.wikipedia.org/wiki/G%C3%A9minis_(astrolog%C3%ADa)',
  cancer: 'https://es.wikipedia.org/wiki/C%C3%A1ncer_(astrolog%C3%ADa)',
  leo: 'https://es.wikipedia.org/wiki/Leo_(astrolog%C3%ADa)',
  virgo: 'https://es.wikipedia.org/wiki/Virgo_(astrolog%C3%ADa)',
  libra: 'https://es.wikipedia.org/wiki/Libra_(astrolog%C3%ADa)',
  escorpio: 'https://es.wikipedia.org/wiki/Escorpio_(astrolog%C3%ADa)',
  sagitario: 'https://es.wikipedia.org/wiki/Sagitario_(astrolog%C3%ADa)',
  capricornio: 'https://es.wikipedia.org/wiki/Capricornio_(astrolog%C3%ADa)',
  acuario: 'https://es.wikipedia.org/wiki/Acuario_(astrolog%C3%ADa)',
  piscis: 'https://es.wikipedia.org/wiki/Piscis_(astrolog%C3%ADa)',
}

/** Cada artista de la agenda tiene un tipo cerrado. Un nombre nuevo tiene que entrar aquí. */
const ACTS: Record<string, 'person' | 'group' | 'festival'> = {
  JAZZMADRID: 'festival',
  Shakira: 'person',
  'Myke Towers': 'person',
  'Omar Courtz': 'person',
  'Simple Plan': 'group',
  Morat: 'group',
  Pitbull: 'person',
  'Vetusta Morla': 'group',
  'Tokio Hotel': 'group',
  'Víctor Manuel': 'person',
  Bunbury: 'person',
  'Hombres G': 'group',
  Raphael: 'person',
  'Carolina Durante': 'group',
  Amaral: 'group',
  'La Oreja de Van Gogh': 'group',
  Muse: 'group',
  Cano: 'person',
  'Thirty Seconds to Mars': 'group',
  Quevedo: 'person',
  'Olivia Rodrigo': 'person',
  'Primavera Sound': 'festival',
  'Karol G': 'person',
  'Sónar': 'festival',
  'Mad Cool': 'festival',
  'Bilbao BBK Live': 'festival',
  'Don Omar': 'person',
  Oasis: 'group',
  'Harry Styles': 'person',
}

export function actKind(artist: string): 'person' | 'group' | 'festival' {
  const kind = ACTS[artist]
  if (!kind) throw new Error(`Falta el tipo de ${artist} para el marcado`)
  return kind
}

export function sectionUrl(category: CategoryInfo): string {
  return category.href ? `${SITE_URL}${category.href}` : `${SITE_URL}/articles/category/${category.slug}`
}

export function sectionId(category: CategoryInfo): string {
  return `${sectionUrl(category)}#section`
}

export function topicId(slug: string): string {
  return `${SITE_URL}/#topic-${slug}`
}

export function articleUrl(slug: string): string {
  return `${SITE_URL}/articles/${encodeURIComponent(slug)}`
}

export function concertUrl(id: string): string {
  return `${SITE_URL}/conciertos/${id}`
}

export function eventId(concert: Concert): string {
  return `${concertUrl(concert.id)}#event`
}

export function signUrl(slug: string): string {
  return `${SITE_URL}/astrologia/${slug}`
}

export function horoscopeId(slug: string): string {
  return `${signUrl(slug)}#horoscopo`
}

function graph(nodes: object[]) {
  return { '@context': 'https://schema.org', '@graph': nodes }
}

function publisher() {
  return {
    '@type': 'Organization',
    '@id': organizationId,
    name: SITE_NAME,
    url: SITE_URL,
    logo: { '@type': 'ImageObject', url: `${SITE_URL}/icon-512.png` },
  }
}

export function topicNode(slug: string) {
  const category = getCategory(slug)
  if (!category) throw new Error(`Categoría desconocida: ${slug}`)
  return {
    '@type': 'Thing',
    '@id': topicId(slug),
    name: category.name,
    description: category.description,
    url: sectionUrl(category),
    ...(SECTION_SAME_AS[slug] ? { sameAs: SECTION_SAME_AS[slug] } : {}),
  }
}

export function sectionNode(category: CategoryInfo, mainEntity?: object) {
  return {
    '@type': 'CollectionPage',
    '@id': sectionId(category),
    url: sectionUrl(category),
    name: category.seoTitle,
    description: category.description,
    inLanguage: 'es-ES',
    about: { '@id': topicId(category.slug) },
    isPartOf: { '@id': websiteId },
    ...(mainEntity ? { mainEntity } : {}),
  }
}

export function breadcrumb(url: string, items: { name: string; url: string }[]) {
  return {
    '@type': 'BreadcrumbList',
    '@id': `${url}#breadcrumb`,
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  }
}

export function siteGraph() {
  return graph([
    {
      '@type': 'WebSite',
      '@id': websiteId,
      name: SITE_NAME,
      url: SITE_URL,
      inLanguage: 'es-ES',
      description: 'Medio en español con secciones separadas de política, economía, deportes, tecnología, gaming, coches, virales, herramientas, chollos, conciertos y astrología.',
      publisher: { '@id': organizationId },
      about: CATEGORIES.map((category) => ({ '@id': topicId(category.slug) })),
      hasPart: CATEGORIES.map((category) => ({ '@id': sectionId(category) })),
    },
    publisher(),
    ...CATEGORIES.map((category) => topicNode(category.slug)),
    ...CATEGORIES.map((category) => sectionNode(category)),
  ])
}

export function concertMeta(concert: Concert): { title: string; description: string } {
  const title = `${concert.artist} en ${concert.city}`
  const description = truncateWords(`${concert.when}. ${concert.venue}, ${concert.city}. ${concert.detail}`, 155)
  return { title, description }
}

function eventName(concert: Concert): string {
  if (actKind(concert.artist) === 'festival') {
    return concert.title.toLowerCase().includes(concert.artist.toLowerCase()) ? concert.title : `${concert.artist}: ${concert.title}`
  }
  if (concert.title === 'Concierto') return `${concert.artist} en ${concert.city}`
  return `${concert.artist}: ${concert.title}`
}

export function eventNode(concert: Concert) {
  const kind = actKind(concert.artist)
  const node: Record<string, unknown> = {
    '@type': kind === 'festival' ? 'Festival' : 'MusicEvent',
    '@id': eventId(concert),
    name: eventName(concert),
    description: concert.detail,
    url: concertUrl(concert.id),
    inLanguage: 'es-ES',
    eventStatus: 'https://schema.org/EventScheduled',
    eventAttendanceMode: 'https://schema.org/OfflineEventAttendanceMode',
    location: {
      '@type': 'Place',
      name: concert.venue,
      address: {
        '@type': 'PostalAddress',
        addressLocality: concert.city,
        addressCountry: 'ES',
      },
    },
    isPartOf: { '@id': sectionId(getCategory('conciertos')!) },
  }
  if (!concert.datesPending) {
    node.startDate = concert.start
    if (concert.end) node.endDate = concert.end
  }
  if (kind !== 'festival') {
    node.performer = {
      '@type': kind === 'person' ? 'Person' : 'MusicGroup',
      name: concert.artist,
    }
  }
  const tickets = ticketsFor(concert)
  const offer: Record<string, unknown> = {
    '@type': 'Offer',
    url: tickets.url,
    seller: { '@type': 'Organization', name: tickets.name },
  }
  if (tickets.state === 'abierta') offer.availability = 'https://schema.org/InStock'
  if (tickets.state === 'agotadas') offer.availability = 'https://schema.org/SoldOut'
  node.offers = offer
  return node
}

function itemList(nodes: { id: string; url: string; name: string }[]) {
  return {
    '@type': 'ItemList',
    numberOfItems: nodes.length,
    itemListElement: nodes.map((node, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: node.name,
      url: node.url,
      item: { '@id': node.id },
    })),
  }
}

export function concertSectionGraph(concerts: Concert[], indexable = true) {
  const category = getCategory('conciertos')!
  const url = sectionUrl(category)
  const events = concerts.map(eventNode)
  const list = itemList(events.map((event) => ({
    id: String(event['@id']),
    url: String(event.url),
    name: String(event.name),
  })))
  const page = indexable
    ? sectionNode(category, list)
    : {
      '@type': 'CollectionPage',
      '@id': `${url}#vista`,
      url,
      name: category.seoTitle,
      inLanguage: 'es-ES',
      about: { '@id': topicId('conciertos') },
      mainEntity: list,
    }
  return graph([
    topicNode('conciertos'),
    page,
    ...events,
    breadcrumb(url, [
      { name: 'Inicio', url: SITE_URL },
      { name: 'Conciertos', url },
    ]),
  ])
}

export function concertFaqs(concert: Concert) {
  const confirmed = concert.tier === 'confirmado'
  return [
    {
      q: `¿Cuándo es ${concert.artist} en ${concert.city}?`,
      a: concert.datesPending
        ? `${concert.when}. Los días concretos de esa cita todavía no están cerrados.`
        : concert.when,
    },
    {
      q: `¿Dónde es ${concert.artist} en ${concert.city}?`,
      a: `${concert.venue}, ${concert.city}.`,
    },
    {
      q: `¿De dónde sale la ficha de ${concert.artist}?`,
      a: confirmed
        ? `De ${concert.sourceName}. La página enlaza esa fuente.`
        : `De un listado de entradas (${concert.sourceName}). Conviene confirmar hora y recinto en la taquilla antes de ir.`,
    },
    {
      q: `¿Dónde se compran las entradas de ${concert.artist} en ${concert.city}?`,
      a: ticketNote(concert),
    },
  ]
}

export function concertPageGraph(concert: Concert) {
  const category = getCategory('conciertos')!
  const url = concertUrl(concert.id)
  const meta = concertMeta(concert)
  const faqs = concertFaqs(concert)
  return graph([
    topicNode('conciertos'),
    {
      '@type': 'WebPage',
      '@id': `${url}#webpage`,
      url,
      name: meta.title,
      description: meta.description,
      inLanguage: 'es-ES',
      isPartOf: { '@id': sectionId(category) },
      about: { '@id': topicId('conciertos') },
      mainEntity: { '@id': eventId(concert) },
    },
    eventNode(concert),
    {
      '@type': 'FAQPage',
      '@id': `${url}#faq`,
      mainEntity: faqs.map((item) => ({
        '@type': 'Question',
        name: item.q,
        acceptedAnswer: { '@type': 'Answer', text: item.a },
      })),
    },
    breadcrumb(url, [
      { name: 'Inicio', url: SITE_URL },
      { name: 'Conciertos', url: sectionUrl(category) },
      { name: concert.artist, url },
    ]),
  ])
}

export function horoscopeArticle(sign: SignReading) {
  const category = getCategory('astrologia')!
  return {
    '@type': 'Article',
    '@id': horoscopeId(sign.slug),
    headline: `Horóscopo de ${sign.name}`,
    description: sign.description,
    articleBody: sign.general,
    datePublished: WEEK_START,
    temporalCoverage: `${WEEK_START}/${WEEK_END}`,
    inLanguage: 'es-ES',
    genre: 'Horóscopo',
    keywords: `horóscopo, ${sign.name}, astrología, ${sign.element}`,
    articleSection: category.name,
    author: { '@type': 'Organization', '@id': editorialTeamId, name: 'Equipo Editorial', url: `${SITE_URL}/autor/equipo-editorial` },
    publisher: publisher(),
    isPartOf: { '@id': sectionId(category) },
    mainEntityOfPage: signUrl(sign.slug),
    about: {
      '@type': 'Thing',
      '@id': `${SITE_URL}/#signo-${sign.slug}`,
      name: sign.name,
      alternateName: `Horóscopo de ${sign.name}`,
      description: `${sign.name}: ${sign.element}, ${sign.modality}, ${sign.dates}. Semana del ${WEEK_LABEL}.`,
      sameAs: SIGN_SAME_AS[sign.slug],
    },
  }
}

export function astrologySectionGraph(signs: SignReading[]) {
  const category = getCategory('astrologia')!
  const url = sectionUrl(category)
  const articles = signs.map(horoscopeArticle)
  return graph([
    topicNode('astrologia'),
    sectionNode(category, itemList(signs.map((sign, index) => ({
      id: String(articles[index]['@id']),
      url: signUrl(sign.slug),
      name: String(articles[index].headline),
    })))),
    ...articles,
    breadcrumb(url, [
      { name: 'Inicio', url: SITE_URL },
      { name: 'Astrología', url },
    ]),
  ])
}

export function horoscopePageGraph(sign: SignReading, faqs: { q: string; a: string }[]) {
  const category = getCategory('astrologia')!
  const url = signUrl(sign.slug)
  return graph([
    topicNode('astrologia'),
    horoscopeArticle(sign),
    {
      '@type': 'FAQPage',
      '@id': `${url}#faq`,
      mainEntity: faqs.map((item) => ({
        '@type': 'Question',
        name: item.q,
        acceptedAnswer: { '@type': 'Answer', text: item.a },
      })),
    },
    breadcrumb(url, [
      { name: 'Inicio', url: SITE_URL },
      { name: 'Astrología', url: sectionUrl(category) },
      { name: sign.name, url },
    ]),
  ])
}

export function categoryArchiveGraph(category: CategoryInfo, articles: Article[]) {
  const archiveUrl = `${SITE_URL}/articles/category/${category.slug}`
  const isHub = !category.href
  const node = isHub
    ? sectionNode(category, articleItemList(articles, category))
    : {
      '@type': 'CollectionPage',
      '@id': `${archiveUrl}#articulos`,
      url: archiveUrl,
      name: category.seoTitle,
      description: category.description,
      inLanguage: 'es-ES',
      about: { '@id': topicId(category.slug) },
      isPartOf: { '@id': sectionId(category) },
      mainEntity: articleItemList(articles, category),
    }
  return graph([
    topicNode(category.slug),
    node,
    breadcrumb(isHub ? sectionUrl(category) : archiveUrl, [
      { name: 'Inicio', url: SITE_URL },
      { name: category.name, url: isHub ? sectionUrl(category) : archiveUrl },
    ]),
  ])
}

function articleItemList(articles: Article[], category: CategoryInfo) {
  return {
    '@type': 'ItemList',
    numberOfItems: articles.length,
    itemListOrder: 'https://schema.org/ItemListOrderDescending',
    itemListElement: articles.map((article, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      url: articleUrl(article.slug),
      name: article.title,
      item: {
        '@type': 'NewsArticle',
        '@id': `${articleUrl(article.slug)}#article`,
        headline: article.title,
        url: articleUrl(article.slug),
        datePublished: article.published_at,
        articleSection: category.name,
        about: { '@id': topicId(category.slug) },
      },
    })),
  }
}

export function articlesIndexGraph(articles: Article[]) {
  const url = `${SITE_URL}/articles`
  return graph([
    {
      '@type': 'CollectionPage',
      '@id': `${url}#indice`,
      url,
      name: 'Noticias, actualidad y guías por categoría',
      description: 'Índice editorial de TrendiVerse, separado por sección.',
      inLanguage: 'es-ES',
      isPartOf: { '@id': websiteId },
      hasPart: CATEGORIES.map((category) => ({ '@id': sectionId(category) })),
      mainEntity: {
        '@type': 'ItemList',
        numberOfItems: articles.length,
        itemListElement: articles.map((article, index) => ({
          '@type': 'ListItem',
          position: index + 1,
          url: articleUrl(article.slug),
          name: article.title,
        })),
      },
    },
    breadcrumb(url, [
      { name: 'Inicio', url: SITE_URL },
      { name: 'Noticias y guías', url },
    ]),
  ])
}

export function topicGraph(topic: TopicInfo, articles: Article[]) {
  const url = `${SITE_URL}/articles/topic/${topic.slug}`
  const parent = topic.category ? getCategory(topic.category) : undefined
  const aboutId = `${SITE_URL}/#cluster-${topic.slug}`
  return graph([
    {
      '@type': 'Thing',
      '@id': aboutId,
      name: topic.name,
      description: topic.description,
      url,
      ...(TOPIC_SAME_AS[topic.slug] ? { sameAs: TOPIC_SAME_AS[topic.slug] } : {}),
    },
    {
      '@type': 'CollectionPage',
      '@id': `${url}#topic`,
      url,
      name: topic.seoTitle,
      description: topic.description,
      inLanguage: 'es-ES',
      about: { '@id': aboutId },
      isPartOf: parent ? { '@id': sectionId(parent) } : { '@id': websiteId },
      mainEntity: {
        '@type': 'ItemList',
        numberOfItems: Math.min(articles.length, 20),
        itemListElement: articles.slice(0, 20).map((article, index) => ({
          '@type': 'ListItem',
          position: index + 1,
          url: articleUrl(article.slug),
          name: article.title,
        })),
      },
    },
    breadcrumb(url, [
      { name: 'Inicio', url: SITE_URL },
      { name: 'Noticias y guías', url: `${SITE_URL}/articles` },
      ...(parent ? [{ name: parent.name, url: sectionUrl(parent) }] : []),
      { name: topic.name, url },
    ]),
  ])
}

export function articleGraph(input: {
  article: Article
  url: string
  imageUrl?: string
  faqItems: { question: string; answer: string }[]
  match?: LiveFixtureRef | null
}) {
  const { article, url, imageUrl, faqItems, match } = input
  const category = getCategory(article.category)
  const matchId = `${url}#partido`
  const nodes: object[] = []
  if (category) nodes.push(topicNode(category.slug))
  const news: Record<string, unknown> = {
    '@type': 'NewsArticle',
    '@id': `${url}#article`,
    headline: article.title,
    description: article.excerpt ?? undefined,
    image: imageUrl ? [imageUrl] : undefined,
    datePublished: article.published_at,
    inLanguage: 'es-ES',
    articleSection: category?.name,
    keywords: category?.short,
    author: { '@type': 'Organization', '@id': editorialTeamId, name: 'Equipo Editorial', url: `${SITE_URL}/autor/equipo-editorial` },
    publisher: publisher(),
    mainEntityOfPage: { '@type': 'WebPage', '@id': `${url}#webpage` },
    url,
  }
  if (category) {
    news.about = { '@id': topicId(category.slug) }
    news.isPartOf = { '@id': sectionId(category) }
  }
  if (match) {
    news.about = [
      ...(category ? [{ '@id': topicId(category.slug) }] : []),
      { '@id': matchId },
    ]
    nodes.push({
      '@type': 'SportsEvent',
      '@id': matchId,
      name: `${match.homeName} contra ${match.awayName}`,
      sport: 'Fútbol',
      startDate: match.startDate,
      eventAttendanceMode: 'https://schema.org/OfflineEventAttendanceMode',
      eventStatus: 'https://schema.org/EventScheduled',
      url,
      location: {
        '@type': 'Place',
        name: match.venue,
        address: { '@type': 'PostalAddress', addressCountry: 'ES' },
      },
      homeTeam: { '@type': 'SportsTeam', name: match.homeName },
      awayTeam: { '@type': 'SportsTeam', name: match.awayName },
      competitor: [
        { '@type': 'SportsTeam', name: match.homeName },
        { '@type': 'SportsTeam', name: match.awayName },
      ],
      ...(category ? { isPartOf: { '@id': sectionId(category) } } : {}),
    })
  }
  nodes.push(news)
  if (faqItems.length) {
    nodes.push({
      '@type': 'FAQPage',
      '@id': `${url}#faq`,
      mainEntity: faqItems.map((item) => ({
        '@type': 'Question',
        name: item.question,
        acceptedAnswer: { '@type': 'Answer', text: item.answer },
      })),
    })
  }
  nodes.push(breadcrumb(url, [
    { name: 'Inicio', url: SITE_URL },
    ...(category ? [{ name: category.name, url: sectionUrl(category) }] : []),
    { name: article.title, url },
  ]))
  return graph(nodes)
}

export function toolGraph(tool: Tool) {
  const category = getCategory('herramientas')!
  const url = `${SITE_URL}/tools/${encodeURIComponent(tool.slug)}`
  return graph([
    topicNode('herramientas'),
    {
      '@type': 'WebApplication',
      '@id': `${url}#app`,
      name: tool.title,
      description: tool.description ?? undefined,
      url,
      applicationCategory: 'UtilitiesApplication',
      inLanguage: 'es-ES',
      isPartOf: { '@id': sectionId(category) },
      about: { '@id': topicId('herramientas') },
      offers: { '@type': 'Offer', price: '0', priceCurrency: 'EUR' },
    },
    breadcrumb(url, [
      { name: 'Inicio', url: SITE_URL },
      { name: category.name, url: sectionUrl(category) },
      { name: tool.title, url },
    ]),
  ])
}

export function currentConcerts(): Concert[] {
  return concertsFor()
}
