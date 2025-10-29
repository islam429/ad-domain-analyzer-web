import Dashboard from './Dashboard'
import { resolvePlanForCurrentUser } from '@/lib/plan'

export const runtime = 'nodejs'

export default async function DashboardPage() {
  const plan = await resolvePlanForCurrentUser()
  return <Dashboard plan={plan} />
}
