export const runtime = 'nodejs'
import { NextResponse } from 'next/server'
import { resolvePlanForCurrentUser } from '@/lib/plan'

export async function GET() {
  const plan = await resolvePlanForCurrentUser()
  return NextResponse.json({ plan })
}
