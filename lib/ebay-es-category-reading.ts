/**
 * Lectura de Taxonomy y de Sell Metadata para EBAY_ES.
 * No escribe el catálogo, no admite condiciones y no llama a eBay por sí sola.
 *
 * Taxonomy, OpenAPI 3.0.0 v1.1.1:
 *   GET /commerce/taxonomy/v1/get_default_category_tree_id
 *   GET /commerce/taxonomy/v1/category_tree/{category_tree_id}/get_category_subtree
 *   GET /commerce/taxonomy/v1/category_tree/{category_tree_id}/get_category_suggestions?q=
 *   GET /commerce/taxonomy/v1/category_tree/{category_tree_id}/get_item_aspects_for_category?category_id=
 *   Ámbito de árbol, subárbol y sugerencias: https://api.ebay.com/oauth/api_scope.
 *   getItemAspectsForCategory exige además https://api.ebay.com/oauth/api_scope/metadata.insights
 *   y un category_id de hoja. El error 62009 significa que el id no es hoja.
 *   getCategorySuggestions es la búsqueda por texto. No descarga el árbol entero.
 *   Ni una sugerencia ni una lista de aspectos validan una variante o una categoría.
 *
 * Metadata, OpenAPI 3.0.0 v1.12.1:
 *   GET /sell/metadata/v1/marketplace/{marketplace_id}/get_item_condition_policies
 *   El método dice que el token de aplicación no devuelve las condiciones
 *   restringidas 2000, 2010, 2020 y 2030. Esas piden authorization code
 *   y el ámbito sell.inventory. Esta lectura no da por completa una
 *   respuesta hecha con el token de Browse.
 */

import { normalizeEbayCondition } from './ebay-browse-adapter'
import {
  createEbayApplicationAuth,
  ebayRequestSignal,
  EBAY_APPLICATION_OAUTH_SCOPE,
  EBAY_APPLICATION_REQUEST_TIMEOUT_MS,
  isEbayApplicationToken,
  readEbayLimitedJson,
  type EbayApplicationAuth,
  type EbayFetch,
} from './ebay-application-auth'

export const EBAY_TAXONOMY_BASE_URL = 'https://api.ebay.com/commerce/taxonomy/v1'
export const EBAY_METADATA_BASE_URL = 'https://api.ebay.com/sell/metadata/v1'
export const EBAY_ES_CATEGORY_MARKETPLACE_ID = 'EBAY_ES' as const
export const EBAY_ES_CATEGORY_UNDER_REVIEW = '139971'
/** Árbol devuelto por una lectura local de getDefaultCategoryTreeId. No sale de este entorno. */
export const EBAY_ES_REPORTED_CATEGORY_TREE_ID = '186'
export const EBAY_ES_REPORTED_CATEGORY_TREE_VERSION = '96'
/**
 * Nodo leído en local para 139971. El nombre es «Consolas» y la hoja es true.
 * Eso no lo convierte en la categoría de Nintendo Switch.
 */
export const EBAY_ES_REPORTED_CATEGORY_139971 = {
  source: 'reported-local-read',
  operation: 'getCategorySubtree',
  httpStatus: 200,
  marketplaceId: EBAY_ES_CATEGORY_MARKETPLACE_ID,
  categoryTreeId: EBAY_ES_REPORTED_CATEGORY_TREE_ID,
  categoryTreeVersion: EBAY_ES_REPORTED_CATEGORY_TREE_VERSION,
  categoryId: EBAY_ES_CATEGORY_UNDER_REVIEW,
  categoryName: 'Consolas',
  leafCategoryTreeNode: true,
  specificToNintendoSwitch: false,
  aspectsRead: false,
  validatesCategory: false,
} as const
/**
 * Tres getCategorySuggestions locales, HTTP 200, árbol 186 versión 96.
 * La respuesta no trae leafCategoryTreeNode: la hoja queda ausente.
 * El padre solo se guarda cuando esa misma respuesta lo trajo.
 * No valida 139971 ni ninguna otra categoría.
 */
export const EBAY_ES_REPORTED_CATEGORY_SUGGESTIONS = [
  {
    source: 'reported-local-read',
    operation: 'getCategorySuggestions',
    httpStatus: 200,
    marketplaceId: EBAY_ES_CATEGORY_MARKETPLACE_ID,
    categoryTreeId: EBAY_ES_REPORTED_CATEGORY_TREE_ID,
    categoryTreeVersion: EBAY_ES_REPORTED_CATEGORY_TREE_VERSION,
    query: 'Nintendo Switch',
    validatesAnyCategory: false,
    suggestions: [
      suggestionReport('139971', 'Consolas', '1249', 'Consolas y videojuegos'),
      suggestionReport('139973', 'Videojuegos', '1249', 'Consolas y videojuegos'),
      suggestionReport('117042', 'Mandos', '54968', 'Accesorios'),
    ],
  },
  {
    source: 'reported-local-read',
    operation: 'getCategorySuggestions',
    httpStatus: 200,
    marketplaceId: EBAY_ES_CATEGORY_MARKETPLACE_ID,
    categoryTreeId: EBAY_ES_REPORTED_CATEGORY_TREE_ID,
    categoryTreeVersion: EBAY_ES_REPORTED_CATEGORY_TREE_VERSION,
    query: 'Nintendo Switch OLED',
    validatesAnyCategory: false,
    suggestions: [
      suggestionReport('139971', 'Consolas', '1249', 'Consolas y videojuegos'),
      suggestionReport('171833', 'Recambios y herramientas', null, null),
      suggestionReport('69528', 'Dibujos animados', null, null),
      suggestionReport('117042', 'Mandos', null, null),
      suggestionReport('182179', 'Estantes y soportes', null, null),
    ],
  },
  {
    source: 'reported-local-read',
    operation: 'getCategorySuggestions',
    httpStatus: 200,
    marketplaceId: EBAY_ES_CATEGORY_MARKETPLACE_ID,
    categoryTreeId: EBAY_ES_REPORTED_CATEGORY_TREE_ID,
    categoryTreeVersion: EBAY_ES_REPORTED_CATEGORY_TREE_VERSION,
    query: 'consolas portátiles',
    validatesAnyCategory: false,
    unlistedSuggestions: 'not-recorded',
    suggestions: [
      suggestionReport('139971', 'Consolas', '1249', 'Consolas y videojuegos'),
      suggestionReport('139973', 'Videojuegos', '1249', 'Consolas y videojuegos'),
    ],
  },
] as const
/** Hay que repetir esta frase en cada consulta. Una frase no autoriza la siguiente. */
export const EBAY_TAXONOMY_SUGGESTION_CONFIRMATION = 'confirmo-una-sugerencia'
export const EBAY_TAXONOMY_SUBTREE_CONFIRMATION = 'confirmo-subarbol-de-una-categoria'
export const EBAY_TAXONOMY_ASPECTS_CONFIRMATION = 'confirmo-aspectos-de-una-hoja'
export const EBAY_TAXONOMY_SUGGESTION_QUERIES = [
  'Nintendo Switch',
  'Nintendo Switch OLED',
  'consolas portátiles',
] as const
export const EBAY_TAXONOMY_SCOPE = EBAY_APPLICATION_OAUTH_SCOPE
export const EBAY_TAXONOMY_ASPECTS_INSIGHTS_SCOPE = 'https://api.ebay.com/oauth/api_scope/metadata.insights'
/** Los dos ámbitos del requisito de getItemAspectsForCategory. No sustituye al ámbito de Browse. */
export const EBAY_TAXONOMY_ASPECTS_SCOPE = `${EBAY_APPLICATION_OAUTH_SCOPE} ${EBAY_TAXONOMY_ASPECTS_INSIGHTS_SCOPE}`
export const EBAY_METADATA_USER_SCOPE = 'https://api.ebay.com/oauth/api_scope/sell.inventory'
export const EBAY_ES_CATEGORY_RESPONSE_MAX_BYTES = 131_072

