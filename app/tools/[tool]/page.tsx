import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import ToolWidget from '@/components/ToolWidget'
import { getToolBySlug } from '@/lib/db'
import { SITE_NAME, SITE_URL } from '@/lib/constants'

export const runtime = 'edge'

type Props = { params: Promise<{ tool: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const t = await getToolBySlug((await params).tool)
  if (!t) return {}
  const url = SITE_URL + '/tools/' + encodeURIComponent(t.slug)
  const description = t.description?.trim().slice(0, 160) || undefined
  return {
    title: t.title,
    description,
    alternates: { canonical: url },
    robots: { index: true, follow: true },
    openGraph: { title: t.title, description, type: 'website', url, siteName: SITE_NAME, locale: 'es_ES' },
    twitter: { card: 'summary', title: t.title, description },
  }
}

export default async function ToolPage({ params }: Props) {
  const tool = await getToolBySlug((await params).tool)
  if (!tool) notFound()
  return (
    <div className="mx-auto max-w-xl">
      <nav aria-label="Migas de pan" className="mb-4 text-sm text-slate-500">
        <a href="/" className="hover:text-brand-violet">Inicio</a>
        <span aria-hidden="true"> / </span>
        <span>{tool.title}</span>
      </nav>
      <h1 className="mb-2 text-3xl font-extrabold">{tool.title}</h1>
      {tool.description && <p className="mb-5 leading-relaxed text-slate-600 dark:text-slate-400">{tool.description}</p>}
      <ToolWidget tool={tool} />
    </div>
  )
}
