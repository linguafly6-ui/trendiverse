import Hero from '@/components/Hero'
import ArticleFeed from '@/components/ArticleFeed'
import Sidebar from '@/components/Sidebar'
import GamingCodes from '@/components/GamingCodes'
import DealCard from '@/components/DealCard'
import ToolWidget from '@/components/ToolWidget'
import { getArticles, getDeals, getTools } from '@/lib/db'

export const runtime = 'edge'
export const dynamic = 'force-dynamic'

export default async function Home() {
  const [trending, feed, deals, tools] = await Promise.all([
    getArticles({ trending: true, limit: 3 }),
    getArticles({ limit: 10 }),
    getDeals(4),
    getTools(),
  ])
  const widget = tools.find((t) => t.type === 'currency') ?? tools[0]

  return (
    <div className="space-y-8">
      <Hero articles={trending} />
      <div className="grid gap-8 lg:grid-cols-10">
        <div className="space-y-8 lg:col-span-7">
          <ArticleFeed initial={feed} />
          <GamingCodes />
          {widget && <ToolWidget tool={widget} />}
          <section aria-label="Chollos">
            <h2 className="mb-3 text-xl font-bold">🏷️ Chollos</h2>
            <div className="grid gap-4 sm:grid-cols-2">{deals.map((d) => <DealCard key={d.id} deal={d} />)}</div>
          </section>
        </div>
        <div className="lg:col-span-3"><Sidebar /></div>
      </div>
    </div>
  )
}
