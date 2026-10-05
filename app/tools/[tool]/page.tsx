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
  const url = `${SITE_URL}/tools/${encodeURIComponent(t.slug)}`
  return { title: t.title, description: t.description ?? undefined, alternates: { canonical: url }, robots: { index: true, follow: true }, openGraph: { title: t.title, description: t.description ?? undefined, type: 'website', url, siteName: SITE_NAME, locale: 'es_ES' } }
}

export default async function ToolPage({ params }: Props) {
  const tool = await getToolBySlug((await params).tool)
  if (!tool) notFound()
  return (
    <div className="mx-auto max-w-xl">
      <h1 className="mb-4 text-3xl font-extrabold">{tool.title}</h1>
      <ToolWidget tool={tool} />
    </div>
  )
}
