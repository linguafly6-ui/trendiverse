export default function TableOfContents({ headings }: { headings: { id: string; text: string }[] }) {
  if (headings.length < 2) return null
  return (
    <nav aria-label="Contenido del artículo" className="mx-auto my-6 max-w-prose rounded-xl border border-slate-200 p-4 dark:border-slate-800">
      <details open className="group">
        <summary className="cursor-pointer text-sm font-bold uppercase tracking-wide text-slate-600 dark:text-slate-400">En este artículo</summary>
        <ol className="mt-3 list-decimal space-y-1.5 pl-5 text-sm">
          {headings.map((h) => (
            <li key={h.id}><a href={`#${h.id}`} className="text-violet-700 hover:underline dark:text-violet-400">{h.text}</a></li>
          ))}
        </ol>
      </details>
    </nav>
  )
}
