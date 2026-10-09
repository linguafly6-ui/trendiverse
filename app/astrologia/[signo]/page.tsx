import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ASTRO_GUIDE_SLUG, DISCLAIMER, HOUSES, METHOD_NOTE, neighborSigns, signBySlug, SKY, WEEK_LABEL } from '@/lib/astrology'
import CategoryNav from '@/components/CategoryNav'
import JsonLd from '@/components/JsonLd'
import { SITE_NAME, SITE_URL } from '@/lib/constants'
import { horoscopePageGraph } from '@/lib/structured-data'

export const runtime = 'edge'

type Props = { params: Promise<{ signo: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const sign = signBySlug((await params).signo)
  if (!sign) return {}
  const url = `${SITE_URL}/astrologia/${sign.slug}`
  return {
    title: sign.seoTitle,
    description: sign.description,
    alternates: { canonical: url },
    robots: { index: true, follow: true },
    openGraph: { title: sign.seoTitle, description: sign.description, type: 'article', url, siteName: SITE_NAME, locale: 'es_ES' },
    twitter: { card: 'summary', title: sign.seoTitle, description: sign.description },
  }
}

const SECTIONS = [
  { id: 'sign-bonds', key: 'relaciones', icon: '❤️', title: 'Amor y relaciones' },
  { id: 'sign-work', key: 'trabajo', icon: '💼', title: 'Trabajo y estudios' },
  { id: 'sign-money', key: 'dinero', icon: '💰', title: 'Dinero' },
  { id: 'sign-pace', key: 'ritmo', icon: '🌿', title: 'Bienestar y tiempo para ti' },
] as const

export default async function SignPage({ params }: Props) {
  const sign = signBySlug((await params).signo)
  if (!sign) notFound()
  const { prev, next } = neighborSigns(sign.slug)
  const faqs = [
    {
      q: `¿Para quién es el horóscopo de ${sign.name}?`,
      a: `Para cualquier persona nacida entre el ${sign.dates.replace(' – ', ' y el ')}. Es una lectura general para la semana del ${WEEK_LABEL}, pensada para leerse de un tirón y sin conocimientos de astrología.`,
    },
    {
      q: '¿El horóscopo predice lo que me va a pasar?',
      a: 'No. Es una lectura para ordenar la semana y pararte a pensar en el amor, el trabajo, el dinero y tu bienestar. No anuncia sucesos ni garantiza resultados.',
    },
    {
      q: '¿Sirve para tomar una decisión médica o de dinero?',
      a: 'No. No sustituye a un médico, a un abogado ni a quien te asesora con el dinero. Si el texto habla de una cifra, es para que la mires con calma, no para decidir por ti.',
    },
  ]
  return (
    <article className="mx-auto max-w-3xl">
      <JsonLd data={horoscopePageGraph(sign, faqs)} />
      <nav aria-label="Migas de pan" className="text-sm text-slate-500">
        <Link href="/" className="hover:text-brand-violet">Inicio</Link>
        <span aria-hidden="true"> / </span>
        <Link href="/astrologia" className="hover:text-brand-violet">Astrología</Link>
        <span aria-hidden="true"> / </span>
        <span>{sign.name}</span>
      </nav>

      <div className="mt-4"><CategoryNav active="astrologia" /></div>
      <header className="mt-4">
        <p className="text-sm font-semibold uppercase tracking-wide text-indigo-700 dark:text-indigo-300">Semana del {WEEK_LABEL}</p>
        <h1 className="mt-1 text-3xl font-extrabold tracking-tight sm:text-4xl">
          <span aria-hidden="true">{sign.symbol} </span>Horóscopo semanal de {sign.name}
        </h1>
        <p className="mt-2 text-sm text-slate-500">{sign.dates} · {sign.element}</p>
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
            <li>La luna nueva del sábado cae en Libra, en tu casa {sign.newMoonHouse}: {HOUSES[sign.newMoonHouse]}.</li>
            <li>Venus retrógrada y Mercurio están en Escorpio, en tu casa {sign.venusHouse}: {HOUSES[sign.venusHouse]}.</li>
            <li>Saturno retrógrado está en Aries, en tu casa {sign.saturnHouse}: {HOUSES[sign.saturnHouse]}.</li>
            <li>Marte y Júpiter están en Leo, en tu casa {sign.marsHouse}: {HOUSES[sign.marsHouse]}.</li>
          </ul>
          <p className="text-slate-600 dark:text-slate-400">{SKY.newMoon} {SKY.venus}</p>
          <p>
            El método completo está en{' '}
            <Link className="font-semibold text-indigo-700 underline decoration-indigo-300 underline-offset-4 dark:text-indigo-300" href={`/articles/${ASTRO_GUIDE_SLUG}`}>cómo leemos el horóscopo</Link>.
          </p>
        </div>
      </details>

      <nav aria-label="Otros signos" className="mt-8 flex flex-wrap items-center justify-between gap-3 border-t border-slate-200 pt-4 text-sm dark:border-slate-800">
        <Link className="font-semibold text-indigo-700 underline decoration-indigo-300 underline-offset-4 dark:text-indigo-300" href={`/astrologia/${prev.slug}`}>{prev.symbol} {prev.name}</Link>
        <Link className="font-semibold text-indigo-700 underline decoration-indigo-300 underline-offset-4 dark:text-indigo-300" href="/astrologia">Los 12 signos</Link>
        <Link className="font-semibold text-indigo-700 underline decoration-indigo-300 underline-offset-4 dark:text-indigo-300" href={`/astrologia/${next.slug}`}>{next.name} {next.symbol}</Link>
      </nav>
    </article>
  )
}
