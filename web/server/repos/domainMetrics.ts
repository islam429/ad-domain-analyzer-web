import { db } from '@/lib/prisma'

type UpsertMonthlyMetricsInput = {
  domain: string
  year: number
  month: number
  organic_etv: number
  paid_etv: number
  featured_snippet_etv: number
  local_pack_etv: number
  visits_search_total: number
}

export async function upsertMonthlyMetrics({
  domain,
  year,
  month,
  organic_etv,
  paid_etv,
  featured_snippet_etv,
  local_pack_etv,
  visits_search_total,
}: UpsertMonthlyMetricsInput) {
  const landing = await db.landingDomain.upsert({
    where: { host: domain },
    update: {},
    create: { host: domain },
  })

  return db.domainMetricsMonthly.upsert({
    where: {
      landingDomainId_year_month: {
        landingDomainId: landing.id,
        year,
        month,
      },
    },
    update: {
      organicEtv: organic_etv,
      paidEtv: paid_etv,
      featuredSnippetEtv: featured_snippet_etv,
      localPackEtv: local_pack_etv,
      visitsSearchTotal: visits_search_total,
    },
    create: {
      landingDomainId: landing.id,
      year,
      month,
      organicEtv: organic_etv,
      paidEtv: paid_etv,
      featuredSnippetEtv: featured_snippet_etv,
      localPackEtv: local_pack_etv,
      visitsSearchTotal: visits_search_total,
    },
  })
}
