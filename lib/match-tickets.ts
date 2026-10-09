import { liveMatchForSlug } from './laliga-jornada-8-2026'

export const MATCH_TIME_ZONE = 'Europe/Madrid'

/** Matches that began more than this long ago are shown as finished. */
const MATCH_DURATION_MS = 3 * 60 * 60 * 1000

export type MatchLifecycle = 'scheduled' | 'cancelled' | 'postponed' | 'finished'

/** Only set when an official page was opened and checked by a person. */
export interface VerifiedTicketLink {
  url: string
  /** 'match' = page of this specific fixture; 'club' = general tickets page of the home club or organiser. */
  scope: 'match' | 'club'
  /** Name of the official source, e.g. the club's website. */
  source: string
  /** ISO date (YYYY-MM-DD) of the verification. */
  verifiedOn: string
}

export interface MatchTicketInfo {
  slug: string
  homeTeam: string
  awayTeam: string
  competition: string
  /** Omitted when the article does not document the venue. */
  venue?: string
  /** ISO 8601 with offset. Omitted when the kickoff time is not documented. */
  startsAt?: string
  /** Editorial status. Time is still checked so a "scheduled" match is never offered once it started. */
  status: MatchLifecycle
  /** null = no verified official destination. */
  ticketLink: VerifiedTicketLink | null
}

export type TicketBlockState =
  | { kind: 'buy'; href: string; label: 'Comprar entradas'; note: string }
  | { kind: 'official-site'; href: string; label: 'Ver entradas en la web oficial'; note: string }
  | { kind: 'unavailable'; label: 'Entradas no disponibles'; note: string }
  | { kind: 'started' | 'finished' | 'cancelled' | 'postponed'; label: string; note: string }

export interface TicketBlockModel {
  homeTeam: string
  awayTeam: string
  competition: string
  venue: string | null
  whenLabel: string | null
  dateTime: string | null
  state: TicketBlockState
}

/**
 * Official destinations are intentionally empty: none could be verified against
 * an official source from the build environment (no outbound access). Add an entry
 * here, keyed by slug, only after opening the official page.
 */
const VERIFIED_LINKS: Record<string, VerifiedTicketLink> = {}

const LALIGA_JORNADA_8_SLUGS = [
  'malaga-espanyol-laliga-jornada-8-2026',
  'rayo-athletic-laliga-jornada-8-2026',
  'alaves-atletico-laliga-jornada-8-2026',
  'barcelona-getafe-laliga-jornada-8-2026',
  'real-madrid-villarreal-laliga-jornada-8-2026',
  'elche-celta-laliga-jornada-8-2026',
  'real-sociedad-deportivo-laliga-jornada-8-2026',
  'betis-osasuna-laliga-jornada-8-2026',
  'racing-valencia-laliga-jornada-8-2026',
  'levante-sevilla-laliga-jornada-8-2026',
]

function jornada8(slug: string): MatchTicketInfo | null {
  const live = liveMatchForSlug(slug)
  if (!live) return null
  return {
    slug,
    homeTeam: live.homeName,
    awayTeam: live.awayName,
    competition: 'LaLiga EA Sports, jornada 8',
    venue: live.venue,
    startsAt: live.startDate,
    status: 'scheduled',
    ticketLink: VERIFIED_LINKS[slug] ?? null,
  }
}

