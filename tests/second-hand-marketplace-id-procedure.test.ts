import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { EBAY_BROWSE_SOURCE_ENABLED } from '../lib/ebay-browse-adapter'
import {
  MARKETPLACE_ID_ALLOWLIST,
  hasValidatedMarketplaceId,
  validateMarketplaceIdentifier,
  type MarketplaceIdentifierCandidate,
  type MarketplaceIdentifierEvidence,
  type MarketplaceIdentifierProcedureContext,
} from '../lib/second-hand-marketplace-id'
import {
  SECOND_HAND_PRODUCT_MAPPINGS,
  asExternalMapping,
  canComparePrices,
  type SecondHandProductMapping,
  type SecondHandRecordedVerification,
} from '../lib/second-hand-product-mapping'

const TEST_ALLOWLIST = {
  providers: ['fixture-provider'],
  scopes: ['fixture-scope'],
}

const PROCEDURE_CONTEXT: MarketplaceIdentifierProcedureContext = {
  productId: 'fixture-product',
  verificationRef: 'fixture-verification-ref',
  manufacturerIdentifier: 'HEG-001',
  manufacturer: 'Fabricante de prueba',
  exactModel: 'Modelo de prueba único',
  identifies: 'Nintendo Switch – Modelo OLED',
  identityVerified: true,
}

const validMarketplaceIdentifierFixture: MarketplaceIdentifierCandidate = {
  provider: 'fixture-provider',
  scope: 'fixture-scope',
  canonicalValue: 'fixture-catalog-product-id',
  productId: 'fixture-product',
}

function evidence(overrides: Partial<MarketplaceIdentifierEvidence> = {}): MarketplaceIdentifierEvidence {
  return {
    provider: 'fixture-provider',
    scope: 'fixture-scope',
    canonicalValue: 'fixture-catalog-product-id',
    productId: 'fixture-product',
    verifiedProductRef: 'fixture-verification-ref',
    provenance: 'Registro sintético del catálogo de prueba. No es un proveedor real.',
    validationMethod: 'Comparación del expediente sintético con el candidato.',
    auditRef: 'fixture-audit-procedure-1',
    demonstrates: 'marketplace-product',
    ...overrides,
  }
}

const unvalidatedMarketplaceIdentifierFixture: MarketplaceIdentifierCandidate = {
  ...validMarketplaceIdentifierFixture,
}

const rejectedMarketplaceIdentifierFixture = {
  candidate: validMarketplaceIdentifierFixture,
  evidence: evidence({ provenance: 'Lo encontré en Google.' }),
}

const manufacturerIdentifierFixture = {
  candidate: { ...validMarketplaceIdentifierFixture, canonicalValue: 'HEG-001' },
  evidence: evidence({ canonicalValue: 'HEG-001', demonstrates: 'manufacturer-sku' }),
}

const listingIdentifierFixture = {
  candidate: { ...validMarketplaceIdentifierFixture, canonicalValue: 'fixture-listing-only' },
  evidence: evidence({ canonicalValue: 'fixture-listing-only', demonstrates: 'listing' }),
}

const urlIdentifierFixture = {
  candidate: { ...validMarketplaceIdentifierFixture, canonicalValue: 'https://fixture.invalid/synthetic-listing' },
  evidence: evidence({
    canonicalValue: 'https://fixture.invalid/synthetic-listing',
    demonstrates: 'url',
  }),
}

const wrongProviderFixture = {
  candidate: { ...validMarketplaceIdentifierFixture, provider: 'fixture-other-provider' },
  evidence: evidence({ provider: 'fixture-other-provider' }),
}

const wrongScopeFixture = {
  candidate: { ...validMarketplaceIdentifierFixture, scope: 'fixture-other-scope' },
  evidence: evidence({ scope: 'fixture-other-scope' }),
}

const wrongProductFixture = {
  candidate: { ...validMarketplaceIdentifierFixture, productId: 'fixture-other-product' },
  evidence: evidence({ productId: 'fixture-other-product' }),
}

const wrongVerificationRefFixture = {
  candidate: validMarketplaceIdentifierFixture,
  evidence: evidence({ verifiedProductRef: 'fixture-other-verification-ref' }),
}

