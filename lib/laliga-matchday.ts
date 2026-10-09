import type { Article } from './types'

/**
 * Plantilla compartida de las previas de LaLiga (una página por partido).
 * Cada jornada aporta su clasificación, sus partidos y los textos de contexto;
 * aquí vive la estructura común del artículo, el marcador y los enlaces.
 */

export interface Side {
  name: string
  pos: number
  pj: number
  pg: number
  pe: number
  pp: number
  gf: number
  gc: number
  pts: number
  form: string
}

export interface Fixture {
  id: number
  slug: string
  home: Side
  away: Side
  espnHome: string
  espnAway: string
  date: string
  dayLabel: string
  hour: string
  tv: string
  venue: string
  published_at: string
  seoTitle: string
  seoDescription: string
  excerpt: string
  /** Una o dos frases humanas que presentan el partido. */
  lead: string
  /** Narrativa de qué se juegan los dos equipos. */
  essay: string
  neighbors: string
}

export interface MatchdayConfig {
  /** Número de la jornada que se juega. */
  jornada: number
  /** Jornada tras la que está tomada la clasificación. */
  tableAfterJornada: number
  /** Partidos jugados por casi toda la Liga en esa clasificación. */
  usualGames: number
  /** Frase que se usa cuando los dos equipos han jugado los mismos partidos que casi toda la Liga. */
  evenGamesLine: string
  /** Párrafo que sitúa la clasificación general. */
  standingsSummary: string
  /** Párrafo con el calendario completo de la jornada. */
  calendarText: string
  /** Primera frase del bloque «Si gana, empata o pierde». */
  pointsIntro: string
  /** Aviso opcional cuando la clasificación puede cambiar antes del partido. */
  pendingNote?: string
  fixtures: Fixture[]
}

export interface LiveFixtureRef {
  league: 'esp.1'
  espnHome: string
  espnAway: string
  date: string
  kickoffLabel: string
  startDate: string
  venue: string
  homeName: string
  awayName: string
}

export interface Matchday {
  articles: Article[]
  slugs: string[]
  seo: Record<string, { title: string; description: string }>
  related: Record<string, string[]>
  liveMatchForSlug: (slug: string) => LiveFixtureRef | null
}

function gd(side: Side): string {
  const diff = side.gf - side.gc
  if (diff > 0) return `+${diff}`
  return String(diff)
}

function ordinal(pos: number, fem = false): string {
  const words: Record<number, string> = {
    1: 'primero', 2: 'segundo', 3: 'tercero', 4: 'cuarto', 5: 'quinto', 6: 'sexto', 7: 'séptimo', 8: 'octavo', 9: 'noveno', 10: 'décimo',
    11: 'undécimo', 12: 'duodécimo', 13: 'decimotercero', 14: 'decimocuarto', 15: 'decimoquinto', 16: 'decimosexto', 17: 'decimoséptimo',
    18: 'decimoctavo', 19: 'penúltimo', 20: 'último',
  }
  const word = words[pos] ?? `${pos}.º`
  return fem ? word.replace(/o$/, 'a') : word
}

function isFem(name: string): boolean {
  return name === 'Real Sociedad'
}

/** «el Rayo Vallecano», «la Real Sociedad». */
function el(name: string): string {
  return `${isFem(name) ? 'la' : 'el'} ${name}`
}

function cap(text: string): string {
  return text.charAt(0).toUpperCase() + text.slice(1)
}

/** Estadios que se nombran sin artículo: «en Mendizorrotza», «en Mestalla». */
const BARE_VENUES = new Set(['Mendizorrotza', 'Mestalla', 'Balaídos', 'Riazor'])

/** «en el Estadio de Vallecas», «en La Rosaleda», «en Mendizorrotza». */
function enVenue(venue: string): string {
  if (/^(La|El) /.test(venue) || BARE_VENUES.has(venue)) return `en ${venue}`
  return `en el ${venue}`
}

function plural(n: number, one: string, many: string): string {
  return `${n} ${n === 1 ? one : many}`
}

const GAMES_WORDS: Record<number, string> = { 5: 'cinco', 6: 'seis', 7: 'siete', 8: 'ocho', 9: 'nueve', 10: 'diez', 11: 'once', 12: 'doce' }

