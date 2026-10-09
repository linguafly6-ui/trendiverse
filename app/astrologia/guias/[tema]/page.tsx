import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import JsonLd from '@/components/JsonLd'
import { DISCLAIMER } from '@/lib/astrology'
import {
  astrologyGuideBySlug,
  astrologyGuideBody,
  astrologyGuidePath,
  astrologyGuideSources,
  plainAstrologyText,
} from '@/lib/astrology-guides'
import { SITE_NAME, SITE_URL } from '@/lib/constants'
import { astrologyGuideGraph } from '@/lib/structured-data'

export const runtime = 'edge'
type Props = { params: Promise<{ tema: string }> }

/** Solo interpreta enlaces Markdown https; el resto del contenido se escapa con React. */
function GuideText({ text }: { text: string }) {
  const parts = text.split(/(\[[^\]]+\]\(https:\/\/[^)]+\))/g)
  return <>{parts.map((part, index) => {
    const match = part.match(/^\[([^\]]+)\]\((https:\/\/[^)]+)\)$/)
    return match
      ? <a key={index} href={match[2]} className="text-indigo-700 underline decoration-indigo-300 underline-offset-4 dark:text-indigo-300">{match[1]}</a>
      : part
  })}</>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const guide = astrologyGuideBySlug((await params).tema)
  if (!guide) return {}
  const url = `${SITE_URL}${astrologyGuidePath(guide.slug)}`
  return {
    title: guide.seoTitle,
    description: guide.description,
    alternates: { canonical: url },
    robots: { index: true, follow: true },
    openGraph: { title: guide.seoTitle, description: guide.description, url, type: 'article', siteName: SITE_NAME, locale: 'es_ES' },
    twitter: { card: 'summary', title: guide.seoTitle, description: guide.description },
  }
}

