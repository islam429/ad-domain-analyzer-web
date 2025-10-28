import { headers } from 'next/headers'

export function getBaseUrl() {
  if (process.env.NEXT_PUBLIC_BASE_URL) return process.env.NEXT_PUBLIC_BASE_URL
  if (process.env.NEXTAUTH_URL) return process.env.NEXTAUTH_URL

  const h = headers()
  const proto = h.get('x-forwarded-proto') ?? 'https'
  const host = h.get('x-forwarded-host') ?? h.get('host')
  if (!host) throw new Error('Host header missing')
  return `${proto}://${host}`
}
