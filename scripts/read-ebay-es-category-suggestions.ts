/**
 * Una búsqueda de categorías por texto en el árbol ya leído de EBAY_ES.
 *
 * No descarga el árbol completo, no llama a Metadata y no valida ninguna
 * categoría. Cada ejecución admite una sola consulta y exige la frase
 * confirmo-una-sugerencia. Sin esa frase no hay petición.
 *
 *   EBAY_CLIENT_ID
 *   EBAY_CERT_ID
 *   npx tsx scripts/read-ebay-es-category-suggestions.ts confirmo-una-sugerencia "Nintendo Switch"
 */

import { pathToFileURL } from 'node:url'
import { readEbayApplicationCredentials, type EbayFetch } from '../lib/ebay-application-auth'
import {
  categorySuggestionsUrl,
  createCategoryReadingAuth,
  EBAY_ES_REPORTED_CATEGORY_139971,
  EBAY_ES_REPORTED_CATEGORY_TREE_ID,
  EBAY_TAXONOMY_SUGGESTION_CONFIRMATION,
  EBAY_TAXONOMY_SUGGESTION_QUERIES,
  readCategorySuggestions,
} from '../lib/ebay-es-category-reading'
import { EBAY_ES_ADMITTED_CONDITION_IDS } from '../lib/ebay-listing'
import { MARKETPLACE_ID_ALLOWLIST } from '../lib/second-hand-marketplace-id'
import { secondHandVariantMapping } from '../lib/second-hand-variant-catalog'

const WHITE = 'nintendo-switch-oled-blanca'

export async function runEbayEsCategorySuggestions(input: {
  clientId: string | undefined
  clientSecret: string | undefined
  confirmation: string | undefined
  query: string | undefined
  extraArguments: number
  fetchImpl: EbayFetch
  write(text: string): void
}): Promise<number> {
  const variant = secondHandVariantMapping(WHITE)
  const lines = [
    'Sugerencias de categoría EBAY_ES',
    'marketplace: EBAY_ES',
    `categoryTreeIdPedido: ${EBAY_ES_REPORTED_CATEGORY_TREE_ID}`,
    `nodo139971: ${EBAY_ES_REPORTED_CATEGORY_139971.categoryName}`,
    'nodo139971EsNintendoSwitch: no',
    'metadata: not-run',
    `variante: ${variant?.marketplaceIdentifier?.status ?? 'ausente'}`,
    `categoryIdDeVariante: ${variant?.identity.categoryId === null ? 'null' : 'distinto-de-null'}`,
    `allowlist: ${MARKETPLACE_ID_ALLOWLIST.providers.length}/${MARKETPLACE_ID_ALLOWLIST.scopes.length}`,
    `condicionesAdmitidas: ${EBAY_ES_ADMITTED_CONDITION_IDS.length}`,
    `consultasSeparadas: ${EBAY_TAXONOMY_SUGGESTION_QUERIES.join(' | ')}`,
  ]

  if (input.confirmation !== EBAY_TAXONOMY_SUGGESTION_CONFIRMATION || input.extraArguments !== 0) {
    lines.push('taxonomy: not-run')
    lines.push('motivo: falta la confirmación de una sola consulta. No hay petición.')
    lines.push('varianteValidada: false')
    lines.push('categoriaValidada: false')
    input.write(`${lines.join('\n')}\n`)
    return 1
  }

  const url = categorySuggestionsUrl(EBAY_ES_REPORTED_CATEGORY_TREE_ID, input.query ?? '')
  if (!url) {
    lines.push('taxonomy: not-run')
    lines.push('motivo: la consulta no tiene una forma utilizable. No hay petición.')
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
    const auth = createCategoryReadingAuth({ clientId, clientSecret, fetchImpl: input.fetchImpl })
    const read = await readCategorySuggestions({
      auth,
      fetchImpl: input.fetchImpl,
      categoryTreeId: EBAY_ES_REPORTED_CATEGORY_TREE_ID,
      query: input.query ?? '',
      confirmation: input.confirmation,
    })
    lines.push(
      `operacion: ${read.operation}`,
      `taxonomy: ${read.status}`,
      `httpStatus: ${read.httpStatus ?? 'ninguno'}`,
      `errorIds: ${read.errorIds.join(',') || 'ninguno'}`,
      `categoryTreeId: ${read.categoryTreeId ?? 'ausente'}`,
      `categoryTreeVersion: ${read.categoryTreeVersion ?? 'ausente'}`,
      `consulta: ${read.query ?? 'ausente'}`,
      `sugerencias: ${read.suggestions.length}`,
      'categoriaValidada: false',
    )
    for (const suggestion of read.suggestions.slice(0, 20)) {
      const parent = suggestion.ancestors[0]
      lines.push(
        `candidata: ${suggestion.categoryId} ${suggestion.categoryName ?? 'sin-nombre'}`,
        `hoja: ${suggestion.leaf}`,
        `padre: ${parent ? `${parent.categoryId} ${parent.categoryName ?? 'sin-nombre'}` : 'ausente'}`,
        `antecesores: ${suggestion.ancestors.map((ancestor) => ancestor.categoryId).join('>') || 'ausente'}`,
      )
    }
    if (read.suggestions.length > 20) lines.push(`sugerenciasOmitidas: ${read.suggestions.length - 20}`)
    lines.push('varianteValidada: false')
    lines.push('El catálogo, la allowlist y las condiciones admitidas no cambian.')
    input.write(`${lines.join('\n')}\n`)
    return read.status === 'ok' ? 0 : 1
  } catch {
    input.write('La búsqueda de categorías no se completó. No hay sugerencias.\n')
    input.write('categoriaValidada: false\n')
    return 1
  } finally {
    clientId = ''
    clientSecret = ''
  }
}

async function main(): Promise<void> {
  const code = await runEbayEsCategorySuggestions({
    clientId: process.env.EBAY_CLIENT_ID,
    clientSecret: process.env.EBAY_CERT_ID,
    confirmation: process.argv[2],
    query: process.argv[3],
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
