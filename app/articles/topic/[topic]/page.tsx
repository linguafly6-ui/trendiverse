import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import ArticleCard from '@/components/ArticleCard'
import CategoryClusterLinks from '@/components/CategoryClusterLinks'
import Sidebar from '@/components/Sidebar'
import { getCategory, getTopic, SITE_NAME, SITE_URL } from '@/lib/constants'
import { getArticles } from '@/lib/db'

export const runtime = 'edge'

type Props = { params: Promise<{ topic: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const topic = getTopic((await params).topic)
  if (!topic) return {}
  const articles = await getArticles({ q: topic.query, category: topic.category, limit: 50 })
  const indexable = articles.length >= 3
  const url = `${SITE_URL}/articles/topic/${topic.slug}`
  return {
    title: topic.seoTitle,
    description: topic.description.slice(0, 160),
    alternates: { canonical: url },
    robots: { index: indexable, follow: true },
    openGraph: { title: topic.seoTitle, description: topic.description, type: 'website', url, siteName: SITE_NAME, locale: 'es_ES' },
    twitter: { card: 'summary', title: topic.seoTitle, description: topic.description },
  }
}

export default async function TopicPage({ params }: Props) {
  const topic = getTopic((await params).topic)
  if (!topic) notFound()

  const articles = await getArticles({ q: topic.query, category: topic.category, limit: 50 })
  const category = topic.category ? getCategory(topic.category) : undefined
  const indexable = articles.length >= 3
  const url = `${SITE_URL}/articles/topic/${topic.slug}`
  const itemList = articles.slice(0, 20).map((article, index) => ({
    '@type': 'ListItem',
    position: index + 1,
    url: `${SITE_URL}/articles/${encodeURIComponent(article.slug)}`,
    name: article.title,
  }))
  const collectionSchema = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: topic.seoTitle,
    description: topic.description,
    url,
    inLanguage: 'es-ES',
    isPartOf: { '@type': 'WebSite', name: SITE_NAME, url: SITE_URL },
    mainEntity: { '@type': 'ItemList', numberOfItems: itemList.length, itemListElement: itemList },
  }

  return (
    <div className="grid gap-8 lg:grid-cols-10">
      <main className="space-y-7 lg:col-span-7">
        {indexable && <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(collectionSchema) }} />}
        <nav aria-label="Migas de pan" className="text-sm text-slate-500">
          <Link href="/" className="hover:text-brand-violet">Inicio</Link>
          <span aria-hidden="true"> / </span>
          <Link href="/articles" className="hover:text-brand-violet">Noticias y guías</Link>
          {category && <><span aria-hidden="true"> / </span><Link href={`/articles/category/${category.slug}`} className="hover:text-brand-violet">{category.name}</Link></>}
          <span aria-hidden="true"> / </span><span>{topic.name}</span>
        </nav>

        <header>
          <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl">{topic.name}</h1>
          <p className="mt-3 max-w-3xl leading-relaxed text-slate-600 dark:text-slate-400">{topic.description}</p>
          <p className="mt-2 text-sm text-slate-500">{articles.length} contenidos relacionados.</p>
        </header>

        <section aria-labelledby="topic-content-title">
          <h2 id="topic-content-title" className="mb-3 text-xl font-extrabold">Últimos contenidos sobre {topic.name}</h2>
          <div className="space-y-3">
            {articles.slice(0, 12).map((article) => <ArticleCard key={article.id} article={article} />)}
          </div>
        </section>

        {category && <CategoryClusterLinks active={category.slug} />}
      </main>
      <div className="lg:col-span-3"><Sidebar /></div>
    </div>
  )
}
