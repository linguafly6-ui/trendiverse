export interface LiveMatch {
  homeTeam: string
  awayTeam: string
  homeScore: number
  awayScore: number
  status: string
  statusText: string
  clock: string
  period: string
  venue: string
  competition: string
  isLive: boolean
  isFinished: boolean
  isPending: boolean
}

function teamHit(name: string, query: string): boolean {
  const n = name.toLowerCase()
  const q = query.toLowerCase().trim()
  return q.length > 0 && n.includes(q)
}

/** Both clubs must match, so "Deportivo" does not attach to Alavés. */
export function findMatch(scoreboard: { events?: unknown[] } | null | undefined, homeQuery: string, awayQuery: string): LiveMatch | null {
  const events = scoreboard?.events || []
  const found = events.find((event) => {
    const ev = event as { competitions?: { competitors?: { homeAway?: string; team?: { displayName?: string } }[] }[] }
    const comps = ev.competitions?.[0]?.competitors || []
    if (comps.length < 2) return false
    const homeName = comps.find((c) => c.homeAway === 'home')?.team?.displayName || ''
    const awayName = comps.find((c) => c.homeAway === 'away')?.team?.displayName || ''
    const direct = teamHit(homeName, homeQuery) && teamHit(awayName, awayQuery)
    const swapped = teamHit(homeName, awayQuery) && teamHit(awayName, homeQuery)
    return direct || swapped
  }) as {
    competitions?: { competitors?: { homeAway?: string; team?: { displayName?: string }; score?: string }[]; venue?: { fullName?: string }; league?: { name?: string } }[]
    status?: { type?: { state?: string; shortDetail?: string; detail?: string }; displayClock?: string; period?: number }
  } | undefined

  if (!found) return null

  const comps = found.competitions?.[0]?.competitors || []
  const home = comps.find((c) => c.homeAway === 'home')
  const away = comps.find((c) => c.homeAway === 'away')
  const status = found.status || {}
  const state = status.type?.state || ''

  return {
    homeTeam: home?.team?.displayName || '',
    awayTeam: away?.team?.displayName || '',
    homeScore: Number.parseInt(home?.score || '0', 10) || 0,
    awayScore: Number.parseInt(away?.score || '0', 10) || 0,
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
