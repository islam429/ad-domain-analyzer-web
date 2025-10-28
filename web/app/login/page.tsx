'use client'
import { FormEvent, useState } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter } from 'next/navigation'

export default function Login() {
  const r = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [err, setErr] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function onSubmit(e: FormEvent) {
    e.preventDefault()
    setLoading(true)
    setErr(null)
    const res = await signIn('credentials', {
      email,
      password,
      redirect: false,
      callbackUrl: '/',
    })
    setLoading(false)
    if (res?.error) setErr('Login fehlgeschlagen')
    else r.push('/')
  }

  return (
    <main style={{ maxWidth: 380, margin: '80px auto', fontFamily: 'system-ui' }}>
      <h1>Login</h1>
      <form onSubmit={onSubmit}>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="E-Mail"
          style={{ width: '100%', padding: 10, margin: '8px 0' }}
        />
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Passwort"
          style={{ width: '100%', padding: 10, margin: '8px 0' }}
        />
        <button type="submit" disabled={loading} style={{ padding: 10, width: '100%' }}>
          Einloggen
        </button>
      </form>
      {err && <p style={{ color: 'crimson' }}>{err}</p>}
      <p style={{ marginTop: 12 }}>
        Kein Konto? <a href="/register">Registrieren</a>
      </p>
    </main>
  )
}
