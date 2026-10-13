import Link from 'next/link'
import ProductFacts from '@/components/second-hand/ProductFacts'
import { EBAY_LISTING_DISCLOSURE, type EbayListing } from '@/lib/ebay-listing'
import { visibleEbayListings } from '@/lib/ebay-second-hand-gate'
import { secondHandCategory, secondHandCategoryPath, type SecondHandProduct } from '@/lib/second-hand'

export default function ProductCard({
  product,
  listings = [],
  now = Date.now(),
}: {
  product: SecondHandProduct
  listings?: readonly EbayListing[]
  now?: number
}) {
  const category = secondHandCategory(product.categorySlug)
  const visible = visibleEbayListings(product.slug, listings, now)
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
      <EbayListingLinks listings={visible} />
    </article>
  )
}

/** Enlaces ya filtrados por la compuerta. No añade parámetros ni un precio distinto del anuncio. */
export function EbayListingLinks({ listings }: { listings: readonly EbayListing[] }) {
  if (listings.length === 0) return null
  return (
    <ul className="mt-3 space-y-2 text-sm">
      {listings.map((listing) => (
        <li key={listing.itemId ?? listing.legacyItemId ?? listing.itemWebUrl ?? 'listing'}>
          {listing.itemWebUrl && (
            <a href={listing.itemWebUrl} rel="nofollow noopener noreferrer" target="_blank">
              {listing.price ? `${listing.price.value} ${listing.price.currency}` : listing.itemWebUrl}
            </a>
          )}
          <p className="text-xs text-slate-500 dark:text-slate-400">{EBAY_LISTING_DISCLOSURE}</p>
        </li>
      ))}
    </ul>
  )
}
