/**
 * Ejecución local y voluntaria de una búsqueda Browse por un ePID.
 *
 * No forma parte de test, build ni CI. No lee credenciales del entorno,
 * no guarda el informe y no llama a eBay salvo que una persona lo confirme
 * en su máquina.
 */

import { pathToFileURL } from 'node:url'
import { createTerminalPrompts } from '../lib/ebay-diagnostic-prompt'
import { runEbayEsEpidSearchSession } from '../lib/ebay-es-epid-search-session'

const INTERRUPTION = 'La búsqueda se interrumpió antes de completarse.\n'

async function main(): Promise<void> {
  const prompts = createTerminalPrompts(process.stdin, process.stdout)
  try {
    await runEbayEsEpidSearchSession({
      ask: (prompt) => prompts.ask(prompt),
      askSecret: (prompt) => prompts.askHidden(prompt),
      write: (text) => {
        process.stdout.write(text)
      },
      fetchImpl: (input, init) => globalThis.fetch(input, init),
    })
  } catch {
    process.stdout.write(INTERRUPTION)
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
