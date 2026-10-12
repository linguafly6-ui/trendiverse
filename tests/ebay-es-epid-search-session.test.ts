import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { EBAY_BROWSE_SOURCE_ENABLED } from '../lib/ebay-browse-adapter'
import { EBAY_OAUTH_TOKEN_URL, type EbayFetch } from '../lib/ebay-application-auth'
import { EBAY_BROWSE_SEARCH_URL } from '../lib/ebay-browse-client'
import { EBAY_ES_ADMITTED_CONDITION_IDS } from '../lib/ebay-browse-offer'
import {
  formatEpidSearchReport,
  runEbayEsEpidSearchSession,
  type EbayEsEpidSearchIO,
} from '../lib/ebay-es-epid-search-session'
import { emptySecondHandDataSource } from '../lib/second-hand-data'
import { SECOND_HAND_PRODUCT_MAPPINGS, secondHandProductMapping } from '../lib/second-hand-product-mapping'

const CLIENT_ID = 'fixture-app-should-not-appear'
const CLIENT_SECRET = 'fixture-secret-should-not-appear'
const TOKEN = 'fixture-epid-token'
const FIXTURE_EPID = '9000000001'
const SEARCH_URL = `${EBAY_BROWSE_SEARCH_URL}?epid=${FIXTURE_EPID}&limit=10`

function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'content-type': 'application/json' },
  })
}

function sessionIO(options: {
  answers: string[]
  secrets?: string[]
  fetchImpl?: EbayFetch
}) {
  const output: string[] = []
  const calls: string[] = []
  let fetchCount = 0
  const io: EbayEsEpidSearchIO = {
    ask: async (prompt) => {
      output.push(prompt)
      const answer = options.answers.shift()
      if (answer === undefined) throw new Error('missing answer')
      return answer
    },
    askSecret: async (prompt) => {
      output.push(prompt)
      const secret = (options.secrets ?? []).shift()
      if (secret === undefined) throw new Error('missing secret')
      return secret
    },
    write: (text) => {
      output.push(text)
    },
    fetchImpl: options.fetchImpl ?? (async (input) => {
      fetchCount += 1
      calls.push(input)
      if (input === EBAY_OAUTH_TOKEN_URL) return jsonResponse({ access_token: TOKEN, expires_in: 7200 })
      return jsonResponse({ total: 1, itemSummaries: [{ itemId: 'v1|9000001|0', title: 'No copiar', price: { value: '10.00', currency: 'EUR' } }] })
    }),
  }
  return {
    io,
    output: () => output.join(''),
    calls: () => calls,
    fetches: () => fetchCount,
  }
}

test('an invalid epid or a mismatched confirmation does not call Browse', async () => {
  for (const epid of ['', '   ', 'https://www.ebay.es/p/9000000001', `${FIXTURE_EPID}&q=switch`]) {
    const recorded = sessionIO({ answers: [epid] })
    const result = await runEbayEsEpidSearchSession(recorded.io)
    assert.equal(result.status, 'invalid-epid')
    assert.equal(recorded.fetches(), 0)
    assert.match(recorded.output(), /No hay petición/)
    assert.equal(recorded.output().includes(CLIENT_SECRET), false)
  }

  const spaced = sessionIO({ answers: [FIXTURE_EPID, ' run-epid-search-outside-ci'] })
  assert.equal((await runEbayEsEpidSearchSession(spaced.io)).status, 'not-run')
  assert.equal(spaced.fetches(), 0)
  assert.match(spaced.output(), /Sin la confirmación exacta/)
  assert.match(spaced.output(), new RegExp(SEARCH_URL.replace(/[?]/g, '\\?')))

  const idle = sessionIO({ answers: [FIXTURE_EPID, 'run-epid-search-outside-ci'], secrets: ['', ''] })
  assert.equal((await runEbayEsEpidSearchSession(idle.io)).status, 'not-run')
  assert.equal(idle.fetches(), 0)
})

