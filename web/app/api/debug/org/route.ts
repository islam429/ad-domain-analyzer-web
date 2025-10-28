import { NextResponse } from 'next/server'
import { requireOrg } from '@/lib/tenant'

export async function GET() {
  const orgId = await requireOrg()
  return NextResponse.json({ orgId })
}
