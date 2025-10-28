'use client'

import { useEffect, useState } from 'react'

type Job = {
  id: string
  status: 'queued' | 'running' | 'done' | 'error'
  progress: number
  message?: string
  rows: any[]
}

export default function JobProgress({ id }: { id: string }) {
  const [job, setJob] = useState<Job | null>(null)

  useEffect(() => {
    const es = new EventSource(`/api/jobs/${id}/events`)
    es.onmessage = (ev) => setJob(JSON.parse(ev.data))
    es.onerror = () => es.close()
    return () => es.close()
  }, [id])

  if (!job) return <div>lade…</div>

  return (
    <div className="space-y-3">
      <div>
        Status: <b>{job.status}</b> — {job.progress}%
      </div>
      <div className="w-full h-2 bg-gray-200 rounded">
        <div className="h-2 bg-black rounded" style={{ width: `${job.progress}%` }} />
      </div>
      {job.message && <div className="text-sm text-slate-600">{job.message}</div>}
      <a className="inline-block px-3 py-2 rounded bg-black text-white" href={`/api/jobs/${id}/export`}>
        Export als Excel
      </a>
    </div>
  )
}
