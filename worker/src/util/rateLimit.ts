export type LimiterOptions = {
  ratePerSec: number
}

export function createLimiter({ ratePerSec }: LimiterOptions) {
  if (ratePerSec <= 0) throw new Error('ratePerSec must be > 0')

  let tokens = ratePerSec
  let lastRefill = Date.now()

  const refillTokens = () => {
    const now = Date.now()
    const elapsed = now - lastRefill
    const refill = Math.floor((elapsed / 1000) * ratePerSec)
    if (refill > 0) {
      tokens = Math.min(ratePerSec, tokens + refill)
      lastRefill = now
    }
  }

  return async function limit() {
    while (true) {
      refillTokens()
      if (tokens > 0) {
        tokens -= 1
        return
      }
      await new Promise((resolve) => setTimeout(resolve, 50))
    }
  }
}
