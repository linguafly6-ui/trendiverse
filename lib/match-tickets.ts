import { LALIGA_MATCH_SLUGS, liveMatchForSlug } from './laliga-matches'

export const MATCH_TIME_ZONE = 'Europe/Madrid'

/** Matches that began more than this long ago are shown as finished. */
const MATCH_DURATION_MS = 3 * 60 * 60 * 1000

export type MatchLifecycle = 'scheduled' | 'cancelled' | 'postponed' | 'finished'

/** Only set when an official page was opened and checked by a person. */
export interface VerifiedTicketLink {
  url: string
  /**
   * 'match' = official ticket page of this specific fixture;
   * 'match-info' = official club page with the ticket information for this fixture (sale at the box office, no online checkout);
   * 'club' = general tickets page of the home club or organiser.
   */
  scope: 'match' | 'match-info' | 'club'
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
  | { kind: 'match-info'; href: string; label: 'Ver información de entradas'; note: string }
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
 * Official destinations, keyed by article slug. Every URL was opened and checked
 * on the date in `verifiedOn`. Never add resale sites, prices or availability here.
 * - scope 'match': page of this exact fixture on the club's official ticketing.
 * - scope 'match-info': official club note with the ticket information for this fixture.
 * - scope 'club': the club's general official ticketing page (the fixture is listed there).
 */
const VERIFIED_LINKS: Record<string, VerifiedTicketLink> = {
  'malaga-espanyol-laliga-jornada-8-2026': {
    url: 'https://www.malagacf.com/partidos/temporada-2026-2027-laliga-ea-sports-8-malaga-cf-vs-rcd-espanyol-de-barcelona-2995',
    scope: 'match',
    source: 'la web oficial del Málaga CF',
    verifiedOn: '2026-10-09',
  },
  'rayo-athletic-laliga-jornada-8-2026': {
    url: 'https://www.rayovallecano.es/noticias/entradas-para-el-rayo-vallecano-athletic-club-2026',
    scope: 'match-info',
    source: 'la web oficial del Rayo Vallecano',
    verifiedOn: '2026-10-09',
  },
  'alaves-atletico-laliga-jornada-8-2026': {
    url: 'https://entradas.deportivoalaves.com/',
    scope: 'club',
    source: 'el Deportivo Alavés',
    verifiedOn: '2026-10-09',
  },
  'barcelona-getafe-laliga-jornada-8-2026': {
    url: 'https://www.fcbarcelona.es/es/entradas/futbol',
    scope: 'club',
    source: 'el FC Barcelona',
    verifiedOn: '2026-10-09',
  },
  'real-madrid-villarreal-laliga-jornada-8-2026': {
    url: 'https://www.realmadrid.com/es-ES/entradas',
    scope: 'club',
    source: 'el Real Madrid',
    verifiedOn: '2026-10-09',
  },
  'elche-celta-laliga-jornada-8-2026': {
    url: 'https://entradas.elchecf.es/',
    scope: 'club',
    source: 'el Elche CF',
    verifiedOn: '2026-10-09',
  },
  'real-sociedad-deportivo-laliga-jornada-8-2026': {
    url: 'https://ticketing.realsociedad.eus/',
    scope: 'club',
    source: 'la Real Sociedad',
    verifiedOn: '2026-10-09',
  },
  'betis-osasuna-laliga-jornada-8-2026': {
    url: 'https://www.realbetisbalompie.es/entradas/partido/24605/2027',
    scope: 'match',
    source: 'la web oficial del Real Betis',
    verifiedOn: '2026-10-09',
  },
  'racing-valencia-laliga-jornada-8-2026': {
    url: 'https://taquilla.realracingclub.es/',
    scope: 'club',
    source: 'el Real Racing Club',
    verifiedOn: '2026-10-09',
  },
  'levante-sevilla-laliga-jornada-8-2026': {
    url: 'https://ticketing.levanteud.com/es/liga-ea-sports/valencia/levante-ud-vs-sevilla-fc-1',
    scope: 'match',
    source: 'la web oficial del Levante UD',
    verifiedOn: '2026-10-09',
  },
  // Jornada 9 (16-19 de octubre de 2026)
  'deportivo-levante-laliga-jornada-9-2026': {
    url: 'https://ticketing.rcdeportivo.es/',
    scope: 'club',
    source: 'el RC Deportivo',
    verifiedOn: '2026-10-09',
  },
  'espanyol-atletico-laliga-jornada-9-2026': {
    url: 'https://tickets.rcdespanyol.com/index.php/es/?option=com_abonados&view=ticketing&layout=plano&id=227',
    scope: 'match',
    source: 'la web oficial del RCD Espanyol',
    verifiedOn: '2026-10-09',
  },
  'villarreal-elche-laliga-jornada-9-2026': {
    url: 'https://villarrealcf.es/es/venta-de-entradas/',
    scope: 'club',
    source: 'el Villarreal CF',
    verifiedOn: '2026-10-09',
  },
  'betis-barcelona-laliga-jornada-9-2026': {
    url: 'https://www.realbetisbalompie.es/entradas/partido/24614/2027',
    scope: 'match',
    source: 'la web oficial del Real Betis',
    verifiedOn: '2026-10-09',
  },
  'valencia-athletic-laliga-jornada-9-2026': {
    url: 'https://www.valenciacf.com/entradas',
    scope: 'club',
    source: 'el Valencia CF',
    verifiedOn: '2026-10-09',
  },
  'osasuna-racing-laliga-jornada-9-2026': {
    url: 'https://entradas.osasuna.es/',
    scope: 'club',
    source: 'el CA Osasuna',
    verifiedOn: '2026-10-09',
  },
  'celta-alaves-laliga-jornada-9-2026': {
    url: 'https://rccelta.es/entradas/',
    scope: 'club',
    source: 'el RC Celta',
    verifiedOn: '2026-10-09',
  },
  'malaga-real-sociedad-laliga-jornada-9-2026': {
    url: 'https://www.malagacf.com/partidos/temporada-2026-2027-laliga-ea-sports-9-malaga-cf-vs-real-sociedad-3005',
    scope: 'match',
    source: 'la web oficial del Málaga CF',
    verifiedOn: '2026-10-09',
  },
  'real-madrid-sevilla-laliga-jornada-9-2026': {
    url: 'https://www.realmadrid.com/es-ES/entradas',
    scope: 'club',
    source: 'el Real Madrid',
    verifiedOn: '2026-10-09',
  },
  'getafe-rayo-laliga-jornada-9-2026': {
    url: 'https://www.getafecf.com/entradas',
    scope: 'club',
    source: 'el Getafe CF',
    verifiedOn: '2026-10-09',
  },
}


function laliga(slug: string): MatchTicketInfo | null {
  const live = liveMatchForSlug(slug)
  if (!live) return null
  return {
    slug,
    homeTeam: live.homeName,
    awayTeam: live.awayName,
    competition: `LaLiga EA Sports, jornada ${slug.match(/jornada-(\d+)/)?.[1] ?? ''}`.trim(),
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
  return BY_SLUG.get(slug) ?? (LALIGA_MATCH_SLUGS.includes(slug) ? laliga(slug) : null)
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
  if (link.scope === 'match-info') {
    return {
      ...base,
      state: { kind: 'match-info', href: link.url, label: 'Ver información de entradas', note: `Información oficial de ${link.source} sobre las entradas de ${match}: dónde, cuándo y cómo se compran.` },
    }
  }
  return {
    ...base,
    state: { kind: 'official-site', href: link.url, label: 'Ver entradas en la web oficial', note: `Página general de entradas de ${link.source}, no del partido concreto: la disponibilidad de ${match} se consulta allí.` },
  }
}
