export const runtime = "nodejs";

import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from '@/lib/auth'
import { stripe } from '@/lib/stripe-client'

export async function POST() {
  const s = await auth()
  const email = s?.user?.email
  if (!email) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const m = await prisma.membership.findFirst({ where: { userId: email }, select: { orgId: true } })
  const org = m ? await prisma.organization.findUnique({ where: { id: m.orgId }, select: { stripeId: true } }) : null
  if (!org?.stripeId) return NextResponse.json({ error: 'No Stripe customer' }, { status: 400 })

  const session = await stripe.billingPortal.sessions.create({
    customer: org.stripeId,
    return_url: `${process.env.NEXT_PUBLIC_URL}/billing`,
  })

  return NextResponse.json({ url: session.url })
}
