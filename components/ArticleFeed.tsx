import Link from 'next/link'
import { CATEGORIES } from '@/lib/constants'
import type { Article } from '@/lib/types'
import ArticleCard from './ArticleCard'
import ArticleFeedMore from './ArticleFeedMore'

export default function ArticleFeed({ initial, category: fixed }: { initial: Article[]; category?: string }) {
  return (
    <section aria-label="Últimas noticias">
      {!fixed && (
        <nav aria-label="Filtrar noticias" className="no-scrollbar mb-4 flex gap-2 overflow-x-auto">
          <Link href="/" className="shrink-0 rounded-full bg-brand-violet px-3 py-1 text-sm text-white">Todo</Link>
          {CATEGORIES.map((c) => (
            <Link key={c.slug} href={`/articles/category/${c.slug}`} prefetch={false} className="shrink-0 rounded-full bg-slate-100 px-3 py-1 text-sm dark:bg-slate-800">
              {c.short}
            </Link>
          ))}
        </nav>
      )}
      <div className="space-y-3">
        {initial.map((a) => <ArticleCard key={a.id} article={a} />)}
      </div>
      {initial.length === 0 && <p className="rounded-xl border border-dashed border-slate-300 p-8 text-center text-slate-500 dark:border-slate-700">No hay artículos en esta categoría todavía. Vuelve pronto.</p>}
      <ArticleFeedMore initialCount={initial.length} category={fixed} />
    </section>
  )
}
