export const runtime = "nodejs";
export const dynamic = 'force-dynamic'

import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from '@/lib/auth'

export async function GET(_: Request, { params }: { params: { id: string } }) {
  const s = await auth()
  const email = s?.user?.email
  if (!email) return NextResponse.json({ rows: [] })

  const membership = await prisma.membership.findFirst({
    where: { userId: email },
    select: { orgId: true },
  })
  if (!membership?.orgId) return NextResponse.json({ rows: [] })

  const id = Number(params.id)
  if (!Number.isFinite(id)) return NextResponse.json({ rows: [] })

  const rows = await prisma.adRow.findMany({
    where: { orgId: membership.orgId, jobId: BigInt(id) as any },
    orderBy: { id: 'asc' },
    select: {
      domain: true,
      organicEtv: true,
      featuredSnippetEtv: true,
      localPackEtv: true,
      paidEtv: true,
      visitsSearchTotal: true,
      conversions15: true,
      conversions25: true,
      createdAt: true,
    },
    take: 2000,
  })

  return NextResponse.json({ jobId: id, rows })
}