test('a mocked epid search prints candidate ids and does not call getItem', async () => {
  const recorded = sessionIO({
    answers: [FIXTURE_EPID, 'run-epid-search-outside-ci'],
    secrets: [CLIENT_ID, CLIENT_SECRET],
  })
  const result = await runEbayEsEpidSearchSession(recorded.io)
  assert.equal(result.status, 'candidates')
  const report = recorded.output()
  assert.match(report, /status: candidates/)
  assert.match(report, /httpStatus: 200/)
  assert.match(report, /verifiedProduct: false/)
  assert.match(report, /itemId: v1\|9000001\|0/)
  assert.equal(report.includes('10.00'), false)
  assert.equal(report.includes('No copiar'), false)
  assert.equal(report.includes(TOKEN), false)
  assert.equal(report.includes(CLIENT_ID), false)
  assert.equal(report.includes(CLIENT_SECRET), false)
  assert.equal(recorded.calls().some((url) => url.includes('/buy/browse/v1/item/')), false)
  assert.equal(recorded.calls().includes(SEARCH_URL), true)

  const rejected = sessionIO({
    answers: [FIXTURE_EPID, 'run-epid-search-outside-ci'],
    secrets: [CLIENT_ID, CLIENT_SECRET],
    fetchImpl: async (input) => {
      if (input === EBAY_OAUTH_TOKEN_URL) return jsonResponse({ access_token: TOKEN, expires_in: 7200 })
      return jsonResponse({
        warnings: [{ errorId: 12021, message: 'do-not-copy-warning' }],
        itemSummaries: [{ itemId: 'v1|9000002|0' }],
      })
    },
  })
  assert.equal((await runEbayEsEpidSearchSession(rejected.io)).status, 'epid-not-accepted')
  assert.match(rejected.output(), /errorId: 12021/)
  assert.equal(rejected.output().includes('v1|9000002|0'), false)
  assert.equal(rejected.output().includes('do-not-copy-warning'), false)

  const empty = formatEpidSearchReport(
    { status: 'empty', marketplaceId: 'EBAY_ES', limit: 10, total: 0, verifiedProduct: false },
    FIXTURE_EPID,
    SEARCH_URL,
  )
  assert.match(empty, /status: empty/)
  assert.match(empty, /verifiedProduct: false/)
  assert.equal(empty.includes('itemId:'), false)
})

test('the epid search session leaves the provider and catalog unchanged', async () => {
  assert.equal(EBAY_BROWSE_SOURCE_ENABLED, false)
  assert.equal(emptySecondHandDataSource.id, 'empty')
  assert.equal(EBAY_ES_ADMITTED_CONDITION_IDS.length, 0)
  const mapping = secondHandProductMapping('nintendo-switch')
  assert.equal(mapping?.externalProductId, null)
  assert.equal(mapping?.marketplaceIdentifier, null)
  assert.equal(SECOND_HAND_PRODUCT_MAPPINGS.every((spec) => spec.externalProductId === null), true)

  for (const relative of [
    '../lib/ebay-es-epid-search-session.ts',
    '../scripts/read-ebay-es-epid-search.ts',
  ]) {
    const source = readFileSync(new URL(relative, import.meta.url), 'utf8')
    const code = source.replace(/\/\*[\s\S]*?\*\//g, '').replace(/\/\/.*$/gm, '')
    assert.doesNotMatch(code, /process\.env|writeFile|createWriteStream|appendFile|readFileSync|EBAY_BROWSE_SOURCE_ENABLED\s*=\s*true|console\.|getItem\(|getItemByLegacyId\(|associateBrowseItem\(/, relative)
    assert.equal(source.includes('21048307585'), false, relative)
    assert.equal(source.includes('23048312547'), false, relative)
  }
  const pkg = readFileSync(new URL('../package.json', import.meta.url), 'utf8')
  const workflow = readFileSync(new URL('../.github/workflows/deploy.yml', import.meta.url), 'utf8')
  assert.equal(pkg.includes('read-ebay-es-epid-search'), false)
  assert.equal(workflow.includes('read-ebay-es-epid-search'), false)
  const script = readFileSync(new URL('../scripts/read-ebay-es-epid-search.ts', import.meta.url), 'utf8')
  assert.match(script, /invokedDirectly/)
  assert.match(script, /askHidden/)
  assert.match(script, /void main\(\)/)
  await import('../scripts/read-ebay-es-epid-search')
})
