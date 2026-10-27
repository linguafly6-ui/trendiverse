import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import test from 'node:test'

const workflow = readFileSync(join(process.cwd(), '.github/workflows/publish-editorial-article.yml'), 'utf8')
const script = readFileSync(join(process.cwd(), 'scripts/publish-editorial-article.ts'), 'utf8')

test('la publicación automática del artículo 21 y el dispatch manual están limitados a main', () => {
  assert.ok(workflow.includes('workflow_dispatch:'))
  assert.ok(workflow.includes('push:'))
  assert.ok(workflow.includes('"lib/seo-batch-04.ts"'))
  assert.ok(workflow.includes("github.ref == 'refs/heads/main'"))
  assert.ok(workflow.includes('environment: production'))
  assert.ok(workflow.includes('secrets.CLOUDFLARE_API_TOKEN'))
  assert.ok(workflow.includes('secrets.CLOUDFLARE_ACCOUNT_ID'))
  assert.ok(!workflow.includes('pull_request:'))
  assert.ok(!workflow.includes('wrangler pages deploy'))
})

test('el publicador sube y verifica R2 antes de guardar y verificar D1', () => {
  assert.ok(script.includes("['r2', 'object', 'put'"))
  assert.ok(script.includes("['r2', 'object', 'get'"))
  assert.ok(script.includes("createHash('sha256')"))
  assert.ok(script.includes('ON CONFLICT(slug) DO UPDATE SET'))
  assert.ok(script.includes('SELECT slug, title, content, image_url, thumbnail_url FROM articles'))
  assert.ok(script.includes('R2_PUBLIC_BASE_URL'))
  assert.ok(script.includes('d1Verified: true'))
  assert.ok(script.includes('r2Sha256Verified: true'))
})
