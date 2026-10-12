import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { PassThrough, Writable } from 'node:stream'
import { EBAY_BROWSE_SOURCE_ENABLED, normalizeEbaySourceUrl } from '../lib/ebay-browse-adapter'
import { EBAY_OAUTH_TOKEN_URL, type EbayFetch } from '../lib/ebay-application-auth'
import { EBAY_ES_ADMITTED_CONDITION_IDS } from '../lib/ebay-browse-offer'
import { createTerminalPrompts, type PromptInput } from '../lib/ebay-browse-legacy-item-prompt'
import {
  formatBrowseLegacyItemReport,
  runBrowseLegacyItemReadingSession,
  type BrowseLegacyItemReadingIO,
} from '../lib/ebay-browse-legacy-item-session'
import { emptySecondHandDataSource } from '../lib/second-hand-data'
import { SECOND_HAND_PRODUCT_MAPPINGS, secondHandProductMapping } from '../lib/second-hand-product-mapping'

const CLIENT_ID = 'fixture-app-should-not-appear'
const CLIENT_SECRET = 'fixture-secret-should-not-appear'
const TOKEN = 'fixture-browse-token'

function body() {
  return {
    itemId: 'v1|100|0',
    legacyItemId: '100',
    epid: '9000000001',
    categoryId: 'fixture-category',
    listingMarketplaceId: 'EBAY_ES',
    condition: 'Used',
    conditionId: '3000',
    itemWebUrl: 'https://www.ebay.es/itm/100',
    price: { value: '10.50', currency: 'EUR' },
    seller: { username: 'fixture-seller' },
    description: 'no copiar',
    title: 'no copiar titulo',
    itemAffiliateWebUrl: 'https://www.ebay.es/itm/100?campid=1',
  }
}

function sessionIO(steps: {
  answers: string[]
  secrets?: string[]
  fetchImpl?: EbayFetch
}): { io: BrowseLegacyItemReadingIO, output: string, secretPrompts: number, fetches: number } {
  const output: string[] = []
  const answers = [...steps.answers]
  const secrets = [...(steps.secrets ?? [])]
  const state = { secretPrompts: 0, fetches: 0 }
  const fetchImpl = steps.fetchImpl
    ? (async (input, init) => {
      state.fetches += 1
      return steps.fetchImpl!(input, init)
    }) satisfies EbayFetch
    : undefined
  const io: BrowseLegacyItemReadingIO = {
    ask: async () => answers.shift() ?? '',
    askSecret: async () => {
      state.secretPrompts += 1
      return secrets.shift() ?? ''
    },
    write: (text) => {
      output.push(text)
    },
    fetchImpl,
  }
  return {
    io,
    get output() { return output.join('') },
    get secretPrompts() { return state.secretPrompts },
    get fetches() { return state.fetches },
  }
}

test('the hidden prompt does not copy the secret to the output', async () => {
  const input = new PassThrough()
  const chunks: string[] = []
  const output = new Writable({
    write(chunk, _encoding, callback) {
      chunks.push(String(chunk))
      callback()
    },
  })
  const prompts = createTerminalPrompts(input, output)
  input.write(`100\n${CLIENT_SECRET}\n`)
  assert.equal(await prompts.ask('legacyItemId: '), '100')
  assert.equal(await prompts.askHidden('Cert ID, sin eco: '), CLIENT_SECRET)
  prompts.close()
  const shown = chunks.join('')
  assert.equal(shown.includes(CLIENT_SECRET), false)
  assert.match(shown, /legacyItemId: 100/)
  assert.match(shown, /Cert ID, sin eco: /)

  const tty = new PassThrough() as PassThrough & PromptInput
  const modes: boolean[] = []
  tty.isTTY = true
  tty.setRawMode = (enabled) => {
    modes.push(enabled)
  }
  const ttyChunks: string[] = []
  const ttyOutput = new Writable({
    write(chunk, _encoding, callback) {
      ttyChunks.push(String(chunk))
      callback()
    },
  })
  const ttyPrompts = createTerminalPrompts(tty, ttyOutput)
  tty.write(`100\n${CLIENT_SECRET}\n`)
  assert.equal(await ttyPrompts.ask('legacyItemId: '), '100')
  assert.equal(await ttyPrompts.askHidden('Cert ID, sin eco: '), CLIENT_SECRET)
  ttyPrompts.close()
  const ttyShown = ttyChunks.join('')
  assert.equal(ttyShown.includes(CLIENT_SECRET), false)
  assert.equal(ttyShown.includes('100'), false)
  assert.deepEqual(modes, [false, true, false])
})