const TREE_ID_PATTERN = /^[A-Za-z0-9_-]{1,32}$/
const CATEGORY_ID_PATTERN = /^[0-9]{1,20}$/

export const TAXONOMY_MARKETPLACE_NOT_FOUND = 62003
export const TAXONOMY_CATEGORY_TREE_NOT_FOUND = 62004
export const TAXONOMY_CATEGORY_NOT_IN_TREE = 62005
export const TAXONOMY_CATEGORY_IS_ROOT = 62008
export const TAXONOMY_CATEGORY_NOT_A_LEAF = 62009
export const METADATA_CATEGORY_NOT_IN_MARKETPLACE = 46003

export type EbayCategoryLeaf = true | false | 'absent' | 'conflict'

export interface EbayCategoryChild {
  categoryId: string
  categoryName: string | null
}

export interface EbayCategoryTreeRead {
  marketplaceId: typeof EBAY_ES_CATEGORY_MARKETPLACE_ID
  status: 'ok' | 'empty' | 'unauthorized' | 'forbidden' | 'unavailable' | 'invalid-response' | 'marketplace-not-found'
  httpStatus: number | null
  errorIds: readonly number[]
  categoryTreeId: string | null
  categoryTreeVersion: string | null
}

export interface EbayCategorySubtreeRead {
  marketplaceId: typeof EBAY_ES_CATEGORY_MARKETPLACE_ID
  queriedCategoryId: typeof EBAY_ES_CATEGORY_UNDER_REVIEW
  status:
    | 'ok'
    | 'not-called'
    | 'unauthorized'
    | 'forbidden'
    | 'unavailable'
    | 'invalid-response'
    | 'invalid-tree-id'
    | 'category-not-in-tree'
    | 'category-mismatch'
  httpStatus: number | null
  errorIds: readonly number[]
  categoryTreeId: string | null
  categoryId: string | null
  categoryName: string | null
  level: number | null
  leaf: EbayCategoryLeaf
  parentCategoryId: string | null
  /** `absent` si el cuerpo no trae `childCategoryTreeNodes`. No se infiere de la hoja. */
  children: readonly EbayCategoryChild[] | 'absent'
}

export interface EbayConditionRow {
  conditionId: string
  conditionDescription: string | null
  usage: 'RESTRICTED' | 'absent'
}

export interface EbayConditionPolicyRead {
  marketplaceId: typeof EBAY_ES_CATEGORY_MARKETPLACE_ID
  queriedCategoryId: typeof EBAY_ES_CATEGORY_UNDER_REVIEW
  grant: 'none' | 'application' | 'user'
  status:
    | 'not-run'
    | 'invalid-token'
    | 'unauthorized'
    | 'forbidden'
    | 'unavailable'
    | 'invalid-response'
    | 'empty'
    | 'category-not-in-response'
    | 'category-not-in-marketplace'
    | 'ok'
  completePolicy: boolean
  httpStatus: number | null
  errorIds: readonly number[]
  conditions: readonly EbayConditionRow[]
  otherCategoryIds: readonly string[]
  usedConditionCandidates: readonly number[]
}

export function defaultCategoryTreeUrl(): string {
  const url = new URL(`${EBAY_TAXONOMY_BASE_URL}/get_default_category_tree_id`)
  url.searchParams.set('marketplace_id', EBAY_ES_CATEGORY_MARKETPLACE_ID)
  return url.toString()
}

export function categorySubtreeUrl(categoryTreeId: string): string | null {
  if (!TREE_ID_PATTERN.test(categoryTreeId)) return null
  const url = new URL(`${EBAY_TAXONOMY_BASE_URL}/category_tree/${encodeURIComponent(categoryTreeId)}/get_category_subtree`)
  url.searchParams.set('category_id', EBAY_ES_CATEGORY_UNDER_REVIEW)
  return url.toString()
}

export function categorySubtreeUrlFor(categoryTreeId: string, categoryId: string): string | null {
  if (!TREE_ID_PATTERN.test(categoryTreeId) || !CATEGORY_ID_PATTERN.test(categoryId)) return null
  const url = new URL(`${EBAY_TAXONOMY_BASE_URL}/category_tree/${encodeURIComponent(categoryTreeId)}/get_category_subtree`)
  url.searchParams.set('category_id', categoryId)
  return url.toString()
}

export function itemAspectsForCategoryUrl(categoryTreeId: string, categoryId: string): string | null {
  if (!TREE_ID_PATTERN.test(categoryTreeId) || !CATEGORY_ID_PATTERN.test(categoryId)) return null
  const url = new URL(`${EBAY_TAXONOMY_BASE_URL}/category_tree/${encodeURIComponent(categoryTreeId)}/get_item_aspects_for_category`)
  url.searchParams.set('category_id', categoryId)
  return url.toString()
}

