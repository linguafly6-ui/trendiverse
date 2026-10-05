import Link from 'next/link'
import ThemeToggle from './ThemeToggle'
import CategoryNav from './CategoryNav'
import SearchButtonLoader from './SearchButtonLoader'

export default function Header() {
  return (
    <header className="sticky top-0 z-40 bg-white/90 backdrop-blur dark:bg-slate-950/90">
      <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4">
        <Link href="/" className="flex items-center gap-2 text-xl font-extrabold">
          <span className="animate-pulse text-brand-violet" aria-hidden>⚡</span>
          Trendi<span className="text-brand-violet">Verse</span>
        </Link>
        <div className="flex items-center gap-1"><SearchButtonLoader /><ThemeToggle /></div>
      </div>
      <CategoryNav />
    </header>
  )
}
