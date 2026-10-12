/**
 * Lectura voluntaria de la política de condiciones de una categoría en EBAY_ES.
 *
 * Contrato leído: Metadata API v1.12.1, OpenAPI 3.0.0, operación
 * `getItemConditionPolicies`. No pide un token de aplicación. Quien llama
 * entrega un access token ya emitido. Esta función no puede demostrar que
 * ese token sea de authorization code, así que el informe no es la lista
 * completa de condiciones restringidas.
 */

import {
  EBAY_APPLICATION_REQUEST_TIMEOUT_MS,
  EBAY_API_ORIGIN,
  ebayRequestSignal,
  isEbayApplicationToken,
  isEbayJsonContentType,
  readEbayLimitedJson,
  type EbayFetch,
} from './ebay-application-auth'
import { EBAY_BROWSE_RESPONSE_MAX_BYTES } from './ebay-browse-client'
import { EBAY_ES_CATEGORY_ID_TO_CHECK } from './ebay-taxonomy-category-reading'

export const EBAY_METADATA_CONDITION_POLICIES_URL =
  `${EBAY_API_ORIGIN}/sell/metadata/v1/marketplace/EBAY_ES/get_item_condition_policies`
export const EBAY_METADATA_CONDITION_FILTER = `categoryIds:{${EBAY_ES_CATEGORY_ID_TO_CHECK}}`

const CONDITION_ID_PATTERN = /^[0-9]{1,8}$/
const DESCRIPTION_MAX_LENGTH = 200
const OTHER_CATEGORY_LIMIT = 50

const METADATA_ERROR_NOTES: Record<number, string> = {
  46000: 'Problema interno de eBay.',
  46001: 'El marketplace indicado no existe.',
  46002: 'El filtro no es válido.',
  46003: 'El categoryId no existe en ese marketplace.',
  46004: 'Solo se consideran 50 categoryId del filtro.',
}

export interface EbayConditionPolicyEntry {
  conditionId: string
  conditionDescription: string
}

export interface EbayConditionPolicyReport {
  categoryId: typeof EBAY_ES_CATEGORY_ID_TO_CHECK
  httpStatus: 200
  itemConditionRequired: boolean | 'absent'
  conditions: EbayConditionPolicyEntry[]
  conditionsOmitted: number
  otherCategoryIds: string[]
  otherCategoryIdsTruncated: boolean
  duplicateCategoryPolicy: boolean
  errorIds: number[]
  warningIds: number[]
  completePolicy: false
  admittedConditionIdsUnchanged: true
}

type PolicyFailure = {
  categoryId: typeof EBAY_ES_CATEGORY_ID_TO_CHECK
  httpStatus: number | null
  errorIds: number[]
  warningIds: number[]
  completePolicy: false
  admittedConditionIdsUnchanged: true
}

export type EbayConditionPolicyResult =
  | { status: 'not-run' }
  | { status: 'invalid-token' }
  | (PolicyFailure & { status: 'unauthorized' })
  | (PolicyFailure & { status: 'forbidden' })
  | (PolicyFailure & { status: 'no-content' })
  | (PolicyFailure & { status: 'unavailable' })
  | (PolicyFailure & { status: 'invalid-response' })
  | (PolicyFailure & { status: 'not-found' })
  | (PolicyFailure & {
    status: 'category-not-in-response'
    otherCategoryIds: string[]
    otherCategoryIdsTruncated: boolean
  })
  | { status: 'ok', report: EbayConditionPolicyReport }

export function metadataErrorNotes(ids: readonly number[]): string[] {
  return ids.flatMap((id) => {
    const note = METADATA_ERROR_NOTES[id]
    return note ? [`${id}: ${note}`] : []
  })
}

