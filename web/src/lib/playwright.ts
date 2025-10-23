// web/src/lib/playwright.ts
// Fallback: Domains aus der Meta Ad Library Web-UI scrapen (CTA-Links)
export async function fetchDomainsViaPlaywright(searchTerm: string, country: string): Promise<string[]> {
  if (process.env.PLAYWRIGHT_ENABLED !== 'true') return []

  // Playwright nur laden, wenn wirklich benötigt (vermeidet Build-Probleme)
  const { chromium } = await import('playwright')

  const q = encodeURIComponent(searchTerm)
  const url =
    `https://www.facebook.com/ads/library/` +
    `?active_status=all&ad_type=all&country=${encodeURIComponent(country)}` +
    `&q=${q}&sort_data%5Bdirection%5D=desc&sort_data%5Bmode%5D=relevancy_monthly_grouped`

  const browser = await chromium.launch({ headless: true })
  const ctx = await browser.newContext({
    locale: country === 'DE' ? 'de-DE' : 'en-US',
    userAgent:
      'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124 Safari/537.36',
  })
  const page = await ctx.newPage()

  try {
    await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 60_000 })

    // Cookie-Banner wegklicken (verschiedene Sprachvarianten)
    const cookieBtn = page.getByRole('button', {
      name: /Nur erlauben|Nur notwendige|Essentials|Only allow|Allow all|Alle erlauben|Akzeptieren/i,
    })
    if (await cookieBtn.isVisible().catch(() => false)) {
      await cookieBtn.click().catch(() => undefined)
    }

    // Mehr Inhalte laden – "sanftes" Endlos-Scrollen
    const ctaRegex = /Jetzt einkaufen|Jetzt kaufen|Zum Shop|Shop now|Learn more|Mehr dazu|Mehr erfahren/i
    let noGrowth = 0
    let lastCount = 0
    for (let i = 0; i < 20; i++) {
      await page.evaluate(() => window.scrollBy(0, document.body.scrollHeight))
      await page.waitForTimeout(1200)

      const count = await page.locator('a').filter({ hasText: ctaRegex }).count()
      if (count <= lastCount) noGrowth++
      else noGrowth = 0
      lastCount = count
      if (noGrowth >= 3) break
    }

    // Alle CTA-Links einsammeln
    const links = await page
      .locator('a')
      .filter({ hasText: ctaRegex })
      .evaluateAll((els) => els.map((el) => (el as HTMLAnchorElement).href))

    // In Domains umwandeln (Facebook-Redirects l.php -> u=...)
    const domains = new Set<string>()
    for (const href of links) {
      const d = normalizeDomain(href)
      if (d) domains.add(d)
    }
    return [...domains]
  } finally {
    await browser.close().catch(() => undefined)
  }
}

function normalizeDomain(href: string): string | null {
  try {
    // relative URLs gegen facebook.com auflösen
    const u = new URL(href, 'https://facebook.com')
    // l.php?u=<encoded target>
    if (u.hostname.endsWith('facebook.com') && (u.pathname === '/l.php' || u.hostname === 'l.facebook.com')) {
      const t = u.searchParams.get('u') ?? u.searchParams.get('l')
      if (t) {
        const inner = new URL(t)
        return inner.hostname.replace(/^www\./, '')
      }
    }
    return u.hostname.replace(/^www\./, '')
  } catch {
    return null
  }
}
