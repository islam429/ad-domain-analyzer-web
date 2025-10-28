'use client'
import { FormEvent, useState } from 'react'
import { useRouter } from 'next/navigation'

export default function Register() {
  const r = useRouter()
  const [email, setEmail] = useState('')
  const [name, setName] = useState('')
  const [password, setPassword] = useState('')
  const [err, setErr] = useState<string | null>(null)
  const [ok, setOk] = useState(false)

  async function onSubmit(e: FormEvent) {
    e.preventDefault()
    setErr(null)
    const res = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password, name }),
    })
    if (!res.ok) {
      const j = await res.json().catch(() => ({}))
      setErr((j as any).error || 'Fehler')
      return
    }
    setOk(true)
    setTimeout(() => r.push('/login'), 800)
  }

  return (
    <main style={{ maxWidth: 420, margin: '80px auto', fontFamily: 'system-ui' }}>
      <h1>Registrieren</h1>
      <form onSubmit={onSubmit}>
        <input
          placeholder="Name (optional)"
          value={name}
          onChange={(e) => setName(e.target.value)}
          style={{ width: '100%', padding: 10, margin: '8px 0' }}
        />
        <input
          placeholder="E-Mail"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          style={{ width: '100%', padding: 10, margin: '8px 0' }}
        />
        <input
          placeholder="Passwort (min. 8 Zeichen)"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          style={{ width: '100%', padding: 10, margin: '8px 0' }}
        />
        <button style={{ padding: 10, width: '100%' }}>Konto erstellen</button>
      </form>
      {err && <p style={{ color: 'crimson' }}>{err}</p>}
      {ok && <p style={{ color: 'green' }}>Erfolgreich! Du wirst zum Login weitergeleitet…</p>}
      <p style={{ marginTop: 12 }}>
        Bereits ein Konto? <a href="/login">Zum Login</a>
      </p>
    </main>
  )
}
