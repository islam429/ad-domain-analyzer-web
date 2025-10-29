'use client'
import { useState } from 'react'

type Plan = 'starter' | 'pro' | 'business'

export default function BillingPage() {
  const [loading, setLoading] = useState<Plan | null>(null)
  const [err, setErr] = useState<string | null>(null)

  async function callApi(url: string, body?: Record<string, unknown>) {
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: body ? JSON.stringify(body) : undefined,
    })

    const contentType = res.headers.get('content-type') || ''
    let data: any = {}
    if (contentType.includes('application/json')) {
      try {
        data = await res.json()
      } catch (err) {
        throw new Error(`Antwort war kein gültiges JSON (${err})`)
      }
    }

    if (!res.ok) {
      throw new Error(data?.error || `${res.status} ${res.statusText}`)
    }

    if (!data?.url) {
      throw new Error('Serverantwort enthält keine Weiterleitungs-URL')
    }

    window.location.assign(data.url)
  }

  async function openPortal() {
    try {
      await callApi('/api/billing/portal')
    } catch (e: any) {
      setErr(e?.message || 'Fehler beim Portal-Aufruf')
    }
  }

  async function start(plan: Plan) {
    setErr(null)
    setLoading(plan)
    try {
      await callApi('/api/billing/checkout', { plan })
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
