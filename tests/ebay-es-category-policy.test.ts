import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { PassThrough, Writable } from 'node:stream'
import { EBAY_BROWSE_SOURCE_ENABLED } from '../lib/ebay-browse-adapter'
import { EBAY_OAUTH_TOKEN_URL, type EbayFetch } from '../lib/ebay-application-auth'
import { EBAY_ES_ADMITTED_CONDITION_IDS } from '../lib/ebay-browse-offer'
import { SELL_METADATA_CONDITION_CONTRACT_IN_REPO } from '../lib/ebay-es-mapping-review'
import { createTerminalPrompts, type PromptInput } from '../lib/ebay-diagnostic-prompt'
import {
  EBAY_ES_CATEGORY_DIAGNOSTIC_CLOSING,
  EBAY_ES_CATEGORY_DIAGNOSTIC_INTERRUPTION,
  runEbayEsCategoryDiagnostics,
  type EbayEsCategoryDiagnosticIO,
} from '../lib/ebay-es-category-diagnostic-session'
import {
  collectItemConditionPolicies,
  conditionPolicyUrl,
  formatConditionPolicyReport,
} from '../lib/ebay-metadata-condition-policy-reading'
import {
  collectTaxonomyCategoryReading,
  EBAY_ES_CATEGORY_ID_TO_CHECK,
  EBAY_TAXONOMY_CATEGORY_PATH,
  EBAY_TAXONOMY_DEFAULT_TREE_URL,
  formatTaxonomyCategoryReport,
} from '../lib/ebay-taxonomy-category-reading'
import { emptySecondHandDataSource } from '../lib/second-hand-data'
import { SECOND_HAND_PRODUCT_MAPPINGS, secondHandProductMapping } from '../lib/second-hand-product-mapping'

const CLIENT_ID = 'fixture-app-should-not-appear'
const CLIENT_SECRET = 'fixture-secret-should-not-appear'
const TOKEN = 'fixture-taxonomy-token'
const METADATA_TOKEN = 'fixture-metadata-token'
const CHILD_NAME = 'descendant-name-should-not-leak'
const HELP_TEXT = 'help-should-not-leak'
const LONG_MESSAGE = 'warning-long-should-not-leak'

function treeBody(categoryTreeId = '15') {
  return { categoryTreeId, categoryTreeVersion: 'v-prueba' }
}

function subtreeBody(overrides: Record<string, unknown> = {}) {
  return {
    categoryTreeId: '15',
    categoryTreeVersion: 'v-prueba',
    categorySubtreeNode: {
      category: { categoryId: EBAY_ES_CATEGORY_ID_TO_CHECK, categoryName: 'Nombre de prueba' },
      categoryTreeNodeLevel: 4,
      leafCategoryTreeNode: true,
      parentCategoryTreeNodeHref: 'https://api.ebay.com/commerce/taxonomy/v1/category_tree/15/get_category_subtree?category_id=1',
      ...overrides,
    },
  }
}

function policyBody() {
  return {
    itemConditionPolicies: [
      {
        categoryId: EBAY_ES_CATEGORY_ID_TO_CHECK,
        categoryTreeId: '15',
        itemConditionRequired: true,
        itemConditions: [
          {
            conditionId: '3000',
            conditionDescription: 'Texto de prueba',
            conditionHelpText: HELP_TEXT,
            usage: 'RESTRICTED',
          },
          { conditionId: '1000', conditionDescription: 'Otro texto de prueba' },
        ],
      },
      {
        categoryId: '999',
        itemConditions: [{ conditionId: '1000', conditionDescription: 'Condicion de otra categoria' }],
      },
    ],
    warnings: [{ errorId: 46004, longMessage: LONG_MESSAGE, message: 'no copiar aviso' }],
  }
}

function jsonResponse(body: unknown, status = 200): Response {
  return Response.json(body, { status })
}

