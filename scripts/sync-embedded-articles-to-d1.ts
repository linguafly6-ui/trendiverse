import { execFileSync } from 'node:child_process'
import { writeFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { SAMPLE_ARTICLES } from './legacy-article-data'

const database = process.env.D1_DATABASE ?? 'trendiverse-preview'
const batchSize = 5

function sqlString(value: string | number | null | undefined): string {
  if (value === null || value === undefined) return 'NULL'
  if (typeof value === 'number') return String(Number.isFinite(value) ? value : 0)
  return "'" + value.replace(/'/g, "''") + "'"
}

function runWrangler(args: string[]): string {
  return execFileSync('npx', ['wrangler', ...args], {
    encoding: 'utf8',
    stdio: ['ignore', 'pipe', 'pipe'],
    env: process.env,
  })
}

function main() {
  if (!process.env.CLOUDFLARE_API_TOKEN || !process.env.CLOUDFLARE_ACCOUNT_ID) {
    throw new Error('Faltan CLOUDFLARE_API_TOKEN o CLOUDFLARE_ACCOUNT_ID para sincronizar el contenido legado a D1')
  }

  const unique = new Map<string, typeof SAMPLE_ARTICLES[number]>()
  for (const article of SAMPLE_ARTICLES) {
    if (article.slug && article.title && article.content && article.excerpt && !unique.has(article.slug)) {
      unique.set(article.slug, article)
    }
  }
  const articles = [...unique.values()]
  let insertedBatches = 0

  for (let offset = 0; offset < articles.length; offset += batchSize) {
    const batch = articles.slice(offset, offset + batchSize)
    const statements = batch.map((article) => {
      const fields = {
        title: article.title,
        slug: article.slug,
        category: article.category,
        content: article.content,
        excerpt: article.excerpt,
        image_url: article.image_url,
        thumbnail_url: article.thumbnail_url,
        read_time_minutes: article.read_time_minutes,
        views: article.views ?? 0,
        trending: Number(Boolean(article.trending)),
        published_at: article.published_at,
      }
      const columns = Object.keys(fields)
      const values = Object.values(fields).map(sqlString)
      return 'INSERT OR IGNORE INTO articles (' + columns.join(', ') + ') VALUES (' + values.join(', ') + ');'
    })
    const sqlPath = resolve('/tmp/trendiverse-legacy-articles.sql')
    writeFileSync(sqlPath, statements.join('\n'), 'utf8')
    runWrangler(['d1', 'execute', database, '--remote', `--file=${sqlPath}`])
    insertedBatches++
    console.log(`D1 bootstrap ${Math.min(offset + batch.length, articles.length)}/${articles.length} filas procesadas; las filas existentes no se sobrescriben.`)
  }

  const slugs = articles.map((article) => sqlString(article.slug))
  const verifySql = `SELECT COUNT(*) AS count FROM articles WHERE slug IN (${slugs.join(',')});`
  const raw = runWrangler(['d1', 'execute', database, '--remote', '--json', `--command=${verifySql}`])
  let count: number | undefined
  const visit = (value: unknown): void => {
    if (Array.isArray(value)) { for (const item of value) visit(item); return }
    if (!value || typeof value !== 'object') return
    const row = value as Record<string, unknown>
    if (typeof row.count === 'number') count = row.count
    for (const child of Object.values(row)) visit(child)
  }
  try { visit(JSON.parse(raw)) } catch { throw new Error('No se pudo interpretar la verificación final de D1') }
  if (count === undefined || count < articles.length) {
    throw new Error(`Verificación D1 incompleta: se esperaban al menos ${articles.length} artículos legados, se verificaron ${count ?? 'ninguno'}`)
  }
  console.log(JSON.stringify({ success: true, database, legacyArticles: articles.length, verifiedRows: count, batches: insertedBatches }))
}

try { main() } catch (error) {
  console.error(error instanceof Error ? error.message : String(error))
  process.exitCode = 1
}