export function categorySuggestionsUrl(categoryTreeId: string, query: string): string | null {
  const q = normalizeSuggestionQuery(query)
  if (!TREE_ID_PATTERN.test(categoryTreeId) || q === null) return null
  const url = new URL(`${EBAY_TAXONOMY_BASE_URL}/category_tree/${encodeURIComponent(categoryTreeId)}/get_category_suggestions`)
  url.searchParams.set('q', q)
  return url.toString()
}

export function itemConditionPoliciesUrl(): string {
  const url = new URL(`${EBAY_METADATA_BASE_URL}/marketplace/${EBAY_ES_CATEGORY_MARKETPLACE_ID}/get_item_condition_policies`)
  url.searchParams.set('filter', `categoryIds:{${EBAY_ES_CATEGORY_UNDER_REVIEW}}`)
  return url.toString()
}

export async function readDefaultCategoryTree(options: {
  auth: EbayApplicationAuth
  fetchImpl: EbayFetch
  timeoutMs?: number
}): Promise<EbayCategoryTreeRead> {
  const call = await authorizedGet(options.auth, options.fetchImpl, defaultCategoryTreeUrl(), options.timeoutMs)
  const base = emptyTree(call.httpStatus, call.errorIds)
  if (call.kind === 'unauthorized') return { ...base, status: 'unauthorized' }
  if (call.kind === 'forbidden') return { ...base, status: 'forbidden' }
  if (call.kind === 'empty') return { ...base, status: 'empty' }
  if (call.kind === 'invalid') return { ...base, status: 'invalid-response' }
  if (call.kind === 'http') {
    if (call.errorIds.includes(TAXONOMY_MARKETPLACE_NOT_FOUND)) return { ...base, status: 'marketplace-not-found' }
    return { ...base, status: 'unavailable' }
  }
  if (call.kind !== 'ok') return { ...base, status: 'unavailable' }
  const record = asRecord(call.body)
  const categoryTreeId = typeof record?.categoryTreeId === 'string' ? record.categoryTreeId : null
  const categoryTreeVersion = typeof record?.categoryTreeVersion === 'string' ? record.categoryTreeVersion : null
  if (!categoryTreeId || !TREE_ID_PATTERN.test(categoryTreeId)) return { ...base, status: 'invalid-response' }
  return { ...base, status: 'ok', categoryTreeId, categoryTreeVersion }
}

export async function readCategorySubtree(options: {
  auth: EbayApplicationAuth
  fetchImpl: EbayFetch
  categoryTreeId: string | null
  timeoutMs?: number
}): Promise<EbayCategorySubtreeRead> {
  const categoryTreeId = options.categoryTreeId
  const url = categoryTreeId === null ? null : categorySubtreeUrl(categoryTreeId)
  if (!url || categoryTreeId === null) return emptySubtree('invalid-tree-id', null, [])
  const call = await authorizedGet(options.auth, options.fetchImpl, url, options.timeoutMs)
  if (call.kind === 'unauthorized') return emptySubtree('unauthorized', call.httpStatus, call.errorIds)
  if (call.kind === 'forbidden') return emptySubtree('forbidden', call.httpStatus, call.errorIds)
  if (call.kind === 'empty' || call.kind === 'invalid') return emptySubtree('invalid-response', call.httpStatus, call.errorIds)
  if (call.kind === 'http') {
    if (call.errorIds.includes(TAXONOMY_CATEGORY_NOT_IN_TREE)) {
      return emptySubtree('category-not-in-tree', call.httpStatus, call.errorIds, categoryTreeId)
    }
    return emptySubtree('unavailable', call.httpStatus, call.errorIds, categoryTreeId)
  }
  if (call.kind !== 'ok') return emptySubtree('unavailable', call.httpStatus, call.errorIds, categoryTreeId)
  return subtreeFromBody(call.body, call.httpStatus, call.errorIds, categoryTreeId)
}

/**
 * No llama a Metadata si no hay token. Un token de aplicación puede
 * devolver condiciones, pero el informe queda incompleto: el OpenAPI
 * avisa de que ese token omite las condiciones restringidas.
 */
export async function readItemConditionPolicy(options: {
  fetchImpl: EbayFetch
  accessToken?: string | null
  grant: 'application' | 'user'
  timeoutMs?: number
}): Promise<EbayConditionPolicyRead> {
  if (!options.accessToken) return emptyPolicy('not-run', 'none', null, [])
  if (!isEbayApplicationToken(options.accessToken)) return emptyPolicy('invalid-token', options.grant, null, [])
  const call = await bearerGet(options.fetchImpl, itemConditionPoliciesUrl(), options.accessToken, options.timeoutMs)
  if (call.kind === 'unauthorized') return emptyPolicy('unauthorized', options.grant, call.httpStatus, call.errorIds)
  if (call.kind === 'forbidden') return emptyPolicy('forbidden', options.grant, call.httpStatus, call.errorIds)
  if (call.kind === 'empty') return emptyPolicy('empty', options.grant, call.httpStatus, call.errorIds)
  if (call.kind === 'invalid') return emptyPolicy('invalid-response', options.grant, call.httpStatus, call.errorIds)
  if (call.kind === 'http') {
    if (call.errorIds.includes(METADATA_CATEGORY_NOT_IN_MARKETPLACE)) {
      return emptyPolicy('category-not-in-marketplace', options.grant, call.httpStatus, call.errorIds)
    }
    return emptyPolicy('unavailable', options.grant, call.httpStatus, call.errorIds)
  }
  if (call.kind !== 'ok') return emptyPolicy('unavailable', options.grant, call.httpStatus, call.errorIds)
  return policyFromBody(call.body, options.grant, call.httpStatus, call.errorIds)
}

export interface EbayCategoryAncestor {
  categoryId: string
  categoryName: string | null
  level: number | null
}

export interface EbayCategorySuggestion {
  categoryId: string
  categoryName: string | null
  level: number | null
  /** El esquema de CategorySuggestion no trae leafCategoryTreeNode. */
  leaf: 'absent'
  ancestors: readonly EbayCategoryAncestor[]
  validatesVariant: false
}

