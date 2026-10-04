export type ArticleBlock =
  | { type: 'heading'; id: string; text: string }
  | { type: 'paragraph'; text: string }

const slugify = (s: string) =>
  s.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'seccion'

// Splits content on blank lines; paragraphs starting with "## " become headings.
export function parseArticleContent(content: string | null | undefined): ArticleBlock[] {
  const used = new Map<string, number>()
  return (content ?? '')
    .split(/\n\s*\n/)
    .map((p) => p.trim())
    .filter(Boolean)
    .map((p): ArticleBlock => {
      const m = /^#{2,3}\s+(.+)$/.exec(p)
      if (!m) return { type: 'paragraph', text: p }
      const base = slugify(m[1])
      const n = used.get(base) ?? 0
      used.set(base, n + 1)
      return { type: 'heading', id: n ? `${base}-${n}` : base, text: m[1].trim() }
    })
}

export function getHeadings(blocks: ArticleBlock[]) {
  return blocks.flatMap((b) => (b.type === 'heading' ? [{ id: b.id, text: b.text }] : []))
}
