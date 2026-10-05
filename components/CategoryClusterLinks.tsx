import Link from 'next/link'
import { CATEGORIES } from '@/lib/constants'

export default function CategoryClusterLinks({ active }: { active: string }) {
  const current = CATEGORIES.find((c) => c.slug === active)
  const related = CATEGORIES.filter((c) => c.slug !== active).slice(0, 4)
  if (!current || !related.length) return null

  return (
    <section aria-labelledby="cluster-links-title" className="border-t border-slate-200 pt-6 dark:border-slate-800">
      <h2 id="cluster-links-title" className="text-lg font-extrabold">También te puede interesar</h2>
      <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
        Más contenidos relacionados de TrendiVerse para seguir explorando.
      </p>
      <div className="mt-3 flex flex-wrap gap-2">
        {related.map((c) => (
          <Link
            key={c.slug}
            href={`/articles/category/${c.slug}`}
            className="rounded-full border border-slate-200 px-3 py-1.5 text-sm font-medium hover:border-brand-violet hover:text-brand-violet dark:border-slate-700"
          >
            {c.icon} {c.short}
          </Link>
        ))}
      </div>
    </section>
  )
}
