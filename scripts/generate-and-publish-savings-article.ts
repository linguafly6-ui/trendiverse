import { execFileSync } from 'node:child_process'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'

const accountId = process.env.CLOUDFLARE_ACCOUNT_ID
const apiToken = process.env.CLOUDFLARE_API_TOKEN
function workflowInput(name: string): string | undefined {
  const eventPath = process.env.GITHUB_EVENT_PATH
  if (!eventPath) return undefined
  try {
    const event = JSON.parse(readFileSync(eventPath, 'utf8')) as {
      inputs?: Record<string, unknown>
    }
    const value = event.inputs?.[name]
    return typeof value === 'string' ? value.trim() : undefined
  } catch {
    return undefined
  }
}

const title = process.env.ARTICLE_TITLE?.trim() || workflowInput('title')
const slug = process.env.ARTICLE_SLUG?.trim() || workflowInput('slug')
const model = process.env.WORKERS_AI_MODEL ?? '@cf/meta/llama-3.3-70b-instruct-fp8-fast'
const keyword = process.env.ARTICLE_KEYWORD?.trim() ?? ''
const cluster = process.env.ARTICLE_CLUSTER?.trim() ?? 'Ahorro'
const angle = process.env.ARTICLE_ANGLE?.trim() ?? 'Guía práctica y diferenciada para España'
const intent = process.env.ARTICLE_INTENT?.trim() ?? 'Informativa / práctica'
const database = process.env.D1_DATABASE ?? 'trendiverse-preview'
const bucket = process.env.R2_BUCKET ?? 'trendiverse-articles'
const baseUrl = (process.env.R2_PUBLIC_BASE_URL ?? '').replace(/\/$/, '')

function fail(message: string): never {
  throw new Error(message)
}

function sqlString(value: string): string {
  return "'" + value.replace(/'/g, "''") + "'"
}

function runWrangler(args: string[]): string {
  return execFileSync('npx', ['wrangler', ...args], { encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] })
}

function wordCount(value: string): number {
  return value.match(/[\p{L}\p{N}]+/gu)?.length ?? 0
}

async function main() {
  if (!accountId || !apiToken) fail('Faltan CLOUDFLARE_ACCOUNT_ID o CLOUDFLARE_API_TOKEN')
  if (!title || !slug || !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) fail('ARTICLE_TITLE y ARTICLE_SLUG son obligatorios; el slug debe ser válido')
  if (!baseUrl.startsWith('https://')) fail('R2_PUBLIC_BASE_URL debe ser HTTPS')

  const response = await fetch(`https://api.cloudflare.com/client/v4/accounts/${accountId}/ai/run/${model}`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${apiToken}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      messages: [
        { role: 'system', content: 'Eres un redactor editorial español riguroso. Devuelve exclusivamente JSON válido con las claves "title", "excerpt", "content". El contenido debe ser un artículo original en español de España, útil, bien estructurado con Markdown, al menos 2200 palabras, sin inventar estadísticas ni fuentes, sin consejos financieros personalizados. Incluye limitaciones, ejemplos claramente hipotéticos y una sección final de fuentes oficiales pertinentes como enlaces solo cuando conozcas URLs fiables. No incluyas texto fuera del JSON.' },
        { role: 'user', content: `Redacta el artículo cuyo H1 exacto es: ${title}. El slug es ${slug}. Categoría: ahorro. Cluster SEO: ${cluster}. Intención: ${intent}. Keyword principal: ${keyword || title}. Diferenciación editorial: ${angle}. Incluye la keyword de forma natural, sin keyword stuffing. Evita repetir el título de forma mecánica, usa encabezados concretos, explica pasos accionables, ejemplos hipotéticos claros y preguntas frecuentes útiles. Para afirmaciones legales, fiscales o sobre tarifas, indica que deben comprobarse en fuentes oficiales y no inventes enlaces. No afirmes que se han consultado datos en tiempo real.` }
      ],
      max_tokens: 8192,
      temperature: 0.45
    })
  })
  if (!response.ok) fail(`Workers AI devolvió HTTP ${response.status}: ${(await response.text()).slice(0, 600)}`)
  const payload = await response.json() as { success?: boolean; errors?: unknown[]; result?: { response?: string } }
  const raw = payload.result?.response
  if (!payload.success || !raw) fail('Workers AI no devolvió una respuesta válida')

  const cleaned = raw.replace(/^\s*```(?:json)?\s*/i, '').replace(/\s*```\s*$/, '')
  const article = JSON.parse(cleaned) as { title?: string; excerpt?: string; content?: string }
  if (!article.title || !article.excerpt || !article.content) fail('La respuesta generada no contiene título, extracto y contenido')
  const words = wordCount(article.content)
  if (words < 2000) fail(`Artículo rechazado: ${words} palabras; mínimo 2000`)
  if (article.title.trim() !== title) fail('El H1 generado no coincide con el título de la cola editorial')
  if (article.content.length > 180000) fail('Artículo excede el límite preventivo de longitud')

  const imagePath = resolve('public/images/article-placeholder.svg')
  readFileSync(imagePath)
  const objectKey = `articles/${slug}.svg`
  const imageUrl = `${baseUrl}/${objectKey}`
  runWrangler(['r2', 'object', 'put', `${bucket}/${objectKey}`, `--file=${imagePath}`, '--content-type=image/svg+xml'])

  const publishedAt = new Date().toISOString()
  const readTime = Math.max(1, Math.ceil(words / 220))
  const fields = {
    title: article.title,
    slug,
    category: 'ahorro',
    content: article.content,
    excerpt: article.excerpt,
    image_url: imageUrl,
    thumbnail_url: imageUrl,
    read_time_minutes: String(readTime),
    views: '0',
    trending: '0',
    published_at: publishedAt
  }
  const columns = Object.keys(fields)
  const values = Object.values(fields).map(sqlString)
  const updates = columns.filter((key) => key !== 'slug').map((key) => key + ' = excluded.' + key).join(', ')
  const sql = 'INSERT INTO articles (' + columns.join(', ') + ') VALUES (' + values.join(', ') + ') ON CONFLICT(slug) DO UPDATE SET ' + updates + ';'
  const sqlPath = resolve('/tmp/trendiverse-generated-article.sql')
  const { writeFileSync } = await import('node:fs')
  writeFileSync(sqlPath, sql, 'utf8')
  runWrangler(['d1', 'execute', database, '--remote', `--file=${sqlPath}`])

  const verify = runWrangler(['d1', 'execute', database, '--remote', '--json', `--command=SELECT slug, title, image_url FROM articles WHERE slug = ${sqlString(slug)} LIMIT 1;`])
  if (!verify.includes(slug) || !verify.includes(imageUrl)) fail('No se pudo verificar la fila publicada en D1')
  console.log(JSON.stringify({ success: true, slug, words, database, bucket, imageUrl, verified: true }))
}

main().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : String(error))
  process.exitCode = 1
})
