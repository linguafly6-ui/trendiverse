import Link from 'next/link'
import { CATEGORIES } from '@/lib/constants'

export default function CategoryNav({ active }: { active?: string }) {
  return (
    <nav aria-label="Categorías" className="border-t border-slate-200 dark:border-slate-800">
      <ul className="no-scrollbar mx-auto flex max-w-7xl gap-2 overflow-x-auto px-4 py-2">
        {CATEGORIES.map((c) => (
          <li key={c.slug} className="shrink-0">
            <Link
              href={`/articles/category/${c.slug}`}
              prefetch={false}
              style={{ backgroundColor: active === c.slug ? c.color : undefined, borderColor: c.color }}
              className={`inline-block rounded-full border px-3 py-1 text-sm font-medium ${active === c.slug ? 'text-white' : ''}`}
            >
              {c.icon} {c.short}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  )
}
