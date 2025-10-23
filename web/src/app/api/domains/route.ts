import { readRows } from '../../../lib/store'

export async function GET() {
  const items = await readRows()
  return Response.json({ items, nextCursor: null })
}