export interface EbayCategorySuggestionRead {
  marketplaceId: typeof EBAY_ES_CATEGORY_MARKETPLACE_ID
  operation: 'getCategorySuggestions'
  status:
    | 'not-run'
    | 'invalid-query'
    | 'invalid-tree-id'
    | 'unauthorized'
    | 'forbidden'
    | 'unavailable'
    | 'invalid-response'
    | 'empty'
    | 'tree-not-found'
    | 'ok'
  httpStatus: number | null
  errorIds: readonly number[]
  categoryTreeId: string | null
  categoryTreeVersion: string | null
  query: string | null
  suggestions: readonly EbayCategorySuggestion[]
  validatesAnyCategory: false
}

/**
 * Una sola búsqueda por texto. Sin la frase de confirmación no hay petición.
 * El nombre devuelto no valida la variante ni sustituye a 139971.
 */
export async function readCategorySuggestions(options: {
  auth: EbayApplicationAuth
  fetchImpl: EbayFetch
  categoryTreeId: string
  query: string
  confirmation: string
  timeoutMs?: number
}): Promise<EbayCategorySuggestionRead> {
  if (options.confirmation !== EBAY_TAXONOMY_SUGGESTION_CONFIRMATION) {
    return emptySuggestions('not-run', null, [])
  }
  const query = normalizeSuggestionQuery(options.query)
  if (query === null) return emptySuggestions('invalid-query', null, [])
  const url = categorySuggestionsUrl(options.categoryTreeId, query)
  if (!url) return emptySuggestions('invalid-tree-id', null, [])
  const call = await authorizedGet(options.auth, options.fetchImpl, url, options.timeoutMs)
  if (call.kind === 'unauthorized') return emptySuggestions('unauthorized', call.httpStatus, call.errorIds, query)
  if (call.kind === 'forbidden') return emptySuggestions('forbidden', call.httpStatus, call.errorIds, query)
  if (call.kind === 'empty') return emptySuggestions('empty', call.httpStatus, call.errorIds, query)
  if (call.kind === 'invalid') return emptySuggestions('invalid-response', call.httpStatus, call.errorIds, query)
  if (call.kind === 'http') {
    if (call.errorIds.includes(62004)) return emptySuggestions('tree-not-found', call.httpStatus, call.errorIds, query)
    return emptySuggestions('unavailable', call.httpStatus, call.errorIds, query)
  }
  if (call.kind !== 'ok') return emptySuggestions('unavailable', call.httpStatus, call.errorIds, query)
  return suggestionsFromBody(call.body, call.httpStatus, call.errorIds, query, options.categoryTreeId)
}

export interface EbayConfirmedSubtreeRead {
  marketplaceId: typeof EBAY_ES_CATEGORY_MARKETPLACE_ID
  operation: 'getCategorySubtree'
  queriedCategoryId: string | null
  status:
    | 'not-run'
    | 'invalid-category'
    | 'invalid-tree-id'
    | 'unauthorized'
    | 'forbidden'
    | 'unavailable'
    | 'invalid-response'
    | 'category-not-in-tree'
    | 'category-mismatch'
    | 'tree-not-found'
    | 'root-category'
    | 'ok'
  httpStatus: number | null
  errorIds: readonly number[]
  categoryTreeId: string | null
  categoryTreeVersion: string | null
  categoryId: string | null
  categoryName: string | null
  /** true, false, absent o conflict. La ausencia del campo no es false. */
  leaf: EbayCategoryLeaf
  parentCategoryId: string | null
  children: readonly EbayCategoryChild[] | 'absent'
  validatesCategory: false
}

/**
 * Un subárbol, con confirmación propia. No sigue el href del padre
 * y no descarga getCategoryTree. No marca la categoría como válida.
 */
export async function readConfirmedCategorySubtree(options: {
  auth: EbayApplicationAuth
  fetchImpl: EbayFetch
  categoryTreeId: string
  categoryId: string
  confirmation: string
  timeoutMs?: number
}): Promise<EbayConfirmedSubtreeRead> {
  if (options.confirmation !== EBAY_TAXONOMY_SUBTREE_CONFIRMATION) {
    return emptyConfirmedSubtree('not-run', null, [])
  }
  if (!CATEGORY_ID_PATTERN.test(options.categoryId)) return emptyConfirmedSubtree('invalid-category', null, [])
  const url = categorySubtreeUrlFor(options.categoryTreeId, options.categoryId)
  if (!url) return emptyConfirmedSubtree('invalid-tree-id', null, [], options.categoryId)
  const call = await authorizedGet(options.auth, options.fetchImpl, url, options.timeoutMs)
  if (call.kind === 'unauthorized') return emptyConfirmedSubtree('unauthorized', call.httpStatus, call.errorIds, options.categoryId)
  if (call.kind === 'forbidden') return emptyConfirmedSubtree('forbidden', call.httpStatus, call.errorIds, options.categoryId)
  if (call.kind === 'empty' || call.kind === 'invalid') {
    return emptyConfirmedSubtree('invalid-response', call.httpStatus, call.errorIds, options.categoryId)
  }
  if (call.kind === 'http') {
    if (call.errorIds.includes(TAXONOMY_CATEGORY_TREE_NOT_FOUND)) {
      return emptyConfirmedSubtree('tree-not-found', call.httpStatus, call.errorIds, options.categoryId)
    }
    if (call.errorIds.includes(TAXONOMY_CATEGORY_NOT_IN_TREE)) {
      return emptyConfirmedSubtree('category-not-in-tree', call.httpStatus, call.errorIds, options.categoryId, options.categoryTreeId)
    }
    if (call.errorIds.includes(TAXONOMY_CATEGORY_IS_ROOT)) {
      return emptyConfirmedSubtree('root-category', call.httpStatus, call.errorIds, options.categoryId, options.categoryTreeId)
    }
    return emptyConfirmedSubtree('unavailable', call.httpStatus, call.errorIds, options.categoryId, options.categoryTreeId)
  }
  if (call.kind !== 'ok') {
    return emptyConfirmedSubtree('unavailable', call.httpStatus, call.errorIds, options.categoryId, options.categoryTreeId)
  }
  return confirmedSubtreeFromBody(call.body, call.httpStatus, call.errorIds, options.categoryTreeId, options.categoryId)
}

export interface EbayCategoryAspect {
  localizedAspectName: string
  aspectRequired: boolean | 'absent'
  aspectUsage: string | 'absent'
  /** Inferencia por el nombre. eBay no declara que el aspecto identifique Nintendo Switch. */
  inferredProductCharacteristic: boolean
}

