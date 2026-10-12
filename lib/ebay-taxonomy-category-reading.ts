/**
 * Lectura voluntaria de una categoría en el árbol por defecto de EBAY_ES.
 *
 * Contrato leído: Taxonomy API v1.1.1, OpenAPI 3.0.0.
 * `getCategorySubtree` confirma id, nombre, nivel y hoja si el booleano viene
 * en true. No devuelve la ruta de ancestros. Esta función no descarga el árbol
 * completo y no llama a la red sin confirmación y sin `fetchImpl`.
 */

import {
  EBAY_APPLICATION_REQUEST_TIMEOUT_MS,
  EBAY_API_ORIGIN,
  createEbayApplicationAuth,
  ebayRequestSignal,
  isEbayJsonContentType,
  readEbayLimitedJson,
  type EbayApplicationAuth,
  type EbayFetch,
} from './ebay-application-auth'
import { EBAY_BROWSE_MARKETPLACE_ID, EBAY_BROWSE_RESPONSE_MAX_BYTES } from './ebay-browse-client'

/**
 * Id aparecido en una lectura manual de un anuncio. No es la categoría
 * verificada de un producto ni de `nintendo-switch`.
 */
export const EBAY_ES_CATEGORY_ID_TO_CHECK = '139971'
export const EBAY_TAXONOMY_CATEGORY_PATH = 'not-in-getCategorySubtree-contract' as const
export const EBAY_TAXONOMY_DEFAULT_TREE_URL = `${EBAY_API_ORIGIN}/commerce/taxonomy/v1/get_default_category_tree_id`

const TREE_ID_PATTERN = /^[A-Za-z0-9_-]{1,32}$/
const CATEGORY_ID_PATTERN = /^[0-9]{1,12}$/
const NAME_MAX_LENGTH = 200
const VERSION_MAX_LENGTH = 64

const TAXONOMY_ERROR_NOTES: Record<number, string> = {
  62000: 'Problema interno de eBay.',
  62002: 'Falta marketplace_id.',
  62003: 'El marketplace indicado no existe.',
  62004: 'El categoryTreeId no existe.',
  62005: 'El categoryId no pertenece a ese árbol.',
  62006: 'Falta category_id.',
  62008: 'El categoryId es la raíz. No se descarga el árbol completo.',
}

export interface EbayTaxonomyCategoryReading {
  marketplaceId: typeof EBAY_BROWSE_MARKETPLACE_ID
  categoryId: typeof EBAY_ES_CATEGORY_ID_TO_CHECK
  categoryName: string
  categoryTreeId: string
  categoryTreeVersion: string | 'absent'
  categoryTreeNodeLevel: number | 'absent'
  leafCategoryTreeNode: true | 'absent'
  hasDescendants: boolean | 'absent'
  categoryPath: typeof EBAY_TAXONOMY_CATEGORY_PATH
  verifiesProductCategory: false
  verifiesNintendoSwitchCategory: false
  httpStatus: 200
  errorIds: number[]
}

type TaxonomyFailure = {
  marketplaceId: typeof EBAY_BROWSE_MARKETPLACE_ID
  categoryId: typeof EBAY_ES_CATEGORY_ID_TO_CHECK
  categoryPath: typeof EBAY_TAXONOMY_CATEGORY_PATH
  verifiesProductCategory: false
  verifiesNintendoSwitchCategory: false
  httpStatus: number | null
  errorIds: number[]
}

export type EbayTaxonomyCategoryResult =
  | { status: 'not-run' }
  | (TaxonomyFailure & { status: 'unauthorized' })
  | (TaxonomyFailure & { status: 'forbidden' })
  | (TaxonomyFailure & { status: 'unavailable' })
  | (TaxonomyFailure & { status: 'invalid-response' })
  | (TaxonomyFailure & { status: 'not-found' })
  | (TaxonomyFailure & { status: 'identifier-mismatch', returnedCategoryId: string | 'unusable' })
  | { status: 'ok', reading: EbayTaxonomyCategoryReading }

type RawCall =
  | { kind: 'network' }
  | { kind: 'invalid', status: number }
  | { kind: 'empty', status: number }
  | { kind: 'http', status: number, errorIds: number[] }
  | { kind: 'ok', status: 200, body: unknown }

export function taxonomyErrorNotes(ids: readonly number[]): string[] {
  return ids.flatMap((id) => {
    const note = TAXONOMY_ERROR_NOTES[id]
    return note ? [`${id}: ${note}`] : []
  })
}