export default async function AstrologyGuidePage({ params }: Props) {
  const guide = astrologyGuideBySlug((await params).tema)
  if (!guide) notFound()
  const minutes = Math.max(1, Math.ceil(astrologyGuideBody(guide).split(/\s+/).length / 200))
  const sources = astrologyGuideSources(guide)

  return (
    <article className="mx-auto max-w-6xl">
      <JsonLd data={astrologyGuideGraph(guide)} />
      <nav aria-label="Migas de pan" className="flex flex-wrap gap-x-2 gap-y-1 text-sm text-slate-500 dark:text-slate-400">
        <Link href="/">Inicio</Link><span aria-hidden="true">/</span>
        <Link href="/astrologia">Astrología</Link><span aria-hidden="true">/</span>
        <Link href="/astrologia/guias">Guías</Link><span aria-hidden="true">/</span>
        <span>{guide.title.split(':')[0]}</span>
      </nav>

      <header className="mt-6 max-w-3xl">
        <p className="text-sm font-semibold uppercase tracking-wide text-indigo-700 dark:text-indigo-300">{guide.eyebrow}</p>
        <h1 className="mt-2 text-3xl font-extrabold tracking-tight sm:text-4xl">{guide.title}</h1>
        <p className="mt-3 text-sm text-slate-500 dark:text-slate-400">
          <Link href="/autor/equipo-editorial" className="underline underline-offset-4">Equipo Editorial de TrendiVerse</Link>
          {' · '}Revisado el <time dateTime={guide.updated}>9 de octubre de 2026</time>{' · '}{minutes} min de lectura
        </p>
        <div className="mt-5 rounded-xl bg-slate-100 p-5 leading-relaxed dark:bg-slate-900">
          <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">La respuesta breve</p>
          <p className="mt-2"><GuideText text={guide.answer} /></p>
        </div>
      </header>

      <div className="mt-8 grid gap-8 lg:grid-cols-[14rem_minmax(0,1fr)] lg:gap-12">
        <aside>
          <nav aria-label="En esta guía" className="rounded-xl border border-slate-200 p-4 dark:border-slate-800 lg:sticky lg:top-32">
            <p className="font-bold">En esta guía</p>
            <ul className="mt-2 text-sm">
              {guide.sections.map((section) => (
                <li key={section.id}><a href={`#${section.id}`} className="flex min-h-11 items-center py-2 text-slate-600 underline-offset-4 hover:text-indigo-700 hover:underline dark:text-slate-300 dark:hover:text-indigo-300">{section.title}</a></li>
              ))}
              <li><a href="#preguntas-frecuentes" className="flex min-h-11 items-center py-2 text-slate-600 hover:underline dark:text-slate-300">Preguntas frecuentes</a></li>
            </ul>
          </nav>
        </aside>
        <div className="min-w-0 max-w-3xl">
          <div className="space-y-4 leading-7">
            {guide.intro.map((text) => <p key={text}><GuideText text={text} /></p>)}
          </div>
          {guide.sections.map((section) => (
            <section key={section.id} id={section.id} aria-labelledby={`${section.id}-title`} className="mt-9 scroll-mt-32">
              <h2 id={`${section.id}-title`} className="text-xl font-extrabold sm:text-2xl">{section.title}</h2>
              <div className="mt-4 space-y-4 leading-7">
                {section.paragraphs.map((text) => <p key={text}><GuideText text={text} /></p>)}
                {section.bullets ? <ul className="list-disc space-y-3 pl-5">{section.bullets.map((text) => <li key={text}><GuideText text={text} /></li>)}</ul> : null}
              </div>
            </section>
          ))}

          <section id="preguntas-frecuentes" aria-labelledby="faq-title" className="mt-10 scroll-mt-32">
            <h2 id="faq-title" className="text-2xl font-extrabold">Preguntas frecuentes</h2>
            <div className="mt-4 divide-y divide-slate-200 border-y border-slate-200 dark:divide-slate-800 dark:border-slate-800">
              {guide.faqs.map((faq) => (
                <details key={faq.q} className="py-4">
                  <summary className="cursor-pointer py-1 font-bold">{faq.q}</summary>
                  <p className="mt-3 leading-7 text-slate-600 dark:text-slate-300"><GuideText text={faq.a} /></p>
                </details>
              ))}
            </div>
          </section>
          <p className="mt-6 text-sm leading-relaxed text-slate-500 dark:text-slate-400">{DISCLAIMER}</p>
          <p className="mt-3 text-sm leading-relaxed text-slate-500 dark:text-slate-400">
            Las referencias enlazadas distinguen definiciones astrológicas, información astronómica y límites de la evidencia. No se atribuye a NASA respaldo de las interpretaciones.
          </p>
          <details className="mt-4 rounded-xl border border-slate-200 p-4 dark:border-slate-800">
            <summary className="cursor-pointer font-semibold">Referencias de esta guía</summary>
            <ul className="mt-3 space-y-3 text-sm">
              {sources.map((source) => <li key={source.url}><a href={source.url} className="text-indigo-700 underline underline-offset-4 dark:text-indigo-300">{source.name}</a></li>)}
            </ul>
          </details>

          <nav aria-label="Sigue aprendiendo" className="mt-8 border-t border-slate-200 pt-6 dark:border-slate-800">
            <h2 className="text-xl font-extrabold">Sigue aprendiendo</h2>
            <ul className="mt-3 space-y-2">
              {guide.related.map((slug) => {
                const related = astrologyGuideBySlug(slug)!
                return <li key={slug}><Link href={astrologyGuidePath(slug)} className="inline-flex min-h-11 items-center font-semibold text-indigo-700 underline underline-offset-4 dark:text-indigo-300">{related.title}</Link></li>
              })}
            </ul>
            <Link href="/astrologia#horoscopo-semanal" className="mt-4 inline-flex min-h-11 items-center rounded-lg bg-indigo-800 px-4 py-2 font-semibold text-white hover:bg-indigo-900 dark:bg-indigo-200 dark:text-slate-950 dark:hover:bg-indigo-100">Lee el horóscopo de tu semana</Link>
          </nav>
        </div>
      </div>
    </article>
  )
}
