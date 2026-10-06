import CopyButton from './CopyButton'
import { SAMPLE_CODES } from '@/lib/chollos-otono'

export default function GamingCodes() {
  if (SAMPLE_CODES.length === 0) return null
  return (
    <section aria-label="Códigos de juegos" className="rounded-2xl border border-cat-gaming/40 p-4">
      <h2 className="mb-3 text-xl font-bold">🎮 Códigos activos</h2>
      <ul className="divide-y divide-slate-200 dark:divide-slate-800">
        {SAMPLE_CODES.map((c) => (
          <li key={c.code} className="flex items-center justify-between gap-3 py-2">
            <div>
              <p className="font-semibold">{c.game} · <code className="text-cat-gaming">{c.code}</code></p>
              <p className="text-sm text-slate-500">{c.reward} — {c.note}</p>
            </div>
            <CopyButton text={c.code} />
          </li>
        ))}
      </ul>
    </section>
  )
}
