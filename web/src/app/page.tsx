import Link from 'next/link'

export default function Page() {
  return (
    <main className="space-y-4">
      <h1 className="text-2xl font-semibold">Meta Ads → Domains</h1>
      <p className="text-gray-600">Sammle Domains, hole Traffic & berechne Conversions.</p>
      <div className="flex gap-4">
        <Link href="/run" className="rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700">Run starten</Link>
        <Link href="/domains" className="rounded border px-4 py-2 hover:bg-gray-50">Domains ansehen</Link>
      </div>
    </main>
  )
}
