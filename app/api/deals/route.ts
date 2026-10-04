import { NextResponse } from 'next/server'
import { getDeals } from '@/lib/db'

export const runtime = 'edge'

export async function GET() {
  return NextResponse.json({ deals: await getDeals() }, { headers: { 'Cache-Control': 'public, s-maxage=60' } })
}
