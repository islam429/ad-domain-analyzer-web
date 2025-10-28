import { Buffer } from 'node:buffer'

export type EtvBreakdown = {
  organic_etv: number
  paid_etv: number
  featured_snippet_etv: number
  local_pack_etv: number
  visits_search_total: number
}

export async function fetchEtvBreakdown(
  domains: string[],
  opts: { location_code: number; language_code: string },
): Promise<Record<string, EtvBreakdown>> {
  if (!domains.length) return {}

  const login = process.env.DATAFORSEO_LOGIN
  const password = process.env.DATAFORSEO_PASSWORD
  if (!login || !password) throw new Error('DATAFORSEO credentials missing')

  const endpoint =
    'https://api.dataforseo.com/v3/dataforseo_labs/google/bulk_traffic_estimation/live'
  const body = [
    {
      targets: domains,
      location_code: opts.location_code,
      language_code: opts.language_code,
      item_types: ['organic', 'paid', 'featured_snippet', 'local_pack'],
    },
  ]

  const res = await fetch(endpoint, {
    method: 'POST',
    headers: {
      Authorization: `Basic ${Buffer.from(`${login}:${password}`).toString('base64')}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  })
  if (!res.ok) throw new Error(`DataForSEO API responded with ${res.status}`)

  const json: any = await res.json()
  const items: any[] = json?.tasks?.[0]?.result?.[0]?.items ?? []
  const result: Record<string, EtvBreakdown> = {}

  for (const item of items) {
    const key = typeof item?.target === 'string' ? item.target.toLowerCase() : null
    if (!key) continue
    const metrics = item?.metrics ?? {}
    const organic = coerce(metrics?.organic?.etv ?? metrics?.organic_etv)
    const paid = coerce(metrics?.paid?.etv ?? metrics?.paid_etv)
    const featured = coerce(metrics?.featured_snippet?.etv ?? metrics?.featured_snippet_etv)
    const local = coerce(metrics?.local_pack?.etv ?? metrics?.local_pack_etv)
    const total = organic + paid + featured + local
    result[key] = {
      organic_etv: organic,
      paid_etv: paid,
      featured_snippet_etv: featured,
      local_pack_etv: local,
      visits_search_total: total,
    }
  }

  for (const domain of domains) {
    const key = domain.toLowerCase()
    if (!result[key]) {
      result[key] = {
        organic_etv: 0,
        paid_etv: 0,
        featured_snippet_etv: 0,
        local_pack_etv: 0,
        visits_search_total: 0,
      }
    }
  }

  return result
}

const coerce = (value: unknown): number =>
  typeof value === 'number' && Number.isFinite(value) ? value : 0