const OTHER_MATCHES: MatchTicketInfo[] = [
  {
    slug: 'castellon-ad-ceuta',
    homeTeam: 'CD Castellón',
    awayTeam: 'AD Ceuta',
    competition: 'LaLiga Hypermotion',
    status: 'finished',
    ticketLink: null,
  },
  {
    slug: 'girona-mallorca-laliga-hypermotion',
    homeTeam: 'Girona FC',
    awayTeam: 'RCD Mallorca',
    competition: 'LaLiga Hypermotion, jornada 8',
    venue: 'Estadi Municipal de Montilivi',
    startsAt: '2026-10-04T21:00:00+02:00',
    status: 'scheduled',
    ticketLink: null,
  },
  {
    slug: 'portugal-noruega-nations-league',
    homeTeam: 'Portugal',
    awayTeam: 'Noruega',
    competition: 'UEFA Nations League',
    venue: 'Estádio do Dragão, Porto',
    startsAt: '2026-10-04T20:45:00+02:00',
    status: 'scheduled',
    ticketLink: null,
  },
  {
    slug: 'barcelona-real-madrid-femenino-7-0',
    homeTeam: 'FC Barcelona Femení',
    awayTeam: 'Real Madrid Femenino',
    competition: 'Liga F',
    status: 'finished',
    ticketLink: null,
  },
]

const BY_SLUG = new Map<string, MatchTicketInfo>(OTHER_MATCHES.map((m) => [m.slug, m]))

/** Returns null for articles that are not about one specific match. */
export function matchTicketInfoForSlug(slug: string): MatchTicketInfo | null {
  return BY_SLUG.get(slug) ?? (LALIGA_JORNADA_8_SLUGS.includes(slug) ? jornada8(slug) : null)
}

export function isSafeOfficialUrl(url: string): boolean {
  try {
    const u = new URL(url)
    return u.protocol === 'https:' && !u.username && !u.password
  } catch {
    return false
  }
}

function formatWhen(startsAt: string): string {
  const text = new Intl.DateTimeFormat('es-ES', {
    timeZone: MATCH_TIME_ZONE,
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(startsAt))
  return `${text} (hora de Madrid)`
}

export function buildTicketBlock(info: MatchTicketInfo, now: Date = new Date()): TicketBlockModel {
  const start = info.startsAt ? new Date(info.startsAt).getTime() : null
  const validStart = start !== null && !Number.isNaN(start) ? start : null
  const base = {
    homeTeam: info.homeTeam,
    awayTeam: info.awayTeam,
    competition: info.competition,
    venue: info.venue ?? null,
    whenLabel: validStart !== null ? formatWhen(info.startsAt as string) : null,
    dateTime: validStart !== null ? (info.startsAt as string) : null,
  }
  const t = now.getTime()
  const match = `${info.homeTeam} - ${info.awayTeam}`

  if (info.status === 'cancelled') return { ...base, state: { kind: 'cancelled', label: 'Partido cancelado', note: `${match} está cancelado: no se ofrece la compra de entradas para este encuentro.` } }
  if (info.status === 'postponed') return { ...base, state: { kind: 'postponed', label: 'Partido aplazado', note: `${match} está aplazado: no se ofrece la compra de entradas hasta que haya nueva fecha oficial.` } }
  if (info.status === 'finished' || (validStart !== null && t >= validStart + MATCH_DURATION_MS)) {
    return { ...base, state: { kind: 'finished', label: 'Partido finalizado', note: `${match} ya se ha jugado: no se ofrece la compra de entradas para este encuentro.` } }
  }
  if (validStart !== null && t >= validStart) {
    return { ...base, state: { kind: 'started', label: 'Partido iniciado', note: `${match} ya ha comenzado: no se ofrece la compra de entradas para este encuentro.` } }
  }

  const link = info.ticketLink
  if (!link || !isSafeOfficialUrl(link.url)) {
    return { ...base, state: { kind: 'unavailable', label: 'Entradas no disponibles', note: 'No hemos podido verificar una página oficial de entradas para este partido.' } }
  }
  if (link.scope === 'match') {
    return { ...base, state: { kind: 'buy', href: link.url, label: 'Comprar entradas', note: `Enlace oficial de ${link.source} para ${match}.` } }
  }
  return {
    ...base,
    state: { kind: 'official-site', href: link.url, label: 'Ver entradas en la web oficial', note: `Página general de entradas de ${link.source}, no del partido concreto: la disponibilidad de ${match} se consulta allí.` },
  }
}
