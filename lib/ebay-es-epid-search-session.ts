/**
 * Sesión local de una búsqueda Browse por un solo ePID.
 *
 * No lee el entorno, no toma credenciales de la línea de órdenes y no escribe
 * el informe en disco. Sin la confirmación exacta no pide el secreto ni llama
 * a la red. No llama a getItem y no asocia el catálogo.
 */

import type { EbayFetch } from './ebay-application-auth'
import {
  browseEpidSearchUrl,
  createEbayBrowseClient,
  type EbayBrowseEpidSearchResult,
} from './ebay-browse-client'

export const EBAY_ES_EPID_SEARCH_CONFIRMATION = 'run-epid-search-outside-ci' as const

export interface EbayEsEpidSearchIO {
  ask(prompt: string): Promise<string>
  askSecret(prompt: string): Promise<string>
  write(text: string): void
  fetchImpl?: EbayFetch
}

export type EbayEsEpidSearchSessionResult =
  | { status: 'not-run' }
  | EbayBrowseEpidSearchResult

export function formatEpidSearchReport(
  result: EbayEsEpidSearchSessionResult,
  epid: string,
  url: string | null,
): string {
  const lines = [
    'Informe de búsqueda por ePID',
    'Mercado pedido: EBAY_ES',
    `ePID solicitado: ${result.status === 'invalid-epid' ? 'rechazado' : singleLine(epid)}`,
    `url: ${url ?? 'ausente'}`,
    `status: ${result.status}`,
    'Este informe es un diagnóstico. No es una observación publicable.',
    'No se guarda en disco y no entra en el catálogo.',
  ]
  if (result.status === 'not-run' || result.status === 'invalid-epid') {
    lines.push('No se ha llamado a Browse.')
    return `${lines.join('\n')}\n`
  }
  if (result.status === 'candidates' || result.status === 'empty' || result.status === 'epid-not-accepted') {
    lines.push('httpStatus: 200')
  } else if ('httpStatus' in result) {
    lines.push(`httpStatus: ${String(result.httpStatus)}`)
  }
  if (result.status === 'epid-not-accepted') lines.push('errorId: 12021')
  if (result.status === 'candidates' || result.status === 'empty') {
    lines.push('verifiedProduct: false')
    lines.push(`limit: ${result.limit}`)
    lines.push(`total: ${String(result.total)}`)
  }
  if (result.status === 'candidates') {
    lines.push(`candidateCount: ${result.items.length}`)
    for (const item of result.items) lines.push(`itemId: ${singleLine(item.itemId)}`)
  }
  lines.push('Los candidatos, si aparecen, no verifican un anuncio.')
  lines.push('Esta ejecución no llama a getItem ni modifica el catálogo.')
  return `${lines.join('\n')}\n`
}

export async function runEbayEsEpidSearchSession(
  io: EbayEsEpidSearchIO,
): Promise<EbayEsEpidSearchSessionResult> {
  io.write([
    'Búsqueda voluntaria de EBAY_ES por un solo ePID.',
    'Solo llama a item_summary/search con epid y limit=10.',
    'No llama a getItem y no asocia el catálogo.',
    'Escribe un único ePID, sin URL ni parámetros adicionales.',
    'Las credenciales se piden después, sin eco, y solo viven en memoria durante la llamada.',
    'No uses argumentos, el entorno ni un archivo para esas credenciales.',
    '',
  ].join('\n'))

  const epid = await io.ask('ePID: ')
  const url = browseEpidSearchUrl(epid)
  if (!url) {
    const result: EbayEsEpidSearchSessionResult = { status: 'invalid-epid' }
    io.write('El ePID no puede enviarse como un único identificador. No hay petición.\n')
    io.write(formatEpidSearchReport(result, epid, null))
    return result
  }
  io.write(`url: ${url}\n`)

  const confirmation = await io.ask('Escribe run-epid-search-outside-ci para ejecutar la búsqueda: ')
  if (confirmation !== EBAY_ES_EPID_SEARCH_CONFIRMATION) {
    io.write('Sin la confirmación exacta no hay petición.\n')
    const result: EbayEsEpidSearchSessionResult = { status: 'not-run' }
    io.write(formatEpidSearchReport(result, epid, url))
    return result
  }
  if (!io.fetchImpl) {
    io.write('Sin fetchImpl explícito no hay petición.\n')
    const result: EbayEsEpidSearchSessionResult = { status: 'not-run' }
    io.write(formatEpidSearchReport(result, epid, url))
    return result
  }

  let clientId = await io.askSecret('Client ID, sin eco: ')
  let clientSecret = await io.askSecret('Cert ID, sin eco: ')
  if (!clientId || !clientSecret) {
    clientId = ''
    clientSecret = ''
    const result: EbayEsEpidSearchSessionResult = { status: 'not-run' }
    io.write(formatEpidSearchReport(result, epid, url))
    return result
  }

  let result: EbayBrowseEpidSearchResult
  try {
    const browse = createEbayBrowseClient({
      clientId,
      clientSecret,
      fetchImpl: io.fetchImpl,
    })
    result = await browse.searchByEpid(epid)
  } finally {
    clientId = ''
    clientSecret = ''
  }
  io.write(formatEpidSearchReport(result, epid, url))
  return result
}

function singleLine(value: string): string {
  return value.replace(/[\u0000-\u001F\u007F]/g, ' ')
}
