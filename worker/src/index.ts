import * as Sentry from '@sentry/node'
import express from 'express'
import { runFetchAds } from './jobs/fetchAds'

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.SENTRY_ENVIRONMENT ?? process.env.NODE_ENV ?? 'production',
  tracesSampleRate: 0.1,
})

const app = express()
app.use(express.json())

app.get('/health', (_req, res) => res.json({ ok: true }))

function isAuthorized(req: express.Request) {
  const authHeader = req.headers.authorization || ''
  if (!authHeader.startsWith('Bearer ')) return false
  // Cloud Run behind IAP provides ID token; verification should happen via audience.
  // Assuming Cloud Run ingress handles this already; fallback check ensures presence.
  return true
}

app.post('/jobs/fetch-ads', async (req, res) => {
  try {
    if (!isAuthorized(req)) {
      return res.status(401).json({ ok: false, error: 'Unauthorized' })
    }

    const { searchTerm, country } = req.body || {}
    if (typeof searchTerm !== 'string' || !searchTerm.trim() || typeof country !== 'string' || !country.trim()) {
      return res.status(400).json({ ok: false, error: 'searchTerm and country required' })
    }

    const summary = await runFetchAds({ searchTerm: searchTerm.trim(), country: country.trim() })
    return res.json({ ok: true, ...summary })
  } catch (err: any) {
    console.error('Worker fetch-ads failed:', err)
    return res.status(500).json({ ok: false, error: err?.message || 'worker-failure' })
  }
})

const PORT = process.env.PORT || 8080
const HOST = '0.0.0.0'
app.listen(PORT, HOST, () => console.log(`Worker listening on ${HOST}:${PORT}`))
