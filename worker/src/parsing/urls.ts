export function extractDomains(urls: string[]): string[] {
  const seen = new Set<string>()
  for (const raw of urls) {
    if (!raw || typeof raw !== 'string') continue
    const trimmed = raw.trim()
    if (!trimmed) continue

    let parsed: URL
    try {
      parsed = new URL(trimmed.startsWith('http') ? trimmed : `https://${trimmed}`)
    } catch {
      continue
    }

    const host = parsed.hostname.toLowerCase().replace(/^www\./, '')
    if (host) seen.add(host)
  }
  return Array.from(seen)
}

/*
Example usage:
const domains = extractDomains([
  'https://www.Example.com/path',
  'http://sub.domain.com',
  'invalid-url',
  'example.com',
])
console.log(domains) // ['example.com', 'sub.domain.com']
*/
