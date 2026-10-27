import Link from 'next/link'
import { CATEGORIES } from '@/lib/constants'

export default function CategoryNav({ active }: { active?: string }) {
  return (
    <nav aria-label="Categorías" className="border-t border-slate-200 dark:border-slate-800">
      <ul className="no-scrollbar mx-auto flex max-w-7xl gap-2 overflow-x-auto px-4 py-2">
        {CATEGORIES.map((c) => (
          <li key={c.slug} className="shrink-0">
            <Link
              href={c.href ?? `/articles/category/${c.slug}`}
              prefetch={false}
              style={{ backgroundColor: active === c.slug ? c.color : undefined, borderColor: c.color }}
              className={`inline-block rounded-full border px-3 py-1 text-sm font-medium transition ${active === c.slug || c.slug === 'ahorro' ? 'text-white' : ''} ${c.slug === 'ahorro' ? 'border-emerald-700 bg-emerald-700 font-bold hover:bg-emerald-800' : 'hover:bg-slate-100 dark:hover:bg-slate-800'}`}
            >
              {c.icon} {c.short}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  )
}
