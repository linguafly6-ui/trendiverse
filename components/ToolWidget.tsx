'use client'
import { useMemo, useState } from 'react'
import type { Tool } from '@/lib/types'

const input = 'w-full rounded-lg border border-slate-300 bg-transparent px-3 py-2 dark:border-slate-700'

function Percentage() {
  const [pct, setPct] = useState(15)
  const [val, setVal] = useState(200)
  return (
    <div className="space-y-2">
      <label className="block text-sm">Porcentaje<input type="number" className={input} value={pct} onChange={(e) => setPct(+e.target.value)} /></label>
      <label className="block text-sm">Cantidad<input type="number" className={input} value={val} onChange={(e) => setVal(+e.target.value)} /></label>
      <p className="text-2xl font-bold">{((pct * val) / 100).toLocaleString('es-ES')}</p>
    </div>
  )
}

function Currency({ rates }: { rates: Record<string, number> }) {
  const [amount, setAmount] = useState(100)
  const codes = Object.keys(rates)
  const [from, setFrom] = useState(codes[0])
  const [to, setTo] = useState(codes[1] ?? codes[0])
  const result = (amount / rates[from]) * rates[to]
  return (
    <div className="space-y-2">
      <input type="number" aria-label="Cantidad" className={input} value={amount} onChange={(e) => setAmount(+e.target.value)} />
      <div className="flex gap-2">
        <select aria-label="De" className={input} value={from} onChange={(e) => setFrom(e.target.value)}>{codes.map((c) => <option key={c}>{c}</option>)}</select>
        <select aria-label="A" className={input} value={to} onChange={(e) => setTo(e.target.value)}>{codes.map((c) => <option key={c}>{c}</option>)}</select>
      </div>
      <p className="text-2xl font-bold">{result.toFixed(2)} {to}</p>
    </div>
  )
}

function Password() {
  const [len, setLen] = useState(16)
  const [pw, setPw] = useState('')
  const generate = () => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789!@#$%&*'
    const buf = new Uint32Array(len)
    crypto.getRandomValues(buf)
    setPw(Array.from(buf, (n) => chars[n % chars.length]).join(''))
  }
  return (
    <div className="space-y-2">
      <label className="block text-sm">Longitud: {len}<input type="range" min={8} max={64} value={len} onChange={(e) => setLen(+e.target.value)} className="w-full" /></label>
      <button onClick={generate} className="rounded-lg bg-cat-herramientas px-4 py-2 font-semibold text-white">Generar</button>
      {pw && <p className="break-all rounded bg-slate-100 p-2 font-mono dark:bg-slate-800">{pw}</p>}
    </div>
  )
}

export default function ToolWidget({ tool }: { tool: Tool }) {
  const rates = useMemo<Record<string, number>>(() => {
    try { return JSON.parse(tool.config ?? '{}').rates ?? { EUR: 1, USD: 1.08 } } catch { return { EUR: 1, USD: 1.08 } }
  }, [tool.config])
  const share = () => {
    const url = window.location.href
    if (navigator.share) navigator.share({ title: tool.title, url }).catch(() => {})
    else window.open(`https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(tool.title)}`, '_blank', 'noopener')
  }
  return (
    <section className="rounded-2xl border border-cat-herramientas/40 p-4">
      <h2 className="text-lg font-bold">🛠️ {tool.title}</h2>
      <p className="mb-3 text-sm text-slate-500">{tool.description}</p>
      {tool.type === 'percentage' && <Percentage />}
      {tool.type === 'currency' && <Currency rates={rates} />}
      {tool.type === 'password' && <Password />}
      <button onClick={share} className="mt-3 text-sm text-brand-blue underline">Compartir</button>
    </section>
  )
}
