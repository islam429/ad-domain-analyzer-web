import { db } from '@/lib/prisma'

type UpsertAdvertiserInput = {
  meta_page_id: string
  name: string | null
}

type UpsertCreativeInput = {
  meta_ad_id: string
  advertiser_id: string
  meta_page_id?: string | null
  country?: string | null
  started_at?: Date | null
  ended_at?: Date | null
  creative_type?: string | null
  thumbnail_url?: string | null
  body?: string | null
  call_to_action?: string | null
  landing_url?: string | null
}

type UpsertDomainInput = {
  domain: string
  root_domain?: string | null
}

type linkCreativeDomainInput = {
  creative_id: string
  domain_id: string
}

type CreateJobInput = {
  search_term: string
  country: string
  status: string
  rows_inserted?: number | null
}

export async function upsertAdvertiser({ meta_page_id, name }: UpsertAdvertiserInput) {
  if (!name) name = meta_page_id

  return db.advertiser.upsert({
    where: { pageId: meta_page_id },
    update: { name },
    create: { name, pageId: meta_page_id },
  })
}

export async function upsertCreative({ meta_ad_id, advertiser_id, body }: UpsertCreativeInput) {
  return db.creative.upsert({
    where: { externalId: meta_ad_id },
    update: {
      advertiserId: advertiser_id,
      text: body ?? null,
    },
    create: {
      advertiserId: advertiser_id,
      externalId: meta_ad_id,
      text: body ?? null,
    },
  })
}

export async function upsertDomain({ domain }: UpsertDomainInput) {
  return db.landingDomain.upsert({
    where: { host: domain },
    update: {},
    create: { host: domain },
  })
}

export async function linkCreativeDomain({ creative_id, domain_id }: linkCreativeDomainInput) {
  const creativeIdStr = typeof creative_id === 'string' ? creative_id : String(creative_id)
  const domainIdStr = typeof domain_id === 'string' ? domain_id : String(domain_id)

  return db.creativeLandingDomain.upsert({
    where: {
      creativeId_landingDomainId: {
        creativeId: creativeIdStr,
        landingDomainId: domainIdStr,
      },
    },
    update: {},
    create: {
      creativeId: creativeIdStr,
      landingDomainId: domainIdStr,
    },
  })
}

export async function createJob({ search_term, country, status, rows_inserted }: CreateJobInput): Promise<number> {
  const job = await db.job.create({
    data: {
      status,
      searchTerm: search_term,
      country,
      rowsInserted: rows_inserted ?? null,
    },
  })

  return Number(job.id)
}

export async function attachDomainsToJob(jobId: number | string, domains: string[]) {
  const uniq = Array.from(
    new Set(
      domains
        .filter(Boolean)
        .map((d) =>
          String(d)
            .toLowerCase()
            .replace(/^https?:\/\//, '')
            .replace(/\/.*$/, '')
            .replace(/^www\./, ''),
        ),
    ),
  )

  for (const host of uniq) {
    const ld =
      (await db.landingDomain.upsert({
        where: { host },
        update: { updatedAt: new Date() },
        create: { host, rootDomain: host.replace(/^www\./, '') },
      })) ?? null

    if (!ld) continue

    await db.jobResultDomain
      .upsert({
        where: { jobId_landingDomainId: { jobId: Number(jobId), landingDomainId: ld.id } },
        update: {},
        create: { jobId: Number(jobId), landingDomainId: ld.id },
      })
      .catch(() => {})
  }
}
