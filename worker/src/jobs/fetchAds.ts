import { format } from 'date-fns'
import { prisma } from '../db'
import { fetchMetaAds } from '../vendors/meta'
import { extractDomains } from '../parsing/urls'
import { fetchVisitsBatch } from '../vendors/dataforseo'

const MAX_PAGES = Number(process.env.META_MAX_PAGES || 5)

export async function runFetchAds({ searchTerm, country }: { searchTerm: string; country: string }) {
  const seenAds = new Set<string>()
  const seenAdvertisers = new Map<string, string>()
  const ads: Array<{ ad_id: string; page_id: string; page_name: string; ad_creative_link_urls: string[]; start_date?: string }> = []
  const domains = new Set<string>()

  let cursor: string | undefined
  for (let page = 0; page < MAX_PAGES; page += 1) {
    const res = await fetchMetaAds({ searchTerm, country, afterCursor: cursor })
    for (const item of res.items) {
      if (seenAds.has(item.ad_id)) continue
      seenAds.add(item.ad_id)
      ads.push(item)
      if (item.page_id && !seenAdvertisers.has(item.page_id)) {
        seenAdvertisers.set(item.page_id, item.page_name)
      }
      const urls = Array.isArray(item.ad_creative_link_urls) ? item.ad_creative_link_urls : []
      for (const url of extractDomains(urls)) {
        domains.add(url)
      }
    }
    if (!res.nextCursor) break
    cursor = res.nextCursor
  }

  const domainList = Array.from(domains)
  const visitsMap = await fetchVisitsBatch(domainList)
  const month = format(new Date(), 'yyyy-MM')

  let duplicatesSkipped = 0

  await prisma.$transaction(async (tx) => {
    for (const [pageId, pageName] of seenAdvertisers.entries()) {
      await tx.advertiser.upsert({
        where: { pageId },
        update: { name: pageName },
        create: { pageId, name: pageName },
      })
    }

    for (const ad of ads) {
      const advertiser = await tx.advertiser.findUnique({ where: { pageId: ad.page_id }, select: { id: true } })
      if (!advertiser) continue

      const record = await tx.ad.upsert({
        where: { metaAdId: ad.ad_id },
        update: { startedAt: ad.start_date ? new Date(ad.start_date) : null, advertiserId: advertiser.id },
        create: {
          metaAdId: ad.ad_id,
          advertiserId: advertiser.id,
          startedAt: ad.start_date ? new Date(ad.start_date) : null,
        },
      })

      const urls = Array.isArray(ad.ad_creative_link_urls) ? ad.ad_creative_link_urls : []
      for (const host of extractDomains(urls)) {
        const domain = await tx.domain.upsert({
          where: { host },
          update: {},
          create: { host },
        })

        try {
          await tx.adDomain.create({
            data: { adId: record.id, domainId: domain.id },
          })
        } catch (err: any) {
          if (err?.code === 'P2002') {
            duplicatesSkipped += 1
          } else {
            throw err
          }
        }
      }
    }

    for (const host of domainList) {
      const rawEntry = visitsMap[host.toLowerCase()];
      const visits = typeof rawEntry === "number" ? rawEntry : (rawEntry as any)?.visits ?? 0
      const calc15 = Math.round(visits * 0.015)
      const calc25 = Math.round(visits * 0.025)

      const domain = await tx.domain.upsert({
        where: { host },
        update: {},
        create: { host },
      })

      await tx.trafficSnapshot.upsert({
        where: { domainId_month: { domainId: domain.id, month } },
        update: { visits, source: 'dataforseo' },
        create: { domainId: domain.id, month, visits, source: 'dataforseo' },
      })

      (visitsMap as any)[host.toLowerCase()] = { visits, calc15, calc25 }
    }
  })

  const snapshots = domainList.map((host) => {
    const entry = visitsMap[host.toLowerCase()] as any
    const value = typeof entry === 'number' ? entry : entry?.visits ?? 0
    const calc15 = typeof entry === 'object' ? entry.calc15 : Math.round(value * 0.015)
    const calc25 = typeof entry === 'object' ? entry.calc25 : Math.round(value * 0.025)
    return { host, visits: value, conversions15: calc15, conversions25: calc25 }
  })

  return {
    ads: ads.length,
    domains: domainList.length,
    snapshots,
    duplicatesSkipped,
  }
}
