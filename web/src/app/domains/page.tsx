'use client'
import { useEffect, useState } from 'react'

type Row = { domain: string; monthly_visits: number; conv_1_5_pct: number; conv_2_5_pct: number }

export default function DomainsPage() {
  const [rows, setRows] = useState<Row[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    (async () => {
      const r = await fetch('/api/domains', { cache: 'no-store' })
      const j = await r.json()
      setRows(j.items || [])
      setLoading(false)
    })()
  }, [])

  return (
    <main className="space-y-4">
      <h2 className="text-2xl font-semibold">Domains</h2>
      {loading ? 'Lade…' : (
        <div className="overflow-x-auto">
          <table className="text-sm">
            <thead>
              <tr>
                <th className="pr-4 text-left">Domain</th>
                <th className="pr-4 text-left">Visits</th>
                <th className="pr-4 text-left">1.5%</th>
                <th className="text-left">2.5%</th>
              </tr>
            </thead>
            <tbody>
              {rows.map(r => (
                <tr key={r.domain}>
                  <td className="pr-4">{r.domain}</td>
                  <td className="pr-4">{r.monthly_visits.toLocaleString('de-DE')}</td>
                  <td className="pr-4">{r.conv_1_5_pct.toLocaleString('de-DE')}</td>
                  <td>{r.conv_2_5_pct.toLocaleString('de-DE')}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      <a href="/api/export" className="inline-block rounded border px-3 py-2">Als CSV exportieren</a>
    </main>
  )
}
