import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { EBAY_BROWSE_SOURCE_ENABLED } from '../lib/ebay-browse-adapter'
import {
  SECOND_HAND_PRODUCT_MAPPINGS,
  asExternalMapping,
  canComparePrices,
  hasValidatedMarketplaceId,
  type SecondHandProductMapping,
  type SecondHandRecordedVerification,
} from '../lib/second-hand-product-mapping'
import {
  MARKETPLACE_ID_ALLOWLIST,
  SECOND_HAND_MARKETPLACE_ID_REJECTION_REASONS,
  type SecondHandMarketplaceIdAllowlist,
  type SecondHandMarketplaceIdContext,
  type SecondHandMarketplaceIdentifier,
} from '../lib/second-hand-marketplace-id'

const FIXTURE_ALLOWLIST: SecondHandMarketplaceIdAllowlist = {
  providers: ['fixture-marketplace'],
  scopes: ['fixture-scope'],
}

const FIXTURE_CONTEXT: SecondHandMarketplaceIdContext = {
  productId: 'fixture-product',
  verificationRef: 'fixture-review',
  manufacturerIdentifier: 'HEG-001',
  manufacturer: 'Fabricante de prueba',
  exactModel: 'Modelo de prueba único',
  identifies: 'Modelo de prueba único',
}

