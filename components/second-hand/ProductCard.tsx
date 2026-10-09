import Link from 'next/link'
import ProductFacts from '@/components/second-hand/ProductFacts'
import { secondHandCategory, secondHandCategoryPath, type SecondHandProduct } from '@/lib/second-hand'

export default function ProductCard({ product }: { product: SecondHandProduct }) {
  const category = secondHandCategory(product.categorySlug)
  return (
    <article className="flex h-full flex-col rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
      <h3 className="text-lg font-bold">{product.name}</h3>
      {category && (
        <Link href={secondHandCategoryPath(category.slug)} className="mt-1 inline-flex min-h-11 items-center text-sm font-semibold text-brand-violet">
          {category.icon} {category.name}
        </Link>
      )}
      <p className="mt-1 text-sm leading-relaxed text-slate-600 dark:text-slate-300">{product.summary}</p>
      <ProductFacts metrics={product.metrics} />
    </article>
  )
}
