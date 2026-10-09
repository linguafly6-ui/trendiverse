import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { SECOND_HAND_PRODUCTS, hasMetrics } from '../lib/second-hand'
import { getSecondHandProducts } from '../lib/second-hand-data'
import {
  SECOND_HAND_PRODUCT_MAPPINGS,
  asExternalMapping,
  canComparePrices,
  hasValidatedMarketplaceId,
  hasUnverifiedExternalId,
  isTooAmbiguousToCompare,
  isOfficialMappingDecisionSource,
  isValidReviewPriority,
  mappingDecisionIsExplicit,
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
    assert.equal(spec.marketplaceIdentifier, null, spec.productId)
    assert.equal(mappingDecisionIsExplicit(spec), true, spec.productId)
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
  const families = SECOND_HAND_PRODUCT_MAPPINGS.filter((spec) => spec.scope === 'family')
  const priorities = families.map((spec) => spec.reviewPriority)
  assert.deepEqual([...priorities].sort((a, b) => Number(a) - Number(b)), [1, 2, 3, 4, 5, 6, 7, 8, 9])
  for (const spec of families) assert.equal(isOfficialMappingDecisionSource(spec.decisionSourceUrl), true, spec.productId)
  const playstation = families.find((spec) => spec.productId === 'playstation-5')
  const xbox = families.find((spec) => spec.productId === 'xbox')
  assert.equal(playstation?.reviewPriority, 1)
  assert.equal(playstation?.reviewStatus, 'pending')
  assert.equal(playstation?.decisionSourceUrl, 'https://www.playstation.com/es-es/ps5/')
  assert.match(playstation?.decisionNote ?? '', /lector/)
  assert.match(playstation?.decisionNote ?? '', /Digital/)
  assert.match(playstation?.decisionNote ?? '', /1 TB/)
  assert.match(playstation?.decisionNote ?? '', /825 GB/)
  assert.match(playstation?.decisionNote ?? '', /No se verifica ninguno/)
  assert.equal(xbox?.reviewPriority, 2)
  assert.match(xbox?.decisionNote ?? '', /Digital Edition/)
  const steamDeck = families.find((spec) => spec.productId === 'steam-deck')
  assert.equal(steamDeck?.reviewPriority, 4)
  assert.equal(steamDeck?.reviewStatus, 'pending')
  assert.equal(steamDeck?.decisionSourceUrl, 'https://www.steamdeck.com/es/oled')
  assert.equal(steamDeck?.externalProductId, null)
  assert.equal(steamDeck?.marketplaceIdentifier, null)
  assert.equal(steamDeck?.verificationRef, null)
  assert.equal(canComparePrices(steamDeck!), false)
  assert.match(steamDeck?.decisionNote ?? '', /512 GB/)
  assert.match(steamDeck?.decisionNote ?? '', /1 TB/)
  assert.match(steamDeck?.decisionNote ?? '', /edición limitada/)
  assert.match(steamDeck?.decisionNote ?? '', /64 GB/)
  assert.match(steamDeck?.decisionNote ?? '', /número de modelo/)
  assert.match(steamDeck?.decisionNote ?? '', /No se verifica ninguno/)
  assert.match(steamDeck?.decisionNote ?? '', /no se copian/)
  assert.doesNotMatch(steamDeck?.decisionNote ?? '', /€|\$|£/)
})

test('review priority is an integer from 1 to 9, and null only on a category', () => {
  assert.equal(isValidReviewPriority(1), true)
  assert.equal(isValidReviewPriority(9), true)
  assert.equal(isValidReviewPriority(0), false)
  assert.equal(isValidReviewPriority(10), false)
  assert.equal(isValidReviewPriority(1.5), false)
  assert.equal(isValidReviewPriority(-1), false)
  assert.equal(isValidReviewPriority(Number.NaN), false)
  assert.equal(isValidReviewPriority('1'), false)

  const family = SECOND_HAND_PRODUCT_MAPPINGS.find((spec) => spec.reviewPriority === 1)
  const upper = SECOND_HAND_PRODUCT_MAPPINGS.find((spec) => spec.reviewPriority === 9)
  const category = SECOND_HAND_PRODUCT_MAPPINGS.find((spec) => spec.scope === 'category')
  assert.ok(family)
  assert.ok(upper)
  assert.ok(category)
  assert.equal(family.scope, 'family')
  assert.equal(upper.scope, 'family')
  assert.equal(mappingDecisionIsExplicit(family), true)
  assert.equal(mappingDecisionIsExplicit(upper), true)
  assert.equal(mappingDecisionIsExplicit({ ...category, reviewPriority: null }), true)
  assert.equal(mappingDecisionIsExplicit({ ...category, reviewPriority: 1 }), false)
  assert.equal(mappingDecisionIsExplicit({ ...family, marketplaceIdentifier: { status: 'absent' } }), false)
  for (const reviewPriority of [0, 10, 1.5, -1, Number.NaN, null, '1'] as const) {
    assert.equal(mappingDecisionIsExplicit({ ...family, reviewPriority: reviewPriority as number | null }), false, String(reviewPriority))
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

  const verifiedWithoutEvidence = withAttrs({ ...iphone, reviewStatus: 'verified', verificationRef: null }, 'fixture-value')
  assert.ok(mappingIssues(verifiedWithoutEvidence).includes('missing-verification-ref'))
  assert.equal(canComparePrices(verifiedWithoutEvidence), false)

  const rejected = { ...completeFamily, reviewStatus: 'rejected' as const }
  assert.ok(mappingIssues(rejected).includes('rejected'))
  assert.equal(canComparePrices(rejected), false)
})

test('an arbitrary external product id is not a validated comparison id', () => {
  const verified = SECOND_HAND_PRODUCT_MAPPINGS.find((spec) => spec.productId === 'nintendo-switch')
  assert.ok(verified)
  assert.equal(verified.reviewStatus, 'verified')
  for (const externalProductId of ['fixture-external-id', 'HEG-001', '123']) {
    assert.equal(hasValidatedMarketplaceId(externalProductId), false, externalProductId)
    const withArbitraryId: SecondHandProductMapping = { ...verified, externalProductId }
    assert.equal(canComparePrices(withArbitraryId), false, externalProductId)
    assert.deepEqual(asExternalMapping(withArbitraryId), {
      productId: 'nintendo-switch',
      externalProductId: null,
      verified: false,
    })
  }
  assert.equal(verified.externalProductId, null)
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
