import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import test from 'node:test'

const workflow = readFileSync(join(process.cwd(), '.github/workflows/publish-editorial-article.yml'), 'utf8')
const script = readFileSync(join(process.cwd(), 'scripts/publish-editorial-article.ts'), 'utf8')

test('la publicación automática del artículo 21 y el dispatch manual están limitados a main', () => {
  assert.match(workflow, /workflow_dispatch:/)
  assert.match(workflow, /push:/)
  assert.ok(workflow.includes('"lib/seo-batch-04.ts"'))
  assert.match(workflow, /github\.ref == 'refs\/heads\/main'/)
  assert.match(workflow, /environment: production/)
  assert.match(workflow, /secrets\.CLOUDFLARE_API_TOKEN/)
  assert.match(workflow, /secrets\.CLOUDFLARE_ACCOUNT_ID/)
  assert.doesNotMatch(workflow, /^\s*pull_request:/m)
  assert.doesNotMatch(workflow, /wrangler pages deploy/)
})

test('el publicador sube y verifica R2 antes de guardar y verificar D1', () => {
  assert.match(script, /wrangler[\s\S]*r2[\s\S]*object[\s\S]*put|\['r2', 'object', 'put'/)
  assert.match(script, /\['r2', 'object', 'get'/)
  assert.match(script, /createHash\('sha256'\)/)
  assert.match(script, /ON CONFLICT\(slug\) DO UPDATE SET/)
  assert.match(script, /SELECT slug, title, image_url, thumbnail_url FROM articles/)
  assert.match(script, /R2_PUBLIC_BASE_URL/)
  assert.match(script, /d1Verified: true/)
  assert.match(script, /r2Sha256Verified: true/)
})
