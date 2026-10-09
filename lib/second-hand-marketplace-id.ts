/**
 * Contrato del identificador de marketplace para Segunda Mano.
 * No elige proveedor, no consulta una API y no autoriza a comparar precios por sí solo.
 *
 * Un texto presente no está validado. La comparación sigue en
 * `canComparePrices()` y exige, además de este contrato, el resto de requisitos
 * del mapping. La forma del expediente de identidad sigue en
 * `verificationEvidenceIssues()`; este módulo no la repite ni la importa.
 */

export const SECOND_HAND_MARKETPLACE_ID_REJECTION_REASONS = [
  'empty-value',
  'manufacturer-identifier',
  'product-name',
  'wrong-provider',
  'incompatible-scope',
  'missing-mapping-link',
  'missing-verified-product-link',
  'missing-provenance',
  'missing-validation-method',
  'missing-audit-ref',
] as const

export type SecondHandMarketplaceIdRejectionReason =
  (typeof SECOND_HAND_MARKETPLACE_ID_REJECTION_REASONS)[number]

interface SecondHandMarketplaceIdFields {
  provider: string
  scope: string
  canonicalValue: string
  productId: string
}

/**
 * Ausente, aportado sin validar, validado según este contrato o rechazado.
 * `null` en el mapping equivale a ausencia y no es un identificador validado.
 */
export type SecondHandMarketplaceIdentifier =
  | { status: 'absent' }
  | (SecondHandMarketplaceIdFields & { status: 'unvalidated' })
  | (SecondHandMarketplaceIdFields & {
      status: 'validated'
      /** La misma referencia que `verificationRef` del mapping verificado. */
      verifiedProductRef: string
      /** De dónde salió el identificador. No es el código del fabricante. */
      provenance: string
      /** Cómo se comprobó. No implica un formato de ningún proveedor. */
      validationMethod: string
      /** Registro que permite revisar la validación. */
      auditRef: string
    })
  | (SecondHandMarketplaceIdFields & {
      status: 'rejected'
      rejectionReason: SecondHandMarketplaceIdRejectionReason
    })

export interface SecondHandMarketplaceIdAllowlist {
  providers: readonly string[]
  scopes: readonly string[]
}

/**
 * Ningún proveedor ni ámbito está autorizado.
 * Un test puede pasar otra lista; eso no modifica el catálogo ni esta constante.
 */
export const MARKETPLACE_ID_ALLOWLIST: SecondHandMarketplaceIdAllowlist = {
  providers: [],
  scopes: [],
}

/** Datos del mapping contra los que se comprueba el vínculo. No son el id. */
export interface SecondHandMarketplaceIdContext {
  productId: string
  verificationRef: string | null
  manufacturerIdentifier: string | null
  manufacturer: string | null
  exactModel: string | null
  identifies: string | null
}

const hasText = (value: string | null | undefined): value is string =>
  typeof value === 'string' && value.trim().length > 0 && value.trim() === value

/**
 * Misma normalización que la política de evidencia: recorta, colapsa espacios
 * y pasa a minúsculas. La igualdad es exacta; no se recorta un nombre para adivinar un id.
 */
function normalizeName(value: string): string {
  return value.trim().replace(/\s+/g, ' ').toLowerCase()
}

function matchesManufacturerIdentifier(value: string, manufacturerIdentifier: string | null): boolean {
  if (!hasText(manufacturerIdentifier)) return false
  const candidate = normalizeName(value)
  const code = normalizeName(manufacturerIdentifier)
  return candidate.length > 0 && candidate === code
}

function matchesProductName(value: string, context: SecondHandMarketplaceIdContext): boolean {
  const candidate = normalizeName(value)
  if (!candidate) return false
  const names = [context.manufacturer, context.exactModel, context.identifies]
  for (const name of names) {
    if (hasText(name) && normalizeName(name) === candidate) return true
  }
  if (hasText(context.manufacturer) && hasText(context.exactModel)) {
    const fullName = normalizeName(`${context.manufacturer} ${context.exactModel}`)
    if (fullName === candidate) return true
  }
  return false
}

function onAllowlist(value: string, allowed: readonly string[]): boolean {
  return hasText(value) && allowed.includes(value)
}

function meetsValidatedContract(
  identifier: Extract<SecondHandMarketplaceIdentifier, { status: 'validated' }>,
  context: SecondHandMarketplaceIdContext,
  allowlist: SecondHandMarketplaceIdAllowlist,
): boolean {
  if (!onAllowlist(identifier.provider, allowlist.providers)) return false
  if (!onAllowlist(identifier.scope, allowlist.scopes)) return false
  if (!hasText(identifier.canonicalValue)) return false
  if (matchesManufacturerIdentifier(identifier.canonicalValue, context.manufacturerIdentifier)) return false
  if (matchesProductName(identifier.canonicalValue, context)) return false
  if (!hasText(identifier.productId) || identifier.productId !== context.productId) return false
  if (!hasText(context.verificationRef) || identifier.verifiedProductRef !== context.verificationRef) return false
  if (!hasText(identifier.provenance)) return false
  if (!hasText(identifier.validationMethod)) return false
  if (!hasText(identifier.auditRef)) return false
  return true
}

/**
 * Una cadena, aunque no esté vacía, no cumple el contrato.
 * El objeto solo cuenta con `status: 'validated'` y todas las propiedades exigidas,
 * y solo si su proveedor y su ámbito están en la lista recibida.
 * La lista por defecto está vacía.
 */
export function hasValidatedMarketplaceId(externalProductId: string | null): boolean
export function hasValidatedMarketplaceId(
  identifier: SecondHandMarketplaceIdentifier | null,
  context: SecondHandMarketplaceIdContext,
  allowlist?: SecondHandMarketplaceIdAllowlist,
): boolean
export function hasValidatedMarketplaceId(
  identifier: string | SecondHandMarketplaceIdentifier | null,
  context?: SecondHandMarketplaceIdContext,
  allowlist: SecondHandMarketplaceIdAllowlist = MARKETPLACE_ID_ALLOWLIST,
): boolean {
  if (typeof identifier !== 'object' || identifier === null) return false
  if (identifier.status !== 'validated' || !context) return false
  return meetsValidatedContract(identifier, context, allowlist)
}