test('the legacy session does not fetch or ask for secrets without confirmation', async () => {
  const idle: EbayFetch = async () => {
    throw new Error('should not fetch')
  }
  const invalid = sessionIO({ answers: [' 100'], fetchImpl: idle })
  assert.equal((await runBrowseLegacyItemReadingSession(invalid.io)).status, 'invalid-legacy-item-id')
  assert.equal(invalid.secretPrompts, 0)
  assert.equal(invalid.fetches, 0)
  assert.equal(invalid.output.includes(CLIENT_SECRET), false)

  const declined = sessionIO({ answers: ['100', 'no'], secrets: [CLIENT_ID, CLIENT_SECRET], fetchImpl: idle })
  assert.equal((await runBrowseLegacyItemReadingSession(declined.io)).status, 'not-run')
  assert.equal(declined.secretPrompts, 0)
  assert.equal(declined.fetches, 0)

  const withoutFetch = sessionIO({ answers: ['100', 'run-outside-ci'], secrets: [CLIENT_ID, CLIENT_SECRET] })
  assert.equal((await runBrowseLegacyItemReadingSession(withoutFetch.io)).status, 'not-run')
  assert.equal(withoutFetch.secretPrompts, 0)
  assert.match(withoutFetch.output, /Sin fetchImpl explícito no hay petición/)
})

test('a confirmed legacy session prints only the diagnostic fields', async () => {
  const calls: string[] = []
  const fetchImpl: EbayFetch = async (input, init) => {
    calls.push(String(input))
    if (input === EBAY_OAUTH_TOKEN_URL) {
      return Response.json({ access_token: TOKEN, expires_in: 7200 })
    }
    const headers = new Headers(init?.headers)
    assert.equal(headers.get('x-ebay-c-marketplace-id'), 'EBAY_ES')
    assert.equal(headers.get('x-ebay-c-enduserctx'), null)
    assert.equal(headers.get('authorization'), `Bearer ${TOKEN}`)
    const authorization = headers.get('authorization') ?? ''
    assert.equal(authorization.includes(CLIENT_ID), false)
    assert.equal(authorization.includes(CLIENT_SECRET), false)
    return Response.json(body())
  }
  const run = sessionIO({
    answers: ['100', 'run-outside-ci'],
    secrets: [CLIENT_ID, CLIENT_SECRET],
    fetchImpl,
  })
  const result = await runBrowseLegacyItemReadingSession(run.io)
  assert.equal(result.status, 'ok')
  const url = new URL(calls[1] ?? '')
  assert.equal(url.pathname, '/buy/browse/v1/item/get_item_by_legacy_id')
  assert.deepEqual([...url.searchParams.keys()], ['legacy_item_id'])
  assert.equal(url.searchParams.get('legacy_item_id'), '100')
  assert.equal(calls.filter((call) => call !== EBAY_OAUTH_TOKEN_URL).length, 1)

  const report = run.output
  assert.match(report, /Estado: ok/)
  assert.match(report, /itemId: presente: v1\|100\|0/)
  assert.match(report, /legacyItemId: presente: 100/)
  assert.match(report, /legacyItemId del cuerpo coincide con el solicitado: sí/)
  assert.match(report, /epid: presente/)
  assert.match(report, /categoryId: presente/)
  assert.match(report, /listingMarketplaceId: presente/)
  assert.match(report, /condition: presente: Used/)
  assert.match(report, /conditionId: presente: 3000/)
  assert.match(report, /itemWebUrl: presente/)
  assert.match(report, /precio: presente: 10\.50/)
  assert.match(report, /moneda: presente: EUR/)
  assert.match(report, /itemWebUrlIsSourceUrl: false/)
  assert.match(report, /No es una observación publicable/)
  assert.match(report, /No lo asignes a nintendo-switch/)
  assert.equal(report.includes(CLIENT_ID), false)
  assert.equal(report.includes(CLIENT_SECRET), false)
  assert.equal(report.includes(TOKEN), false)
  assert.equal(report.includes('fixture-seller'), false)
  assert.equal(report.includes('no copiar'), false)
  assert.equal(report.includes('campid'), false)
  assert.equal(normalizeEbaySourceUrl('https://www.ebay.es/itm/100'), null)

  const mismatch = sessionIO({
    answers: ['100', 'run-outside-ci'],
    secrets: [CLIENT_ID, CLIENT_SECRET],
    fetchImpl: async (input) => {
      if (input === EBAY_OAUTH_TOKEN_URL) return Response.json({ access_token: TOKEN, expires_in: 7200 })
      return Response.json({ ...body(), legacyItemId: '999', seller: { username: 'fixture-seller' } })
    },
  })
  assert.equal((await runBrowseLegacyItemReadingSession(mismatch.io)).status, 'identifier-mismatch')
  assert.match(mismatch.output, /No hay una lectura válida/)
  assert.equal(mismatch.output.includes('fixture-seller'), false)
  assert.equal(mismatch.output.includes(CLIENT_SECRET), false)
})

