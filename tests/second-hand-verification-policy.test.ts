import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { SECOND_HAND_PRODUCT_MAPPINGS, canComparePrices, type SecondHandProductMapping } from '../lib/second-hand-product-mapping'
import { SECOND_HAND_TECH_CANDIDATES, isOfficialCandidateSource } from '../lib/second-hand-tech-candidates'
import {
  verificationEvidenceFromMapping,
  verificationEvidenceIsSufficient,
  verificationEvidenceIssues,
  isAllowedVerificationSource,
  type SecondHandOpenAmbiguity,
  type SecondHandVerificationEvidence,
  type SecondHandVerificationIssueCode,
} from '../lib/second-hand-verification-policy'

/**
 * Host reservado para el fixture. No es un fabricante y no está en la lista oficial.
 * El código `CODIGO-DE-PRUEBA` tampoco es un SKU publicado por nadie.
 */
const FIXTURE_HOSTS = ['fixture.example']
const FIXTURE_URL = 'https://fixture.example/specs/modelo-de-prueba'

function syntheticEvidence(): SecondHandVerificationEvidence {
  return {
    scope: 'family',
    identity: {
      manufacturer: 'Fabricante de prueba',
      exactModel: 'Modelo de prueba único',
      generation: 'Revisión de prueba A',
      configuration: 'Configuración de prueba única',
    },
    officialUrl: FIXTURE_URL,
    manufacturerIdentifier: 'CODIGO-DE-PRUEBA',
    manufacturerIdentifierSourceUrl: FIXTURE_URL,
    demonstratedAttributes: [
      { key: 'manufacturer', value: 'Fabricante de prueba', sourceUrl: FIXTURE_URL },
      { key: 'exact-model', value: 'Modelo de prueba único', sourceUrl: FIXTURE_URL },
      { key: 'generation', value: 'Revisión de prueba A', sourceUrl: FIXTURE_URL },
      { key: 'configuration', value: 'Configuración de prueba única', sourceUrl: FIXTURE_URL },
    ],
    verificationRef: 'registro sintético, no es un producto del catálogo',
    ambiguitiesReviewed: true,
    openAmbiguities: [],
    marketplaceId: null,
  }
}

function withAttrs(spec: SecondHandProductMapping, value: string): SecondHandProductMapping {
  return {
    ...spec,
    attributes: spec.attributes.map((attribute) =>
      attribute.requiredForComparison ? { ...attribute, value } : attribute,
    ),
  }
}

test('a complete synthetic fixture meets the policy only on the fixture host', () => {
  const evidence = syntheticEvidence()
  assert.deepEqual(verificationEvidenceIssues(evidence, FIXTURE_HOSTS), [])
  assert.equal(verificationEvidenceIsSufficient(evidence, FIXTURE_HOSTS), true)
  assert.equal(verificationEvidenceIsSufficient(evidence), false)
  assert.ok(verificationEvidenceIssues(evidence).includes('disallowed-url'))
  assert.equal(isAllowedVerificationSource(FIXTURE_URL), false)
  assert.equal(isAllowedVerificationSource(FIXTURE_URL, FIXTURE_HOSTS), true)
  for (const candidate of SECOND_HAND_TECH_CANDIDATES) {
    assert.equal(isAllowedVerificationSource(candidate.sourceUrl), isOfficialCandidateSource(candidate.sourceUrl))
    assert.equal(isAllowedVerificationSource(candidate.sourceUrl), true, candidate.sourceUrl)
  }
})

