import Link from 'next/link'
import { getTopArticles } from '@/lib/db'

export default async function Sidebar() {
  const top = await getTopArticles(5)
  return (
    <aside className="space-y-6">
      <section className="rounded-2xl border border-slate-200 p-4 dark:border-slate-800">
        <h2 className="mb-3 font-bold">📈 Trending Now</h2>
        <ol className="space-y-3">
          {top.map((a, i) => (
            <li key={a.id} className="flex gap-3">
              <span className="text-2xl font-black text-brand-violet">{i + 1}</span>
              <Link href={`/articles/${a.slug}`} className="text-sm font-medium">{a.title}</Link>
            </li>
          ))}
        </ol>
      </section>
      <section className="rounded-2xl bg-gradient-to-br from-brand-violet to-brand-blue p-4 text-white">
        <h2 className="font-bold">Suscríbete</h2>
        <p className="mb-3 text-sm">Lo último en Telegram y por email.</p>
        <a href="https://t.me/trendiverse" target="_blank" rel="noopener noreferrer" className="block rounded-lg bg-white py-2 text-center font-semibold text-brand-violet">Unirme a Telegram</a>
      </section>
      <div className="flex h-24 items-center justify-center rounded-lg border border-dashed text-xs text-slate-400">Publicidad</div>
      <div className="flex gap-3 text-sm">
        <a href="https://twitter.com" rel="noopener noreferrer">X</a>
        <a href="https://instagram.com" rel="noopener noreferrer">Instagram</a>
        <a href="https://tiktok.com" rel="noopener noreferrer">TikTok</a>
      </div>
    </aside>
  )
}
