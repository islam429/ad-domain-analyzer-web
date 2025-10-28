import { getLogger } from '@/lib/logger'

type FetchAdsOptions = {
  searchTerm: string
  country: string
  from?: string
  to?: string
}

const GRAPH_ENDPOINT = 'https://graph.facebook.com/v19.0/ads_archive'

export async function fetchAdsFromMeta({ searchTerm, country, from, to }: FetchAdsOptions) {
  const token = process.env.META_ACCESS_TOKEN
  if (!token) {
    throw new Error('META_ACCESS_TOKEN is not set')
  }

  const logger = getLogger()
  const items: any[] = []
  let after: string | undefined

  do {
    const url = new URL(GRAPH_ENDPOINT)
    url.searchParams.set('search_terms', searchTerm ?? '')
    url.searchParams.set('search_type', 'KEYWORD_UNORDERED')
    url.searchParams.set('ad_type', process.env.META_AD_TYPE ?? 'POLITICAL_AND_ISSUE_ADS')
    url.searchParams.set('ad_active_status', 'ALL')
    url.searchParams.set('ad_reached_countries', JSON.stringify([country ?? 'DE']))
    url.searchParams.set(
      'fields',
      'id,page_id,page_name,ad_delivery_start_time,ad_delivery_stop_time,ad_creative_bodies,ad_snapshot_url,link_url',
    )
    url.searchParams.set('limit', '200')
    if (from) url.searchParams.set('ad_delivery_date_min', from)
    if (to) url.searchParams.set('ad_delivery_date_max', to)
    if (after) url.searchParams.set('after', after)

    const res = await fetch(url.toString(), {
      headers: { Authorization: `Bearer ${token}` },
    })
    const bodyText = await res.text()
    if (!res.ok) {
      logger.error(`Meta API error: status=${res.status} body=${String(bodyText)}`)
      throw new Error(`Meta API responded with ${res.status}`)
    }

    let json: any
    try {
      json = JSON.parse(bodyText)
    } catch (err) {
      logger.error(
        `Meta API JSON parse error: err=${(err as Error)?.message ?? String(err)} body=${String(bodyText)}`,
      )
      throw err
    }
    const pageItems: any[] = json?.data ?? []
    items.push(...pageItems)
    after = json?.paging?.cursors?.after
  } while (after)

  logger.info({ count: items.length }, 'fetched ads from Meta')
  return items
}
