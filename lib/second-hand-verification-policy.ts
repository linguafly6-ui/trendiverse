import { isOfficialCandidateSource } from './second-hand-tech-candidates'
import type {
  SecondHandAttributeKey,
  SecondHandMappingScope,
  SecondHandProductMapping,
} from './second-hand-product-mapping'

/**
 * Expediente que haría falta para pasar un mapping de `pending` a `verified`.
 * No es un producto del catálogo, no busca precios y no enciende el adapter.
 * Los 18 mappings no llevan este expediente: siguen en `pending`.
 */

export const SECOND_HAND_VERIFICATION_ISSUE_CODES = [
  'category-is-not-a-single-product',
  'missing-manufacturer',
  'missing-exact-model',
  'missing-generation',
  'missing-configuration',
  'missing-official-url',
  'disallowed-url',
  'missing-manufacturer-identifier',
  'identifier-without-source',
  'missing-demonstrated-attribute',
  'demonstrated-attribute-without-source',
  'missing-verification-ref',
  'ambiguities-not-reviewed',
  'ambiguous-capacity',
  'ambiguous-disc-or-digital',
  'ambiguous-size',
  'ambiguous-connectivity',
  'ambiguous-region',
  'ambiguous-incompatible-revision',
  'marketplace-id-inferred',
  'marketplace-id-without-source',
] as const

export type SecondHandVerificationIssueCode = (typeof SECOND_HAND_VERIFICATION_ISSUE_CODES)[number]

export const SECOND_HAND_OPEN_AMBIGUITIES = [
  'capacity',
  'disc-vs-digital',
  'size',
  'connectivity',
  'region',
  'incompatible-revision',
] as const

export type SecondHandOpenAmbiguity = (typeof SECOND_HAND_OPEN_AMBIGUITIES)[number]

export const SECOND_HAND_DEMONSTRATED_ATTRIBUTE_KEYS = [
  'manufacturer',
  'exact-model',
  'generation',
  'configuration',
] as const

export type SecondHandDemonstratedAttributeKey = (typeof SECOND_HAND_DEMONSTRATED_ATTRIBUTE_KEYS)[number]

const AMBIGUITY_ISSUES: Record<SecondHandOpenAmbiguity, SecondHandVerificationIssueCode> = {
  capacity: 'ambiguous-capacity',
  'disc-vs-digital': 'ambiguous-disc-or-digital',
  size: 'ambiguous-size',
  connectivity: 'ambiguous-connectivity',
  region: 'ambiguous-region',
  'incompatible-revision': 'ambiguous-incompatible-revision',
}

const AFFILIATE_PARAMS = new Set(['campid', 'customid', 'mkcid', 'mkevt', 'mkrid', 'toolid'])

export interface SecondHandProductIdentity {
  /** Nombre del fabricante, tal como figura en su ficha. */
  manufacturer: string
  /** Un solo modelo, no una familia ni una categoría. */
  exactModel: string
  /** Generación o revisión publicada por el fabricante. */
  generation: string
  /** Una sola configuración: capacidad, edición, tamaño o conectividad ya elegidos. */
  configuration: string
}

export interface SecondHandDemonstratedAttribute {
  key: SecondHandDemonstratedAttributeKey
  /** El mismo texto que la identidad. No se infiere. */
  value: string
  /** URL https de la ficha que muestra ese valor. */
  sourceUrl: string
}

/**
 * Identificador de marketplace. No forma parte de la identidad del producto.
 * `null` significa que nadie lo ha aportado: no se inventa ni se deduce del nombre.
 */
export interface SecondHandMarketplaceIdentifierClaim {
  value: string | null
  /** Fuente distinta de la ficha del fabricante. null si el valor no tiene origen. */
  sourceUrl: string | null
  /** true si el valor salió de una coincidencia de nombre. Eso nunca es válido. */
  inferredFromName: boolean
}

