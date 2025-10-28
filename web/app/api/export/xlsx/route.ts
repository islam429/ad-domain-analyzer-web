// app/api/export/xlsx/route.ts
export const runtime = "nodejs";
export const dynamic = 'force-dynamic'

import ExcelJS from 'exceljs'
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireOrg } from '@/lib/tenant'

export async function GET() {
  const orgId = await requireOrg()
  // jüngste job_id holen
  const latest = await prisma.adRow.findFirst({
    where: { orgId },
    orderBy: [{ jobId: 'desc' }, { id: 'desc' }],
    select: { jobId: true },
  })

  const jobId = latest?.jobId
  if (!jobId) return new NextResponse('No data', { status: 404 })

  // Zeilen für diese job_id laden
  const rows = await prisma.adRow.findMany({
    where: { jobId, orgId },
    orderBy: { id: 'asc' },
    select: {
      domain: true,
      organicEtv: true,
      paidEtv: true,
      featuredSnippetEtv: true,
      localPackEtv: true,
      visitsSearchTotal: true,
      conversions15: true,
      conversions25: true,
    },
  })
  const normalized = rows.map((row) => ({
    domain: row.domain,
    organic_etv: row.organicEtv,
    paid_etv: row.paidEtv,
    featured_snippet_etv: row.featuredSnippetEtv,
    local_pack_etv: row.localPackEtv,
    visits_search_total: row.visitsSearchTotal,
    conversions_15: row.conversions15,
    conversions_25: row.conversions25,
  }))

  // Excel aufbauen
  const wb = new ExcelJS.Workbook()
  const ws = wb.addWorksheet('Latest')
  const header = [
    'domain',
    'organic_etv',
    'paid_etv',
    'featured_snippet_etv',
    'local_pack_etv',
    'visits_search_total',
    'conversions_15',
    'conversions_25',
  ]
  ws.addRow(header)
  normalized.forEach((row) => ws.addRow(header.map((k) => (row as any)[k] ?? '')))

  // ExcelJS -> Node Buffer ODER (im Browser) ArrayBuffer/Uint8Array → immer als ArrayBuffer zurückgeben
  const data = await wb.xlsx.writeBuffer() // Buffer | ArrayBuffer | Uint8Array
  const u8 = data instanceof Uint8Array ? data : new Uint8Array(data as ArrayBuffer)
  const ab = u8.buffer.slice(u8.byteOffset, u8.byteOffset + u8.byteLength)

  return new NextResponse(ab, {
    headers: {
      'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'Content-Disposition': 'attachment; filename="latest.xlsx"',
    },
  })
}