export function formatTaxonomyCategoryReport(result: EbayTaxonomyCategoryResult): string {
  if (result.status === 'not-run') {
    return [
      'status: not-run',
      `categoryId: ${EBAY_ES_CATEGORY_ID_TO_CHECK}`,
      'marketplaceId: EBAY_ES',
      `categoryPath: ${EBAY_TAXONOMY_CATEGORY_PATH}`,
      'verifiesNintendoSwitchCategory: false',
      'No se ha llamado a la Taxonomy API.',
      '',
    ].join('\n')
  }
  const httpStatus = result.status === 'ok' ? result.reading.httpStatus : result.httpStatus
  const errorIds = result.status === 'ok' ? result.reading.errorIds : result.errorIds
  const lines = [
    `status: ${result.status}`,
    `httpStatus: ${httpStatus === null ? 'absent' : String(httpStatus)}`,
    `categoryId: ${result.status === 'ok' ? result.reading.categoryId : result.categoryId}`,
    'marketplaceId: EBAY_ES',
    `categoryPath: ${EBAY_TAXONOMY_CATEGORY_PATH}`,
    'verifiesProductCategory: false',
    'verifiesNintendoSwitchCategory: false',
  ]
  if (result.status === 'ok') {
    const reading = result.reading
    lines.push(`categoryName: ${reading.categoryName}`)
    lines.push(`categoryTreeId: ${reading.categoryTreeId}`)
    lines.push(`categoryTreeVersion: ${reading.categoryTreeVersion}`)
    lines.push(`categoryTreeNodeLevel: ${String(reading.categoryTreeNodeLevel)}`)
    lines.push(`leafCategoryTreeNode: ${String(reading.leafCategoryTreeNode)}`)
    lines.push(`hasDescendants: ${String(reading.hasDescendants)}`)
  } else if (result.status === 'identifier-mismatch') {
    lines.push(`returnedCategoryId: ${result.returnedCategoryId}`)
  }
  lines.push(`errorIds: ${errorIds.join(' ')}`.trimEnd())
  for (const note of taxonomyErrorNotes(errorIds)) {
    lines.push(`errorNote: ${note}`)
  }
  if (result.status === 'not-found') {
    lines.push('Un 404 de este árbol no demuestra que el id no haya existido nunca.')
  }
  lines.push('El nombre, si aparece, no demuestra que sea la categoría de nintendo-switch.')
  lines.push('getCategorySubtree no incluye la ruta de ancestros. No se descarga el árbol completo.')
  lines.push('')
  return lines.join('\n')
}

/**
 * Sin `confirm: 'run-outside-ci'` y sin `fetchImpl` no hay petición.
 * Las credenciales solo entran como argumentos. El ámbito es el de aplicación
 * que el OpenAPI publica en `getDefaultCategoryTreeId` y `getCategorySubtree`.
 */
export async function collectTaxonomyCategoryReading(input?: {
  confirm?: 'run-outside-ci'
  clientId?: string
  clientSecret?: string
  fetchImpl?: EbayFetch
}): Promise<EbayTaxonomyCategoryResult> {
  if (
    input?.confirm !== 'run-outside-ci'
    || !input.fetchImpl
    || !input.clientId
    || !input.clientSecret
  ) {
    return { status: 'not-run' }
  }
  const fetchImpl = input.fetchImpl
  const auth = createEbayApplicationAuth({
    clientId: input.clientId,
    clientSecret: input.clientSecret,
    fetchImpl,
  })
  const first = await auth.getAccessToken()
  if (first.status === 'unauthorized') return failure('unauthorized', null, [])
  if (first.status !== 'ok') return failure('unavailable', null, [])

  const treeCall = await authorizedGet(defaultTreeUrl(), first.token, fetchImpl, auth)
  if (treeCall.kind !== 'ok') return treeCall.result
  const tree = readTreeId(treeCall.body)
  if (!tree) return failure('invalid-response', 200, errorIdsOf(treeCall.body))
  const subtree = subtreeUrl(tree.id)
  if (!subtree) return failure('invalid-response', 200, [])

  const nodeCall = await authorizedGet(subtree, treeCall.token, fetchImpl, auth)
  if (nodeCall.kind !== 'ok') return nodeCall.result
  return readSubtree(nodeCall.body, tree.id)
}

function defaultTreeUrl(): string {
  const url = new URL(EBAY_TAXONOMY_DEFAULT_TREE_URL)
  url.searchParams.set('marketplace_id', EBAY_BROWSE_MARKETPLACE_ID)
  return url.toString()
}

