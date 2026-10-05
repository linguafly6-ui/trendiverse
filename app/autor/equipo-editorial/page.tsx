import type { Metadata } from 'next'
import Link from 'next/link'
import { getArticles } from '@/lib/db'
import { SITE_NAME, SITE_URL } from '@/lib/constants'

export const runtime = 'edge'

export const metadata: Metadata = {
  title: 'Equipo Editorial',
  description: 'Conoce al Equipo Editorial de TrendiVerse y su enfoque para seleccionar, explicar y actualizar noticias y guías.',
  alternates: { canonical: `${SITE_URL}/autor/equipo-editorial` },
  robots: { index: true, follow: true },
}

export default async function EditorialTeamPage() {
  const articles = await getArticles({ limit: 12 })
  const url = `${SITE_URL}/autor/equipo-editorial`
  const profileSchema = {
    '@context': 'https://schema.org',
    '@type': 'ProfilePage',
    url,
    mainEntity: {
      '@type': 'Organization',
      '@id': `${SITE_URL}/#editorial-team`,
      name: 'Equipo Editorial',
      description: `Equipo editorial de ${SITE_NAME} dedicado a noticias, actualidad, guías y herramientas prácticas.`,
      url,
    },
    hasPart: articles.map((article) => ({
      '@type': 'Article',
      headline: article.title,
      url: `${SITE_URL}/articles/${encodeURIComponent(article.slug)}`,
      datePublished: article.published_at,
      author: { '@id': `${SITE_URL}/#editorial-team` },
    })),
  }

  return (
    <div className="mx-auto max-w-4xl">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(profileSchema) }} />
      <nav aria-label="Migas de pan" className="mb-6 text-sm text-slate-500">
        <Link href="/" className="hover:text-brand-violet">Inicio</Link> <span aria-hidden="true">/</span> <span>Equipo Editorial</span>
      </nav>
      <header className="max-w-2xl">
        <p className="text-sm font-semibold uppercase tracking-wide text-violet-600">TrendiVerse</p>
        <h1 className="mt-2 text-4xl font-extrabold tracking-tight">Equipo Editorial</h1>
        <p className="mt-4 text-lg leading-relaxed text-slate-600 dark:text-slate-400">
          Somos el equipo editorial de TrendiVerse. Seleccionamos, estructuramos y revisamos contenidos sobre actualidad, tecnología, economía, deportes, coches, gaming y herramientas prácticas.
        </p>
      </header>
      <section className="mt-10 grid gap-6 sm:grid-cols-3">
        <div className="rounded-2xl border border-slate-200 p-5 dark:border-slate-800"><h2 className="font-bold">Claridad</h2><p className="mt-2 text-sm text-slate-600 dark:text-slate-400">Explicamos lo importante con contexto y lenguaje directo.</p></div>
        <div className="rounded-2xl border border-slate-200 p-5 dark:border-slate-800"><h2 className="font-bold">Fuentes</h2><p className="mt-2 text-sm text-slate-600 dark:text-slate-400">Priorizamos información verificable y fuentes relevantes para cada tema.</p></div>
        <div className="rounded-2xl border border-slate-200 p-5 dark:border-slate-800"><h2 className="font-bold">Actualización</h2><p className="mt-2 text-sm text-slate-600 dark:text-slate-400">Revisamos los contenidos cuando los datos o el contexto cambian.</p></div>
      </section>
      <section className="mt-10">
        <h2 className="text-2xl font-bold">Últimos contenidos del Equipo Editorial</h2>
        <ul className="mt-4 space-y-3">
          {articles.slice(0, 8).map((article) => (
            <li key={article.slug}><Link href={`/articles/${article.slug}`} className="font-medium hover:text-brand-violet">{article.title}</Link></li>
          ))}
        </ul>
      </section>
    </div>
  )
}