test('missing identity, source, identifier and review fields are rejected', () => {
  const base = syntheticEvidence()
  const cases: Array<[SecondHandVerificationEvidence, SecondHandVerificationIssueCode]> = [
    [{ ...base, identity: { ...base.identity, manufacturer: '' } }, 'missing-manufacturer'],
    [{ ...base, identity: { ...base.identity, exactModel: '' } }, 'missing-exact-model'],
    [{ ...base, identity: { ...base.identity, generation: '' } }, 'missing-generation'],
    [{ ...base, identity: { ...base.identity, configuration: '' } }, 'missing-configuration'],
    [{ ...base, officialUrl: null }, 'missing-official-url'],
    [{ ...base, officialUrl: 'https://www.ebay.es/' }, 'disallowed-url'],
    [{ ...base, officialUrl: 'http://fixture.example/specs/modelo-de-prueba' }, 'disallowed-url'],
    [{ ...base, officialUrl: 'https://fixture.example/specs/modelo-de-prueba?campid=1' }, 'disallowed-url'],
    [{ ...base, officialUrl: 'no-es-una-url' }, 'disallowed-url'],
    [{ ...base, manufacturerIdentifier: null, manufacturerIdentifierSourceUrl: null }, 'missing-manufacturer-identifier'],
    [{ ...base, manufacturerIdentifierSourceUrl: null }, 'identifier-without-source'],
    [{ ...base, manufacturerIdentifierSourceUrl: 'https://www.ebay.es/' }, 'identifier-without-source'],
    [{
      ...base,
      demonstratedAttributes: base.demonstratedAttributes.filter((attribute) => attribute.key !== 'configuration'),
    }, 'missing-demonstrated-attribute'],
    [{
      ...base,
      demonstratedAttributes: base.demonstratedAttributes.map((attribute) =>
        attribute.key === 'configuration' ? { ...attribute, sourceUrl: '' } : attribute,
      ),
    }, 'demonstrated-attribute-without-source'],
    [{ ...base, verificationRef: null }, 'missing-verification-ref'],
    [{ ...base, ambiguitiesReviewed: false }, 'ambiguities-not-reviewed'],
    [{ ...base, scope: 'category' }, 'category-is-not-a-single-product'],
  ]

  for (const [evidence, code] of cases) {
    const issues = verificationEvidenceIssues(evidence, FIXTURE_HOSTS)
    assert.ok(issues.includes(code), `${code}: ${issues.join(',')}`)
    assert.equal(verificationEvidenceIsSufficient(evidence, FIXTURE_HOSTS), false, code)
  }

  const unsourcedId = verificationEvidenceIssues(
    { ...base, manufacturerIdentifierSourceUrl: null },
    FIXTURE_HOSTS,
  )
  assert.equal(unsourcedId.includes('missing-manufacturer-identifier'), false)
  const missingId = verificationEvidenceIssues(
    { ...base, manufacturerIdentifier: null, manufacturerIdentifierSourceUrl: null },
    FIXTURE_HOSTS,
  )
  assert.equal(missingId.includes('identifier-without-source'), false)
  const blankOfficial = verificationEvidenceIssues({ ...base, officialUrl: null }, FIXTURE_HOSTS)
  assert.deepEqual(blankOfficial, ['missing-official-url'])
})

test('each open ambiguity blocks verification', () => {
  const base = syntheticEvidence()
  const ambiguities: Array<[SecondHandOpenAmbiguity, SecondHandVerificationIssueCode]> = [
    ['capacity', 'ambiguous-capacity'],
    ['disc-vs-digital', 'ambiguous-disc-or-digital'],
    ['size', 'ambiguous-size'],
    ['connectivity', 'ambiguous-connectivity'],
    ['region', 'ambiguous-region'],
    ['incompatible-revision', 'ambiguous-incompatible-revision'],
  ]
  for (const [ambiguity, code] of ambiguities) {
    const evidence = { ...base, openAmbiguities: [ambiguity] }
    assert.deepEqual(verificationEvidenceIssues(evidence, FIXTURE_HOSTS), [code], ambiguity)
  }
})

test('a marketplace id is rejected when it is inferred or has no source of its own', () => {
  const base = syntheticEvidence()
  const inferred = verificationEvidenceIssues({
    ...base,
    marketplaceId: { value: null, sourceUrl: null, inferredFromName: true },
  }, FIXTURE_HOSTS)
  assert.deepEqual(inferred, ['marketplace-id-inferred'])

  const copiedName = verificationEvidenceIssues({
    ...base,
    marketplaceId: {
      value: base.identity.exactModel,
      sourceUrl: 'https://fixture.example/otro-registro',
      inferredFromName: false,
    },
  }, FIXTURE_HOSTS)
  assert.deepEqual(copiedName, ['marketplace-id-inferred'])

  const copiedManufacturer = verificationEvidenceIssues({
    ...base,
    marketplaceId: {
      value: base.identity.manufacturer,
      sourceUrl: 'https://fixture.example/otro-registro',
      inferredFromName: false,
    },
  }, FIXTURE_HOSTS)
  assert.deepEqual(copiedManufacturer, ['marketplace-id-inferred'])

  const withoutSource = verificationEvidenceIssues({
    ...base,
    marketplaceId: { value: 'fixture-external-id', sourceUrl: null, inferredFromName: false },
  }, FIXTURE_HOSTS)
  assert.deepEqual(withoutSource, ['marketplace-id-without-source'])

  const samePage = verificationEvidenceIssues({
    ...base,
    marketplaceId: { value: 'fixture-external-id', sourceUrl: FIXTURE_URL, inferredFromName: false },
  }, FIXTURE_HOSTS)
  assert.deepEqual(samePage, ['marketplace-id-without-source'])
})

