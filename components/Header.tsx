import dynamic from 'next/dynamic'
import Link from 'next/link'
import ThemeToggle from './ThemeToggle'
import CategoryNav from './CategoryNav'

const SearchButton = dynamic(() => import('./SearchButton'), {
  ssr: false,
  loading: () => (
    <button
      type="button"
      aria-label="Buscar"
      className="flex items-center gap-2 rounded-full px-3 py-1.5 text-sm hover:bg-slate-200 dark:hover:bg-slate-800"
    >
      🔍 <kbd className="hidden rounded border px-1 text-xs sm:inline">⌘K</kbd>
    </button>
  ),
})

export default function Header() {
  return (
    <header className="sticky top-0 z-40 bg-white/90 backdrop-blur dark:bg-slate-950/90">
      <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4">
        <Link href="/" className="flex items-center gap-2 text-xl font-extrabold">
          <span className="animate-pulse text-brand-violet" aria-hidden>⚡</span>
          Trendi<span className="text-brand-violet">Verse</span>
        </Link>
        <div className="flex items-center gap-1"><SearchButton /><ThemeToggle /></div>
      </div>
      <CategoryNav />
    </header>
  )
}
