import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { SECOND_HAND_PRODUCTS, hasMetrics } from '../lib/second-hand'
import { getSecondHandProducts } from '../lib/second-hand-data'
import {
  SECOND_HAND_PRODUCT_MAPPINGS,
  asExternalMapping,
  canComparePrices,
  hasUnverifiedExternalId,
  isTooAmbiguousToCompare,
  mappingIssues,
  missingRequiredAttributes,
  secondHandMappingCoversCatalog,
  type SecondHandProductMapping,
} from '../lib/second-hand-product-mapping'

const SLUGS = [
  'iphone', 'macbook', 'ipad', 'apple-watch', 'samsung-galaxy',
  'playstation-5', 'nintendo-switch', 'xbox', 'steam-deck',
  'zapatillas', 'bolsos', 'ropa-vintage',
  'aspiradores', 'cafeteras', 'muebles',
  'bicicletas', 'material-fitness', 'material-outdoor',
]

function withAttrs(spec: SecondHandProductMapping, value: string): SecondHandProductMapping {
  return {
    ...spec,
    attributes: spec.attributes.map((attribute) =>
      attribute.requiredForComparison ? { ...attribute, value } : attribute,
    ),
  }
}

test('the mapping catalog matches the editorial slugs and verifies only the Switch OLED', () => {
  assert.equal(secondHandMappingCoversCatalog(), true)
  assert.deepEqual(SECOND_HAND_PRODUCT_MAPPINGS.map((spec) => spec.productId), SLUGS)
  assert.deepEqual(SECOND_HAND_PRODUCTS.map((product) => product.slug), SLUGS)
  for (const spec of SECOND_HAND_PRODUCT_MAPPINGS) {
    assert.equal(spec.externalProductId, null, spec.productId)
    assert.equal(canComparePrices(spec), false, spec.productId)
    assert.ok(spec.identifies.trim(), spec.productId)
    assert.ok(spec.attributes.some((attribute) => attribute.requiredForComparison), spec.productId)
    if (spec.productId === 'nintendo-switch') {
      assert.equal(spec.reviewStatus, 'verified')
      assert.equal(spec.recordedVerification?.manufacturerIdentifier, 'HEG-001')
      continue
    }
    assert.equal(spec.reviewStatus, 'pending', spec.productId)
    assert.equal(spec.verificationRef, null, spec.productId)
    assert.equal(spec.recordedVerification, null, spec.productId)
    for (const attribute of spec.attributes) assert.equal(attribute.value, null, `${spec.productId}:${attribute.key}`)
  }
})

test('incomplete mappings, unverified external ids and ambiguous products cannot be compared', () => {
  for (const spec of SECOND_HAND_PRODUCT_MAPPINGS) {
    assert.equal(hasUnverifiedExternalId(spec), false, spec.productId)
    assert.equal(canComparePrices(spec), false, spec.productId)
    assert.deepEqual(asExternalMapping(spec), { productId: spec.productId, externalProductId: null, verified: false })
    if (spec.productId === 'nintendo-switch') {
      assert.equal(missingRequiredAttributes(spec).length, 0)
      assert.equal(isTooAmbiguousToCompare(spec), false)
      assert.deepEqual(mappingIssues(spec), [])
      continue
    }
    assert.ok(missingRequiredAttributes(spec).length > 0, spec.productId)
    assert.equal(isTooAmbiguousToCompare(spec), true, spec.productId)
    assert.ok(mappingIssues(spec).includes('incomplete'), spec.productId)
    assert.ok(mappingIssues(spec).includes('ambiguous'), spec.productId)
  }

  const iphone = SECOND_HAND_PRODUCT_MAPPINGS[0]
  assert.equal(iphone.productId, 'iphone')
  const unverifiedId: SecondHandProductMapping = { ...iphone, externalProductId: 'fixture-not-a-catalog-id' }
  assert.equal(hasUnverifiedExternalId(unverifiedId), true)
  assert.ok(mappingIssues(unverifiedId).includes('external-id-without-verification'))
  assert.equal(asExternalMapping(unverifiedId).externalProductId, null)
  assert.equal(asExternalMapping(unverifiedId).verified, false)

  const sneakers = SECOND_HAND_PRODUCT_MAPPINGS.find((spec) => spec.productId === 'zapatillas')
  assert.ok(sneakers)
  assert.equal(sneakers.scope, 'category')
  const filledCategory = withAttrs({ ...sneakers, reviewStatus: 'pending' }, 'fixture-model')
  assert.equal(missingRequiredAttributes(filledCategory).length, 0)
  assert.equal(isTooAmbiguousToCompare(filledCategory), true)
  assert.equal(canComparePrices(filledCategory), false)

  const completeFamily = withAttrs({ ...iphone, reviewStatus: 'verified', verificationRef: 'fixture-review' }, 'fixture-value')
  assert.deepEqual(mappingIssues(completeFamily), [])
  assert.equal(canComparePrices(completeFamily), false)
  assert.equal(asExternalMapping(completeFamily).verified, false)
  const withMarketplaceId = { ...completeFamily, externalProductId: 'fixture-external-id' }
  assert.equal(canComparePrices(withMarketplaceId), true)
  assert.equal(asExternalMapping(withMarketplaceId).verified, true)

  const verifiedWithoutEvidence = withAttrs({ ...iphone, reviewStatus: 'verified', verificationRef: null }, 'fixture-value')
  assert.ok(mappingIssues(verifiedWithoutEvidence).includes('missing-verification-ref'))
  assert.equal(canComparePrices(verifiedWithoutEvidence), false)

  const rejected = { ...completeFamily, reviewStatus: 'rejected' as const }
  assert.ok(mappingIssues(rejected).includes('rejected'))
  assert.equal(canComparePrices(rejected), false)
})

test('the catalog does not connect a source or publish metrics', async () => {
  const source = readFileSync(new URL('../lib/second-hand-product-mapping.ts', import.meta.url), 'utf8')
  assert.doesNotMatch(source, /\bfetch\s*\(|process\.env|api\.ebay\.com|campid|gtin|epid|asin/i)
  const products = await getSecondHandProducts()
  assert.equal(products.length, 18)
  for (const product of products) {
    assert.equal(hasMetrics(product.metrics), false, product.slug)
    assert.equal(product.metrics.score, null)
    assert.equal(product.metrics.trend, null)
    assert.equal(product.metrics.usedPrice, null)
  }
})