test('the catalog stays pending and its records are not verification evidence', () => {
  const before = JSON.stringify(SECOND_HAND_PRODUCT_MAPPINGS)
  for (const spec of SECOND_HAND_PRODUCT_MAPPINGS) {
    assert.equal(spec.reviewStatus, 'pending', spec.productId)
    assert.equal(spec.externalProductId, null, spec.productId)
    assert.equal(spec.verificationRef, null, spec.productId)
    assert.equal(canComparePrices(spec), false, spec.productId)
    for (const attribute of spec.attributes) assert.equal(attribute.value, null, `${spec.productId}:${attribute.key}`)
    const evidence = verificationEvidenceFromMapping(spec)
    const issues = verificationEvidenceIssues(evidence)
    assert.equal(verificationEvidenceIsSufficient(evidence), false, spec.productId)
    assert.ok(issues.includes('missing-official-url'), spec.productId)
    assert.ok(issues.includes('missing-manufacturer-identifier'), spec.productId)
    assert.ok(issues.includes('missing-verification-ref'), spec.productId)
    assert.ok(issues.includes('missing-demonstrated-attribute'), spec.productId)
    assert.ok(issues.includes('ambiguities-not-reviewed'), spec.productId)
    assert.equal(evidence.manufacturerIdentifier, null, spec.productId)
    assert.equal(evidence.officialUrl, null, spec.productId)
    assert.equal(evidence.marketplaceId, null, spec.productId)
    if (spec.scope === 'category') assert.ok(issues.includes('category-is-not-a-single-product'), spec.productId)
    else assert.equal(issues.includes('category-is-not-a-single-product'), false, spec.productId)
  }
  assert.equal(JSON.stringify(SECOND_HAND_PRODUCT_MAPPINGS), before)

  const iphone = SECOND_HAND_PRODUCT_MAPPINGS[0]
  assert.equal(iphone.productId, 'iphone')
  const filled = withAttrs({ ...iphone, reviewStatus: 'verified', verificationRef: 'fixture-review' }, 'fixture-value')
  assert.equal(canComparePrices(filled), true)
  assert.equal(verificationEvidenceIsSufficient(verificationEvidenceFromMapping(filled)), false)
  assert.equal(iphone.reviewStatus, 'pending')
})

test('tech candidates and the policy module do not verify a product or call a marketplace', () => {
  const candidate = SECOND_HAND_TECH_CANDIDATES[0]
  const attempt: SecondHandVerificationEvidence = {
    scope: 'family',
    identity: {
      manufacturer: '',
      exactModel: candidate.name,
      generation: candidate.generation,
      configuration: candidate.configuration,
    },
    officialUrl: candidate.sourceUrl,
    manufacturerIdentifier: null,
    manufacturerIdentifierSourceUrl: null,
    demonstratedAttributes: [],
    verificationRef: null,
    ambiguitiesReviewed: false,
    openAmbiguities: [],
    marketplaceId: null,
  }
  assert.equal(verificationEvidenceIsSufficient(attempt), false)
  assert.ok(verificationEvidenceIssues(attempt).includes('missing-manufacturer-identifier'))
  assert.equal(candidate.reviewStatus, 'pending')
  assert.equal(candidate.externalProductId, null)

  const source = readFileSync(new URL('../lib/second-hand-verification-policy.ts', import.meta.url), 'utf8')
  assert.doesNotMatch(source, /\bfetch\s*\(|process\.env|api\.ebay\.com|ebay-browse-adapter/)
  const mapping = readFileSync(new URL('../lib/second-hand-product-mapping.ts', import.meta.url), 'utf8')
  assert.doesNotMatch(mapping, /\bfetch\s*\(|process\.env|api\.ebay\.com|campid|gtin|epid|asin/i)
})
