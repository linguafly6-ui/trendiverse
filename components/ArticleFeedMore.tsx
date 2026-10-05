'use client'

import dynamic from 'next/dynamic'
import { useCallback, useEffect, useRef, useState } from 'react'
import type { Article } from '@/lib/types'

const ArticleCard = dynamic(() => import('./ArticleCard'))
const PAGE = 10

export default function ArticleFeedMore({ initialCount, category = '' }: { initialCount: number; category?: string }) {
  const [items, setItems] = useState<Article[]>([])
  const [done, setDone] = useState(initialCount < PAGE)
  const [loading, setLoading] = useState(false)
  const sentinel = useRef<HTMLDivElement>(null)

  const load = useCallback(async () => {
    if (loading || done) return
    setLoading(true)
    try {
      const res = await fetch(`/api/articles?limit=${PAGE}&offset=${initialCount + items.length}${category ? `&category=${encodeURIComponent(category)}` : ''}`)
      if (!res.ok) return
      const { articles } = (await res.json()) as { articles: Article[] }
      setItems((prev) => [...prev, ...articles])
      setDone(articles.length < PAGE)
    } finally {
      setLoading(false)
    }
  }, [category, done, initialCount, items.length, loading])

  useEffect(() => {
    const el = sentinel.current
    if (!el || done) return
    const io = new IntersectionObserver((entries) => {
      if (entries[0]?.isIntersecting) load()
    }, { rootMargin: '300px' })
    io.observe(el)
    return () => io.disconnect()
  }, [done, load])

  if (done && items.length === 0) return null

  return (
    <>
      <div className="space-y-3">
        {items.map((article) => <ArticleCard key={article.id} article={article} />)}
      </div>
      {!done && (
        <div ref={sentinel} className="h-10 text-center text-sm text-slate-500">
          {loading ? 'Cargando…' : ''}
        </div>
      )}
    </>
  )
}
