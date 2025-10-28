import { NextRequest, NextResponse } from 'next/server'

export const runtime = 'nodejs'

function isAuthorized(req: NextRequest): boolean {
  const expected = process.env.CRON_SECRET
  if (!expected) return true
  const received = req.headers.get('x-cron-secret')
  return received === expected
}

export async function GET(req: NextRequest) {
  if (!isAuthorized(req)) {
    return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 })
  }

  return NextResponse.json({ ok: true })
}

export async function POST(req: NextRequest) {
  if (!isAuthorized(req)) {
    return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 })
  }

  return NextResponse.json({ ok: true })
}