export interface EbayCategoryAspectRead {
  marketplaceId: typeof EBAY_ES_CATEGORY_MARKETPLACE_ID
  operation: 'getItemAspectsForCategory'
  queriedCategoryId: string | null
  status:
    | 'not-run'
    | 'leaf-not-confirmed'
    | 'invalid-category'
    | 'invalid-tree-id'
    | 'unauthorized'
    | 'forbidden'
    | 'unavailable'
    | 'invalid-response'
    | 'empty'
    | 'category-not-in-tree'
    | 'tree-not-found'
    | 'root-category'
    | 'not-a-leaf'
    | 'ok'
  httpStatus: number | null
  errorIds: readonly number[]
  categoryTreeId: string | null
  /** El esquema AspectMetadata no trae categoryId. No se inventa. */
  categoryIdInBody: 'absent'
  aspects: readonly EbayCategoryAspect[]
  validatesCategory: false
  validatesVariant: false
}

/**
 * Aspectos de una hoja ya confirmada. Si leaf no es true, no hay petición:
 * 62009 sería el error de una categoría que no es hoja, y no se convierte
 * en una categoría válida. La lista de aspectos tampoco valida la categoría.
 */
export async function readCategoryAspects(options: {
  auth: EbayApplicationAuth
  fetchImpl: EbayFetch
  categoryTreeId: string
  categoryId: string
  confirmation: string
  leaf: EbayCategoryLeaf
  timeoutMs?: number
}): Promise<EbayCategoryAspectRead> {
  if (options.confirmation !== EBAY_TAXONOMY_ASPECTS_CONFIRMATION) {
    return emptyAspects('not-run', null, [])
  }
  if (options.leaf !== true) return emptyAspects('leaf-not-confirmed', null, [], options.categoryId)
  if (!CATEGORY_ID_PATTERN.test(options.categoryId)) return emptyAspects('invalid-category', null, [])
  const url = itemAspectsForCategoryUrl(options.categoryTreeId, options.categoryId)
  if (!url) return emptyAspects('invalid-tree-id', null, [], options.categoryId)
  const call = await authorizedGet(options.auth, options.fetchImpl, url, options.timeoutMs)
  if (call.kind === 'unauthorized') return emptyAspects('unauthorized', call.httpStatus, call.errorIds, options.categoryId)
  if (call.kind === 'forbidden') return emptyAspects('forbidden', call.httpStatus, call.errorIds, options.categoryId)
  if (call.kind === 'empty') return emptyAspects('empty', call.httpStatus, call.errorIds, options.categoryId)
  if (call.kind === 'invalid') return emptyAspects('invalid-response', call.httpStatus, call.errorIds, options.categoryId)
  if (call.kind === 'http') {
    if (call.errorIds.includes(TAXONOMY_CATEGORY_NOT_A_LEAF)) {
      return emptyAspects('not-a-leaf', call.httpStatus, call.errorIds, options.categoryId, options.categoryTreeId)
    }
    if (call.errorIds.includes(TAXONOMY_CATEGORY_TREE_NOT_FOUND)) {
      return emptyAspects('tree-not-found', call.httpStatus, call.errorIds, options.categoryId, options.categoryTreeId)
    }
    if (call.errorIds.includes(TAXONOMY_CATEGORY_NOT_IN_TREE)) {
      return emptyAspects('category-not-in-tree', call.httpStatus, call.errorIds, options.categoryId, options.categoryTreeId)
    }
    if (call.errorIds.includes(TAXONOMY_CATEGORY_IS_ROOT)) {
      return emptyAspects('root-category', call.httpStatus, call.errorIds, options.categoryId, options.categoryTreeId)
    }
    return emptyAspects('unavailable', call.httpStatus, call.errorIds, options.categoryId, options.categoryTreeId)
  }
  if (call.kind !== 'ok') {
    return emptyAspects('unavailable', call.httpStatus, call.errorIds, options.categoryId, options.categoryTreeId)
  }
  return aspectsFromBody(call.body, call.httpStatus, call.errorIds, options.categoryTreeId, options.categoryId)
}

/** Solo 139971 tiene una hoja true ya leída. Cualquier otro id sigue sin confirmar. */
export function reportedLeafForAspects(categoryId: string): true | null {
  if (
    categoryId === EBAY_ES_REPORTED_CATEGORY_139971.categoryId
    && EBAY_ES_REPORTED_CATEGORY_139971.leafCategoryTreeNode === true
  ) {
    return true
  }
  return null
}

/** Candidatos de segunda mano. No escribe EBAY_ES_ADMITTED_CONDITION_IDS. */
export function usedConditionCandidates(
  grant: 'application' | 'user',
  conditions: readonly EbayConditionRow[],
): readonly number[] {
  if (grant !== 'user') return []
  const ids: number[] = []
  for (const row of conditions) {
    if (row.usage === 'RESTRICTED') continue
    if (!/^[0-9]{1,6}$/.test(row.conditionId)) continue
    const conditionId = Number(row.conditionId)
    if (normalizeEbayCondition(conditionId, true) === null) continue
    ids.push(conditionId)
  }
  return ids
}

type ApiCall =
  | { kind: 'ok', httpStatus: number, errorIds: readonly number[], body: unknown }
  | { kind: 'empty' | 'invalid' | 'unauthorized' | 'forbidden' | 'http', httpStatus: number | null, errorIds: readonly number[] }

async function authorizedGet(
  auth: EbayApplicationAuth,
  fetchImpl: EbayFetch,
  url: string,
  timeoutMs: number | undefined,
): Promise<ApiCall> {
  const first = await auth.getAccessToken()
  if (first.status === 'unauthorized') return { kind: 'unauthorized', httpStatus: 401, errorIds: [] }
  if (first.status !== 'ok') return { kind: 'http', httpStatus: null, errorIds: [] }
  const firstCall = await bearerGet(fetchImpl, url, first.token, timeoutMs)
  if (firstCall.kind !== 'unauthorized') return firstCall
  const second = await auth.getAccessToken({ force: true })
  if (second.status !== 'ok' || second.token === first.token) return firstCall
  return bearerGet(fetchImpl, url, second.token, timeoutMs)
}

