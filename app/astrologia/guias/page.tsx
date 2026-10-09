import type { Metadata } from 'next'
import Link from 'next/link'
import AstrologyLibrary from '@/components/AstrologyLibrary'
import JsonLd from '@/components/JsonLd'
import { DISCLAIMER } from '@/lib/astrology'
import { SITE_URL } from '@/lib/constants'
import { astrologyLibraryGraph } from '@/lib/structured-data'

export const runtime = 'edge'
export const metadata: Metadata = {
  title: 'Guías de astrología: carta natal y eclipses',
  description: 'Aprende astrología paso a paso: ascendente, signo lunar, carta natal, eclipses, fases de la Luna y Mercurio retrógrado, con referencias y límites.',
  alternates: { canonical: `${SITE_URL}/astrologia/guias` },
  openGraph: { title: 'Guías de astrología: carta natal y eclipses', type: 'website', url: `${SITE_URL}/astrologia/guias`, locale: 'es_ES' },
}

export default function AstrologyLibraryPage() {
  return (
    <div className="mx-auto max-w-5xl space-y-8">
      <JsonLd data={astrologyLibraryGraph()} />
      <nav aria-label="Migas de pan" className="text-sm text-slate-500">
        <Link href="/">Inicio</Link><span aria-hidden="true"> / </span>
        <Link href="/astrologia">Astrología</Link><span aria-hidden="true"> / </span><span>Guías</span>
      </nav>
      <header>
        <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl">Guías de astrología para entender el mapa</h1>
        <p className="mt-3 max-w-3xl leading-relaxed text-slate-600 dark:text-slate-300">
          Empieza por la carta natal y sigue con el ascendente y la Luna. Después explora fases, eclipses y movimientos aparentes, sin confundir el cielo que se calcula con lo que se interpreta.
        </p>
        <p className="mt-3 max-w-3xl text-sm leading-relaxed text-slate-500 dark:text-slate-400">{DISCLAIMER}</p>
      </header>
      <AstrologyLibrary />
      <Link href="/astrologia#horoscopo-semanal" className="inline-flex min-h-11 items-center font-semibold text-indigo-700 underline underline-offset-4 dark:text-indigo-300">Volver al horóscopo semanal de los 12 signos</Link>
    </div>
  )
}
