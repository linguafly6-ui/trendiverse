import { createHash } from 'node:crypto'
import { execFileSync } from 'node:child_process'
import { existsSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { extname, join, resolve } from 'node:path'
import { pathToFileURL } from 'node:url'
import { SAMPLE_ARTICLES } from '../lib/db'

const DATABASE = 'trendiverse-db'
const BUCKET = process.env.R2_BUCKET ?? 'trendiverse-articles'
const PUBLIC_BASE_URL = (process.env.R2_PUBLIC_BASE_URL ?? '').replace(/\/$/, '')
const ROOT = process.cwd()

function sqlString(value: string): string {
  return "'" + value.replace(/'/g, "''") + "'"
}

function runWrangler(args: string[]): string {
  try {
    return execFileSync('npx', ['wrangler', ...args], {
      cwd: ROOT,
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'pipe'],
      env: process.env,
    })
  } catch (error) {
    const details = error && typeof error === 'object' && 'stderr' in error
      ? String((error as { stderr?: Buffer }).stderr ?? '').trim()
      : ''
    throw new Error(`wrangler ${args.join(' ')} falló${details ? `: ${details}` : ''}`)
  }
}

function contentTypeFor(path: string, fallback = 'application/octet-stream'): string {
  switch (extname(path).toLowerCase()) {
    case '.svg': return 'image/svg+xml'
    case '.jpg':
    case '.jpeg': return 'image/jpeg'
    case '.png': return 'image/png'
    case '.webp': return 'image/webp'
    case '.avif': return 'image/avif'
    case '.gif': return 'image/gif'
    default: return fallback
  }
}

async function resolveImage(articleImageUrl: string, tempDir: string): Promise<{ path: string; contentType: string; extension: string }> {
  if (articleImageUrl.startsWith('/')) {
    const publicRoot = resolve(ROOT, 'public')
    const path = resolve(publicRoot, articleImageUrl.slice(1))
    if (!path.startsWith(publicRoot + '/') || !existsSync(path)) {
      throw new Error(`No se encuentra el archivo de imagen local: ${articleImageUrl}`)
    }
    const extension = extname(path).toLowerCase()
    if (!extension) throw new Error('La imagen local no tiene extensión reconocible')
    return { path, contentType: contentTypeFor(path), extension }
  }

  const remoteUrl = new URL(articleImageUrl)
  if (remoteUrl.protocol !== 'https:' && remoteUrl.protocol !== 'http:') {
    throw new Error('La URL de imagen debe usar HTTP o HTTPS')
  }
  const response = await fetch(remoteUrl, { signal: AbortSignal.timeout(30_000) })
  if (!response.ok) throw new Error(`No se pudo descargar la imagen (${response.status})`)
  const headerType = response.headers.get('content-type')?.split(';')[0].trim() ?? ''
  if (!headerType.startsWith('image/')) throw new Error(`El recurso no es una imagen: ${headerType || 'tipo desconocido'}`)
  const urlExtension = extname(remoteUrl.pathname).toLowerCase()
  const extension = ['.svg', '.jpg', '.jpeg', '.png', '.webp', '.avif', '.gif'].includes(urlExtension)
    ? urlExtension
    : ({ 'image/svg+xml': '.svg', 'image/jpeg': '.jpg', 'image/png': '.png', 'image/webp': '.webp', 'image/avif': '.avif', 'image/gif': '.gif' } as Record<string, string>)[headerType] ?? ''
  if (!extension) throw new Error(`No se reconoce la extensión para ${headerType}`)
  const path = join(tempDir, `source-image${extension}`)
  writeFileSync(path, Buffer.from(await response.arrayBuffer()))
  return { path, contentType: headerType, extension }
}

function extractJson(output: string): unknown {
  const start = output.search(/[\[{]/)
  if (start < 0) throw new Error('Wrangler no devolvió JSON verificable')
  return JSON.parse(output.slice(start))
}

function findArticleRow(value: unknown, slug: string): Record<string, unknown> | undefined {
  if (Array.isArray(value)) {
    for (const item of value) {
      const found = findArticleRow(item, slug)
      if (found) return found
    }
  } else if (value && typeof value === 'object') {
    const record = value as Record<string, unknown>
    if (record.slug === slug && typeof record.image_url === 'string') return record
    for (const item of Object.values(record)) {
      const found = findArticleRow(item, slug)
      if (found) return found
    }
  }
  return undefined
}

export async function publishArticle(slug: string): Promise<void> {
  if (!process.env.CLOUDFLARE_API_TOKEN || !process.env.CLOUDFLARE_ACCOUNT_ID) {
    throw new Error('Faltan CLOUDFLARE_API_TOKEN o CLOUDFLARE_ACCOUNT_ID en el entorno de GitHub Actions')
  }
  if (!PUBLIC_BASE_URL.startsWith('https://')) throw new Error('R2_PUBLIC_BASE_URL debe ser una URL HTTPS pública')
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) throw new Error('Slug no válido')

  const article = SAMPLE_ARTICLES.find((item) => item.slug === slug)
  if (!article) throw new Error(`No hay ningún artículo empaquetado con el slug ${slug}`)
  if (!article.title || !article.category || !article.content || !article.excerpt) {
    throw new Error('El artículo no tiene título, categoría, contenido o extracto completo')
  }

  const tempDir = mkdtempSync(join(tmpdir(), 'trendiverse-publish-'))
  try {
    const image = await resolveImage(article.image_url ?? '', tempDir)
    const objectKey = `articles/${slug}${image.extension}`
    const publicImageUrl = `${PUBLIC_BASE_URL}/${objectKey}`

    console.log(`Subiendo imagen a R2: ${BUCKET}/${objectKey}`)
    runWrangler(['r2', 'object', 'put', `${BUCKET}/${objectKey}`, `--file=${image.path}`, `--content-type=${image.contentType}`])

    const downloadedPath = join(tempDir, `verify${image.extension}`)
    runWrangler(['r2', 'object', 'get', `${BUCKET}/${objectKey}`, `--file=${downloadedPath}`])
    const uploadedHash = createHash('sha256').update(readFileSync(downloadedPath)).digest('hex')
    const sourceHash = createHash('sha256').update(readFileSync(image.path)).digest('hex')
    if (uploadedHash !== sourceHash) throw new Error('La verificación SHA-256 de la imagen en R2 no coincide')

    const fields = {
      title: article.title,
      slug: article.slug,
      category: article.category,
      content: article.content,
      excerpt: article.excerpt,
      image_url: publicImageUrl,
      thumbnail_url: publicImageUrl,
      read_time_minutes: String(article.read_time_minutes ?? 1),
      views: String(article.views ?? 0),
      trending: String(Number(Boolean(article.trending))),
      published_at: article.published_at,
    }
    const columns = Object.keys(fields)
    const values = Object.values(fields).map(sqlString)
    const updates = columns.filter((column) => column !== 'slug').map((column) => `${column} = excluded.${column}`).join(', ')
    const sql = `INSERT INTO articles (${columns.join(', ')}) VALUES (${values.join(', ')}) ON CONFLICT(slug) DO UPDATE SET ${updates};`
    const sqlPath = join(tempDir, 'upsert-article.sql')
    writeFileSync(sqlPath, sql, 'utf8')

    console.log(`Guardando artículo en D1: ${DATABASE}`)
    runWrangler(['d1', 'execute', DATABASE, '--remote', `--file=${sqlPath}'])

    const verifySql = `SELECT slug, title, image_url, thumbnail_url FROM articles WHERE slug = ${sqlString(slug)} LIMIT 1;`
    const output = runWrangler(['d1', 'execute', DATABASE, '--remote', '--json', `--command=${verifySql}`])
    const row = findArticleRow(extractJson(output), slug)
    if (!row) throw new Error('D1 no devolvió el artículo tras el UPSERT')
    if (row.image_url !== publicImageUrl || row.thumbnail_url !== publicImageUrl) {
      throw new Error('D1 contiene el artículo, pero la URL de imagen no coincide con la imagen verificada en R2')
    }

    console.log(JSON.stringify({
      success: true,
      slug,
      database: DATABASE,
      bucket: BUCKET,
      objectKey,
      imageUrl: publicImageUrl,
      d1Verified: true,
      r2Sha256Verified: true,
    }, null, 2))
  } finally {
    rmSync(tempDir, { recursive: true, force: true })
  }
}

if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
  const slug = process.argv[2]
  if (!slug) {
    console.error('Uso: npx tsx scripts/publish-editorial-article.ts <slug>')
    process.exitCode = 2
  } else {
    publishArticle(slug).catch((error: unknown) => {
      console.error(error instanceof Error ? error.message : String(error))
      process.exitCode = 1
    })
  }
}
