export async function getMonthlyVisits(domain: string, provider: 'DATAFORSEO'|'SIMILARWEB'): Promise<number|null> {
  if (provider === 'SIMILARWEB') return similarweb(domain)
  return dataforseo(domain)
}

async function similarweb(domain: string): Promise<number|null> {
  const key = process.env.SIMILARWEB_API_KEY
  if (!key) return null
  const now = new Date()
  const end = `${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,'0')}`
  const url = `https://api.similarweb.com/v1/website/${encodeURIComponent(domain)}/total-traffic-and-engagement/visits?api_key=${key}&start_date=${end}&end_date=${end}&country=worldwide&granularity=monthly`
  const res = await fetch(url)
  if (!res.ok) return null
  const js: any = await res.json()
  const arr = js?.visits || js?.data || js?.values
  const last = Array.isArray(arr) ? arr[arr.length-1] : undefined
  const value = last?.visits ?? last?.value
  return typeof value === 'number' ? Math.round(value) : null
}

async function dataforseo(domain: string): Promise<number|null> {
  const login = process.env.DATAFORSEO_LOGIN
  const password = process.env.DATAFORSEO_PASSWORD
  if (!login || !password) return null

  const endpoint = 'https://api.dataforseo.com/v3/traffic_analytics/summary/live'
  const body = [{ target: domain }]

  const res = await fetch(endpoint, {
    method: 'POST',
    headers: {
      'Authorization': 'Basic ' + Buffer.from(`${login}:${password}`).toString('base64'),
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  })
  if (!res.ok) return null
  const js: any = await res.json()
  const task = js?.tasks?.[0]?.result?.[0]
  const v = task?.visits ?? task?.monthly_visits ?? task?.traffic?.visits
  return typeof v === 'number' ? Math.round(v) : null
}
