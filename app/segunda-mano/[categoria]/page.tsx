import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import JsonLd from '@/components/JsonLd'
import ProductCard from '@/components/second-hand/ProductCard'
import { SITE_NAME } from '@/lib/constants'
import {
  SECOND_HAND_PATH,
  secondHandCategory,
  secondHandCategoryPath,
  secondHandProductsByCategory,
  secondHandUrl,
} from '@/lib/second-hand'
import { secondHandGraph } from '@/lib/structured-data'

export const runtime = 'edge'
type Props = { params: Promise<{ categoria: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const category = secondHandCategory((await params).categoria)
  if (!category) return {}
  const url = secondHandUrl(secondHandCategoryPath(category.slug))
  const title = `${category.seoTitle} | Trendiverse`
  return {
    title: { absolute: title },
    description: category.intro,
    alternates: { canonical: url },
    openGraph: { title, description: category.intro, url, type: 'website', siteName: SITE_NAME, locale: 'es_ES' },
    twitter: { card: 'summary', title, description: category.intro },
  }
}

export default async function SecondHandCategoryPage({ params }: Props) {
  const category = secondHandCategory((await params).categoria)
  if (!category) notFound()
  return (
    <div className="mx-auto max-w-5xl space-y-8">
      <JsonLd data={secondHandGraph(category)} />
      <nav aria-label="Migas de pan" className="text-sm text-slate-500">
        <Link href="/">Inicio</Link><span aria-hidden="true"> / </span>
        <Link href={SECOND_HAND_PATH}>Segunda mano</Link><span aria-hidden="true"> / </span><span>{category.name}</span>
      </nav>
      <header>
        <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl">{category.icon} {category.name} de segunda mano</h1>
        <p className="mt-3 max-w-3xl leading-relaxed text-slate-600 dark:text-slate-300">{category.intro}</p>
      </header>
      <section aria-labelledby="productos">
        <h2 id="productos" className="text-2xl font-extrabold">Qué mirar en {category.name.toLowerCase()}</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {secondHandProductsByCategory(category.slug).map((x) => <ProductCard key={x.slug} product={x} />)}
        </div>
      </section>
      <Link href={SECOND_HAND_PATH} className="inline-flex min-h-11 items-center font-semibold text-brand-violet underline underline-offset-4">Volver a segunda mano</Link>
    </div>
  )
}
