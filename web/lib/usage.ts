import { prisma } from '@/lib/prisma'

type Plan = 'free' | 'starter' | 'pro' | 'business'

const CREDITS_BY_PLAN: Record<Plan, number> = {
  free: 100,
  starter: 1000,
  pro: 5000,
  business: 20000,
}

export async function requireCredits(orgId: string, cost = 1) {
  const month = new Date().toISOString().slice(0, 7)
  const org = await prisma.organization.findUnique({
    where: { id: orgId },
    select: { plan: true },
  })
  const cap = CREDITS_BY_PLAN[(org?.plan as Plan) ?? 'free'] ?? CREDITS_BY_PLAN.free

  const u = await prisma.usage.upsert({
    where: { orgId },
    create: { orgId, month, credits: cap, updatedAt: new Date() },
    update: { updatedAt: new Date() },
  })

  if (u.month !== month) {
    await prisma.usage.update({
      where: { orgId },
      data: { month, credits: cap, updatedAt: new Date() },
    })
  }

  const cur = await prisma.usage.findUnique({ where: { orgId } })
  if ((cur?.credits ?? 0) < cost) {
    const e: any = new Error('quota_exceeded')
    e.remaining = cur?.credits ?? 0
    throw e
  }
}

export async function consumeCredits(orgId: string, cost = 1) {
  await prisma.usage.update({
    where: { orgId },
    data: { credits: { decrement: cost }, updatedAt: new Date() },
  })
}
