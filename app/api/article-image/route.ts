const PALETTES: Record<string, { bg: string; ink: string; accent: string; accent2: string }> = {
  politica: { bg: '#eef2ff', ink: '#312e81', accent: '#6366f1', accent2: '#c7d2fe' },
  economia: { bg: '#ecfdf5', ink: '#064e3b', accent: '#059669', accent2: '#a7f3d0' },
  deportes: { bg: '#fff7ed', ink: '#7c2d12', accent: '#f59e0b', accent2: '#fed7aa' },
  virales: { bg: '#fff1f2', ink: '#881337', accent: '#e11d48', accent2: '#fecdd3' },
  gaming: { bg: '#ecfdf5', ink: '#064e3b', accent: '#10b981', accent2: '#a7f3d0' },
  coches: { bg: '#eff6ff', ink: '#0c4a6e', accent: '#0284c7', accent2: '#bae6fd' },
  tecnologia: { bg: '#f5f3ff', ink: '#4c1d95', accent: '#8b5cf6', accent2: '#ddd6fe' },
  'empresas-que-transforman': { bg: '#f0fdfa', ink: '#134e4a', accent: '#0f766e', accent2: '#99f6e4' },
  moda: { bg: '#fdf2f8', ink: '#831843', accent: '#db2777', accent2: '#fbcfe8' },
  hogar: { bg: '#faf5ee', ink: '#6b4934', accent: '#b77952', accent2: '#e7d4b5' },
  chollos: { bg: '#fff7ed', ink: '#7c2d12', accent: '#f97316', accent2: '#fed7aa' },
  astrologia: { bg: '#eef2ff', ink: '#312e81', accent: '#6366f1', accent2: '#c7d2fe' },
  conciertos: { bg: '#fff1f2', ink: '#881337', accent: '#be123c', accent2: '#fecdd3' },
  'segunda-mano': { bg: '#f0fdfa', ink: '#134e4a', accent: '#0d9488', accent2: '#99f6e4' },
}
const xml = (value: string) => value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&apos;')
const hash = (value: string) => Array.from(value).reduce((n, c) => (n * 31 + c.charCodeAt(0)) >>> 0, 7)

function motif(category: string, seed: number, accent: string, accent2: string) {
  const x = 770 + (seed % 80)
  if (category === 'hogar') return `<rect x="690" y="255" width="300" height="170" rx="32" fill="${accent}"/><rect x="665" y="320" width="350" height="135" rx="24" fill="${accent}"/><rect x="730" y="275" width="90" height="90" rx="14" fill="${accent2}"/><rect x="835" y="275" width="125" height="90" rx="14" fill="#fffaf1"/><path d="M820 455v55m-42 0h84" stroke="${accent}" stroke-width="14" stroke-linecap="round"/><path d="M970 315v-125m-40 45q40-80 80 0m-75 42q35-60 70 0" fill="none" stroke="#527456" stroke-width="14" stroke-linecap="round"/><path d="M920 315h100l-12 54h-76z" fill="${accent2}"/>`
  if (category === 'deportes') return `<circle cx="${x}" cy="335" r="122" fill="${accent2}"/><circle cx="${x}" cy="335" r="94" fill="none" stroke="${accent}" stroke-width="8"/><path d="M${x-90} 290l180 90m-170-150l150 210m-210-60l180-90m-130 170l150-210" stroke="${accent}" stroke-width="5" opacity=".6"/>`
  if (category === 'coches') return `<path d="M665 365l38-78q10-22 38-22h155q24 0 42 26l43 74 30 15v65H650v-54z" fill="${accent}"/><path d="M755 283h135l30 57H725z" fill="${accent2}"/><circle cx="735" cy="445" r="35" fill="${ink}"/><circle cx="735" cy="445" r="15" fill="${accent2}"/><circle cx="950" cy="445" r="35" fill="${ink}"/><circle cx="950" cy="445" r="15" fill="${accent2}"/>`
  if (category === 'gaming') return `<rect x="675" y="275" width="310" height="175" rx="42" fill="${accent}"/><path d="M735 330h62m-31-31v62" stroke="${accent2}" stroke-width="13" stroke-linecap="round"/><circle cx="900" cy="325" r="12" fill="${accent2}"/><circle cx="935" cy="355" r="12" fill="${accent2}"/><path d="M725 450l-30 45m240-45l30 45" stroke="${ink}" stroke-width="12" stroke-linecap="round"/>`
  if (category === 'tecnologia' || category === 'empresas-que-transforman') return `<rect x="700" y="215" width="255" height="245" rx="30" fill="${accent2}"/><rect x="735" y="250" width="185" height="165" rx="18" fill="${accent}"/><path d="M765 335l35 35 80-90" fill="none" stroke="#fff" stroke-width="15" stroke-linecap="round" stroke-linejoin="round"/><path d="M810 460v45m-50 0h100" stroke="${ink}" stroke-width="12" stroke-linecap="round"/>`
  if (category === 'moda') return `<path d="M760 220l60-24 48 30 65-30 62 30-35 90-38-16 20 190H750l20-190-38 16z" fill="${accent}"/><path d="M820 196q20 54 48 30q30 24 48-30" fill="none" stroke="${accent2}" stroke-width="10"/>`
  if (category === 'economia' || category === 'chollos') return `<rect x="690" y="365" width="65" height="105" rx="10" fill="${accent2}"/><rect x="780" y="310" width="65" height="160" rx="10" fill="${accent}"/><rect x="870" y="250" width="65" height="220" rx="10" fill="${accent2}"/><path d="M680 300l90-55 70 20 100-95" fill="none" stroke="${ink}" stroke-width="12" stroke-linecap="round"/><path d="M915 170h25v25" fill="none" stroke="${ink}" stroke-width="12" stroke-linecap="round"/>`
  if (category === 'astrologia') return `<circle cx="835" cy="335" r="125" fill="${accent2}"/><circle cx="880" cy="300" r="112" fill="${accent}"/><circle cx="905" cy="265" r="112" fill="${accent2}"/><g fill="${ink}"><circle cx="720" cy="230" r="6"/><circle cx="975" cy="240" r="8"/><circle cx="950" cy="440" r="5"/><circle cx="705" cy="405" r="7"/></g>`
  if (category === 'conciertos') return `<path d="M705 400V265l115-55v190m0-120l115-55v175m0-90l80-40v120" fill="none" stroke="${accent}" stroke-width="18" stroke-linejoin="round"/><circle cx="705" cy="420" r="25" fill="${accent2}"/><circle cx="820" cy="420" r="25" fill="${accent2}"/><circle cx="935" cy="390" r="25" fill="${accent2}"/>`
  if (category === 'segunda-mano') return `<path d="M835 220l-125 70 50 85 125-70z" fill="${accent}"/><path d="M760 375l-70 45 50 80 80-45z" fill="${accent2}"/><path d="M870 305l100 60-50 85-100-60z" fill="${ink}"/>`
  return `<circle cx="835" cy="335" r="120" fill="${accent2}"/><circle cx="835" cy="335" r="82" fill="${accent}"/><path d="M790 335h90m-45-45v90" stroke="#fff" stroke-width="12" stroke-linecap="round"/>`
}

