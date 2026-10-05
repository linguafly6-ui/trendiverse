'use client'
import { useCallback, useEffect, useRef, useState } from 'react'
import ArticleCard from './ArticleCard'
import type { Article } from '@/lib/types'

const PAGE = 10

export default function ArticleFeedMore({ initial, category = '' }: { initial: Article[]; category?: string }) {
  const [items, setItems] = useState(initial)
  const [done, setDone] = useState(initial.length < PAGE)
  const [loading, setLoading] = useState(false)
  const sentinel = useRef<HTMLDivElement>(null)
  const load = useCallback(async () => {
    if (loading || done) return
    setLoading(true)
    try {
      const res = await fetch(`/api/articles?limit=${PAGE}&offset=${items.length}${category ? `&category=${encodeURIComponent(category)}` : ''}`)
      if (!res.ok) return
      const { articles } = (await res.json()) as { articles: Article[] }
      setItems((prev) => [...prev, ...articles])
      setDone(articles.length < PAGE)
    } finally { setLoading(false) }
  }, [category, done, items.length, loading])
  useEffect(() => {
    const el = sentinel.current
    if (!el || done) return
    const io = new IntersectionObserver((entries) => {
      if (entries[0]?.isIntersecting) load()
    }, { rootMargin: '300px' })
    io.observe(el)
    return () => io.disconnect()
  }, [done, load])
  return <>
    <div className="space-y-3">{items.map((a) => <ArticleCard key={a.id} article={a} />)}</div>
    {items.length === 0 && !loading && <p className="rounded-xl border border-dashed border-slate-300 p-8 text-center text-slate-500 dark:border-slate-700">No hay artículos en esta categoría todavía. Vuelve pronto.</p>}
    {!done && <div ref={sentinel} className="h-10 text-center text-sm text-slate-500">{loading ? 'Cargando…' : ''}</div>}
  </>
}