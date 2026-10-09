import { SECOND_HAND_PENDING_COPY, secondHandMetricRows, type SecondHandMetrics } from '@/lib/second-hand'

/** Métricas de un producto. Sin filas válidas mantiene el estado editorial, sin cifras. */
export default function ProductFacts({ metrics }: { metrics: SecondHandMetrics }) {
  const rows = secondHandMetricRows(metrics)
  if (rows.length === 0) {
    return <p className="mt-auto pt-3 text-xs text-slate-500 dark:text-slate-400">{SECOND_HAND_PENDING_COPY}</p>
  }
  return (
    <dl className="mt-3 grid grid-cols-2 gap-2 text-sm">
      {rows.map((row) => (
        <div key={row.label}>
          <dt className="text-slate-500">{row.label}</dt>
          <dd className="font-semibold">{row.value}</dd>
        </div>
      ))}
    </dl>
  )
}
