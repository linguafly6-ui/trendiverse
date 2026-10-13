/**
 * Anuncios de Browse para /segunda-mano.
 *
 * La consulta exige el flag de entorno, credenciales válidas, una lista de
 * condiciones no vacía y una variante con ePID y categoría ya verificados.
 * La campaña de EPN no abre ni cierra esa consulta: solo añade el header
 * documentado cuando `EBAY_EPN_CAMPAIGN_ID` son diez dígitos.
 *
 * El entorno de Cloudflare que lee esta página es EBAY_BROWSE_SOURCE_ENABLED,
 * EBAY_CLIENT_ID, EBAY_CERT_ID y, si se quiere monetizar, EBAY_EPN_CAMPAIGN_ID.
 * No hay valor por defecto para la campaña. Un fallo devuelve un estado
 * tipado y una lista vacía, sin secretos.
 */

import { readEbayApplicationCredentials, type EbayFetch } from './ebay-application-auth'
import { createEbayBrowseClient } from './ebay-browse-client'
import { visibleEbayListings, type EbayListingPublicationPolicy } from './ebay-second-hand-gate'
import {
  EBAY_ES_ADMITTED_CONDITION_IDS,
  applyBrowseAffiliateUrl,
  readEbayEpnCampaignId,
  readEbayListing,
  type EbayEpnCampaignRead,
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

export const EBAY_PAGE_READ_STATUSES = [
  'source-disabled',
  'credentials-missing',
  'conditions-not-configured',
  'variant-not-validated',
  'auth-error',
  'browse-error',
  'empty',
  'ok',
  'processing-error',
] as const

export type EbayPageReadStatus = (typeof EBAY_PAGE_READ_STATUSES)[number]

/** Estado interno. No incluye credenciales, tokens ni el identificador de campaña. */
export interface EbayPageRead {
  status: EbayPageReadStatus
  listings: EbayListing[]
}

export interface EbayPageRuntimeConfig {
  enabled: boolean
  clientId: string
  clientSecret: string
  admittedConditionIds: readonly number[]
  campaignId: string | null
  mappings: readonly SecondHandProductMapping[]
  allowlist: SecondHandMarketplaceIdAllowlist
  fetchImpl?: EbayFetch
  now?: number
}

export interface EbayBrowseEnvironmentInspection {
  source: 'disabled' | 'enabled'
  credentials: 'missing' | 'invalid' | 'present'
  conditions: 'unconfigured' | 'configured'
  campaign: EbayEpnCampaignRead['status']
  wouldQuery: boolean
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

export function publicationPolicyFromConfig(config: EbayPageRuntimeConfig): EbayListingPublicationPolicy {
  return {
    providerEnabled: config.enabled,
    admittedConditionIds: config.admittedConditionIds,
  }
}

/**
 * Valida un juego de variables ya leído. No llama a la red y no devuelve
 * los valores. Producción y Preview se inspeccionan por separado porque
 * cada uno aporta su propio objeto.
 */
export function inspectEbayBrowseEnvironment(env: {
  EBAY_BROWSE_SOURCE_ENABLED?: string
  EBAY_CLIENT_ID?: string
  EBAY_CERT_ID?: string
  EBAY_EPN_CAMPAIGN_ID?: string
}): EbayBrowseEnvironmentInspection {
  const credentials = readEbayApplicationCredentials({
    clientId: env.EBAY_CLIENT_ID,
    clientSecret: env.EBAY_CERT_ID,
  })
  const credentialState = credentials.status === 'ok'
    ? 'present'
    : credentials.status === 'invalid'
      ? 'invalid'
      : 'missing'
  const conditions = EBAY_ES_ADMITTED_CONDITION_IDS.length === 0 ? 'unconfigured' : 'configured'
  const source = env.EBAY_BROWSE_SOURCE_ENABLED === 'true' ? 'enabled' : 'disabled'
  return {
    source,
    credentials: credentialState,
    conditions,
    campaign: readEbayEpnCampaignId(env.EBAY_EPN_CAMPAIGN_ID).status,
    wouldQuery: source === 'enabled' && credentialState === 'present' && conditions === 'configured',
  }
}

/** Lee candidatos y el detalle. La compuerta de visibilidad va después. */
export async function collectEbayListings(
  productId: string,
  config: EbayPageRuntimeConfig,
): Promise<EbayPageRead> {
  if (!config.enabled) return { status: 'source-disabled', listings: [] }
  const credentials = readEbayApplicationCredentials({
    clientId: config.clientId,
    clientSecret: config.clientSecret,
  })
  if (credentials.status !== 'ok') return { status: 'credentials-missing', listings: [] }
  if (config.admittedConditionIds.length === 0) return { status: 'conditions-not-configured', listings: [] }

  let epid: string | null
  try {
    epid = verifiedEpid(productId, config.mappings, config.allowlist)
  } catch {
    return { status: 'processing-error', listings: [] }
  }
  const variant = SECOND_HAND_VARIANT_MAPPINGS.find((item) => item.productId === productId)
  if (!epid || (variant && variant.identity.categoryId === null)) {
    return { status: 'variant-not-validated', listings: [] }
  }

  const campaign = readEbayEpnCampaignId(config.campaignId)
  try {
    const client = createEbayBrowseClient({
      clientId: credentials.clientId,
      clientSecret: credentials.clientSecret,
      fetchImpl: config.fetchImpl,
      affiliateCampaignId: campaign.status === 'ok' ? campaign.campaignId : null,
    })
    const found = await client.searchByEpid(epid)
    if (found.status === 'unauthorized') return { status: 'auth-error', listings: [] }
    if (found.status === 'empty') return { status: 'empty', listings: [] }
    if (found.status !== 'candidates') return { status: 'browse-error', listings: [] }

    const now = config.now ?? Date.now()
    const readAt = new Date(now).toISOString()
    const listings: EbayListing[] = []
    let sawAuth = false
    let sawBrowse = false
    for (const candidate of found.items) {
      const detail = await client.getItemBody(candidate.itemId)
      if (detail.status === 'unauthorized') {
        sawAuth = true
        continue
      }
      if (detail.status !== 'ok') {
        sawBrowse = true
        continue
      }
      if (variant && !itemMatchesVariantIdentity(variant, detail.body)) continue
      const record = detail.body && typeof detail.body === 'object' && !Array.isArray(detail.body)
        ? detail.body as Record<string, unknown>
        : null
      const listing = applyBrowseAffiliateUrl(readEbayListing(detail.body, {
        source: 'detail',
        readAt,
        queriedEpid: epid,
        expectedCategoryId: variant?.identity.categoryId ?? null,
        mappings: config.mappings,
        allowlist: config.allowlist,
      }), record?.itemAffiliateWebUrl, campaign.status === 'ok' ? campaign.campaignId : '')
      if (listing.association.productId === productId && listing.association.status === 'verified') listings.push(listing)
    }
    if (listings.length > 0) return { status: 'ok', listings }
    if (sawAuth) return { status: 'auth-error', listings: [] }
    if (sawBrowse) return { status: 'browse-error', listings: [] }
    return { status: 'empty', listings: [] }
  } catch {
    return { status: 'processing-error', listings: [] }
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
      EBAY_EPN_CAMPAIGN_ID: read('EBAY_EPN_CAMPAIGN_ID'),
    }
  } catch {
    return {}
  }
}

/** Configuración real de una petición. El flag de código del adapter no se enciende desde aquí. */
export async function productionEbayPageConfig(): Promise<EbayPageRuntimeConfig> {
  const env = await cloudflareEnv()
  return {
    enabled: env.EBAY_BROWSE_SOURCE_ENABLED === 'true',
    clientId: env.EBAY_CLIENT_ID ?? '',
    clientSecret: env.EBAY_CERT_ID ?? '',
    admittedConditionIds: EBAY_ES_ADMITTED_CONDITION_IDS,
    campaignId: env.EBAY_EPN_CAMPAIGN_ID ?? null,
    mappings: [
      ...SECOND_HAND_PRODUCT_MAPPINGS,
      ...SECOND_HAND_VARIANT_MAPPINGS.map((variant) => variantAsPendingMapping(variant)),
    ],
    allowlist: MARKETPLACE_ID_ALLOWLIST,
  }
}

export async function listingsForSecondHandPage(
  productId: string,
  now = Date.now(),
  config?: EbayPageRuntimeConfig,
): Promise<EbayListing[]> {
  try {
    const resolved = config ?? await productionEbayPageConfig()
    const read = await collectEbayListings(productId, resolved)
    if (read.listings.length === 0) return []
    return visibleEbayListings(productId, read.listings, now, publicationPolicyFromConfig(resolved))
  } catch {
    return []
  }
}
