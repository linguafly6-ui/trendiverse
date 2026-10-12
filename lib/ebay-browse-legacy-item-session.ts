/**
 * Sesión local de una lectura por legacyItemId.
 *
 * No lee el entorno, no toma credenciales de la línea de órdenes y no escribe
 * el informe en disco. Sin la confirmación exacta no pide el secreto ni llama
 * a la red.
 */

import type { EbayFetch } from './ebay-application-auth'
import { isEbayBrowseLegacyItemId } from './ebay-browse-client'
import {
  collectBrowseItemReading,
  type BrowseBodyField,
  type EbayBrowseItemReading,
  type EbayBrowseItemReadingResult,
} from './ebay-browse-item-reading'

export const BROWSE_LEGACY_ITEM_CONFIRMATION = 'run-outside-ci' as const

const FIELD_LABELS = [
  ['itemId', 'itemId'],
  ['legacyItemId', 'legacyItemId'],
  ['epid', 'epid'],
  ['categoryId', 'categoryId'],
  ['listingMarketplaceId', 'listingMarketplaceId'],
  ['condition', 'condition'],
  ['conditionId', 'conditionId'],
  ['itemWebUrl', 'itemWebUrl'],
  ['priceValue', 'precio'],
  ['currency', 'moneda'],
] as const

export interface BrowseLegacyItemReadingIO {
  ask(prompt: string): Promise<string>
  askSecret(prompt: string): Promise<string>
  write(text: string): void
  fetchImpl?: EbayFetch
}

export function formatBrowseLegacyItemReport(
  result: EbayBrowseItemReadingResult,
  legacyItemIdRequested: string,
): string {
  const lines = [
    'Informe de diagnóstico de Browse',
    'Mercado pedido: EBAY_ES',
    `Estado: ${result.status}`,
    'Este informe es un diagnóstico. No es una observación publicable.',
    'No se guarda en disco y no entra en el catálogo.',
    `legacyItemId solicitado: ${singleLine(legacyItemIdRequested)}`,
  ]
  if (result.status !== 'ok') {
    lines.push('No hay una lectura válida que contrastar.')
    return `${lines.join('\n')}\n`
  }
  lines.push(...readingLines(result.reading))
  lines.push(...contrastLines(result.reading))
  return `${lines.join('\n')}\n`
}

export async function runBrowseLegacyItemReadingSession(
  io: BrowseLegacyItemReadingIO,
): Promise<EbayBrowseItemReadingResult> {
  io.write([
    'Lectura voluntaria de un anuncio de EBAY_ES.',
    'Solo llama a getItemByLegacyId, con la cabecera de ese marketplace.',
    'Escribe el legacyItemId numérico de un anuncio concreto.',
    'Las credenciales se piden después, sin eco, y solo viven en memoria durante la llamada.',
    'No uses argumentos, el entorno ni un archivo para esas credenciales.',
    '',
  ].join('\n'))

  const legacyItemId = await io.ask('legacyItemId: ')
  if (!isEbayBrowseLegacyItemId(legacyItemId)) {
    const result: EbayBrowseItemReadingResult = { status: 'invalid-legacy-item-id' }
    io.write('El identificador no es un decimal de 1 a 20 dígitos sin ceros a la izquierda. No hay petición.\n')
    io.write(formatBrowseLegacyItemReport(result, legacyItemId))
    return result
  }

  const confirmation = await io.ask('Escribe run-outside-ci para ejecutar la lectura: ')
  if (confirmation !== BROWSE_LEGACY_ITEM_CONFIRMATION) {
    io.write('Sin la confirmación exacta no hay petición.\n')
    const result: EbayBrowseItemReadingResult = { status: 'not-run' }
    io.write(formatBrowseLegacyItemReport(result, legacyItemId))
    return result
  }
  if (!io.fetchImpl) {
    io.write('Sin fetchImpl explícito no hay petición.\n')
    const result: EbayBrowseItemReadingResult = { status: 'not-run' }
    io.write(formatBrowseLegacyItemReport(result, legacyItemId))
    return result
  }

  let clientId = await io.askSecret('Client ID, sin eco: ')
  let clientSecret = await io.askSecret('Cert ID, sin eco: ')
  let result: EbayBrowseItemReadingResult
  try {
    result = await collectBrowseItemReading({
      confirm: BROWSE_LEGACY_ITEM_CONFIRMATION,
      legacyItemId,
      clientId,
      clientSecret,
      fetchImpl: io.fetchImpl,
    })
  } finally {
    clientId = ''
    clientSecret = ''
  }
  io.write(formatBrowseLegacyItemReport(result, legacyItemId))
  return result
}

function readingLines(reading: EbayBrowseItemReading): string[] {
  const lines = FIELD_LABELS.map(([key, label]) => fieldLine(label, reading.fields[key]))
  lines.push('itemWebUrlIsSourceUrl: false')
  lines.push(`Campos no copiados: ${reading.discarded.join(', ')}`)
  if (reading.missing.length > 0) lines.push(`Ausentes: ${reading.missing.join(', ')}`)
  return lines
}

function contrastLines(reading: EbayBrowseItemReading): string[] {
  const legacy = reading.fields.legacyItemId
  const legacyMatches = legacy.fromBody === 'present' && legacy.value === reading.legacyItemIdRequested
  return [
    'Contraste de esta respuesta. No afirma que los valores vengan de un anuncio ya guardado.',
    `legacyItemId del cuerpo coincide con el solicitado: ${legacyMatches ? 'sí' : 'no'}`,
    `itemId REST: ${stateLabel(reading.fields.itemId)}`,
    `epid: ${stateLabel(reading.fields.epid)}. No lo asignes a nintendo-switch.`,
    `categoryId: ${stateLabel(reading.fields.categoryId)}`,
    `listingMarketplaceId: ${stateLabel(reading.fields.listingMarketplaceId)}`,
    `condition: ${stateLabel(reading.fields.condition)}. Es el texto de la API, no la etiqueta Nuevo o Usado de la ficha.`,
    `conditionId: ${stateLabel(reading.fields.conditionId)}. No lo deduzcas de esa etiqueta ni lo añadas a la lista admitida.`,
    'itemWebUrlIsSourceUrl permanece en false. La URL del anuncio no es sourceUrl.',
  ]
}

function fieldLine(label: string, field: BrowseBodyField<string>): string {
  if (field.fromBody === 'absent') return `${label}: ausente`
  if (field.fromBody === 'unusable') return `${label}: inutilizable`
  return `${label}: presente: ${singleLine(field.value)}`
}

function stateLabel(field: BrowseBodyField<string>): string {
  if (field.fromBody === 'present') return `presente (${singleLine(field.value)})`
  if (field.fromBody === 'unusable') return 'inutilizable'
  return 'ausente'
}

function singleLine(value: string): string {
  return value.replace(/[\u0000-\u001F\u007F]/g, ' ')
}
