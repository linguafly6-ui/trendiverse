import Link from 'next/link'
import JsonLd from '@/components/JsonLd'
import CategoryNav from '@/components/CategoryNav'
import AstrologyLibrary from '@/components/AstrologyLibrary'
import {
  ASTRO_GUIDE_SLUG,
  DISCLAIMER,
  METHOD_NOTE,
  neighborSigns,
  nextWeek,
  previousWeek,
  signHeading,
  signTransitNotes,
  weekFirstDay,
  weekLastDay,
  type HoroscopeWeek,
  type SignReading,
} from '@/lib/astrology'
import { horoscopePageGraph } from '@/lib/structured-data'

const SECTIONS = [
  { id: 'sign-bonds', key: 'relaciones', icon: '❤️', title: 'Amor y relaciones' },
  { id: 'sign-work', key: 'trabajo', icon: '💼', title: 'Trabajo y estudios' },
  { id: 'sign-money', key: 'dinero', icon: '💰', title: 'Dinero' },
  { id: 'sign-pace', key: 'ritmo', icon: '🌿', title: 'Bienestar y tiempo para ti' },
] as const

const link = 'font-semibold text-indigo-700 underline decoration-indigo-300 underline-offset-4 dark:text-indigo-300'

/** Ruta de la lectura de un signo: la semana en curso sin fecha, las demás con ella. */
export function signPath(sign: SignReading, week: HoroscopeWeek, isCurrent: boolean): string {
  return isCurrent ? `/astrologia/${sign.slug}` : `/astrologia/${sign.slug}/${week.slug}`
}

export function weekPath(week: HoroscopeWeek, isCurrent: boolean): string {
  return isCurrent ? '/astrologia' : `/astrologia/semana/${week.slug}`
}

export function signFaqs(week: HoroscopeWeek, sign: SignReading) {
  const year = week.start.slice(0, 4)
  return [
    {
      q: `¿Qué días cubre el horóscopo de ${sign.name} del ${week.shortLabel}?`,
      a: `Los siete días de la semana: ${week.days}. Si buscas el horóscopo de ${sign.name} de uno de esos días, esta es la lectura que lo recoge.`,
    },
    {
      q: `¿Para quién es el horóscopo de ${sign.name}?`,
      a: `Para cualquier persona nacida entre el ${sign.dates.replace(' – ', ' y el ')}. Es una lectura general para la semana del ${week.label}, pensada para leerse de un tirón y sin conocimientos de astrología.`,
    },
    {
      q: '¿El horóscopo predice lo que me va a pasar?',
      a: 'No. Es una lectura para ordenar la semana y pararte a pensar en el amor, el trabajo, el dinero y tu bienestar. No anuncia sucesos ni garantiza resultados.',
    },
    {
      q: '¿Sirve para tomar una decisión médica o de dinero?',
      a: 'No. No sustituye a un médico, a un abogado ni a quien te asesora con el dinero. Si el texto habla de una cifra, es para que la mires con calma, no para decidir por ti.',
    },
    {
      q: `¿Cuándo sale el horóscopo de ${sign.name} de la semana siguiente?`,
      a: `Publicamos cada semana antes de que empiece, en esta misma sección. El horóscopo de ${sign.name} de la semana siguiente se enlaza al final de esta página en cuanto está listo, y la portada de astrología muestra siempre la semana en curso de ${year}.`,
    },
  ]
}

