import { execFileSync } from 'node:child_process'

const database = process.env.D1_DATABASE ?? 'trendiverse-preview'
const publicBase = (process.env.R2_PUBLIC_BASE_URL ?? 'https://pub-00a2ec9ac5c947ae8297dfc22e57718b.r2.dev').replace(/\/$/, '')
const timeoutMs = 12000
const concurrency = 8

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

async function checkUrl(value: unknown): Promise<{ url: string; status: number | string; ok: boolean }> {
  if (typeof value !== 'string' || !value.trim()) return { url: String(value ?? ''), status: 'missing', ok: false }
  try {
    const response = await fetch(value, {
      method: 'GET',
      headers: { Range: 'bytes=0-0' },
      signal: AbortSignal.timeout(timeoutMs),
      redirect: 'follow',
    })
    await response.body?.cancel()
    return { url: value, status: response.status, ok: response.ok }
  } catch (error) {
    return { url: value, status: error instanceof Error ? error.name : 'network-error', ok: false }
  }
}

async function main() {
  if (!process.env.CLOUDFLARE_API_TOKEN || !process.env.CLOUDFLARE_ACCOUNT_ID) {
    throw new Error('Faltan credenciales de Cloudflare para auditar D1')
  }
  const raw = runWrangler([
    'd1', 'execute', database, '--remote', '--json',
    '--command=SELECT slug, title, image_url, thumbnail_url FROM articles ORDER BY slug;',
  ])
  const jsonStart = raw.search(/[\\[{]/)
  if (jsonStart < 0) throw new Error('Wrangler no devolvió JSON para auditar D1')
  const rows = collectRows(JSON.parse(raw.slice(jsonStart)))
  if (!rows.length) throw new Error('La consulta de D1 no devolvió artículos; se cancela la auditoría')

  const issues: Record<string, unknown>[] = []
  let checked = 0
  for (let offset = 0; offset < rows.length; offset += concurrency) {
    const batch = rows.slice(offset, offset + concurrency)
    const results = await Promise.all(batch.map(async (row) => {
      const slug = String(row.slug)
      const imageUrl = typeof row.image_url === 'string' ? row.image_url : ''
      const thumbnailUrl = typeof row.thumbnail_url === 'string' ? row.thumbnail_url : ''
      const image = await checkUrl(imageUrl)
      const thumbnail = thumbnailUrl === imageUrl ? image : await checkUrl(thumbnailUrl)
      const expectedPrefix = publicBase + '/articles/' + slug + '.'
      const r2Match = imageUrl.startsWith(expectedPrefix) && thumbnailUrl === imageUrl
      checked++
      if (!image.ok || !thumbnail.ok || !r2Match) {
        return {
          slug,
          title: row.title,
          imageStatus: image.status,
          thumbnailStatus: thumbnail.status,
          imageUrl,
          thumbnailUrl,
          r2KeyMatch: r2Match,
        }
      }
      return null
    }))
    issues.push(...results.filter((x): x is Record<string, unknown> => x !== null))
    console.log('Auditoría de imágenes: ' + Math.min(offset + batch.length, rows.length) + '/' + rows.length)
  }

  const report = {
    audit: 'trendiverse-d1-r2-images',
    database,
    publicBase,
    articlesChecked: checked,
    fullyValid: rows.length - issues.length,
    issuesCount: issues.length,
    issues,
  }
  console.log(JSON.stringify(report, null, 2))
  // Audit is intentionally report-only: don't block publishing or rewrite records until each issue is reviewed.
}

main().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : String(error))
  process.exitCode = 1
})
