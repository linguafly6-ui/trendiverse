import Link from 'next/link'
import { getCategory } from '@/lib/constants'
import { formatDate } from '@/lib/utils'
import type { Article } from '@/lib/types'

export function CategoryBadge({ slug }: { slug: string }) {
  const c = getCategory(slug)
  return (
    <span className="inline-block rounded px-2 py-0.5 text-xs font-bold text-white" style={{ backgroundColor: c?.color ?? '#7C3AED' }}>
      {c ? `${c.icon} ${c.short}` : slug}
    </span>
  )
}

export default function ArticleCard({ article }: { article: Article }) {
  return (
    <article className="flex gap-3 rounded-xl border border-slate-200 p-3 dark:border-slate-800">
      <Link href={`/articles/${article.slug}`} className="shrink-0">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={article.thumbnail_url ?? ''} alt="" width={160} height={90} loading="lazy" className="h-[90px] w-[160px] rounded-lg bg-slate-200 object-cover dark:bg-slate-800" />
      </Link>
      <div className="min-w-0">
        <CategoryBadge slug={article.category} />
        <h3 className="mt-1 font-bold leading-snug">
          <Link href={`/articles/${article.slug}`}>{article.title}</Link>
        </h3>
        <p className="line-clamp-2 text-sm text-slate-600 dark:text-slate-400">{article.excerpt}</p>
        <p className="mt-1 text-xs text-slate-500">{formatDate(article.published_at)} · {article.read_time_minutes ?? 1} min</p>
      </div>
    </article>
  )
}
