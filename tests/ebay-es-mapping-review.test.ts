import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { EBAY_BROWSE_SOURCE_ENABLED, ebayBrowseSecondHandSource } from '../lib/ebay-browse-adapter'
import { EBAY_ES_ADMITTED_CONDITION_IDS, associateBrowseItem } from '../lib/ebay-browse-offer'
import { EBAY_ES_OBSERVED_CATALOG_PRODUCTS, EBAY_ES_UNLABELED_CATALOG_PAGE } from '../lib/ebay-es-product-dossier'
import {
  SELL_METADATA_CONDITION_CONTRACT_IN_REPO,
  appliedListingSourceUrl,
  conditionAdmissionRemainsEmpty,
  diagnoseSwitchCatalogVariant,
  evaluateProposedEbayEsItemUrl,
  evidenceForObservedEpid,
  readGetItemCategoryEvidence,
} from '../lib/ebay-es-mapping-review'
import { emptySecondHandDataSource, getSecondHandProducts } from '../lib/second-hand-data'
import { SECOND_HAND_MAPPING_SCOPES, SECOND_HAND_PRODUCT_MAPPINGS } from '../lib/second-hand-product-mapping'

const NOW = Date.parse('2026-10-11T12:00:00.000Z')
/** Forma ya usada por las pruebas del puente. No es un anuncio observado. */
const SHAPE_ITEM_URL = 'https://www.ebay.es/itm/100'

test('nintendo-switch stays the base product and neither labeled ePID can be associated', () => {
  const diagnosis = diagnoseSwitchCatalogVariant()
  assert.equal(diagnosis.productId, 'nintendo-switch')
  assert.equal(diagnosis.keepExistingSlug, true)
  assert.deepEqual(diagnosis.scopes, SECOND_HAND_MAPPING_SCOPES)
  assert.equal(diagnosis.colorIsAnAttribute, false)
  assert.equal(diagnosis.mpnIsAnAttribute, false)
  assert.equal(diagnosis.attributeKeys.includes('edition'), true)
  assert.equal(diagnosis.editionValue, 'Modelo OLED')
  assert.match(diagnosis.colorSplitNote ?? '', /no parte el modelo por el color/i)
  assert.equal(SECOND_HAND_PRODUCT_MAPPINGS.every((spec) => spec.marketplaceIdentifier === null), true)

  for (const product of EBAY_ES_OBSERVED_CATALOG_PRODUCTS) {
    const evidence = evidenceForObservedEpid(product.epid)
    assert.equal(evidence.labeled, true)
    assert.equal(evidence.canAssociate, false)
    assert.equal(evidence.catalogUrl, product.catalogUrl)
    assert.ok(evidence.missing.includes('categoryId-from-getItem-body'))
    assert.ok(evidence.missing.includes('condition-policy-for-that-categoryId'))
    assert.ok(evidence.missing.includes('separate-variant-with-its-own-verificationRef'))
  }

  const unlabeled = evidenceForObservedEpid('5056057863')
  assert.equal(unlabeled.labeled, false)
  assert.equal(unlabeled.canAssociate, false)
  assert.equal(EBAY_ES_UNLABELED_CATALOG_PAGE.labeledEpid, null)
})

test('categoryId and listingMarketplaceId come only from a getItem body', () => {
  const absent = readGetItemCategoryEvidence({
    itemWebUrl: EBAY_ES_OBSERVED_CATALOG_PRODUCTS[0]?.catalogUrl,
    categoryPath: 'Consolas de videojuegos',
    categoryIdPath: '1|2',
  })
  assert.equal(absent.categoryId, null)
  assert.equal(absent.listingMarketplaceId, null)

  const numeric = readGetItemCategoryEvidence({ categoryId: 1, listingMarketplaceId: 'EBAY_ES' })
  assert.equal(numeric.categoryId, null)
  assert.equal(numeric.listingMarketplaceId, 'EBAY_ES')

  const padded = readGetItemCategoryEvidence({ categoryId: ' 10 ', listingMarketplaceId: ' EBAY_ES' })
  assert.equal(padded.categoryId, null)
  assert.equal(padded.listingMarketplaceId, null)

  const present = readGetItemCategoryEvidence({
    categoryId: 'fixture-category',
    listingMarketplaceId: 'EBAY_ES',
    categoryPath: 'Consolas de videojuegos',
  })
  assert.equal(present.categoryId, 'fixture-category')
  assert.equal(present.listingMarketplaceId, 'EBAY_ES')
  assert.equal(SELL_METADATA_CONDITION_CONTRACT_IN_REPO, false)
  assert.equal(EBAY_ES_ADMITTED_CONDITION_IDS.length, 0)
  assert.equal(conditionAdmissionRemainsEmpty(), true)
})

