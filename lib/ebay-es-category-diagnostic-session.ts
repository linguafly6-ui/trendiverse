/**
 * Sesión local para consultar la categoría 139971 y, aparte, su política
 * de condiciones. No lee el entorno, no guarda el informe y no enciende
 * el proveedor. La segunda llamada espera su propia confirmación.
 */

import type { EbayFetch } from './ebay-application-auth'
import {
  collectItemConditionPolicies,
  formatConditionPolicyReport,
} from './ebay-metadata-condition-policy-reading'
import {
  collectTaxonomyCategoryReading,
  formatTaxonomyCategoryReport,
} from './ebay-taxonomy-category-reading'

export const EBAY_ES_TAXONOMY_CONFIRMATION = 'run-outside-ci'
export const EBAY_ES_METADATA_CONFIRMATION = 'run-metadata-outside-ci'
export const EBAY_ES_CATEGORY_DIAGNOSTIC_INTERRUPTION = 'La lectura se interrumpió antes de completarse.\n'
export const EBAY_ES_CATEGORY_DIAGNOSTIC_CLOSING =
  'Informe diagnóstico. No es una categoría verificada de nintendo-switch ni una observación publicable.\n'

export interface EbayEsCategoryDiagnosticIO {
  ask(prompt: string): Promise<string>
  askSecret(prompt: string): Promise<string>
  write(text: string): void
  fetchImpl?: EbayFetch
}

export async function runEbayEsCategoryDiagnostics(io: EbayEsCategoryDiagnosticIO): Promise<void> {
  try {
    await runConfirmedDiagnostics(io)
  } catch {
    io.write(EBAY_ES_CATEGORY_DIAGNOSTIC_INTERRUPTION)
  }
}

async function runConfirmedDiagnostics(io: EbayEsCategoryDiagnosticIO): Promise<void> {
  const taxonomyConfirm = await io.ask(
    'Confirma la consulta de taxonomía de EBAY_ES escribiendo run-outside-ci: ',
  )
  if (taxonomyConfirm !== EBAY_ES_TAXONOMY_CONFIRMATION) {
    io.write(formatTaxonomyCategoryReport({ status: 'not-run' }))
    io.write(EBAY_ES_CATEGORY_DIAGNOSTIC_CLOSING)
    return
  }
  if (!io.fetchImpl) {
    io.write(formatTaxonomyCategoryReport({ status: 'not-run' }))
    io.write('Sin fetchImpl explícito no hay petición.\n')
    io.write(EBAY_ES_CATEGORY_DIAGNOSTIC_CLOSING)
    return
  }

  const clientId = await io.askSecret('Client ID, sin eco: ')
  const clientSecret = await io.askSecret('Cert ID, sin eco: ')
  if (!clientId || !clientSecret) {
    io.write(formatTaxonomyCategoryReport({ status: 'not-run' }))
    io.write(EBAY_ES_CATEGORY_DIAGNOSTIC_CLOSING)
    return
  }

  const taxonomy = await collectTaxonomyCategoryReading({
    confirm: 'run-outside-ci',
    clientId,
    clientSecret,
    fetchImpl: io.fetchImpl,
  })
  io.write(formatTaxonomyCategoryReport(taxonomy))

  const metadataConfirm = await io.ask(
    'Confirma la consulta de condiciones escribiendo run-metadata-outside-ci: ',
  )
  if (metadataConfirm !== EBAY_ES_METADATA_CONFIRMATION) {
    io.write(formatConditionPolicyReport({ status: 'not-run' }))
    io.write(EBAY_ES_CATEGORY_DIAGNOSTIC_CLOSING)
    return
  }

  const accessToken = await io.askSecret('Token de Metadata, sin eco (vacío para no llamar): ')
  if (!accessToken) {
    io.write(formatConditionPolicyReport({ status: 'not-run' }))
    io.write(EBAY_ES_CATEGORY_DIAGNOSTIC_CLOSING)
    return
  }

  const policies = await collectItemConditionPolicies({
    confirm: 'run-outside-ci',
    accessToken,
    fetchImpl: io.fetchImpl,
  })
  io.write(formatConditionPolicyReport(policies))
  io.write(EBAY_ES_CATEGORY_DIAGNOSTIC_CLOSING)
}
