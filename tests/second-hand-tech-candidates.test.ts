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
    assert.equal(spec.externalProductId, null, slug)
    assert.equal(canComparePrices(spec), false, slug)
    if (slug === 'nintendo-switch') {
      assert.equal(spec.reviewStatus, 'verified')
    } else {
      assert.equal(spec.reviewStatus, 'pending', slug)
      for (const attribute of spec.attributes) assert.equal(attribute.value, null, slug)
    }
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
    if (spec.productId !== 'nintendo-switch') assert.equal(spec.reviewStatus, 'pending', spec.productId)
    assert.equal(canComparePrices(spec), false, spec.productId)
  }
})

test('specific tech candidates stay descriptive and do not become a closed sku', () => {
  const macbook = techCandidatesFor('macbook')
  assert.match(macbook.map((item) => item.configuration).join(' '), /no es un único SKU|No hay un código de pedido único/)
  const watch = techCandidatesFor('apple-watch').map((item) => item.configuration).join(' ')
  assert.match(watch, /no como capacidad de esa altura/)
  assert.match(watch, /No publica un identificador de modelo/)
  for (const item of techCandidatesFor('samsung-galaxy')) {
    assert.match(item.sourceUrl, /^https:\/\/www\.samsung\.com\/es\//)
    assert.match(item.configuration, /ficha de España/)
  }
  const playstation = techCandidatesFor('playstation-5').map((item) => item.configuration).join(' ')
  assert.match(playstation, /No asigna un código CFI/)
  const xboxItems = techCandidatesFor('xbox')
  assert.deepEqual(xboxItems.map((item) => item.generation), ['Series X', 'Series X', 'Series S'])
  const carbon = xboxItems.find((item) => item.name.includes('negro carbón'))
  const digital = xboxItems.find((item) => item.name.includes('edición digital'))
  const seriesS = xboxItems.find((item) => item.generation === 'Series S')
  assert.ok(carbon)
  assert.ok(digital)
  assert.ok(seriesS)
  assert.notEqual(carbon.name, digital.name)
  assert.notEqual(digital.generation, seriesS.generation)
  assert.match(carbon.configuration, /4K UHD Blu-Ray/)
  assert.match(carbon.configuration, /No publica un código de modelo/)
  assert.match(digital.configuration, /No hay un código de modelo/)
  assert.match(digital.configuration, /Robot White/)
  assert.match(digital.configuration, /no pone el color/)
  assert.match(seriesS.configuration, /512 GB/)
  assert.match(seriesS.configuration, /1 TB/)
  assert.match(seriesS.sourceUrl, /^https:\/\/www\.xbox\.com\/es-ES\/consoles\/xbox-series-s$/)
  for (const item of xboxItems) {
    assert.match(item.sourceUrl, /^https:\/\/www\.xbox\.com\/es-ES\/consoles\/xbox-series-[xs]$/)
    assert.equal(item.reviewStatus, 'pending')
    assert.equal(item.externalProductId, null)
  }
  const xboxGap = SECOND_HAND_TECH_CANDIDATE_GAPS.find((gap) => gap.productId === 'xbox')
  assert.match(xboxGap?.missing ?? '', /Galaxy Black/)
  assert.match(xboxGap?.missing ?? '', /no tiene un código de modelo/)
  const hac = techCandidatesFor('nintendo-switch').find((item) => item.name.includes('HAC-001(-01)'))
  assert.ok(hac)
  assert.match(hac.configuration, /no cubre una HAC-001 anterior/)
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