test('taxonomy stays off until confirm and fetchImpl are both present', async () => {
  let fetches = 0
  const fetchImpl: EbayFetch = async () => {
    fetches += 1
    throw new Error('should not fetch')
  }
  assert.equal((await collectTaxonomyCategoryReading()).status, 'not-run')
  assert.equal((await collectTaxonomyCategoryReading({
    confirm: 'run-outside-ci',
    clientId: CLIENT_ID,
    clientSecret: CLIENT_SECRET,
  })).status, 'not-run')
  assert.equal((await collectTaxonomyCategoryReading({
    confirm: 'run-outside-ci',
    clientId: CLIENT_ID,
    clientSecret: CLIENT_SECRET,
    fetchImpl: undefined,
  })).status, 'not-run')
  assert.equal(fetches, 0)
})

test('a simulated taxonomy subtree reports the node and not the ancestor path', async () => {
  const calls: string[] = []
  const fetchImpl: EbayFetch = async (input, init) => {
    calls.push(String(input))
    if (input === EBAY_OAUTH_TOKEN_URL) return jsonResponse({ access_token: TOKEN, expires_in: 7200 })
    const headers = new Headers(init?.headers)
    assert.equal(headers.get('authorization'), `Bearer ${TOKEN}`)
    assert.equal(headers.get('accept'), 'application/json')
    assert.equal(headers.get('accept-encoding'), null)
    assert.equal(headers.get('x-ebay-c-marketplace-id'), null)
    assert.equal(headers.get('x-ebay-c-enduserctx'), null)
    assert.equal(headers.get('authorization')?.includes(CLIENT_SECRET), false)
    if (String(input).startsWith(EBAY_TAXONOMY_DEFAULT_TREE_URL)) return jsonResponse(treeBody())
    return jsonResponse(subtreeBody({
      leafCategoryTreeNode: false,
      childCategoryTreeNodes: [{ category: { categoryName: CHILD_NAME } }],
    }))
  }
  const result = await collectTaxonomyCategoryReading({
    confirm: 'run-outside-ci',
    clientId: CLIENT_ID,
    clientSecret: CLIENT_SECRET,
    fetchImpl,
  })
  assert.equal(result.status, 'ok')
  if (result.status !== 'ok') return
  assert.equal(result.reading.categoryId, '139971')
  assert.equal(result.reading.categoryName, 'Nombre de prueba')
  assert.equal(result.reading.categoryTreeId, '15')
  assert.equal(result.reading.categoryTreeVersion, 'v-prueba')
  assert.equal(result.reading.categoryTreeNodeLevel, 4)
  assert.equal(result.reading.leafCategoryTreeNode, 'absent')
  assert.equal(result.reading.hasDescendants, true)
  assert.equal(result.reading.categoryPath, EBAY_TAXONOMY_CATEGORY_PATH)
  assert.equal(result.reading.verifiesProductCategory, false)
  assert.equal(result.reading.verifiesNintendoSwitchCategory, false)
  const serialized = JSON.stringify(result)
  assert.equal(serialized.includes(CHILD_NAME), false)
  assert.equal(serialized.includes(TOKEN), false)
  assert.equal(serialized.includes(CLIENT_SECRET), false)
  assert.equal(serialized.includes('parentCategoryTreeNodeHref'), false)

  const treeUrl = new URL(calls[1] ?? '')
  assert.equal(treeUrl.pathname, '/commerce/taxonomy/v1/get_default_category_tree_id')
  assert.deepEqual([...treeUrl.searchParams.keys()], ['marketplace_id'])
  assert.equal(treeUrl.searchParams.get('marketplace_id'), 'EBAY_ES')
  const subtreeUrl = new URL(calls[2] ?? '')
  assert.equal(subtreeUrl.pathname, '/commerce/taxonomy/v1/category_tree/15/get_category_subtree')
  assert.deepEqual([...subtreeUrl.searchParams.keys()], ['category_id'])
  assert.equal(subtreeUrl.searchParams.get('category_id'), '139971')

  const leaf = await collectTaxonomyCategoryReading({
    confirm: 'run-outside-ci',
    clientId: CLIENT_ID,
    clientSecret: CLIENT_SECRET,
    fetchImpl: async (input) => {
      if (input === EBAY_OAUTH_TOKEN_URL) return jsonResponse({ access_token: TOKEN, expires_in: 7200 })
      if (String(input).startsWith(EBAY_TAXONOMY_DEFAULT_TREE_URL)) return jsonResponse(treeBody())
      return jsonResponse(subtreeBody())
    },
  })
  assert.equal(leaf.status, 'ok')
  if (leaf.status !== 'ok') return
  assert.equal(leaf.reading.leafCategoryTreeNode, true)
  assert.equal(leaf.reading.hasDescendants, 'absent')
  const report = formatTaxonomyCategoryReport(leaf)
  assert.match(report, /categoryName: Nombre de prueba/)
  assert.match(report, /categoryPath: not-in-getCategorySubtree-contract/)
  assert.match(report, /verifiesNintendoSwitchCategory: false/)
  assert.equal(report.includes(TOKEN), false)
})

