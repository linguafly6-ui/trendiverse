import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { normalizeEbayCondition } from '../lib/ebay-browse-adapter'
import { collectEbayListings, type EbayPageRuntimeConfig } from '../lib/ebay-browse-page-source'
import { EBAY_ES_ADMITTED_CONDITION_IDS, readEbayListing } from '../lib/ebay-listing'
import { visibleEbayListings } from '../lib/ebay-second-hand-gate'
import { hasValidatedMarketplaceId, MARKETPLACE_ID_ALLOWLIST } from '../lib/second-hand-marketplace-id'
import {
  WHITE_OLED_BROWSE_ITEM,
  WHITE_OLED_CATALOG_CANDIDATE,
  WHITE_OLED_OBSERVED_PRODUCT_ID,
  WHITE_OLED_SEPARATE_CANDIDATE,
  WHITE_OLED_VALIDATION_BLOCKERS,
  whiteOledObservedItemBody,
  whiteOledObservedReadingBlockers,
} from '../lib/ebay-white-oled-observed-reading'
import {
  whiteOledDetailFromBody,
  whiteOledDetailIsComplete,
} from '../lib/ebay-white-oled-reading'
import {
  itemMatchesVariantIdentity,
  secondHandVariantMapping,
  variantAsPendingMapping,
  SECOND_HAND_VARIANT_MAPPINGS,
} from '../lib/second-hand-variant-catalog'

const WHITE = WHITE_OLED_OBSERVED_PRODUCT_ID
const NEON = 'nintendo-switch-oled-neon'
const SPLATOON = 'nintendo-switch-oled-splatoon-3'

test('the observed EBAY_ES body is complete and still fails the identity contract', () => {
  const white = secondHandVariantMapping(WHITE)
  const neon = secondHandVariantMapping(NEON)
  const splatoon = secondHandVariantMapping(SPLATOON)
  assert.ok(white && neon && splatoon)
  const body = whiteOledObservedItemBody()
  const fields = whiteOledDetailFromBody(WHITE_OLED_BROWSE_ITEM.itemId, body)
  assert.ok(fields)
  assert.equal(whiteOledDetailIsComplete(fields), true)
  assert.equal(fields.model.status === 'present' && fields.model.value, 'Nintendo Switch (modelo OLED)')
  assert.equal(itemMatchesVariantIdentity(white, body), false)
  assert.equal(itemMatchesVariantIdentity(neon, body), false)
  assert.equal(itemMatchesVariantIdentity(splatoon, body), false)
  assert.deepEqual(whiteOledObservedReadingBlockers(white), [...WHITE_OLED_VALIDATION_BLOCKERS])
  assert.notEqual(String(WHITE_OLED_BROWSE_ITEM.modelAspect), WHITE_OLED_CATALOG_CANDIDATE.manufacturerIdentifier)
  assert.equal(WHITE_OLED_BROWSE_ITEM.epid, WHITE_OLED_CATALOG_CANDIDATE.candidateEpid)
  assert.equal(WHITE_OLED_BROWSE_ITEM.gtin, WHITE_OLED_CATALOG_CANDIDATE.ean)
  assert.equal(WHITE_OLED_BROWSE_ITEM.mpn, WHITE_OLED_CATALOG_CANDIDATE.mpn)
})

test('the observed reading does not validate the white variant or its siblings', () => {
  const white = secondHandVariantMapping(WHITE)
  const neon = secondHandVariantMapping(NEON)
  const splatoon = secondHandVariantMapping(SPLATOON)
  assert.ok(white && neon && splatoon)
  assert.equal(white.marketplaceIdentifier?.status, 'unvalidated')
  assert.equal(white.identity.categoryId, null)
  assert.equal(white.identity.manufacturerIdentifier, 'HEG-001')
  assert.match(white.verificationRef, /v1\|206264425581\|0/)
  assert.match(white.verificationRef, /Nintendo Switch \(modelo OLED\)/)
  assert.match(white.verificationRef, /158070574781/)
  assert.equal(neon.marketplaceIdentifier?.status, 'unvalidated')
  assert.equal(neon.identity.candidateEpid, '23048312547')
  assert.equal(neon.identity.categoryId, null)
  assert.equal(splatoon.marketplaceIdentifier, null)
  assert.equal(splatoon.identity.candidateEpid, null)
  assert.equal(MARKETPLACE_ID_ALLOWLIST.providers.length, 0)
  assert.equal(MARKETPLACE_ID_ALLOWLIST.scopes.length, 0)
  assert.deepEqual([...EBAY_ES_ADMITTED_CONDITION_IDS], [])
  assert.equal(hasValidatedMarketplaceId(white.marketplaceIdentifier, {
    productId: WHITE,
    verificationRef: white.verificationRef,
    manufacturerIdentifier: white.identity.manufacturerIdentifier,
    manufacturer: white.identity.manufacturer,
    exactModel: white.identity.exactModel,
    identifies: white.identifies,
  }, { providers: ['ebay'], scopes: ['epid'] }), false)
  assert.equal(hasValidatedMarketplaceId({
    status: 'validated',
    provider: 'ebay',
    scope: 'epid',
    canonicalValue: WHITE_OLED_BROWSE_ITEM.epid,
    productId: WHITE,
    verifiedProductRef: white.verificationRef,
    provenance: '',
    validationMethod: 'getItem',
    auditRef: WHITE_OLED_BROWSE_ITEM.auditUrl,
  }, {
    productId: WHITE,
    verificationRef: white.verificationRef,
    manufacturerIdentifier: white.identity.manufacturerIdentifier,
    manufacturer: white.identity.manufacturer,
    exactModel: white.identity.exactModel,
    identifies: white.identifies,
  }, { providers: ['ebay'], scopes: ['epid'] }), false)
})

