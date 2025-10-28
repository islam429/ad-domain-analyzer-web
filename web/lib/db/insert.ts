import { db } from '@/lib/prisma'

export async function insertAdRows(
  jobId: number | string | bigint,
  orgId: string,
  rows: Array<{ domain: string; [key: string]: any }>,
) {
  if (!rows.length) return

  let jobKey: bigint | null = null
  try {
    if (typeof jobId === 'bigint') jobKey = jobId
    else if (typeof jobId === 'number' && Number.isFinite(jobId)) jobKey = BigInt(jobId)
    else if (typeof jobId === 'string') {
      const parsed = BigInt(parseInt(jobId, 10))
      jobKey = parsed
    }
  } catch {
    jobKey = null
  }

  if (jobKey === null) return

  await db.adRow.createMany({
    data: rows.map((r) => ({
      jobId: jobKey!,
      orgId: orgId ?? null,
      domain: r.domain,
      organicEtv: r.organic_etv ?? null,
      paidEtv: r.paid_etv ?? null,
      featuredSnippetEtv: r.featured_snippet_etv ?? null,
      localPackEtv: r.local_pack_etv ?? null,
      visitsSearchTotal: r.visits_search_total ?? null,
      conversions15: r.conversions_15 ?? null,
      conversions25: r.conversions_25 ?? null,
    })),
    skipDuplicates: true,
  })
}
