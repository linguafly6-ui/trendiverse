import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import ArticleFeed from '@/components/ArticleFeed'
import CategoryNav from '@/components/CategoryNav'
import DealCard from '@/components/DealCard'
import GamingCodes from '@/components/GamingCodes'
import Sidebar from '@/components/Sidebar'
import { getCategory, SITE_NAME, SITE_URL } from '@/lib/constants'
import { getArticles, getDeals } from '@/lib/db'

export const runtime = 'edge'

type Props = { params: Promise<{ cat: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const c = getCategory((await params).cat)
  if (!c) return {}
  const url = `${SITE_URL}/articles/category/${c.slug}`
  return { title: c.seoTitle, description: c.description.slice(0, 160), alternates: { canonical: url }, robots: { index: true, follow: true }, openGraph: { title: c.seoTitle, description: c.description.slice(0, 160), type: 'website', url, siteName: SITE_NAME, locale: 'es_ES' } }
}

export default async function CategoryPage({ params }: Props) {
  const { cat } = await params
  const c = getCategory(cat)
  if (!c) notFound()
  const [articles, deals] = await Promise.all([
    getArticles({ category: cat, limit: 10 }),
    cat === 'chollos' ? getDeals(10) : Promise.resolve([]),
  ])
  const breadcrumbSchema = { '@context': 'https://schema.org', '@type': 'BreadcrumbList', itemListElement: [{ '@type': 'ListItem', position: 1, name: 'Inicio', item: SITE_URL }, { '@type': 'ListItem', position: 2, name: c.name, item: `${SITE_URL}/articles/category/${c.slug}` }] }
  return (
    <div className="grid gap-8 lg:grid-cols-10">
      <div className="space-y-6 lg:col-span-7">
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />
        <nav aria-label="Migas de pan" className="text-sm text-slate-500"><a href="/">Inicio</a> <span aria-hidden="true">/</span> <span>{c.name}</span></nav>
        <p className="max-w-3xl text-slate-600 dark:text-slate-400">{c.description}</p>
        <h1 className="text-3xl font-extrabold" style={{ color: c.color }}>{c.icon} {c.name}</h1>
        <CategoryNav active={cat} />
        {cat === 'gaming' && <GamingCodes />}
        {deals.length > 0 && <div className="grid gap-4 sm:grid-cols-2">{deals.map((d) => <DealCard key={d.id} deal={d} />)}</div>}
        <ArticleFeed key={cat} initial={articles} category={cat} />
      </div>
      <div className="lg:col-span-3"><Sidebar /></div>
    </div>
  )
}
