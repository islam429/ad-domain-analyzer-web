import * as cheerio from 'cheerio'

function safeUrl(h: string): URL | null {
  try {
    if (!h || h.startsWith('/')) return null
    return new URL(h)
  } catch { return null }
}

export async function fetchMetaAdDomains(searchTerm: string, country: string, accessToken: string): Promise<string[]> {
  // Meta Ads Archive API – Felder/Version ggf. anpassen (v19 ist ein Beispiel)
  const params = new URLSearchParams({
    search_terms: searchTerm,
    ad_reached_countries: JSON.stringify([country]),
    ad_type: 'ALL',
    limit: '200',
    fields: 'ad_snapshot_url',
    access_token: accessToken,
  })
  const url = `https://graph.facebook.com/v19.0/ads_archive?${params.toString()}`
  const res = await fetch(url)
  if (!res.ok) throw new Error(`Meta API ${res.status}`)
  const json: any = await res.json()

  const snapshotUrls: string[] = (json.data || [])
    .map((x: any) => x.ad_snapshot_url)
    .filter(Boolean)

  const domains = new Set<string>()

  for (const snap of snapshotUrls) {
    try {
      const htmlRes = await fetch(snap, { headers: { 'user-agent': 'Mozilla/5.0' } })
      if (!htmlRes.ok) continue
      const html = await htmlRes.text()
      const $ = cheerio.load(html)

      $('a[href]').each((_, el) => {
        const href = String($(el).attr('href') || '')
        const u = safeUrl(href)
        if (!u) return
        const host = u.hostname.replace(/^www\./, '')
        // offensichtliche Plattform-Hosts filtern
        if (host.endsWith('facebook.com') || host.endsWith('instagram.com') || host.endsWith('whatsapp.com')) return
        domains.add(host)
      })
    } catch { /* ignorieren und weiter */ }
  }
  return [...domains]
}
