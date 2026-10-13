import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { EBAY_BROWSE_SOURCE_ENABLED } from '../lib/ebay-browse-adapter'
import {
  EBAY_EPN_CONFIGURED,
  EBAY_ES_ADMITTED_CONDITION_IDS,
  confirmedListingAssociations,
  readEbayListing,
} from '../lib/ebay-listing'
import { visibleEbayListings } from '../lib/ebay-second-hand-gate'
import { hasValidatedMarketplaceId, MARKETPLACE_ID_ALLOWLIST } from '../lib/second-hand-marketplace-id'
import {
  SECOND_HAND_PRODUCT_MAPPINGS,
  mappingDecisionIsExplicit,
  secondHandProductMapping,
} from '../lib/second-hand-product-mapping'
import { SECOND_HAND_PRODUCTS } from '../lib/second-hand'
import {
  EBAY_ES_ITEM_FIELDS_TO_RECORD,
  SECOND_HAND_VARIANT_MAPPINGS,
  SWITCH_OLED_NON_ES_CANDIDATE_EPIDS,
  SWITCH_OLED_PARENT_PRODUCT_ID,
  editorialParentHasNoMarketplaceId,
  epidBelongsToVariant,
  secondHandVariantMapping,
  variantAsPendingMapping,
  variantCanComparePrices,
  variantCatalogIssues,
  variantExternalMapping,
  variantReadingVerdict,
  verifiedVariantProductIds,
} from '../lib/second-hand-variant-catalog'

const WHITE = 'nintendo-switch-oled-blanca'
const NEON = 'nintendo-switch-oled-neon'
const SPLATOON = 'nintendo-switch-oled-splatoon-3'
const WHITE_EPID = '21048307585'
const NEON_EPID = '23048312547'
const OTHER_NEON_EPID = '8048191202'
const OPEN_ALLOWLIST = { providers: ['ebay'], scopes: ['epid'] }

test('oled variants keep their own slugs and leave the editorial switch untouched', () => {
  assert.deepEqual(SECOND_HAND_VARIANT_MAPPINGS.map((variant) => variant.productId), [WHITE, NEON, SPLATOON])
  assert.equal(new Set(SECOND_HAND_VARIANT_MAPPINGS.map((variant) => variant.productId)).size, 3)
  for (const variant of SECOND_HAND_VARIANT_MAPPINGS) {
    assert.deepEqual(variantCatalogIssues(variant), [], variant.productId)
    assert.equal(variant.parentProductId, SWITCH_OLED_PARENT_PRODUCT_ID)
    assert.equal(SECOND_HAND_PRODUCTS.some((product) => product.slug === variant.productId), false)
    assert.equal(secondHandProductMapping(variant.productId), undefined)
    assert.equal(variantCanComparePrices(variant), false)
    assert.equal(variantCanComparePrices(variant, OPEN_ALLOWLIST), false)
    assert.deepEqual(variantExternalMapping(variant, OPEN_ALLOWLIST), {
      productId: variant.productId,
      externalProductId: null,
      verified: false,
    })
    assert.equal(mappingDecisionIsExplicit(variantAsPendingMapping(variant)), false)
  }
  assert.equal(editorialParentHasNoMarketplaceId(), true)
  assert.equal(secondHandProductMapping(SWITCH_OLED_PARENT_PRODUCT_ID)?.marketplaceIdentifier, null)
  assert.equal(secondHandProductMapping(SWITCH_OLED_PARENT_PRODUCT_ID)?.externalProductId, null)
  assert.deepEqual(verifiedVariantProductIds(), [])
  assert.equal(SECOND_HAND_PRODUCT_MAPPINGS.filter((spec) => spec.reviewStatus === 'verified').length, 1)
  assert.equal(SECOND_HAND_PRODUCTS.length, 18)
})

