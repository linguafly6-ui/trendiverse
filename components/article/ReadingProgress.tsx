'use client'
import { useEffect, useState } from 'react'

export default function ReadingProgress() {
  const [progress, setProgress] = useState(0)
  useEffect(() => {
    const update = () => {
      const max = document.documentElement.scrollHeight - window.innerHeight
      setProgress(max > 0 ? Math.min(100, Math.max(0, (window.scrollY / max) * 100)) : 0)
    }
    update()
    window.addEventListener('scroll', update, { passive: true })
    window.addEventListener('resize', update)
    return () => {
      window.removeEventListener('scroll', update)
      window.removeEventListener('resize', update)
    }
  }, [])
  return (
    <>
      <div className="fixed inset-x-0 top-0 z-50 h-1 bg-transparent" role="progressbar" aria-label="Progreso de lectura" aria-valuemin={0} aria-valuemax={100} aria-valuenow={Math.round(progress)}>
        <div className="h-full bg-violet-600" style={{ width: `${progress}%` }} />
      </div>
      {progress > 10 && (
        <button
          type="button"
          onClick={() => window.scrollTo({ top: 0, behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' })}
          className="fixed bottom-4 right-4 z-40 rounded-full bg-violet-600 px-4 py-2 text-sm font-bold text-white shadow-lg hover:bg-violet-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-400"
        >
          ↑ Subir
        </button>
      )}
    </>
  )
}
