import test from 'node:test'
import assert from 'node:assert/strict'
import { SECOND_HAND_CATEGORIES, SECOND_HAND_PRODUCTS, hasMetrics } from '../lib/second-hand'
import {
  emptySecondHandDataSource, getSecondHandMetrics, getSecondHandProducts, normalizeCondition,
  observationToMetrics, validateObservation, type SecondHandDataSource,
} from '../lib/second-hand-data'

const valid = {
  productId: 'iphone', price: 400, currency: 'eur', condition: 'Como nuevo',
  source: 'example-source', sourceUrl: 'https://example.com/iphone', observedAt: '2026-01-01T10:00:00Z',
}

test('valid observation passes and is normalized', () => {
  const r = validateObservation(valid)
  assert.ok(r.ok)
  if (r.ok) {
    assert.equal(r.value.currency, 'EUR')
    assert.equal(r.value.condition, 'like-new')
    assert.equal(r.value.referencePrice, null)
  }
})

test('invalid observations are rejected', () => {
  assert.equal(validateObservation({ ...valid, price: -5 }).ok, false)
  assert.equal(validateObservation({ ...valid, price: 0 }).ok, false)
  assert.equal(validateObservation({ ...valid, price: null }).ok, false)
  assert.equal(validateObservation({ ...valid, currency: 'XX' }).ok, false)
  assert.equal(validateObservation({ ...valid, currency: null }).ok, false)
  assert.equal(validateObservation({ ...valid, sourceUrl: 'not a url' }).ok, false)
  assert.equal(validateObservation({ ...valid, sourceUrl: 'javascript:alert(1)' }).ok, false)
  assert.equal(validateObservation({ ...valid, observedAt: 'yesterday' }).ok, false)
  assert.equal(validateObservation({ ...valid, source: '' }).ok, false)
  assert.equal(validateObservation({ ...valid, source: undefined }).ok, false)
})

test('unknown conditions normalize to unknown', () => {
  assert.equal(normalizeCondition('???'), 'unknown')
  assert.equal(normalizeCondition(null), 'unknown')
})

test('empty source does not invent data', async () => {
  assert.equal(await emptySecondHandDataSource.getProductData('iphone'), null)
  const products = await getSecondHandProducts()
  for (const p of products) assert.equal(hasMetrics(p.metrics), false, p.slug)
})

test('existing products keep a valid schema with null metrics', () => {
  for (const p of SECOND_HAND_PRODUCTS) {
    assert.ok(SECOND_HAND_CATEGORIES.some((c) => c.slug === p.categorySlug))
    assert.deepEqual(Object.values(p.metrics), Array(8).fill(null))
  }
})

test('null never becomes an artificial price or score', async () => {
  const m = observationToMetrics(null)
  assert.deepEqual(Object.values(m), Array(8).fill(null))
  const r = validateObservation(valid)
  assert.ok(r.ok)
  if (r.ok) {
    const withData = observationToMetrics(r.value)
    assert.equal(withData.score, null)
    assert.equal(withData.trend, null)
    assert.equal(withData.newPrice, null)
    assert.equal(withData.savings, null)
  }
})

test('corrupt or throwing sources yield null metrics', async () => {
  const bad: SecondHandDataSource = { id: 'bad', getProductData: async () => ({ ...valid, price: -1 }) as never }
  const throwing: SecondHandDataSource = { id: 'boom', getProductData: async () => { throw new Error('x') } }
  assert.equal(hasMetrics(await getSecondHandMetrics('iphone', [bad, throwing])), false)
  const good: SecondHandDataSource = { id: 'good', getProductData: async () => validateObservation(valid).ok ? (validateObservation(valid) as never as { value: never }).value : null }
  assert.equal((await getSecondHandMetrics('iphone', [bad, good])).usedPrice, 400)
})
