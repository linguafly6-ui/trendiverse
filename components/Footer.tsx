import Link from 'next/link'
import { CATEGORIES } from '@/lib/constants'

export default function Footer() {
  return (
    <footer className="mt-12 border-t border-slate-200 dark:border-slate-800">
      <div className="mx-auto grid max-w-7xl gap-6 px-4 py-8 sm:grid-cols-3">
        <div>
          <p className="font-extrabold">⚡ TrendiVerse</p>
          <p className="text-sm text-slate-500">Virales, gaming, herramientas y chollos.</p>
        </div>
        <ul className="space-y-1 text-sm">
          {CATEGORIES.map((c) => (
            <li key={c.slug}><Link href={`/articles/category/${c.slug}`}>{c.icon} {c.name}</Link></li>
          ))}
        </ul>
        <div className="text-sm">
          <Link href="/privacidad" className="mr-3">Privacidad</Link>
          <Link href="/terminos">Términos</Link>
        </div>
      </div>
    </footer>
  )
}
