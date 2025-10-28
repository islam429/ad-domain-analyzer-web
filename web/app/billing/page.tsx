'use client'
import { useState } from 'react'

type Plan = 'starter' | 'pro' | 'business'

export default function BillingPage() {
  const [loading, setLoading] = useState<Plan | null>(null)
  const [err, setErr] = useState<string | null>(null)

  async function openPortal() {
    try {
      const r = await fetch('/api/billing/portal', { method: 'POST' })
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
      if (j?.url) window.location.href = j.url
      else setErr(j?.error || 'Fehler beim Portal-Aufruf')
    } catch (e: any) {
      setErr(e?.message || 'Fehler beim Portal-Aufruf')
    }
  }

  async function start(plan: Plan) {
    setErr(null)
    setLoading(plan)
    try {
      const r = await fetch('/api/billing/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan }),
      })
      const j = await r.json()
      if (!r.ok || !j?.url) throw new Error(j?.error || `HTTP ${r.status}`)
      window.location.href = j.url
    } catch (e: any) {
      setErr(e?.message || 'Fehler beim Checkout')
    } finally {
      setLoading(null)
    }
  }

  const Btn = (label: string, plan: Plan) => (
    <button
      onClick={() => start(plan)}
      disabled={loading === plan}
      className="px-6 py-3 rounded-xl border hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition"
    >
      {loading === plan ? 'Weiterleiten…' : label}
    </button>
  )

  return (
    <main className="max-w-3xl mx-auto my-16 font-[system-ui] px-6">
      <div className="rounded-3xl border bg-white/60 shadow-sm p-8">
        <h1 className="text-3xl font-semibold tracking-tight">Upgrade</h1>
        <p className="text-gray-600 mt-2">Wähle den Plan, der zu deinem Team passt.</p>
        <div className="flex flex-wrap items-center gap-3 mt-6">
          {Btn('Starter', 'starter')}
          {Btn('Pro', 'pro')}
          {Btn('Business', 'business')}
          <button onClick={openPortal} className="px-6 py-3 rounded-xl border bg-gray-900 text-white hover:bg-gray-800 transition">
            Abo verwalten
          </button>
        </div>
        {err && <p className="text-rose-600 mt-4">❗ {err}</p>}
        <p className="text-sm text-gray-500 mt-6">
          Testkarte: <code>4242 4242 4242 4242</code>, Datum in Zukunft, CVC <code>123</code>, PLZ <code>12345</code>
        </p>
      </div>
    </main>
  )
}