export function formatConditionPolicyReport(result: EbayConditionPolicyResult): string {
  if (result.status === 'not-run') {
    return [
      'status: not-run',
      `categoryId: ${EBAY_ES_CATEGORY_ID_TO_CHECK}`,
      'No se ha llamado a get_item_condition_policies.',
      'completePolicy: false',
      'admittedConditionIdsUnchanged: true',
      '',
    ].join('\n')
  }
  if (result.status === 'invalid-token') {
    return [
      'status: invalid-token',
      `categoryId: ${EBAY_ES_CATEGORY_ID_TO_CHECK}`,
      'No se ha llamado a get_item_condition_policies.',
      'completePolicy: false',
      'admittedConditionIdsUnchanged: true',
      '',
    ].join('\n')
  }
  const httpStatus = result.status === 'ok' ? result.report.httpStatus : result.httpStatus
  const errorIds = result.status === 'ok' ? result.report.errorIds : result.errorIds
  const warningIds = result.status === 'ok' ? result.report.warningIds : result.warningIds
  const lines = [
    `status: ${result.status}`,
    `httpStatus: ${httpStatus === null ? 'absent' : String(httpStatus)}`,
    `categoryId: ${result.status === 'ok' ? result.report.categoryId : result.categoryId}`,
    `errorIds: ${errorIds.join(' ')}`.trimEnd(),
    `warningIds: ${warningIds.join(' ')}`.trimEnd(),
  ]
  if (result.status === 'ok') {
    const report = result.report
    lines.push(`itemConditionRequired: ${String(report.itemConditionRequired)}`)
    for (const condition of report.conditions) {
      lines.push(`conditionId: ${condition.conditionId}`)
      lines.push(`conditionDescription: ${condition.conditionDescription}`)
    }
    lines.push(`conditionsOmitted: ${String(report.conditionsOmitted)}`)
    lines.push(`otherCategoryIds: ${report.otherCategoryIds.join(' ')}`.trimEnd())
    lines.push(`otherCategoryIdsTruncated: ${String(report.otherCategoryIdsTruncated)}`)
    lines.push(`duplicateCategoryPolicy: ${String(report.duplicateCategoryPolicy)}`)
  } else if (result.status === 'category-not-in-response') {
    lines.push(`otherCategoryIds: ${result.otherCategoryIds.join(' ')}`.trimEnd())
    lines.push(`otherCategoryIdsTruncated: ${String(result.otherCategoryIdsTruncated)}`)
  }
  for (const note of metadataErrorNotes(errorIds.concat(warningIds))) {
    lines.push(`errorNote: ${note}`)
  }
  lines.push('completePolicy: false')
  lines.push('admittedConditionIdsUnchanged: true')
  lines.push('El token recibido no se trata como prueba de una lista completa.')
  lines.push('')
  return lines.join('\n')
}

/**
 * Sin confirmación, sin `fetchImpl` o sin token no hay petición.
 * Un token vacío es `not-run`. Un token que no cumple el patrón es
 * `invalid-token` y tampoco sale de la máquina.
 */
export async function collectItemConditionPolicies(input?: {
  confirm?: 'run-outside-ci'
  accessToken?: string
  fetchImpl?: EbayFetch
}): Promise<EbayConditionPolicyResult> {
  if (input?.confirm !== 'run-outside-ci' || !input.fetchImpl) return { status: 'not-run' }
  if (input.accessToken === undefined || input.accessToken === '') return { status: 'not-run' }
  if (!isEbayApplicationToken(input.accessToken)) return { status: 'invalid-token' }

  const url = conditionPolicyUrl()
  let response: Response
  try {
    response = await input.fetchImpl(url, {
      method: 'GET',
      headers: {
        Accept: 'application/json',
        Authorization: `Bearer ${input.accessToken}`,
      },
      redirect: 'manual',
      cache: 'no-store',
      signal: ebayRequestSignal(EBAY_APPLICATION_REQUEST_TIMEOUT_MS),
    })
  } catch {
    return failure('unavailable', null, [], [])
  }
  if (isRedirect(response.status)) {
    await cancelBody(response)
    return failure('unavailable', response.status, [], [])
  }
  if (response.status === 204) {
    await cancelBody(response)
    return failure('no-content', 204, [], [])
  }
  const declared = Number(response.headers.get('content-length'))
  if (Number.isFinite(declared) && declared > EBAY_BROWSE_RESPONSE_MAX_BYTES) {
    await cancelBody(response)
    return failure('invalid-response', response.status, [], [])
  }
  if (!isEbayJsonContentType(response.headers.get('content-type'))) {
    await cancelBody(response)
    return httpFailure(response.status, [], [])
  }
  const parsed = await readEbayLimitedJson(response, EBAY_BROWSE_RESPONSE_MAX_BYTES)
  if (!parsed.ok) return httpFailure(response.status, [], [])
  const errorIds = errorIdsOf(parsed.value, 'errors')
  const warningIds = errorIdsOf(parsed.value, 'warnings')
  if (response.status === 401) return failure('unauthorized', 401, errorIds, warningIds)
  if (response.status === 403) return failure('forbidden', 403, errorIds, warningIds)
  if (response.status === 404) return failure('not-found', 404, errorIds, warningIds)
  if (response.status !== 200) return failure('unavailable', response.status, errorIds, warningIds)
  return readPolicies(parsed.value, errorIds, warningIds)
}

