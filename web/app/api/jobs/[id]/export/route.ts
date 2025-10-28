export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

import ExcelJS from 'exceljs'
import { getJob } from '@/lib/jobs'

export async function GET(_: Request, { params }: { params: { id: string } }) {
  const job = await getJob(params.id)
  if (!job) {
    return new Response(JSON.stringify({ error: 'Not found' }), {
      status: 404,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  const rows = job.rows.map((r) => ({
    Domain: r.domain,
    'Monthly Visits': r.monthlyVisits ?? '',
    'Conversions (1.5%)': r.conv15 ?? '',
    'Conversions (2.5%)': r.conv25 ?? '',
  }))

  const headers = ['Domain', 'Monthly Visits', 'Conversions (1.5%)', 'Conversions (2.5%)']

  const wb = new ExcelJS.Workbook()
  const ws = wb.addWorksheet('Results')
  ws.addRow(headers)
  rows.forEach((row) => ws.addRow(headers.map((key) => (row as any)[key])))

  const buffer = await wb.xlsx.writeBuffer()

  return new Response(buffer, {
    headers: {
      'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'Content-Disposition': `attachment; filename="job-${params.id}.xlsx"`,
    },
  })
}
