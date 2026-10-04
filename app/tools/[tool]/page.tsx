import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import ToolWidget from '@/components/ToolWidget'
import { getToolBySlug } from '@/lib/db'

export const runtime = 'edge'

type Props = { params: Promise<{ tool: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const t = await getToolBySlug((await params).tool)
  return t ? { title: t.title, description: t.description ?? undefined } : {}
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
