/**
 * Lectura de líneas por stdin para el diagnóstico local.
 *
 * Una sola cola conserva lo que aún no se ha pedido. El secreto no se copia
 * a la salida, y en un terminal el modo raw apaga el eco.
 */

import { Writable } from 'node:stream'

export interface PromptInput {
  isTTY?: boolean
  setRawMode?: (enabled: boolean) => void
  setEncoding(encoding: BufferEncoding): this
  pause(): this
  resume(): this
  on(event: 'data', listener: (chunk: string | Buffer) => void): this
  on(event: 'error', listener: (error: Error) => void): this
  off(event: 'data', listener: (chunk: string | Buffer) => void): this
  off(event: 'error', listener: (error: Error) => void): this
}

interface PendingLine {
  hidden: boolean
  line: string
  resolve: (value: string) => void
  reject: (error: Error) => void
}

export interface TerminalPrompts {
  ask(prompt: string): Promise<string>
  askHidden(prompt: string): Promise<string>
  close(): void
}

export function createTerminalPrompts(input: PromptInput, output: Writable): TerminalPrompts {
  let buffer = ''
  let pending: PendingLine | null = null
  let closed = false
  input.setEncoding('utf8')
  input.resume()

  const rejectPending = (error: Error) => {
    const current = pending
    pending = null
    current?.reject(error)
  }
  const pump = () => {
    while (pending && buffer.length > 0) {
      const char = buffer[0] ?? ''
      buffer = buffer.slice(1)
      if (char === '\u0003') {
        buffer = ''
        rejectPending(new Error('interrupted'))
        return
      }
      if (char === '\u007f' || char === '\b') {
        pending.line = pending.line.slice(0, -1)
        continue
      }
      if (char === '\n' || char === '\r') {
        if (char === '\r' && buffer.startsWith('\n')) buffer = buffer.slice(1)
        const current = pending
        pending = null
        if (current.hidden || input.isTTY !== true) output.write('\n')
        current.resolve(current.line)
        return
      }
      pending.line += char
      if (!pending.hidden && input.isTTY !== true) output.write(char)
    }
  }
  const onData = (chunk: string | Buffer) => {
    if (closed) return
    buffer += typeof chunk === 'string' ? chunk : chunk.toString('utf8')
    pump()
  }
  const onError = (error: Error) => rejectPending(error)
  input.on('data', onData)
  input.on('error', onError)

  const askFor = (prompt: string, hidden: boolean) => {
    if (closed) return Promise.reject(new Error('closed'))
    output.write(prompt)
    if (typeof input.setRawMode === 'function' && input.isTTY === true) input.setRawMode(hidden)
    return new Promise<string>((resolve, reject) => {
      pending = { hidden, line: '', resolve, reject }
      pump()
    })
  }

  return {
    ask: (prompt) => askFor(prompt, false),
    askHidden: (prompt) => askFor(prompt, true),
    close() {
      if (closed) return
      closed = true
      input.off('data', onData)
      input.off('error', onError)
      if (typeof input.setRawMode === 'function' && input.isTTY === true) input.setRawMode(false)
      input.pause()
    },
  }
}
