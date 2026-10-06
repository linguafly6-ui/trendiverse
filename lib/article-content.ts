export type ArticleBlock =
  | { type: 'heading'; id: string; text: string; level: 2 | 3 }
  | { type: 'paragraph'; text: string }
  | { type: 'list'; items: string[]; ordered: boolean }
  | { type: 'quote'; text: string }
  | { type: 'charging-map' }

const slugify = (s: string) =>
  s.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'seccion'

// Splits content on blank lines; paragraphs starting with "## " become headings.
// A heading followed directly by text on the next line (no blank line) is split
// into a heading block plus a paragraph block, so FAQ answers render correctly.
export function parseArticleContent(content: string | null | undefined): ArticleBlock[] {
  const used = new Map<string, number>()
  return (content ?? '')
    .split(/\n\s*\n/)
    .map((p) => p.trim())
    .filter(Boolean)
    .flatMap((p): ArticleBlock[] => {
      if (p === '[[charging-map]]') return [{ type: 'charging-map' }]
      // Headings: ## or ### (only the first line is the heading)
      const [firstLine, ...restLines] = p.split('\n')
      const h = /^(#{2,3})\s+(.+)$/.exec(firstLine)
      if (h) {
        const level = h[1].length === 2 ? 2 : 3
        const base = slugify(h[2])
        const n = used.get(base) ?? 0
        used.set(base, n + 1)
        const heading: ArticleBlock = { type: 'heading', id: n ? `${base}-${n}` : base, text: h[2].trim(), level }
        const rest = restLines.join('\n').trim()
        return rest ? [heading, { type: 'paragraph', text: rest }] : [heading]
      }
      // Blockquote: lines starting with >
      if (/^>\s+/.test(p)) {
        const text = p.split('\n').map((l) => l.replace(/^>\s+/, '')).join(' ')
        return [{ type: 'quote', text }]
      }
      // Unordered list: lines starting with - or *
      if (/^[\-\*]\s+/.test(p)) {
        const items = p.split('\n').map((l) => l.replace(/^[\-\*]\s+/, '').trim()).filter(Boolean)
        return [{ type: 'list', items, ordered: false }]
      }
      // Ordered list: lines starting with 1. 2. etc.
      if (/^\d+\.\s+/.test(p)) {
        const items = p.split('\n').map((l) => l.replace(/^\d+\.\s+/, '').trim()).filter(Boolean)
        return [{ type: 'list', items, ordered: true }]
      }
      return [{ type: 'paragraph', text: p }]
    })
}

export function getHeadings(blocks: ArticleBlock[]) {
  return blocks.flatMap((b) =>
    b.type === 'heading' && b.level === 2 ? [{ id: b.id, text: b.text }] : []
  )
}