test('category 139971 and condition 1000 stay out of the query', async () => {
  const white = secondHandVariantMapping(WHITE)
  assert.ok(white)
  assert.equal(normalizeEbayCondition(1000, true), null)
  assert.equal(EBAY_ES_ADMITTED_CONDITION_IDS.includes(1000), false)
  assert.equal(WHITE_OLED_SEPARATE_CANDIDATE.epid, null)
  assert.equal(WHITE_OLED_SEPARATE_CANDIDATE.mergesIntoObservedItem, false)
  assert.equal(itemMatchesVariantIdentity(white, {
    ...whiteOledObservedItemBody(),
    epid: undefined,
    itemId: WHITE_OLED_SEPARATE_CANDIDATE.itemId,
  }), false)

  const listing = readEbayListing(whiteOledObservedItemBody(), {
    source: 'detail',
    readAt: '2026-10-13T00:00:00.000Z',
    expectedCategoryId: 'fixture-category',
  })
  assert.ok(listing.association.reasons.includes('incompatible-category'))
  assert.equal(listing.association.status, 'unverified')
  assert.equal(listing.price, null)
  assert.deepEqual(visibleEbayListings(WHITE, [listing], Date.parse('2026-10-13T00:00:00.000Z')), [])

  let calls = 0
  const fetchImpl: EbayPageRuntimeConfig['fetchImpl'] = async () => {
    calls += 1
    return new Response('{}', { status: 200, headers: { 'content-type': 'application/json' } })
  }
  const pending = await collectEbayListings(WHITE, {
    enabled: true,
    clientId: 'fixture-client',
    clientSecret: 'fixture-cert',
    admittedConditionIds: [3000],
    campaignId: null,
    mappings: SECOND_HAND_VARIANT_MAPPINGS.map((variant) => variantAsPendingMapping(variant)),
    allowlist: MARKETPLACE_ID_ALLOWLIST,
    fetchImpl,
  })
  const wrongCategoryStillBlocked = await collectEbayListings(NEON, {
    enabled: true,
    clientId: 'fixture-client',
    clientSecret: 'fixture-cert',
    admittedConditionIds: [1000],
    campaignId: null,
    mappings: SECOND_HAND_VARIANT_MAPPINGS.map((variant) => variantAsPendingMapping(variant)),
    allowlist: MARKETPLACE_ID_ALLOWLIST,
    fetchImpl,
  })
  const noCampaign = await collectEbayListings(WHITE, {
    enabled: true,
    clientId: 'fixture-client',
    clientSecret: 'fixture-cert',
    admittedConditionIds: [],
    campaignId: null,
    mappings: SECOND_HAND_VARIANT_MAPPINGS.map((variant) => variantAsPendingMapping(variant)),
    allowlist: MARKETPLACE_ID_ALLOWLIST,
    fetchImpl,
  })
  assert.equal(pending.status, 'variant-not-validated')
  assert.equal(wrongCategoryStillBlocked.status, 'variant-not-validated')
  assert.equal(noCampaign.status, 'conditions-not-configured')
  assert.equal(calls, 0)
  assert.equal(JSON.stringify(pending).includes('fixture-cert'), false)
  assert.equal(JSON.stringify(pending).includes('Bearer'), false)
})

test('the recorded evidence does not store the observed price or a secret', () => {
  const observation = readFileSync(new URL('../lib/ebay-white-oled-observed-reading.ts', import.meta.url), 'utf8')
  const catalog = readFileSync(new URL('../lib/second-hand-variant-catalog.ts', import.meta.url), 'utf8')
  const preview = readFileSync(new URL('../docs/ebay-browse-preview.md', import.meta.url), 'utf8')
  for (const source of [observation, catalog, preview]) {
    assert.equal(source.includes('428.67'), false)
    assert.equal(source.includes('428'), false)
    assert.doesNotMatch(source, /Bearer |EBAY_CERT_ID\s*=|clientSecret\s*[:=]\s*['"][^'"]+['"]/)
  }
  assert.equal(JSON.stringify(whiteOledObservedItemBody()).includes('428'), false)
  assert.equal(Object.prototype.hasOwnProperty.call(WHITE_OLED_BROWSE_ITEM, 'price'), false)
})
