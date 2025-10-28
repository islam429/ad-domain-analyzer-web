export type RetryOptions = {
  retries?: number
  backoffMs?: number
}

export async function retry<T>(fn: () => Promise<T>, options: RetryOptions = {}): Promise<T> {
  const { retries = 3, backoffMs = 300 } = options
  let attempt = 0
  let lastError: unknown

  while (attempt <= retries) {
    try {
      return await fn()
    } catch (err) {
      lastError = err
      if (attempt === retries) break
      const delay = backoffMs * Math.pow(2, attempt)
      await new Promise((resolve) => setTimeout(resolve, delay))
      attempt += 1
    }
  }

  throw lastError instanceof Error ? lastError : new Error(String(lastError))
}
