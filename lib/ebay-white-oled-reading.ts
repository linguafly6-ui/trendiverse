/**
 * Lectura local del detalle de la OLED blanca.
 * No llama a eBay, no lee credenciales y no modifica el catálogo.
 * Un campo ausente es un dato que el cuerpo de getItem no trae.
 * Un campo no comprobado es un dato que no se miró porque no hubo cuerpo.
 */

export const WHITE_OLED_DETAIL_EPID = '21048307585'

export type EbayDetailField =
  | { status: 'present', value: string }
  | { status: 'absent' }
  | { status: 'unchecked' }

export interface EbayWhiteOledDetailFields {
  itemId: string
  listingMarketplaceId: EbayDetailField
  epid: EbayDetailField
  gtin: EbayDetailField
  mpn: EbayDetailField
  model: EbayDetailField
  capacity: EbayDetailField
  color: EbayDetailField
  categoryId: EbayDetailField
}

const ASPECT_NAMES = {
  mpn: ['mpn'],
  model: ['model', 'modelo'],
  capacity: ['capacidad', 'almacenamiento', 'storage', 'capacity', 'capacidad de almacenamiento'],
  color: ['color', 'colour'],
  gtin: ['gtin', 'ean', 'upc'],
} as const

export function uncheckedWhiteOledDetail(itemId: string): EbayWhiteOledDetailFields {
  const unchecked: EbayDetailField = { status: 'unchecked' }
  return {
    itemId,
    listingMarketplaceId: unchecked,
    epid: unchecked,
    gtin: unchecked,
    mpn: unchecked,
    model: unchecked,
    capacity: unchecked,
    color: unchecked,
    categoryId: unchecked,
  }
}

/** Lee solo el cuerpo de getItem. Ignora el título y cualquier texto de la búsqueda. */
export function whiteOledDetailFromBody(itemId: string, body: unknown): EbayWhiteOledDetailFields | null {
  if (!body || typeof body !== 'object' || Array.isArray(body)) return null
  const record = body as Record<string, unknown>
  return {
    itemId,
    listingMarketplaceId: textField(record, 'listingMarketplaceId'),
    epid: textField(record, 'epid'),
    gtin: gtinField(record),
    mpn: aspectField(record, ASPECT_NAMES.mpn),
    model: aspectField(record, ASPECT_NAMES.model),
    capacity: aspectField(record, ASPECT_NAMES.capacity),
    color: aspectField(record, ASPECT_NAMES.color),
    categoryId: textField(record, 'categoryId'),
  }
}

export function whiteOledDetailIsComplete(fields: EbayWhiteOledDetailFields): boolean {
  return [
    fields.listingMarketplaceId,
    fields.epid,
    fields.gtin,
    fields.mpn,
    fields.model,
    fields.capacity,
    fields.color,
    fields.categoryId,
  ].every((field) => field.status === 'present')
}

export function formatDetailField(field: EbayDetailField): string {
  if (field.status === 'present') return field.value
  if (field.status === 'absent') return 'ausente'
  return 'no comprobado'
}

function textField(record: Record<string, unknown>, key: string): EbayDetailField {
  if (!Object.prototype.hasOwnProperty.call(record, key) || record[key] == null) return { status: 'absent' }
  const value = record[key]
  if (typeof value === 'string') {
    if (value.trim() === '') return { status: 'absent' }
    if (value.includes('://')) return { status: 'present', value: 'presente-url-omitida' }
    return { status: 'present', value: singleLine(value.trim()) }
  }
  if (typeof value === 'number' && Number.isFinite(value)) return { status: 'present', value: String(value) }
  return { status: 'present', value: 'tipo-no-texto' }
}

function gtinField(record: Record<string, unknown>): EbayDetailField {
  const direct = textField(record, 'gtin')
  const aspect = aspectField(record, ASPECT_NAMES.gtin)
  if (direct.status === 'present' && aspect.status === 'present' && direct.value !== aspect.value) {
    return { status: 'present', value: `gtin=${direct.value}; aspecto=${aspect.value}` }
  }
  if (direct.status === 'present') return direct
  return aspect
}

function aspectField(record: Record<string, unknown>, names: readonly string[]): EbayDetailField {
  if (!Object.prototype.hasOwnProperty.call(record, 'localizedAspects') || record.localizedAspects == null) {
    return { status: 'absent' }
  }
  if (!Array.isArray(record.localizedAspects)) return { status: 'present', value: 'tipo-no-texto' }
  const values: string[] = []
  for (const aspect of record.localizedAspects) {
    if (!aspect || typeof aspect !== 'object' || Array.isArray(aspect)) continue
    const entry = aspect as Record<string, unknown>
    if (typeof entry.name !== 'string' || typeof entry.value !== 'string') continue
    const name = entry.name.trim().toLowerCase().replace(/\s+/g, ' ')
    if (!names.includes(name) || entry.value.trim() === '') continue
    values.push(singleLine(entry.value.trim()))
  }
  if (values.length === 0) return { status: 'absent' }
  const unique = [...new Set(values)]
  if (unique.length > 1) return { status: 'present', value: unique.join(' | ') }
  return { status: 'present', value: unique[0] }
}

function singleLine(value: string): string {
  return value.replace(/[\u0000-\u001F\u007F]/g, ' ')
}
