export const runtime = "nodejs";
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from '@/lib/auth'

export async function GET() {
  const s = await auth()
  const email = s?.user?.email
  if (!email) return NextResponse.json({ jobs: [] })

  const membership = await prisma.membership.findFirst({
    where: { userId: email },
    select: { orgId: true },
  })
  if (!membership?.orgId) return NextResponse.json({ jobs: [] })

  const jobs = await prisma.adRow.groupBy({
    by: ['jobId'],
    where: { orgId: membership.orgId },
    _count: { _all: true },
    _sum: {
      visitsSearchTotal: true,
      conversions15: true,
      conversions25: true,
    },
    _min: { createdAt: true },
    orderBy: [{ jobId: 'desc' }],
    take: 30,
  })

  const serialized = jobs.map((j) => ({
    job_id: typeof j.jobId === 'bigint' ? Number(j.jobId) : (j as any).jobId,
    _count: j._count,
    _min: j._min,
    _sum: {
      visits_search_total:
        j._sum?.visitsSearchTotal != null ? Number(j._sum.visitsSearchTotal as any) : null,
      conversions_15: j._sum?.conversions15 != null ? Number(j._sum.conversions15 as any) : null,
      conversions_25: j._sum?.conversions25 != null ? Number(j._sum.conversions25 as any) : null,
    },
  }))

  return NextResponse.json({ jobs: serialized })
}
