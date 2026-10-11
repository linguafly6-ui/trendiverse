import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { EBAY_BROWSE_SOURCE_ENABLED, ebayBrowseSecondHandSource, normalizeEbaySourceUrl } from '../lib/ebay-browse-adapter'
import { associateBrowseItem } from '../lib/ebay-browse-offer'
import {
  EBAY_ES_OBSERVED_CATALOG_PRODUCTS,
  EBAY_ES_OBSERVED_CONDITION_WORDS,
  EBAY_ES_UNLABELED_CATALOG_PAGE,
  LISTING_SOURCE_URL_POLICY,
  assessListingSourceUrl,
  createEbayEsSwitchDossier,
  ebayEsDossierBlockers,
  ebayEsDossierCanPublish,
} from '../lib/ebay-es-product-dossier'
import { MARKETPLACE_ID_ALLOWLIST } from '../lib/second-hand-marketplace-id'
import {
  asExternalMapping,
  canComparePrices,
  SECOND_HAND_PRODUCT_MAPPINGS,
  secondHandProductMapping,
  type SecondHandProductMapping,
} from '../lib/second-hand-product-mapping'
import { emptySecondHandDataSource, getSecondHandProducts } from '../lib/second-hand-data'

const NOW = Date.parse('2026-10-11T12:00:00.000Z')

test('the Switch dossier stays pending and does not publish an offer', async () => {
  const mapping = secondHandProductMapping('nintendo-switch')
  assert.ok(mapping)
  const dossier = createEbayEsSwitchDossier()
  assert.equal(dossier.productId, 'nintendo-switch')
  assert.equal(dossier.status, 'pending')
  assert.equal(dossier.canonicalEpid, null)
  assert.equal(dossier.catalogUrl, null)
  assert.equal(dossier.verificationRef, mapping?.verificationRef)
  assert.equal(dossier.marketplace.documentedMarketplaceId, 'EBAY_ES')
  assert.equal(dossier.marketplace.siteHost, 'www.ebay.es')
  assert.equal(dossier.marketplace.categoryId, null)
  assert.equal(dossier.marketplace.listingMarketplaceId, null)
  assert.equal(dossier.admittedConditionIds.length, 0)
  assert.deepEqual(ebayEsDossierBlockers(dossier), [
    'canonical-epid-absent',
    'catalog-products-split-by-color',
    'category-id-absent',
    'listing-marketplace-id-unconfirmed',
    'condition-ids-not-admitted',
    'listing-url-policy-unchanged',
    'allowlist-empty',
  ])
  assert.equal(ebayEsDossierCanPublish(dossier), false)
  assert.equal(EBAY_ES_OBSERVED_CATALOG_PRODUCTS.length, 2)
  assert.equal(new Set(EBAY_ES_OBSERVED_CATALOG_PRODUCTS.map((product) => product.epid)).size, 2)
  assert.equal(EBAY_ES_OBSERVED_CATALOG_PRODUCTS.every((product) => product.modelNumber === 'HEG-001'), true)
  assert.equal(EBAY_ES_UNLABELED_CATALOG_PAGE.labeledEpid, null)
  const observedEpids: readonly string[] = EBAY_ES_OBSERVED_CATALOG_PRODUCTS.map((product) => product.epid)
  assert.equal(observedEpids.includes('5056057863'), false)
  assert.equal(EBAY_ES_OBSERVED_CONDITION_WORDS.every((entry) => entry.conditionId === null), true)
  assert.equal(LISTING_SOURCE_URL_POLICY, 'reject-ebay-host')
  assert.equal(MARKETPLACE_ID_ALLOWLIST.providers.length, 0)
  assert.equal(MARKETPLACE_ID_ALLOWLIST.scopes.length, 0)

  assert.equal(mapping.marketplaceIdentifier, null)
  assert.equal(mapping.externalProductId, null)
  assert.equal(canComparePrices(mapping), false)
  for (const product of EBAY_ES_OBSERVED_CATALOG_PRODUCTS) {
    const forged: SecondHandProductMapping = { ...mapping, externalProductId: product.epid }
    assert.equal(canComparePrices(forged), false, product.epid)
    assert.equal(asExternalMapping(forged).externalProductId, null, product.epid)
    const associated = associateBrowseItem({
      epid: product.epid,
      itemWebUrl: product.catalogUrl,
      listingMarketplaceId: 'EBAY_ES',
    }, { observedAt: '2026-10-11T11:59:00.000Z', now: NOW, requestMarketplaceId: 'EBAY_ES' })
    assert.equal(associated.observation, null, product.epid)
    assert.equal(associated.productId, null, product.epid)
    assert.ok(associated.blockers.includes('no-verified-mapping'), product.epid)
    assert.equal(normalizeEbaySourceUrl(product.catalogUrl), null, product.epid)
    assert.deepEqual(assessListingSourceUrl(product.catalogUrl), { outcome: 'rejected', reason: 'ebay-host' })
    assert.deepEqual(assessListingSourceUrl(`${product.catalogUrl}?campid=1`), { outcome: 'rejected', reason: 'affiliate-parameter' })
  }

  assert.equal(EBAY_BROWSE_SOURCE_ENABLED, false)
  assert.equal(emptySecondHandDataSource.id, 'empty')
  assert.equal(await ebayBrowseSecondHandSource.getProductData('nintendo-switch'), null)
  for (const product of await getSecondHandProducts()) {
    assert.equal(product.metrics.usedPrice, null, product.slug)
  }
  assert.equal(SECOND_HAND_PRODUCT_MAPPINGS.every((spec) => spec.marketplaceIdentifier === null), true)

  const source = readFileSync(new URL('../lib/ebay-es-product-dossier.ts', import.meta.url), 'utf8')
  const code = source.replace(/\/\*[\s\S]*?\*\//g, '').replace(/\/\/.*$/gm, '')
  assert.doesNotMatch(code, /\bfetch\s*\(|process\.env|EBAY_BROWSE_SOURCE_ENABLED\s*=\s*true/)
})
