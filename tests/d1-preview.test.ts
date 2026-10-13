import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { pathToFileURL } from 'node:url'
import {
  PREVIEW_DATABASE_ID,
  PREVIEW_DATABASE_NAME,
  PRODUCTION_DATABASE_NAME,
  PreviewD1GuardError,
  assertPreviewD1Isolation,
  isPreviewScriptEntry,
  previewMigrationArgv,
  type PreviewD1Config,
  type PreviewD1Reader,
} from '../scripts/d1-preview'

const previewDatabase = {
  binding: 'DB',
  database_name: PREVIEW_DATABASE_NAME,
  database_id: PREVIEW_DATABASE_ID,
  migrations_dir: 'migrations',
}

function reader(overrides: { top?: PreviewD1Config; production?: PreviewD1Config; preview?: PreviewD1Config } = {}): PreviewD1Reader {
  const configs = {
    top: { d1_databases: [], vars: { ENVIRONMENT: 'production' } },
    production: { d1_databases: [], vars: { ENVIRONMENT: 'production' } },
    preview: { d1_databases: [previewDatabase], vars: { ENVIRONMENT: 'preview' } },
    ...overrides,
  }
  return ({ env }) => configs[env === 'production' || env === 'preview' ? env : 'top']
}

test('preview migration commands target trendiverse-preview and leave production unbound', () => {
  const db = assertPreviewD1Isolation()
  assert.equal(db.database_name, PREVIEW_DATABASE_NAME)
  assert.equal(db.database_id, PREVIEW_DATABASE_ID)
  assert.notEqual(db.database_name, PRODUCTION_DATABASE_NAME)

  const list = previewMigrationArgv('list')
  const apply = previewMigrationArgv('apply')
  assert.deepEqual(list, ['d1', 'migrations', 'list', PREVIEW_DATABASE_NAME, '--env', 'preview', '--remote'])
  assert.deepEqual(apply, ['d1', 'migrations', 'apply', PREVIEW_DATABASE_NAME, '--env', 'preview', '--remote'])
  for (const argv of [list, apply]) {
    assert.equal(argv.includes(PRODUCTION_DATABASE_NAME), false)
    assert.equal(argv.includes('trendiverse-db'), false)
    assert.equal(argv.includes('--preview'), false)
  }
})

test('the preview guard rejects the production database name and a production binding', () => {
  assert.throws(
    () => previewMigrationArgv('apply', reader({
      preview: { d1_databases: [{ ...previewDatabase, database_name: PRODUCTION_DATABASE_NAME }], vars: { ENVIRONMENT: 'preview' } },
    })),
    PreviewD1GuardError,
  )
  assert.throws(
    () => previewMigrationArgv('list', reader({
      production: { d1_databases: [{ ...previewDatabase, database_name: PRODUCTION_DATABASE_NAME }], vars: { ENVIRONMENT: 'production' } },
    })),
    PreviewD1GuardError,
  )
  assert.throws(
    () => previewMigrationArgv('list', reader({
      top: { d1_databases: [previewDatabase], vars: { ENVIRONMENT: 'production' } },
    })),
    PreviewD1GuardError,
  )
  assert.throws(() => previewMigrationArgv('status', reader()), PreviewD1GuardError)
})

test('the preview script starts from a Windows path and stays idle when imported', () => {
  const scriptUrl = pathToFileURL(resolve('scripts/d1-preview.ts')).href
  assert.equal(isPreviewScriptEntry('C:\\Users\\example\\trendiverse\\scripts\\d1-preview.ts', scriptUrl), true)
  assert.equal(isPreviewScriptEntry('scripts/d1-preview.ts', scriptUrl), true)
  assert.equal(isPreviewScriptEntry('tests/d1-preview.test.ts', scriptUrl), false)
})

test('package scripts and wrangler.toml keep preview distinct from production', () => {
  const pkg = JSON.parse(readFileSync(new URL('../package.json', import.meta.url), 'utf8')) as { scripts: Record<string, string> }
  assert.equal(pkg.scripts['migrate:preview:list'], 'node --import tsx scripts/d1-preview.ts list')
  assert.equal(pkg.scripts['migrate:preview:apply'], 'node --import tsx scripts/d1-preview.ts apply')
  assert.equal(pkg.scripts['migrate:cf'], 'wrangler d1 migrations apply trendiverse-db --remote')
  assert.equal(pkg.scripts['migrate:preview:list'].includes(PRODUCTION_DATABASE_NAME), false)
  assert.equal(pkg.scripts['migrate:preview:apply'].includes('trendiverse-db'), false)

  const toml = readFileSync(new URL('../wrangler.toml', import.meta.url), 'utf8')
  assert.match(toml, /\[vars\]\nENVIRONMENT = "production"/)
  assert.match(toml, /\[env\.preview\.vars\]\nENVIRONMENT = "preview"/)
  assert.match(toml, /\[\[env\.preview\.d1_databases\]\]/)
  assert.equal(toml.includes('database_name = "trendiverse"'), false)
  assert.match(toml, /# \[\[d1_databases\]\]/)
})
