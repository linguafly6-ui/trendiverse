/**
 * Lectura de un subárbol o de los aspectos de una hoja en el árbol 186.
 *
 * No llama a Metadata, no descarga el árbol completo y no valida ninguna
 * categoría. Cada ejecución admite una sola operación y exige su frase.
 * Sin esa frase no hay petición.
 *
 * Los aspectos de 139973 no se piden: su hoja no está confirmada.
 * getItemAspectsForCategory devolvería 62009 si el id no es hoja.
 *
 *   EBAY_CLIENT_ID
 *   EBAY_CERT_ID
 *   npx tsx scripts/read-ebay-es-category-aspects.ts confirmo-subarbol-de-una-categoria 139973
 *   npx tsx scripts/read-ebay-es-category-aspects.ts confirmo-aspectos-de-una-hoja 139971
 */

import { pathToFileURL } from 'node:url'
import { readEbayApplicationCredentials, type EbayFetch } from '../lib/ebay-application-auth'
import {
  categorySubtreeUrlFor,
  createCategoryAspectsAuth,
  createCategoryReadingAuth,
  EBAY_ES_REPORTED_CATEGORY_139971,
  EBAY_ES_REPORTED_CATEGORY_SUGGESTIONS,
  EBAY_ES_REPORTED_CATEGORY_TREE_ID,
  EBAY_TAXONOMY_ASPECTS_CONFIRMATION,
  EBAY_TAXONOMY_SUBTREE_CONFIRMATION,
  itemAspectsForCategoryUrl,
  readCategoryAspects,
  readConfirmedCategorySubtree,
  reportedLeafForAspects,
} from '../lib/ebay-es-category-reading'
import { EBAY_ES_ADMITTED_CONDITION_IDS } from '../lib/ebay-listing'
import { MARKETPLACE_ID_ALLOWLIST } from '../lib/second-hand-marketplace-id'
import { secondHandVariantMapping } from '../lib/second-hand-variant-catalog'

const WHITE = 'nintendo-switch-oled-blanca'

