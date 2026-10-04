'use client'

import { useEffect, useState } from 'react'

interface MatchData {
  homeTeam: string
  awayTeam: string
  homeScore: number
  awayScore: number
  statusText: string
  clock: string
  venue: string
  competition: string
  isLive: boolean
  isFinished: boolean
  isPending: boolean
  fetchedAt: string
  cached?: boolean
  stale?: boolean
}

interface LiveScoreProps {
  league: string
  homeTeam: string
  awayTeam: string
}

export default function LiveScore({ league, homeTeam, awayTeam }: LiveScoreProps) {
  const [match, setMatch] = useState<MatchData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)

  useEffect(() => {
    let mounted = true

    const fetchScore = async () => {
      try {
        const params = new URLSearchParams({ league, home: homeTeam, away: awayTeam })
        const res = await fetch(`/api/live-score?${params}`)
        if (!res.ok) throw new Error('Failed to fetch')
        const data: MatchData = await res.json()

        if (mounted) {
          setMatch(data)
          setError(false)
        }
      } catch {
        if (mounted) setError(true)
      } finally {
        if (mounted) setLoading(false)
      }
    }

    fetchScore()
    const interval = setInterval(fetchScore, 20000)

    return () => {
      mounted = false
      clearInterval(interval)
    }
  }, [league, homeTeam, awayTeam])

  if (loading) {
    return (
      <div className="mx-auto my-6 max-w-prose animate-pulse rounded-2xl border border-slate-200 bg-slate-50 p-5 dark:border-slate-800 dark:bg-slate-900/50">
        <div className="flex items-center justify-center gap-3 py-4 text-slate-400">
          <svg className="h-5 w-5 animate-spin" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          <span className="text-sm font-medium">Cargando marcador en vivo...</span>
        </div>
      </div>
    )
  }

  if (error || !match) {
    return (
      <div className="mx-auto my-6 max-w-prose rounded-2xl border border-slate-200 bg-slate-50 p-5 dark:border-slate-800 dark:bg-slate-900/50">
        <div className="flex items-center justify-center gap-2 py-2 text-slate-500 dark:text-slate-400">
          <span className="text-sm">No se pudo cargar el marcador en vivo en este momento.</span>
        </div>
      </div>
    )
  }

  const fetchedTime = new Date(match.fetchedAt).toLocaleTimeString('es-ES', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  })

  const statusBadge = match.isLive
    ? { text: `EN VIVO${match.clock ? ` · ${match.clock}` : ''}`, class: 'animate-pulse bg-red-500 text-white' }
    : match.isFinished
    ? { text: 'FINAL', class: 'bg-slate-600 text-white' }
    : { text: 'POR EMPEZAR', class: 'bg-amber-500 text-white' }

  return (
    <div className="mx-auto my-6 max-w-prose overflow-hidden rounded-2xl border border-slate-200 bg-gradient-to-br from-slate-50 to-violet-50 dark:border-slate-800 dark:from-slate-900 dark:to-violet-950/30">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-200 bg-white/50 px-5 py-2.5 dark:border-slate-800 dark:bg-slate-900/50">
        <span className="text-xs font-bold uppercase tracking-wide text-slate-600 dark:text-slate-400">
          {match.competition || 'Partido'}
        </span>
        <span className={`rounded-full px-2.5 py-0.5 text-xs font-bold ${statusBadge.class}`}>
          {statusBadge.text}
        </span>
      </div>

      {/* Score */}
      <div className="flex items-center justify-between gap-4 px-5 py-6">
        <div className="flex flex-1 flex-col items-center gap-1 text-center">
          <span className="text-sm font-bold text-slate-700 dark:text-slate-300">{match.homeTeam}</span>
        </div>
        <div className="flex items-center gap-3">
          <span className={`text-4xl font-extrabold tabular-nums ${
            match.isLive ? 'text-violet-600 dark:text-violet-400' : 'text-slate-900 dark:text-white'
          }`}>{match.homeScore}</span>
          <span className="text-2xl font-light text-slate-300 dark:text-slate-700">-</span>
          <span className={`text-4xl font-extrabold tabular-nums ${
            match.isLive ? 'text-violet-600 dark:text-violet-400' : 'text-slate-900 dark:text-white'
          }`}>{match.awayScore}</span>
        </div>
        <div className="flex flex-1 flex-col items-center gap-1 text-center">
          <span className="text-sm font-bold text-slate-700 dark:text-slate-300">{match.awayTeam}</span>
        </div>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between border-t border-slate-200 bg-white/50 px-5 py-2 dark:border-slate-800 dark:bg-slate-900/50">
        {match.venue ? (
          <span className="text-xs text-slate-500 dark:text-slate-500">{match.venue}</span>
        ) : (
          <span />
        )}
        <div className="flex items-center gap-2 text-xs text-slate-400 dark:text-slate-600">
          {match.stale && (
            <span className="rounded bg-amber-100 px-1.5 py-0.5 font-medium text-amber-700 dark:bg-amber-900/30 dark:text-amber-400">
              Datos en caché
            </span>
          )}
          <span>Actualizado: {fetchedTime}</span>
        </div>
      </div>
    </div>
  )
}
