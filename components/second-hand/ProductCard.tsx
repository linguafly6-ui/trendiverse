import Link from 'next/link'
import { hasMetrics, secondHandCategory, secondHandCategoryPath, type SecondHandProduct } from '@/lib/second-hand'

const fmt = (n: number, currency: string | null) =>
  currency ? new Intl.NumberFormat('es-ES', { style: 'currency', currency, maximumFractionDigits: 0 }).format(n) : String(n)

export default function ProductCard({ product }: { product: SecondHandProduct }) {
  const category = secondHandCategory(product.categorySlug)
  const m = product.metrics
  return (
    <article className="flex h-full flex-col rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
      <h3 className="text-lg font-bold">{product.name}</h3>
      {category && (
        <Link href={secondHandCategoryPath(category.slug)} className="mt-1 inline-flex min-h-11 items-center text-sm font-semibold text-brand-violet">
          {category.icon} {category.name}
        </Link>
      )}
      <p className="mt-1 text-sm leading-relaxed text-slate-600 dark:text-slate-300">{product.summary}</p>
      {hasMetrics(m) ? (
        <dl className="mt-3 grid grid-cols-2 gap-2 text-sm">
          {m.usedPrice !== null && <div><dt className="text-slate-500">Precio usado</dt><dd className="font-semibold">{fmt(m.usedPrice, m.currency)}</dd></div>}
          {m.newPrice !== null && <div><dt className="text-slate-500">Precio nuevo</dt><dd className="font-semibold">{fmt(m.newPrice, m.currency)}</dd></div>}
          {m.savings !== null && <div><dt className="text-slate-500">Ahorro</dt><dd className="font-semibold">{m.savings}%</dd></div>}
          {m.score !== null && <div><dt className="text-slate-500">Second-Hand Score</dt><dd className="font-semibold">{m.score}</dd></div>}
        </dl>
      ) : (
        <p className="mt-auto pt-3 text-xs text-slate-500 dark:text-slate-400">Datos de precio y Second-Hand Score pendientes de fuentes reales.</p>
      )}
    </article>
  )
}
