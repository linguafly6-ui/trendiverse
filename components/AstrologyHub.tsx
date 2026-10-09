import Link from 'next/link'
import { signPath } from '@/components/SignReadingView'
import { ASTRO_GUIDE_SLUG, currentWeek, DISCLAIMER, METHOD_NOTE, WEEKS, type HoroscopeWeek } from '@/lib/astrology'

const link = 'font-semibold text-indigo-700 underline decoration-indigo-300 underline-offset-4 dark:text-indigo-300'

export default function AstrologyHub({ variant = 'full', week: givenWeek }: { variant?: 'full' | 'strip'; week?: HoroscopeWeek }) {
  const current = currentWeek()
  const week = givenWeek ?? current
  const isCurrent = week.id === current.id
  const year = week.start.slice(0, 4)

  if (variant === 'strip') {
    return (
      <section aria-labelledby="astro-strip-title" className="rounded-2xl border border-indigo-100 bg-indigo-50/70 p-5 dark:border-indigo-900 dark:bg-indigo-950/30 sm:p-6">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div className="max-w-3xl">
            <p className="text-sm font-semibold uppercase tracking-wide text-indigo-700 dark:text-indigo-300">Semana del {week.label}</p>
            <h2 id="astro-strip-title" className="mt-1 text-2xl font-extrabold">Horóscopo semanal del {week.shortLabel}</h2>
            <p className="mt-2 text-sm leading-relaxed text-slate-600 dark:text-slate-300">
              Elige tu signo y lee tu semana en claro: amor, trabajo, dinero y bienestar, con un consejo para estos días.
            </p>
          </div>
          <Link href="/astrologia" className={`text-sm ${link}`}>
            Abrir la sección
          </Link>
        </div>
        <ul className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-4">
          {week.signs.map((sign) => (
            <li key={sign.slug}>
              <Link href={signPath(sign, week, isCurrent)} className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-semibold hover:border-indigo-400 dark:border-slate-800 dark:bg-slate-900">
                <span aria-hidden="true">{sign.symbol}</span>
                Horóscopo {sign.name}
              </Link>
            </li>
          ))}
        </ul>
      </section>
    )
  }

  const otherWeeks = WEEKS.filter((candidate) => candidate.id !== week.id)

  return (
    <div className="space-y-6">
      <header>
        <p className="text-sm font-semibold uppercase tracking-wide text-indigo-700 dark:text-indigo-300">
          {isCurrent ? 'Semana en curso' : 'Horóscopo semanal'}
        </p>
        <h1 className="mt-1 text-3xl font-extrabold tracking-tight sm:text-4xl">Horóscopo semanal del {week.label}</h1>
        <p className="mt-3 max-w-3xl leading-relaxed text-slate-600 dark:text-slate-300">
          Doce horóscopos, uno por signo, para la semana del {week.days.split(', ')[0]} al {week.days.split(', ').pop()?.replace(/^y /, '')}. Cada uno te cuenta cómo viene la semana en el amor, el trabajo, el dinero y tu bienestar, y termina con un consejo. Sin tecnicismos: si quieres saber cómo están hechos, lo explicamos al final.
        </p>
        <p className="mt-3 max-w-3xl text-sm leading-relaxed text-slate-500">{DISCLAIMER}</p>
      </header>

      <section aria-labelledby="astro-signs-title">
        <h2 id="astro-signs-title" className="text-xl font-extrabold">Elige tu signo</h2>
        <ul className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {week.signs.map((sign) => (
            <li key={sign.slug}>
              <Link href={signPath(sign, week, isCurrent)} className="block h-full rounded-2xl border border-slate-200 bg-white p-4 transition hover:border-indigo-400 hover:shadow-sm dark:border-slate-800 dark:bg-slate-900">
                <p className="text-xs font-semibold uppercase tracking-wide text-indigo-600 dark:text-indigo-300">{sign.element}</p>
                <h3 className="mt-1 text-lg font-bold"><span aria-hidden="true">{sign.symbol} </span>Horóscopo {sign.name} {week.shortLabel}</h3>
                <p className="text-xs text-slate-500">{sign.dates}</p>
                <p className="mt-2 text-sm leading-relaxed text-slate-600 dark:text-slate-400">{sign.hook}</p>
              </Link>
            </li>
          ))}
        </ul>
      </section>

      {otherWeeks.length ? (
        <section aria-labelledby="astro-weeks-title">
          <h2 id="astro-weeks-title" className="text-xl font-extrabold">Otras semanas</h2>
          <ul className="mt-3 flex flex-wrap gap-3 text-sm">
            {otherWeeks.map((candidate) => (
              <li key={candidate.id}>
                <Link className={link} href={candidate.id === current.id ? '/astrologia' : `/astrologia/semana/${candidate.slug}`}>
                  Horóscopo semanal del {candidate.shortLabel} de {candidate.start.slice(0, 4)}
                  {candidate.id === current.id ? ' (semana en curso)' : candidate.start > current.start ? ' (semana siguiente)' : ''}
                </Link>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      <details className="rounded-2xl border border-indigo-100 bg-indigo-50/70 p-5 dark:border-indigo-900 dark:bg-indigo-950/30 sm:p-6">
        <summary className="cursor-pointer text-lg font-extrabold">¿Cómo está hecho este horóscopo?</summary>
        <p className="mt-3 text-sm leading-relaxed text-slate-700 dark:text-slate-300">{METHOD_NOTE}</p>
        <h3 className="mt-4 font-bold">El cielo de la semana del {week.shortLabel} de {year}</h3>
        <ul className="mt-2 space-y-3 text-sm leading-relaxed text-slate-700 dark:text-slate-300">
          {week.sky.items.map((item) => <li key={item}>{item}</li>)}
        </ul>
        <p className="mt-4 text-sm">
          <a className={link} href={week.sky.sourceUrl}>{week.sky.sourceName}</a>
          <span className="mx-2 text-slate-400" aria-hidden="true">·</span>
          <Link className={link} href={`/articles/${ASTRO_GUIDE_SLUG}`}>Guía completa del método</Link>
        </p>
      </details>
    </div>
  )
}
