import type { Metadata } from 'next'
import Link from 'next/link'
import AstrologyHub from '@/components/AstrologyHub'
import CategoryNav from '@/components/CategoryNav'
import JsonLd from '@/components/JsonLd'
import { ASTRO_GUIDE_SLUG, SIGNS } from '@/lib/astrology'
import { SITE_NAME, SITE_URL } from '@/lib/constants'
import { astrologySectionGraph } from '@/lib/structured-data'

export const runtime = 'edge'

const title = 'Horóscopo semanal: los 12 signos'
const description = 'Horóscopo semanal del 8 al 14 de octubre de 2026, fácil de leer: amor, trabajo, dinero y bienestar para los 12 signos, con un consejo.'

export const metadata: Metadata = {
  title,
  description,
  alternates: { canonical: `${SITE_URL}/astrologia` },
  robots: { index: true, follow: true },
  openGraph: { title, description, type: 'website', url: `${SITE_URL}/astrologia`, siteName: SITE_NAME, locale: 'es_ES' },
  twitter: { card: 'summary', title, description },
}

export default function AstrologiaPage() {
  return (
    <div className="space-y-6">
      <JsonLd data={astrologySectionGraph(SIGNS)} />
      <nav aria-label="Migas de pan" className="text-sm text-slate-500">
        <Link href="/" className="hover:text-brand-violet">Inicio</Link>
        <span aria-hidden="true"> / </span>
        <span>Astrología</span>
      </nav>
      <CategoryNav active="astrologia" />
      <AstrologyHub />
      <p className="text-sm text-slate-500">
        Si quieres saber cómo está hecho, la guía del método está en{' '}
        <Link className="font-semibold text-indigo-700 underline decoration-indigo-300 underline-offset-4 dark:text-indigo-300" href={`/articles/${ASTRO_GUIDE_SLUG}`}>
          cómo leemos el horóscopo
        </Link>
        . Los textos de esta semana caducan el 14 de octubre de 2026.
      </p>
    </div>
  )
}