test('taxonomy failures stay bounded and do not treat a mismatch as the checked category', async () => {
  const sequence = async (handler: EbayFetch) => collectTaxonomyCategoryReading({
    confirm: 'run-outside-ci',
    clientId: CLIENT_ID,
    clientSecret: CLIENT_SECRET,
    fetchImpl: async (input, init) => {
      if (input === EBAY_OAUTH_TOKEN_URL) return jsonResponse({ access_token: TOKEN, expires_in: 7200 })
      return handler(input, init)
    },
  })

  let subtreeCalls = 0
  const missing = await sequence(async (input) => {
    if (String(input).includes('/get_category_subtree')) {
      subtreeCalls += 1
      return jsonResponse({ errors: [{ errorId: 62005, message: 'secret-error-text' }] }, 404)
    }
    return jsonResponse(treeBody())
  })
  assert.equal(missing.status, 'not-found')
  if (missing.status !== 'not-found') return
  assert.equal(missing.httpStatus, 404)
  assert.deepEqual(missing.errorIds, [62005])
  const missingReport = formatTaxonomyCategoryReport(missing)
  assert.match(missingReport, /no demuestra que el id no haya existido nunca/)
  assert.equal(missingReport.includes('secret-error-text'), false)
  assert.equal(subtreeCalls, 1)

  let afterEmpty = 0
  const emptyTree = await sequence(async (input) => {
    afterEmpty += 1
    assert.equal(String(input).includes('/get_category_subtree'), false)
    return new Response(null, { status: 204 })
  })
  assert.equal(emptyTree.status, 'invalid-response')
  if (emptyTree.status !== 'invalid-response') return
  assert.equal(emptyTree.httpStatus, 204)
  assert.equal(afterEmpty, 1)

  let afterWideTree = 0
  const wideTree = await sequence(async (input) => {
    afterWideTree += 1
    assert.equal(String(input).includes('/get_category_subtree'), false)
    return jsonResponse(treeBody('a'.repeat(33)))
  })
  assert.equal(wideTree.status, 'invalid-response')
  assert.equal(afterWideTree, 1)

  const mismatch = await sequence(async (input) => {
    if (String(input).startsWith(EBAY_TAXONOMY_DEFAULT_TREE_URL)) return jsonResponse(treeBody())
    return jsonResponse(subtreeBody({
      category: { categoryId: '999', categoryName: 'Otra categoria' },
    }))
  })
  assert.equal(mismatch.status, 'identifier-mismatch')
  if (mismatch.status !== 'identifier-mismatch') return
  assert.equal(mismatch.returnedCategoryId, '999')
  assert.equal(JSON.stringify(mismatch).includes('Otra categoria'), false)

  const redirected = await sequence(async () => new Response(null, {
    status: 302,
    headers: { location: 'https://evil.example/tree' },
  }))
  assert.equal(redirected.status, 'unavailable')
  if (redirected.status !== 'unavailable') return
  assert.equal(redirected.httpStatus, 302)

  const oversized = await sequence(async (input) => {
    if (String(input).startsWith(EBAY_TAXONOMY_DEFAULT_TREE_URL)) return jsonResponse(treeBody())
    return new Response('{}', {
      status: 200,
      headers: { 'content-type': 'application/json', 'content-length': '200000' },
    })
  })
  assert.equal(oversized.status, 'invalid-response')

  const malformed = await sequence(async (input) => {
    if (String(input).startsWith(EBAY_TAXONOMY_DEFAULT_TREE_URL)) return jsonResponse(treeBody())
    return new Response('{', { status: 200, headers: { 'content-type': 'application/json' } })
  })
  assert.equal(malformed.status, 'invalid-response')
})

