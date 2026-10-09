import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import SignReadingView from '@/components/SignReadingView'
import { currentWeek, signBySlug, signSeoDescription, signSeoTitle } from '@/lib/astrology'
import { SITE_NAME, SITE_URL } from '@/lib/constants'

export const runtime = 'edge'

type Props = { params: Promise<{ signo: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const week = currentWeek()
  const sign = signBySlug(week, (await params).signo)
  if (!sign) return {}
  const url = `${SITE_URL}/astrologia/${sign.slug}`
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

export default async function SignPage({ params }: Props) {
  const week = currentWeek()
  const sign = signBySlug(week, (await params).signo)
  if (!sign) notFound()
  return <SignReadingView week={week} sign={sign} isCurrent />
}
