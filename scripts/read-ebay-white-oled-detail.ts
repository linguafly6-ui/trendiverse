/**
 * Lectura local de candidatos y detalle para la OLED blanca.
 *
 * No forma parte del render de /segunda-mano. No enciende el proveedor,
 * no admite condiciones y no escribe el catálogo.
 *
 * Credenciales, ya presentes en el entorno y sin imprimirlas:
 *   EBAY_CLIENT_ID
 *   EBAY_CERT_ID
 *   npx tsx scripts/read-ebay-white-oled-detail.ts
 */

import { pathToFileURL } from 'node:url'
import { readEbayApplicationCredentials, type EbayFetch } from '../lib/ebay-application-auth'
import { createEbayBrowseClient } from '../lib/ebay-browse-client'
import {
  WHITE_OLED_DETAIL_EPID,
  formatDetailField,
  uncheckedWhiteOledDetail,
  whiteOledDetailFromBody,
  whiteOledDetailIsComplete,
  type EbayWhiteOledDetailFields,
} from '../lib/ebay-white-oled-reading'

interface DetailLine {
  itemId: string
  getItemStatus: string
  fields: EbayWhiteOledDetailFields
  bodyRead: boolean
}

export async function runWhiteOledDetailRead(input: {
  clientId: string | undefined
  clientSecret: string | undefined
  fetchImpl: EbayFetch
  write(text: string): void
}): Promise<number> {
  const missing = [
    input.clientId ? null : 'EBAY_CLIENT_ID',
    input.clientSecret ? null : 'EBAY_CERT_ID',
  ].filter((name): name is string => name !== null)
  if (missing.length > 0) {
    input.write(`Faltan ${missing.join(' y ')}. No hay petición.\n`)
    input.write('varianteValidada: false\n')
    return 1
  }

  const credentials = readEbayApplicationCredentials({
    clientId: input.clientId,
    clientSecret: input.clientSecret,
  })
  if (credentials.status !== 'ok') {
    input.write('EBAY_CLIENT_ID o EBAY_CERT_ID no tiene una forma utilizable. No hay petición.\n')
    input.write('varianteValidada: false\n')
    return 1
  }

  let clientId = credentials.clientId
  let clientSecret = credentials.clientSecret
  try {
    const client = createEbayBrowseClient({
      clientId,
      clientSecret,
      fetchImpl: input.fetchImpl,
    })
    const found = await client.searchByEpid(WHITE_OLED_DETAIL_EPID)
    const lines = [
      'Lectura de detalle de la OLED blanca',
      `ePID solicitado: ${WHITE_OLED_DETAIL_EPID}`,
      'mercado pedido: EBAY_ES',
      `busqueda: ${found.status}`,
    ]
    if ('httpStatus' in found) lines.push(`httpStatus: ${String(found.httpStatus)}`)
    if (found.status !== 'candidates') {
      lines.push('cuerposLeidos: 0')
      lines.push('No hay un cuerpo de getItem. Los campos del anuncio quedan sin comprobar.')
      lines.push('varianteValidada: false')
      input.write(`${lines.join('\n')}\n`)
      return found.status === 'empty' ? 0 : 1
    }

    lines.push(`candidatos: ${found.items.length}`)
    lines.push('La búsqueda no aporta listingMarketplaceId, ePID, GTIN, MPN, modelo, capacidad, color ni categoría.')
    const details: DetailLine[] = []
    for (const candidate of found.items) {
      const detail = await client.getItemBody(candidate.itemId)
      if (detail.status !== 'ok') {
        details.push({
          itemId: candidate.itemId,
          getItemStatus: detail.status,
          fields: uncheckedWhiteOledDetail(candidate.itemId),
          bodyRead: false,
        })
        continue
      }
      const fields = whiteOledDetailFromBody(candidate.itemId, detail.body)
      if (!fields) {
        details.push({
          itemId: candidate.itemId,
          getItemStatus: 'cuerpo-no-objeto',
          fields: uncheckedWhiteOledDetail(candidate.itemId),
          bodyRead: false,
        })
        continue
      }
      details.push({
        itemId: candidate.itemId,
        getItemStatus: 'ok',
        fields,
        bodyRead: true,
      })
    }

    const bodiesRead = details.filter((detail) => detail.bodyRead).length
    lines.push(`cuerposLeidos: ${bodiesRead}`)
    for (const detail of details) {
      lines.push(`itemId: ${detail.itemId}`)
      lines.push(`getItem: ${detail.getItemStatus}`)
      lines.push(`listingMarketplaceId: ${formatDetailField(detail.fields.listingMarketplaceId)}`)
      lines.push(`epid: ${formatDetailField(detail.fields.epid)}`)
      lines.push(`gtin: ${formatDetailField(detail.fields.gtin)}`)
      lines.push(`mpn: ${formatDetailField(detail.fields.mpn)}`)
      lines.push(`modelo: ${formatDetailField(detail.fields.model)}`)
      lines.push(`capacidad: ${formatDetailField(detail.fields.capacity)}`)
      lines.push(`color: ${formatDetailField(detail.fields.color)}`)
      lines.push(`categoryId: ${formatDetailField(detail.fields.categoryId)}`)
      lines.push(`camposCompletos: ${detail.bodyRead && whiteOledDetailIsComplete(detail.fields) ? 'si' : 'no'}`)
    }
    if (bodiesRead === 0) {
      lines.push('Ningún getItem devolvió un cuerpo utilizable.')
    }
    lines.push('varianteValidada: false')
    lines.push('El catálogo y la publicación no cambian.')
    input.write(`${lines.join('\n')}\n`)
    return bodiesRead === 0 ? 1 : 0
  } catch {
    input.write('La lectura no se completó. No hay un cuerpo de getItem.\n')
    input.write('varianteValidada: false\n')
    return 1
  } finally {
    clientId = ''
    clientSecret = ''
  }
}

async function main(): Promise<void> {
  const code = await runWhiteOledDetailRead({
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