test('a candidate epid stays on one standard variant and never reaches the parent or Splatoon 3', () => {
  const white = secondHandVariantMapping(WHITE)
  const neon = secondHandVariantMapping(NEON)
  const splatoon = secondHandVariantMapping(SPLATOON)
  assert.ok(white && neon && splatoon)
  assert.equal(white.identity.candidateEpid, WHITE_EPID)
  assert.equal(white.identity.mpn, '10007454')
  assert.equal(white.identity.ean, '0045496453435')
  assert.equal(white.marketplaceIdentifier?.status, 'unvalidated')
  assert.equal(white.marketplaceIdentifier?.canonicalValue, WHITE_EPID)
  assert.equal(white.marketplaceIdentifier?.productId, WHITE)
  assert.equal(neon.identity.candidateEpid, NEON_EPID)
  assert.equal(neon.identity.mpn, '10007455')
  assert.equal(neon.identity.ean, '0045496453442')
  assert.equal(neon.marketplaceIdentifier?.canonicalValue, NEON_EPID)
  assert.equal(splatoon.identity.candidateEpid, null)
  assert.equal(splatoon.identity.edition, 'splatoon-3')
  assert.equal(splatoon.marketplaceIdentifier, null)
  assert.equal(splatoon.identity.mpn, null)
  assert.equal(splatoon.identity.ean, null)

  for (const epid of [WHITE_EPID, NEON_EPID, OTHER_NEON_EPID]) {
    assert.equal(epidBelongsToVariant(SWITCH_OLED_PARENT_PRODUCT_ID, epid), false, epid)
    assert.equal(epidBelongsToVariant(SPLATOON, epid), false, epid)
  }
  assert.equal(epidBelongsToVariant(WHITE, WHITE_EPID), true)
  assert.equal(epidBelongsToVariant(NEON, WHITE_EPID), false)
  assert.equal(epidBelongsToVariant(WHITE, NEON_EPID), false)
  assert.equal(epidBelongsToVariant(NEON, NEON_EPID), true)
  assert.equal(epidBelongsToVariant(NEON, OTHER_NEON_EPID), false)
  assert.equal(epidBelongsToVariant(WHITE, OTHER_NEON_EPID), false)
  assert.equal(SWITCH_OLED_NON_ES_CANDIDATE_EPIDS[0]?.epid, OTHER_NEON_EPID)
  assert.equal(white.identity.categoryId, null)
  assert.equal(neon.identity.categoryId, null)
  assert.equal(splatoon.identity.categoryId, null)
})

test('an EBAY_ES detail that repeats the candidate epid still does not validate it', () => {
  const reading = {
    epid: WHITE_EPID,
    marketplaceId: 'EBAY_ES',
    categoryId: 'fixture-category',
    source: 'detail' as const,
  }
  assert.deepEqual(variantReadingVerdict(WHITE, reading), {
    verdict: 'unconfirmed',
    missing: ['validated-marketplace-identifier', 'marketplace-allowlist', 'admitted-condition-ids'],
  })
  assert.deepEqual(variantReadingVerdict(NEON, reading), { verdict: 'mismatch' })
  assert.deepEqual(variantReadingVerdict(SPLATOON, reading), { verdict: 'mismatch' })
  assert.deepEqual(variantReadingVerdict(SWITCH_OLED_PARENT_PRODUCT_ID, reading), { verdict: 'mismatch' })
  assert.deepEqual(variantReadingVerdict(WHITE, { ...reading, source: 'catalog-sheet', categoryId: null }), {
    verdict: 'unconfirmed',
    missing: ['ebay-es-item-detail', 'category-id-from-ebay-es-item', 'validated-marketplace-identifier', 'marketplace-allowlist', 'admitted-condition-ids'],
  })
  assert.deepEqual(variantReadingVerdict(NEON, {
    epid: NEON_EPID,
    marketplaceId: 'EBAY_US',
    categoryId: null,
    source: 'detail',
  }), {
    verdict: 'unconfirmed',
    missing: ['ebay-es-item-detail', 'category-id-from-ebay-es-item', 'validated-marketplace-identifier', 'marketplace-allowlist', 'admitted-condition-ids'],
  })
  assert.deepEqual(variantReadingVerdict(NEON, {
    epid: OTHER_NEON_EPID,
    marketplaceId: 'EBAY_ES',
    categoryId: 'fixture-category',
    source: 'detail',
  }), { verdict: 'mismatch' })

  const white = secondHandVariantMapping(WHITE)
  assert.ok(white?.marketplaceIdentifier)
  assert.equal(hasValidatedMarketplaceId(white.marketplaceIdentifier, {
    productId: WHITE,
    verificationRef: white.verificationRef,
    manufacturerIdentifier: 'HEG-001',
    manufacturer: 'Nintendo Co., Ltd.',
    exactModel: 'Nintendo Switch – Modelo OLED',
    identifies: white.identifies,
  }, OPEN_ALLOWLIST), false)
  assert.deepEqual(verifiedVariantProductIds(), [])
})