function subtreeUrl(treeId: string): string | null {
  if (!TREE_ID_PATTERN.test(treeId)) return null
  const url = new URL(`${EBAY_API_ORIGIN}/commerce/taxonomy/v1/category_tree/${treeId}/get_category_subtree`)
  url.searchParams.set('category_id', EBAY_ES_CATEGORY_ID_TO_CHECK)
  return url.toString()
}

async function authorizedGet(
  url: string,
  token: string,
  fetchImpl: EbayFetch,
  auth: EbayApplicationAuth,
): Promise<{ kind: 'ok', body: unknown, token: string } | { kind: 'stop', result: EbayTaxonomyCategoryResult }> {
  const first = await getJson(url, token, fetchImpl)
  const chosen = first.kind === 'http' && first.status === 401
    ? await retryOnce(url, token, fetchImpl, auth)
    : { call: first, token }
  return finishCall(chosen.call, chosen.token, url)
}

async function retryOnce(
  url: string,
  token: string,
  fetchImpl: EbayFetch,
  auth: EbayApplicationAuth,
): Promise<{ call: RawCall, token: string }> {
  const refreshed = await auth.getAccessToken({ force: true })
  if (refreshed.status !== 'ok' || refreshed.token === token) return { call: { kind: 'http', status: 401, errorIds: [] }, token }
  return { call: await getJson(url, refreshed.token, fetchImpl), token: refreshed.token }
}

function finishCall(
  call: RawCall,
  token: string,
  url: string,
): { kind: 'ok', body: unknown, token: string } | { kind: 'stop', result: EbayTaxonomyCategoryResult } {
  if (call.kind === 'ok') return { kind: 'ok', body: call.body, token }
  if (call.kind === 'network') return { kind: 'stop', result: failure('unavailable', null, []) }
  if (call.kind === 'invalid') return { kind: 'stop', result: failure('invalid-response', call.status, []) }
  if (call.kind === 'empty') return { kind: 'stop', result: failure('invalid-response', call.status, []) }
  if (call.status === 401) return { kind: 'stop', result: failure('unauthorized', 401, call.errorIds) }
  if (call.status === 403) return { kind: 'stop', result: failure('forbidden', 403, call.errorIds) }
  if (call.status === 404 && url.includes('/get_category_subtree')) {
    return { kind: 'stop', result: failure('not-found', 404, call.errorIds) }
  }
  return { kind: 'stop', result: failure('unavailable', call.status, call.errorIds) }
}

async function getJson(url: string, token: string, fetchImpl: EbayFetch): Promise<RawCall> {
  let response: Response
  try {
    response = await fetchImpl(url, {
      method: 'GET',
      headers: {
        Accept: 'application/json',
        Authorization: `Bearer ${token}`,
      },
      redirect: 'manual',
      cache: 'no-store',
      signal: ebayRequestSignal(EBAY_APPLICATION_REQUEST_TIMEOUT_MS),
    })
  } catch {
    return { kind: 'network' }
  }
  if (isRedirect(response.status)) {
    await cancelBody(response)
    return { kind: 'http', status: response.status, errorIds: [] }
  }
  if (response.status === 204) {
    await cancelBody(response)
    return { kind: 'empty', status: 204 }
  }
  const declared = Number(response.headers.get('content-length'))
  if (Number.isFinite(declared) && declared > EBAY_BROWSE_RESPONSE_MAX_BYTES) {
    await cancelBody(response)
    return { kind: 'invalid', status: response.status }
  }
  if (!isEbayJsonContentType(response.headers.get('content-type'))) {
    await cancelBody(response)
    return response.status === 200
      ? { kind: 'invalid', status: response.status }
      : { kind: 'http', status: response.status, errorIds: [] }
  }
  const parsed = await readEbayLimitedJson(response, EBAY_BROWSE_RESPONSE_MAX_BYTES)
  if (!parsed.ok) {
    return response.status === 200
      ? { kind: 'invalid', status: response.status }
      : { kind: 'http', status: response.status, errorIds: [] }
  }
  if (response.status !== 200) return { kind: 'http', status: response.status, errorIds: errorIdsOf(parsed.value) }
  return { kind: 'ok', status: 200, body: parsed.value }
}

function readTreeId(value: unknown): { id: string, version: string | 'absent' } | null {
  if (!isRecord(value)) return null
  if (typeof value.categoryTreeId !== 'string' || !TREE_ID_PATTERN.test(value.categoryTreeId)) return null
  return { id: value.categoryTreeId, version: usableVersion(value.categoryTreeVersion) }
}

