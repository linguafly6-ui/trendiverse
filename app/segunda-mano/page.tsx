import type { Metadata } from 'next'
import Link from 'next/link'
import JsonLd from '@/components/JsonLd'
import ProductCard from '@/components/second-hand/ProductCard'
import { SITE_NAME } from '@/lib/constants'
import { getSecondHandProducts } from '@/lib/second-hand-data'
import {
  SECOND_HAND_CATEGORIES,
  SECOND_HAND_CRITERIA,
  SECOND_HAND_PATH,
  SECOND_HAND_SCORE,
  SECOND_HAND_SEO,
  secondHandCategoryPath,
  secondHandProductsByCategory,
  secondHandUrl,
  secondHandWatchlist,
} from '@/lib/second-hand'
import { secondHandGraph } from '@/lib/structured-data'

export const runtime = 'edge'

const title = `${SECOND_HAND_SEO.title} | Trendiverse`
const url = secondHandUrl()
export const metadata: Metadata = {
  title: { absolute: title },
  description: SECOND_HAND_SEO.description,
  alternates: { canonical: url },
  openGraph: { title, description: SECOND_HAND_SEO.description, url, type: 'website', siteName: SITE_NAME, locale: 'es_ES' },
  twitter: { card: 'summary', title, description: SECOND_HAND_SEO.description },
}

export default async function SecondHandPage() {
  const products = await getSecondHandProducts()
  return (
    <div className="mx-auto max-w-5xl space-y-12">
      <JsonLd data={secondHandGraph()} />
      <nav aria-label="Migas de pan" className="text-sm text-slate-500">
        <Link href="/">Inicio</Link><span aria-hidden="true"> / </span><span>Segunda mano</span>
      </nav>

      <header className="rounded-3xl bg-gradient-to-br from-teal-50 to-white p-6 dark:from-slate-900 dark:to-slate-950 sm:p-10">
        <p className="text-sm font-semibold uppercase tracking-wide text-teal-700 dark:text-teal-300">{SECOND_HAND_SEO.heroTitle}</p>
        <h1 className="mt-2 text-3xl font-extrabold tracking-tight sm:text-4xl">{SECOND_HAND_SEO.h1}</h1>
        <p className="mt-3 max-w-3xl leading-relaxed text-slate-600 dark:text-slate-300">{SECOND_HAND_SEO.heroSubtitle}</p>
      </header>

      <section aria-labelledby="tendencias">
        <h2 id="tendencias" className="text-2xl font-extrabold">Tendencias de segunda mano por categoría</h2>
        <p className="mt-2 max-w-3xl text-sm text-slate-600 dark:text-slate-300">
          Selección editorial de las áreas que seguiremos. Aún no mostramos cifras de mercado: llegarán cuando conectemos fuentes reales.
        </p>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          {SECOND_HAND_CATEGORIES.map((c) => (
            <div key={c.slug} className="rounded-2xl border border-slate-200 p-4 dark:border-slate-800">
              <h3 className="font-bold">{c.icon} {c.name}</h3>
              <ul className="mt-2 flex flex-wrap gap-2 text-sm">
                {secondHandProductsByCategory(c.slug, products).map((x) => (
                  <li key={x.slug} className="rounded-full bg-slate-100 px-3 py-1 dark:bg-slate-800">{x.name}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>

      <section aria-labelledby="categorias">
        <h2 id="categorias" className="text-2xl font-extrabold">Explora por categoría</h2>
        <ul className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {SECOND_HAND_CATEGORIES.map((c) => (
            <li key={c.slug}>
              <Link href={secondHandCategoryPath(c.slug)} className="block h-full rounded-2xl border border-slate-200 p-4 hover:border-brand-violet dark:border-slate-800">
                <span className="font-bold">{c.icon} {c.name}</span>
                <span className="mt-1 block text-sm text-slate-600 dark:text-slate-300">{c.description}</span>
              </Link>
            </li>
          ))}
        </ul>
      </section>

      <section aria-labelledby="vigilar">
        <h2 id="vigilar" className="text-2xl font-extrabold">Productos que merece la pena vigilar</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {secondHandWatchlist(products).map((x) => <ProductCard key={x.slug} product={x} />)}
        </div>
      </section>

      <section aria-labelledby="score" className="rounded-2xl border border-dashed border-teal-400 p-5">
        <h2 id="score" className="text-2xl font-extrabold">{SECOND_HAND_SCORE.name}</h2>
        <p className="mt-1 text-sm font-semibold text-teal-700 dark:text-teal-300">{SECOND_HAND_SCORE.status} · pendiente de datos reales</p>
        <p className="mt-2 max-w-3xl text-slate-600 dark:text-slate-300">{SECOND_HAND_SCORE.description}</p>
        <ul className="mt-3 flex flex-wrap gap-2 text-sm">
          {SECOND_HAND_SCORE.factors.map((f) => <li key={f} className="rounded-full bg-slate-100 px-3 py-1 dark:bg-slate-800">{f}</li>)}
        </ul>
      </section>

      <section aria-labelledby="criterios">
        <h2 id="criterios" className="text-2xl font-extrabold">¿Qué merece la pena comprar de segunda mano?</h2>
        <p className="mt-2 max-w-3xl leading-relaxed text-slate-600 dark:text-slate-300">
          No hay una respuesta única: depende del producto y de la oferta concreta. Estos son los criterios que conviene revisar antes de decidir.
        </p>
        <dl className="mt-4 grid gap-4 sm:grid-cols-2">
          {SECOND_HAND_CRITERIA.map((c) => (
            <div key={c.title}>
              <dt className="font-bold">{c.title}</dt>
              <dd className="text-sm leading-relaxed text-slate-600 dark:text-slate-300">{c.text}</dd>
            </div>
          ))}
        </dl>
        <p className="mt-4 text-sm text-slate-500">
          Más ideas de compra en <Link href="/articles/category/chollos" className="font-semibold text-brand-violet underline underline-offset-4">chollos y descuentos</Link>.
        </p>
      </section>
    </div>
  )
}
