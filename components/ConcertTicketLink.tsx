import type { Concert } from '@/lib/concerts'
import { ticketLabel, ticketNote, ticketsFor } from '@/lib/concert-tickets'

export default function ConcertTicketLink({ concert, compact = false }: { concert: Concert; compact?: boolean }) {
  const tickets = ticketsFor(concert)
  const label = ticketLabel(concert)
  const buy = tickets.state === 'abierta'
  return (
    <p className={compact ? 'mt-2' : 'mt-4'}>
      <a
        href={tickets.url}
        target="_blank"
        rel="noopener noreferrer"
        aria-label={`${label} de ${concert.artist} en ${concert.city}`}
        className={buy
          ? 'inline-flex rounded-full bg-rose-700 px-4 py-2 text-sm font-semibold text-white hover:bg-rose-800'
          : 'inline-flex rounded-full border border-rose-700 px-4 py-2 text-sm font-semibold text-rose-700 hover:bg-rose-50 dark:text-rose-300 dark:hover:bg-rose-950'}
      >
        {label}
      </a>
      {compact ? null : <span className="mt-2 block text-sm leading-relaxed text-slate-600 dark:text-slate-300">{ticketNote(concert)}</span>}
    </p>
  )
}
