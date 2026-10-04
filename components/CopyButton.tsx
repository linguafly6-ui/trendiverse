'use client'
import { useState } from 'react'

export default function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false)
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(text)
      setCopied(true)
      setTimeout(() => setCopied(false), 1500)
    } catch {}
  }
  return (
    <button onClick={copy} className={`rounded px-3 py-1 text-sm font-semibold text-white ${copied ? 'bg-emerald-700' : 'bg-cat-gaming'}`}>
      {copied ? '¡Copiado!' : 'Copiar código'}
    </button>
  )
}
