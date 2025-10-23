'use client'
import { useState } from 'react'

export default function RunPage() {
  const [loading, setLoading] = useState(false)
  const [searchTerm, setSearchTerm] = useState('jetzt einkaufen')
  const [country, setCountry] = useState('DE')
  const [provider, setProvider] = useState<'DATAFORSEO'|'SIMILARWEB'>('DATAFORSEO')

  async function start(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    try {
      const res = await fetch('/api/jobs/fetch-ads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ searchTerm, country, provider }),
      })
      const j = await res.json()
      alert(`Job gestartet (#${j.jobId})`)
    } catch (e) {
      alert('Start fehlgeschlagen')
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="space-y-4">
      <h2 className="text-2xl font-semibold">Run starten</h2>
      <form onSubmit={start} className="grid max-w-xl gap-3">
        <label className="block">
          <span className="mb-1 block text-sm">Suchbegriff</span>
          <input className="w-full rounded border px-3 py-2"
                 value={searchTerm} onChange={e=>setSearchTerm(e.target.value)} />
        </label>
        <label className="block">
          <span className="mb-1 block text-sm">Land</span>
          <select className="w-full rounded border px-3 py-2"
                  value={country} onChange={e=>setCountry(e.target.value)}>
            <option value="DE">Deutschland</option>
            <option value="AT">Österreich</option>
            <option value="CH">Schweiz</option>
          </select>
        </label>
        <label className="block">
          <span className="mb-1 block text-sm">Traffic-Provider</span>
          <select className="w-full rounded border px-3 py-2"
                  value={provider} onChange={e=>setProvider(e.target.value as any)}>
            <option value="DATAFORSEO">DataForSEO</option>
            <option value="SIMILARWEB">Similarweb</option>
          </select>
        </label>
        <button disabled={loading}
                className="rounded bg-blue-600 px-4 py-2 text-white disabled:opacity-50">
          {loading ? 'Wird gestartet…' : 'Run starten'}
        </button>
      </form>
    </main>
  )
}

