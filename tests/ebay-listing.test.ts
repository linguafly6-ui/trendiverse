import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { EBAY_BROWSE_SOURCE_ENABLED, EBAY_LISTING_MAX_AGE_MS } from '../lib/ebay-browse-adapter'
import {
  EBAY_EPN_CONFIGURED,
  EBAY_ES_ADMITTED_CONDITION_IDS,
  EBAY_LISTING_DISCLOSURE,
  confirmedListingAssociations,
  createEbayListingCache,
  detailReadingForCandidate,
  applyBrowseAffiliateUrl,
  ebayListingPublishable,
  listingFromEpidCandidate,
  readEbayEpnCampaignId,
  partitionEbayListings,
  readEbayListing,
} from '../lib/ebay-listing'
import { hasMetrics } from '../lib/second-hand'
import { getSecondHandProducts } from '../lib/second-hand-data'
import {
  SECOND_HAND_PRODUCT_MAPPINGS,
  type SecondHandProductMapping,
  type SecondHandRecordedVerification,
} from '../lib/second-hand-product-mapping'
import type { SecondHandMarketplaceIdAllowlist, SecondHandMarketplaceIdentifier } from '../lib/second-hand-marketplace-id'

const READ_AT = '2026-10-13T12:00:00.000Z'
const NOW = Date.parse(READ_AT)
const FIXTURE_ALLOWLIST: SecondHandMarketplaceIdAllowlist = {
  providers: ['fixture-marketplace'],
  scopes: ['fixture-scope'],
}
const EXPECTED_CATEGORY = 'fixture-category'

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

function validatedId(canonicalValue = 'fixture-market-id'): Extract<SecondHandMarketplaceIdentifier, { status: 'validated' }> {
  return {
    status: 'validated',
    provider: 'fixture-marketplace',
    scope: 'fixture-scope',
    canonicalValue,
    productId: 'fixture-product',
    verifiedProductRef: 'fixture-review',
    provenance: 'Registro sintético de prueba, sin proveedor real.',
    validationMethod: 'fixture-contract',
    auditRef: 'fixture-audit-1',
  }
}

function fixtureMapping(canonicalValue = 'fixture-market-id'): SecondHandProductMapping {
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
    marketplaceIdentifier: validatedId(canonicalValue),
    verificationRef: 'fixture-review',
    recordedVerification: recordedVerification(),
    decisionNote: 'Fixture sintético. No es un producto del catálogo.',
    decisionSourceUrl: null,
    reviewPriority: null,
  }
}

function detailBody(overrides: Record<string, unknown> = {}): Record<string, unknown> {
  return {
    itemId: 'v1|fixture|0',
    legacyItemId: '100000000001',
    epid: 'fixture-market-id',
    price: { value: '1.25', currency: 'EUR' },
    condition: 'Used',
    conditionId: '3000',
    conditionDescription: 'Texto de condición del anuncio',
    itemWebUrl: 'https://www.ebay.es/itm/100000000001',
    listingMarketplaceId: 'EBAY_ES',
    categoryId: EXPECTED_CATEGORY,
    gtin: '12345678',
    itemCreationDate: '2026-10-01T00:00:00.000Z',
    ...overrides,
  }
}

function readDetail(body: unknown, overrides: Partial<Parameters<typeof readEbayListing>[1]> = {}) {
  return readEbayListing(body, {
    source: 'detail',
    readAt: READ_AT,
    expectedCategoryId: EXPECTED_CATEGORY,
    mappings: [fixtureMapping()],
    allowlist: FIXTURE_ALLOWLIST,
    ...overrides,
  })
}

test('an epid search candidate is not a verified product association', () => {
  const candidate = listingFromEpidCandidate({ itemId: 'v1|fixture|0', price: { value: '9.99', currency: 'EUR' } }, READ_AT)
  assert.equal(candidate.association.status, 'candidate')
  assert.equal(candidate.association.productId, null)
  assert.deepEqual(candidate.association.reasons, ['search-candidate'])
  assert.equal(candidate.price, null)
  assert.equal(candidate.productIdentifiers.epid, null)
  assert.equal(candidate.itemWebUrl, null)
  assert.equal(candidate.monetized, false)
  assert.deepEqual(detailReadingForCandidate(candidate), { itemId: 'v1|fixture|0' })
  assert.deepEqual(confirmedListingAssociations([candidate]), [])
})

