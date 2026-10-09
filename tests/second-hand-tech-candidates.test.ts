import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { hasMetrics } from '../lib/second-hand'
import { getSecondHandProducts } from '../lib/second-hand-data'
import { SECOND_HAND_PRODUCT_MAPPINGS, canComparePrices } from '../lib/second-hand-product-mapping'
import {
  SECOND_HAND_TECH_CANDIDATES,
  SECOND_HAND_TECH_CANDIDATE_GAPS,
  SECOND_HAND_TECH_SLUGS,
  isOfficialCandidateSource,
  techCandidatesFor,
  techCandidatesLeaveMappingsPending,
} from '../lib/second-hand-tech-candidates'

test('tech candidates stay pending and do not verify or enable comparison', () => {
  assert.equal(techCandidatesLeaveMappingsPending(), true)
  assert.equal(SECOND_HAND_TECH_CANDIDATES.length > 0, true)
  for (const slug of SECOND_HAND_TECH_SLUGS) {
    const proposed = techCandidatesFor(slug)
    assert.ok(proposed.length >= 1 && proposed.length <= 3, slug)
    const spec = SECOND_HAND_PRODUCT_MAPPINGS.find((item) => item.productId === slug)
    assert.ok(spec, slug)
    assert.equal(spec.reviewStatus, 'pending', slug)
    assert.equal(spec.externalProductId, null, slug)
    assert.equal(canComparePrices(spec), false, slug)
    for (const attribute of spec.attributes) assert.equal(attribute.value, null, slug)
    for (const item of proposed) {
      assert.equal(item.reviewStatus, 'pending')
      assert.equal(item.externalProductId, null)
      assert.equal(isOfficialCandidateSource(item.sourceUrl), true, item.sourceUrl)
      assert.ok(item.name.trim())
      assert.ok(item.generation.trim())
      assert.ok(item.configuration.trim())
    }
  }
  for (const spec of SECOND_HAND_PRODUCT_MAPPINGS) {
    assert.equal(spec.reviewStatus, 'pending', spec.productId)
    assert.equal(canComparePrices(spec), false, spec.productId)
  }
})

test('each tech family records what was left out and the list has no commercial data', async () => {
  assert.deepEqual(SECOND_HAND_TECH_CANDIDATE_GAPS.map((gap) => gap.productId), [...SECOND_HAND_TECH_SLUGS])
  for (const gap of SECOND_HAND_TECH_CANDIDATE_GAPS) assert.ok(gap.missing.trim(), gap.productId)
  const source = readFileSync(new URL('../lib/second-hand-tech-candidates.ts', import.meta.url), 'utf8')
  assert.doesNotMatch(source, /\bfetch\s*\(|process\.env|api\.ebay\.com|campid|gtin|epid|\basin\b|\$|€|£/i)
  assert.doesNotMatch(source, /reviewStatus: 'verified'/)
  const products = await getSecondHandProducts()
  for (const product of products) {
    assert.equal(hasMetrics(product.metrics), false, product.slug)
    assert.equal(product.metrics.usedPrice, null)
    assert.equal(product.metrics.score, null)
    assert.equal(product.metrics.trend, null)
  }
})
