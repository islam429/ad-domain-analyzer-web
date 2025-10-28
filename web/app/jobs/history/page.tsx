'use client'

import useSWR from 'swr'
import AppShell from '@/components/layout/AppShell'
import { Card, CardBody, CardHeader } from '@/components/ui/Card'
import Link from 'next/link'
import { fmt } from '@/lib/format'

const fetcher = (u: string) => fetch(u).then((r) => r.json())

export default function JobsHistoryPage() {
  const { data, isLoading, error, mutate } = useSWR('/api/jobs/history', fetcher, { refreshInterval: 15000 })
  const jobs = data?.jobs ?? []

  return (
    <AppShell>
      <Card>
        <CardHeader title="Jobs-Historie" subtitle={isLoading ? 'lädt…' : `${jobs.length} Einträge`} />
        <CardBody>
          {error && <div className="mb-3 text-sm text-danger">Fehler beim Laden</div>}
          <div className="mb-4">
            <button
              onClick={() => mutate()}
              className="px-3 py-2 text-sm rounded-lg border border-slate-300 hover:bg-slate-50"
            >
              Aktualisieren
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-slate-500">
                  <th className="py-2 pr-4">Job ID</th>
                  <th className="py-2 pr-4">Datum</th>
                  <th className="py-2 pr-4">Rows</th>
                  <th className="py-2 pr-4">Visits (Summe)</th>
                  <th className="py-2 pr-4">Conv 1.5%</th>
                  <th className="py-2 pr-4">Conv 2.5%</th>
                  <th className="py-2 pr-4"></th>
                </tr>
              </thead>
              <tbody>
                {jobs.map((j: any) => (
                  <tr key={j.job_id} className="border-t border-slate-200">
                    <td className="py-2 pr-4 font-medium">{j.job_id}</td>
                    <td className="py-2 pr-4">
                      {j._min?.created_at ? new Date(j._min.created_at).toLocaleString('de-DE') : '—'}
                    </td>
                    <td className="py-2 pr-4">{j._count?._all ?? 0}</td>
                    <td className="py-2 pr-4">{fmt(j._sum?.visits_search_total)}</td>
                    <td className="py-2 pr-4">{fmt(j._sum?.conversions_15)}</td>
                    <td className="py-2 pr-4">{fmt(j._sum?.conversions_25)}</td>
                    <td className="py-2 pr-4">
                      <Link href={`/jobs/${j.job_id}`} className="text-brand-700 hover:underline">
                        Details
                      </Link>
                    </td>
                  </tr>
                ))}
                {!isLoading && jobs.length === 0 && (
                  <tr>
                    <td className="py-6 text-slate-500" colSpan={7}>
                      Noch keine Jobs vorhanden.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardBody>
      </Card>
    </AppShell>
  )
}