function readSubtree(value: unknown, treeId: string): EbayTaxonomyCategoryResult {
  if (!isRecord(value) || !isRecord(value.categorySubtreeNode)) return failure('invalid-response', 200, errorIdsOf(value))
  const returnedTree = value.categoryTreeId
  if (returnedTree !== undefined && returnedTree !== treeId) return failure('invalid-response', 200, errorIdsOf(value))
  const node = value.categorySubtreeNode
  if (!isRecord(node.category)) return failure('invalid-response', 200, errorIdsOf(value))
  const returnedId = node.category.categoryId
  if (returnedId !== EBAY_ES_CATEGORY_ID_TO_CHECK) {
    return {
      ...failure('invalid-response', 200, errorIdsOf(value)),
      status: 'identifier-mismatch',
      returnedCategoryId: typeof returnedId === 'string' && CATEGORY_ID_PATTERN.test(returnedId) ? returnedId : 'unusable',
    }
  }
  const categoryName = usableName(node.category.categoryName)
  const level = readLevel(node.categoryTreeNodeLevel)
  if (!categoryName || level === 'invalid') return failure('invalid-response', 200, errorIdsOf(value))
  const children = node.childCategoryTreeNodes
  const reading: EbayTaxonomyCategoryReading = {
    marketplaceId: EBAY_BROWSE_MARKETPLACE_ID,
    categoryId: EBAY_ES_CATEGORY_ID_TO_CHECK,
    categoryName,
    categoryTreeId: treeId,
    categoryTreeVersion: usableVersion(value.categoryTreeVersion),
    categoryTreeNodeLevel: level,
    leafCategoryTreeNode: node.leafCategoryTreeNode === true ? true : 'absent',
    hasDescendants: Array.isArray(children) ? children.length > 0 : 'absent',
    categoryPath: EBAY_TAXONOMY_CATEGORY_PATH,
    verifiesProductCategory: false,
    verifiesNintendoSwitchCategory: false,
    httpStatus: 200,
    errorIds: errorIdsOf(value),
  }
  return { status: 'ok', reading }
}

function failure(
  status: 'unauthorized' | 'forbidden' | 'unavailable' | 'invalid-response' | 'not-found',
  httpStatus: number | null,
  errorIds: number[],
): TaxonomyFailure & { status: typeof status } {
  return {
    status,
    marketplaceId: EBAY_BROWSE_MARKETPLACE_ID,
    categoryId: EBAY_ES_CATEGORY_ID_TO_CHECK,
    categoryPath: EBAY_TAXONOMY_CATEGORY_PATH,
    verifiesProductCategory: false,
    verifiesNintendoSwitchCategory: false,
    httpStatus,
    errorIds,
  }
}

function errorIdsOf(value: unknown): number[] {
  if (!isRecord(value)) return []
  const ids = [...idsFrom(value.errors), ...idsFrom(value.warnings)]
  if (typeof value.errorId === 'number') ids.push(value.errorId)
  const unique: number[] = []
  for (const id of ids) {
    if (!unique.includes(id)) unique.push(id)
    if (unique.length === 20) break
  }
  return unique
}

function idsFrom(value: unknown): number[] {
  if (!Array.isArray(value)) return []
  const ids: number[] = []
  for (const entry of value) {
    if (!isRecord(entry) || typeof entry.errorId !== 'number' || !Number.isInteger(entry.errorId)) continue
    if (entry.errorId <= 0 || entry.errorId > 999_999) continue
    ids.push(entry.errorId)
  }
  return ids
}

function readLevel(value: unknown): number | 'absent' | 'invalid' {
  if (value === undefined) return 'absent'
  if (typeof value !== 'number' || !Number.isInteger(value) || value < 0 || value > 100) return 'invalid'
  return value
}

function usableName(value: unknown): string | null {
  if (typeof value !== 'string') return null
  if (value.length < 1 || value.length > NAME_MAX_LENGTH) return null
  if (value !== value.trim()) return null
  if (/[\u0000-\u001F\u007F]/.test(value)) return null
  return value
}

function usableVersion(value: unknown): string | 'absent' {
  if (typeof value !== 'string') return 'absent'
  if (value.length < 1 || value.length > VERSION_MAX_LENGTH) return 'absent'
  if (value !== value.trim() || /[\u0000-\u001F\u007F]/.test(value)) return 'absent'
  return value
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value)
}

function isRedirect(status: number): boolean {
  return status === 301 || status === 302 || status === 303 || status === 307 || status === 308
}

async function cancelBody(response: Response): Promise<void> {
  try {
    await response.body?.cancel()
  } catch {
    return
  }
}
