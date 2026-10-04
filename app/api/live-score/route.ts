import { NextRequest, NextResponse } from 'next/server'

export const runtime = 'edge'

// In-memory cache (per-edge, short-lived)
let cache: { data: any; timestamp: number } | null = null
const CACHE_TTL = 15000 // 15 seconds

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

  const url = LEAGUE_MAP[league]
  if (!url) {
    return NextResponse.json({ error: 'Liga no soportada' }, { status: 400 })
  }

  // Check cache
  const now = Date.now()
  if (cache && cache.timestamp + CACHE_TTL > now && cache.data?.league === league) {
    const match = findMatch(cache.data.scoreboard, home, away)
    if (match) {
      return NextResponse.json({
        ...match,
        cached: true,
        fetchedAt: new Date(cache.timestamp).toISOString(),
      }, { headers: { 'Cache-Control': 'public, s-maxage=15' } })
    }
  }

  try {
    const res = await fetch(url, {
      headers: { 'User-Agent': 'TrendiVerse/1.0' },
    })
    if (!res.ok) throw new Error('ESPN API error')
    const data: any = await res.json()

    const fetchedAt = new Date().toISOString()
    cache = { data: { league, scoreboard: data }, timestamp: now }

    const match = findMatch(data, home, away)
    if (!match) {
      return NextResponse.json({ error: 'Partido no encontrado', fetchedAt }, { status: 404 })
    }

    return NextResponse.json({
      ...match,
      cached: false,
      fetchedAt,
    }, { headers: { 'Cache-Control': 'public, s-maxage=15' } })
  } catch {
    // Return cached data if available, even if stale
    if (cache && cache.data?.league === league) {
      const match = findMatch(cache.data.scoreboard, home, away)
      if (match) {
        return NextResponse.json({
          ...match,
          cached: true,
          stale: true,
          fetchedAt: new Date(cache.timestamp).toISOString(),
        })
      }
    }
    return NextResponse.json({ error: 'No se pudo obtener el marcador' }, { status: 503 })
  }
}

function findMatch(scoreboard: any, homeQuery: string, awayQuery: string) {
  const events = scoreboard?.events || []
  const found = events.find((ev: any) => {
    const comps = ev.competitions?.[0]?.competitors || []
    if (comps.length < 2) return false
    const homeName = (comps.find((c: any) => c.homeAway === 'home')?.team?.displayName || '').toLowerCase()
    const awayName = (comps.find((c: any) => c.homeAway === 'away')?.team?.displayName || '').toLowerCase()
    const h = homeQuery.toLowerCase()
    const a = awayQuery.toLowerCase()
    return (
      homeName.includes(h) || homeName.includes(a) ||
      awayName.includes(a) || awayName.includes(h)
    )
  })

  if (!found) return null

  const comps = found.competitions?.[0]?.competitors || []
  const home = comps.find((c: any) => c.homeAway === 'home')
  const away = comps.find((c: any) => c.homeAway === 'away')
  const status = found.status || {}
  const state = status.type?.state || ''

  return {
    homeTeam: home?.team?.displayName || '',
    awayTeam: away?.team?.displayName || '',
    homeScore: parseInt(home?.score || '0'),
    awayScore: parseInt(away?.score || '0'),
    status: state,
    statusText: status.type?.shortDetail || status.type?.detail || '',
    clock: status.displayClock || '',
    period: String(status.period || ''),
    venue: found.competitions?.[0]?.venue?.fullName || '',
    competition: found.competitions?.[0]?.league?.name || '',
    isLive: state === 'in',
    isFinished: state === 'post',
    isPending: state === 'pre',
  }
}
