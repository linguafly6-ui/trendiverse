import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import JsonLd from '@/components/JsonLd'
import { concertById, concertsFor } from '@/lib/concerts'
import { SITE_NAME, SITE_URL } from '@/lib/constants'
import { concertFaqs, concertMeta, concertPageGraph } from '@/lib/structured-data'

export const runtime = 'edge'

type Props = { params: Promise<{ id: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const concert = concertById((await params).id)
  if (!concert) return {}
  const { title, description } = concertMeta(concert)
  const url = `${SITE_URL}/conciertos/${concert.id}`
  return {
    title,
    description,
    alternates: { canonical: url },
    robots: { index: true, follow: true },
    openGraph: { title, description, type: 'website', url, siteName: SITE_NAME, locale: 'es_ES' },
    twitter: { card: 'summary', title, description },
  }
}

export default async function ConcertPage({ params }: Props) {
  const concert = concertById((await params).id)
  if (!concert) notFound()
  const listed = concertsFor()
  const index = listed.findIndex((item) => item.id === concert.id)
  const prev = index > 0 ? listed[index - 1] : undefined
  const next = index >= 0 && index < listed.length - 1 ? listed[index + 1] : undefined
  const faqs = concertFaqs(concert)
  const { title } = concertMeta(concert)

  return (
    <article className="mx-auto max-w-3xl">
      <JsonLd data={concertPageGraph(concert)} />
      <nav aria-label="Migas de pan" className="text-sm text-slate-500">
        <Link href="/" className="hover:text-brand-violet">Inicio</Link>
        <span aria-hidden="true"> / </span>
        <Link href="/conciertos" className="hover:text-brand-violet">Conciertos</Link>
        <span aria-hidden="true"> / </span>
        <span>{concert.artist}</span>
      </nav>
      <header className="mt-4">
        <p className="text-xs font-semibold uppercase tracking-wide text-rose-700 dark:text-rose-300">
          {concert.tier === 'confirmado' ? 'Confirmado' : 'Agenda de entradas'}
          {concert.datesPending ? ' · días por cerrar' : ''}
        </p>
        <h1 className="mt-1 text-3xl font-extrabold tracking-tight sm:text-4xl">{title}</h1>
        <p className="mt-2 text-lg font-medium">{concert.title}</p>
        <p className="mt-3 text-slate-600 dark:text-slate-300">{concert.when}</p>
        <p className="text-slate-600 dark:text-slate-300">{concert.venue} · {concert.city}</p>
      </header>
      <p className="mt-6 leading-relaxed">{concert.detail}</p>
      <p className="mt-4 text-sm">
        <a className="font-semibold text-rose-700 underline decoration-rose-300 underline-offset-4 dark:text-rose-300" href={concert.sourceUrl}>
          Fuente: {concert.sourceName}
        </a>
      </p>
      <section aria-labelledby="concert-faq" className="mt-8">
        <h2 id="concert-faq" className="text-xl font-extrabold">Preguntas frecuentes</h2>
        <div className="mt-3 space-y-4">
          {faqs.map((item) => (
            <div key={item.q}>
              <h3 className="font-bold">{item.q}</h3>
              <p className="mt-1 leading-relaxed text-slate-700 dark:text-slate-300">{item.a}</p>
            </div>
          ))}
        </div>
      </section>
      <nav aria-label="Otras citas" className="mt-8 flex flex-wrap items-center justify-between gap-3 border-t border-slate-200 pt-4 text-sm dark:border-slate-800">
        {prev ? <Link className="font-semibold text-rose-700 underline decoration-rose-300 underline-offset-4 dark:text-rose-300" href={`/conciertos/${prev.id}`}>{prev.artist}, {prev.city}</Link> : <span />}
        <Link className="font-semibold text-rose-700 underline decoration-rose-300 underline-offset-4 dark:text-rose-300" href="/conciertos">Toda la agenda</Link>
        {next ? <Link className="font-semibold text-rose-700 underline decoration-rose-300 underline-offset-4 dark:text-rose-300" href={`/conciertos/${next.id}`}>{next.artist}, {next.city}</Link> : <span />}
      </nav>
    </article>
  )
}
