import type { ArticleBlock } from '@/lib/article-content'

export default function ArticleBody({ blocks }: { blocks: ArticleBlock[] }) {
  return (
    <div className="mx-auto max-w-prose">
      <div className="space-y-5 text-lg leading-8 text-slate-700 dark:text-slate-300">
        {blocks.map((b, i) =>
          b.type === 'heading' ? (
            <h2 key={i} id={b.id} className="mb-2 mt-10 scroll-mt-24 border-b border-slate-200 pb-2 text-2xl font-bold leading-snug text-slate-900 dark:border-slate-800 dark:text-white">{b.text}</h2>
          ) : (
            <p key={i} className="whitespace-pre-line">{b.text}</p>
          )
        )}
      </div>
    </div>
  )
}
