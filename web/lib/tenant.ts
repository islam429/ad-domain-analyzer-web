// lib/tenant.ts
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function requireOrg() {
  const session = await auth()
  const email = session?.user?.email
  if (!email) throw new Error('Unauthorized')

  const m = await prisma.membership.findFirst({
    where: { userId: email },
    select: { orgId: true },
  })
  if (m) return m.orgId

  const org = await prisma.organization.create({
    data: {
      name: 'Mein Workspace',
      ownerUserId: email,
      plan: 'free',
      memberships: {
        create: { userId: email, role: 'admin' },
      },
      usage: {
        create: { month: new Date().toISOString().slice(0, 7), credits: 1000, updatedAt: new Date() },
      },
    },
    select: { id: true },
  })

  return org.id
}
