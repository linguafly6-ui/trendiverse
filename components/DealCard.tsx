import Image from 'next/image'
import { formatDate, formatPrice } from '@/lib/utils'
import type { Deal } from '@/lib/types'

export default function DealCard({ deal }: { deal: Deal }) {
  return (
    <article className="relative overflow-hidden rounded-xl border border-slate-200 dark:border-slate-800">
      <span className="absolute left-2 top-2 z-10 rounded bg-red-600 px-2 py-0.5 text-xs font-bold text-white">-{deal.discount_percent}%</span>
      {deal.image_url && (
        <Image
          src={deal.image_url}
          alt={deal.product_name}
          width={400}
          height={300}
          sizes="(min-width: 640px) 50vw, 100vw"
          loading="lazy"
          className="h-36 w-full bg-slate-200 object-cover dark:bg-slate-800"
        />
      )}
      <div className="p-3">
        <h3 className="font-semibold">{deal.product_name}</h3>
        <p className="mt-1">
          <s className="mr-2 text-sm text-slate-500">{formatPrice(deal.original_price)}</s>
          <span className="text-lg font-extrabold text-emerald-500">{formatPrice(deal.discount_price)}</span>
        </p>
        {deal.expires_at && <p className="text-xs text-slate-500">Caduca: {formatDate(deal.expires_at)}</p>}
        <a href={deal.affiliate_url} target="_blank" rel="sponsored noopener noreferrer"
          className="mt-2 block rounded-lg bg-cat-chollos py-2 text-center text-sm font-bold text-white">Ver Chollo</a>
      </div>
    </article>
  )
}