function portrait(side: Side): string {
  const games = `${GAMES_WORDS[side.pj] ?? side.pj} partidos`
  return `${cap(el(side.name))} va ${ordinal(side.pos, isFem(side.name))}, con ${side.pts} puntos en ${games}: ${plural(side.pg, 'victoria', 'victorias')}, ${plural(side.pe, 'empate', 'empates')} y ${plural(side.pp, 'derrota', 'derrotas')}. Ha marcado ${side.gf} goles y ha encajado ${side.gc} (diferencia ${gd(side)}).`
}

function formSummary(side: Side): string {
  const tokens = side.form.split(/\s+/)
  const g = tokens.filter((t) => t === 'G').length
  const e = tokens.filter((t) => t === 'E').length
  const p = tokens.filter((t) => t === 'P').length
  if (g === tokens.length) return `Sus últimos ${tokens.length} partidos han sido todos victorias.`
  if (p === tokens.length) return `Sus últimos ${tokens.length} partidos han sido todos derrotas.`
  return `En sus últimos ${tokens.length} partidos ha sumado ${plural(g, 'victoria', 'victorias')}, ${plural(e, 'empate', 'empates')} y ${plural(p, 'derrota', 'derrotas')}.`
}

function articleContent(cfg: MatchdayConfig, fx: Fixture): string {
  const h = fx.home
  const a = fx.away
  const hand = [h, a].filter((s) => s.pj < cfg.usualGames).map((s) => s.name)
  const handLine = hand.length
    ? `Un detalle a tener en cuenta: ${hand.map(el).join(' y ')} ${hand.length > 1 ? 'llegan' : 'llega'} con un partido menos que casi toda la Liga, así que sus números hay que leerlos con esa pequeña diferencia.`
    : cfg.evenGamesLine
  const pending = cfg.pendingNote ? ` ${cfg.pendingNote}` : ''
  const openTv = fx.tv.includes('abierto')
    ? ' Y una buena noticia: es el único partido de la jornada que se emite en abierto.'
    : ''

  return `${cap(el(h.name))} y ${el(a.name)} se ven las caras el ${fx.dayLabel} a las ${fx.hour} ${enVenue(fx.venue)}. ${fx.lead} Aquí te contamos cómo llegan los dos equipos, qué se juegan y cómo seguir el marcador en directo sin complicaciones.

## Cuándo y dónde se juega

El partido es el ${fx.dayLabel} a las ${fx.hour}, hora peninsular, ${enVenue(fx.venue)}. Se puede ver en ${fx.tv}.${openTv} ${fx.neighbors} Si el club anunciara algún cambio de sede o de horario a última hora, manda ese aviso oficial.

## Cómo llegan los dos equipos

${portrait(h)} ${formSummary(h)}

${portrait(a)} ${formSummary(a)}

${handLine}${pending}

${cfg.standingsSummary}

## Qué se juegan

${fx.essay}

## Si gana, empata o pierde

${cfg.pointsIntro} Si gana ${el(h.name)}, pasa de ${h.pts} a ${h.pts + 3} puntos y ${el(a.name)} se queda en ${a.pts}. Si empatan, los dos suman uno: ${h.pts + 1} para ${el(h.name)} y ${a.pts + 1} para ${el(a.name)}. Si gana ${el(a.name)}, se va a ${a.pts + 3} y ${el(h.name)} se queda en ${h.pts}.

Eso sí: el resto de partidos de la jornada también mueven la tabla, así que el lunes por la noche la foto puede ser distinta.

## El resto de la jornada

${cfg.calendarText} Cada partido tiene su propia página con marcador.

## Cómo funciona el marcador en directo

Arriba tienes el marcador del partido. Hasta que empiece, verás un 0-0 que no significa nada: simplemente, el partido todavía no se ha jugado. El ${fx.dayLabel}, el marcador se actualiza solo cada pocos segundos con los goles y el minuto de juego. Cuando termine, se queda el resultado final. Si en algún momento falla la conexión, verás el último dato que llegó. Aquí no encontrarás alineaciones, cambios ni tarjetas: solo el resultado, claro y al momento.

## Preguntas frecuentes

### ¿A qué hora juegan ${el(h.name)} y ${el(a.name)}?

El ${fx.dayLabel}, a las ${fx.hour}, hora peninsular.

### ¿Dónde se juega y dónde se puede ver?

${cap(enVenue(fx.venue))}. En televisión, en ${fx.tv}.${fx.tv.includes('abierto') ? ' Es el único partido de la jornada en abierto.' : ''}

### ¿Cómo llegan los dos equipos?

${cap(el(h.name))} es ${ordinal(h.pos, isFem(h.name))} con ${h.pts} puntos y ${el(a.name)} es ${ordinal(a.pos, isFem(a.name))} con ${a.pts}. Son los datos de la clasificación tras la jornada ${cfg.tableAfterJornada}.${pending}

### ¿Qué pasa con los puntos según el resultado?

Si gana ${el(h.name)}, llega a ${h.pts + 3}. Si empatan, ${el(h.name)} se queda en ${h.pts + 1} y ${el(a.name)} en ${a.pts + 1}. Si gana ${el(a.name)}, llega a ${a.pts + 3}.

### ¿El 0-0 del marcador es el resultado?

Antes del partido, no: solo indica que todavía no ha empezado. El 0-0 cuenta como resultado cuando el partido está en juego o ya ha terminado.

## En resumen

${cap(el(h.name))} y ${el(a.name)} juegan el ${fx.dayLabel} a las ${fx.hour} ${enVenue(fx.venue)}. ${isFem(h.name) ? 'Una' : 'Uno'} llega ${ordinal(h.pos, isFem(h.name))}, con ${h.pts} puntos; ${isFem(a.name) ? 'la otra' : 'el otro'}, ${ordinal(a.pos, isFem(a.name))}, con ${a.pts}. Si solo puedes seguir el partido de reojo, el marcador de arriba te lo cuenta en directo.`
}