test('metadata stays off without a caller-supplied token and keeps only the matching category', async () => {
  let fetches = 0
  const idle: EbayFetch = async () => {
    fetches += 1
    throw new Error('should not fetch')
  }
  assert.equal((await collectItemConditionPolicies()).status, 'not-run')
  assert.equal((await collectItemConditionPolicies({
    confirm: 'run-outside-ci',
    accessToken: '',
    fetchImpl: idle,
  })).status, 'not-run')
  assert.equal((await collectItemConditionPolicies({
    confirm: 'run-outside-ci',
    accessToken: 'token with space',
    fetchImpl: idle,
  })).status, 'invalid-token')
  assert.equal(fetches, 0)

  const calls: string[] = []
  const result = await collectItemConditionPolicies({
    confirm: 'run-outside-ci',
    accessToken: METADATA_TOKEN,
    fetchImpl: async (input, init) => {
      calls.push(String(input))
      assert.equal(String(input).includes('/identity/v1/oauth2/token'), false)
      const headers = new Headers(init?.headers)
      assert.equal(headers.get('authorization'), `Bearer ${METADATA_TOKEN}`)
      assert.equal(headers.get('accept-encoding'), null)
      assert.equal(headers.get('x-ebay-c-marketplace-id'), null)
      return jsonResponse(policyBody())
    },
  })
  assert.equal(calls.length, 1)
  assert.equal(calls[0], conditionPolicyUrl())
  const url = new URL(calls[0] ?? '')
  assert.equal(url.pathname, '/sell/metadata/v1/marketplace/EBAY_ES/get_item_condition_policies')
  assert.deepEqual([...url.searchParams.keys()], ['filter'])
  assert.equal(url.searchParams.get('filter'), 'categoryIds:{139971}')
  assert.equal(url.search.includes('categoryIds%3A%7B139971%7D'), true)
  assert.equal(result.status, 'ok')
  if (result.status !== 'ok') return
  assert.equal(result.report.categoryId, '139971')
  assert.equal(result.report.httpStatus, 200)
  assert.equal(result.report.itemConditionRequired, true)
  assert.deepEqual(result.report.conditions, [
    { conditionId: '3000', conditionDescription: 'Texto de prueba' },
    { conditionId: '1000', conditionDescription: 'Otro texto de prueba' },
  ])
  assert.deepEqual(result.report.otherCategoryIds, ['999'])
  assert.deepEqual(result.report.warningIds, [46004])
  assert.equal(result.report.completePolicy, false)
  assert.equal(result.report.admittedConditionIdsUnchanged, true)
  const serialized = JSON.stringify(result)
  assert.equal(serialized.includes(HELP_TEXT), false)
  assert.equal(serialized.includes(LONG_MESSAGE), false)
  assert.equal(serialized.includes('Condicion de otra categoria'), false)
  assert.equal(serialized.includes('RESTRICTED'), false)
  assert.equal(serialized.includes(METADATA_TOKEN), false)
  const report = formatConditionPolicyReport(result)
  assert.match(report, /conditionId: 3000/)
  assert.match(report, /conditionDescription: Texto de prueba/)
  assert.match(report, /errorNote: 46004: Solo se consideran 50 categoryId del filtro\./)
  assert.equal(report.includes(HELP_TEXT), false)
  assert.equal(report.includes(LONG_MESSAGE), false)

  const absent = await collectItemConditionPolicies({
    confirm: 'run-outside-ci',
    accessToken: METADATA_TOKEN,
    fetchImpl: async () => jsonResponse({
      itemConditionPolicies: [{ categoryId: '999', itemConditions: [] }],
      errors: [{ errorId: 46003, message: 'secret-error-text' }],
    }),
  })
  assert.equal(absent.status, 'category-not-in-response')
  if (absent.status !== 'category-not-in-response') return
  assert.deepEqual(absent.otherCategoryIds, ['999'])
  assert.deepEqual(absent.errorIds, [46003])
  assert.equal(JSON.stringify(absent).includes('secret-error-text'), false)
  assert.match(formatConditionPolicyReport(absent), /46003: El categoryId no existe en ese marketplace\./)

  const empty = await collectItemConditionPolicies({
    confirm: 'run-outside-ci',
    accessToken: METADATA_TOKEN,
    fetchImpl: async () => new Response(null, { status: 204 }),
  })
  assert.equal(empty.status, 'no-content')
  if (empty.status !== 'no-content') return
  assert.equal(empty.httpStatus, 204)

  const rejected = await collectItemConditionPolicies({
    confirm: 'run-outside-ci',
    accessToken: METADATA_TOKEN,
    fetchImpl: async () => jsonResponse({ errors: [{ errorId: 46001, longMessage: LONG_MESSAGE }] }, 400),
  })
  assert.equal(rejected.status, 'unavailable')
  if (rejected.status !== 'unavailable') return
  assert.equal(rejected.httpStatus, 400)
  assert.deepEqual(rejected.errorIds, [46001])
  assert.equal(JSON.stringify(rejected).includes(LONG_MESSAGE), false)

  const unauthorized = await collectItemConditionPolicies({
    confirm: 'run-outside-ci',
    accessToken: METADATA_TOKEN,
    fetchImpl: async () => jsonResponse({ errors: [{ errorId: 1001 }] }, 401),
  })
  assert.equal(unauthorized.status, 'unauthorized')

  const redirected = await collectItemConditionPolicies({
    confirm: 'run-outside-ci',
    accessToken: METADATA_TOKEN,
    fetchImpl: async () => new Response(null, { status: 302, headers: { location: 'https://evil.example/policy' } }),
  })
  assert.equal(redirected.status, 'unavailable')
  if (redirected.status !== 'unavailable') return
  assert.equal(redirected.httpStatus, 302)

  const oversized = await collectItemConditionPolicies({
    confirm: 'run-outside-ci',
    accessToken: METADATA_TOKEN,
    fetchImpl: async () => new Response('{}', {
      status: 200,
      headers: { 'content-type': 'application/json', 'content-length': '200000' },
    }),
  })
  assert.equal(oversized.status, 'invalid-response')
})

