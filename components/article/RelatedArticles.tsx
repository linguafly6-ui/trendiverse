import ArticleCard from '@/components/ArticleCard'
import type { Article } from '@/lib/types'

export default function RelatedArticles({ articles }: { articles: Article[] }) {
  if (!articles.length) return null
  return (
    <section aria-labelledby="related-heading" className="mt-12 border-t border-slate-200 pt-8 dark:border-slate-800">
      <h2 id="related-heading" className="mb-4 text-xl font-bold">Sigue leyendo</h2>
      <div className="grid gap-3 sm:grid-cols-2">
        {articles.map((a) => <ArticleCard key={a.id} article={a} />)}
      </div>
    </section>
  )
}
