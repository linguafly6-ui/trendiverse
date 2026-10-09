import { JORNADA_8_SLUGS, liveMatchForSlug as liveJ8 } from './laliga-jornada-8-2026'
import { JORNADA_9_SLUGS, liveMatchForSlugJ9 } from './laliga-jornada-9-2026'
import type { LiveFixtureRef } from './laliga-matchday'

export type { LiveFixtureRef } from './laliga-matchday'

/** Todos los artículos de partido de LaLiga con marcador en directo, de todas las jornadas publicadas. */
export const LALIGA_MATCH_SLUGS: string[] = [...JORNADA_8_SLUGS, ...JORNADA_9_SLUGS]

/** Datos del partido (equipos en ESPN, fecha, sede) para el marcador y los datos estructurados. */
export function liveMatchForSlug(slug: string): LiveFixtureRef | null {
  return liveJ8(slug) ?? liveMatchForSlugJ9(slug)
}
