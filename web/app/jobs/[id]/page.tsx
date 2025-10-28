import { headers } from 'next/headers'
import AppShell from '@/components/layout/AppShell'
import { Card, CardBody, CardHeader } from '@/components/ui/Card'
import { fmt } from '@/lib/format'
import JobProgress from './JobProgress'

type Props = { params: { id: string } }

export default async function JobDetailPage({ params }: Props) {
  const h = headers()
  const proto = h.get('x-forwarded-proto') ?? 'http'
  const host = h.get('host') ?? 'localhost:3001'
  const base = process.env.NEXT_PUBLIC_URL ?? `${proto}://${host}`

  const res = await fetch(`${base}/api/jobs/by-id/${params.id}`, { cache: 'no-store', redirect: 'manual' })
  const contentType = res.headers.get('content-type') || ''
  const body = await res.text()

  if (res.status >= 300 && res.status < 400) {
    const loc = res.headers.get('location')
    throw new Error(`Redirect (${res.status}) nach: ${loc}`)
  }
  if (!res.ok) {
    throw new Error(`API ${res.status} ${res.statusText}\n${body.slice(0, 400)}`)
  }
  if (!contentType.includes('application/json')) {
    throw new Error(`Erwartete JSON, bekam: ${contentType}\nBody: ${body.slice(0, 400)}`)
  }

  const data = JSON.parse(body)
  const rows = data?.rows ?? []

  return (
    <AppShell>
      <div className="mb-6">
        <JobProgress id={params.id} />
      </div>
      <Card>
        <CardHeader title={`Job #${params.id}`} subtitle={`${rows.length} Zeile(n)`} />
        <CardBody>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-slate-500">
                  <th className="py-2 pr-4">Domain</th>
                  <th className="py-2 pr-4">Organic</th>
                  <th className="py-2 pr-4">Feat. Snippet</th>
                  <th className="py-2 pr-4">Local Pack</th>
                  <th className="py-2 pr-4">Paid</th>
                  <th className="py-2 pr-4">Visits</th>
                  <th className="py-2 pr-4">1.5%</th>
                  <th className="py-2 pr-4">2.5%</th>
                  <th className="py-2 pr-4">Zeit</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((r: any, i: number) => (
                  <tr key={i} className="border-t border-slate-200">
                    <td className="py-2 pr-4">{r.domain}</td>
                    <td className="py-2 pr-4">{fmt(r.organic_etv)}</td>
                    <td className="py-2 pr-4">{fmt(r.featured_snippet_etv)}</td>
                    <td className="py-2 pr-4">{fmt(r.local_pack_etv)}</td>
                    <td className="py-2 pr-4">{fmt(r.paid_etv)}</td>
                    <td className="py-2 pr-4">{fmt(r.visits_search_total)}</td>
                    <td className="py-2 pr-4">{fmt(r.conversions_15)}</td>
                    <td className="py-2 pr-4">{fmt(r.conversions_25)}</td>
                    <td className="py-2 pr-4">{r.created_at ? new Date(r.created_at).toLocaleString('de-DE') : '—'}</td>
                  </tr>
                ))}
                {rows.length === 0 && (
                  <tr>
                    <td className="py-6 text-slate-500" colSpan={9}>
                      Keine Daten gefunden.
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
