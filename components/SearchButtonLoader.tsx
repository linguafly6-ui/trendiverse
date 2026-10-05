'use client'
import dynamic from 'next/dynamic'

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

export default function SearchButtonLoader() {
  return <SearchButton />
}
