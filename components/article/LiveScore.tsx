'use client'

import { useEffect, useState } from 'react'

interface MatchData {
  homeTeam: string
  awayTeam: string
  homeScore: number
  awayScore: number
  status: string
  clock: string
  period: string
  venue: string
  competition: string
  isLive: boolean
  isFinished: boolean
  isPending: boolean
}

interface LiveScoreProps {
  league: string
  homeTeam: string
  awayTeam: string
}

const STATUS_MAP: Record<string, string> = {
  'in': 'EN VIVO',
  'pre': 'POR EMPEZAR',
  'post': 'FINAL',
}

const PERIOD_MAP: Record<string, string> = {
  '1': '1ª Tiempo',
  '2': '2ª Tiempo',
  'first_half': '1ª Tiempo',
  'second_half': '2ª Tiempo',
  'halftime': 'Descanso',
  'extra_time': 'Prórroga',
  'penalty_shootout': 'Penaltis',
  'shootout': 'Penaltis',
}

export default function LiveScore({ league, homeTeam, awayTeam }: LiveScoreProps) {
  const [match, setMatch] = useState<MatchData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)
  const [lastUpdate, setLastUpdate] = useState<string>('')

  useEffect(() => {
    let mounted = true

    const fetchScore = async () => {
      try {
        const res = await fetch(`https://site.api.espn.com/apis/site/v2/sports/soccer/${league}/scoreboard`)
        if (!res.ok) throw new Error('Failed to fetch')
        const data: any = await res.json()

        const games = data.events || []
        const found = games.find((g: any) => {
          const comps = g.competitions?.[0]?.competitors || []
          if (comps.length < 2) return false
          const home = comps.find((c: any) => c.homeAway === 'home')?.team?.displayName || ''
          const away = comps.find((c: any) => c.homeAway === 'away')?.team?.displayName || ''
          return (
            home.toLowerCase().includes(homeTeam.toLowerCase()) ||
            away.toLowerCase().includes(awayTeam.toLowerCase()) ||
            home.toLowerCase().includes(awayTeam.toLowerCase()) ||
            away.toLowerCase().includes(homeTeam.toLowerCase())
          )
        })

        if (!found) {
          if (mounted) setError(true)
          return
        }

        const comps = found.competions?.[0]?.competitors || []
        const home = comps.find((c: any) => c.homeAway === 'home')
        const away = comps.find((c: any) => c.homeAway === 'away')
        const status = found.status || {}

        const isLive = status.type?.state === 'in'
        const isFinished = status.type?.state === 'post'
        const isPending = status.type?.state === 'pre'

        if (mounted) {
          setMatch({
            homeTeam: home?.team?.displayName || homeTeam,
            awayTeam: away?.team?.displayName || awayTeam,
            homeScore: parseInt(home?.score || '0'),
            awayScore: parseInt(away?.score || '0'),
            status: status.type?.shortDetail || '',
            clock: status.displayClock || '',
            period: status.period || '',
            venue: found.competitions?.[0]?.venue?.fullName || '',
            competition: found.competitions?.[0]?.league?.name || '',
            isLive,
            isFinished,
            isPending,
          })
          setLastUpdate(new Date().toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit', second: '2-digit' }))
          setError(false)
        }
      } catch {
        if (mounted) setError(true)
      } finally {
        if (mounted) setLoading(false)
      }
    }

    fetchScore()
    const interval = setInterval(fetchScore, 30000)

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

  const statusText = match.isLive
    ? `EN VIVO${match.clock ? ` · ${match.clock}` : ''}`
    : match.isFinished
    ? 'FINAL'
    : 'POR EMPEZAR'

  return (
    <div className="mx-auto my-6 max-w-prose overflow-hidden rounded-2xl border border-slate-200 bg-gradient-to-br from-slate-50 to-violet-50 dark:border-slate-800 dark:from-slate-900 dark:to-violet-950/30">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-200 bg-white/50 px-5 py-2.5 dark:border-slate-800 dark:bg-slate-900/50">
        <span className="text-xs font-bold uppercase tracking-wide text-slate-600 dark:text-slate-400">
          {match.competition || 'Partido'}
        </span>
        <span className={`rounded-full px-2.5 py-0.5 text-xs font-bold ${
          match.isLive
            ? 'animate-pulse bg-red-500 text-white'
            : match.isFinished
            ? 'bg-slate-500 text-white'
            : 'bg-amber-500 text-white'
        }`}>
          {statusText}
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
        {match.venue && (
          <span className="text-xs text-slate-500 dark:text-slate-500">{match.venue}</span>
        )}
        <span className="ml-auto text-xs text-slate-400 dark:text-slate-600">
          {match.isLive ? 'Actualizado' : 'Datos'}: {lastUpdate}
        </span>
      </div>
    </div>
  )
}
