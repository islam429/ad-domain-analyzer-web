import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import Dashboard from './Dashboard'
import { resolvePlanForCurrentUser } from '@/lib/plan'
import { authOptions } from '@/lib/auth'

export const runtime = 'nodejs'

export default async function DashboardPage() {
  const session = await getServerSession(authOptions)
  if (!session) {
    redirect('/login')
  }
  const plan = await resolvePlanForCurrentUser()
  return <Dashboard plan={plan} />
}
