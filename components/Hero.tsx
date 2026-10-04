import Link from 'next/link'
import { CategoryBadge } from './ArticleCard'
import { formatDate } from '@/lib/utils'
import type { Article } from '@/lib/types'

function HeroCard({ a, big }: { a: Article; big?: boolean }) {
  return (
    <article className={`group relative overflow-hidden rounded-2xl bg-slate-900 ${big ? 'h-72 md:h-full md:min-h-[26rem] md:row-span-2' : 'h-48'}`}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={a.image_url ?? ''} alt="" width={1200} height={630} fetchPriority={big ? 'high' : undefined} className="absolute inset-0 h-full w-full object-cover opacity-70 transition group-hover:opacity-80" />
      <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent p-4 text-white">
        <CategoryBadge slug={a.category} />
        {big ? <h2 className="mt-2 text-2xl font-extrabold md:text-3xl"><Link href={`/articles/${a.slug}`} className="transition hover:underline">{a.title}</Link></h2>
             : <h3 className="mt-2 text-lg font-bold"><Link href={`/articles/${a.slug}`} className="transition hover:underline">{a.title}</Link></h3>}
        <div className="mt-1 flex items-center gap-2 text-xs opacity-80">
          <span>{formatDate(a.published_at)}</span>
          <span>·</span>
          <span>{a.read_time_minutes ?? 1} min de lectura</span>
        </div>
      </div>
    </article>
  )
}

export default function Hero({ articles }: { articles: Article[] }) {
  const [main, ...rest] = articles.slice(0, 3)
  if (!main) return null
  return (
    <section aria-label="Tendencias" className="grid gap-4 md:grid-cols-3 md:grid-rows-2">
      <div className="md:col-span-2 md:row-span-2 md:grid"><HeroCard a={main} big /></div>
      {rest.map((a) => <HeroCard key={a.id} a={a} />)}
    </section>
  )
}
