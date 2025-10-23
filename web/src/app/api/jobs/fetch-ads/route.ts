// web/src/app/api/jobs/fetch-ads/route.ts
import { NextRequest } from 'next/server'
import { fetchMetaAdDomains } from '@/lib/meta'
import { fetchDomainsViaPlaywright } from '@/lib/playwright'
import { getMonthlyVisits } from '@/lib/traffic'
import { readRows, upsertRows, writeRows } from '@/lib/store'
import pLimit from 'p-limit'

export const runtime = 'nodejs'         // <- wichtig für Playwright
export const dynamic = 'force-dynamic'  // kein Cache

export async function POST(req: NextRequest) {
  const { searchTerm = 'jetzt einkaufen', country = 'DE', provider } = await req.json().catch(() => ({}))
  const prov = (provider || process.env.TRAFFIC_PROVIDER || 'DATAFORSEO') as 'DATAFORSEO' | 'SIMILARWEB'

  const token = process.env.META_ACCESS_TOKEN

  let domains: string[] = []
  try {
    if (token) {
      domains = await fetchMetaAdDomains(searchTerm, country, token)
    }
  } catch {
    // Meta-API fehlgeschlagen -> Fallback erlaubt?
  }

  if (domains.length === 0 && process.env.PLAYWRIGHT_ENABLED === 'true') {
    try {
      domains = await fetchDomainsViaPlaywright(searchTerm, country)
    } catch (e) {
      console.error('Playwright fallback error', e)
    }
  }

  if (domains.length === 0) {
    return Response.json({ error: 'Keine Domains gefunden (Meta & Fallback leer).' }, { status: 502 })
  }

  // Visits parallel & limitiert holen
  const limit = pLimit(5)
  const results = await Promise.all(
    domains.map((d) =>
      limit(async () => {
        const visits = await getMonthlyVisits(d, prov)
        const monthly_visits = visits ?? 0
        return {
          domain: d,
          monthly_visits,
          conv_1_5_pct: Math.round(monthly_visits * 0.015),
          conv_2_5_pct: Math.round(monthly_visits * 0.025),
        }
      }),
    ),
  )

  // speichern
  const existing = await readRows()
  const merged = upsertRows(existing, results)
  await writeRows(merged)

  return Response.json({ ok: true, domains: results.map((r) => r.domain) })
}