async function bearerGet(
  fetchImpl: EbayFetch,
  url: string,
  token: string,
  timeoutMs: number | undefined,
): Promise<ApiCall> {
  if (!isEbayApplicationToken(token)) return { kind: 'invalid', httpStatus: null, errorIds: [] }
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
      signal: ebayRequestSignal(boundedTimeout(timeoutMs)),
    })
  } catch {
    return { kind: 'http', httpStatus: null, errorIds: [] }
  }
  if (isRedirect(response.status)) {
    await cancelBody(response)
    return { kind: 'http', httpStatus: response.status, errorIds: [] }
  }
  if (response.status === 204) {
    await cancelBody(response)
    return { kind: 'empty', httpStatus: 204, errorIds: [] }
  }
  if (response.status === 401) {
    await cancelBody(response)
    return { kind: 'unauthorized', httpStatus: 401, errorIds: [] }
  }
  const parsed = response.status === 200 || response.status === 400 || response.status === 404 || response.status === 500
    ? await readEbayLimitedJson(response, EBAY_ES_CATEGORY_RESPONSE_MAX_BYTES)
    : null
  if (parsed === null) {
    await cancelBody(response)
    if (response.status === 403) return { kind: 'forbidden', httpStatus: 403, errorIds: [] }
    return { kind: 'http', httpStatus: response.status, errorIds: [] }
  }
  const errorIds = parsed.ok ? errorIdsFrom(parsed.value) : []
  if (response.status === 403) return { kind: 'forbidden', httpStatus: 403, errorIds }
  if (response.status !== 200) return { kind: 'http', httpStatus: response.status, errorIds }
  if (!parsed.ok) return { kind: 'invalid', httpStatus: 200, errorIds }
  return { kind: 'ok', httpStatus: 200, errorIds, body: parsed.value }
}

function subtreeFromBody(
  body: unknown,
  httpStatus: number | null,
  errorIds: readonly number[],
  categoryTreeId: string,
): EbayCategorySubtreeRead {
  const record = asRecord(body)
  const node = asRecord(record?.categorySubtreeNode)
  const category = asRecord(node?.category)
  const categoryId = typeof category?.categoryId === 'string' ? category.categoryId : null
  if (!node || !category || !categoryId || !CATEGORY_ID_PATTERN.test(categoryId)) {
    return emptySubtree('invalid-response', httpStatus, errorIds, categoryTreeId)
  }
  if (categoryId !== EBAY_ES_CATEGORY_UNDER_REVIEW) {
    return {
      ...emptySubtree('category-mismatch', httpStatus, errorIds, categoryTreeId),
      categoryId,
    }
  }
  const children = readChildren(node.childCategoryTreeNodes)
  const leaf = readLeaf(node.leafCategoryTreeNode, childList(children))
  return {
    marketplaceId: EBAY_ES_CATEGORY_MARKETPLACE_ID,
    queriedCategoryId: EBAY_ES_CATEGORY_UNDER_REVIEW,
    status: 'ok',
    httpStatus,
    errorIds,
    categoryTreeId,
    categoryId,
    categoryName: textOrNull(category.categoryName),
    level: typeof node.categoryTreeNodeLevel === 'number' && Number.isInteger(node.categoryTreeNodeLevel)
      ? node.categoryTreeNodeLevel
      : null,
    leaf,
    parentCategoryId: parentIdFromHref(node.parentCategoryTreeNodeHref, categoryId),
    children,
  }
}

function childList(children: readonly EbayCategoryChild[] | 'absent'): readonly EbayCategoryChild[] {
  return children === 'absent' ? [] : children
}

function policyFromBody(
  body: unknown,
  grant: 'application' | 'user',
  httpStatus: number | null,
  errorIds: readonly number[],
): EbayConditionPolicyRead {
  const record = asRecord(body)
  const policies = Array.isArray(record?.itemConditionPolicies) ? record.itemConditionPolicies : null
  if (!policies) return emptyPolicy('invalid-response', grant, httpStatus, errorIds)
  const conditions: EbayConditionRow[] = []
  const otherCategoryIds: string[] = []
  for (const policy of policies) {
    const item = asRecord(policy)
    if (!item) continue
    const categoryId = typeof item.categoryId === 'string' ? item.categoryId : null
    if (!categoryId) continue
    if (categoryId !== EBAY_ES_CATEGORY_UNDER_REVIEW) {
      otherCategoryIds.push(categoryId)
      continue
    }
    if (!Array.isArray(item.itemConditions)) continue
    for (const condition of item.itemConditions) {
      const row = asRecord(condition)
      if (!row) continue
      const conditionId = typeof row.conditionId === 'string' ? row.conditionId.trim() : ''
      if (!/^[0-9]{1,6}$/.test(conditionId)) continue
      conditions.push({
        conditionId,
        conditionDescription: textOrNull(row.conditionDescription),
        usage: row.usage === 'RESTRICTED' ? 'RESTRICTED' : 'absent',
      })
    }
  }
  if (conditions.length === 0) return emptyPolicy('category-not-in-response', grant, httpStatus, errorIds, otherCategoryIds)
  const completePolicy = grant === 'user'
  return {
    marketplaceId: EBAY_ES_CATEGORY_MARKETPLACE_ID,
    queriedCategoryId: EBAY_ES_CATEGORY_UNDER_REVIEW,
    grant,
    status: 'ok',
    completePolicy,
    httpStatus,
    errorIds,
    conditions,
    otherCategoryIds,
    usedConditionCandidates: completePolicy ? usedConditionCandidates(grant, conditions) : [],
  }
}

function readLeaf(value: unknown, children: readonly EbayCategoryChild[]): EbayCategoryLeaf {
  if (value === true && children.length > 0) return 'conflict'
  if (value === true) return true
  if (value === false) return false
  return 'absent'
}

function readChildren(value: unknown): EbayCategoryChild[] | 'absent' {
  if (!Array.isArray(value)) return 'absent'
  const children: EbayCategoryChild[] = []
  for (const item of value) {
    const node = asRecord(item)
    const category = asRecord(node?.category)
    const categoryId = typeof category?.categoryId === 'string' ? category.categoryId : null
    if (!categoryId || !CATEGORY_ID_PATTERN.test(categoryId)) continue
    children.push({ categoryId, categoryName: textOrNull(category?.categoryName) })
  }
  return children
}

