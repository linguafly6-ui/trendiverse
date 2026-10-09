import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import SignReadingView from '@/components/SignReadingView'
import { currentWeek, signBySlug, signSeoDescription, signSeoTitle, weekBySlug } from '@/lib/astrology'
import { SITE_NAME, SITE_URL } from '@/lib/constants'

export const runtime = 'edge'

type Props = { params: Promise<{ signo: string; semana: string }> }

async function resolve(params: Props['params']) {
  const { signo, semana } = await params
  const week = weekBySlug(semana)
  const sign = week ? signBySlug(week, signo) : undefined
  if (!week || !sign) return null
  return { week, sign, isCurrent: week.id === currentWeek().id }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const found = await resolve(params)
  if (!found) return {}
  const { week, sign, isCurrent } = found
  // Mientras la semana está en curso, la página canónica es /astrologia/{signo}; después, esta.
  const url = isCurrent ? `${SITE_URL}/astrologia/${sign.slug}` : `${SITE_URL}/astrologia/${sign.slug}/${week.slug}`
  const title = signSeoTitle(week, sign)
  const description = signSeoDescription(week, sign)
  return {
    title,
    description,
    alternates: { canonical: url },
    robots: { index: true, follow: true },
    openGraph: { title, description, type: 'article', url, siteName: SITE_NAME, locale: 'es_ES' },
    twitter: { card: 'summary', title, description },
  }
}

export default async function DatedSignPage({ params }: Props) {
  const found = await resolve(params)
  if (!found) notFound()
  const { week, sign, isCurrent } = found
  return <SignReadingView week={week} sign={sign} isCurrent={isCurrent} />
}
