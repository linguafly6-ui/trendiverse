import Link from 'next/link'
import { ASTRO_GUIDE_SLUG, DISCLAIMER, SIGNS, SKY, WEEK_LABEL } from '@/lib/astrology'

export default function AstrologyHub({ variant = 'full' }: { variant?: 'full' | 'strip' }) {
  if (variant === 'strip') {
    return (
      <section aria-labelledby="astro-strip-title" className="rounded-2xl border border-indigo-100 bg-indigo-50/70 p-5 dark:border-indigo-900 dark:bg-indigo-950/30 sm:p-6">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div className="max-w-3xl">
            <p className="text-sm font-semibold uppercase tracking-wide text-indigo-700 dark:text-indigo-300">Semana del {WEEK_LABEL}</p>
            <h2 id="astro-strip-title" className="mt-1 text-2xl font-extrabold">Horóscopo de la semana</h2>
            <p className="mt-2 text-sm leading-relaxed text-slate-600 dark:text-slate-300">
              El sábado 10 hay luna nueva en Libra. Elige tu signo y lee la semana en claro.
            </p>
          </div>
          <Link href="/astrologia" className="text-sm font-semibold text-indigo-700 underline decoration-indigo-300 underline-offset-4 dark:text-indigo-300">
            Abrir la sección
          </Link>
        </div>
        <ul className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-4">
          {SIGNS.map((sign) => (
            <li key={sign.slug}>
              <Link href={`/astrologia/${sign.slug}`} className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-semibold hover:border-indigo-400 dark:border-slate-800 dark:bg-slate-900">
                <span aria-hidden="true">{sign.symbol}</span>
                {sign.name}
              </Link>
            </li>
          ))}
        </ul>
      </section>
    )
  }

  return (
    <div className="space-y-6">
      <header>
        <p className="text-sm font-semibold uppercase tracking-wide text-indigo-700 dark:text-indigo-300">Semana del {WEEK_LABEL}</p>
        <h1 className="mt-1 text-3xl font-extrabold tracking-tight sm:text-4xl">Astrología y horóscopo semanal</h1>
        <p className="mt-3 max-w-3xl leading-relaxed text-slate-600 dark:text-slate-300">
          Doce lecturas, una por signo solar, para la semana del 8 al 14 de octubre. El cielo está fechado. Cada texto dice en qué parte de tu vida cae la luna nueva, contando las casas desde tu signo.
        </p>
        <p className="mt-3 max-w-3xl text-sm leading-relaxed text-slate-500">{DISCLAIMER}</p>
      </header>

      <section aria-labelledby="astro-sky-title" className="rounded-2xl border border-indigo-100 bg-indigo-50/70 p-5 dark:border-indigo-900 dark:bg-indigo-950/30 sm:p-6">
        <h2 id="astro-sky-title" className="text-xl font-extrabold">El cielo de esta semana</h2>
        <ul className="mt-3 space-y-3 text-sm leading-relaxed text-slate-700 dark:text-slate-300">
          <li>{SKY.newMoon}</li>
          <li>{SKY.venus}</li>
          <li>{SKY.planets}</li>
          <li>{SKY.approach}</li>
        </ul>
        <p className="mt-4 text-sm">
          <a className="font-semibold text-indigo-700 underline decoration-indigo-300 underline-offset-4 dark:text-indigo-300" href={SKY.source}>
            Fases de la Luna en octubre de 2026, Time and Date
          </a>
          <span className="mx-2 text-slate-400" aria-hidden="true">·</span>
          <Link className="font-semibold text-indigo-700 underline decoration-indigo-300 underline-offset-4 dark:text-indigo-300" href={`/articles/${ASTRO_GUIDE_SLUG}`}>
            Cómo está hecho este horóscopo
          </Link>
        </p>
      </section>

      <section aria-labelledby="astro-signs-title">
        <h2 id="astro-signs-title" className="text-xl font-extrabold">Elige tu signo</h2>
        <ul className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {SIGNS.map((sign) => (
            <li key={sign.slug}>
              <Link href={`/astrologia/${sign.slug}`} className="block h-full rounded-2xl border border-slate-200 bg-white p-4 transition hover:border-indigo-400 hover:shadow-sm dark:border-slate-800 dark:bg-slate-900">
                <p className="text-xs font-semibold uppercase tracking-wide text-indigo-600 dark:text-indigo-300">{sign.element} · {sign.modality}</p>
                <h3 className="mt-1 text-lg font-bold"><span aria-hidden="true">{sign.symbol} </span>{sign.name}</h3>
                <p className="text-xs text-slate-500">{sign.dates}</p>
                <p className="mt-2 text-sm leading-relaxed text-slate-600 dark:text-slate-400">{sign.hook}</p>
              </Link>
            </li>
          ))}
        </ul>
      </section>
    </div>
  )
}
