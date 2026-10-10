// Prepares D1 migration commands for the Pages preview database only.
// Usage: node --import tsx scripts/d1-preview.ts <list|apply>
import { spawnSync } from 'node:child_process'
import { resolve } from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'
import { unstable_readConfig } from 'wrangler'

export const PREVIEW_DATABASE_NAME = 'trendiverse-preview'
export const PREVIEW_DATABASE_ID = '2bb04eb3-9f3f-40b3-a6ed-b1f58dc9107f'
export const PRODUCTION_DATABASE_NAME = 'trendiverse'

const ROOT = fileURLToPath(new URL('..', import.meta.url))
const CONFIG_PATH = resolve(ROOT, 'wrangler.toml')

export interface PreviewD1Binding {
  binding?: string
  database_name?: string
  database_id?: string
  migrations_dir?: string
  preview_database_id?: string
}

export interface PreviewD1Config {
  d1_databases?: PreviewD1Binding[]
  vars?: Record<string, string>
}

export type PreviewD1Reader = (args: { config: string; env?: string }) => PreviewD1Config

export class PreviewD1GuardError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'PreviewD1GuardError'
  }
}

function bindings(config: PreviewD1Config): PreviewD1Binding[] {
  return config.d1_databases ?? []
}

function rejectProductionName(name: string | undefined, where: string) {
  if (name === PRODUCTION_DATABASE_NAME) {
    throw new PreviewD1GuardError(`${where} selecciona la base de producción ${PRODUCTION_DATABASE_NAME}.`)
  }
}

export function assertPreviewD1Isolation(readConfig: PreviewD1Reader = readWranglerConfig): PreviewD1Binding {
  const top = readConfig({ config: CONFIG_PATH })
  const production = readConfig({ config: CONFIG_PATH, env: 'production' })
  const preview = readConfig({ config: CONFIG_PATH, env: 'preview' })

  for (const [label, config] of [['top', top], ['production', production]] as const) {
    const found = bindings(config)
    if (found.length !== 0) {
      throw new PreviewD1GuardError(`${label} tiene ${found.length} bindings D1. Producción debe seguir sin DB.`)
    }
    if (config.vars?.ENVIRONMENT !== 'production') {
      throw new PreviewD1GuardError(`${label} ENVIRONMENT debe ser production.`)
    }
  }

  if (preview.vars?.ENVIRONMENT !== 'preview') {
    throw new PreviewD1GuardError('Preview ENVIRONMENT debe ser preview.')
  }

  const previewDatabases = bindings(preview)
  if (previewDatabases.length !== 1) {
    throw new PreviewD1GuardError(`Preview tiene ${previewDatabases.length} bindings D1. Tiene que haber uno.`)
  }
  const db = previewDatabases[0]
  rejectProductionName(db.database_name, 'preview')
  if (db.binding !== 'DB' || db.database_name !== PREVIEW_DATABASE_NAME || db.database_id !== PREVIEW_DATABASE_ID) {
    throw new PreviewD1GuardError('Preview DB no es trendiverse-preview con el id de pruebas.')
  }
  if (db.preview_database_id) {
    throw new PreviewD1GuardError('Preview no debe definir preview_database_id.')
  }
  if (db.migrations_dir !== 'migrations') {
    throw new PreviewD1GuardError('Preview debe usar el directorio migrations.')
  }
  return db
}

export function previewMigrationArgv(action: string, readConfig?: PreviewD1Reader): string[] {
  if (action !== 'list' && action !== 'apply') {
    throw new PreviewD1GuardError('La acción tiene que ser list o apply.')
  }
  assertPreviewD1Isolation(readConfig)
  return ['d1', 'migrations', action, PREVIEW_DATABASE_NAME, '--env', 'preview', '--remote']
}

function readWranglerConfig(args: { config: string; env?: string }): PreviewD1Config {
  return unstable_readConfig(args) as PreviewD1Config
}

function runDirect() {
  if (process.argv.length !== 3) {
    throw new PreviewD1GuardError('Uso: node --import tsx scripts/d1-preview.ts <list|apply>')
  }
  const argv = previewMigrationArgv(process.argv[2])
  const result = spawnSync('wrangler', argv, { cwd: ROOT, stdio: 'inherit' })
  process.exit(result.status ?? 1)
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  runDirect()
}
