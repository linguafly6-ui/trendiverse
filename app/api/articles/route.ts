import { NextRequest, NextResponse } from 'next/server'
import { getArticles } from '@/lib/db'
import { OFERTAS_HOGAR_OCTUBRE_2026 } from '@/lib/ofertas-hogar-octubre-2026'

export const runtime = 'edge'

export async function GET(req: NextRequest) {
  const p = req.nextUrl.searchParams
  const category = p.get('category') || undefined
  const articles = await getArticles({
    category,
    q: p.get('q') || undefined,
    trending: p.get('trending') === '1',
    limit: Number(p.get('limit')) || 12,
    offset: Number(p.get('offset')) || 0,
  })
  const withEditorial = category === 'hogar' ? [OFERTAS_HOGAR_OCTUBRE_2026, ...articles.filter((a) => a.slug !== OFERTAS_HOGAR_OCTUBRE_2026.slug)] : articles
  return NextResponse.json({ articles: withEditorial }, { headers: { 'Cache-Control': 'public, s-maxage=60' } })
}
