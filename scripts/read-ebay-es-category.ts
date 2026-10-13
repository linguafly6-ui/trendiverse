/**
 * Lectura local del árbol de EBAY_ES y del nodo 139971.
 *
 * No forma parte de /segunda-mano. No admite condiciones, no valida la
 * variante y no escribe el catálogo. Sell Metadata no se llama: el token
 * de aplicación de Browse no basta para dar la política por completa.
 *
 *   EBAY_CLIENT_ID
 *   EBAY_CERT_ID
 *   npx tsx scripts/read-ebay-es-category.ts
 */

import { pathToFileURL } from 'node:url'
import { readEbayApplicationCredentials, type EbayFetch } from '../lib/ebay-application-auth'
import {
  createCategoryReadingAuth,
  readCategorySubtree,
  readDefaultCategoryTree,
  readItemConditionPolicy,
  EBAY_ES_CATEGORY_UNDER_REVIEW,
  type EbayCategoryLeaf,
} from '../lib/ebay-es-category-reading'
import { EBAY_ES_ADMITTED_CONDITION_IDS } from '../lib/ebay-listing'
import { MARKETPLACE_ID_ALLOWLIST } from '../lib/second-hand-marketplace-id'
import { itemMatchesVariantIdentity, secondHandVariantMapping } from '../lib/second-hand-variant-catalog'
import { whiteOledObservedItemBody } from '../lib/ebay-white-oled-observed-reading'

const WHITE = 'nintendo-switch-oled-blanca'

export async function runEbayEsCategoryRead(input: {
  clientId: string | undefined
  clientSecret: string | undefined
  fetchImpl: EbayFetch
  write(text: string): void
}): Promise<number> {
  const variant = secondHandVariantMapping(WHITE)
  const lines = [
    'Lectura de categoría EBAY_ES',
    `marketplace: EBAY_ES`,
    `categoryIdConsultado: ${EBAY_ES_CATEGORY_UNDER_REVIEW}`,
    'metadata: not-run',
    'motivoMetadata: el token de aplicación no completa get_item_condition_policies. Hace falta un token de usuario con sell.inventory, obtenido fuera de este script.',
  ]
  const identity = variant ? itemMatchesVariantIdentity(variant, whiteOledObservedItemBody()) : false
  lines.push(`identidadHEG001: ${identity ? 'si' : 'no'}`)
  lines.push(`variante: ${variant?.marketplaceIdentifier?.status ?? 'ausente'}`)
  lines.push(`categoryIdDeVariante: ${variant?.identity.categoryId === null ? 'null' : 'distinto-de-null'}`)
  lines.push(`allowlist: ${MARKETPLACE_ID_ALLOWLIST.providers.length}/${MARKETPLACE_ID_ALLOWLIST.scopes.length}`)
  lines.push(`condicionesAdmitidas: ${EBAY_ES_ADMITTED_CONDITION_IDS.length}`)

  const missing = [
    input.clientId ? null : 'EBAY_CLIENT_ID',
    input.clientSecret ? null : 'EBAY_CERT_ID',
  ].filter((name): name is string => name !== null)
  if (missing.length > 0) {
    lines.splice(3, 0, 'taxonomy: not-run', `motivoTaxonomy: faltan ${missing.join(' y ')}. No hay petición.`)
    lines.push('varianteValidada: false')
    input.write(`${lines.join('\n')}\n`)
    return 1
  }

  const credentials = readEbayApplicationCredentials({
    clientId: input.clientId,
    clientSecret: input.clientSecret,
  })
  if (credentials.status !== 'ok') {
    lines.splice(3, 0, 'taxonomy: not-run', 'motivoTaxonomy: EBAY_CLIENT_ID o EBAY_CERT_ID no tiene una forma utilizable. No hay petición.')
    lines.push('varianteValidada: false')
    input.write(`${lines.join('\n')}\n`)
    return 1
  }

  let clientId = credentials.clientId
  let clientSecret = credentials.clientSecret
  try {
    const auth = createCategoryReadingAuth({
      clientId,
      clientSecret,
      fetchImpl: input.fetchImpl,
    })
    const tree = await readDefaultCategoryTree({ auth, fetchImpl: input.fetchImpl })
    lines.splice(
      3,
      0,
      `taxonomyArbol: ${tree.status}`,
      `httpStatusArbol: ${tree.httpStatus ?? 'ninguno'}`,
      `errorIdsArbol: ${tree.errorIds.join(',') || 'ninguno'}`,
      `categoryTreeId: ${tree.categoryTreeId ?? 'ausente'}`,
      `categoryTreeVersion: ${tree.categoryTreeVersion ?? 'ausente'}`,
    )
    const subtree = tree.categoryTreeId
      ? await readCategorySubtree({ auth, fetchImpl: input.fetchImpl, categoryTreeId: tree.categoryTreeId })
      : await readCategorySubtree({ auth, fetchImpl: input.fetchImpl, categoryTreeId: null })
    lines.push(
      `taxonomyNodo: ${subtree.status}`,
      `httpStatusNodo: ${subtree.httpStatus ?? 'ninguno'}`,
      `errorIdsNodo: ${subtree.errorIds.join(',') || 'ninguno'}`,
      `categoryId: ${subtree.categoryId ?? 'ausente'}`,
      `categoryName: ${subtree.categoryName ?? 'ausente'}`,
      `nivel: ${subtree.level ?? 'ausente'}`,
      `hoja: ${formatLeaf(subtree.leaf)}`,
      `padre: ${subtree.parentCategoryId ?? 'ausente'}`,
      `hijos: ${subtree.children === 'absent' ? 'ausente' : String(subtree.children.length)}`,
    )
    if (subtree.children === 'absent') lines.push('hijosDetalle: ausente')
    else {
      for (const child of subtree.children.slice(0, 20)) {
        lines.push(`hijo: ${child.categoryId} ${child.categoryName ?? 'sin-nombre'}`)
      }
      if (subtree.children.length > 20) lines.push(`hijosOmitidos: ${subtree.children.length - 20}`)
    }
    const policy = await readItemConditionPolicy({ fetchImpl: input.fetchImpl, grant: 'user' })
    if (policy.status !== 'not-run') lines.push(`metadataInesperada: ${policy.status}`)
    lines.push('varianteValidada: false')
    lines.push('El catálogo, la allowlist y las condiciones admitidas no cambian.')
    input.write(`${lines.join('\n')}\n`)
    return tree.status === 'ok' && subtree.status === 'ok' ? 0 : 1
  } catch {
    input.write('La lectura de categoría no se completó. No hay árbol ni política.\n')
    input.write('varianteValidada: false\n')
    return 1
  } finally {
    clientId = ''
    clientSecret = ''
  }
}

function formatLeaf(leaf: EbayCategoryLeaf): string {
  if (leaf === true) return 'si'
  if (leaf === false) return 'no'
  if (leaf === 'conflict') return 'conflicto'
  return 'ausente'
}

async function main(): Promise<void> {
  const code = await runEbayEsCategoryRead({
    clientId: process.env.EBAY_CLIENT_ID,
    clientSecret: process.env.EBAY_CERT_ID,
    fetchImpl: (input, init) => fetch(input, init),
    write: (text) => {
      process.stdout.write(text)
    },
  })
  process.exitCode = code
}

if (process.argv[1] !== undefined && import.meta.url === pathToFileURL(process.argv[1]).href) {
  void main()
}
