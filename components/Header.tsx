'use client'
import Link from 'next/link'
import { useEffect, useRef, useState } from 'react'
import ThemeToggle from './ThemeToggle'
import CategoryNav from './CategoryNav'
import type { Article } from '@/lib/types'

function SearchModal({ onClose }: { onClose: () => void }) {
  const [q, setQ] = useState('')
  const [results, setResults] = useState<Article[]>([])
  const input = useRef<HTMLInputElement>(null)

  useEffect(() => input.current?.focus(), [])

  useEffect(() => {
    if (q.trim().length < 2) { setResults([]); return }
    const ctrl = new AbortController()
    const t = setTimeout(() => {
      fetch(`/api/articles?q=${encodeURIComponent(q)}&limit=6`, { signal: ctrl.signal })
        .then((r) => r.json() as Promise<{ articles: Article[] }>)
        .then((d) => setResults(d.articles))
        .catch(() => {})
    }, 250)
    return () => { clearTimeout(t); ctrl.abort() }
  }, [q])

  return (
    <div role="dialog" aria-modal="true" aria-label="Buscar" className="fixed inset-0 z-50 bg-black/60 p-4 pt-24" onClick={onClose}>
      <div className="mx-auto max-w-xl rounded-xl bg-white p-4 shadow-xl dark:bg-slate-900" onClick={(e) => e.stopPropagation()}>
        <input
          ref={input}
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Buscar artículos…"
          className="w-full rounded-lg border border-slate-300 bg-transparent px-3 py-2 outline-none focus:border-brand-violet dark:border-slate-700"
        />
        <ul className="mt-3 space-y-1">
          {results.map((a) => (
            <li key={a.id}>
              <Link href={`/articles/${a.slug}`} onClick={onClose} className="block rounded px-2 py-1.5 hover:bg-slate-100 dark:hover:bg-slate-800">
                {a.title}
              </Link>
            </li>
          ))}
          {q.trim().length >= 2 && results.length === 0 && <li className="px-2 text-sm text-slate-500">Sin resultados</li>}
        </ul>
      </div>
    </div>
  )
}

export default function Header() {
  const [open, setOpen] = useState(false)

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') { e.preventDefault(); setOpen(true) }
      if (e.key === 'Escape') setOpen(false)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  return (
    <header className="sticky top-0 z-40 bg-white/90 backdrop-blur dark:bg-slate-950/90">
      <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4">
        <Link href="/" className="flex items-center gap-2 text-xl font-extrabold">
          <span className="animate-pulse text-brand-violet" aria-hidden>⚡</span>
          Trendi<span className="text-brand-violet">Verse</span>
        </Link>
        <div className="flex items-center gap-1">
          <button onClick={() => setOpen(true)} aria-label="Buscar" className="flex items-center gap-2 rounded-full px-3 py-1.5 text-sm hover:bg-slate-200 dark:hover:bg-slate-800">
            🔍 <kbd className="hidden rounded border px-1 text-xs sm:inline">⌘K</kbd>
          </button>
          <ThemeToggle />
        </div>
      </div>
      <CategoryNav />
      {open && <SearchModal onClose={() => setOpen(false)} />}
    </header>
  )
}
