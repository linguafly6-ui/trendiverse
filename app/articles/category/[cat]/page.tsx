import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import ArticleFeed from '@/components/ArticleFeed'
import CategoryNav from '@/components/CategoryNav'
import DealCard from '@/components/DealCard'
import GamingCodes from '@/components/GamingCodes'
import Sidebar from '@/components/Sidebar'
import PoliticsHub from '@/components/PoliticsHub'
import ConcertsHub from '@/components/ConcertsHub'
import { getCategory, SITE_NAME, SITE_URL, TOPICS } from '@/lib/constants'
import { getArticles, getDeals } from '@/lib/db'

export const runtime = 'edge'

type Props = { params: Promise<{ cat: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const c = getCategory((await params).cat)
  if (!c) return {}
  const url = `${SITE_URL}/articles/category/${c.slug}`
  return {
    title: c.seoTitle,
    description: c.description.slice(0, 160),
    alternates: { canonical: url },
    robots: { index: true, follow: true },
    openGraph: { title: c.seoTitle, description: c.description.slice(0, 160), type: 'website', url, siteName: SITE_NAME, locale: 'es_ES' },
    twitter: { card: 'summary', title: c.seoTitle, description: c.description.slice(0, 160) },
  }
}

export default async function CategoryPage({ params }: Props) {
  const { cat } = await params
  const c = getCategory(cat)
  if (!c) notFound()
  const [articles, deals] = await Promise.all([
    getArticles({ category: cat, limit: 10 }),
    cat === 'chollos' ? getDeals(10) : Promise.resolve([]),
  ])
  const url = `${SITE_URL}/articles/category/${c.slug}`
  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Inicio', item: SITE_URL },
      { '@type': 'ListItem', position: 2, name: c.name, item: url },
    ],
  }
  const collectionSchema = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: c.seoTitle,
    description: c.description,
    url,
    inLanguage: 'es-ES',
    isPartOf: { '@type': 'WebSite', name: SITE_NAME, url: SITE_URL },
    mainEntity: {
      '@type': 'ItemList',
      numberOfItems: articles.length,
      itemListElement: articles.map((article, index) => ({
        '@type': 'ListItem',
        position: index + 1,
        url: `${SITE_URL}/articles/${encodeURIComponent(article.slug)}`,
        name: article.title,
      })),
    },
  }
  return (
    <div className="grid gap-8 lg:grid-cols-10">
      <div className="space-y-6 lg:col-span-7">
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(collectionSchema) }} />
        <nav aria-label="Migas de pan" className="text-sm text-slate-500"><a href="/">Inicio</a> <span aria-hidden="true">/</span> <span>{c.name}</span></nav>
        <header>
          <p className="max-w-3xl text-slate-600 dark:text-slate-400">{c.description}</p>
          <h1 className="mt-2 text-3xl font-extrabold" style={{ color: c.color }}>{c.icon} {c.name}</h1>
          <p className="mt-2 text-sm text-slate-500">{articles.length > 0 ? `${articles.length} artículos recientes en esta sección.` : 'Aún no hay artículos publicados en esta sección.'}</p>
        </header>
        <CategoryNav active={cat} />
        {TOPICS.filter((topic) => topic.category === cat).length > 0 && (
          <section aria-labelledby="topic-clusters-title" className="rounded-xl border border-slate-200 p-4 dark:border-slate-800">
            <h2 id="topic-clusters-title" className="font-extrabold">Explora temas de {c.short}</h2>
            <div className="mt-3 flex flex-wrap gap-2">
              {TOPICS.filter((topic) => topic.category === cat).map((topic) => (
                <Link key={topic.slug} href={`/articles/topic/${topic.slug}`} className="rounded-full border border-slate-200 px-3 py-1.5 text-sm font-medium hover:border-brand-violet hover:text-brand-violet dark:border-slate-700">{topic.name}</Link>
              ))}
            </div>
          </section>
        )}
        {cat === 'gaming' && <GamingCodes />}
        {cat === 'politica' && <PoliticsHub />}
        {cat === 'conciertos' && <ConcertsHub variant="strip" />}
        {deals.length > 0 && <div className="grid gap-4 sm:grid-cols-2">{deals.map((d) => <DealCard key={d.id} deal={d} />)}</div>}
        <ArticleFeed key={cat} initial={articles} category={cat} />
      </div>
      <div className="lg:col-span-3"><Sidebar /></div>
    </div>
  )
}
