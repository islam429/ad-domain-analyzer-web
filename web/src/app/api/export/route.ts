import ExcelJS from 'exceljs'
import { readRows } from '../../../lib/store'

export async function GET() {
  const rows = await readRows()

  const wb = new ExcelJS.Workbook()
  const ws = wb.addWorksheet('Domains')
  ws.columns = [
    { header: 'domain', key: 'domain', width: 30 },
    { header: 'monthly_visits', key: 'monthly_visits', width: 20 },
    { header: 'conv_1_5_pct', key: 'conv_1_5_pct', width: 18 },
    { header: 'conv_2_5_pct', key: 'conv_2_5_pct', width: 18 },
    { header: 'updated_at', key: 'updated_at', width: 24 },
  ]
  rows.forEach(r => ws.addRow(r))

  const buf = await wb.xlsx.writeBuffer()
  return new Response(buf, {
    headers: {
      'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'Content-Disposition': 'attachment; filename="output.xlsx"',
    },
  })
}