test('the proposed ebay.es item URL stays unapplied', async () => {
  const proposal = evaluateProposedEbayEsItemUrl({
    itemWebUrl: SHAPE_ITEM_URL,
    legacyItemId: '100',
    listingMarketplaceId: 'EBAY_ES',
  })
  assert.equal(proposal.applied, false)
  assert.equal(proposal.proposal, 'would-admit')
  assert.equal(appliedListingSourceUrl(SHAPE_ITEM_URL), null)

  const catalog = EBAY_ES_OBSERVED_CATALOG_PRODUCTS[0]
  assert.ok(catalog)
  assert.equal(evaluateProposedEbayEsItemUrl({
    itemWebUrl: catalog.catalogUrl,
    legacyItemId: '100',
    listingMarketplaceId: 'EBAY_ES',
  }).proposal, 'rejected')
  assert.equal(evaluateProposedEbayEsItemUrl({
    itemWebUrl: `${SHAPE_ITEM_URL}?campid=1`,
    legacyItemId: '100',
    listingMarketplaceId: 'EBAY_ES',
  }).proposal, 'rejected')
  assert.equal(evaluateProposedEbayEsItemUrl({
    itemWebUrl: `${SHAPE_ITEM_URL}?_trkparms=1`,
    legacyItemId: '100',
    listingMarketplaceId: 'EBAY_ES',
  }).proposal, 'rejected')
  assert.equal(evaluateProposedEbayEsItemUrl({
    itemWebUrl: 'http://www.ebay.es/itm/100',
    legacyItemId: '100',
    listingMarketplaceId: 'EBAY_ES',
  }).proposal, 'rejected')
  assert.equal(evaluateProposedEbayEsItemUrl({
    itemWebUrl: 'https://www.ebay.com/itm/100',
    legacyItemId: '100',
    listingMarketplaceId: 'EBAY_ES',
  }).proposal, 'rejected')
  assert.equal(evaluateProposedEbayEsItemUrl({
    itemWebUrl: SHAPE_ITEM_URL,
    legacyItemId: '999',
    listingMarketplaceId: 'EBAY_ES',
  }).proposal, 'rejected')
  assert.equal(evaluateProposedEbayEsItemUrl({
    itemWebUrl: SHAPE_ITEM_URL,
    legacyItemId: '100',
    listingMarketplaceId: 'EBAY_US',
  }).proposal, 'rejected')

  const associated = associateBrowseItem({
    epid: catalog.epid,
    itemWebUrl: SHAPE_ITEM_URL,
    legacyItemId: '100',
    listingMarketplaceId: 'EBAY_ES',
  }, { observedAt: '2026-10-11T11:59:00.000Z', now: NOW, requestMarketplaceId: 'EBAY_ES' })
  assert.equal(associated.observation, null)
  assert.equal(associated.productId, null)
  assert.ok(associated.blockers.includes('listing-url-rejected'))
  assert.ok(associated.blockers.includes('no-verified-mapping'))

  assert.equal(EBAY_BROWSE_SOURCE_ENABLED, false)
  assert.equal(emptySecondHandDataSource.id, 'empty')
  assert.equal(await ebayBrowseSecondHandSource.getProductData('nintendo-switch'), null)
  for (const product of await getSecondHandProducts()) {
    assert.equal(product.metrics.usedPrice, null, product.slug)
  }

  const offer = readFileSync(new URL('../lib/ebay-browse-offer.ts', import.meta.url), 'utf8')
  assert.doesNotMatch(offer, /evaluateProposedEbayEsItemUrl|ebay-es-mapping-review/)
  const review = readFileSync(new URL('../lib/ebay-es-mapping-review.ts', import.meta.url), 'utf8')
  const code = review.replace(/\/\*[\s\S]*?\*\//g, '').replace(/\/\/.*$/gm, '')
  assert.doesNotMatch(code, /\bfetch\s*\(|process\.env|EBAY_BROWSE_SOURCE_ENABLED\s*=\s*true|EBAY_ES_ADMITTED_CONDITION_IDS\s*=\s*\[/)
})
