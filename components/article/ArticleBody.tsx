import type { ArticleBlock } from '@/lib/article-content'

export default function ArticleBody({ blocks }: { blocks: ArticleBlock[] }) {
  return (
    <div className="mx-auto max-w-prose text-lg leading-8 text-slate-800 dark:text-slate-200">
      {blocks.map((b, i) =>
        b.type === 'heading' ? (
          <h2 key={i} id={b.id} className="mb-3 mt-10 scroll-mt-24 text-2xl font-bold leading-snug text-slate-900 dark:text-white">{b.text}</h2>
        ) : (
          <p key={i} className="mb-6 whitespace-pre-line">{b.text}</p>
        )
      )}
    </div>
  )
}
