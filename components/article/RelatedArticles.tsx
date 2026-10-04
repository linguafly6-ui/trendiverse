import ArticleCard from '@/components/ArticleCard'
import type { Article } from '@/lib/types'

export default function RelatedArticles({ articles }: { articles: Article[] }) {
  if (!articles.length) return null
  return (
    <section aria-labelledby="related-heading" className="mx-auto mt-12 max-w-prose border-t border-slate-200 pt-8 dark:border-slate-800">
      <h2 id="related-heading" className="mb-5 flex items-center gap-2 text-xl font-extrabold text-slate-900 dark:text-white">
        <span className="h-5 w-1 rounded-full bg-violet-500" />
        Sigue leyendo
      </h2>
      <div className="grid gap-4 sm:grid-cols-2">
        {articles.map((a) => <ArticleCard key={a.id} article={a} />)}
      </div>
    </section>
  )
}
