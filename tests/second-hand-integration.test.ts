import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import * as React from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import {
  EMPTY_METRICS, SECOND_HAND_CATEGORIES, SECOND_HAND_PENDING_COPY, SECOND_HAND_PRODUCTS,
  secondHandMetricRows, secondHandProductsByCategory, secondHandWatchlist, type SecondHandMetrics,
} from '../lib/second-hand'
import {
  emptySecondHandDataSource, getSecondHandProducts, validateObservation, type SecondHandDataSource,
} from '../lib/second-hand-data'
import { listingsForSecondHandProduct } from '../lib/second-hand-page-listings'
import { secondHandGraph } from '../lib/structured-data'

const METRIC_KEYS = ['score', 'trend', 'newPrice', 'usedPrice', 'savings', 'currency', 'source', 'updatedAt'] as const

const mockObservation = {
  productId: 'iphone',
  price: 420,
  currency: 'EUR',
  condition: 'good',
  source: 'test-mock',
  sourceUrl: 'https://example.test/mock/iphone',
  observedAt: '2026-10-01T00:00:00Z',
  referencePrice: 900,
}

function mockSource(): SecondHandDataSource {
  return {
    id: 'test-mock',
    async getProductData(productId) {
      if (productId !== 'iphone') return null
      const result = validateObservation(mockObservation)
      return result.ok ? result.value : null
    },
  }
}

async function factsHtml(metrics: SecondHandMetrics) {
  ;(globalThis as { React?: typeof React }).React = React
  const { default: ProductFacts } = await import('../components/second-hand/ProductFacts')
  return renderToStaticMarkup(React.createElement(ProductFacts, { metrics }))
}

function pageSource(name: string) {
  return readFileSync(new URL(`../app/segunda-mano/${name}`, import.meta.url), 'utf8')
}

