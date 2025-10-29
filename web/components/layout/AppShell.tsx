import Link from 'next/link'
import { BadgePlan } from '../ui/BadgePlan'
import { Button } from '../ui/Button'
import { LogoutButton } from '@/components/LogoutButton'
import type { Plan } from '@/lib/plan'

export default function AppShell({
  children,
  plan = 'free',
}: {
  children: React.ReactNode
  plan?: Plan
}) {
  return (
    <div className="min-h-screen grid grid-cols-[260px_1fr]">
      <aside className="bg-white border-r border-slate-200 p-4">
        <div className="flex items-center justify-between mb-6">
          <Link href="/" className="flex items-center gap-2">
            <div className="size-8 rounded-xl bg-brand-600 text-white grid place-content-center font-bold">A</div>
            <span className="font-semibold">Ad Domain Analyzer</span>
          </Link>
        </div>
        <nav className="space-y-1 text-sm">
          <Link className="block rounded-lg px-3 py-2 hover:bg-slate-100" href="/dashboard">
            Dashboard
          </Link>
          <Link className="block rounded-lg px-3 py-2 hover:bg-slate-100" href="/jobs">
            Jobs
          </Link>
          <Link className="block rounded-lg px-3 py-2 hover:bg-slate-100" href="/jobs/history">
            History
          </Link>
          <Link className="block rounded-lg px-3 py-2 hover:bg-slate-100" href="/billing">
            Billing
          </Link>
        </nav>
      </aside>

      <div className="p-6">
        <header className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <h1 className="text-xl font-semibold">Übersicht</h1>
            <BadgePlan plan={plan} />
          </div>
          <div className="flex items-center gap-3">
            <Link href="/billing">
              <Button variant="secondary">Abo verwalten</Button>
            </Link>
            <LogoutButton />
          </div>
        </header>
        <main>{children}</main>
      </div>
    </div>
  )
}
