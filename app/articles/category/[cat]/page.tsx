import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import ArticleFeed from '@/components/ArticleFeed'
import CategoryNav from '@/components/CategoryNav'
import DealCard from '@/components/DealCard'
import GamingCodes from '@/components/GamingCodes'
import Sidebar from '@/components/Sidebar'
import { getCategory } from '@/lib/constants'
import { getArticles, getDeals } from '@/lib/db'

export const runtime = 'edge'

type Props = { params: Promise<{ cat: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const c = getCategory((await params).cat)
  return c ? { title: c.name } : {}
}

export default async function CategoryPage({ params }: Props) {
  const { cat } = await params
  const c = getCategory(cat)
  if (!c) notFound()
  const [articles, deals] = await Promise.all([
    getArticles({ category: cat, limit: 10 }),
    cat === 'chollos' ? getDeals(10) : Promise.resolve([]),
  ])
  return (
    <div className="grid gap-8 lg:grid-cols-10">
      <div className="space-y-6 lg:col-span-7">
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
