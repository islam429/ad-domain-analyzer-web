export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

import { auth } from '@/lib/auth'
import { getJob } from '@/lib/jobs'

export async function GET(_: Request, { params }: { params: { id: string } }) {
  const session = await auth()
  if (!session?.user?.email)
    return new Response('unauthorized', { status: 401 })

  const encoder = new TextEncoder()
  const stream = new ReadableStream({
    async start(controller) {
      const job = await getJob(params.id)
      const payload = {
        id: params.id,
        status: job ? 'done' : 'queued',
        progress: job ? 100 : 0,
        rows: job?.rows ?? [],
        message: job ? null : 'Job wird vorbereitet',
      }
      controller.enqueue(encoder.encode(`data: ${JSON.stringify(payload)}\n\n`))
      controller.close()
    },
  })

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      Connection: 'keep-alive',
    },
  })
}
