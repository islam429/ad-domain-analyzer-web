import { prisma } from '@/lib/prisma'
import { auth } from '@/lib/auth'

type JobRow = {
  domain: string
  monthlyVisits?: number | null
  conv15?: number | null
  conv25?: number | null
}

type JobResult = {
  id: number
  rows: JobRow[]
}

export async function getJob(jobId: string): Promise<JobResult | null> {
  const session = await auth()
  const email = session?.user?.email
  if (!email) return null

  const membership = await prisma.membership.findFirst({
    where: { userId: email },
    select: { orgId: true },
  })
  const orgId = membership?.orgId
  if (!orgId) return null

  const idNum = Number(jobId)
  if (!Number.isFinite(idNum)) return null

  const rowsRaw = await prisma.adRow.findMany({
    where: { orgId, jobId: BigInt(idNum) as any },
    orderBy: { id: 'asc' },
    select: {
      domain: true,
      visitsSearchTotal: true,
      conversions15: true,
      conversions25: true,
    },
    take: 5000,
  })

  if (!rowsRaw.length) return null

  const rows: JobRow[] = rowsRaw.map((r) => ({
    domain: r.domain,
    monthlyVisits: r.visitsSearchTotal ?? null,
    conv15: r.conversions15 ?? null,
    conv25: r.conversions25 ?? null,
  }))

  return { id: idNum, rows }
}