test('a search summary keeps present fields and still does not verify the product', () => {
  const listing = readEbayListing(detailBody(), {
    source: 'search-summary',
    readAt: READ_AT,
    queriedEpid: 'fixture-market-id',
    expectedCategoryId: EXPECTED_CATEGORY,
    mappings: [fixtureMapping()],
    allowlist: FIXTURE_ALLOWLIST,
  })
  assert.equal(listing.association.status, 'candidate')
  assert.equal(listing.association.productId, null)
  assert.deepEqual(listing.association.reasons, ['search-does-not-verify'])
  assert.deepEqual(listing.price, { value: '1.25', currency: 'EUR' })
  assert.equal(listing.productIdentifiers.epid, 'fixture-market-id')
  assert.equal(listing.condition, 'Used')
  assert.equal(listing.originalCondition, 'Texto de condición del anuncio')
  assert.deepEqual(confirmedListingAssociations([listing]), [])
  assert.deepEqual(detailReadingForCandidate(listing), { itemId: 'v1|fixture|0' })
})

test('a detail reading verifies only when the body epid matches one allowed mapping and the category', () => {
  const snapshot = JSON.stringify(SECOND_HAND_PRODUCT_MAPPINGS)
  const listing = readDetail(detailBody())
  assert.equal(listing.association.status, 'verified')
  assert.equal(listing.association.productId, 'fixture-product')
  assert.deepEqual(listing.association.reasons, [])
  assert.equal(listing.marketplaceId, 'EBAY_ES')
  assert.equal(listing.categoryId, EXPECTED_CATEGORY)
  assert.equal(listing.readAt, READ_AT)
  assert.equal(listing.itemCreationDate, '2026-10-01T00:00:00.000Z')
  assert.deepEqual(listing.productIdentifiers, { epid: 'fixture-market-id', gtin: '12345678' })
  assert.equal(listing.itemWebUrl, 'https://www.ebay.es/itm/100000000001')
  assert.equal(listing.monetized, false)
  assert.equal(ebayListingPublishable(listing, NOW), false)
  assert.equal(JSON.stringify(SECOND_HAND_PRODUCT_MAPPINGS), snapshot)
  assert.equal(SECOND_HAND_PRODUCT_MAPPINGS.some((spec) => spec.productId === 'fixture-product'), false)
})

test('the catalog and the empty allowlist leave a complete detail unverified', () => {
  const listing = readEbayListing(detailBody({ epid: 'fixture-market-id' }), {
    source: 'detail',
    readAt: READ_AT,
    expectedCategoryId: EXPECTED_CATEGORY,
  })
  assert.equal(listing.association.status, 'unverified')
  assert.equal(listing.association.productId, null)
  assert.ok(listing.association.reasons.includes('no-verified-mapping'))
  assert.deepEqual(confirmedListingAssociations([listing], 'nintendo-switch'), [])
})

test('a manufacturer code is not a verified marketplace association', () => {
  const listing = readDetail(detailBody({ epid: 'HEG-001' }), { mappings: SECOND_HAND_PRODUCT_MAPPINGS, allowlist: undefined })
  assert.equal(listing.association.status, 'unverified')
  assert.equal(listing.productIdentifiers.epid, 'HEG-001')
  assert.ok(listing.association.reasons.includes('no-verified-mapping'))
  assert.notEqual(listing.association.productId, 'nintendo-switch')
})

