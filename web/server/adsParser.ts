export function extractDomains(ads: any[]): string[] {
  const domains = new Set<string>()
  for (const ad of ads) {
    let url: string | null = ad?.link_url ?? null

    if (!url && typeof ad?.ad_snapshot_url === 'string') {
      try {
        const u = new URL(ad.ad_snapshot_url)
        const q = u.searchParams.get('url')
        if (q) url = q
      } catch {}
    }

    if (!url) continue
    try {
      const host = new URL(url).hostname.toLowerCase().replace(/^www\./, '')
      if (host && !/facebook\.com|instagram\.com$/.test(host)) domains.add(host)
    } catch {}
  }
  return Array.from(domains)
}
