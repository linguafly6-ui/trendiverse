import test from 'node:test'
import assert from 'node:assert/strict'
import { spawnSync } from 'node:child_process'
import { fileURLToPath } from 'node:url'
import { readFileSync } from 'node:fs'
import { EBAY_BROWSE_SOURCE_ENABLED } from '../lib/ebay-browse-adapter'
import { EBAY_ES_ADMITTED_CONDITION_IDS } from '../lib/ebay-listing'
import { runWhiteOledDetailRead } from '../scripts/read-ebay-white-oled-detail'
import {
  whiteOledDetailFromBody,
  whiteOledDetailIsComplete,
} from '../lib/ebay-white-oled-reading'
import { secondHandVariantMapping } from '../lib/second-hand-variant-catalog'

const EPID = '21048307585'

function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'content-type': 'application/json' },
  })
}

function tokenResponse(): Response {
  return jsonResponse({ access_token: 'fixture-token', expires_in: 7200, token_type: 'Bearer' })
}

test('missing credentials stop before any request and do not validate the variant', async () => {
  let calls = 0
  const fetchImpl = async () => {
    calls += 1
    return jsonResponse({})
  }
  const lines: string[] = []
  const code = await runWhiteOledDetailRead({
    clientId: undefined,
    clientSecret: 'fixture-cert',
    fetchImpl,
    write: (text) => lines.push(text),
  })
  assert.equal(code, 1)
  assert.equal(calls, 0)
  assert.match(lines.join(''), /Faltan EBAY_CLIENT_ID/)
  assert.match(lines.join(''), /varianteValidada: false/)
  assert.equal(lines.join('').includes('fixture-cert'), false)
})

test('a search failure reports that status and leaves every field unchecked', async () => {
  const fetchImpl = async () => jsonResponse({ error: 'no' }, 401)
  const lines: string[] = []
  const code = await runWhiteOledDetailRead({
    clientId: 'fixture-client',
    clientSecret: 'fixture-cert',
    fetchImpl,
    write: (text) => lines.push(text),
  })
  const report = lines.join('')
  assert.equal(code, 1)
  assert.match(report, /busqueda: unauthorized/)
  assert.match(report, /httpStatus: 401/)
  assert.match(report, /cuerposLeidos: 0/)
  assert.match(report, /varianteValidada: false/)
  assert.equal(report.includes('fixture-client'), false)
  assert.equal(report.includes('fixture-cert'), false)
})

test('getItem fields stay absent when the body omits them, even if the title names them', () => {
  const fields = whiteOledDetailFromBody('v1|267728620693|0', {
    itemId: 'v1|267728620693|0',
    title: 'Nintendo Switch OLED blanca EAN 0045496453435 MPN 10007454 HEG-001 64 GB',
    listingMarketplaceId: 'EBAY_ES',
  })
  assert.ok(fields)
  assert.equal(fields.listingMarketplaceId.status, 'present')
  assert.equal(fields.epid.status, 'absent')
  assert.equal(fields.gtin.status, 'absent')
  assert.equal(fields.mpn.status, 'absent')
  assert.equal(fields.model.status, 'absent')
  assert.equal(fields.capacity.status, 'absent')
  assert.equal(fields.color.status, 'absent')
  assert.equal(fields.categoryId.status, 'absent')
  assert.equal(whiteOledDetailIsComplete(fields), false)
  assert.equal(JSON.stringify(fields).includes('0045496453435'), false)
})

