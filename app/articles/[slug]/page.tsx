import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { CategoryBadge } from '@/components/ArticleCard'
import Sidebar from '@/components/Sidebar'
import ArticleBody from '@/components/article/ArticleBody'
import ReadingProgress from '@/components/article/ReadingProgress'
import RelatedArticles from '@/components/article/RelatedArticles'
import TableOfContents from '@/components/article/TableOfContents'
import ShareButtons from '@/components/article/ShareButtons'
import { getArticleBySlug, getRelatedArticles } from '@/lib/db'
import { getHeadings, parseArticleContent } from '@/lib/article-content'
import { formatDate } from '@/lib/utils'
import { SITE_NAME } from '@/lib/constants'

export const runtime = 'edge'

type Props = { params: Promise<{ slug: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const article = await getArticleBySlug((await params).slug)
  if (!article) return {}
  return {
    title: article.title,
    description: article.excerpt ?? undefined,
    openGraph: { title: article.title, description: article.excerpt ?? undefined, type: 'article', images: article.image_url ? [article.image_url] : [], siteName: SITE_NAME },
    twitter: { card: 'summary_large_image' },
  }
}

export default async function ArticlePage({ params }: Props) {
  const article = await getArticleBySlug((await params).slug)
  if (!article) notFound()
  const blocks = parseArticleContent(article.content)
  const related = await getRelatedArticles(article, 4)
  return (
    <div className="grid gap-8 lg:grid-cols-10">
      <ReadingProgress />
      <article className="min-w-0 lg:col-span-7">
        <header className="mx-auto max-w-prose">
          <CategoryBadge slug={article.category} />
          <h1 className="mt-3 text-3xl font-extrabold leading-tight sm:text-4xl">{article.title}</h1>
          {article.excerpt && <p className="mt-3 text-lg leading-relaxed text-slate-600 dark:text-slate-400">{article.excerpt}</p>}
          <div className="mt-3 flex items-center gap-3 text-sm text-slate-500">
            <time dateTime={article.published_at}>{formatDate(article.published_at)}</time>
            <span>·</span>
            <span>{article.read_time_minutes ?? 1} min de lectura</span>
            {article.views > 0 && (
              <>
                <span>·</span>
                <span>{article.views.toLocaleString('es-ES')} vistas</span>
              </>
            )}
          </div>
        </header>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={article.image_url ?? ''} alt="" width={1200} height={630} fetchPriority="high" className="my-6 aspect-[1200/630] w-full rounded-xl bg-slate-200 object-cover dark:bg-slate-800" />
        <TableOfContents headings={getHeadings(blocks)} />
        <ArticleBody blocks={blocks} />
        <div className="mx-auto mt-8 max-w-prose border-t border-slate-200 pt-6 dark:border-slate-800">
          <ShareButtons slug={article.slug} title={article.title} />
        </div>
        <RelatedArticles articles={related} />
      </article>
      <div className="lg:col-span-3"><Sidebar /></div>
    </div>
  )
}
