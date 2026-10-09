import test from 'node:test'
import assert from 'node:assert/strict'
import { SECOND_HAND_CATEGORIES, SECOND_HAND_PRODUCTS, SECOND_HAND_SEO, hasMetrics, secondHandCategory, secondHandProductsByCategory } from '../lib/second-hand'
import { secondHandGraph } from '../lib/structured-data'

test('second-hand data has the five categories and expected products', () => {
  assert.deepEqual(SECOND_HAND_CATEGORIES.map((c) => c.slug), ['tecnologia', 'gaming', 'moda', 'hogar', 'deporte'])
  assert.equal(SECOND_HAND_PRODUCTS.length, 18)
  assert.equal(new Set(SECOND_HAND_PRODUCTS.map((p) => p.slug)).size, 18)
  for (const p of SECOND_HAND_PRODUCTS) assert.ok(secondHandCategory(p.categorySlug), p.slug)
  assert.equal(secondHandProductsByCategory('gaming').length, 4)
})

test('second-hand products carry no invented market data', () => {
  for (const p of SECOND_HAND_PRODUCTS) assert.equal(hasMetrics(p.metrics), false, p.slug)
})

test('second-hand SEO and structured data', () => {
  assert.ok(SECOND_HAND_SEO.description.length <= 170)
  const json = JSON.stringify(secondHandGraph())
  assert.ok(json.includes('/segunda-mano'))
  assert.ok(JSON.stringify(secondHandGraph(SECOND_HAND_CATEGORIES[0])).includes('/segunda-mano/tecnologia'))
})