function excerptOk(text: string): string {
  if (text.length > 200) throw new Error(`excerpt ${text.length}: ${text}`)
  return text
}

export function buildMatchday(cfg: MatchdayConfig): Matchday {
  const fixtures = cfg.fixtures
  const articles: Article[] = fixtures.map((fx) => ({
    id: fx.id,
    category: 'deportes',
    title: `${fx.home.name}-${fx.away.name}: horario, previa y marcador en vivo de LaLiga`,
    slug: fx.slug,
    excerpt: excerptOk(fx.excerpt),
    image_url: `/images/articles/${fx.slug}.svg`,
    thumbnail_url: `/images/articles/${fx.slug}-thumb.svg`,
    read_time_minutes: 11,
    views: 0,
    trending: 1,
    published_at: fx.published_at,
    content: articleContent(cfg, fx),
  }))

  const live = new Map<string, LiveFixtureRef>(fixtures.map((fx) => [fx.slug, {
    league: 'esp.1',
    espnHome: fx.espnHome,
    espnAway: fx.espnAway,
    date: fx.date,
    kickoffLabel: `${fx.dayLabel}, ${fx.hour} hora peninsular`,
    startDate: `${fx.date.slice(0, 4)}-${fx.date.slice(4, 6)}-${fx.date.slice(6, 8)}T${fx.hour}:00+02:00`,
    venue: fx.venue,
    homeName: fx.home.name,
    awayName: fx.away.name,
  }]))

  const seo: Matchday['seo'] = Object.fromEntries(fixtures.map((fx) => [fx.slug, { title: fx.seoTitle, description: fx.seoDescription }]))

  const bySlug = new Map(fixtures.map((fx) => [fx.slug, fx]))
  const related: Matchday['related'] = Object.fromEntries(fixtures.map((fx) => {
    const others = fixtures.filter((o) => o.slug !== fx.slug)
    const picks = [others[0], others[4], others[others.length - 1]].filter((o, i, arr) => o && arr.findIndex((x) => x.slug === o.slug) === i && o.slug !== fx.slug).slice(0, 3)
    const fallback = others.filter((o) => !picks.includes(o)).slice(0, 3 - picks.length)
    const links = [...picks, ...fallback].slice(0, 3).map((o) => {
      const match = bySlug.get(o.slug)!
      return `[${match.home.name}-${match.away.name}, ${match.dayLabel}](/articles/${match.slug}): horario y marcador de ese partido de la jornada ${cfg.jornada}.`
    })
    return [fx.slug, links]
  }))

  return {
    articles,
    slugs: fixtures.map((fx) => fx.slug),
    seo,
    related,
    liveMatchForSlug: (slug: string) => live.get(slug) ?? null,
  }
}
