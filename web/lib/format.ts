export function fmt(n?: number | null) {
  if (n == null) return '—'
  try {
    return new Intl.NumberFormat('de-DE').format(n)
  } catch {
    return String(n)
  }
}
