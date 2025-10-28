// app/api/jobs/fetch-many/route.ts
import { NextResponse } from 'next/server'

type Body = { terms: string[]; country: string }

export async function POST(req: Request) {
  const { terms, country } = (await req.json()) as Body

  const results: Array<{ term: string; jobId?: number; rowsInserted?: number }> = []

  for (const term of terms) {
    const r = await fetch(`/api/jobs/fetch-ads`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ searchTerm: term, country }),
    }).then((x) => x.json())

    results.push({
      term,
      jobId: r.jobId,
      rowsInserted: r.rows?.length ?? r.rowsInserted ?? 0,
    })
  }

  return NextResponse.json({ ok: true, results })
}
