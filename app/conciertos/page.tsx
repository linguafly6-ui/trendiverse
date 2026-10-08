import type { Metadata } from 'next'
import Link from 'next/link'
import CategoryNav from '@/components/CategoryNav'
import ConcertsHub from '@/components/ConcertsHub'
import { concertCities, concertsFor, type ConcertTier } from '@/lib/concerts'
import { SITE_NAME, SITE_URL } from '@/lib/constants'

export const runtime = 'edge'

const title = 'Conciertos en España: 2026 y 2027'
const description = 'Agenda de conciertos y festivales en España desde octubre de 2026 y lo ya fechado para 2027, con la fuente de cada cita.'

export const metadata: Metadata = {
  title,
  description,
  alternates: { canonical: `${SITE_URL}/conciertos` },
  robots: { index: true, follow: true },
  openGraph: { title, description, type: 'website', url: `${SITE_URL}/conciertos`, siteName: SITE_NAME, locale: 'es_ES' },
  twitter: { card: 'summary', title, description },
}

type Props = { searchParams: Promise<{ ciudad?: string; lista?: string }> }

export default async function ConciertosPage({ searchParams }: Props) {
  const params = await searchParams
  const cities = concertCities()
  const ciudad = params.ciudad && cities.includes(params.ciudad) ? params.ciudad : undefined
  const tier: ConcertTier | undefined = params.lista === 'confirmado' || params.lista === 'agenda' ? params.lista : undefined
  const listed = concertsFor({ ciudad, tier })
  const url = `${SITE_URL}/conciertos`
  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Inicio', item: SITE_URL },
      { '@type': 'ListItem', position: 2, name: 'Conciertos', item: url },
    ],
  }
  const collectionSchema = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: title,
    description,
    url,
    inLanguage: 'es-ES',
    isPartOf: { '@type': 'WebSite', name: SITE_NAME, url: SITE_URL },
    mainEntity: {
      '@type': 'ItemList',
      numberOfItems: listed.length,
      itemListElement: listed.map((concert, index) => ({
        '@type': 'ListItem',
        position: index + 1,
        name: `${concert.artist}, ${concert.city}`,
        url: `${url}#${concert.id}`,
      })),
    },
  }

  return (
    <div className="space-y-6">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(collectionSchema) }} />
      <nav aria-label="Migas de pan" className="text-sm text-slate-500">
        <Link href="/" className="hover:text-brand-violet">Inicio</Link>
        <span aria-hidden="true"> / </span>
        <span>Conciertos</span>
      </nav>
      <CategoryNav active="conciertos" />
      <ConcertsHub ciudad={ciudad} tier={tier} />
    </div>
  )
}
