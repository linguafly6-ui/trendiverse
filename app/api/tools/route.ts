import { NextResponse } from 'next/server'
import { getTools } from '@/lib/db'

export const runtime = 'edge'

export async function GET() {
  return NextResponse.json({ tools: await getTools() }, { headers: { 'Cache-Control': 'public, s-maxage=300' } })
}
