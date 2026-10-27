import { execFileSync } from 'node:child_process'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'

type PlanItem = {
  id: number
  title: string
  slug: string
  keyword: string
  cluster: string
  intent: string
  angle: string
  editorialNote: string
}

function workflowInput(name: string): string | undefined {
  const eventPath = process.env.GITHUB_EVENT_PATH
  if (!eventPath) return undefined
  try {
    const event = JSON.parse(readFileSync(eventPath, 'utf8')) as { inputs?: Record<string, unknown> }
    const value = event.inputs?.[name]
    return typeof value === 'string' || typeof value === 'number' ? String(value) : undefined
  } catch {
    return undefined
  }
}

function runWrangler(args: string[]): string {
  return execFileSync('npx', ['wrangler', ...args], { encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] })
}

function main(): void {
  const batchNumber = Number(process.env.BATCH_NUMBER ?? workflowInput('batch_number') ?? '1')
  const batchSize = 20
  if (!Number.isInteger(batchNumber) || batchNumber < 1 || batchNumber > 25) {
    throw new Error('BATCH_NUMBER debe ser un entero entre 1 y 25')
  }

  const plan = JSON.parse(readFileSync(resolve('data/suplementos-editorial-plan.json'), 'utf8')) as PlanItem[]
  if (plan.length !== 500 || plan.some((item, index) => item.id !== index + 1)) {
    throw new Error('El plan de suplementos debe contener exactamente 500 artículos con IDs consecutivos')
  }
  const startId = (batchNumber - 1) * batchSize + 1
  const endId = Math.min(startId + batchSize - 1, plan.length)
  const selected = plan.filter((item) => item.id >= startId && item.id <= endId)
  if (selected.length !== batchSize) throw new Error(`El lote ${batchNumber} no contiene 20 artículos del plan`)

  console.log(`Plan de suplementos: lote ${batchNumber}/25, IDs ${startId}–${endId}`)
  const published: number[] = []
  const skipped: number[] = []

  for (const item of selected) {
    const query = `SELECT slug FROM articles WHERE slug = '${item.slug.replace(/'/g, "''")}' LIMIT 1;`
    const existing = runWrangler(['d1', 'execute', process.env.D1_DATABASE ?? 'trendiverse-preview', '--remote', '--json', `--command=${query}`])
    if (existing.includes(item.slug)) {
      console.log(`[suplementos ${item.id}/500] Ya existe en D1; se omite para evitar republicarlo: ${item.slug}`)
      skipped.push(item.id)
      continue
    }

    console.log(`\n[suplementos ${item.id}/500] Generando y publicando: ${item.title} (${item.slug})`)
    try {
      execFileSync('npx', ['tsx', 'scripts/generate-and-publish-savings-article.ts'], {
        stdio: 'inherit',
        env: {
          ...process.env,
          ARTICLE_TITLE: item.title,
          ARTICLE_SLUG: item.slug,
          ARTICLE_KEYWORD: item.keyword,
          ARTICLE_CLUSTER: item.cluster,
          ARTICLE_INTENT: item.intent,
          ARTICLE_ANGLE: item.angle,
          ARTICLE_EDITORIAL_NOTE: item.editorialNote,
          ARTICLE_CATEGORY: 'suplementos',
        },
      })
    } catch {
      throw new Error(`Falló el artículo ID ${item.id} (${item.slug}). El lote se detuvo. Vuelve a ejecutar el mismo lote tras revisar el log; los artículos ya publicados se omitirán.`)
    }
    published.push(item.id)
    console.log(`[suplementos ${item.id}/500] Publicación verificada`)
  }

  console.log(JSON.stringify({
    success: true,
    batchNumber,
    range: [startId, endId],
    published,
    skippedAlreadyPublished: skipped,
    nextBatchNumber: batchNumber < 25 ? batchNumber + 1 : null,
    totalPlanned: 500,
  }))
}

try {
  main()
} catch (error) {
  console.error(error instanceof Error ? error.message : String(error))
  process.exitCode = 1
}
