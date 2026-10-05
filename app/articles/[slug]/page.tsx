import type { Metadata } from 'next'
import Image from 'next/image'
import { notFound } from 'next/navigation'
import { CategoryBadge } from '@/components/ArticleCard'
import Sidebar from '@/components/Sidebar'
import ArticleBody from '@/components/article/ArticleBody'
import ReadingProgress from '@/components/article/ReadingProgress'
import RelatedArticles from '@/components/article/RelatedArticles'
import TableOfContents from '@/components/article/TableOfContents'
import ShareButtons from '@/components/article/ShareButtons'
import LiveScore from '@/components/article/LiveScore'
import { getArticleBySlug, getRelatedArticles } from '@/lib/db'
import { getHeadings, parseArticleContent } from '@/lib/article-content'
import { formatDate } from '@/lib/utils'
import { getCategory, SITE_NAME, SITE_URL } from '@/lib/constants'

export const runtime = 'edge'

type Props = { params: Promise<{ slug: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const article = await getArticleBySlug((await params).slug)
  if (!article) return {}
  const url = `${SITE_URL}/articles/${encodeURIComponent(article.slug)}`
  const imageUrl = article.image_url ? new URL(article.image_url, SITE_URL).toString() : undefined
  const description = article.excerpt?.trim().slice(0, 160) || undefined
  return {
    title: article.title,
    description,
    alternates: { canonical: url },
    robots: { index: true, follow: true },
    openGraph: { title: article.title, description, type: 'article', url, images: imageUrl ? [imageUrl] : [], siteName: SITE_NAME, locale: 'es_ES' },
    twitter: { card: 'summary_large_image', title: article.title, description, images: imageUrl ? [imageUrl] : [] },
  }
}

export default async function ArticlePage({ params }: Props) {
  const article = await getArticleBySlug((await params).slug)
  if (!article) notFound()
  const blocks = parseArticleContent(article.content)
  const related = await getRelatedArticles(article, 4)
  const category = getCategory(article.category)
  const url = `${SITE_URL}/articles/${encodeURIComponent(article.slug)}`
  const imageUrl = article.image_url ? new URL(article.image_url, SITE_URL).toString() : undefined
  const articleSchema = { '@context': 'https://schema.org', '@type': 'NewsArticle', headline: article.title, description: article.excerpt ?? undefined, image: imageUrl ? [imageUrl] : undefined, datePublished: article.published_at, dateModified: article.published_at, inLanguage: 'es-ES', articleSection: category?.name, author: { '@type': 'Organization', name: SITE_NAME, url: SITE_URL }, publisher: { '@type': 'Organization', name: SITE_NAME, url: SITE_URL }, mainEntityOfPage: { '@type': 'WebPage', '@id': url } }
  const faqItems = blocks.reduce<{ question: string; answer: string }[]>((items, block, index) => {
    if (block.type !== 'heading' || block.level !== 3) return items
    const question = block.text.trim()
    const normalized = question.toLowerCase()
    const startsAsQuestion = /^(qué|quien|quién|cómo|cuando|cuándo|dónde|cuánto|cuánta|cuántos|cuántas|por qué|en qué|es qué|es recomendable|puede|se puede|cuál|cuáles)\b/.test(normalized)
    const answerBlock = blocks[index + 1]
    if (startsAsQuestion && answerBlock?.type === 'paragraph' && answerBlock.text.trim()) items.push({ question, answer: answerBlock.text.trim() })
    return items
  }, [])
  const faqSchema = faqItems.length ? { '@context': 'https://schema.org', '@type': 'FAQPage', mainEntity: faqItems.map((item) => ({ '@type': 'Question', name: item.question, acceptedAnswer: { '@type': 'Answer', text: item.answer } })) } : null
  const breadcrumbSchema = { '@context': 'https://schema.org', '@type': 'BreadcrumbList', itemListElement: [{ '@type': 'ListItem', position: 1, name: 'Inicio', item: SITE_URL }, ...(category ? [{ '@type': 'ListItem', position: 2, name: category.name, item: `${SITE_URL}/articles/category/${category.slug}` }] : []), { '@type': 'ListItem', position: category ? 3 : 2, name: article.title, item: url }] }
  return (
    <div className="grid gap-8 lg:grid-cols-10">
      <ReadingProgress />
      <article className="min-w-0 lg:col-span-7">
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }} />
        {faqSchema && <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />}
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />
        <nav aria-label="Migas de pan" className="mx-auto mb-4 max-w-prose text-sm text-slate-500"><a href="/" className="hover:text-brand-violet">Inicio</a>{category && <> <span aria-hidden="true">/</span> <a href={`/articles/category/${category.slug}`} className="hover:text-brand-violet">{category.name}</a></>} <span aria-hidden="true">/</span> <span>{article.title}</span></nav>
        <header className="mx-auto max-w-prose">
          <CategoryBadge slug={article.category} />
          <h1 className="mt-4 text-3xl font-extrabold leading-tight tracking-tight sm:text-4xl">{article.title}</h1>
          {article.excerpt && <p className="mt-4 border-l-4 border-violet-400 pl-4 text-lg leading-relaxed text-slate-600 dark:text-slate-400">{article.excerpt}</p>}
          <div className="mt-4 flex flex-wrap items-center gap-3 text-sm text-slate-500">
            <span>Por <strong className="font-medium text-slate-700 dark:text-slate-300">{SITE_NAME}</strong></span><span>·</span><time dateTime={article.published_at} className="font-medium">{formatDate(article.published_at)}</time>
            <span className="text-slate-300 dark:text-slate-700">·</span><span>{article.read_time_minutes ?? 1} min de lectura</span>
            {article.views > 0 && <><span className="text-slate-300 dark:text-slate-700">·</span><span>{article.views.toLocaleString('es-ES')} vistas</span></>}
          </div>
        </header>
        {article.image_url && <Image src={article.image_url} alt={article.title} width={1200} height={630} priority fetchPriority="high" sizes="(max-width: 1024px) 100vw, 70vw" className="my-8 aspect-[1200/630] w-full rounded-2xl bg-slate-200 object-cover shadow-lg dark:bg-slate-800" />}
        <TableOfContents headings={getHeadings(blocks)} />
        {article.slug === 'portugal-noruega-nations-league' && <LiveScore league="uefa.nations" homeTeam="Portugal" awayTeam="Norway" />}
        {article.slug === 'girona-mallorca-laliga-hypermotion' && <LiveScore league="esp.2" homeTeam="Girona" awayTeam="Mallorca" />}
        <ArticleBody blocks={blocks} />
        <div className="mx-auto mt-10 max-w-prose border-t border-slate-200 pt-6 dark:border-slate-800"><ShareButtons slug={article.slug} title={article.title} /></div>
        <RelatedArticles articles={related} />
      </article>
      <div className="lg:col-span-3"><Sidebar /></div>
    </div>
  )
}