export async function GET(request: Request) {
  const url = new URL(request.url)
  const title = (url.searchParams.get('title') || 'TrendiVerse').slice(0, 180)
  const category = (url.searchParams.get('category') || 'tecnologia').slice(0, 60)
  const slug = (url.searchParams.get('slug') || title).slice(0, 180)
  const palette = PALETTES[category] || PALETTES.tecnologia
  const seed = hash(slug)
  const categoryLabel = category.replace(/-/g, ' ').toLocaleUpperCase('es-ES')
  const lines = title.match(/.{1,34}(?:\s|$)/g) || [title]
  const titleLines = lines.slice(0, 3).map((line, i) => `<text x="72" y="${360 + i * 58}" font-family="Arial, Helvetica, sans-serif" font-size="43" font-weight="700" fill="${palette.ink}">${xml(line.trim())}</text>`).join('')
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630" role="img" aria-labelledby="title desc"><title id="title">${xml(title)}</title><desc id="desc">Ilustración editorial original de TrendiVerse para el artículo ${xml(title)}.</desc><defs><linearGradient id="bg" x1="0" y1="0" x2="1" y2="1"><stop stop-color="${palette.bg}"/><stop offset="1" stop-color="${palette.accent2}"/></linearGradient></defs><rect width="1200" height="630" fill="url(#bg)"/><circle cx="1090" cy="70" r="240" fill="${palette.accent2}" opacity=".65"/><circle cx="120" cy="610" r="220" fill="${palette.accent2}" opacity=".5"/><rect x="54" y="54" width="1092" height="522" rx="34" fill="#ffffff" opacity=".62"/><text x="72" y="112" font-family="Arial, Helvetica, sans-serif" font-size="24" font-weight="700" letter-spacing="5" fill="${palette.accent}">TRENDIVERSE · ${xml(categoryLabel)}</text><rect x="72" y="150" width="110" height="8" rx="4" fill="${palette.accent}"/>${titleLines}<g opacity=".96">${motif(category, seed, palette.accent, palette.accent2)}</g><text x="72" y="530" font-family="Arial, Helvetica, sans-serif" font-size="20" fill="${palette.ink}" opacity=".8">Guía y actualidad · TrendiVerse</text><path d="M1060 520h34m-17-17v34" stroke="${palette.accent}" stroke-width="6" stroke-linecap="round"/></svg>`
  return new Response(svg, { headers: { 'Content-Type': 'image/svg+xml; charset=utf-8', 'Cache-Control': 'public, max-age=86400, s-maxage=604800, stale-while-revalidate=86400', 'X-Content-Type-Options': 'nosniff' } })
}
