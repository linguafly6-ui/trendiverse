import { NextRequest, NextResponse } from 'next/server'
import { SITE_URL } from '@/lib/constants'

export const runtime = 'edge'

const key = '8e5f59bf6a2c48a4b55105096ab583ce'
const site = SITE_URL.replace(/\/$/, '')
const host = new URL(site).host

// Requires a private server-side token to prevent arbitrary third-party submissions.
export async function POST(request: NextRequest) {
  const token = process.env.INDEXNOW_TOKEN
  if (!token || request.headers.get('authorization') !== `Bearer ${token}`) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  }

  let payload: { urls?: unknown }
  try {
    payload = await request.json()
  } catch {
    return NextResponse.json({ error: 'JSON no válido' }, { status: 400 })
  }

  if (!Array.isArray(payload.urls) || payload.urls.length === 0 || payload.urls.length > 10000) {
    return NextResponse.json({ error: 'Se requiere urls (1-10000)' }, { status: 400 })
  }

  const urls = [...new Set(payload.urls)]
  if (urls.some((url) => typeof url !== 'string' || !isSiteUrl(url))) {
    return NextResponse.json({ error: 'Todas las URLs deben pertenecer a la web' }, { status: 400 })
  }

  try {
    const response = await fetch('https://api.indexnow.org/indexnow', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json; charset=utf-8' },
      body: JSON.stringify({
        host,
        key,
        keyLocation: `${site}/${key}.txt`,
        urlList: urls,
      }),
    })

    return NextResponse.json({
      accepted: response.status === 200 || response.status === 202,
      indexNowStatus: response.status,
      submitted: urls.length,
      note: 'La aceptación de IndexNow no garantiza la indexación.',
    }, { status: response.ok ? 200 : 502 })
  } catch {
    return NextResponse.json({ error: 'No se pudo contactar con IndexNow' }, { status: 502 })
  }
}

function isSiteUrl(value: string): boolean {
  try {
    const url = new URL(value)
    return url.protocol === 'https:' && url.host === host && !url.username && !url.password
  } catch {
    return false
  }
}