export default function SignReadingView({ week, sign, isCurrent }: { week: HoroscopeWeek; sign: SignReading; isCurrent: boolean }) {
  const { prev, next } = neighborSigns(week, sign.slug)
  const faqs = signFaqs(week, sign)
  const before = previousWeek(week)
  const after = nextWeek(week)
  const notes = signTransitNotes(week, sign)
  const firstDay = weekFirstDay(week)
  const lastDay = weekLastDay(week)

  return (
    <article className="mx-auto max-w-3xl">
      <JsonLd data={horoscopePageGraph(week, sign, faqs, !isCurrent)} />
      <nav aria-label="Migas de pan" className="text-sm text-slate-500">
        <Link href="/" className="hover:text-brand-violet">Inicio</Link>
        <span aria-hidden="true"> / </span>
        <Link href="/astrologia" className="hover:text-brand-violet">Astrología</Link>
        {isCurrent ? null : (
          <>
            <span aria-hidden="true"> / </span>
            <Link href={weekPath(week, false)} className="hover:text-brand-violet">Semana del {week.shortLabel}</Link>
          </>
        )}
        <span aria-hidden="true"> / </span>
        <span>{sign.name}</span>
      </nav>

      <div className="mt-4"><CategoryNav active="astrologia" /></div>
      <header className="mt-4">
        <p className="text-sm font-semibold uppercase tracking-wide text-indigo-700 dark:text-indigo-300">
          {isCurrent ? 'Horóscopo semanal · semana en curso' : 'Horóscopo semanal'}
        </p>
        <h1 className="mt-1 text-3xl font-extrabold tracking-tight sm:text-4xl">
          <span aria-hidden="true">{sign.symbol} </span>{signHeading(week, sign)}
        </h1>
        <p className="mt-2 text-sm text-slate-500">{sign.dates} · {sign.element}</p>
        <p className="mt-3 leading-relaxed text-slate-600 dark:text-slate-300">
          Horóscopo de {sign.name} para la semana del {firstDay} al {lastDay}: amor, trabajo, dinero y bienestar, con un consejo. Vale para cualquier día de esa semana.
        </p>
      </header>

      <section aria-labelledby="sign-general" className="mt-8">
        <h2 id="sign-general" className="text-2xl font-extrabold">{sign.titulo}</h2>
        <p className="mt-3 text-lg leading-relaxed">{sign.general}</p>
      </section>

      {SECTIONS.map((section) => (
        <section key={section.id} aria-labelledby={section.id} className="mt-8">
          <h2 id={section.id} className="text-xl font-extrabold">
            <span aria-hidden="true">{section.icon} </span>{section.title}
          </h2>
          <p className="mt-3 leading-relaxed">{sign[section.key]}</p>
        </section>
      ))}

      <blockquote className="mt-8 rounded-2xl border border-indigo-100 bg-indigo-50/80 p-5 dark:border-indigo-900 dark:bg-indigo-950/40">
        <p className="text-sm font-semibold uppercase tracking-wide text-indigo-700 dark:text-indigo-300"><span aria-hidden="true">✨ </span>Tu consejo de la semana</p>
        <p className="mt-2 text-lg font-medium leading-relaxed">{sign.consejo}</p>
      </blockquote>

      <p className="mt-6 text-sm leading-relaxed text-slate-500">{DISCLAIMER}</p>

      <nav aria-label="Otras semanas de este signo" className="mt-6 flex flex-wrap gap-x-4 gap-y-2 text-sm">
        {before ? <Link className={link} href={`/astrologia/${sign.slug}/${before.slug}`}>← Horóscopo de {sign.name} del {before.shortLabel}</Link> : null}
        {after ? <Link className={link} href={`/astrologia/${sign.slug}/${after.slug}`}>Horóscopo de {sign.name} del {after.shortLabel} →</Link> : null}
      </nav>

      <section aria-labelledby="sign-faq" className="mt-8">
        <h2 id="sign-faq" className="text-xl font-extrabold">Preguntas frecuentes</h2>
        <div className="mt-3 space-y-4">
          {faqs.map((item) => (
            <div key={item.q}>
              <h3 className="font-bold">{item.q}</h3>
              <p className="mt-1 leading-relaxed text-slate-700 dark:text-slate-300">{item.a}</p>
            </div>
          ))}
        </div>
      </section>

      <details className="mt-8 rounded-2xl border border-slate-200 bg-slate-50 p-5 dark:border-slate-800 dark:bg-slate-900">
        <summary className="cursor-pointer font-bold">¿Quieres saber cómo está hecha esta lectura?</summary>
        <div className="mt-3 space-y-3 text-sm leading-relaxed text-slate-700 dark:text-slate-300">
          <p>{METHOD_NOTE} Regente de {sign.name}: {sign.ruler}. Modalidad: {sign.modality}.</p>
          <ul className="list-disc space-y-1 pl-5">
            {notes.map((note) => <li key={note}>{note}</li>)}
          </ul>
          <p className="text-slate-600 dark:text-slate-400">{week.sky.items.slice(0, 2).join(' ')}</p>
          <p>
            El método completo está en{' '}
            <Link className={link} href={`/articles/${ASTRO_GUIDE_SLUG}`}>cómo leemos el horóscopo</Link>.
          </p>
        </div>
      </details>

      <AstrologyLibrary compact />
      <nav aria-label="Otros signos" className="mt-8 flex flex-wrap items-center justify-between gap-3 border-t border-slate-200 pt-4 text-sm dark:border-slate-800">
        <Link className={link} href={signPath(prev, week, isCurrent)}>{prev.symbol} {prev.name}</Link>
        <Link className={link} href={weekPath(week, isCurrent)}>Los 12 signos, {week.shortLabel}</Link>
        <Link className={link} href={signPath(next, week, isCurrent)}>{next.name} {next.symbol}</Link>
      </nav>
    </article>
  )
}
