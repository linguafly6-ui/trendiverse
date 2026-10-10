import { NextRequest, NextResponse } from 'next/server'
import {
  createD1EbayAccountDeletionStore,
  getIsolateEbayAccountDeletionStore,
  handleEbayAccountDeletion,
  readEbayAccountDeletionConfig,
  type EbayReceiptDatabase,
} from '@/lib/ebay-account-deletion'

export const runtime = 'edge'
export const dynamic = 'force-dynamic'

interface AccountDeletionEnv {
  DB?: EbayReceiptDatabase
  EBAY_ACCOUNT_DELETION_VERIFICATION_TOKEN?: string
  EBAY_ACCOUNT_DELETION_ENDPOINT?: string
  EBAY_NOTIFICATION_PUBLIC_KEYS?: string
}

const NO_STORE = { 'Cache-Control': 'no-store' }

async function readRuntimeEnv(): Promise<AccountDeletionEnv> {
  try {
    const { getRequestContext } = await import('@cloudflare/next-on-pages')
    return getRequestContext().env as AccountDeletionEnv
  } catch {
    return {
      EBAY_ACCOUNT_DELETION_VERIFICATION_TOKEN: process.env.EBAY_ACCOUNT_DELETION_VERIFICATION_TOKEN,
      EBAY_ACCOUNT_DELETION_ENDPOINT: process.env.EBAY_ACCOUNT_DELETION_ENDPOINT,
      EBAY_NOTIFICATION_PUBLIC_KEYS: process.env.EBAY_NOTIFICATION_PUBLIC_KEYS,
    }
  }
}

function jsonResult(status: number, body: { challengeResponse: string } | null): NextResponse {
  if (body) return NextResponse.json(body, { status, headers: NO_STORE })
  return new NextResponse(null, { status, headers: NO_STORE })
}

export async function GET(req: NextRequest) {
  const env = await readRuntimeEnv()
  const result = await handleEbayAccountDeletion({
    method: 'GET',
    challengeCode: req.nextUrl.searchParams.get('challenge_code'),
    rawBody: '',
    signatureHeader: null,
    config: readEbayAccountDeletionConfig(envBindings(env)),
    store: storeFor(env),
  })
  return jsonResult(result.status, result.body)
}

export async function POST(req: NextRequest) {
  const env = await readRuntimeEnv()
  const result = await handleEbayAccountDeletion({
    method: 'POST',
    challengeCode: null,
    rawBody: await req.text(),
    signatureHeader: req.headers.get('x-ebay-signature'),
    config: readEbayAccountDeletionConfig(envBindings(env)),
    store: storeFor(env),
  })
  return jsonResult(result.status, result.body)
}

function envBindings(env: AccountDeletionEnv) {
  return {
    verificationToken: env.EBAY_ACCOUNT_DELETION_VERIFICATION_TOKEN,
    endpoint: env.EBAY_ACCOUNT_DELETION_ENDPOINT,
    publicKeysJson: env.EBAY_NOTIFICATION_PUBLIC_KEYS,
  }
}

function storeFor(env: AccountDeletionEnv) {
  return env.DB ? createD1EbayAccountDeletionStore(env.DB) : getIsolateEbayAccountDeletionStore()
}
