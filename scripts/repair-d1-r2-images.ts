import { execFileSync } from 'node:child_process'

const database = process.env.D1_DATABASE ?? 'trendiverse-preview'
const publicBase = (process.env.R2_PUBLIC_BASE_URL ?? 'https://pub-00a2ec9ac5c947ae8297dfc22e57718b.r2.dev').replace(/\/$/, '')
const concurrency = 3

function runWrangler(args: string[]): string {
  return execFileSync('npx', ['wrangler', ...args], {
    encoding: 'utf8',
    stdio: ['ignore', 'pipe', 'pipe'],
    env: process.env,
  })
}

function collectRows(value: unknown, rows: Record<string, unknown>[] = []): Record<string, unknown>[] {
  if (Array.isArray(value)) {
    for (const item of value) collectRows(item, rows)
  } else if (value && typeof value === 'object') {
    const record = value as Record<string, unknown>
    if (typeof record.slug === 'string' && ('image_url' in record || 'thumbnail_url' in record)) rows.push(record)
    else for (const child of Object.values(record)) collectRows(child, rows)
  }
  return rows
}

function readArticles(): Record<string, unknown>[] {
  const raw = runWrangler([
    'd1', 'execute', database, '--remote', '--json',
    '--command=SELECT slug, title, image_url, thumbnail_url FROM articles ORDER BY slug;',
  ])
  const start = raw.search(/[\[{]/)
  if (start < 0) throw new Error('Wrangler no devolvió JSON al consultar artículos')
  return collectRows(JSON.parse(raw.slice(start)))
}

async function main() {
  if (!process.env.CLOUDFLARE_API_TOKEN || !process.env.CLOUDFLARE_ACCOUNT_ID) {
    throw new Error('Faltan credenciales de Cloudflare para reparar imágenes')
  }
  const articles = readArticles()
  if (!articles.length) throw new Error('D1 no devolvió artículos; se cancela la reparación')

  const candidates = articles.filter((row) => {
    const slug = String(row.slug)
    const imageUrl = typeof row.image_url === 'string' ? row.image_url : ''
    const thumbnailUrl = typeof row.thumbnail_url === 'string' ? row.thumbnail_url : ''
    return !imageUrl.startsWith(publicBase + '/articles/' + slug + '.') || thumbnailUrl !== imageUrl
  })
  console.log(JSON.stringify({
    action: 'repair-d1-r2-images',
    database,
    totalArticles: articles.length,
    candidates: candidates.length,
    note: 'Solo se migran artículos cuya URL no corresponde a su objeto público R2 por slug o cuya miniatura no coincide. El publicador conserva título y contenido de D1 y verifica SHA-256 del objeto subido.',
  }))

  let cursor = 0
  let succeeded = 0
  let failed = 0
  const failures: { slug: string; error: string }[] = []
  async function worker() {
    while (true) {
      const index = cursor++
      if (index >= candidates.length) return
      const slug = String(candidates[index].slug)
      try {
        const output = execFileSync('npx', ['tsx', 'scripts/publish-editorial-article.ts', slug], {
          encoding: 'utf8',
          stdio: ['ignore', 'pipe', 'pipe'],
          env: process.env,
          timeout: 180_000,
        })
        succeeded++
        console.log('R2_REPAIR_OK ' + slug + ' ' + output.trim().split('\n').slice(-1)[0])
      } catch (error) {
        failed++
        const e = error as { stderr?: Buffer; message?: string }
        const detail = String(e.stderr ?? e.message ?? 'error desconocido').trim().slice(-1200)
        failures.push({ slug, error: detail })
        console.error('R2_REPAIR_FAILED ' + slug + ': ' + detail)
      }
    }
  }
  await Promise.all(Array.from({ length: Math.min(concurrency, candidates.length) }, () => worker()))
  console.log(JSON.stringify({
    action: 'repair-d1-r2-images-result',
    database,
    totalArticles: articles.length,
    candidates: candidates.length,
    succeeded,
    failed,
    failures,
  }, null, 2))
  // Failures are reported without aborting deployment; successful records are verified by the publisher.
}

main().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : String(error))
  process.exitCode = 1
})
