import type { Metadata } from 'next'
import Link from 'next/link'
import AstrologyHub from '@/components/AstrologyHub'
import AstrologyLibrary from '@/components/AstrologyLibrary'
import JsonLd from '@/components/JsonLd'
import { ASTRO_GUIDE_SLUG, currentWeek, weekLastDay } from '@/lib/astrology'
import { ASTROLOGY_LIBRARY_SEO } from '@/lib/astrology-guides'
import { SITE_NAME, SITE_URL } from '@/lib/constants'
import { astrologySectionGraph } from '@/lib/structured-data'

export const runtime = 'edge'

export async function generateMetadata(): Promise<Metadata> {
  const { title, description } = ASTROLOGY_LIBRARY_SEO
  return {
    title,
    description,
    alternates: { canonical: `${SITE_URL}/astrologia` },
    robots: { index: true, follow: true },
    openGraph: { title, description, type: 'website', url: `${SITE_URL}/astrologia`, siteName: SITE_NAME, locale: 'es_ES' },
    twitter: { card: 'summary', title, description },
  }
}

export default function AstrologiaPage() {
  const week = currentWeek()
  return (
    <div className="space-y-6">
      <JsonLd data={astrologySectionGraph(week)} />
      <nav aria-label="Migas de pan" className="text-sm text-slate-500">
        <Link href="/" className="hover:text-brand-violet">Inicio</Link>
        <span aria-hidden="true"> / </span>
        <span>Astrología</span>
      </nav>
      <header className="max-w-4xl">
        <p className="text-sm font-semibold uppercase tracking-wide text-indigo-700 dark:text-indigo-300">TrendiVerse · Astrología</p>
        <h1 className="mt-2 text-3xl font-extrabold tracking-tight sm:text-4xl">Astrología: tu semana y las piezas de tu carta</h1>
        <p className="mt-3 max-w-3xl leading-relaxed text-slate-600 dark:text-slate-300">
          Lee el horóscopo semanal y aprende qué son el ascendente, el signo lunar y la carta natal. Explora eclipses y fases de la Luna con datos del cielo y lecturas simbólicas claramente separados.
        </p>
        <nav aria-label="Explora astrología" className="mt-5 flex flex-wrap gap-3 text-sm font-semibold">
          <a href="#horoscopo-semanal" className="inline-flex min-h-11 items-center rounded-lg bg-indigo-800 px-4 text-white dark:bg-indigo-200 dark:text-slate-950">Horóscopo semanal</a>
          <a href="#aprender-astrologia" className="inline-flex min-h-11 items-center rounded-lg border border-slate-300 px-4 dark:border-slate-700">Aprender astrología</a>
          <Link href="/astrologia/guias/carta-natal" className="inline-flex min-h-11 items-center px-2 text-indigo-700 underline underline-offset-4 dark:text-indigo-300">Empieza por tu carta natal</Link>
        </nav>
      </header>
      <AstrologyHub week={week} sectionPage />
      <AstrologyLibrary />
      <p className="text-sm text-slate-500">
        Si quieres saber cómo está hecho, la guía del método está en{' '}
        <Link className="font-semibold text-indigo-700 underline decoration-indigo-300 underline-offset-4 dark:text-indigo-300" href={`/articles/${ASTRO_GUIDE_SLUG}`}>
          cómo leemos el horóscopo
        </Link>
        . Los textos de esta semana valen hasta el {weekLastDay(week)}.
      </p>
    </div>
  )
}
