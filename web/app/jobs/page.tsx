'use client'

import useSWR from 'swr'
import { useState } from 'react'
import AppShell from '@/components/layout/AppShell'
import { Button } from '@/components/ui/Button'
import { Card, CardBody, CardHeader } from '@/components/ui/Card'
import { Input, Label } from '@/components/ui/Input'
import { ViaBadge } from '@/components/ui/ViaBadge'

const fetcher = (u: string) => fetch(u).then((r) => r.json())

import type { Plan } from '@/lib/plan'

export default function JobsPage() {
  const [term, setTerm] = useState('wahl')
  const [country, setCountry] = useState('DE')
  const [toast, setToast] = useState<string | null>(null)
  const { data, mutate, isLoading } = useSWR('/api/jobs/latest', fetcher)
  const { data: planData } = useSWR('/api/me/plan', fetcher)

  async function runJob() {
    setToast(null)
    try {
      const r = await fetch('/api/jobs/fetch-ads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ searchTerm: term, country }),
      })
      const text = await r.text()
      if (!r.ok) {
        throw new Error(text || `HTTP ${r.status}`)
      }
      let j: any = {}
      try {
        j = text ? JSON.parse(text) : {}
      } catch {
        throw new Error(`Antwort war kein JSON:\n${text.slice(0, 200)}`)
      }
      setToast(`Job ${j.jobId} ✓ via ${j.via ?? 'none'} — rows: ${j.rowsInserted ?? j.rows?.length ?? 0}`)
      mutate()
    } catch (e: any) {
      setToast(`Fehler: ${e?.message || 'unbekannt'}`)
    }
  }

  const rows = data?.rows ?? []
  const jobId = data?.jobId ?? '-'
  const plan = (planData?.plan ?? 'free') as Plan

  return (
    <AppShell plan={plan}>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card>
          <CardHeader title="Job starten" subtitle="Ad-Fetch & Enrichment" />
          <CardBody>
            <div className="space-y-3">
              <div>
                <Label htmlFor="term">Suchbegriff</Label>
                <Input id="term" value={term} onChange={(e) => setTerm(e.target.value)} />
              </div>
              <div>
                <Label htmlFor="country">Land (ISO)</Label>
                <Input id="country" value={country} onChange={(e) => setCountry(e.target.value.toUpperCase())} />
              </div>
              <Button onClick={runJob} disabled={isLoading} className="w-full">
                {isLoading ? 'Lade…' : 'Job ausführen'}
              </Button>

              <div className="flex gap-3 pt-2">
                <a href="/api/export/csv">
                  <Button variant="secondary">CSV</Button>
                </a>
                <a href="/api/export/xlsx">
                  <Button variant="secondary">XLSX</Button>
                </a>
              </div>

              {toast && <div className="mt-3 rounded-xl bg-slate-100 text-slate-800 text-sm px-3 py-2">{toast}</div>}
            </div>
          </CardBody>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader title={`Letztes Ergebnis — Job ${jobId}`} subtitle={`${rows.length} Zeile(n)`} />
          <CardBody>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-slate-500">
                    <th className="py-2 pr-4">Domain</th>
                    <th className="py-2 pr-4">Via</th>
                    <th className="py-2 pr-4">Organic ETV</th>
                    <th className="py-2 pr-4">Feat. Snippet</th>
                    <th className="py-2 pr-4">Local Pack</th>
                    <th className="py-2 pr-4">Visits (Search)</th>
                    <th className="py-2 pr-4">Conv 1.5%</th>
                    <th className="py-2 pr-4">Conv 2.5%</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((r: any, i: number) => (
                    <tr key={i} className="border-t border-slate-200">
                      <td className="py-2 pr-4">{r.domain}</td>
                      <td className="py-2 pr-4">
                        <ViaBadge via={(r.via as any) ?? data?.via ?? 'none'} />
                      </td>
                      <td className="py-2 pr-4">{r.organic_etv ?? '—'}</td>
                      <td className="py-2 pr-4">{r.featured_snippet_etv ?? '—'}</td>
                      <td className="py-2 pr-4">{r.local_pack_etv ?? '—'}</td>
                      <td className="py-2 pr-4">{r.visits_search_total ?? '—'}</td>
                      <td className="py-2 pr-4">{r.conversions_15 ?? '—'}</td>
                      <td className="py-2 pr-4">{r.conversions_25 ?? '—'}</td>
                    </tr>
                  ))}
                  {rows.length === 0 && (
                    <tr>
                      <td className="py-6 text-slate-500" colSpan={8}>
                        Keine Daten. Bitte Job ausführen.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </CardBody>
        </Card>
      </div>
    </AppShell>
  )
}
