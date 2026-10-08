import type { Metadata } from 'next'
import Link from 'next/link'
import ArticleFeed from '@/components/ArticleFeed'
import Sidebar from '@/components/Sidebar'
import { CATEGORIES, SITE_NAME, SITE_URL } from '@/lib/constants'
import { getArticles } from '@/lib/db'

export const runtime = 'edge'

export const metadata: Metadata = {
  title: 'Noticias, actualidad y guías por categoría',
    description: 'Explora las últimas noticias y guías de TrendiVerse por política, economía, deportes, tecnología, gaming, coches, virales, herramientas, chollos y astrología.',
  alternates: { canonical: `${SITE_URL}/articles` },
  robots: { index: true, follow: true },
  openGraph: {
    title: 'Noticias, actualidad y guías por categoría',
    description: 'Explora las últimas noticias y guías de TrendiVerse por categoría.',
    type: 'website',
    url: `${SITE_URL}/articles`,
    siteName: SITE_NAME,
    locale: 'es_ES',
  },
  twitter: { card: 'summary', title: 'Noticias, actualidad y guías por categoría', description: 'Explora las últimas noticias y guías de TrendiVerse por categoría.' },
}

export default async function ArticlesPage() {
  const articles = await getArticles({ limit: 12 })
  const url = `${SITE_URL}/articles`
  const collectionSchema = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: 'Noticias, actualidad y guías por categoría',
    description: 'Índice editorial de TrendiVerse.',
    url,
    inLanguage: 'es-ES',
    isPartOf: { '@type': 'WebSite', name: SITE_NAME, url: SITE_URL },
    mainEntity: {
      '@type': 'ItemList',
      numberOfItems: articles.length,
      itemListElement: articles.map((article, index) => ({
        '@type': 'ListItem',
        position: index + 1,
        url: `${SITE_URL}/articles/${encodeURIComponent(article.slug)}`,
        name: article.title,
      })),
    },
  }

  return (
    <div className="grid gap-8 lg:grid-cols-10">
      <main className="space-y-7 lg:col-span-7">
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(collectionSchema) }} />
        <nav aria-label="Migas de pan" className="text-sm text-slate-500">
          <Link href="/" className="hover:text-brand-violet">Inicio</Link>
          <span aria-hidden="true"> / </span>
          <span>Noticias y guías</span>
        </nav>

        <header>
          <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl">Noticias, actualidad y guías</h1>
          <p className="mt-3 max-w-3xl leading-relaxed text-slate-600 dark:text-slate-400">
            Un índice de contenidos de TrendiVerse organizado por temas. Consulta actualidad y análisis de política y economía, tecnología, deportes, gaming, coches, virales, herramientas, chollos y astrología.
          </p>
        </header>

        <section aria-labelledby="categories-title">
          <h2 id="categories-title" className="mb-3 text-xl font-extrabold">Explora por categoría</h2>
          <div className="grid gap-3 sm:grid-cols-2">
            {CATEGORIES.map((c) => (
              <Link
                key={c.slug}
                href={c.href ?? `/articles/category/${c.slug}`}
                className="rounded-xl border border-slate-200 p-4 transition hover:border-brand-violet hover:shadow-sm dark:border-slate-800"
              >
                <span className="text-lg">{c.icon}</span>
                <h3 className="mt-1 font-bold">{c.name}</h3>
                <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">{c.description}</p>
              </Link>
            ))}
          </div>
        </section>

        <section aria-labelledby="latest-title">
          <h2 id="latest-title" className="mb-3 text-xl font-extrabold">Últimos contenidos</h2>
          <ArticleFeed initial={articles} />
        </section>
      </main>
      <div className="lg:col-span-3"><Sidebar /></div>
    </div>
  )
}