function recordedVerification(): SecondHandRecordedVerification {
  const sourceUrl = 'https://fixture.example/specs/modelo-de-prueba'
  return {
    manufacturer: 'Fabricante de prueba',
    exactModel: 'Modelo de prueba único',
    generation: 'Generación de prueba',
    configuration: 'Una sola configuración de prueba',
    officialUrl: sourceUrl,
    manufacturerIdentifier: 'HEG-001',
    manufacturerIdentifierSourceUrl: sourceUrl,
    demonstratedSourceUrls: {
      manufacturer: sourceUrl,
      exactModel: sourceUrl,
      generation: sourceUrl,
      configuration: sourceUrl,
    },
    ambiguitiesReviewed: true,
    openAmbiguities: [],
    ambiguityResolutions: {
      capacity: 'Una sola capacidad de prueba.',
      discVsDigital: 'No hay dos ediciones.',
      size: 'Un solo tamaño.',
      connectivity: 'Una sola conectividad.',
      region: 'Un solo ámbito de prueba.',
      incompatibleRevision: 'Sin otra revisión.',
    },
    modelCodeCitation: {
      sourceUrl,
      productNameAsPublished: 'Modelo de prueba único',
      modelNumberAsPublished: 'HEG-001',
      quotation: 'Cita sintética. No es un documento de un fabricante.',
    },
  }
}

function verifiedMapping(
  identifier: SecondHandProductMapping['marketplaceIdentifier'],
  externalProductId: string | null = 'fixture-external-bypass',
): SecondHandProductMapping {
  return {
    productId: 'fixture-product',
    scope: 'family',
    identifies: 'Nintendo Switch – Modelo OLED',
    attributes: [
      { key: 'brand', label: 'Fabricante', value: 'Fabricante de prueba', requiredForComparison: true },
      { key: 'model', label: 'Modelo', value: 'Modelo de prueba único', requiredForComparison: true },
    ],
    reviewStatus: 'verified',
    externalProductId,
    marketplaceIdentifier: identifier,
    verificationRef: 'fixture-verification-ref',
    recordedVerification: recordedVerification(),
    decisionNote: 'Fixture sintético. No es un producto del catálogo.',
    decisionSourceUrl: null,
    reviewPriority: null,
  }
}

function assertCannotCompare(spec: SecondHandProductMapping) {
  assert.equal(canComparePrices(spec, TEST_ALLOWLIST), false)
  assert.equal(canComparePrices(spec), false)
  assert.equal(asExternalMapping(spec, TEST_ALLOWLIST).externalProductId, null)
  assert.equal(asExternalMapping(spec, TEST_ALLOWLIST).verified, false)
  assert.equal(asExternalMapping(spec).externalProductId, null)
}

test('a missing candidate is absent and is not an error', () => {
  const decision = validateMarketplaceIdentifier(null, PROCEDURE_CONTEXT, null, TEST_ALLOWLIST)
  assert.equal(decision.status, 'absent')
  assert.deepEqual(decision.issues, [])
  assert.equal(decision.evidence, null)
  assert.deepEqual(decision.identifier, { status: 'absent' })
  assertCannotCompare(verifiedMapping(decision.identifier))
  assertCannotCompare(verifiedMapping(null))
})

test('a candidate without evidence stays unvalidated and cannot compare', () => {
  const decision = validateMarketplaceIdentifier(
    unvalidatedMarketplaceIdentifierFixture,
    PROCEDURE_CONTEXT,
    null,
    TEST_ALLOWLIST,
  )
  assert.equal(decision.status, 'unvalidated')
  assert.deepEqual(decision.issues, ['evidence-not-supplied'])
  assert.equal(decision.identifier.status, 'unvalidated')
  assert.equal(hasValidatedMarketplaceId(decision.identifier, PROCEDURE_CONTEXT, TEST_ALLOWLIST), false)
  assertCannotCompare(verifiedMapping(decision.identifier))
})

test('an unverified identity cannot validate a marketplace identifier', () => {
  const decision = validateMarketplaceIdentifier(
    validMarketplaceIdentifierFixture,
    { ...PROCEDURE_CONTEXT, identityVerified: false },
    evidence(),
    TEST_ALLOWLIST,
  )
  assert.equal(decision.status, 'unvalidated')
  assert.deepEqual(decision.issues, ['identity-not-verified'])
  assert.notEqual(decision.status, 'validated')
  assertCannotCompare(verifiedMapping(decision.identifier))
})

