import { notFound, permanentRedirect } from 'next/navigation'
import { getArticleBySlug } from '@/lib/db'

export const runtime = 'edge'

type Props = { params: Promise<{ slug: string }> }

// Keep legacy root-level article URLs working while canonical URLs live under /articles/.
export default async function LegacyArticleRedirect({ params }: Props) {
  const { slug } = await params
  const article = await getArticleBySlug(slug)
  if (!article) notFound()

  permanentRedirect(`/articles/${encodeURIComponent(article.slug)}`)
}
