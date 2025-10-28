import { NextRequest, NextResponse } from 'next/server'
import { callWorker } from '@/lib/call-worker'

export const runtime = 'nodejs'

type Payload = { searchTerm: string; country: string }

function isValidPayload(payload: any): payload is Payload {
  return (
    payload &&
    typeof payload.searchTerm === 'string' &&
    payload.searchTerm.trim() !== '' &&
    typeof payload.country === 'string' &&
    payload.country.trim() !== ''
  )
}

export async function POST(req: NextRequest) {
  try {
    const data = await req.json().catch(() => null)
    if (!isValidPayload(data)) {
      return NextResponse.json({ ok: false, error: 'Invalid payload' }, { status: 400 })
    }

    const result = await callWorker<Payload, any>('/jobs/fetch-ads', data)
    return NextResponse.json(result)
  } catch (err: any) {
    console.error('fetch-ads error:', err)
    return NextResponse.json({ ok: false, error: err?.message || 'Unknown error' }, { status: 500 })
  }
}
