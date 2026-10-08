import { NextRequest, NextResponse } from 'next/server'
import { findMatch } from '@/lib/live-score'

export const runtime = 'edge'

const caches = new Map<string, { scoreboard: { events?: unknown[] }; timestamp: number }>()
const CACHE_TTL = 15000

const LEAGUE_LABEL: Record<string, string> = {
  'esp.1': 'LALIGA',
  'esp.2': 'LaLiga Hypermotion',
  'eng.1': 'Premier League',
  'uefa.nations': 'UEFA Nations League',
  'uefa.champs': 'Champions League',
  'uefa.europa': 'Europa League',
  'fifa.world': 'Mundial',
}

const LEAGUE_MAP: Record<string, string> = {
  'uefa.nations': 'https://site.api.espn.com/apis/site/v2/sports/soccer/uefa.nations/scoreboard',
  'esp.2': 'https://site.api.espn.com/apis/site/v2/sports/soccer/esp.2/scoreboard',
  'esp.1': 'https://site.api.espn.com/apis/site/v2/sports/soccer/esp.1/scoreboard',
  'eng.1': 'https://site.api.espn.com/apis/site/v2/sports/soccer/eng.1/scoreboard',
  'uefa.champs': 'https://site.api.espn.com/apis/site/v2/sports/soccer/uefa.champs/scoreboard',
  'uefa.europa': 'https://site.api.espn.com/apis/site/v2/sports/soccer/uefa.europa/scoreboard',
  'fifa.world': 'https://site.api.espn.com/apis/site/v2/sports/soccer/fifa.world/scoreboard',
}

export async function GET(req: NextRequest) {
  const league = req.nextUrl.searchParams.get('league') || ''
  const home = req.nextUrl.searchParams.get('home') || ''
  const away = req.nextUrl.searchParams.get('away') || ''
  const date = req.nextUrl.searchParams.get('date') || ''

  const url = LEAGUE_MAP[league]
  if (!url) {
    return NextResponse.json({ error: 'Liga no soportada' }, { status: 400 })
  }
  if (date && !/^\d{8}$/.test(date)) {
    return NextResponse.json({ error: 'Fecha no válida' }, { status: 400 })
  }

  const cacheKey = `${league}:${date}`
  const endpoint = date ? `${url}?dates=${date}` : url
  const now = Date.now()
  const cached = caches.get(cacheKey)
  if (cached && cached.timestamp + CACHE_TTL > now) {
    const match = findMatch(cached.scoreboard, home, away)
    if (match) {
      return NextResponse.json({
        ...match,
        competition: match.competition || LEAGUE_LABEL[league] || '',
        cached: true,
        fetchedAt: new Date(cached.timestamp).toISOString(),
      }, { headers: { 'Cache-Control': 'public, s-maxage=15' } })
    }
  }

  try {
    const res = await fetch(endpoint, {
      headers: { 'User-Agent': 'TrendiVerse/1.0' },
    })
    if (!res.ok) throw new Error('ESPN API error')
    const data = await res.json() as { events?: unknown[] }
    const fetchedAt = new Date().toISOString()
    caches.set(cacheKey, { scoreboard: data, timestamp: now })

    const match = findMatch(data, home, away)
    if (!match) {
      return NextResponse.json({ error: 'Partido no encontrado', fetchedAt }, { status: 404 })
    }

    return NextResponse.json({
      ...match,
      competition: match.competition || LEAGUE_LABEL[league] || '',
      cached: false,
      fetchedAt,
    }, { headers: { 'Cache-Control': 'public, s-maxage=15' } })
  } catch {
    const stale = caches.get(cacheKey)
    if (stale) {
      const match = findMatch(stale.scoreboard, home, away)
      if (match) {
        return NextResponse.json({
          ...match,
          competition: match.competition || LEAGUE_LABEL[league] || '',
          cached: true,
          stale: true,
          fetchedAt: new Date(stale.timestamp).toISOString(),
        })
      }
    }
    return NextResponse.json({ error: 'No se pudo obtener el marcador' }, { status: 503 })
  }
}
