import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { EBAY_BROWSE_SOURCE_ENABLED } from '../lib/ebay-browse-adapter'
import { SECOND_HAND_PRODUCT_MAPPINGS } from '../lib/second-hand-product-mapping'

const decision = readFileSync(new URL('../docs/second-hand-ebay-provider-decision.md', import.meta.url), 'utf8')
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
  assert.doesNotMatch(decision, /approved-for-integration/)
  assert.doesNotMatch(decision, /\bfetch\s*\(|process\.env|setInterval|setTimeout|EBAY_BROWSE_SOURCE_ENABLED = true|client_secret|cert_id|app_id/i)
  assert.doesNotMatch(decision, /HEG-001` es el identificador de marketplace|marketplaceIdentifier: 'HEG-001'/)

  const verified = SECOND_HAND_PRODUCT_MAPPINGS.filter((spec) => spec.reviewStatus === 'verified')
  assert.deepEqual(verified.map((spec) => spec.productId), ['nintendo-switch'])
  assert.equal(SECOND_HAND_PRODUCT_MAPPINGS.filter((spec) => spec.reviewStatus === 'pending').length, 17)
  for (const spec of SECOND_HAND_PRODUCT_MAPPINGS) {
    assert.equal(spec.externalProductId, null, spec.productId)
    assert.equal(spec.marketplaceIdentifier, null, spec.productId)
  }
})
