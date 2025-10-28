import fetch from 'node-fetch'
import { retry } from '../util/retry'
import { createLimiter } from '../util/rateLimit'

const limiter = createLimiter({ ratePerSec: Number(process.env.DATAFORSEO_RATE_LIMIT || 5) })

const API_URL = 'https://api.dataforseo.com/v3/traffic_analytics/similarweb/live'
const MAX_BATCH = 50

type ApiResponse = {
  tasks?: Array<{
    result?: Array<{
      target: string
      traffic?: {
        estimated_visits?: number
      }
    }>
  }>
}

function chunk<T>(arr: T[], size: number): T[][] {
  const out: T[][] = []
  for (let i = 0; i < arr.length; i += size) out.push(arr.slice(i, i + size))
  return out
}

function getAuthHeader() {
  const login = process.env.DATAFORSEO_LOGIN
  const password = process.env.DATAFORSEO_PASSWORD
  if (!login || !password) throw new Error('DATAFORSEO credentials missing')
  const token = Buffer.from(`${login}:${password}`).toString('base64')
  return `Basic ${token}`
}

export async function fetchVisitsBatch(domains: string[]): Promise<Record<string, number>> {
  const result: Record<string, number> = {}
  if (!domains.length) return result

  const batches = chunk(domains, MAX_BATCH)
  const auth = getAuthHeader()

  for (const batch of batches) {
    await limiter()

    const payload = await retry(async () => {
      const res = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: auth,
        },
        body: JSON.stringify({ data: batch.map((target) => ({ target })) }),
      })

      if (!res.ok) {
        const text = await res.text().catch(() => '')
        throw new Error(`DataForSEO ${res.status}: ${text}`)
      }
      return (await res.json()) as ApiResponse
    })

    const tasks = Array.isArray(payload?.tasks) ? payload.tasks : []
    for (const task of tasks) {
      const entries = Array.isArray(task?.result) ? task.result : []
      for (const entry of entries) {
        const domain = (entry?.target ?? '').toLowerCase()
        if (!domain) continue
        const visits = entry?.traffic?.estimated_visits
        result[domain] = typeof visits === 'number' && Number.isFinite(visits) ? Math.round(visits) : 0
      }
    }

    for (const domain of batch) {
      const key = domain.toLowerCase()
      if (!(key in result)) {
        result[key] = 0
      }
    }
  }

  return result
}