export function conditionPolicyUrl(): string {
  const url = new URL(EBAY_METADATA_CONDITION_POLICIES_URL)
  url.searchParams.set('filter', EBAY_METADATA_CONDITION_FILTER)
  return url.toString()
}

function readPolicies(value: unknown, errorIds: number[], warningIds: number[]): EbayConditionPolicyResult {
  if (!isRecord(value) || !Array.isArray(value.itemConditionPolicies)) {
    return failure('invalid-response', 200, errorIds, warningIds)
  }
  const otherCategoryIds: string[] = []
  let otherCategoryIdsTruncated = false
  let match: Record<string, unknown> | null = null
  let duplicateCategoryPolicy = false
  for (const entry of value.itemConditionPolicies) {
    if (!isRecord(entry) || typeof entry.categoryId !== 'string' || !/^[0-9]{1,12}$/.test(entry.categoryId)) continue
    if (entry.categoryId === EBAY_ES_CATEGORY_ID_TO_CHECK) {
      if (match) duplicateCategoryPolicy = true
      else match = entry
      continue
    }
    if (otherCategoryIds.length >= OTHER_CATEGORY_LIMIT) {
      otherCategoryIdsTruncated = true
      continue
    }
    otherCategoryIds.push(entry.categoryId)
  }
  if (!match) {
    return {
      status: 'category-not-in-response',
      categoryId: EBAY_ES_CATEGORY_ID_TO_CHECK,
      httpStatus: 200,
      errorIds,
      warningIds,
      completePolicy: false,
      admittedConditionIdsUnchanged: true,
      otherCategoryIds,
      otherCategoryIdsTruncated,
    }
  }
  const conditions: EbayConditionPolicyEntry[] = []
  let conditionsOmitted = 0
  const seen = new Set<string>()
  if (Array.isArray(match.itemConditions)) {
    for (const item of match.itemConditions) {
      if (!isRecord(item)) {
        conditionsOmitted += 1
        continue
      }
      const conditionId = item.conditionId
      const conditionDescription = item.conditionDescription
      if (typeof conditionId !== 'string' || !CONDITION_ID_PATTERN.test(conditionId) || !usableDescription(conditionDescription)) {
        conditionsOmitted += 1
        continue
      }
      if (seen.has(conditionId)) continue
      seen.add(conditionId)
      conditions.push({ conditionId, conditionDescription })
    }
  }
  return {
    status: 'ok',
    report: {
      categoryId: EBAY_ES_CATEGORY_ID_TO_CHECK,
      httpStatus: 200,
      itemConditionRequired: typeof match.itemConditionRequired === 'boolean' ? match.itemConditionRequired : 'absent',
      conditions,
      conditionsOmitted,
      otherCategoryIds,
      otherCategoryIdsTruncated,
      duplicateCategoryPolicy,
      errorIds,
      warningIds,
      completePolicy: false,
      admittedConditionIdsUnchanged: true,
    },
  }
}

function usableDescription(value: unknown): value is string {
  return typeof value === 'string'
    && value.length >= 1
    && value.length <= DESCRIPTION_MAX_LENGTH
    && value === value.trim()
    && !/[\u0000-\u001F\u007F]/.test(value)
}

function httpFailure(status: number, errorIds: number[], warningIds: number[]): EbayConditionPolicyResult {
  if (status === 401) return failure('unauthorized', status, errorIds, warningIds)
  if (status === 403) return failure('forbidden', status, errorIds, warningIds)
  if (status === 404) return failure('not-found', status, errorIds, warningIds)
  if (status === 200) return failure('invalid-response', status, errorIds, warningIds)
  return failure('unavailable', status, errorIds, warningIds)
}

function failure(
  status: 'unauthorized' | 'forbidden' | 'no-content' | 'unavailable' | 'invalid-response' | 'not-found',
  httpStatus: number | null,
  errorIds: number[],
  warningIds: number[],
): PolicyFailure & { status: typeof status } {
  return {
    status,
    categoryId: EBAY_ES_CATEGORY_ID_TO_CHECK,
    httpStatus,
    errorIds,
    warningIds,
    completePolicy: false,
    admittedConditionIdsUnchanged: true,
  }
}

function errorIdsOf(value: unknown, key: 'errors' | 'warnings'): number[] {
  if (!isRecord(value) || !Array.isArray(value[key])) return []
  const ids: number[] = []
  for (const entry of value[key]) {
    if (!isRecord(entry) || typeof entry.errorId !== 'number' || !Number.isInteger(entry.errorId)) continue
    if (entry.errorId <= 0 || entry.errorId > 999_999 || ids.includes(entry.errorId)) continue
    ids.push(entry.errorId)
    if (ids.length === 20) break
  }
  return ids
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
