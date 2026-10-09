import type { TicketBlockModel } from '@/lib/match-tickets'

export default function MatchTicketBlock({ model }: { model: TicketBlockModel }) {
  const { state } = model
  const interactive = state.kind === 'buy' || state.kind === 'match-info' || state.kind === 'official-site'
  return (
    <section
      aria-labelledby="entradas-partido-titulo"
      data-ticket-state={state.kind}
      className="mx-auto my-6 max-w-prose rounded-2xl border border-slate-300 bg-white p-5 text-slate-900 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
    >
      <h2 id="entradas-partido-titulo" className="text-lg font-extrabold">
        Entradas: {model.homeTeam} - {model.awayTeam}
      </h2>
      <p className="mt-1 text-sm text-slate-700 dark:text-slate-300">
        {model.competition}{model.venue && <> · {model.venue}</>}
        {model.whenLabel && model.dateTime && <> · <time dateTime={model.dateTime}>{model.whenLabel}</time></>}
      </p>
      {interactive ? (
        <a
          href={state.kind === 'buy' || state.kind === 'match-info' || state.kind === 'official-site' ? state.href : undefined}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-4 inline-flex min-h-[44px] items-center justify-center rounded-xl bg-violet-700 px-5 py-2 text-base font-bold text-white hover:bg-violet-800 focus-visible:outline focus-visible:outline-4 focus-visible:outline-offset-2 focus-visible:outline-violet-700 dark:bg-violet-500 dark:text-slate-950 dark:hover:bg-violet-400 dark:focus-visible:outline-violet-300"
        >
          {state.label}
          <span className="sr-only"> para {model.homeTeam} - {model.awayTeam} (se abre en una pestaña nueva)</span>
          <span aria-hidden="true" className="ml-2">↗</span>
        </a>
      ) : (
        <p
          role="status"
          className="mt-4 inline-block rounded-xl border border-slate-400 bg-slate-100 px-5 py-2 text-base font-bold text-slate-800 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200"
        >
          {state.label}
        </p>
      )}
      <p className="mt-3 text-sm text-slate-700 dark:text-slate-300">
        {state.note}
        {interactive && ' Se abre en una pestaña nueva.'}
      </p>
    </section>
  )
}