function sessionIO(steps: {
  answers: string[]
  secrets?: string[]
  fetchImpl?: EbayFetch
  failAsk?: Error
}): { io: EbayEsCategoryDiagnosticIO, output: () => string, secretPrompts: () => number, fetches: () => number } {
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
  const io: EbayEsCategoryDiagnosticIO = {
    ask: async () => {
      if (steps.failAsk) throw steps.failAsk
      return answers.shift() ?? ''
    },
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
    output: () => output.join(''),
    secretPrompts: () => state.secretPrompts,
    fetches: () => state.fetches,
  }
}

test('the hidden prompt does not copy the secret and keeps queued lines', async () => {
  const input = new PassThrough()
  const chunks: string[] = []
  const output = new Writable({
    write(chunk, _encoding, callback) {
      chunks.push(String(chunk))
      callback()
    },
  })
  const prompts = createTerminalPrompts(input, output)
  input.write(`run-outside-ci\n${CLIENT_SECRET}\n`)
  assert.equal(await prompts.ask('confirmacion: '), 'run-outside-ci')
  assert.equal(await prompts.askHidden('Cert ID, sin eco: '), CLIENT_SECRET)
  prompts.close()
  const shown = chunks.join('')
  assert.equal(shown.includes(CLIENT_SECRET), false)
  assert.match(shown, /confirmacion: run-outside-ci/)

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
  tty.write(`run-outside-ci\n${CLIENT_SECRET}\n`)
  assert.equal(await ttyPrompts.ask('confirmacion: '), 'run-outside-ci')
  assert.equal(await ttyPrompts.askHidden('Cert ID, sin eco: '), CLIENT_SECRET)
  ttyPrompts.close()
  const ttyShown = ttyChunks.join('')
  assert.equal(ttyShown.includes(CLIENT_SECRET), false)
  assert.equal(ttyShown.includes('run-outside-ci'), false)
  assert.deepEqual(modes, [false, true, false])

  const raw = new PassThrough()
  const rawOutput = new Writable({
    write(_chunk, _encoding, callback) {
      callback()
    },
  })
  const rawPrompts = createTerminalPrompts(raw, rawOutput)
  const pending = rawPrompts.ask('x: ')
  raw.write('\u0003')
  await assert.rejects(pending, (error: Error) => error.message === 'interrupted')
  rawPrompts.close()
})