test('a mocked detail can be complete without validating the catalog variant', async () => {
  const body = {
    itemId: 'v1|267728620693|0',
    title: 'otro título que no se consulta',
    epid: EPID,
    listingMarketplaceId: 'EBAY_ES',
    gtin: '0045496453435',
    categoryId: '139971',
    localizedAspects: [
      { name: 'MPN', value: '10007454' },
      { name: 'Modelo', value: 'HEG-001' },
      { name: 'Capacidad', value: '64 GB' },
      { name: 'Color', value: 'Blanco' },
    ],
  }
  const fetchImpl = async (url: string) => {
    if (url.includes('/identity/')) return tokenResponse()
    if (url.includes('item_summary/search')) {
      return jsonResponse({ total: 1, itemSummaries: [{ itemId: 'v1|267728620693|0', title: 'OLED blanca EAN inventado' }] })
    }
    return jsonResponse(body)
  }
  const lines: string[] = []
  const code = await runWhiteOledDetailRead({
    clientId: 'fixture-client',
    clientSecret: 'fixture-cert',
    fetchImpl,
    write: (text) => lines.push(text),
  })
  const report = lines.join('')
  assert.equal(code, 0)
  assert.match(report, /getItem: ok/)
  assert.match(report, /listingMarketplaceId: EBAY_ES/)
  assert.match(report, new RegExp(`epid: ${EPID}`))
  assert.match(report, /gtin: 0045496453435/)
  assert.match(report, /mpn: 10007454/)
  assert.match(report, /modelo: HEG-001/)
  assert.match(report, /capacidad: 64 GB/)
  assert.match(report, /color: Blanco/)
  assert.match(report, /categoryId: 139971/)
  assert.match(report, /camposCompletos: si/)
  assert.match(report, /varianteValidada: false/)
  assert.equal(report.includes('inventado'), false)
  assert.equal(report.includes('otro título'), false)
  const variant = secondHandVariantMapping('nintendo-switch-oled-blanca')
  assert.equal(variant?.marketplaceIdentifier?.status, 'unvalidated')
  assert.equal(EBAY_BROWSE_SOURCE_ENABLED, false)
  assert.equal(EBAY_ES_ADMITTED_CONDITION_IDS.length, 0)
})

test('a failed getItem leaves the candidate fields unchecked', async () => {
  let itemCalls = 0
  const fetchImpl = async (url: string) => {
    if (url.includes('/identity/')) return tokenResponse()
    if (url.includes('item_summary/search')) {
      return jsonResponse({ total: 1, itemSummaries: [{ itemId: 'v1|267728620693|0' }] })
    }
    itemCalls += 1
    return jsonResponse({ error: 'down' }, 503)
  }
  const lines: string[] = []
  const code = await runWhiteOledDetailRead({
    clientId: 'fixture-client',
    clientSecret: 'fixture-cert',
    fetchImpl,
    write: (text) => lines.push(text),
  })
  const report = lines.join('')
  assert.equal(code, 1)
  assert.equal(itemCalls, 1)
  assert.match(report, /getItem: unavailable/)
  assert.match(report, /listingMarketplaceId: no comprobado/)
  assert.match(report, /categoryId: no comprobado/)
  assert.match(report, /cuerposLeidos: 0/)
  assert.match(report, /varianteValidada: false/)
})

test('the local script exits when the environment has no credentials', () => {
  const env = { ...process.env }
  delete env.EBAY_CLIENT_ID
  delete env.EBAY_CERT_ID
  const result = spawnSync(process.execPath, ['--import', 'tsx', 'scripts/read-ebay-white-oled-detail.ts'], {
    cwd: fileURLToPath(new URL('..', import.meta.url)),
    env,
    encoding: 'utf8',
  })
  assert.equal(result.status, 1)
  assert.match(result.stdout, /Faltan EBAY_CLIENT_ID y EBAY_CERT_ID/)
  assert.match(result.stdout, /varianteValidada: false/)
  assert.equal(result.stdout.includes('Bearer'), false)
  const source = readFileSync(new URL('../scripts/read-ebay-white-oled-detail.ts', import.meta.url), 'utf8')
  assert.match(source, /process\.env\.EBAY_CLIENT_ID/)
  assert.match(source, /process\.env\.EBAY_CERT_ID/)
  assert.doesNotMatch(source, /console\.log|Authorization/)
})