test('variants, missing identifiers, incompatible categories and incomplete bodies stay unconfirmed', () => {
  const variant = readDetail(detailBody({ epid: 'fixture-other-id' }), { queriedEpid: 'fixture-market-id' })
  assert.equal(variant.association.status, 'unverified')
  assert.ok(variant.association.reasons.includes('variant-epid'))
  assert.equal(variant.association.productId, null)

  const missingEpid = readDetail(detailBody({ epid: undefined, gtin: '12345670' }))
  assert.equal(missingEpid.productIdentifiers.epid, null)
  assert.equal(missingEpid.productIdentifiers.gtin, '12345670')
  assert.ok(missingEpid.association.reasons.includes('missing-epid'))
  assert.ok(missingEpid.association.reasons.includes('gtin-does-not-verify'))

  const listingIdAsEpid = readDetail(detailBody({ epid: 'v1|fixture|0' }))
  assert.equal(listingIdAsEpid.productIdentifiers.epid, null)
  assert.ok(listingIdAsEpid.association.reasons.includes('listing-id-is-not-a-product-id'))

  const incompatible = readDetail(detailBody({ categoryId: 'other-category' }))
  assert.ok(incompatible.association.reasons.includes('incompatible-category'))
  assert.equal(incompatible.association.status, 'unverified')

  const missingCategory = readDetail(detailBody({ categoryId: undefined }))
  assert.equal(missingCategory.categoryId, null)
  assert.ok(missingCategory.association.reasons.includes('missing-category'))

  const unrecordedCategory = readDetail(detailBody(), { expectedCategoryId: null })
  assert.ok(unrecordedCategory.association.reasons.includes('category-not-recorded'))

  const otherMarket = readDetail(detailBody({ listingMarketplaceId: 'EBAY_US' }))
  assert.ok(otherMarket.association.reasons.includes('marketplace-mismatch'))

  const incomplete = readEbayListing(null, { source: 'detail', readAt: READ_AT })
  assert.equal(incomplete.association.status, 'unverified')
  assert.deepEqual(incomplete.association.reasons, ['incomplete-item'])
  assert.equal(incomplete.price, null)
  assert.equal(incomplete.condition, null)

  const partialPrice = readDetail(detailBody({ price: { value: '1.25' } }))
  assert.equal(partialPrice.price, null)
  assert.equal(partialPrice.condition, 'Used')
  assert.equal(partialPrice.originalCondition, 'Texto de condición del anuncio')

  const ambiguous = readDetail(detailBody(), { mappings: [fixtureMapping(), fixtureMapping()] })
  assert.ok(ambiguous.association.reasons.includes('ambiguous-mapping'))

  const partitioned = partitionEbayListings([
    listingFromEpidCandidate({ itemId: 'v1|candidate|0' }),
    variant,
    incomplete,
    readDetail(detailBody()),
  ])
  assert.equal(partitioned.candidates.length, 1)
  assert.equal(partitioned.verified.length, 1)
  assert.equal(partitioned.verified[0].association.productId, 'fixture-product')
  assert.equal(partitioned.unverified.length, 2)
  assert.deepEqual(confirmedListingAssociations(partitioned.candidates.concat(partitioned.unverified, partitioned.verified)), partitioned.verified)
})

test('absent fields stay null and unsafe or affiliate urls are not stored', () => {
  const absent = readDetail({
    itemId: 'v1|fixture|0',
    price: { value: '0', currency: 'EUR' },
    condition: '   ',
    itemWebUrl: 'http://www.ebay.es/itm/100000000001',
  })
  assert.equal(absent.price, null)
  assert.equal(absent.condition, null)
  assert.equal(absent.originalCondition, null)
  assert.equal(absent.itemWebUrl, null)
  assert.equal(absent.urlDiscarded, 'unsafe')
  assert.equal(absent.legacyItemId, null)
  assert.equal(absent.itemCreationDate, null)

  const affiliate = readDetail(detailBody({
    itemWebUrl: 'https://www.ebay.es/itm/100000000001?campid=1234567890',
    itemAffiliateWebUrl: 'https://www.ebay.es/itm/100000000001?campid=1234567890',
  }))
  assert.equal(affiliate.itemWebUrl, null)
  assert.equal(affiliate.urlDiscarded, 'affiliate')
  assert.equal(JSON.stringify(affiliate).includes('campid'), false)
  assert.equal(affiliate.monetized, false)

  const cleanBesideAffiliate = readDetail(detailBody({
    itemAffiliateWebUrl: 'https://www.ebay.es/itm/100000000001?campid=1234567890',
  }))
  assert.equal(cleanBesideAffiliate.itemWebUrl, 'https://www.ebay.es/itm/100000000001')
  assert.equal(JSON.stringify(cleanBesideAffiliate).includes('campid'), false)

  const catalogPage = readDetail(detailBody({ itemWebUrl: 'https://www.ebay.es/p/fixture-market-id' }))
  assert.equal(catalogPage.itemWebUrl, null)
  assert.equal(catalogPage.urlDiscarded, 'unsafe')
})