test('the diagnostic session does not call metadata without its own confirmation', async () => {
  const idle: EbayFetch = async () => {
    throw new Error('should not fetch')
  }
  const declined = sessionIO({ answers: ['no'], secrets: [CLIENT_ID, CLIENT_SECRET, METADATA_TOKEN], fetchImpl: idle })
  await runEbayEsCategoryDiagnostics(declined.io)
  assert.equal(declined.secretPrompts(), 0)
  assert.equal(declined.fetches(), 0)
  assert.match(declined.output(), /status: not-run/)
  assert.equal(declined.output().includes(CLIENT_SECRET), false)

  const emptySecret = sessionIO({
    answers: ['run-outside-ci'],
    secrets: ['', CLIENT_SECRET],
    fetchImpl: idle,
  })
  await runEbayEsCategoryDiagnostics(emptySecret.io)
  assert.equal(emptySecret.fetches(), 0)
  assert.match(emptySecret.output(), /status: not-run/)

  const calls: string[] = []
  const fetchImpl: EbayFetch = async (input) => {
    calls.push(String(input))
    if (input === EBAY_OAUTH_TOKEN_URL) return jsonResponse({ access_token: TOKEN, expires_in: 7200 })
    if (String(input).startsWith(EBAY_TAXONOMY_DEFAULT_TREE_URL)) return jsonResponse(treeBody())
    if (String(input).includes('/get_category_subtree')) return jsonResponse(subtreeBody())
    return jsonResponse(policyBody())
  }
  const taxonomyOnly = sessionIO({
    answers: ['run-outside-ci', 'no'],
    secrets: [CLIENT_ID, CLIENT_SECRET, METADATA_TOKEN],
    fetchImpl,
  })
  await runEbayEsCategoryDiagnostics(taxonomyOnly.io)
  assert.equal(calls.some((call) => call.includes('get_item_condition_policies')), false)
  assert.match(taxonomyOnly.output(), /categoryName: Nombre de prueba/)
  assert.match(taxonomyOnly.output(), /status: not-run/)
  assert.equal(taxonomyOnly.output().includes(METADATA_TOKEN), false)
  assert.equal(taxonomyOnly.output().includes(CLIENT_SECRET), false)

  const skippedToken = sessionIO({
    answers: ['run-outside-ci', 'run-metadata-outside-ci'],
    secrets: [CLIENT_ID, CLIENT_SECRET, ''],
    fetchImpl,
  })
  const before = calls.length
  await runEbayEsCategoryDiagnostics(skippedToken.io)
  assert.equal(calls.slice(before).some((call) => call.includes('get_item_condition_policies')), false)
  assert.match(skippedToken.output(), /No se ha llamado a get_item_condition_policies/)

  calls.length = 0
  const both = sessionIO({
    answers: ['run-outside-ci', 'run-metadata-outside-ci'],
    secrets: [CLIENT_ID, CLIENT_SECRET, METADATA_TOKEN],
    fetchImpl,
  })
  await runEbayEsCategoryDiagnostics(both.io)
  assert.equal(calls.some((call) => call.includes('get_item_condition_policies')), true)
  assert.match(both.output(), /conditionId: 3000/)
  assert.match(both.output(), /conditionDescription: Texto de prueba/)
  assert.match(both.output(), new RegExp(EBAY_ES_CATEGORY_DIAGNOSTIC_CLOSING.trim()))
  assert.equal(both.output().includes(CLIENT_ID), false)
  assert.equal(both.output().includes(CLIENT_SECRET), false)
  assert.equal(both.output().includes(TOKEN), false)
  assert.equal(both.output().includes(METADATA_TOKEN), false)
  assert.equal(both.output().includes(HELP_TEXT), false)

  const interrupted = sessionIO({
    answers: [],
    failAsk: new Error(CLIENT_SECRET),
    fetchImpl: idle,
  })
  await runEbayEsCategoryDiagnostics(interrupted.io)
  assert.equal(interrupted.output(), EBAY_ES_CATEGORY_DIAGNOSTIC_INTERRUPTION)
  assert.equal(interrupted.output().includes(CLIENT_SECRET), false)
  assert.equal(interrupted.fetches(), 0)
})

