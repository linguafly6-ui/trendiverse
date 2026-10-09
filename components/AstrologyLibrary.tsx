import Link from 'next/link'
import { ASTROLOGY_GUIDES, astrologyGuidePath } from '@/lib/astrology-guides'

export default function AstrologyLibrary({ compact = false }: { compact?: boolean }) {
  if (compact) {
    return (
      <aside aria-labelledby="astro-learn-title" className="mt-8 border-t border-slate-200 pt-6 dark:border-slate-800">
        <h2 id="astro-learn-title" className="text-xl font-extrabold">Entiende lo que estás leyendo</h2>
        <p className="mt-2 leading-relaxed text-slate-600 dark:text-slate-300">
          Tu horóscopo semanal es una lectura general por signo solar. Para ir más allá, empieza por distinguir los datos de tu carta y su interpretación.
        </p>
        <ul className="mt-3 flex flex-wrap gap-2">
          {ASTROLOGY_GUIDES.map((guide) => (
            <li key={guide.slug}>
              <Link href={astrologyGuidePath(guide.slug)} className="inline-flex min-h-11 items-center rounded-lg border border-slate-200 px-3 text-sm font-semibold hover:border-indigo-400 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 dark:border-slate-700">
                {guide.slug === 'fases-de-la-luna' ? 'Fases de la Luna' : guide.slug === 'mercurio-retrogrado' ? 'Mercurio retrógrado' : guide.slug === 'signo-lunar' ? 'Signo lunar' : guide.slug === 'carta-natal' ? 'Carta natal' : guide.slug === 'ascendente' ? 'Ascendente' : 'Eclipses'}
              </Link>
            </li>
          ))}
        </ul>
      </aside>
    )
  }

  return (
    <section id="aprender-astrologia" aria-labelledby="astro-library-title" className="scroll-mt-32">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div className="max-w-2xl">
          <p className="text-sm font-semibold uppercase tracking-wide text-indigo-700 dark:text-indigo-300">Biblioteca de astrología</p>
          <h2 id="astro-library-title" className="mt-1 text-2xl font-extrabold">Tu signo es solo el principio</h2>
          <p className="mt-2 leading-relaxed text-slate-600 dark:text-slate-300">
            Aprende a leer una carta, reconoce lo que ocurre en el cielo y distingue un dato comprobado de una interpretación simbólica.
          </p>
        </div>
        <Link href="/astrologia/guias" className="inline-flex min-h-11 items-center font-semibold text-indigo-700 underline underline-offset-4 dark:text-indigo-300">Todas las guías</Link>
      </div>
      <ul className="mt-5 grid gap-x-8 sm:grid-cols-2">
        {ASTROLOGY_GUIDES.map((guide) => (
          <li key={guide.slug} className="border-t border-slate-200 dark:border-slate-800">
            <Link href={astrologyGuidePath(guide.slug)} className="group block py-5 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">{guide.eyebrow}</p>
              <h3 className="mt-1 text-lg font-bold group-hover:text-indigo-700 dark:group-hover:text-indigo-300">{guide.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-slate-600 dark:text-slate-300">{guide.summary}</p>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  )
}