test('the cache expires after six hours and a failed refresh does not extend it', () => {
  const cache = createEbayListingCache()
  const listing = readDetail(detailBody())
  assert.equal(cache.remember(listing, NOW), 'stored')
  assert.equal(cache.read(listing.itemId ?? '', NOW + EBAY_LISTING_MAX_AGE_MS).status, 'hit')
  const before = cache.noteRefreshFailure(listing.itemId ?? '')
  const after = cache.noteRefreshFailure(listing.itemId ?? '')
  assert.equal(before.extended, false)
  assert.equal(after.extended, false)
  assert.equal(before.expiresAt, after.expiresAt)
  assert.equal(cache.read(listing.itemId ?? '', NOW + EBAY_LISTING_MAX_AGE_MS).status, 'hit')
  assert.equal(cache.read(listing.itemId ?? '', NOW + EBAY_LISTING_MAX_AGE_MS + 1).status, 'expired')

  assert.equal(cache.rememberEmpty('epid:fixture-market-id', NOW), 'stored')
  assert.equal(cache.readEmpty('epid:fixture-market-id', NOW).status, 'empty')
  assert.equal(cache.readEmpty('epid:fixture-market-id', NOW + EBAY_LISTING_MAX_AGE_MS + 1).status, 'expired')
  assert.equal(cache.read('missing', NOW).status, 'miss')
  assert.equal(cache.remember(readDetail(detailBody({ itemId: undefined })), NOW), 'ignored')
})

test('listings stay out of segunda mano while the provider, conditions and EPN are closed', async () => {
  const source = readFileSync(new URL('../lib/ebay-listing.ts', import.meta.url), 'utf8')
  const code = source.replace(/\/\*[\s\S]*?\*\//g, '').replace(/\/\/.*$/gm, '')
  assert.equal(EBAY_BROWSE_SOURCE_ENABLED, false)
  assert.equal(EBAY_EPN_CONFIGURED, false)
  assert.deepEqual(EBAY_ES_ADMITTED_CONDITION_IDS, [])
  assert.match(EBAY_LISTING_DISCLOSURE, /no cobra comisión/)
  assert.doesNotMatch(code, /\bfetch\s*\(|process\.env|setInterval|setTimeout|21048307585|267728620693|144768405655/)
  assert.equal(source.includes('export const EBAY_ES_ADMITTED_CONDITION_IDS: readonly number[] = []'), true)
  const products = await getSecondHandProducts()
  for (const product of products) {
    assert.equal(hasMetrics(product.metrics), false, product.slug)
    assert.equal(product.metrics.usedPrice, null)
  }
  const verified = readDetail(detailBody())
  assert.equal(ebayListingPublishable(verified, NOW), false)
  assert.equal(confirmedListingAssociations([verified], 'nintendo-switch').length, 0)
})

test('a campaign id is ten digits and never a boolean default', () => {
  assert.equal(readEbayEpnCampaignId(undefined).status, 'absent')
  assert.equal(readEbayEpnCampaignId(null).status, 'absent')
  assert.equal(readEbayEpnCampaignId('').status, 'absent')
  assert.equal(readEbayEpnCampaignId(false).status, 'invalid')
  assert.equal(readEbayEpnCampaignId(true).status, 'invalid')
  assert.equal(readEbayEpnCampaignId('true').status, 'invalid')
  assert.equal(readEbayEpnCampaignId('123456789').status, 'invalid')
  assert.equal(readEbayEpnCampaignId('12345678901').status, 'invalid')
  assert.equal(readEbayEpnCampaignId('1234567890 ').status, 'invalid')
  assert.deepEqual(readEbayEpnCampaignId('1234567890'), { status: 'ok', campaignId: '1234567890' })
  const plain = readDetail(detailBody())
  const untouched = applyBrowseAffiliateUrl(plain, 'https://www.ebay.es/itm/100000000001?campid=1234567890', '')
  assert.equal(untouched.monetized, false)
  assert.equal(untouched.itemWebUrl, 'https://www.ebay.es/itm/100000000001')
  assert.equal(JSON.stringify(untouched).includes('campid'), false)
})
