import fetch from 'node-fetch'
import { createLimiter } from '../util/rateLimit'
import { retry } from '../util/retry'

const limiter = createLimiter({ ratePerSec: Number(process.env.META_RATE_LIMIT || 5) })

export type MetaAdsResponse = {
  items: Array<{
    ad_id: string
    page_id: string
    page_name: string
    ad_creative_link_urls: string[]
    start_date?: string
  }>
  nextCursor?: string
}

type FetchArgs = {
  searchTerm: string
  country: string
  afterCursor?: string
}

const META_API = 'https://graph.facebook.com/v20.0/ads_archive'

export async function fetchMetaAds({ searchTerm, country, afterCursor }: FetchArgs): Promise<MetaAdsResponse> {
  const token = process.env.META_ACCESS_TOKEN
  if (!token) throw new Error('META_ACCESS_TOKEN missing')

  const params = new URLSearchParams({
    search_terms: searchTerm,
    ad_reached_countries: country,
    access_token: token,
    ad_type: process.env.META_AD_TYPE ?? 'POLITICAL_AND_ISSUE_ADS',
    limit: '25',
    fields: ['ad_archive_id', 'page_id', 'page_name', 'ad_creation_time', 'ad_creative_link_urls'].join(','),
  })

  if (afterCursor) params.set('after', afterCursor)

  await limiter()

  const payload = await retry(async () => {
    const res = await fetch(`${META_API}?${params.toString()}`)
    if (!res.ok) {
      const text = await res.text().catch(() => '')
      throw new Error(`Meta API ${res.status}: ${text}`)
    }
    return (await res.json()) as any
  })

  const data = Array.isArray(payload?.data) ? payload.data : []
  const items = data.map((item: any) => ({
    ad_id: String(item?.ad_archive_id ?? item?.id ?? ''),
    page_id: String(item?.page_id ?? ''),
    page_name: String(item?.page_name ?? ''),
    ad_creative_link_urls: Array.isArray(item?.ad_creative_link_urls)
      ? item.ad_creative_link_urls.map(String)
      : [],
    start_date: item?.ad_creation_time ?? undefined,
  })).filter((item: any) => item.ad_id && item.page_id)

  const nextCursor = payload?.paging?.cursors?.after ? String(payload.paging.cursors.after) : undefined

  return { items, nextCursor }
}
