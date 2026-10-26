import { execFileSync } from 'node:child_process'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'

type QueueItem = {
  id: number
  title: string
  slug: string
  keyword: string
  cluster: string
  intent: string
  angle: string
  alreadyBundled?: boolean
}

function input(name: string, fallback: string): string {
  const eventPath = process.env.GITHUB_EVENT_PATH
  if (eventPath) {
    try {
      const event = JSON.parse(readFileSync(eventPath, 'utf8')) as { inputs?: Record<string, unknown> }
      const value = event.inputs?.[name]
      if (typeof value === 'string' || typeof value === 'number') return String(value)
    } catch {
      // Fall back to the explicit environment/default value.
    }
  }
  return process.env[name] ?? fallback
}

function main(): void {
  const startId = Number(input('BATCH_START_ID', '1'))
  const batchSize = Number(input('BATCH_SIZE', '1'))
  if (!Number.isInteger(startId) || startId < 1 || startId > 500) {
    throw new Error('BATCH_START_ID debe ser un entero entre 1 y 500')
  }
  if (!Number.isInteger(batchSize) || batchSize < 1 || batchSize > 5) {
    throw new Error('BATCH_SIZE debe ser un entero entre 1 y 5 para limitar costes y facilitar la revisión')
  }

  const queuePath = resolve('data/ahorro-editorial-queue.json')
  const queue = JSON.parse(readFileSync(queuePath, 'utf8')) as QueueItem[]
  if (queue.length !== 500 || queue.some((item, index) => item.id !== index + 1)) {
    throw new Error('La cola editorial debe contener exactamente 500 artículos con IDs consecutivos')
  }
  const selected = queue.filter((item) => item.id >= startId && !item.alreadyBundled).slice(0, batchSize)
  if (!selected.length) throw new Error('No hay artículos pendientes en ese rango de la cola')
  if (queue.some((item) => item.alreadyBundled)) {
    console.log('Se omite el ID 1: su slug ya está presente en el catálogo editorial empaquetado; se conserva esa versión para evitar duplicados.')
  }

  console.log(`Lote editorial: IDs ${selected[0].id}–${selected[selected.length - 1].id} (${selected.length} artículos nuevos)`)
  for (const item of selected) {
    console.log(`\n[ahorro ${item.id}/500] Generando y publicando: ${item.title} (${item.slug})`)
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
        },
      })
    } catch {
      throw new Error(`Falló el artículo ID ${item.id} (${item.slug}). El lote se detuvo; vuelve a ejecutar desde ese ID después de revisar el log.`)
    }
    console.log(`[ahorro ${item.id}/500] Publicación verificada`)
  }
  console.log(JSON.stringify({ success: true, completedInThisRun: selected.map((item) => item.id), nextStartId: selected[selected.length - 1].id + 1, total: 500 }))
}

try {
  main()
} catch (error) {
  console.error(error instanceof Error ? error.message : String(error))
  process.exitCode = 1
}
