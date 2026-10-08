import type { Metadata } from 'next'
import Link from 'next/link'
import AstrologyHub from '@/components/AstrologyHub'
import CategoryNav from '@/components/CategoryNav'
import { ASTRO_GUIDE_SLUG, SIGNS, WEEK_LABEL } from '@/lib/astrology'
import { SITE_NAME, SITE_URL } from '@/lib/constants'

export const runtime = 'edge'

const title = 'Horóscopo semanal: los 12 signos'
const description = 'Horóscopo del 8 al 14 de octubre de 2026. Luna nueva en Libra, Venus retrógrada en Escorpio y una lectura por signo solar.'

export const metadata: Metadata = {
  title,
  description,
  alternates: { canonical: `${SITE_URL}/astrologia` },
  robots: { index: true, follow: true },
  openGraph: { title, description, type: 'website', url: `${SITE_URL}/astrologia`, siteName: SITE_NAME, locale: 'es_ES' },
  twitter: { card: 'summary', title, description },
}

export default function AstrologiaPage() {
  const url = `${SITE_URL}/astrologia`
  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Inicio', item: SITE_URL },
      { '@type': 'ListItem', position: 2, name: 'Astrología', item: url },
    ],
  }
  const collectionSchema = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: title,
    description,
    url,
    inLanguage: 'es-ES',
    isPartOf: { '@type': 'WebSite', name: SITE_NAME, url: SITE_URL },
    mainEntity: {
      '@type': 'ItemList',
      numberOfItems: SIGNS.length,
      itemListElement: SIGNS.map((sign, index) => ({
        '@type': 'ListItem',
        position: index + 1,
        url: `${url}/${sign.slug}`,
        name: `${sign.name}: semana del ${WEEK_LABEL}`,
      })),
    },
  }

  return (
    <div className="space-y-6">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(collectionSchema) }} />
      <nav aria-label="Migas de pan" className="text-sm text-slate-500">
        <Link href="/" className="hover:text-brand-violet">Inicio</Link>
        <span aria-hidden="true"> / </span>
        <span>Astrología</span>
      </nav>
      <CategoryNav active="astrologia" />
      <AstrologyHub />
      <p className="text-sm text-slate-500">
        La guía del método está en{' '}
        <Link className="font-semibold text-indigo-700 underline decoration-indigo-300 underline-offset-4 dark:text-indigo-300" href={`/articles/${ASTRO_GUIDE_SLUG}`}>
          cómo leemos el horóscopo
        </Link>
        . Los textos de esta semana caducan el 14 de octubre de 2026.
      </p>
    </div>
  )
}
