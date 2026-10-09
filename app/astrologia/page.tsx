import type { Metadata } from 'next'
import Link from 'next/link'
import AstrologyHub from '@/components/AstrologyHub'
import CategoryNav from '@/components/CategoryNav'
import JsonLd from '@/components/JsonLd'
import { ASTRO_GUIDE_SLUG, currentWeek, weekSeo } from '@/lib/astrology'
import { SITE_NAME, SITE_URL } from '@/lib/constants'
import { astrologySectionGraph } from '@/lib/structured-data'

export const runtime = 'edge'

export async function generateMetadata(): Promise<Metadata> {
  const week = currentWeek()
  const { title, description } = weekSeo(week)
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
      <CategoryNav active="astrologia" />
      <AstrologyHub week={week} />
      <p className="text-sm text-slate-500">
        Si quieres saber cómo está hecho, la guía del método está en{' '}
        <Link className="font-semibold text-indigo-700 underline decoration-indigo-300 underline-offset-4 dark:text-indigo-300" href={`/articles/${ASTRO_GUIDE_SLUG}`}>
          cómo leemos el horóscopo
        </Link>
        . Los textos de esta semana valen hasta el {week.days.split(', ').pop()?.replace(/^y /, '')}.
      </p>
    </div>
  )
}