test('manufacturer codes, product names, GTINs, URLs and listing ids are rejected', () => {
  const cases = [
    {
      name: 'manufacturer',
      ...manufacturerIdentifierFixture,
      issue: 'manufacturer-identifier',
    },
    {
      name: 'manufacturer labeled as a marketplace product',
      candidate: manufacturerIdentifierFixture.candidate,
      evidence: evidence({ canonicalValue: 'HEG-001', demonstrates: 'marketplace-product' }),
      issue: 'manufacturer-identifier',
    },
    {
      name: 'product name',
      candidate: { ...validMarketplaceIdentifierFixture, canonicalValue: 'Nintendo Switch – Modelo OLED' },
      evidence: evidence({ canonicalValue: 'Nintendo Switch – Modelo OLED', demonstrates: 'product-name' }),
      issue: 'product-name',
    },
    {
      name: 'gtin',
      candidate: { ...validMarketplaceIdentifierFixture, canonicalValue: 'fixture-shown-only-as-ean' },
      evidence: evidence({ canonicalValue: 'fixture-shown-only-as-ean', demonstrates: 'gtin' }),
      issue: 'gtin',
    },
    {
      name: 'url',
      ...urlIdentifierFixture,
      issue: 'url',
    },
    {
      name: 'url labeled as a marketplace product',
      candidate: urlIdentifierFixture.candidate,
      evidence: evidence({
        canonicalValue: urlIdentifierFixture.candidate.canonicalValue,
        demonstrates: 'marketplace-product',
      }),
      issue: 'url',
    },
    {
      name: 'listing',
      ...listingIdentifierFixture,
      issue: 'listing-id',
    },
    {
      name: 'variant',
      candidate: { ...validMarketplaceIdentifierFixture, canonicalValue: 'fixture-other-variant' },
      evidence: evidence({ canonicalValue: 'fixture-other-variant', demonstrates: 'variant' }),
      issue: 'distinct-variant',
    },
  ] as const

  for (const item of cases) {
    const decision = validateMarketplaceIdentifier(item.candidate, PROCEDURE_CONTEXT, item.evidence, TEST_ALLOWLIST)
    assert.equal(decision.status, 'rejected', item.name)
    assert.ok(decision.issues.includes(item.issue), `${item.name}: ${decision.issues.join(',')}`)
    assert.equal(decision.identifier.status, 'rejected', item.name)
    assert.equal(hasValidatedMarketplaceId(decision.identifier, PROCEDURE_CONTEXT, TEST_ALLOWLIST), false, item.name)
    assertCannotCompare(verifiedMapping(decision.identifier))
  }
})

test('the wrong provider, scope, product or verification ref is rejected', () => {
  const cases = [
    { ...wrongProviderFixture, issue: 'wrong-provider' },
    { ...wrongScopeFixture, issue: 'incompatible-scope' },
    { ...wrongProductFixture, issue: 'missing-mapping-link' },
    { ...wrongVerificationRefFixture, issue: 'missing-verified-product-link' },
  ] as const
  for (const item of cases) {
    const decision = validateMarketplaceIdentifier(item.candidate, PROCEDURE_CONTEXT, item.evidence, TEST_ALLOWLIST)
    assert.equal(decision.status, 'rejected', item.issue)
    assert.ok(decision.issues.includes(item.issue), decision.issues.join(','))
    assertCannotCompare(verifiedMapping(decision.identifier))
  }
})

test('incomplete or generic evidence is rejected', () => {
  const cases = [
    { evidence: evidence({ provenance: '' }), issue: 'missing-provenance' },
    { evidence: evidence({ validationMethod: '   ' }), issue: 'missing-validation-method' },
    { evidence: evidence({ auditRef: '' }), issue: 'missing-audit-ref' },
    { ...rejectedMarketplaceIdentifierFixture, issue: 'insufficient-evidence' },
    { evidence: evidence({ validationMethod: 'Aparece en la URL.' }), issue: 'insufficient-evidence' },
    { evidence: evidence({ auditRef: 'Coincide con el nombre.' }), issue: 'insufficient-evidence' },
    { evidence: evidence({ provenance: 'Parece el SKU.' }), issue: 'insufficient-evidence' },
    { evidence: evidence({ demonstrates: 'unspecified' }), issue: 'insufficient-evidence' },
  ] as const
  for (const item of cases) {
    const decision = validateMarketplaceIdentifier(
      validMarketplaceIdentifierFixture,
      PROCEDURE_CONTEXT,
      item.evidence,
      TEST_ALLOWLIST,
    )
    assert.equal(decision.status, 'rejected', item.issue)
    assert.ok(decision.issues.includes(item.issue), `${item.issue}: ${decision.issues.join(',')}`)
    assertCannotCompare(verifiedMapping(decision.identifier))
  }
})

