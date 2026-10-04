import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { CategoryBadge } from '@/components/ArticleCard'
import Sidebar from '@/components/Sidebar'
import { getArticleBySlug } from '@/lib/db'
import { formatDate } from '@/lib/utils'

export const runtime = 'edge'

type Props = { params: Promise<{ slug: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const article = await getArticleBySlug((await params).slug)
  if (!article) return {}
  return {
    title: article.title,
    description: article.excerpt ?? undefined,
    openGraph: { title: article.title, description: article.excerpt ?? undefined, type: 'article', images: article.image_url ? [article.image_url] : [] },
    twitter: { card: 'summary_large_image' },
  }
}

export default async function ArticlePage({ params }: Props) {
  const article = await getArticleBySlug((await params).slug)
  if (!article) notFound()
  return (
    <div className="grid gap-8 lg:grid-cols-10">
      <article className="lg:col-span-7">
        <CategoryBadge slug={article.category} />
        <h1 className="mt-2 text-3xl font-extrabold">{article.title}</h1>
        <p className="mt-1 text-sm text-slate-500">{formatDate(article.published_at)} · {article.read_time_minutes ?? 1} min de lectura</p>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={article.image_url ?? ''} alt="" width={1200} height={630} fetchPriority="high" className="my-4 aspect-[1200/630] w-full rounded-xl bg-slate-200 object-cover dark:bg-slate-800" />
        <div className="space-y-4 whitespace-pre-line leading-relaxed">{article.content}</div>
      </article>
      <div className="lg:col-span-3"><Sidebar /></div>
    </div>
  )
}