export interface SecondHandVerificationEvidence {
  scope: SecondHandMappingScope
  identity: SecondHandProductIdentity
  /** Ficha https del fabricante. null si no hay fuente oficial. */
  officialUrl: string | null
  /** Código de modelo o SKU publicado por el fabricante. null si la ficha no lo trae. */
  manufacturerIdentifier: string | null
  /** URL de la ficha que publica ese código. null si el código no tiene fuente. */
  manufacturerIdentifierSourceUrl: string | null
  demonstratedAttributes: readonly SecondHandDemonstratedAttribute[]
  /** Persona o registro interno que revisó la ficha. No es un id de marketplace. */
  verificationRef: string | null
  /**
   * true solo si quien revisa dejó constancia de haber mirado las ambigüedades.
   * Una lista vacía sin esa constancia no cierra el modelo.
   */
  ambiguitiesReviewed: boolean
  openAmbiguities: readonly SecondHandOpenAmbiguity[]
  marketplaceId: SecondHandMarketplaceIdentifierClaim | null
}

const hasText = (value: string | null | undefined): value is string =>
  typeof value === 'string' && value.trim().length > 0 && value.trim() === value

function attributeValue(spec: SecondHandProductMapping, key: SecondHandAttributeKey): string {
  const value = spec.attributes.find((attribute) => attribute.key === key)?.value
  return hasText(value) ? value : ''
}

/**
 * Hosts de fabricante. El mismo conjunto que `isOfficialCandidateSource()`.
 * Un marketplace no está en esta lista.
 */
export function isAllowedVerificationSource(url: string | null, allowedHosts?: readonly string[]): boolean {
  if (!hasText(url)) return false
  let parsed: URL
  try {
    parsed = new URL(url)
  } catch {
    return false
  }
  if (parsed.protocol !== 'https:') return false
  for (const param of parsed.searchParams.keys()) {
    if (AFFILIATE_PARAMS.has(param.toLowerCase())) return false
  }
  if (!allowedHosts) return isOfficialCandidateSource(url)
  return allowedHosts.includes(parsed.hostname)
}

function matchesProductName(value: string | null, identity: SecondHandProductIdentity): boolean {
  if (!hasText(value)) return false
  const normalized = value.toLowerCase()
  const manufacturer = identity.manufacturer.trim().toLowerCase()
  const model = identity.exactModel.trim().toLowerCase()
  const fullName = `${manufacturer} ${model}`.trim()
  return normalized === manufacturer || normalized === model || normalized === fullName
}

function hasIndependentMarketplaceSource(
  claim: SecondHandMarketplaceIdentifierClaim,
  officialUrl: string | null,
): boolean {
  if (!hasText(claim.sourceUrl) || claim.sourceUrl === officialUrl) return false
  try {
    return new URL(claim.sourceUrl).protocol === 'https:'
  } catch {
    return false
  }
}

/**
 * Lee únicamente los campos que el mapping ya guarda.
 * No inventa una URL, un SKU ni el cierre de una ambigüedad.
 */
export function verificationEvidenceFromMapping(spec: SecondHandProductMapping): SecondHandVerificationEvidence {
  const manufacturer = attributeValue(spec, 'brand')
  const exactModel = attributeValue(spec, 'model')
  const generation = attributeValue(spec, 'generation')
  const configuration = [attributeValue(spec, 'capacity'), attributeValue(spec, 'edition'), attributeValue(spec, 'configuration')]
    .filter((part) => part.length > 0)
    .join('; ')
  const demonstratedAttributes: SecondHandDemonstratedAttribute[] = []
  if (manufacturer) demonstratedAttributes.push({ key: 'manufacturer', value: manufacturer, sourceUrl: '' })
  if (exactModel) demonstratedAttributes.push({ key: 'exact-model', value: exactModel, sourceUrl: '' })
  if (generation) demonstratedAttributes.push({ key: 'generation', value: generation, sourceUrl: '' })
  if (configuration) demonstratedAttributes.push({ key: 'configuration', value: configuration, sourceUrl: '' })

  return {
    scope: spec.scope,
    identity: { manufacturer, exactModel, generation, configuration },
    officialUrl: null,
    manufacturerIdentifier: null,
    manufacturerIdentifierSourceUrl: null,
    demonstratedAttributes,
    verificationRef: spec.verificationRef,
    ambiguitiesReviewed: false,
    openAmbiguities: [],
    marketplaceId: hasText(spec.externalProductId)
      ? { value: spec.externalProductId, sourceUrl: null, inferredFromName: false }
      : null,
  }
}

