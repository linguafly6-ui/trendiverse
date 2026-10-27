import { NextRequest, NextResponse } from 'next/server'
import { getArticles } from '@/lib/db'

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
  return NextResponse.json({ articles }, { headers: { 'Cache-Control': 'public, s-maxage=30' } })
}