test('the diagnostic leaves the provider, conditions and product mapping unchanged', async () => {
  assert.equal(SELL_METADATA_CONDITION_CONTRACT_IN_REPO, false)
  assert.equal(EBAY_ES_ADMITTED_CONDITION_IDS.length, 0)
  assert.equal(EBAY_BROWSE_SOURCE_ENABLED, false)
  assert.equal(emptySecondHandDataSource.id, 'empty')
  const mapping = secondHandProductMapping('nintendo-switch')
  assert.equal(mapping?.externalProductId, null)
  assert.equal(mapping?.marketplaceIdentifier, null)
  assert.equal(SECOND_HAND_PRODUCT_MAPPINGS.every((spec) => spec.externalProductId === null), true)

  const metadataSource = readFileSync(new URL('../lib/ebay-metadata-condition-policy-reading.ts', import.meta.url), 'utf8')
  const metadataCode = metadataSource.replace(/\/\*[\s\S]*?\*\//g, '').replace(/\/\/.*$/gm, '')
  assert.doesNotMatch(metadataCode, /createEbayApplicationAuth|client_credentials|grant_type|process\.env|writeFile|createWriteStream|appendFile|console\./)

  for (const relative of [
    '../lib/ebay-taxonomy-category-reading.ts',
    '../lib/ebay-es-category-diagnostic-session.ts',
    '../lib/ebay-diagnostic-prompt.ts',
    '../scripts/read-ebay-es-category-diagnostics.ts',
  ]) {
    const source = readFileSync(new URL(relative, import.meta.url), 'utf8')
    const code = source.replace(/\/\*[\s\S]*?\*\//g, '').replace(/\/\/.*$/gm, '')
    assert.doesNotMatch(code, /process\.env|writeFile|createWriteStream|appendFile|readFileSync|EBAY_BROWSE_SOURCE_ENABLED\s*=\s*true|console\./, relative)
  }
  const pkg = readFileSync(new URL('../package.json', import.meta.url), 'utf8')
  const workflow = readFileSync(new URL('../.github/workflows/deploy.yml', import.meta.url), 'utf8')
  assert.equal(pkg.includes('read-ebay-es-category-diagnostics'), false)
  assert.equal(workflow.includes('read-ebay-es-category-diagnostics'), false)
  const script = readFileSync(new URL('../scripts/read-ebay-es-category-diagnostics.ts', import.meta.url), 'utf8')
  assert.match(script, /invokedDirectly/)
  assert.match(script, /askHidden/)
  assert.match(script, /void main\(\)/)
  await import('../scripts/read-ebay-es-category-diagnostics')
})
