import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { EBAY_BROWSE_SOURCE_ENABLED, ebayBrowseSecondHandSource } from '../lib/ebay-browse-adapter'
import { getSecondHandProducts } from '../lib/second-hand-data'
import {
  hasValidatedMarketplaceId,
  MARKETPLACE_ID_ALLOWLIST,
  type SecondHandMarketplaceIdentifier,
} from '../lib/second-hand-marketplace-id'
import {
  asExternalMapping,
  canComparePrices,
  SECOND_HAND_PRODUCT_MAPPINGS,
  type SecondHandProductMapping,
} from '../lib/second-hand-product-mapping'

const decision = readFileSync(new URL('../docs/second-hand-ebay-provider-decision.md', import.meta.url), 'utf8')
const sources = readFileSync(new URL('../docs/second-hand-data-sources.md', import.meta.url), 'utf8')
const adapter = readFileSync(new URL('../lib/ebay-browse-adapter.ts', import.meta.url), 'utf8')

test('the eBay provider decision blocks production and does not enable the adapter', () => {
  assert.equal(EBAY_BROWSE_SOURCE_ENABLED, false)
  assert.match(adapter, /EBAY_BROWSE_SOURCE_ENABLED = false/)
  assert.match(decision, /`candidate-provider`: eBay/)
  assert.match(decision, /`marketplace`: `EBAY_ES`/)
  assert.match(decision, /`status`: `blocked-pending-authorization`/)
  assert.match(decision, /La respuesta es no/)
  assert.match(decision, /provider authorization confirmed/)
  assert.match(decision, /production API access confirmed/)
  assert.match(decision, /EPN requirements confirmed/)
  assert.match(decision, /marketplace identifier strategy confirmed/)
  assert.match(decision, /display freshness requirements implemented/)
  assert.match(decision, /storage\/aggregation restrictions understood/)
  assert.match(decision, /evidence\/audit procedure defined/)
  assert.match(decision, /UNCONFIRMED — REQUIRES MANUAL PROVIDER CONFIRMATION/)
  assert.match(decision, /https:\/\/developer\.ebay\.com\/api-docs\/buy\/static\/api-browse\.html/)
  assert.match(decision, /El PDF de 2018 no está confirmado como el acuerdo que se firma hoy/)
  assert.match(decision, /número único de 10 dígitos/)
  assert.match(decision, /El JSON OpenAPI no contiene `affiliateCampaignId`/)
  assert.doesNotMatch(decision, /approved-for-integration/)
  assert.doesNotMatch(decision, /no están autorizados por el texto leído/)
  assert.doesNotMatch(decision, /el uso afiliado no levanta/)
  assert.doesNotMatch(decision, /cabe en el Public Display/)
  assert.doesNotMatch(decision, /\bfetch\s*\(|process\.env|setInterval|setTimeout|EBAY_BROWSE_SOURCE_ENABLED = true|client_secret|cert_id|app_id/i)
  assert.doesNotMatch(decision, /HEG-001` es el identificador de marketplace|marketplaceIdentifier: 'HEG-001'/)
  assert.match(sources, /`externalProductId` no sustituye a ese identificador/)
  assert.match(sources, /Un texto en `externalProductId` no es condición suficiente para validar un producto de marketplace/)
})

test('catalog identifiers stay absent and an externalProductId string does not publish', async () => {
  const verified = SECOND_HAND_PRODUCT_MAPPINGS.filter((spec) => spec.reviewStatus === 'verified')
  assert.deepEqual(verified.map((spec) => spec.productId), ['nintendo-switch'])
  assert.equal(SECOND_HAND_PRODUCT_MAPPINGS.filter((spec) => spec.reviewStatus === 'pending').length, 17)

  for (const spec of SECOND_HAND_PRODUCT_MAPPINGS) {
    assert.equal(spec.externalProductId, null, spec.productId)
    assert.equal(spec.marketplaceIdentifier, null, spec.productId)
    assert.equal(canComparePrices(spec), false, spec.productId)
    assert.equal(asExternalMapping(spec).verified, false, spec.productId)
    assert.equal(asExternalMapping(spec).externalProductId, null, spec.productId)
    assert.equal(await ebayBrowseSecondHandSource.getProductData(spec.productId), null, spec.productId)

    for (const forgedId of ['HEG-001', 'https://www.ebay.es/itm/123', '15032']) {
      const forged: SecondHandProductMapping = { ...spec, externalProductId: forgedId }
      assert.equal(canComparePrices(forged), false, `${spec.productId}:${forgedId}`)
      assert.equal(asExternalMapping(forged).externalProductId, null, `${spec.productId}:${forgedId}`)
      assert.equal(asExternalMapping(forged).verified, false, `${spec.productId}:${forgedId}`)
      assert.equal(hasValidatedMarketplaceId(forgedId), false, forgedId)
    }
  }

  assert.equal(MARKETPLACE_ID_ALLOWLIST.providers.length, 0)
  assert.equal(MARKETPLACE_ID_ALLOWLIST.scopes.length, 0)

  const switchSpec = SECOND_HAND_PRODUCT_MAPPINGS.find((spec) => spec.productId === 'nintendo-switch')
  if (!switchSpec?.verificationRef) throw new Error('nintendo-switch has no verificationRef')
  const lookValidated = (canonicalValue: string): SecondHandMarketplaceIdentifier => ({
    status: 'validated',
    provider: 'ebay',
    scope: 'EBAY_ES',
    canonicalValue,
    productId: 'nintendo-switch',
    verifiedProductRef: switchSpec.verificationRef ?? '',
    provenance: 'catalog-fixture',
    validationMethod: 'manual-review',
    auditRef: 'audit-fixture',
  })
  for (const canonicalValue of ['HEG-001', 'https://www.ebay.es/itm/123']) {
    const withId: SecondHandProductMapping = {
      ...switchSpec,
      externalProductId: canonicalValue,
      marketplaceIdentifier: lookValidated(canonicalValue),
    }
    assert.equal(canComparePrices(withId), false, canonicalValue)
    assert.equal(asExternalMapping(withId).externalProductId, null, canonicalValue)
    assert.equal(asExternalMapping(withId).verified, false, canonicalValue)
  }

  const products = await getSecondHandProducts()
  const fromEbay = await getSecondHandProducts([ebayBrowseSecondHandSource])
  for (const product of [...products, ...fromEbay]) {
    assert.equal(product.metrics.usedPrice, null, product.slug)
    assert.equal(product.metrics.newPrice, null, product.slug)
    assert.equal(product.metrics.savings, null, product.slug)
    assert.equal(product.metrics.score, null, product.slug)
    assert.equal(product.metrics.trend, null, product.slug)
    assert.equal(product.metrics.source, null, product.slug)
  }

  const provider = adapter.slice(adapter.indexOf('export const ebayBrowseSecondHandSource'))
  assert.match(provider, /return null/)
  assert.doesNotMatch(provider, /ebayOfferToObservation|fetch\(|process\.env|oauth|cron|setInterval|setTimeout/)
})
