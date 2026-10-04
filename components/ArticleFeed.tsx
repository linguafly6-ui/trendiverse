'use client'
import { useCallback, useEffect, useRef, useState } from 'react'
import ArticleCard from './ArticleCard'
import { CATEGORIES } from '@/lib/constants'
import type { Article } from '@/lib/types'

const PAGE = 10

export default function ArticleFeed({ initial, category: fixed }: { initial: Article[]; category?: string }) {
  const [category, setCategory] = useState(fixed ?? '')
  const [items, setItems] = useState(initial)
  const [done, setDone] = useState(initial.length < PAGE)
  const [loading, setLoading] = useState(false)
  const sentinel = useRef<HTMLDivElement>(null)
  const state = useRef({ items, category, loading, done })
  state.current = { items, category, loading, done }

  const load = useCallback(async (reset: boolean, cat: string) => {
    if (state.current.loading) return
    setLoading(true)
    const offset = reset ? 0 : state.current.items.length
    try {
      const res = await fetch(`/api/articles?limit=${PAGE}&offset=${offset}${cat ? `&category=${encodeURIComponent(cat)}` : ''}`)
      if (!res.ok) return
      const { articles } = (await res.json()) as { articles: Article[] }
      setItems((prev) => (reset ? articles : [...prev, ...articles]))
      setDone(articles.length < PAGE)
    } finally {
      setLoading(false)
    }
  }, [])

  const select = (slug: string) => {
    setCategory(slug)
    load(true, slug)
  }

  useEffect(() => {
    const el = sentinel.current
    if (!el) return
    const io = new IntersectionObserver((e) => {
      if (e[0].isIntersecting && !state.current.done) load(false, state.current.category)
    }, { rootMargin: '300px' })
    io.observe(el)
    return () => io.disconnect()
  }, [load])

  return (
    <section aria-label="Últimas noticias">
      {!fixed && (
        <div className="no-scrollbar mb-4 flex gap-2 overflow-x-auto">
          {[{ slug: '', short: 'Todo' }, ...CATEGORIES].map((c) => (
            <button key={c.slug} onClick={() => select(c.slug)}
              className={`shrink-0 rounded-full px-3 py-1 text-sm ${category === c.slug ? 'bg-brand-violet text-white' : 'bg-slate-100 dark:bg-slate-800'}`}>
              {c.short}
            </button>
          ))}
        </div>
      )}
      <div className="space-y-3">{items.map((a) => <ArticleCard key={a.id} article={a} />)}</div>
      {items.length === 0 && !loading && <p className="rounded-xl border border-dashed border-slate-300 p-8 text-center text-slate-500 dark:border-slate-700">No hay artículos en esta categoría todavía. Vuelve pronto.</p>}
      <div ref={sentinel} className="h-10 text-center text-sm text-slate-500">{loading ? 'Cargando…' : ''}</div>
    </section>
  )
}
