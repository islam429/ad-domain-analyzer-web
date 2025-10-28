export type Plan = 'starter' | 'pro' | 'business'

export const PRICE_BY_PLAN: Record<Plan, string> = {
  starter: process.env.STRIPE_PRICE_STARTER!,
  pro: process.env.STRIPE_PRICE_PRO!,
  business: process.env.STRIPE_PRICE_BUISNESS!,
}

export function planFromPriceId(priceId?: string): Plan | null {
  if (!priceId) return null
  const entry = Object.entries(PRICE_BY_PLAN).find(([, id]) => id === priceId)
  return (entry?.[0] as Plan) ?? null
}
