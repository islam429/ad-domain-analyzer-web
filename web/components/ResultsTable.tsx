'use client'

import React from 'react'

type Row = {
  domain: string
  organic_etv: number
  paid_etv: number
  featured_snippet_etv: number
  local_pack_etv: number
  visits_search_total: number
  paid_share: number
  rev_paid_low: number
  rev_paid_high: number
  rev_search_total_low: number
  rev_search_total_high: number
}

export default function ResultsTable({ rows, mode }: { rows: Row[]; mode: 'paid' | 'search_total' }) {
  const n = (x: number) => Math.round(x).toLocaleString('de-DE')
  const money = (x: number) => x.toLocaleString('de-DE', { style: 'currency', currency: 'EUR' })

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full text-sm">
        <thead>
          <tr className="text-left">
            <th className="p-2">Domain</th>
            <th className="p-2">Organic</th>
            <th className="p-2">Paid</th>
            <th className="p-2">Featured</th>
            <th className="p-2">Local</th>
            <th className="p-2">% Paid</th>
            <th className="p-2">Search Total</th>
            <th className="p-2">Revenue Low</th>
            <th className="p-2">Revenue High</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => {
            const revLow = mode === 'paid' ? r.rev_paid_low : r.rev_search_total_low
            const revHigh = mode === 'paid' ? r.rev_paid_high : r.rev_search_total_high

            return (
              <tr key={r.domain} className="border-t">
                <td className="p-2">{r.domain}</td>
                <td className="p-2">{n(r.organic_etv)}</td>
                <td className="p-2">{n(r.paid_etv)}</td>
                <td className="p-2">{n(r.featured_snippet_etv)}</td>
                <td className="p-2">{n(r.local_pack_etv)}</td>
                <td className="p-2">{Math.round((r.paid_share || 0) * 100)}%</td>
                <td className="p-2 font-medium">{n(r.visits_search_total)}</td>
                <td className="p-2">{money(revLow)}</td>
                <td className="p-2">{money(revHigh)}</td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
