export default function TableOfContents({ headings }: { headings: { id: string; text: string }[] }) {
  if (headings.length < 2) return null
  return (
    <nav aria-label="Contenido del artículo" className="mx-auto my-8 max-w-prose rounded-2xl border border-slate-200 bg-slate-50 p-5 dark:border-slate-800 dark:bg-slate-900/50">
      <details open className="group">
        <summary className="flex cursor-pointer items-center gap-2 text-sm font-bold uppercase tracking-wide text-slate-700 dark:text-slate-300">
          <svg className="h-4 w-4 text-violet-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h7" />
          </svg>
          En este artículo
        </summary>
        <ol className="mt-4 space-y-2 pl-6 text-sm">
          {headings.map((h, i) => (
            <li key={h.id} className="flex items-start gap-2">
              <span className="mt-0.5 font-bold text-violet-400">{i + 1}.</span>
              <a href={`#${h.id}`} className="text-slate-600 transition hover:text-violet-700 hover:underline dark:text-slate-400 dark:hover:text-violet-400">
                {h.text}
              </a>
            </li>
          ))}
        </ol>
      </details>
    </nav>
  )
}
