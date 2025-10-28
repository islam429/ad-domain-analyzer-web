export const runtime = "nodejs";

import type Stripe from 'stripe'
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { planFromPriceId } from '@/lib/stripe'
import { stripe } from '@/lib/stripe-client'
const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET!

export async function POST(req: Request) {
  const sig = req.headers.get('stripe-signature')!
  const raw = await req.text()

  let event: Stripe.Event
  try {
    event = stripe.webhooks.constructEvent(raw, sig, endpointSecret)
  } catch (e: any) {
    return new NextResponse(`Webhook Error: ${e.message}`, { status: 400 })
  }

  async function updatePlanBySub(sub: Stripe.Subscription) {
    const item = sub.items.data[0]
    const priceId = item?.price?.id
    const plan = planFromPriceId(priceId || undefined)
    const customerId = sub.customer as string | undefined

    if (!customerId) return

    if (plan) {
      await prisma.organization.updateMany({ where: { stripeId: customerId }, data: { plan } })
    } else {
      await prisma.organization.updateMany({ where: { stripeId: customerId }, data: { plan: 'free' } })
    }
  }

  switch (event.type) {
    case 'checkout.session.completed': {
      const s = event.data.object as Stripe.Checkout.Session
      if (s.subscription) {
        const sub = await stripe.subscriptions.retrieve(s.subscription as string)
        await updatePlanBySub(sub)
      }
      const orgId = (s.metadata?.orgId as string) || null
      if (orgId && s.customer) {
        await prisma.organization.update({
          where: { id: orgId },
          data: { stripeId: s.customer as string },
        })
      }
      break
    }
    case 'customer.subscription.updated':
    case 'customer.subscription.created': {
      const sub = event.data.object as Stripe.Subscription
      await updatePlanBySub(sub)
      break
    }
    case 'customer.subscription.deleted': {
      const sub = event.data.object as Stripe.Subscription
      const customerId = sub.customer as string
      await prisma.organization.updateMany({ where: { stripeId: customerId }, data: { plan: 'free' } })
      break
    }
  }

  return NextResponse.json({ received: true })
}
