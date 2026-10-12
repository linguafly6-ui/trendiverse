/**
 * Ejecución local y voluntaria del diagnóstico de categoría y condiciones.
 *
 * No forma parte de test, build ni CI. No lee credenciales del entorno,
 * no guarda el informe y no llama a eBay salvo que una persona lo confirme
 * en su máquina.
 */

import { pathToFileURL } from 'node:url'
import { createTerminalPrompts } from '../lib/ebay-diagnostic-prompt'
import {
  EBAY_ES_CATEGORY_DIAGNOSTIC_INTERRUPTION,
  runEbayEsCategoryDiagnostics,
} from '../lib/ebay-es-category-diagnostic-session'

async function main(): Promise<void> {
  const prompts = createTerminalPrompts(process.stdin, process.stdout)
  try {
    await runEbayEsCategoryDiagnostics({
      ask: (prompt) => prompts.ask(prompt),
      askSecret: (prompt) => prompts.askHidden(prompt),
      write: (text) => {
        process.stdout.write(text)
      },
      fetchImpl: (input, init) => globalThis.fetch(input, init),
    })
  } catch {
    process.stdout.write(EBAY_ES_CATEGORY_DIAGNOSTIC_INTERRUPTION)
    process.exitCode = 1
  } finally {
    prompts.close()
  }
}

const invokedDirectly = process.argv[1] !== undefined
  && import.meta.url === pathToFileURL(process.argv[1]).href

if (invokedDirectly) {
  void main()
}
