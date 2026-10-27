import Link from 'next/link'
import Hero from '@/components/Hero'
import ArticleFeed from '@/components/ArticleFeed'
import Sidebar from '@/components/Sidebar'
import GamingCodes from '@/components/GamingCodes'
import DealCard from '@/components/DealCard'
import ToolWidget from '@/components/ToolWidget'
import ConcertsHub from '@/components/ConcertsHub'
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
      <section aria-labelledby="home-intro-title" className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900 sm:p-6">
        <h1 id="home-intro-title" className="text-2xl font-extrabold tracking-tight sm:text-3xl">Actualidad, noticias y guías para entender lo que pasa</h1>
        <p className="mt-2 max-w-4xl leading-relaxed text-slate-600 dark:text-slate-400">
          En TrendiVerse reunimos actualidad, tecnología, ciencia, innovación, tendencias y guías prácticas, junto con una agenda de conciertos en España.
        </p>
        <div className="mt-4 flex flex-wrap gap-3">
          <Link href="/articles/category/ahorro" className="inline-flex items-center gap-2 rounded-full bg-emerald-700 px-5 py-3 font-bold text-white shadow-sm transition hover:bg-emerald-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-700">
            <span aria-hidden="true">💶</span>
            Ver guías de ahorro y finanzas personales
          </Link>
          <Link href="/articles/category/toptrends" className="inline-flex items-center rounded-full border border-slate-300 px-4 py-3 font-semibold text-brand-violet transition hover:border-violet-500 dark:border-slate-700">
            Explorar política española y actualidad
          </Link>
        </div>
      </section>
      <ConcertsHub variant="strip" />
      <div className="grid gap-8 lg:grid-cols-10">
        <div className="space-y-8 lg:col-span-7">
          <ArticleFeed initial={feed} />
          <GamingCodes />
          {widget && <ToolWidget tool={widget} />}
          {deals.length > 0 && (
            <section aria-label="Chollos" className="[content-visibility:auto] [contain-intrinsic-size:0_420px]">
              <h2 className="mb-3 text-xl font-bold">🏷️ Chollos</h2>
              <div className="grid gap-4 sm:grid-cols-2">{deals.map((d) => <DealCard key={d.id} deal={d} />)}</div>
            </section>
          )}
        </div>
        <div className="lg:col-span-3"><Sidebar /></div>
      </div>
    </div>
  )
}