test('a complete synthetic identifier compares only with the test allowlist', () => {
  const snapshot = JSON.stringify(SECOND_HAND_PRODUCT_MAPPINGS)
  const supplied = evidence()
  const blocked = validateMarketplaceIdentifier(validMarketplaceIdentifierFixture, PROCEDURE_CONTEXT, supplied)
  assert.equal(blocked.status, 'rejected')
  assert.ok(blocked.issues.includes('wrong-provider'))
  assert.deepEqual(MARKETPLACE_ID_ALLOWLIST, { providers: [], scopes: [] })
  assertCannotCompare(verifiedMapping(blocked.identifier))

  const decision = validateMarketplaceIdentifier(
    validMarketplaceIdentifierFixture,
    PROCEDURE_CONTEXT,
    supplied,
    TEST_ALLOWLIST,
  )
  assert.equal(decision.status, 'validated')
  assert.deepEqual(decision.issues, [])
  assert.equal(decision.evidence, supplied)
  assert.equal(decision.identifier.status, 'validated')
  assert.equal(hasValidatedMarketplaceId(decision.identifier, PROCEDURE_CONTEXT, TEST_ALLOWLIST), true)
  assert.equal(hasValidatedMarketplaceId(decision.identifier, PROCEDURE_CONTEXT), false)

  const spec = verifiedMapping(decision.identifier, 'fixture-external-bypass')
  assert.equal(canComparePrices(spec), false)
  assert.equal(asExternalMapping(spec).externalProductId, null)
  assert.equal(canComparePrices(spec, TEST_ALLOWLIST), true)
  assert.deepEqual(asExternalMapping(spec, TEST_ALLOWLIST), {
    productId: 'fixture-product',
    externalProductId: 'fixture-catalog-product-id',
    verified: true,
  })
  assert.notEqual(asExternalMapping(spec, TEST_ALLOWLIST).externalProductId, spec.externalProductId)

  const pending = { ...spec, reviewStatus: 'pending' as const }
  assert.equal(canComparePrices(pending, TEST_ALLOWLIST), false)
  assert.equal(asExternalMapping(pending, TEST_ALLOWLIST).externalProductId, null)
  const wrongContext = { ...spec, verificationRef: 'fixture-other-verification-ref' }
  assert.equal(canComparePrices(wrongContext, TEST_ALLOWLIST), false)
  assert.equal(JSON.stringify(SECOND_HAND_PRODUCT_MAPPINGS), snapshot)
})

test('the procedure does not authorize a real provider or enable eBay', () => {
  const source = readFileSync(new URL('../lib/second-hand-marketplace-id.ts', import.meta.url), 'utf8')
  const decision = readFileSync(new URL('../docs/second-hand-ebay-provider-decision.md', import.meta.url), 'utf8')
  assert.equal(EBAY_BROWSE_SOURCE_ENABLED, false)
  assert.match(decision, /`status`: `blocked-pending-authorization`/)
  assert.match(source, /providers: \[\]/)
  assert.match(source, /scopes: \[\]/)
  assert.doesNotMatch(source, /provider === ['"]ebay['"]|provider === ['"]amazon['"]/)
  assert.doesNotMatch(source, /\bfetch\s*\(|process\.env|api\.ebay\.com|setInterval|setTimeout|caches\.|KVNamespace|\bcron\b/i)
  assert.equal(SECOND_HAND_PRODUCT_MAPPINGS.length, 18)
  for (const spec of SECOND_HAND_PRODUCT_MAPPINGS) {
    assert.equal(spec.marketplaceIdentifier, null, spec.productId)
    assert.equal(spec.externalProductId, null, spec.productId)
    assert.equal(canComparePrices(spec), false, spec.productId)
  }
})