export async function runEbayEsCategoryAspects(input: {
  clientId: string | undefined
  clientSecret: string | undefined
  confirmation: string | undefined
  categoryId: string | undefined
  extraArguments: number
  fetchImpl: EbayFetch
  write(text: string): void
}): Promise<number> {
  const variant = secondHandVariantMapping(WHITE)
  const lines = [
    'Aspectos y subárbol de categorías EBAY_ES',
    'marketplace: EBAY_ES',
    `categoryTreeIdPedido: ${EBAY_ES_REPORTED_CATEGORY_TREE_ID}`,
    `nodo139971: ${EBAY_ES_REPORTED_CATEGORY_139971.categoryName}`,
    `nodo139971Hoja: ${EBAY_ES_REPORTED_CATEGORY_139971.leafCategoryTreeNode}`,
    'nodo139971EsNintendoSwitch: no',
    'nodo139971AspectosLeidos: no',
    'metadata: not-run',
    `variante: ${variant?.marketplaceIdentifier?.status ?? 'ausente'}`,
    `categoryIdDeVariante: ${variant?.identity.categoryId === null ? 'null' : 'distinto-de-null'}`,
    `allowlist: ${MARKETPLACE_ID_ALLOWLIST.providers.length}/${MARKETPLACE_ID_ALLOWLIST.scopes.length}`,
    `condicionesAdmitidas: ${EBAY_ES_ADMITTED_CONDITION_IDS.length}`,
    'sugerenciasRegistradas:',
  ]
  for (const query of EBAY_ES_REPORTED_CATEGORY_SUGGESTIONS) {
    lines.push(`consultaRegistrada: ${query.query} http ${query.httpStatus}`)
    for (const suggestion of query.suggestions) {
      const parent = suggestion.parent
      lines.push(
        `candidataRegistrada: ${suggestion.categoryId} ${suggestion.categoryName}`,
        `hojaEnSugerencia: ${suggestion.leaf}`,
        `padreRegistrado: ${parent ? `${parent.categoryId} ${parent.categoryName}` : 'ausente'}`,
      )
    }
    if ('unlistedSuggestions' in query) lines.push(`otrasSugerencias: ${query.unlistedSuggestions}`)
  }

  const categoryId = input.categoryId ?? ''
  const subtree = input.confirmation === EBAY_TAXONOMY_SUBTREE_CONFIRMATION
  const aspects = input.confirmation === EBAY_TAXONOMY_ASPECTS_CONFIRMATION
  if (!subtree && !aspects) {
    lines.push('taxonomy: not-run')
    lines.push('motivo: falta la confirmación de una sola categoría. No hay petición.')
    lines.push('varianteValidada: false')
    lines.push('categoriaValidada: false')
    input.write(`${lines.join('\n')}\n`)
    return 1
  }
  if (input.extraArguments !== 0 || !/^[0-9]{1,20}$/.test(categoryId)) {
    lines.push('taxonomy: not-run')
    lines.push('motivo: hace falta un solo categoryId. No hay petición.')
    lines.push('varianteValidada: false')
    lines.push('categoriaValidada: false')
    input.write(`${lines.join('\n')}\n`)
    return 1
  }

  if (aspects && reportedLeafForAspects(categoryId) !== true) {
    lines.push('taxonomy: not-run')
    lines.push('operacion: getItemAspectsForCategory')
    lines.push(`categoryId: ${categoryId}`)
    lines.push('motivo: la hoja no está confirmada. getItemAspectsForCategory exige una hoja y 62009 no valida la categoría. No hay petición.')
    lines.push('varianteValidada: false')
    lines.push('categoriaValidada: false')
    input.write(`${lines.join('\n')}\n`)
    return 1
  }

  const url = subtree
    ? categorySubtreeUrlFor(EBAY_ES_REPORTED_CATEGORY_TREE_ID, categoryId)
    : itemAspectsForCategoryUrl(EBAY_ES_REPORTED_CATEGORY_TREE_ID, categoryId)
  if (!url) {
    lines.push('taxonomy: not-run')
    lines.push('motivo: el id de categoría o de árbol no tiene una forma utilizable. No hay petición.')
    lines.push('varianteValidada: false')
    lines.push('categoriaValidada: false')
    input.write(`${lines.join('\n')}\n`)
    return 1
  }

  const missing = [
    input.clientId ? null : 'EBAY_CLIENT_ID',
    input.clientSecret ? null : 'EBAY_CERT_ID',
  ].filter((name): name is string => name !== null)
  if (missing.length > 0) {
    lines.push('taxonomy: not-run')
    lines.push(`motivo: faltan ${missing.join(' y ')}. No hay petición.`)
    lines.push('varianteValidada: false')
    lines.push('categoriaValidada: false')
    input.write(`${lines.join('\n')}\n`)
    return 1
  }

  const credentials = readEbayApplicationCredentials({
    clientId: input.clientId,
    clientSecret: input.clientSecret,
  })
  if (credentials.status !== 'ok') {
    lines.push('taxonomy: not-run')
    lines.push('motivo: EBAY_CLIENT_ID o EBAY_CERT_ID no tiene una forma utilizable. No hay petición.')
    lines.push('varianteValidada: false')
    lines.push('categoriaValidada: false')
    input.write(`${lines.join('\n')}\n`)
    return 1
  }

  let clientId = credentials.clientId
  let clientSecret = credentials.clientSecret
  try {
    const auth = aspects
      ? createCategoryAspectsAuth({ clientId, clientSecret, fetchImpl: input.fetchImpl })
      : createCategoryReadingAuth({ clientId, clientSecret, fetchImpl: input.fetchImpl })
    if (subtree) {
      const read = await readConfirmedCategorySubtree({
        auth,
        fetchImpl: input.fetchImpl,
        categoryTreeId: EBAY_ES_REPORTED_CATEGORY_TREE_ID,
        categoryId,
        confirmation: input.confirmation ?? '',
      })
      lines.push(
        `operacion: ${read.operation}`,
        `taxonomy: ${read.status}`,
        `httpStatus: ${read.httpStatus ?? 'ninguno'}`,
        `errorIds: ${read.errorIds.join(',') || 'ninguno'}`,
        `categoryTreeId: ${read.categoryTreeId ?? 'ausente'}`,
        `categoryTreeVersion: ${read.categoryTreeVersion ?? 'ausente'}`,
        `categoryId: ${read.categoryId ?? categoryId}`,
        `categoryName: ${read.categoryName ?? 'ausente'}`,
        `hoja: ${read.leaf}`,
        `padre: ${read.parentCategoryId ?? 'ausente'}`,
        `hijos: ${read.children === 'absent' ? 'ausente' : read.children.length}`,
        'categoriaValidada: false',
        'varianteValidada: false',
      )
      lines.push('El catálogo, la allowlist y las condiciones admitidas no cambian.')
      input.write(`${lines.join('\n')}\n`)
      return read.status === 'ok' ? 0 : 1
    }

    const read = await readCategoryAspects({
      auth,
      fetchImpl: input.fetchImpl,
      categoryTreeId: EBAY_ES_REPORTED_CATEGORY_TREE_ID,
      categoryId,
      confirmation: input.confirmation ?? '',
      leaf: true,
    })
    lines.push(
      `operacion: ${read.operation}`,
      `taxonomy: ${read.status}`,
      `httpStatus: ${read.httpStatus ?? 'ninguno'}`,
      `errorIds: ${read.errorIds.join(',') || 'ninguno'}`,
      `categoryTreeId: ${read.categoryTreeId ?? 'ausente'}`,
      `categoryIdPedido: ${read.queriedCategoryId ?? categoryId}`,
      'categoryIdEnCuerpo: ausente',
      `aspectos: ${read.aspects.length}`,
      'categoriaValidada: false',
      'varianteValidada: false',
    )
    const inferred = read.aspects.filter((aspect) => aspect.inferredProductCharacteristic)
    lines.push(
      `aspectosDeProductoInferidos: ${inferred.map((aspect) => aspect.localizedAspectName).join(', ') || 'ninguno'}`,
      'inferenciaDeCodigo: el nombre de un aspecto no demuestra que la categoría sea Nintendo Switch OLED.',
    )
    for (const aspect of read.aspects.slice(0, 80)) {
      lines.push(
        `aspecto: ${aspect.localizedAspectName}`,
        `obligatorio: ${aspect.aspectRequired}`,
        `uso: ${aspect.aspectUsage}`,
      )
    }
    if (read.aspects.length > 80) lines.push(`aspectosOmitidos: ${read.aspects.length - 80}`)
    lines.push('El catálogo, la allowlist y las condiciones admitidas no cambian.')
    input.write(`${lines.join('\n')}\n`)
    return read.status === 'ok' ? 0 : 1
  } catch {
    input.write('La lectura de la categoría no se completó. No hay aspectos.\n')
    input.write('categoriaValidada: false\n')
    return 1
  } finally {
    clientId = ''
    clientSecret = ''
  }
}

async function main(): Promise<void> {
  const code = await runEbayEsCategoryAspects({
    clientId: process.env.EBAY_CLIENT_ID,
    clientSecret: process.env.EBAY_CERT_ID,
    confirmation: process.argv[2],
    categoryId: process.argv[3],
    extraArguments: Math.max(0, process.argv.length - 4),
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
