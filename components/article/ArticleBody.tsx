import Link from 'next/link'
import type { ArticleBlock } from '@/lib/article-content'
import ChargingPointsMap from '@/components/article/ChargingPointsMap'

// Only internal paths ("/...") and http(s) URLs are allowed as link targets.
function safeHref(href: string): string | null {
  if (href.startsWith('/') && !href.startsWith('//')) return href
  if (/^https?:\/\//i.test(href)) return href
  return null
}

/**
 * Renders inline markdown: [text](url), **bold** and *italic*.
 * Returns an array of React nodes.
 */
function renderInline(text: string): React.ReactNode[] {
  const nodes: React.ReactNode[] = []
  const regex = /(\[[^\]]+\]\([^)\s]+\)|\*\*[^*]+\*\*|\*[^*]+\*)/g
  let lastIndex = 0
  let match: RegExpExecArray | null
  let key = 0

  while ((match = regex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      nodes.push(text.slice(lastIndex, match.index))
    }
    const segment = match[0]
    if (segment.startsWith('[')) {
      const m = /^\[([^\]]+)\]\(([^)\s]+)\)$/.exec(segment)
      const label = m ? m[1] : segment
      const href = m ? safeHref(m[2]) : null
      if (!href) {
        nodes.push(label)
      } else if (href.startsWith('/')) {
        nodes.push(
          <Link key={key++} href={href} className="font-medium text-violet-700 underline underline-offset-2 hover:text-violet-900 dark:text-violet-300">
            {label}
          </Link>
        )
      } else {
        nodes.push(
          <a key={key++} href={href} target="_blank" rel="noopener noreferrer" className="font-medium text-violet-700 underline underline-offset-2 hover:text-violet-900 dark:text-violet-300">
            {label}
          </a>
        )
      }
    } else if (segment.startsWith('**')) {
      nodes.push(
        <strong key={key++} className="font-bold text-slate-900 dark:text-white">
          {segment.slice(2, -2)}
        </strong>
      )
    } else {
      nodes.push(
        <em key={key++} className="italic">
          {segment.slice(1, -1)}
        </em>
      )
    }
    lastIndex = regex.lastIndex
  }
  if (lastIndex < text.length) {
    nodes.push(text.slice(lastIndex))
  }
  return nodes
}

export default function ArticleBody({ blocks }: { blocks: ArticleBlock[] }) {
  return (
    <div className="mx-auto max-w-prose">
      <div className="space-y-6 text-[1.075rem] leading-8 text-slate-700 dark:text-slate-300">
        {blocks.map((b, i) => {
          if (b.type === 'charging-map') return <ChargingPointsMap key={i} />
          if (b.type === 'heading' && b.level === 2) {
            return (
              <h2
                key={i}
                id={b.id}
                className="mb-3 mt-12 scroll-mt-24 border-l-4 border-violet-500 pl-4 text-2xl font-extrabold leading-snug text-slate-900 dark:text-white"
              >
                {b.text}
              </h2>
            )
          }
          if (b.type === 'heading' && b.level === 3) {
            return (
              <h3
                key={i}
                className="mb-2 mt-8 scroll-mt-24 text-xl font-bold leading-snug text-slate-800 dark:text-slate-100"
              >
                {b.text}
              </h3>
            )
          }
          if (b.type === 'list') {
            return (
              <ul
                key={i}
                className={`space-y-2 pl-1 ${b.ordered ? 'list-none' : ''}`}
              >
                {b.items.map((item, j) => (
                  <li key={j} className="flex items-start gap-3">
                    {!b.ordered && (
                      <span className="mt-2.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-violet-500" />
                    )}
                    {b.ordered && (
                      <span className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-violet-100 text-xs font-bold text-violet-700 dark:bg-violet-900/40 dark:text-violet-300">
                        {j + 1}
                      </span>
                    )}
                    <span className="leading-8">{renderInline(item)}</span>
                  </li>
                ))}
              </ul>
            )
          }
          if (b.type === 'table') {
            return (
              <div key={i} className="my-8 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-700 dark:bg-slate-900">
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[640px] border-collapse text-left text-sm leading-relaxed">
                    <thead className="bg-violet-50 text-slate-900 dark:bg-violet-950/50 dark:text-slate-100">
                      <tr>
                        {b.headers.map((header, j) => (
                          <th key={j} scope="col" className="border-b border-slate-200 px-4 py-3 font-bold dark:border-slate-700">
                            {renderInline(header)}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {b.rows.map((row, rowIndex) => (
                        <tr key={rowIndex} className={rowIndex % 2 === 0 ? 'bg-white dark:bg-slate-900' : 'bg-slate-50/80 dark:bg-slate-800/60'}>
                          {b.headers.map((_, colIndex) => (
                            <td key={colIndex} className="border-b border-slate-100 px-4 py-3 align-top text-slate-700 last:border-r-0 dark:border-slate-800 dark:text-slate-300">
                              {renderInline(row[colIndex] ?? '')}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )
          }
          if (b.type === 'quote') {
            return (
              <blockquote
                key={i}
                className="rounded-r-lg border-l-4 border-violet-400 bg-violet-50 py-3 pl-5 pr-4 text-base italic text-slate-600 dark:border-violet-600 dark:bg-violet-950/30 dark:text-slate-400"
              >
                {renderInline(b.text)}
              </blockquote>
            )
          }
          // Paragraph
          return (
            <p key={i} className="whitespace-pre-line">
              {renderInline(b.text)}
            </p>
          )
        })}
      </div>
    </div>
  )
}