test('the publication gate still hides candidate epids and the provider stays off', () => {
  assert.equal(EBAY_BROWSE_SOURCE_ENABLED, false)
  assert.equal(EBAY_EPN_CONFIGURED, false)
  assert.deepEqual([...EBAY_ES_ADMITTED_CONDITION_IDS], [])
  assert.equal(MARKETPLACE_ID_ALLOWLIST.providers.length, 0)
  assert.equal(MARKETPLACE_ID_ALLOWLIST.scopes.length, 0)
  const listing = readEbayListing({
    itemId: 'v1|variant|0',
    legacyItemId: '100000000002',
    epid: WHITE_EPID,
    gtin: '0045496453435',
    price: { value: '250.00', currency: 'EUR' },
    condition: 'Used',
    conditionId: '3000',
    itemWebUrl: 'https://www.ebay.es/itm/100000000002',
    listingMarketplaceId: 'EBAY_ES',
    categoryId: 'fixture-category',
    itemCreationDate: '2026-10-01T00:00:00.000Z',
  }, {
    source: 'detail',
    readAt: '2026-10-13T00:00:00.000Z',
    expectedCategoryId: 'fixture-category',
  })
  assert.equal(listing.association.status, 'unverified')
  assert.equal(listing.association.productId, null)
  assert.ok(listing.association.reasons.includes('no-verified-mapping'))
  assert.deepEqual(confirmedListingAssociations([listing], SWITCH_OLED_PARENT_PRODUCT_ID), [])
  assert.deepEqual(confirmedListingAssociations([listing], WHITE), [])
  assert.deepEqual(visibleEbayListings(WHITE, [listing], Date.parse('2026-10-13T00:00:00.000Z')), [])
  assert.deepEqual(visibleEbayListings(SWITCH_OLED_PARENT_PRODUCT_ID, [listing], Date.parse('2026-10-13T00:00:00.000Z')), [])

  const mappingSource = readFileSync(new URL('../lib/second-hand-product-mapping.ts', import.meta.url), 'utf8')
  assert.equal(mappingSource.includes(WHITE_EPID), false)
  assert.equal(mappingSource.includes(NEON_EPID), false)
  assert.equal(mappingSource.includes(OTHER_NEON_EPID), false)
  const catalogSource = readFileSync(new URL('../lib/second-hand-variant-catalog.ts', import.meta.url), 'utf8')
  assert.doesNotMatch(catalogSource, /\bfetch\s*\(|process\.env|api\.ebay\.com|campid|EBAY_BROWSE_SOURCE_ENABLED = true/)
  assert.deepEqual([...EBAY_ES_ITEM_FIELDS_TO_RECORD], [
    'itemId',
    'legacyItemId',
    'epid',
    'listingMarketplaceId',
    'categoryId',
    'gtin',
    'mpn',
    'conditionId',
    'price',
    'currency',
    'itemWebUrl',
    'itemCreationDate',
    'readAt',
  ])
})