/**
 * Juzga si el expediente bastaría para una verificación futura.
 * No modifica el mapping, no consulta la red y no interpreta precios.
 */
export function verificationEvidenceIssues(
  evidence: SecondHandVerificationEvidence,
  allowedHosts?: readonly string[],
): SecondHandVerificationIssueCode[] {
  const found = new Set<SecondHandVerificationIssueCode>()
  const add = (code: SecondHandVerificationIssueCode) => {
    found.add(code)
  }
  const allowed = (url: string | null) => isAllowedVerificationSource(url, allowedHosts)

  if (evidence.scope === 'category') add('category-is-not-a-single-product')
  if (!hasText(evidence.identity.manufacturer)) add('missing-manufacturer')
  if (!hasText(evidence.identity.exactModel)) add('missing-exact-model')
  if (!hasText(evidence.identity.generation)) add('missing-generation')
  if (!hasText(evidence.identity.configuration)) add('missing-configuration')

  if (!hasText(evidence.officialUrl)) add('missing-official-url')
  else if (!allowed(evidence.officialUrl)) add('disallowed-url')

  if (!hasText(evidence.manufacturerIdentifier)) add('missing-manufacturer-identifier')
  else if (!allowed(evidence.manufacturerIdentifierSourceUrl)) {
    add('identifier-without-source')
    if (hasText(evidence.manufacturerIdentifierSourceUrl)) add('disallowed-url')
  }

  const expected: Record<SecondHandDemonstratedAttributeKey, string> = {
    manufacturer: evidence.identity.manufacturer,
    'exact-model': evidence.identity.exactModel,
    generation: evidence.identity.generation,
    configuration: evidence.identity.configuration,
  }
  for (const key of SECOND_HAND_DEMONSTRATED_ATTRIBUTE_KEYS) {
    const matching = evidence.demonstratedAttributes.filter((attribute) =>
      attribute.key === key && hasText(attribute.value) && attribute.value === expected[key],
    )
    if (!hasText(expected[key]) || matching.length === 0) {
      add('missing-demonstrated-attribute')
      continue
    }
    if (!matching.some((attribute) => allowed(attribute.sourceUrl))) {
      add('demonstrated-attribute-without-source')
      if (matching.some((attribute) => hasText(attribute.sourceUrl) && !allowed(attribute.sourceUrl))) add('disallowed-url')
    }
  }

  if (!hasText(evidence.verificationRef)) add('missing-verification-ref')
  if (!evidence.ambiguitiesReviewed) add('ambiguities-not-reviewed')
  for (const ambiguity of evidence.openAmbiguities) add(AMBIGUITY_ISSUES[ambiguity])

  const market = evidence.marketplaceId
  if (market) {
    if (market.inferredFromName || matchesProductName(market.value, evidence.identity)) add('marketplace-id-inferred')
    if (hasText(market.value) && !hasIndependentMarketplaceSource(market, evidence.officialUrl)) {
      add('marketplace-id-without-source')
    }
  }

  return SECOND_HAND_VERIFICATION_ISSUE_CODES.filter((code) => found.has(code))
}

/** true solo cuando el expediente no tiene ningún requisito pendiente. */
export function verificationEvidenceIsSufficient(
  evidence: SecondHandVerificationEvidence,
  allowedHosts?: readonly string[],
): boolean {
  return verificationEvidenceIssues(evidence, allowedHosts).length === 0
}
