/**
 * Contrato del identificador de marketplace para Segunda Mano.
 * No elige proveedor, no consulta una API y no autoriza a comparar precios por sí solo.
 *
 * Un texto presente no está validado. La comparación sigue en
 * `canComparePrices()` y exige, además de este contrato, el resto de requisitos
 * del mapping. La forma del expediente de identidad sigue en
 * `verificationEvidenceIssues()`; este módulo no la repite ni la importa.
 *
 * `validateMarketplaceIdentifier()` decide el estado a partir de un candidato
 * y de su evidencia. No demuestra de nuevo la identidad del producto: exige
 * que esa identidad ya esté verificada. No elige un proveedor real.
 */

export const SECOND_HAND_MARKETPLACE_ID_REJECTION_REASONS = [
  'empty-value',
  'manufacturer-identifier',
  'product-name',
  'gtin',
  'url',
  'listing-id',
  'distinct-variant',
  'wrong-provider',
  'incompatible-scope',
  'missing-mapping-link',
  'missing-verified-product-link',
  'evidence-mismatch',
  'missing-provenance',
  'missing-validation-method',
  'missing-audit-ref',
  'insufficient-evidence',
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

function isUrlValue(value: string): boolean {
  const candidate = value.trim()
  if (/^[a-z][a-z0-9+.-]*:/i.test(candidate)) {
    try {
      const url = new URL(candidate)
      return url.protocol === 'http:' || url.protocol === 'https:'
    } catch {
      return false
    }
  }
  return /^www\./i.test(candidate)
}

function fold(value: string): string {
  return normalizeName(value).normalize('NFD').replace(/\p{M}/gu, '')
}

const INSUFFICIENT_EVIDENCE_CLAIMS = [
  'lo encontre en google',
  'aparece en la url',
  'coincide con el nombre',
  'parece el sku',
]

function containsInsufficientClaim(value: string): boolean {
  const text = fold(value)
  return INSUFFICIENT_EVIDENCE_CLAIMS.some((claim) => text.includes(claim))
}

function meetsValidatedContract(
  identifier: Extract<SecondHandMarketplaceIdentifier, { status: 'validated' }>,
  context: SecondHandMarketplaceIdContext,
  allowlist: SecondHandMarketplaceIdAllowlist,
): boolean {
  if (!onAllowlist(identifier.provider, allowlist.providers)) return false
  if (!onAllowlist(identifier.scope, allowlist.scopes)) return false
  if (!hasText(identifier.canonicalValue)) return false
  if (isUrlValue(identifier.canonicalValue)) return false
  if (matchesManufacturerIdentifier(identifier.canonicalValue, context.manufacturerIdentifier)) return false
  if (matchesProductName(identifier.canonicalValue, context)) return false
  if (!hasText(identifier.productId) || identifier.productId !== context.productId) return false
  if (!hasText(context.verificationRef) || identifier.verifiedProductRef !== context.verificationRef) return false
  if (!hasText(identifier.provenance)) return false
  if (!hasText(identifier.validationMethod)) return false
  if (!hasText(identifier.auditRef)) return false
  if ([identifier.provenance, identifier.validationMethod, identifier.auditRef].some(containsInsufficientClaim)) return false
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

/**
 * Qué demuestra el registro. Solo `marketplace-product` puede llegar a `validated`.
 * El resto son candidatos que no identifican el producto de catálogo.
 */
export const MARKETPLACE_IDENTIFIER_EVIDENCE_KINDS = [
  'marketplace-product',
  'manufacturer-sku',
  'model-number',
  'gtin',
  'product-name',
  'url',
  'listing',
  'variant',
  'unspecified',
] as const

export type MarketplaceIdentifierEvidenceKind = (typeof MARKETPLACE_IDENTIFIER_EVIDENCE_KINDS)[number]

/** Candidato todavía sin estado. No es un identificador validado. */
export interface MarketplaceIdentifierCandidate {
  provider: string
  scope: string
  canonicalValue: string
  productId: string
}

/**
 * De dónde sale el identificador y qué demuestra.
 * Los cuatro textos de procedencia, método y auditoría tienen que decir eso.
 * Una frase genérica no basta.
 */
export interface MarketplaceIdentifierEvidence {
  provider: string
  scope: string
  canonicalValue: string
  productId: string
  verifiedProductRef: string
  provenance: string
  validationMethod: string
  auditRef: string
  demonstrates: MarketplaceIdentifierEvidenceKind
}

/**
 * Contexto del mapping. `identityVerified` lo aporta quien ya cerró la identidad.
 * Esta función no vuelve a leer el expediente del fabricante.
 */
export interface MarketplaceIdentifierProcedureContext extends SecondHandMarketplaceIdContext {
  identityVerified: boolean
}

/** Problemas de la decisión. Los dos últimos no descartan el candidato: lo dejan sin validar. */
export const MARKETPLACE_IDENTIFIER_VALIDATION_ISSUES = [
  ...SECOND_HAND_MARKETPLACE_ID_REJECTION_REASONS,
  'identity-not-verified',
  'evidence-not-supplied',
] as const

export type MarketplaceIdentifierValidationIssue = (typeof MARKETPLACE_IDENTIFIER_VALIDATION_ISSUES)[number]

export interface MarketplaceIdentifierValidation {
  status: 'absent' | 'unvalidated' | 'validated' | 'rejected'
  issues: readonly MarketplaceIdentifierValidationIssue[]
  evidence: MarketplaceIdentifierEvidence | null
  identifier: SecondHandMarketplaceIdentifier
}

const SOFT_ISSUES = new Set<MarketplaceIdentifierValidationIssue>([
  'identity-not-verified',
  'evidence-not-supplied',
])

function uniqueIssues(
  issues: readonly MarketplaceIdentifierValidationIssue[],
): MarketplaceIdentifierValidationIssue[] {
  const seen = new Set<MarketplaceIdentifierValidationIssue>()
  const result: MarketplaceIdentifierValidationIssue[] = []
  for (const issue of issues) {
    if (seen.has(issue)) continue
    seen.add(issue)
    result.push(issue)
  }
  return result
}

function candidateIssues(
  candidate: MarketplaceIdentifierCandidate,
  context: MarketplaceIdentifierProcedureContext,
  evidence: MarketplaceIdentifierEvidence | null,
  allowlist: SecondHandMarketplaceIdAllowlist,
): MarketplaceIdentifierValidationIssue[] {
  const issues: MarketplaceIdentifierValidationIssue[] = []
  const value = candidate.canonicalValue
  if (!hasText(value)) issues.push('empty-value')
  if (hasText(value) && isUrlValue(value)) issues.push('url')
  if (
    hasText(value) && (
      matchesManufacturerIdentifier(value, context.manufacturerIdentifier)
      || evidence?.demonstrates === 'manufacturer-sku'
      || evidence?.demonstrates === 'model-number'
    )
  ) {
    issues.push('manufacturer-identifier')
  }
  if (hasText(value) && (matchesProductName(value, context) || evidence?.demonstrates === 'product-name')) {
    issues.push('product-name')
  }
  if (evidence?.demonstrates === 'gtin') issues.push('gtin')
  if (evidence?.demonstrates === 'url') issues.push('url')
  if (evidence?.demonstrates === 'listing') issues.push('listing-id')
  if (evidence?.demonstrates === 'variant') issues.push('distinct-variant')

  if (!evidence) {
    issues.push('evidence-not-supplied')
  } else {
    const providerAllowed = onAllowlist(candidate.provider, allowlist.providers)
      && onAllowlist(evidence.provider, allowlist.providers)
      && evidence.provider === candidate.provider
    if (!providerAllowed) issues.push('wrong-provider')

    const scopeAllowed = onAllowlist(candidate.scope, allowlist.scopes)
      && onAllowlist(evidence.scope, allowlist.scopes)
      && evidence.scope === candidate.scope
    if (!scopeAllowed) issues.push('incompatible-scope')

    const sameProduct = hasText(candidate.productId)
      && candidate.productId === context.productId
      && evidence.productId === candidate.productId
      && evidence.productId === context.productId
    if (!sameProduct) issues.push('missing-mapping-link')

    if (!hasText(context.verificationRef) || evidence.verifiedProductRef !== context.verificationRef) {
      issues.push('missing-verified-product-link')
    }
    if (evidence.canonicalValue !== candidate.canonicalValue) issues.push('evidence-mismatch')
    if (!hasText(evidence.provenance)) issues.push('missing-provenance')
    if (!hasText(evidence.validationMethod)) issues.push('missing-validation-method')
    if (!hasText(evidence.auditRef)) issues.push('missing-audit-ref')
    const demonstratedKind = evidence.demonstrates === 'marketplace-product'
      || evidence.demonstrates === 'manufacturer-sku'
      || evidence.demonstrates === 'model-number'
      || evidence.demonstrates === 'gtin'
      || evidence.demonstrates === 'product-name'
      || evidence.demonstrates === 'url'
      || evidence.demonstrates === 'listing'
      || evidence.demonstrates === 'variant'
    if ([evidence.provenance, evidence.validationMethod, evidence.auditRef].some((field) => hasText(field) && containsInsufficientClaim(field))) {
      issues.push('insufficient-evidence')
    }
    if (!demonstratedKind) issues.push('insufficient-evidence')
  }

  if (context.identityVerified !== true) issues.push('identity-not-verified')
  return uniqueIssues(issues)
}

function rejectionReason(
  issues: readonly MarketplaceIdentifierValidationIssue[],
): SecondHandMarketplaceIdRejectionReason {
  for (const issue of issues) {
    if ((SECOND_HAND_MARKETPLACE_ID_REJECTION_REASONS as readonly string[]).includes(issue)) {
      return issue as SecondHandMarketplaceIdRejectionReason
    }
  }
  return 'insufficient-evidence'
}

/**
 * Decide si un candidato pasa a `validated`, se queda en `unvalidated` o queda `rejected`.
 * `null` es ausencia: no es un error.
 *
 * No consulta un proveedor, no lee la red y no reabre la verificación del producto.
 * Con la lista por defecto, vacía, ningún candidato queda validado.
 */
export function validateMarketplaceIdentifier(
  candidate: MarketplaceIdentifierCandidate | null,
  context: MarketplaceIdentifierProcedureContext,
  evidence: MarketplaceIdentifierEvidence | null,
  allowlist: SecondHandMarketplaceIdAllowlist = MARKETPLACE_ID_ALLOWLIST,
): MarketplaceIdentifierValidation {
  if (candidate === null) {
    return {
      status: 'absent',
      issues: [],
      evidence: null,
      identifier: { status: 'absent' },
    }
  }

  const issues = candidateIssues(candidate, context, evidence, allowlist)
  const hardIssues = issues.filter((issue) => !SOFT_ISSUES.has(issue))
  const fields = {
    provider: candidate.provider,
    scope: candidate.scope,
    canonicalValue: candidate.canonicalValue,
    productId: candidate.productId,
  }

  if (hardIssues.length > 0) {
    return {
      status: 'rejected',
      issues,
      evidence,
      identifier: { status: 'rejected', ...fields, rejectionReason: rejectionReason(hardIssues) },
    }
  }

  if (issues.length > 0 || !evidence || context.identityVerified !== true) {
    return {
      status: 'unvalidated',
      issues,
      evidence,
      identifier: { status: 'unvalidated', ...fields },
    }
  }

  const identifier: Extract<SecondHandMarketplaceIdentifier, { status: 'validated' }> = {
    status: 'validated',
    provider: evidence.provider,
    scope: evidence.scope,
    canonicalValue: evidence.canonicalValue,
    productId: evidence.productId,
    verifiedProductRef: evidence.verifiedProductRef,
    provenance: evidence.provenance,
    validationMethod: evidence.validationMethod,
    auditRef: evidence.auditRef,
  }
  if (!meetsValidatedContract(identifier, context, allowlist)) {
    const rejectedIssues = uniqueIssues([...issues, 'insufficient-evidence'])
    return {
      status: 'rejected',
      issues: rejectedIssues,
      evidence,
      identifier: { status: 'rejected', ...fields, rejectionReason: rejectionReason(rejectedIssues) },
    }
  }

  return {
    status: 'validated',
    issues: [],
    evidence,
    identifier,
  }
}
