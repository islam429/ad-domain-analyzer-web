import type { Plan } from '@/lib/plan'

export function BadgePlan({ plan }: { plan: Plan }) {
  const map: Record<string, string> = {
    free: 'bg-slate-100 text-slate-700',
    pro: 'bg-brand-100 text-brand-700',
    enterprise: 'bg-amber-100 text-amber-700',
  }
  return <span className={`inline-flex items-center rounded-lg px-2 py-1 text-xs font-medium ${map[plan]}`}>{plan}</span>
}
