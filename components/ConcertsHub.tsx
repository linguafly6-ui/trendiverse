import Link from 'next/link'
import ConcertTicketLink from '@/components/ConcertTicketLink'
import { concertCities, concertsFor, CONCERTS_GUIDE_SLUG, groupByMonth, AGENDA_UPDATED, type ConcertTier } from '@/lib/concerts'

export default function ConcertsHub({
  variant = 'full',
  ciudad,
  tier,
}: {
  variant?: 'full' | 'strip'
  ciudad?: string
  tier?: ConcertTier
}) {
  const concerts = concertsFor({ ciudad, tier })
  const groups = groupByMonth(concerts)

  if (variant === 'strip') {
    const next = concertsFor().slice(0, 4)
    return (
      <section aria-labelledby="concerts-strip-title" className="rounded-2xl border border-rose-100 bg-rose-50/70 p-5 dark:border-rose-900 dark:bg-rose-950/30 sm:p-6">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div className="max-w-3xl">
            <p className="text-sm font-semibold uppercase tracking-wide text-rose-700 dark:text-rose-300">Actualizado el {AGENDA_UPDATED}</p>
            <h2 id="concerts-strip-title" className="mt-1 text-2xl font-extrabold">Entradas para conciertos en España</h2>
            <p className="mt-2 text-sm leading-relaxed text-slate-600 dark:text-slate-300">
              Lo que queda de 2026 y lo ya fechado para 2027. Cada cita abre su ficha y la página donde se venden las entradas.
            </p>
          </div>
          <Link href="/conciertos" className="text-sm font-semibold text-rose-700 underline decoration-rose-300 underline-offset-4 dark:text-rose-300">
            Abrir la agenda
          </Link>
        </div>
        <ul className="mt-4 grid gap-2 sm:grid-cols-2">
          {next.map((concert) => (
            <li key={concert.id}>
              <div className="rounded-xl border border-slate-200 bg-white px-3 py-2 dark:border-slate-800 dark:bg-slate-900">
                <Link href={`/conciertos/${concert.id}`} className="block">
                  <p className="text-sm font-semibold">Entradas {concert.artist}</p>
                  <p className="text-xs text-slate-500">{concert.when} · {concert.city}</p>
                </Link>
                <ConcertTicketLink concert={concert} compact />
              </div>
            </li>
          ))}
        </ul>
      </section>
    )
  }

  const cities = concertCities()

  return (
    <div className="space-y-6">
      <header>
        <p className="text-sm font-semibold uppercase tracking-wide text-rose-700 dark:text-rose-300">Actualizado el {AGENDA_UPDATED}</p>
        <h1 className="mt-1 text-3xl font-extrabold tracking-tight sm:text-4xl">Entradas para conciertos en España, 2026 y 2027</h1>
        <p className="mt-3 max-w-3xl leading-relaxed text-slate-600 dark:text-slate-300">
          Agenda de grandes citas que siguen vigentes desde el 8 de octubre de 2026 y de lo que ya tiene fecha en 2027. Cada ficha dice de dónde sale, si las entradas están a la venta y enlaza la página oficial donde se compran. Una sala de barrio puede anunciar su mes la semana que viene: eso no cabe en una lista cerrada de dos años.
        </p>
        <p className="mt-3 text-sm">
          <Link className="font-semibold text-rose-700 underline decoration-rose-300 underline-offset-4 dark:text-rose-300" href={`/articles/${CONCERTS_GUIDE_SLUG}`}>
            Cómo está hecha esta agenda y qué ha quedado fuera
          </Link>
        </p>
      </header>

      <div className="flex flex-wrap gap-2" aria-label="Filtrar la agenda">
        <Filter href="/conciertos" active={!ciudad && !tier}>Todo</Filter>
        <Filter href="/conciertos?lista=confirmado" active={tier === 'confirmado' && !ciudad}>Confirmados</Filter>
        <Filter href="/conciertos?lista=agenda" active={tier === 'agenda' && !ciudad}>Solo en taquilla</Filter>
        {cities.map((city) => (
          <Filter key={city} href={`/conciertos?ciudad=${encodeURIComponent(city)}`} active={ciudad === city}>{city}</Filter>
        ))}
      </div>

      <p className="text-sm text-slate-500">{concerts.length} citas en esta vista. Las marcadas como taquilla no tienen, en esta revisión, una nota de un medio o del recinto.</p>

      {groups.map((group) => (
        <section key={group.label} aria-labelledby={`mes-${group.label}`}>
          <h2 id={`mes-${group.label}`} className="text-xl font-extrabold capitalize">{group.label}</h2>
          <ul className="mt-3 space-y-3">
            {group.items.map((concert) => (
              <li key={concert.id} id={concert.id} className="scroll-mt-24 rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
                <p className="text-xs font-semibold uppercase tracking-wide text-rose-700 dark:text-rose-300">
                  {concert.tier === 'confirmado' ? 'Confirmado' : 'Agenda de entradas'}
                  {concert.datesPending ? ' · días por cerrar' : ''}
                </p>
                <h3 className="mt-1 text-lg font-bold">
                  <Link href={`/conciertos/${concert.id}`} className="hover:text-rose-700 dark:hover:text-rose-300">Entradas {concert.artist} en {concert.city}</Link>
                </h3>
                <p className="text-sm font-medium">{concert.title}</p>
                <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">{concert.when}</p>
                <p className="text-sm text-slate-600 dark:text-slate-300">{concert.venue} · {concert.city}</p>
                <ConcertTicketLink concert={concert} />
                <p className="mt-2 text-sm leading-relaxed">{concert.detail}</p>
                <p className="mt-2 text-sm">
                  <a className="font-semibold text-rose-700 underline decoration-rose-300 underline-offset-4 dark:text-rose-300" href={concert.sourceUrl}>
                    Fuente: {concert.sourceName}
                  </a>
                </p>
              </li>
            ))}
          </ul>
        </section>
      ))}
    </div>
  )
}

function Filter({ href, active, children }: { href: string; active: boolean; children: string }) {
  return (
    <Link
      href={href}
      className={`rounded-full border px-3 py-1 text-sm font-medium ${active ? 'border-rose-700 bg-rose-700 text-white' : 'border-slate-200 hover:border-rose-400 dark:border-slate-700'}`}
      aria-current={active ? 'page' : undefined}
    >
      {children}
    </Link>
  )
}
