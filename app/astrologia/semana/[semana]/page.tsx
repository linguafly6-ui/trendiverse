import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import AstrologyHub from '@/components/AstrologyHub'
import CategoryNav from '@/components/CategoryNav'
import JsonLd from '@/components/JsonLd'
import { currentWeek, weekBySlug, weekSeo } from '@/lib/astrology'
import { SITE_NAME, SITE_URL } from '@/lib/constants'
import { astrologySectionGraph } from '@/lib/structured-data'

export const runtime = 'edge'

type Props = { params: Promise<{ semana: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const week = weekBySlug((await params).semana)
  if (!week) return {}
  const isCurrent = week.id === currentWeek().id
  const { title, description } = weekSeo(week)
  const url = isCurrent ? `${SITE_URL}/astrologia` : `${SITE_URL}/astrologia/semana/${week.slug}`
  return {
    title,
    description,
    alternates: { canonical: url },
    robots: { index: true, follow: true },
    openGraph: { title, description, type: 'website', url, siteName: SITE_NAME, locale: 'es_ES' },
    twitter: { card: 'summary', title, description },
  }
}

export default async function WeekPage({ params }: Props) {
  const week = weekBySlug((await params).semana)
  if (!week) notFound()
  const isCurrent = week.id === currentWeek().id
  return (
    <div className="space-y-6">
      <JsonLd data={astrologySectionGraph(week, !isCurrent)} />
      <nav aria-label="Migas de pan" className="text-sm text-slate-500">
        <Link href="/" className="hover:text-brand-violet">Inicio</Link>
        <span aria-hidden="true"> / </span>
        <Link href="/astrologia" className="hover:text-brand-violet">Astrología</Link>
        <span aria-hidden="true"> / </span>
        <span>Semana del {week.shortLabel}</span>
      </nav>
      <CategoryNav active="astrologia" />
      <AstrologyHub week={week} />
    </div>
  )
}
