export function ViaBadge({ via }: { via?: 'meta' | 'playwright' | 'none' | string }) {
  const map: Record<string, string> = {
    meta: 'bg-emerald-100 text-emerald-700',
    playwright: 'bg-indigo-100 text-indigo-700',
    none: 'bg-slate-100 text-slate-700',
  }
  const cls = map[via ?? 'none'] ?? map.none
  return <span className={`inline-flex items-center rounded-lg px-2 py-1 text-xs font-medium ${cls}`}>{via ?? 'none'}</span>
}
