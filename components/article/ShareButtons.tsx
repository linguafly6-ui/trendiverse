'use client'

export default function ShareButtons({ slug, title }: { slug: string; title: string }) {
  const url = typeof window !== 'undefined' ? window.location.href : `https://trendiverse.pages.dev/articles/${slug}`

  const share = (e: React.MouseEvent<HTMLButtonElement>, platform: string) => {
    e.preventDefault()
    const u = encodeURIComponent(url)
    const t = encodeURIComponent(title)
    const links: Record<string, string> = {
      twitter: `https://twitter.com/intent/tweet?url=${u}&text=${t}`,
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${u}`,
      whatsapp: `https://wa.me/?text=${t}%20${u}`,
    }
    window.open(links[platform], '_blank', 'noopener,noreferrer')
  }

  return (
    <div className="flex items-center gap-2">
      <span className="text-sm text-slate-500">Compartir:</span>
      <button onClick={(e) => share(e, 'twitter')} className="rounded-lg bg-slate-100 px-3 py-1.5 text-sm font-medium hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700" aria-label="Compartir en X">X</button>
      <button onClick={(e) => share(e, 'facebook')} className="rounded-lg bg-slate-100 px-3 py-1.5 text-sm font-medium hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700" aria-label="Compartir en Facebook">Facebook</button>
      <button onClick={(e) => share(e, 'whatsapp')} className="rounded-lg bg-slate-100 px-3 py-1.5 text-sm font-medium hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700" aria-label="Compartir en WhatsApp">WhatsApp</button>
    </div>
  )
}
