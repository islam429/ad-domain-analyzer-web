export async function fetchAdsViaPlaywright(
  { searchTerm, country, from, to }:
  { searchTerm: string; country: string; from?: string; to?: string }
) {
  const { chromium, devices } = await import('playwright')
  const headless = (process.env.FALLBACK_HEADLESS ?? 'true') !== 'false'

  const browser = await chromium.launch({
    headless,
    args: ['--no-sandbox', '--disable-blink-features=AutomationControlled'],
  })

  const context = await browser.newContext({
    ...devices['Desktop Chrome'],
    locale: 'de-DE',
    userAgent:
      'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/118.0.0.0 Safari/537.36',
    viewport: { width: 1360, height: 900 },
  })

  const page = await context.newPage()

  const params = new URLSearchParams({
    active_status: 'all',
    ad_type: 'political_and_issue_ads',
    country,
    search_type: 'keyword_unordered',
    search_terms: searchTerm,
  })

  await page.goto(`https://www.facebook.com/ads/library/?${params.toString()}`, {
    waitUntil: 'domcontentloaded',
    timeout: 45000,
  })

  await page
    .locator(
      'button:has-text("Alle Cookies"), button:has-text("Allow all"), button:has-text("Accept all"), [data-cookiebanner="accept_button"]',
    )
    .first()
    .click({ timeout: 2500 })
    .catch(() => {})

  for (let i = 0; i < 14; i++) {
    await page.mouse.wheel(0, 1600)
    await page.waitForTimeout(800)
  }

  const snapshotLinks: string[] = await page.evaluate(() => {
    const urls = new Set<string>()
    document.querySelectorAll('a[href*="/ads/library/"]').forEach((a) => {
      const href = (a as HTMLAnchorElement).href
      if (href) urls.add(href)
    })
    return Array.from(urls)
  })

  const targets = snapshotLinks.slice(0, 90)
  const out: any[] = []
  const pool = 6
  let idx = 0

  async function openSnapshot(href: string) {
    const snap = await context.newPage()
    try {
      await snap.goto(href, { waitUntil: 'domcontentloaded', timeout: 25000 })

      if (process.env.DEBUG_FALLBACK === '1') {
        try {
          await snap.screenshot({ path: `/tmp/snap-${Date.now()}.png`, fullPage: true })
        } catch {
          /* ignore */
        }
      }

      const link1 = await snap.evaluate(() => {
        const anchors = Array.from(document.querySelectorAll('a[href^="http"]')) as HTMLAnchorElement[]
        const ext = anchors.find((a) => !/facebook\.com|instagram\.com/i.test(a.href))
        return ext?.href || null
      })

      const linkLphp = await snap.evaluate(() => {
        const anchors = Array.from(document.querySelectorAll('a[href*="l.facebook.com/l.php"]')) as HTMLAnchorElement[]
        for (const a of anchors) {
          try {
            const param = new URL(a.href).searchParams.get('u')
            if (param && !/facebook\.com|instagram\.com/i.test(param)) {
              return decodeURIComponent(param)
            }
          } catch {}
        }
        return null
      })

      const metaLink = await snap.evaluate(() => {
        const og = document.querySelector('meta[property="og:url"]') as HTMLMetaElement | null
        const can = document.querySelector('link[rel="canonical"]') as HTMLLinkElement | null
        return og?.content || can?.href || null
      })

      const link_url = link1 || linkLphp || metaLink || null

      const page_name = await snap.evaluate(() => {
        const h = document.querySelector('[role="heading"], h1, strong')
        return h?.textContent?.trim() || null
      })

      out.push({
        id: href,
        page_name,
        ad_snapshot_url: href,
        link_url,
      })
    } catch {
      // ignore individual snapshot errors
    } finally {
      await snap.close()
    }
  }

  async function worker() {
    while (idx < targets.length) {
      const href = targets[idx++]
      await openSnapshot(href)
    }
  }

  await Promise.all(Array.from({ length: Math.min(pool, targets.length) }, () => worker()))

  await browser.close()
  return out
}