function parentIdFromHref(value: unknown, nodeCategoryId: string): string | null {
  if (typeof value !== 'string' || value.trim() === '') return null
  let url: URL
  try {
    url = new URL(value, EBAY_TAXONOMY_BASE_URL)
  } catch {
    return null
  }
  const parentId = url.searchParams.get('category_id')
  if (!parentId || !CATEGORY_ID_PATTERN.test(parentId) || parentId === nodeCategoryId) return null
  return parentId
}

function errorIdsFrom(value: unknown): number[] {
  const record = asRecord(value)
  if (!Array.isArray(record?.errors)) return []
  const ids: number[] = []
  for (const item of record.errors) {
    const error = asRecord(item)
    const errorId = error?.errorId
    if (typeof errorId === 'number' && Number.isInteger(errorId) && errorId > 0) ids.push(errorId)
  }
  return ids
}

function suggestionsFromBody(
  body: unknown,
  httpStatus: number | null,
  errorIds: readonly number[],
  query: string,
  requestedTreeId: string,
): EbayCategorySuggestionRead {
  const record = asRecord(body)
  const rows = Array.isArray(record?.categorySuggestions) ? record.categorySuggestions : null
  if (!rows) return emptySuggestions('invalid-response', httpStatus, errorIds, query)
  const suggestions: EbayCategorySuggestion[] = []
  for (const item of rows) {
    const suggestion = asRecord(item)
    const category = asRecord(suggestion?.category)
    const categoryId = typeof category?.categoryId === 'string' ? category.categoryId : null
    if (!suggestion || !category || !categoryId || !CATEGORY_ID_PATTERN.test(categoryId)) continue
    suggestions.push({
      categoryId,
      categoryName: textOrNull(category.categoryName),
      level: integerOrNull(suggestion.categoryTreeNodeLevel),
      leaf: 'absent',
      ancestors: readAncestors(suggestion.categoryTreeNodeAncestors),
      validatesVariant: false,
    })
  }
  if (suggestions.length === 0) return emptySuggestions('empty', httpStatus, errorIds, query)
  const returnedTreeId = typeof record?.categoryTreeId === 'string' ? record.categoryTreeId : requestedTreeId
  return {
    marketplaceId: EBAY_ES_CATEGORY_MARKETPLACE_ID,
    operation: 'getCategorySuggestions',
    status: 'ok',
    httpStatus,
    errorIds,
    categoryTreeId: TREE_ID_PATTERN.test(returnedTreeId) ? returnedTreeId : requestedTreeId,
    categoryTreeVersion: textOrNull(record?.categoryTreeVersion),
    query,
    suggestions,
    validatesAnyCategory: false,
  }
}

function readAncestors(value: unknown): EbayCategoryAncestor[] {
  if (!Array.isArray(value)) return []
  const ancestors: EbayCategoryAncestor[] = []
  for (const item of value) {
    const ancestor = asRecord(item)
    const categoryId = typeof ancestor?.categoryId === 'string' ? ancestor.categoryId : null
    if (!ancestor || !categoryId || !CATEGORY_ID_PATTERN.test(categoryId)) continue
    ancestors.push({
      categoryId,
      categoryName: textOrNull(ancestor.categoryName),
      level: integerOrNull(ancestor.categoryTreeNodeLevel),
    })
  }
  return ancestors
}

function normalizeSuggestionQuery(value: string): string | null {
  if (typeof value !== 'string') return null
  const query = value.trim()
  if (query.length < 2 || query.length > 80) return null
  if (/[\u0000-\u001F\u007F]/.test(query)) return null
  return query
}

function emptySuggestions(
  status: EbayCategorySuggestionRead['status'],
  httpStatus: number | null,
  errorIds: readonly number[],
  query: string | null = null,
): EbayCategorySuggestionRead {
  return {
    marketplaceId: EBAY_ES_CATEGORY_MARKETPLACE_ID,
    operation: 'getCategorySuggestions',
    status,
    httpStatus,
    errorIds,
    categoryTreeId: null,
    categoryTreeVersion: null,
    query,
    suggestions: [],
    validatesAnyCategory: false,
  }
}

function integerOrNull(value: unknown): number | null {
  return typeof value === 'number' && Number.isInteger(value) ? value : null
}

function emptyTree(httpStatus: number | null, errorIds: readonly number[]): EbayCategoryTreeRead {
  return {
    marketplaceId: EBAY_ES_CATEGORY_MARKETPLACE_ID,
    status: 'unavailable',
    httpStatus,
    errorIds,
    categoryTreeId: null,
    categoryTreeVersion: null,
  }
}

function emptySubtree(
  status: EbayCategorySubtreeRead['status'],
  httpStatus: number | null,
  errorIds: readonly number[],
  categoryTreeId: string | null = null,
): EbayCategorySubtreeRead {
  return {
    marketplaceId: EBAY_ES_CATEGORY_MARKETPLACE_ID,
    queriedCategoryId: EBAY_ES_CATEGORY_UNDER_REVIEW,
    status,
    httpStatus,
    errorIds,
    categoryTreeId,
    categoryId: null,
    categoryName: null,
    level: null,
    leaf: 'absent',
    parentCategoryId: null,
    children: 'absent',
  }
}

function emptyPolicy(
  status: EbayConditionPolicyRead['status'],
  grant: EbayConditionPolicyRead['grant'],
  httpStatus: number | null,
  errorIds: readonly number[],
  otherCategoryIds: readonly string[] = [],
): EbayConditionPolicyRead {
  return {
    marketplaceId: EBAY_ES_CATEGORY_MARKETPLACE_ID,
    queriedCategoryId: EBAY_ES_CATEGORY_UNDER_REVIEW,
    grant,
    status,
    completePolicy: false,
    httpStatus,
    errorIds,
    conditions: [],
    otherCategoryIds,
    usedConditionCandidates: [],
  }
}

function asRecord(value: unknown): Record<string, unknown> | null {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return null
  return value as Record<string, unknown>
}

function textOrNull(value: unknown): string | null {
  if (typeof value !== 'string') return null
  const text = value.trim()
  return text === '' ? null : text
}

