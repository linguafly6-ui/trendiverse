import { concertsFor, type Concert } from './concerts'
import { ticketNote, ticketsFor } from './concert-tickets'
import { CATEGORIES, getCategory, SITE_NAME, SITE_URL, type CategoryInfo, type TopicInfo } from './constants'
import type { LiveFixtureRef } from './laliga-jornada-8-2026'
import { truncateWords } from './seo-overrides'
import type { Article, Tool } from './types'

export const websiteId = `${SITE_URL}/#website`
export const organizationId = `${SITE_URL}/#organization`
export const editorialTeamId = `${SITE_URL}/#editorial-team`

const SECTION_SAME_AS: Record<string, string> = {
  politica: 'https://es.wikipedia.org/wiki/Pol%C3%ADtica_de_Espa%C3%B1a',
  economia: 'https://es.wikipedia.org/wiki/Econom%C3%ADa_de_Espa%C3%B1a',
  deportes: 'https://es.wikipedia.org/wiki/Deporte_en_Espa%C3%B1a',
}

const TOPIC_SAME_AS: Record<string, string> = {
  'mundial-2026': 'https://es.wikipedia.org/wiki/Copa_Mundial_de_F%C3%BAtbol_de_2026',
  'inteligencia-artificial': 'https://es.wikipedia.org/wiki/Inteligencia_artificial',
  iphone: 'https://es.wikipedia.org/wiki/IPhone',
  'coches-electricos': 'https://es.wikipedia.org/wiki/Veh%C3%ADculo_el%C3%A9ctrico',
  vivienda: 'https://es.wikipedia.org/wiki/Vivienda_en_Espa%C3%B1a',
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
      description: 'Medio en español con secciones de tecnología, coches, moda, tendencias, hogar y conciertos.',
      publisher: { '@id': organizationId },
      about: CATEGORIES.map((category) => ({ '@id': topicId(category.slug) })),
      hasPart: CATEGORIES.map((category) => ({ '@id': sectionId(category) })),
    },
    publisher(),
    ...CATEGORIES.map((category) => topicNode(category.slug)),
    ...CATEGORIES.map((category) => sectionNode(category)),
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
  const url = `${SITE_URL}/tools/${encodeURIComponent(tool.slug)}`
  return graph([
    {
      '@type': 'WebApplication',
      '@id': `${url}#app`,
      name: tool.title,
      description: tool.description ?? undefined,
      url,
      applicationCategory: 'UtilitiesApplication',
      inLanguage: 'es-ES',
      isPartOf: { '@id': websiteId },
      offers: { '@type': 'Offer', price: '0', priceCurrency: 'EUR' },
    },
    breadcrumb(url, [
      { name: 'Inicio', url: SITE_URL },
      { name: 'Herramientas online', url },
      { name: tool.title, url },
    ]),
  ])
}

export function currentConcerts(): Concert[] {
  return concertsFor()
}

