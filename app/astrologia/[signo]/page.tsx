import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ASTRO_GUIDE_SLUG, DISCLAIMER, HOUSES, neighborSigns, signBySlug, SKY, WEEK_LABEL } from '@/lib/astrology'
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

export default async function SignPage({ params }: Props) {
  const sign = signBySlug((await params).signo)
  if (!sign) notFound()
  const { prev, next } = neighborSigns(sign.slug)
  const faqs = [
    {
      q: `¿El horóscopo de ${sign.name} usa el ascendente?`,
      a: 'No. Las casas se cuentan desde el signo solar, en signos enteros. Si conoces tu ascendente, la distribución de casas cambia.',
    },
    {
      q: '¿La luna nueva del 10 de octubre anuncia un suceso?',
      a: `No. Cae en Libra y, desde ${sign.name}, en la casa ${sign.newMoonHouse}: ${HOUSES[sign.newMoonHouse]}. Es una revisión, no un hecho anunciado.`,
    },
    {
      q: '¿Sirve para una decisión médica o de dinero?',
      a: 'No. No es un consejo médico, legal ni financiero. El dinero, cuando aparece, es una cifra que ya es tuya y conviene mirar.',
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
          <span aria-hidden="true">{sign.symbol} </span>Horóscopo de {sign.name}
        </h1>
        <p className="mt-2 text-sm text-slate-500">{sign.dates} · {sign.element} · {sign.modality} · Regente: {sign.ruler}</p>
        <p className="mt-4 rounded-xl border border-indigo-100 bg-indigo-50/80 p-4 text-sm leading-relaxed text-slate-600 dark:border-indigo-900 dark:bg-indigo-950/40 dark:text-slate-300">{DISCLAIMER}</p>
      </header>

      <section aria-labelledby="sign-sky" className="mt-6">
        <h2 id="sign-sky" className="text-xl font-extrabold">El cielo en tus casas</h2>
        <ul className="mt-3 space-y-2 text-sm leading-relaxed text-slate-700 dark:text-slate-300">
          <li>Luna nueva en Libra: casa {sign.newMoonHouse}, {HOUSES[sign.newMoonHouse]}.</li>
          <li>Venus retrógrada y Mercurio en Escorpio: casa {sign.venusHouse}, {HOUSES[sign.venusHouse]}.</li>
          <li>Saturno retrógrado en Aries: casa {sign.saturnHouse}, {HOUSES[sign.saturnHouse]}.</li>
          <li>Marte y Júpiter en Leo: casa {sign.marsHouse}, {HOUSES[sign.marsHouse]}.</li>
        </ul>
        <p className="mt-3 text-sm leading-relaxed text-slate-600 dark:text-slate-400">{SKY.newMoon} {SKY.venus}</p>
      </section>

      <section aria-labelledby="sign-general" className="mt-8">
        <h2 id="sign-general" className="text-xl font-extrabold">Lectura de la semana</h2>
        <p className="mt-3 leading-relaxed">{sign.general}</p>
      </section>
      <section aria-labelledby="sign-bonds" className="mt-8">
        <h2 id="sign-bonds" className="text-xl font-extrabold">Relaciones y acuerdos</h2>
        <p className="mt-3 leading-relaxed">{sign.relaciones}</p>
      </section>
      <section aria-labelledby="sign-work" className="mt-8">
        <h2 id="sign-work" className="text-xl font-extrabold">Trabajo y números propios</h2>
        <p className="mt-3 leading-relaxed">{sign.trabajo}</p>
      </section>
      <section aria-labelledby="sign-pace" className="mt-8">
        <h2 id="sign-pace" className="text-xl font-extrabold">Ritmo</h2>
        <p className="mt-3 leading-relaxed">{sign.ritmo}</p>
      </section>

      <blockquote className="mt-8 rounded-2xl border border-slate-200 bg-slate-50 p-5 dark:border-slate-800 dark:bg-slate-900">
        <p className="text-sm font-semibold uppercase tracking-wide text-indigo-700 dark:text-indigo-300">Pregunta de la semana</p>
        <p className="mt-2 text-lg font-medium leading-relaxed">{sign.pregunta}</p>
      </blockquote>

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

      <nav aria-label="Otros signos" className="mt-8 flex flex-wrap items-center justify-between gap-3 border-t border-slate-200 pt-4 text-sm dark:border-slate-800">
        <Link className="font-semibold text-indigo-700 underline decoration-indigo-300 underline-offset-4 dark:text-indigo-300" href={`/astrologia/${prev.slug}`}>{prev.symbol} {prev.name}</Link>
        <Link className="font-semibold text-indigo-700 underline decoration-indigo-300 underline-offset-4 dark:text-indigo-300" href="/astrologia">Los 12 signos</Link>
        <Link className="font-semibold text-indigo-700 underline decoration-indigo-300 underline-offset-4 dark:text-indigo-300" href={`/astrologia/${next.slug}`}>{next.name} {next.symbol}</Link>
      </nav>
      <p className="mt-4 text-sm text-slate-500">
        El método completo está en{' '}
        <Link className="font-semibold text-indigo-700 underline decoration-indigo-300 underline-offset-4 dark:text-indigo-300" href={`/articles/${ASTRO_GUIDE_SLUG}`}>cómo leemos el horóscopo</Link>.
      </p>
    </article>
  )
}
