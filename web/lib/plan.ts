import 'server-only'
import { prisma } from '@/lib/prisma'
import { auth } from '@/lib/auth'

export type Plan = 'free' | 'pro' | 'enterprise'

const PLAN_MAP: Record<string, Plan> = {
  free: 'free',
  starter: 'pro',
  pro: 'pro',
  business: 'enterprise',
  enterprise: 'enterprise',
}

export async function resolvePlanForCurrentUser(): Promise<Plan> {
  const session = await auth()
  const email = session?.user?.email
  if (!email) return 'free'

  const membership = await prisma.membership.findFirst({
    where: { userId: email },
    select: { orgId: true },
  })

  if (!membership?.orgId) return 'free'

  const org = await prisma.organization.findUnique({
    where: { id: membership.orgId },
    select: { plan: true, stripeId: true },
  })

  if (!org?.plan) return 'free'

  return PLAN_MAP[org.plan] ?? 'free'
}