test('segunda-mano pages load products through getSecondHandProducts()', () => {
  for (const file of ['page.tsx', '[categoria]/page.tsx']) {
    const source = pageSource(file)
    assert.match(source, /getSecondHandProducts\(\)/, file)
    assert.doesNotMatch(source, /getSecondHandMetrics\(/, file)
    assert.doesNotMatch(source, /usedPrice:\s*\d/, file)
  }
  const hub = pageSource('page.tsx')
  assert.match(hub, /secondHandProductsByCategory\(c\.slug, products\)/)
  assert.match(hub, /secondHandWatchlist\(products\)/)
  const category = pageSource('[categoria]/page.tsx')
  assert.match(category, /secondHandProductsByCategory\(category\.slug, await getSecondHandProducts\(\)\)/)
  assert.match(hub, /listingsForSecondHandRoute\(product\.slug, now, ebayConfig\)/)
  assert.match(category, /listingsForSecondHandRoute\(product\.slug, now, ebayConfig\)/)
  assert.match(hub, /policy=\{listingPolicy\}/)
  assert.match(category, /policy=\{listingPolicy\}/)
  const gaming = SECOND_HAND_PRODUCTS.find((product) => product.slug === 'nintendo-switch')
  assert.match(gaming?.summary ?? '', /OLED/)
  assert.match(gaming?.summary ?? '', /HEG-001/)
  assert.doesNotMatch(gaming?.summary ?? '', /21048307585|23048312547/)
})

test('published pages receive no listing while the gate is closed', () => {
  assert.deepEqual(listingsForSecondHandProduct('nintendo-switch'), [])
  assert.deepEqual(listingsForSecondHandProduct('playstation-5'), [])
})

test('categories keep the same products when resolved from the data layer', async () => {
  const products = await getSecondHandProducts()
  assert.equal(products.length, SECOND_HAND_PRODUCTS.length)
  assert.deepEqual(products.map((p) => p.slug), SECOND_HAND_PRODUCTS.map((p) => p.slug))
  for (const category of SECOND_HAND_CATEGORIES) {
    const resolved = secondHandProductsByCategory(category.slug, products)
    const catalog = secondHandProductsByCategory(category.slug)
    assert.deepEqual(resolved.map((p) => p.slug), catalog.map((p) => p.slug), category.slug)
    assert.ok(resolved.length > 0, category.slug)
  }
  assert.deepEqual(secondHandWatchlist(products).map((p) => p.slug), secondHandWatchlist().map((p) => p.slug))
})

test('empty source keeps every metric null and the UI shows no prices', async () => {
  assert.equal(emptySecondHandDataSource.id, 'empty')
  const products = await getSecondHandProducts()
  for (const product of products) {
    for (const key of METRIC_KEYS) assert.equal(product.metrics[key], null, `${product.slug}.${key}`)
    assert.deepEqual(product.metrics, EMPTY_METRICS)
    assert.deepEqual(secondHandMetricRows(product.metrics), [])
    const markup = await factsHtml(product.metrics)
    assert.match(markup, new RegExp(SECOND_HAND_PENDING_COPY))
    assert.doesNotMatch(markup, /undefined|NaN|\bnull\b|€\s*0|(?:^|\D)0(?:[.,]0+)?(?:\s|\u00a0)*€|%/)
  }
})

test('a test mock source reaches the UI without inventing score or trend', async () => {
  const products = await getSecondHandProducts([mockSource()])
  const iphone = products.find((p) => p.slug === 'iphone')
  assert.ok(iphone)
  assert.equal(iphone.metrics.usedPrice, 420)
  assert.equal(iphone.metrics.newPrice, 900)
  assert.equal(iphone.metrics.savings, 480)
  assert.equal(iphone.metrics.currency, 'EUR')
  assert.equal(iphone.metrics.source, 'test-mock')
  assert.equal(iphone.metrics.updatedAt, '2026-10-01T00:00:00.000Z')
  assert.equal(iphone.metrics.score, null)
  assert.equal(iphone.metrics.trend, null)

  const markup = await factsHtml(iphone.metrics)
  assert.match(markup, /Precio usado/)
  assert.match(markup, /420/)
  assert.match(markup, /Precio nuevo/)
  assert.match(markup, /900/)
  assert.match(markup, /Ahorro/)
  assert.match(markup, /480/)
  assert.match(markup, /Moneda/)
  assert.match(markup, />EUR</)
  assert.match(markup, /Fuente/)
  assert.match(markup, /test-mock/)
  assert.match(markup, /Actualizado/)
  assert.match(markup, /2026/)
  assert.doesNotMatch(markup, /%|undefined|NaN|\bnull\b/)

  for (const product of products) {
    if (product.slug === 'iphone') continue
    assert.deepEqual(product.metrics, EMPTY_METRICS, product.slug)
  }
})

test('an invalid observation is discarded and does not reach the UI', async () => {
  const invalid: SecondHandDataSource = {
    id: 'test-invalid',
    async getProductData(productId) {
      return { ...mockObservation, productId, price: 0, currency: 'EUR', source: 'test-invalid', sourceUrl: 'https://example.test/bad', observedAt: '2026-10-01T00:00:00Z' } as never
    },
  }
  const products = await getSecondHandProducts([invalid])
  for (const product of products) {
    assert.deepEqual(product.metrics, EMPTY_METRICS, product.slug)
    const markup = await factsHtml(product.metrics)
    assert.match(markup, new RegExp(SECOND_HAND_PENDING_COPY))
    assert.doesNotMatch(markup, /test-invalid|undefined|NaN/)
  }
})

test('a mismatched product id is not applied to another product', async () => {
  const leaked: SecondHandDataSource = {
    id: 'test-mock',
    async getProductData() {
      const result = validateObservation(mockObservation)
      return result.ok ? result.value : null
    },
  }
  const products = await getSecondHandProducts([leaked])
  assert.equal(products.find((p) => p.slug === 'iphone')?.metrics.usedPrice, 420)
  assert.equal(products.find((p) => p.slug === 'macbook')?.metrics.usedPrice, null)
})

test('second-hand structured data stays editorial and priceless', () => {
  for (const category of [undefined, ...SECOND_HAND_CATEGORIES]) {
    const json = JSON.stringify(secondHandGraph(category))
    assert.equal(json.includes('"price"'), false)
    assert.equal(json.includes('Offer'), false)
    assert.match(json, category ? new RegExp(`/segunda-mano/${category.slug}`) : /\/segunda-mano/)
  }
})
