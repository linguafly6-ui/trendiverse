/**
 * Anuncios de Browse para /segunda-mano.
 *
 * La configuración por defecto no llama a la red: el flag de código sigue
 * apagado, no hay condiciones admitidas, no hay EPN y ninguna variante tiene
 * un identificador validado. Un fallo devuelve una lista vacía.
 *
 * Preview puede inyectar secretos en el entorno de Cloudflare, no en el
 * repositorio: EBAY_BROWSE_SOURCE_ENABLED, EBAY_CLIENT_ID y EBAY_CERT_ID.
 * Eso no publica anuncios mientras falte la política de condiciones, el alta
 * de EPN o un ePID validado con categoryId leído de un anuncio de EBAY_ES.
 */

import { readEbayApplicationCredentials, type EbayFetch } from './ebay-application-auth'
import { createEbayBrowseClient } from './ebay-browse-client'
import { visibleEbayListings } from './ebay-second-hand-gate'
import {
  EBAY_EPN_CONFIGURED,
  EBAY_ES_ADMITTED_CONDITION_IDS,
  readEbayListing,
  type EbayListing,
} from './ebay-listing'
import {
  MARKETPLACE_ID_ALLOWLIST,
  type SecondHandMarketplaceIdAllowlist,
} from './second-hand-marketplace-id'
import {
  asExternalMapping,
  SECOND_HAND_PRODUCT_MAPPINGS,
  type SecondHandProductMapping,
} from './second-hand-product-mapping'
import {
  SECOND_HAND_VARIANT_MAPPINGS,
  SWITCH_OLED_PARENT_PRODUCT_ID,
  itemMatchesVariantIdentity,
  variantAsPendingMapping,
} from './second-hand-variant-catalog'

export interface EbayPageRuntimeConfig {
  enabled: boolean
  clientId: string
  clientSecret: string
  admittedConditionIds: readonly number[]
  epnConfigured: boolean
  mappings: readonly SecondHandProductMapping[]
  allowlist: SecondHandMarketplaceIdAllowlist
  fetchImpl?: EbayFetch
  now?: number
}

function verifiedEpid(
  productId: string,
  mappings: readonly SecondHandProductMapping[],
  allowlist: SecondHandMarketplaceIdAllowlist,
): string | null {
  if (productId === SWITCH_OLED_PARENT_PRODUCT_ID) return null
  const mapping = mappings.find((item) => item.productId === productId)
  if (!mapping) return null
  const external = asExternalMapping(mapping, allowlist)
  return external.verified ? external.externalProductId : null
}

/** Lee candidatos y el detalle. No publica por sí solo: la compuerta va después. */
export async function collectEbayListings(
  productId: string,
  config: EbayPageRuntimeConfig,
): Promise<EbayListing[]> {
  if (!config.enabled || config.admittedConditionIds.length === 0 || !config.epnConfigured) return []
  const credentials = readEbayApplicationCredentials({
    clientId: config.clientId,
    clientSecret: config.clientSecret,
  })
  if (credentials.status !== 'ok') return []
  const epid = verifiedEpid(productId, config.mappings, config.allowlist)
  if (!epid) return []
  const variant = SECOND_HAND_VARIANT_MAPPINGS.find((item) => item.productId === productId)
  if (variant && variant.identity.categoryId === null) return []

  let found: Awaited<ReturnType<ReturnType<typeof createEbayBrowseClient>['searchByEpid']>>
  try {
    const client = createEbayBrowseClient({
      clientId: credentials.clientId,
      clientSecret: credentials.clientSecret,
      fetchImpl: config.fetchImpl,
    })
    found = await client.searchByEpid(epid)
    if (found.status !== 'candidates') return []
    const now = config.now ?? Date.now()
    const readAt = new Date(now).toISOString()
    const listings: EbayListing[] = []
    for (const candidate of found.items) {
      const detail = await client.getItemBody(candidate.itemId)
      if (detail.status !== 'ok') continue
      if (variant && !itemMatchesVariantIdentity(variant, detail.body)) continue
      const listing = readEbayListing(detail.body, {
        source: 'detail',
        readAt,
        queriedEpid: epid,
        expectedCategoryId: variant?.identity.categoryId ?? null,
        mappings: config.mappings,
        allowlist: config.allowlist,
      })
      if (listing.association.productId === productId && listing.association.status === 'verified') listings.push(listing)
    }
    return listings
  } catch {
    return []
  }
}

async function cloudflareEnv(): Promise<Record<string, string | undefined>> {
  try {
    const { getRequestContext } = await import('@cloudflare/next-on-pages')
    const env = getRequestContext().env as Record<string, unknown>
    const read = (key: string) => (typeof env[key] === 'string' ? env[key] as string : undefined)
    return {
      EBAY_BROWSE_SOURCE_ENABLED: read('EBAY_BROWSE_SOURCE_ENABLED'),
      EBAY_CLIENT_ID: read('EBAY_CLIENT_ID'),
      EBAY_CERT_ID: read('EBAY_CERT_ID'),
    }
  } catch {
    return {}
  }
}

/** Configuración real de una petición. El flag de código apagado no se enciende desde aquí. */
export async function productionEbayPageConfig(): Promise<EbayPageRuntimeConfig> {
  const env = await cloudflareEnv()
  return {
    enabled: env.EBAY_BROWSE_SOURCE_ENABLED === 'true',
    clientId: env.EBAY_CLIENT_ID ?? '',
    clientSecret: env.EBAY_CERT_ID ?? '',
    admittedConditionIds: EBAY_ES_ADMITTED_CONDITION_IDS,
    epnConfigured: EBAY_EPN_CONFIGURED,
    mappings: [
      ...SECOND_HAND_PRODUCT_MAPPINGS,
      ...SECOND_HAND_VARIANT_MAPPINGS.map((variant) => variantAsPendingMapping(variant)),
    ],
    allowlist: MARKETPLACE_ID_ALLOWLIST,
  }
}

export async function listingsForSecondHandPage(productId: string, now = Date.now()): Promise<EbayListing[]> {
  try {
    const readings = await collectEbayListings(productId, await productionEbayPageConfig())
    return visibleEbayListings(productId, readings, now)
  } catch {
    return []
  }
}