function validatedId(): Extract<SecondHandMarketplaceIdentifier, { status: 'validated' }> {
  return {
    status: 'validated',
    provider: 'fixture-marketplace',
    scope: 'fixture-scope',
    canonicalValue: 'fixture-market-id',
    productId: 'fixture-product',
    verifiedProductRef: 'fixture-review',
    provenance: 'Registro sintético de prueba, sin proveedor real.',
    validationMethod: 'fixture-contract',
    auditRef: 'fixture-audit-1',
  }
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

function detached(
  identifier: SecondHandMarketplaceIdentifier | null,
  externalProductId: string | null = null,
): SecondHandProductMapping {
  return {
    productId: 'fixture-product',
    scope: 'family',
    identifies: 'Modelo de prueba único',
    attributes: [
      { key: 'brand', label: 'Fabricante', value: 'Fabricante de prueba', requiredForComparison: true },
      { key: 'model', label: 'Modelo', value: 'Modelo de prueba único', requiredForComparison: true },
    ],
    reviewStatus: 'verified',
    externalProductId,
    marketplaceIdentifier: identifier,
    verificationRef: 'fixture-review',
    recordedVerification: recordedVerification(),
  }
}

function assertUnpublished(spec: SecondHandProductMapping, allowlist?: SecondHandMarketplaceIdAllowlist) {
  assert.equal(canComparePrices(spec, allowlist), false)
  assert.deepEqual(asExternalMapping(spec, allowlist), {
    productId: spec.productId,
    externalProductId: null,
    verified: false,
  })
}

test('the catalog has no validated marketplace id', () => {
  const snapshot = JSON.stringify(SECOND_HAND_PRODUCT_MAPPINGS)
  assert.deepEqual(MARKETPLACE_ID_ALLOWLIST, { providers: [], scopes: [] })
  assert.equal(SECOND_HAND_PRODUCT_MAPPINGS.length, 18)
  assert.equal(SECOND_HAND_PRODUCT_MAPPINGS.filter((spec) => spec.reviewStatus === 'verified').map((spec) => spec.productId).join(), 'nintendo-switch')
  assert.equal(SECOND_HAND_PRODUCT_MAPPINGS.filter((spec) => spec.reviewStatus === 'pending').length, 17)
  for (const spec of SECOND_HAND_PRODUCT_MAPPINGS) {
    assert.equal(spec.externalProductId, null, spec.productId)
    assert.equal(spec.marketplaceIdentifier, null, spec.productId)
    assert.equal(hasValidatedMarketplaceId(spec.marketplaceIdentifier, {
      productId: spec.productId,
      verificationRef: spec.verificationRef,
      manufacturerIdentifier: spec.recordedVerification?.manufacturerIdentifier ?? null,
      manufacturer: spec.recordedVerification?.manufacturer ?? null,
      exactModel: spec.recordedVerification?.exactModel ?? null,
      identifies: spec.identifies,
    }), false, spec.productId)
    assertUnpublished(spec)
    assertUnpublished(spec, FIXTURE_ALLOWLIST)
  }
  assert.equal(JSON.stringify(SECOND_HAND_PRODUCT_MAPPINGS), snapshot)
  assert.equal(SECOND_HAND_PRODUCT_MAPPINGS.some((spec) => spec.productId === 'fixture-product'), false)
})

test('a present string is not a validated marketplace id and cannot be published', () => {
  for (const externalProductId of ['fixture-external-id', 'HEG-001', '123', '', '   ', null]) {
    assert.equal(hasValidatedMarketplaceId(externalProductId), false, String(externalProductId))
    assertUnpublished(detached(null, externalProductId), FIXTURE_ALLOWLIST)
    if (externalProductId === null) continue
    const present: SecondHandMarketplaceIdentifier = {
      status: 'unvalidated',
      provider: 'fixture-marketplace',
      scope: 'fixture-scope',
      canonicalValue: externalProductId,
      productId: 'fixture-product',
    }
    assert.equal(hasValidatedMarketplaceId(present, FIXTURE_CONTEXT, FIXTURE_ALLOWLIST), false, externalProductId)
    assertUnpublished(detached(present), FIXTURE_ALLOWLIST)
  }
})

test('empty values, the manufacturer code and the product name are not a marketplace id', () => {
  for (const canonicalValue of [
    '',
    '   ',
    'HEG-001',
    'heg-001',
    'Modelo de prueba único',
    'modelo   de prueba único',
    'Fabricante de prueba',
    'fabricante de prueba modelo de prueba único',
  ]) {
    const identifier = { ...validatedId(), canonicalValue }
    assert.equal(hasValidatedMarketplaceId(identifier, FIXTURE_CONTEXT, FIXTURE_ALLOWLIST), false, canonicalValue)
    assertUnpublished(detached(identifier), FIXTURE_ALLOWLIST)
  }
})

test('the wrong provider, an incompatible scope and a missing validation reference stay unpublished', () => {
  const cases: Array<Extract<SecondHandMarketplaceIdentifier, { status: 'validated' }>> = [
    { ...validatedId(), provider: 'otro-proveedor' },
    { ...validatedId(), provider: '' },
    { ...validatedId(), scope: 'otro-ambito' },
    { ...validatedId(), scope: '' },
    { ...validatedId(), productId: 'otro-producto' },
    { ...validatedId(), verifiedProductRef: '' },
    { ...validatedId(), verifiedProductRef: 'otra-revision' },
    { ...validatedId(), provenance: '' },
    { ...validatedId(), provenance: '   ' },
    { ...validatedId(), validationMethod: '' },
    { ...validatedId(), auditRef: '' },
  ]
  for (const identifier of cases) {
    assert.equal(hasValidatedMarketplaceId(identifier, FIXTURE_CONTEXT, FIXTURE_ALLOWLIST), false, JSON.stringify(identifier))
    assertUnpublished(detached(identifier), FIXTURE_ALLOWLIST)
  }

  const missingMappingRef = detached(validatedId())
  missingMappingRef.verificationRef = null
  assert.equal(hasValidatedMarketplaceId(validatedId(), {
    ...FIXTURE_CONTEXT,
    verificationRef: null,
  }, FIXTURE_ALLOWLIST), false)
  assertUnpublished(missingMappingRef, FIXTURE_ALLOWLIST)
})

test('an absent, unvalidated or rejected identifier cannot be compared', () => {
  const rejected: SecondHandMarketplaceIdentifier = {
    status: 'rejected',
    provider: 'fixture-marketplace',
    scope: 'fixture-scope',
    canonicalValue: 'fixture-market-id',
    productId: 'fixture-product',
    rejectionReason: 'wrong-provider',
  }
  assert.ok(SECOND_HAND_MARKETPLACE_ID_REJECTION_REASONS.includes(rejected.rejectionReason))
  for (const identifier of [null, { status: 'absent' } as const, rejected]) {
    assert.equal(hasValidatedMarketplaceId(identifier, FIXTURE_CONTEXT, FIXTURE_ALLOWLIST), false)
    assertUnpublished(detached(identifier), FIXTURE_ALLOWLIST)
  }
})

test('a synthetic fixture that meets the whole contract can be compared without changing the catalog', () => {
  const snapshot = JSON.stringify(SECOND_HAND_PRODUCT_MAPPINGS)
  const identifier = validatedId()
  const spec = detached(identifier, 'fixture-external-id')
  assert.equal(hasValidatedMarketplaceId(identifier, FIXTURE_CONTEXT), false)
  assert.equal(canComparePrices(spec), false)
  assert.equal(asExternalMapping(spec).externalProductId, null)
  assert.equal(hasValidatedMarketplaceId(identifier, FIXTURE_CONTEXT, FIXTURE_ALLOWLIST), true)
  assert.equal(canComparePrices(spec, FIXTURE_ALLOWLIST), true)
  assert.deepEqual(asExternalMapping(spec, FIXTURE_ALLOWLIST), {
    productId: 'fixture-product',
    externalProductId: 'fixture-market-id',
    verified: true,
  })
  assert.notEqual(asExternalMapping(spec, FIXTURE_ALLOWLIST).externalProductId, 'fixture-external-id')
  assert.notEqual(asExternalMapping(spec, FIXTURE_ALLOWLIST).externalProductId, 'HEG-001')

  const pending = SECOND_HAND_PRODUCT_MAPPINGS.find((item) => item.productId === 'iphone')
  assert.ok(pending)
  const notReady: SecondHandProductMapping = {
    ...pending,
    marketplaceIdentifier: { ...identifier, productId: pending.productId },
  }
  assertUnpublished(notReady, FIXTURE_ALLOWLIST)
  const rejectedMapping: SecondHandProductMapping = { ...spec, reviewStatus: 'rejected' }
  assertUnpublished(rejectedMapping, FIXTURE_ALLOWLIST)

  assert.equal(JSON.stringify(SECOND_HAND_PRODUCT_MAPPINGS), snapshot)
  assert.equal(spec.productId === 'fixture-product' && SECOND_HAND_PRODUCT_MAPPINGS.includes(spec), false)
})

test('the marketplace id contract does not enable the ebay adapter or the network', () => {
  const contract = readFileSync(new URL('../lib/second-hand-marketplace-id.ts', import.meta.url), 'utf8')
  const mapping = readFileSync(new URL('../lib/second-hand-product-mapping.ts', import.meta.url), 'utf8')
  assert.equal(EBAY_BROWSE_SOURCE_ENABLED, false)
  assert.doesNotMatch(contract, /\bfetch\s*\(|process\.env|api\.ebay\.com|setInterval|setTimeout|caches\.|KVNamespace|\bcron\b/i)
  assert.doesNotMatch(mapping, /\bfetch\s*\(|process\.env|api\.ebay\.com|setInterval|setTimeout|caches\.|KVNamespace|\bcron\b/i)
  assert.match(contract, /providers: \[\]/)
  assert.match(contract, /scopes: \[\]/)
})
