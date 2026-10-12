/**
 * Ejecución local, voluntaria, de una lectura por legacyItemId.
 *
 * No forma parte de test, build ni CI. No lee credenciales del entorno
 * y no guarda el informe.
 */

import { pathToFileURL } from 'node:url'
import { createTerminalPrompts } from '../lib/ebay-browse-legacy-item-prompt'
import { runBrowseLegacyItemReadingSession } from '../lib/ebay-browse-legacy-item-session'

async function main(): Promise<void> {
  const prompts = createTerminalPrompts(process.stdin, process.stdout)
  try {
    await runBrowseLegacyItemReadingSession({
      ask: (prompt) => prompts.ask(prompt),
      askSecret: (prompt) => prompts.askHidden(prompt),
      write: (text) => {
        process.stdout.write(text)
      },
      fetchImpl: (input, init) => globalThis.fetch(input, init),
    })
  } catch {
    process.stdout.write('La lectura se interrumpió antes de completarse.\n')
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
