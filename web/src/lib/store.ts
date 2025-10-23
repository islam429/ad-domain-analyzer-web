import { promises as fs } from 'fs'
import path from 'path'

export type DomainRow = {
  domain: string
  monthly_visits: number
  conv_1_5_pct?: number
  conv_2_5_pct?: number
  updated_at?: string
}

const DATA_DIR = path.join(process.cwd(), 'data')
const FILE = path.join(DATA_DIR, 'domains.json')

async function ensure() {
  await fs.mkdir(DATA_DIR, { recursive: true })
  try { await fs.access(FILE) } catch { await fs.writeFile(FILE, '[]') }
}

export async function readRows(): Promise<DomainRow[]> {
  await ensure()
  const txt = await fs.readFile(FILE, 'utf8')
  return JSON.parse(txt)
}

export async function writeRows(rows: DomainRow[]) {
  await ensure()
  await fs.writeFile(FILE, JSON.stringify(rows, null, 2))
}

export function upsertRows(rows: DomainRow[], updates: DomainRow[]) {
  const m = new Map(rows.map(r => [r.domain.toLowerCase(), r]))
  for (const u of updates) {
    const key = u.domain.toLowerCase()
    m.set(key, { ...m.get(key), ...u, updated_at: new Date().toISOString() })
  }
  return [...m.values()].sort((a, b) => (b.monthly_visits || 0) - (a.monthly_visits || 0))
}
