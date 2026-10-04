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

  const buttons = [
    { platform: 'twitter', label: 'X', color: 'hover:bg-slate-900 hover:text-white' },
    { platform: 'facebook', label: 'Facebook', color: 'hover:bg-blue-600 hover:text-white' },
    { platform: 'whatsapp', label: 'WhatsApp', color: 'hover:bg-green-600 hover:text-white' },
  ]

  return (
    <div className="flex flex-wrap items-center gap-3">
      <span className="text-sm font-semibold text-slate-600 dark:text-slate-400">Compartir:</span>
      <div className="flex gap-2">
        {buttons.map((btn) => (
          <button
            key={btn.platform}
            onClick={(e) => share(e, btn.platform)}
            className={`rounded-lg bg-slate-100 px-4 py-2 text-sm font-medium transition dark:bg-slate-800 ${btn.color}`}
            aria-label={`Compartir en ${btn.label}`}
          >
            {btn.label}
          </button>
        ))}
      </div>
    </div>
  )
}
