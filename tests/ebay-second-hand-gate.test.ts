import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import * as React from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { EBAY_BROWSE_SOURCE_ENABLED, EBAY_LISTING_MAX_AGE_MS } from '../lib/ebay-browse-adapter'
import { EBAY_EPN_CONFIGURED, EBAY_ES_ADMITTED_CONDITION_IDS, EBAY_LISTING_DISCLOSURE, readEbayListing, listingFromEpidCandidate } from '../lib/ebay-listing'
import {
  catalogProductsWithValidatedMarketplaceId,
  ebayPublicationBlockers,
  visibleEbayListings,
  type EbayListingPublicationPolicy,
} from '../lib/ebay-second-hand-gate'
import { EMPTY_METRICS, SECOND_HAND_PENDING_COPY, SECOND_HAND_PRODUCTS } from '../lib/second-hand'
import { getSecondHandProducts } from '../lib/second-hand-data'
import {
  SECOND_HAND_PRODUCT_MAPPINGS,
  type SecondHandProductMapping,
  type SecondHandRecordedVerification,
} from '../lib/second-hand-product-mapping'
import type { SecondHandMarketplaceIdAllowlist, SecondHandMarketplaceIdentifier } from '../lib/second-hand-marketplace-id'

const READ_AT = '2026-10-13T12:00:00.000Z'
const NOW = Date.parse(READ_AT)
const OPEN_POLICY: EbayListingPublicationPolicy = {
  providerEnabled: true,
  admittedConditionIds: [3000],
  epnConfigured: true,
}
const FIXTURE_ALLOWLIST: SecondHandMarketplaceIdAllowlist = {
  providers: ['fixture-marketplace'],
  scopes: ['fixture-scope'],
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

function fixtureMapping(): SecondHandProductMapping {
  const identifier: Extract<SecondHandMarketplaceIdentifier, { status: 'validated' }> = {
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
  return {
    productId: 'fixture-product',
    scope: 'family',
    identifies: 'Modelo de prueba único',
    attributes: [
      { key: 'brand', label: 'Fabricante', value: 'Fabricante de prueba', requiredForComparison: true },
      { key: 'model', label: 'Modelo', value: 'Modelo de prueba único', requiredForComparison: true },
    ],
    reviewStatus: 'verified',
    externalProductId: null,
    marketplaceIdentifier: identifier,
    verificationRef: 'fixture-review',
    recordedVerification: recordedVerification(),
    decisionNote: 'Fixture sintético. No es un producto del catálogo.',
    decisionSourceUrl: null,
    reviewPriority: null,
  }
}

function verifiedListing(overrides: Record<string, unknown> = {}) {
  return readEbayListing({
    itemId: 'v1|fixture|0',
    legacyItemId: '100000000001',
    epid: 'fixture-market-id',
    price: { value: '1.25', currency: 'EUR' },
    condition: 'Used',
    conditionId: '3000',
    conditionDescription: 'Texto de condición del anuncio',
    itemWebUrl: 'https://www.ebay.es/itm/100000000001',
    listingMarketplaceId: 'EBAY_ES',
    categoryId: 'fixture-category',
    gtin: '12345678',
    itemCreationDate: '2026-10-01T00:00:00.000Z',
    ...overrides,
  }, {
    source: 'detail',
    readAt: READ_AT,
    expectedCategoryId: 'fixture-category',
    mappings: [fixtureMapping()],
    allowlist: FIXTURE_ALLOWLIST,
  })
}

test('nintendo-switch is the only identity-verified product and still has no marketplace id', () => {
  const verified = SECOND_HAND_PRODUCT_MAPPINGS.filter((mapping) => mapping.reviewStatus === 'verified')
  assert.deepEqual(verified.map((mapping) => mapping.productId), ['nintendo-switch'])
  assert.equal(verified[0].externalProductId, null)
  assert.equal(verified[0].marketplaceIdentifier, null)
  assert.deepEqual(catalogProductsWithValidatedMarketplaceId(), [])
  assert.deepEqual(ebayPublicationBlockers('nintendo-switch'), [
    'provider-disabled',
    'ebay-es-condition-policy-unapproved',
    'epn-not-configured',
    'marketplace-id-not-validated',
  ])
  const mappingSource = readFileSync(new URL('../lib/second-hand-product-mapping.ts', import.meta.url), 'utf8')
  assert.equal(mappingSource.includes('21048307585'), false)
  assert.equal(mappingSource.includes('23048312547'), false)
  assert.equal(EBAY_BROWSE_SOURCE_ENABLED, false)
  assert.equal(EBAY_EPN_CONFIGURED, false)
  assert.deepEqual([...EBAY_ES_ADMITTED_CONDITION_IDS], [])
})

test('the production gate hides every listing, including a verified fixture', () => {
  const listing = verifiedListing()
  assert.equal(listing.association.status, 'verified')
  assert.deepEqual(visibleEbayListings('fixture-product', [listing], NOW), [])
  assert.deepEqual(visibleEbayListings('nintendo-switch', [listing], NOW), [])
  assert.deepEqual(visibleEbayListings('fixture-product', [], NOW, OPEN_POLICY), [])
})

test('an open policy shows only a fresh verified listing with an admitted condition', () => {
  const listing = verifiedListing()
  assert.deepEqual(visibleEbayListings('fixture-product', [listing], NOW, OPEN_POLICY), [listing])
  assert.deepEqual(visibleEbayListings('nintendo-switch', [listing], NOW, OPEN_POLICY), [])
  assert.deepEqual(visibleEbayListings('fixture-product', [listingFromEpidCandidate({ itemId: 'v1|fixture|0' })], NOW, OPEN_POLICY), [])
  assert.deepEqual(visibleEbayListings('fixture-product', [verifiedListing({ conditionId: '1000' })], NOW, OPEN_POLICY), [])
  const stale = verifiedListing()
  assert.deepEqual(visibleEbayListings('fixture-product', [stale], NOW + EBAY_LISTING_MAX_AGE_MS + 1, OPEN_POLICY), [])
  const affiliate = verifiedListing({ itemWebUrl: 'https://www.ebay.es/itm/100000000001?campid=1234567890' })
  assert.equal(affiliate.itemWebUrl, null)
  assert.deepEqual(visibleEbayListings('fixture-product', [affiliate], NOW, OPEN_POLICY), [])
  const expiredReadAt = stale.readAt
  assert.equal(expiredReadAt, READ_AT)
  assert.deepEqual(visibleEbayListings('fixture-product', [{ ...stale, readAt: expiredReadAt }], NOW + EBAY_LISTING_MAX_AGE_MS + 1, OPEN_POLICY), [])
})

test('segunda mano stays priceless when a verified fixture is offered to the card', async () => {
  ;(globalThis as { React?: typeof React }).React = React
  const { default: ProductCard, EbayListingLinks } = await import('../components/second-hand/ProductCard')
  const product = SECOND_HAND_PRODUCTS.find((item) => item.slug === 'nintendo-switch')
  assert.ok(product)
  const withFixture = { ...product, metrics: EMPTY_METRICS }
  const markup = renderToStaticMarkup(React.createElement(ProductCard, {
    product: withFixture,
    listings: [verifiedListing()],
    now: NOW,
  }))
  assert.match(markup, new RegExp(SECOND_HAND_PENDING_COPY))
  assert.doesNotMatch(markup, /ebay\.es|1\.25|campid|fixture-market-id/)
  assert.doesNotMatch(markup, new RegExp(EBAY_LISTING_DISCLOSURE))

  const open = verifiedListing()
  const visible = visibleEbayListings('fixture-product', [open], NOW, OPEN_POLICY)
  const links = renderToStaticMarkup(React.createElement(EbayListingLinks, { listings: visible }))
  assert.match(links, /https:\/\/www\.ebay\.es\/itm\/100000000001/)
  assert.match(links, /1\.25 EUR/)
  assert.match(links, new RegExp(EBAY_LISTING_DISCLOSURE))
  assert.doesNotMatch(links, /campid|nofollow noopener noreferrer" target="_blank"><\/a>/)
  assert.match(links, /rel="nofollow noopener noreferrer"/)

  const products = await getSecondHandProducts()
  for (const item of products) assert.equal(item.metrics.usedPrice, null, item.slug)
  for (const file of ['page.tsx', '[categoria]/page.tsx']) {
    const source = readFileSync(new URL(`../app/segunda-mano/${file}`, import.meta.url), 'utf8')
    assert.match(source, /getSecondHandProducts\(\)/, file)
    assert.doesNotMatch(source, /fetch\s*\(|api\.ebay\.com|searchByEpid|getItem/, file)
  }
  const gate = readFileSync(new URL('../lib/ebay-second-hand-gate.ts', import.meta.url), 'utf8')
  const code = gate.replace(/\/\*[\s\S]*?\*\//g, '').replace(/\/\/.*$/gm, '')
  assert.doesNotMatch(code, /\bfetch\s*\(|process\.env|searchByEpid|getItem\(/)
})