test('the procedure keeps the provider blocked and does not persist the report', () => {
  const report = formatBrowseLegacyItemReport({ status: 'not-run' }, '100')
  assert.match(report, /No hay una lectura válida/)
  assert.equal(report.includes('10.50'), false)
  assert.equal(EBAY_BROWSE_SOURCE_ENABLED, false)
  assert.equal(EBAY_ES_ADMITTED_CONDITION_IDS.length, 0)
  assert.equal(emptySecondHandDataSource.id, 'empty')
  const mapping = secondHandProductMapping('nintendo-switch')
  assert.equal(mapping?.externalProductId, null)
  assert.equal(mapping?.marketplaceIdentifier, null)
  assert.equal(SECOND_HAND_PRODUCT_MAPPINGS.every((spec) => spec.externalProductId === null), true)

  for (const relative of [
    '../lib/ebay-browse-legacy-item-session.ts',
    '../lib/ebay-browse-legacy-item-prompt.ts',
    '../scripts/read-ebay-es-legacy-item.ts',
  ]) {
    const source = readFileSync(new URL(relative, import.meta.url), 'utf8')
    const code = source.replace(/\/\*[\s\S]*?\*\//g, '').replace(/\/\/.*$/gm, '')
    assert.doesNotMatch(code, /process\.env|writeFile|createWriteStream|appendFile|readFileSync|EBAY_BROWSE_SOURCE_ENABLED\s*=\s*true|associateBrowseItem|console\./, relative)
  }
  const pkg = readFileSync(new URL('../package.json', import.meta.url), 'utf8')
  const workflow = readFileSync(new URL('../.github/workflows/deploy.yml', import.meta.url), 'utf8')
  assert.equal(pkg.includes('read-ebay-es-legacy-item'), false)
  assert.equal(workflow.includes('read-ebay-es-legacy-item'), false)
  const script = readFileSync(new URL('../scripts/read-ebay-es-legacy-item.ts', import.meta.url), 'utf8')
  assert.match(script, /invokedDirectly/)
  assert.match(script, /askHidden/)
})
