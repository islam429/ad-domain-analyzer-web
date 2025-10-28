import { GoogleAuth } from 'google-auth-library'

export type WorkerResponse = { ok: boolean } & Record<string, any>

function ensureJsonString(value: string): string {
  const trimmed = value.trim()
  if (
    (trimmed.startsWith('"') && trimmed.endsWith('"') && trimmed.length >= 2) ||
    (trimmed.startsWith("'") && trimmed.endsWith("'") && trimmed.length >= 2)
  ) {
    return trimmed.slice(1, -1)
  }
  return trimmed
}

export async function callWorker<T = WorkerResponse>(path: string, body: unknown): Promise<T> {
  const workerUrl = process.env.WORKER_URL
  if (!workerUrl) throw new Error('WORKER_URL missing')

  let saKey = process.env.GCP_SA_KEY
  if (!saKey) throw new Error('GCP_SA_KEY missing')

  saKey = ensureJsonString(saKey)

  const credentials = JSON.parse(saKey)
  const auth = new GoogleAuth({ credentials })
  const client = await auth.getIdTokenClient(workerUrl)

  const url = new URL(path, workerUrl).toString()
  const res = await client.request({
    url,
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    data: body,
  })

  return res.data as T
}