function boundedTimeout(value: number | undefined): number {
  if (typeof value !== 'number' || !Number.isFinite(value) || value <= 0) return EBAY_APPLICATION_REQUEST_TIMEOUT_MS
  return Math.min(value, EBAY_APPLICATION_REQUEST_TIMEOUT_MS)
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

function suggestionReport(
  categoryId: string,
  categoryName: string,
  parentCategoryId: string | null,
  parentCategoryName: string | null,
) {
  return {
    categoryId,
    categoryName,
    leaf: 'absent' as const,
    parent: parentCategoryId && parentCategoryName
      ? { categoryId: parentCategoryId, categoryName: parentCategoryName }
      : null,
    validatesCategory: false as const,
  }
}

function confirmedSubtreeFromBody(
  body: unknown,
  httpStatus: number | null,
  errorIds: readonly number[],
  categoryTreeId: string,
  queriedCategoryId: string,
): EbayConfirmedSubtreeRead {
  const record = asRecord(body)
  const node = asRecord(record?.categorySubtreeNode)
  const category = asRecord(node?.category)
  const categoryId = typeof category?.categoryId === 'string' ? category.categoryId : null
  if (!node || !category || !categoryId || !CATEGORY_ID_PATTERN.test(categoryId)) {
    return emptyConfirmedSubtree('invalid-response', httpStatus, errorIds, queriedCategoryId, categoryTreeId)
  }
  if (categoryId !== queriedCategoryId) {
    return {
      ...emptyConfirmedSubtree('category-mismatch', httpStatus, errorIds, queriedCategoryId, categoryTreeId),
      categoryId,
    }
  }
  const children = readChildren(node.childCategoryTreeNodes)
  const returnedTreeId = typeof record?.categoryTreeId === 'string' ? record.categoryTreeId : categoryTreeId
  return {
    marketplaceId: EBAY_ES_CATEGORY_MARKETPLACE_ID,
    operation: 'getCategorySubtree',
    queriedCategoryId,
    status: 'ok',
    httpStatus,
    errorIds,
    categoryTreeId: TREE_ID_PATTERN.test(returnedTreeId) ? returnedTreeId : categoryTreeId,
    categoryTreeVersion: textOrNull(record?.categoryTreeVersion),
    categoryId,
    categoryName: textOrNull(category.categoryName),
    leaf: readLeaf(node.leafCategoryTreeNode, childList(children)),
    parentCategoryId: parentIdFromHref(node.parentCategoryTreeNodeHref, categoryId),
    children,
    validatesCategory: false,
  }
}

function aspectsFromBody(
  body: unknown,
  httpStatus: number | null,
  errorIds: readonly number[],
  categoryTreeId: string,
  queriedCategoryId: string,
): EbayCategoryAspectRead {
  const record = asRecord(body)
  const rows = Array.isArray(record?.aspects) ? record.aspects : null
  if (!rows) return emptyAspects('invalid-response', httpStatus, errorIds, queriedCategoryId, categoryTreeId)
  const aspects: EbayCategoryAspect[] = []
  for (const item of rows) {
    const aspect = asRecord(item)
    const name = textOrNull(aspect?.localizedAspectName)
    if (!aspect || !name) continue
    const constraint = asRecord(aspect.aspectConstraint)
    const required = constraint?.aspectRequired
    const usage = constraint?.aspectUsage
    aspects.push({
      localizedAspectName: name,
      aspectRequired: required === true || required === false ? required : 'absent',
      aspectUsage: typeof usage === 'string' && usage.trim() !== '' ? usage.trim() : 'absent',
      inferredProductCharacteristic: aspectNameIsInferredProductCharacteristic(name),
    })
  }
  if (aspects.length === 0) {
    return emptyAspects(rows.length === 0 ? 'empty' : 'invalid-response', httpStatus, errorIds, queriedCategoryId, categoryTreeId)
  }
  return {
    marketplaceId: EBAY_ES_CATEGORY_MARKETPLACE_ID,
    operation: 'getItemAspectsForCategory',
    queriedCategoryId,
    status: 'ok',
    httpStatus,
    errorIds,
    categoryTreeId,
    categoryIdInBody: 'absent',
    aspects,
    validatesCategory: false,
    validatesVariant: false,
  }
}

const PRODUCT_CHARACTERISTIC_TOKENS = new Set([
  'marca',
  'brand',
  'modelo',
  'model',
  'plataforma',
  'platform',
  'tipo',
  'type',
  'consola',
  'console',
  'color',
  'colour',
  'capacidad',
  'capacity',
])

function aspectNameIsInferredProductCharacteristic(name: string): boolean {
  const folded = name.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase()
  return folded.split(/[^a-z0-9]+/).some((token) => PRODUCT_CHARACTERISTIC_TOKENS.has(token))
}

function emptyConfirmedSubtree(
  status: EbayConfirmedSubtreeRead['status'],
  httpStatus: number | null,
  errorIds: readonly number[],
  queriedCategoryId: string | null = null,
  categoryTreeId: string | null = null,
): EbayConfirmedSubtreeRead {
  return {
    marketplaceId: EBAY_ES_CATEGORY_MARKETPLACE_ID,
    operation: 'getCategorySubtree',
    queriedCategoryId,
    status,
    httpStatus,
    errorIds,
    categoryTreeId,
    categoryTreeVersion: null,
    categoryId: null,
    categoryName: null,
    leaf: 'absent',
    parentCategoryId: null,
    children: 'absent',
    validatesCategory: false,
  }
}

function emptyAspects(
  status: EbayCategoryAspectRead['status'],
  httpStatus: number | null,
  errorIds: readonly number[],
  queriedCategoryId: string | null = null,
  categoryTreeId: string | null = null,
): EbayCategoryAspectRead {
  return {
    marketplaceId: EBAY_ES_CATEGORY_MARKETPLACE_ID,
    operation: 'getItemAspectsForCategory',
    queriedCategoryId,
    status,
    httpStatus,
    errorIds,
    categoryTreeId,
    categoryIdInBody: 'absent',
    aspects: [],
    validatesCategory: false,
    validatesVariant: false,
  }
}

export function createCategoryReadingAuth(options: {
  clientId: string
  clientSecret: string
  fetchImpl: EbayFetch
}): EbayApplicationAuth {
  return createEbayApplicationAuth(options)
}

/** Ámbito doble solo para aspectos. Browse sigue con el ámbito de aplicación. */
export function createCategoryAspectsAuth(options: {
  clientId: string
  clientSecret: string
  fetchImpl: EbayFetch
}): EbayApplicationAuth {
  return createEbayApplicationAuth({ ...options, scope: EBAY_TAXONOMY_ASPECTS_SCOPE })
}
