import type { Metadata } from 'next'
import Link from 'next/link'
import CategoryNav from '@/components/CategoryNav'
import ConcertsHub from '@/components/ConcertsHub'
import JsonLd from '@/components/JsonLd'
import { concertCities, concertsFor, type ConcertTier } from '@/lib/concerts'
import { SITE_NAME, SITE_URL } from '@/lib/constants'
import { concertSectionGraph } from '@/lib/structured-data'

export const runtime = 'edge'

const title = 'Conciertos en España: 2026 y 2027'
const description = 'Agenda de conciertos y festivales en España desde octubre de 2026 y lo ya fechado para 2027, con la fuente de cada cita.'

type Props = { searchParams: Promise<{ ciudad?: string; lista?: string }> }

export async function generateMetadata({ searchParams }: Props): Promise<Metadata> {
  const params = await searchParams
  const cities = concertCities()
  const ciudad = params.ciudad && cities.includes(params.ciudad) ? params.ciudad : undefined
  const tier: ConcertTier | undefined = params.lista === 'confirmado' || params.lista === 'agenda' ? params.lista : undefined
  const filtered = Boolean(ciudad || tier)
  return {
    title,
    description,
    alternates: { canonical: `${SITE_URL}/conciertos` },
    robots: { index: !filtered, follow: true },
    openGraph: { title, description, type: 'website', url: `${SITE_URL}/conciertos`, siteName: SITE_NAME, locale: 'es_ES' },
    twitter: { card: 'summary', title, description },
  }
}

export default async function ConciertosPage({ searchParams }: Props) {
  const params = await searchParams
  const cities = concertCities()
  const ciudad = params.ciudad && cities.includes(params.ciudad) ? params.ciudad : undefined
  const tier: ConcertTier | undefined = params.lista === 'confirmado' || params.lista === 'agenda' ? params.lista : undefined
  const listed = concertsFor({ ciudad, tier })
  const indexable = !ciudad && !tier

  return (
    <div className="space-y-6">
      <JsonLd data={concertSectionGraph(listed, indexable)} />
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
