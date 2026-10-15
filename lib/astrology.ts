/**
 * Horóscopo semanal de TrendiVerse: punto de entrada.
 * El núcleo (tipos, casas, signos, textos fijos) vive en lib/horoscopo/core.ts y cada semana
 * en su propio archivo lib/horoscopo/semana-AAAA-MM-DD.ts. Para publicar una semana nueva,
 * crea su archivo y añádela a WEEKS.
 */
export * from './horoscopo/core'
import type { HoroscopeWeek, SignReading } from './horoscopo/core'
import { HOUSES, solarHouse } from './horoscopo/core'
import { SEMANA_2026_10_08 } from './horoscopo/semana-2026-10-08'
import { SEMANA_2026_10_15 } from './horoscopo/semana-2026-10-15'
import { SEMANA_2026_10_22 } from './horoscopo/semana-2026-10-22'
import { SEMANA_2026_10_29 } from './horoscopo/semana-2026-10-29'

/** Todas las semanas publicadas, de la más antigua a la más reciente. */
export const WEEKS: HoroscopeWeek[] = [SEMANA_2026_10_08, SEMANA_2026_10_15, SEMANA_2026_10_22, SEMANA_2026_10_29].sort((a, b) => a.start.localeCompare(b.start))

/** Fecha de hoy en Madrid, en formato YYYY-MM-DD. */
export function todayInMadrid(now: Date = new Date()): string {
  return new Intl.DateTimeFormat('en-CA', { timeZone: 'Europe/Madrid', year: 'numeric', month: '2-digit', day: '2-digit' }).format(now)
}

/** La semana en curso: la última que ya ha empezado. Antes de la primera, la primera. */
export function currentWeek(now: Date = new Date()): HoroscopeWeek {
  const today = todayInMadrid(now)
  const started = WEEKS.filter((week) => week.start <= today)
  return started[started.length - 1] ?? WEEKS[0]
}

/** La semana publicada que empieza después de la indicada, si existe. */
export function nextWeek(week: HoroscopeWeek): HoroscopeWeek | undefined {
  return WEEKS.find((candidate) => candidate.start > week.start)
}

export function previousWeek(week: HoroscopeWeek): HoroscopeWeek | undefined {
  return [...WEEKS].reverse().find((candidate) => candidate.start < week.start)
}

export function weekFirstDay(week: HoroscopeWeek): string {
  return week.days.split(', ')[0]
}

export function weekLastDay(week: HoroscopeWeek): string {
  return week.days.split(' y ').pop()!
}

export function weekBySlug(slug: string): HoroscopeWeek | undefined {
  return WEEKS.find((week) => week.slug === slug)
}

export function signBySlug(week: HoroscopeWeek, slug: string): SignReading | undefined {
  return week.signs.find((sign) => sign.slug === slug)
}

export function neighborSigns(week: HoroscopeWeek, slug: string): { prev: SignReading; next: SignReading } {
  const index = week.signs.findIndex((sign) => sign.slug === slug)
  return {
    prev: week.signs[(index + week.signs.length - 1) % week.signs.length],
    next: week.signs[(index + 1) % week.signs.length],
  }
}

/** Notas técnicas de la semana para un signo: cada tránsito con su casa solar. */
export function signTransitNotes(week: HoroscopeWeek, sign: SignReading): string[] {
  return week.transits.map((transit) => {
    const house = solarHouse(sign.slug, transit.sign)
    return `${transit.label}, en tu casa ${house}: ${HOUSES[house]}.`
  })
}

/** Título SEO: «Horóscopo Aries 15 al 21 de octubre 2026». */
export function signSeoTitle(week: HoroscopeWeek, sign: SignReading): string {
  return `Horóscopo ${sign.name} ${week.shortLabel} ${week.start.slice(0, 4)}`
}

export function signSeoDescription(week: HoroscopeWeek, sign: SignReading): string {
  return `Horóscopo de ${sign.name} del ${week.label}, fácil de leer: amor, trabajo, dinero y bienestar, con un consejo para la semana.`
}

/** H1 de la lectura de un signo. */
export function signHeading(week: HoroscopeWeek, sign: SignReading): string {
  return `Horóscopo de ${sign.name} del ${week.label}`
}

export function weekSeo(week: HoroscopeWeek): { title: string; description: string } {
  return {
    title: `Horóscopo semanal ${week.shortLabel} ${week.start.slice(0, 4)}`,
    description: `Horóscopo semanal del ${week.label}, fácil de leer: amor, trabajo, dinero y bienestar para los 12 signos, con un consejo.`,
  }
}
