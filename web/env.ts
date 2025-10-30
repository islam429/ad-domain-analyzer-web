import { z } from "zod";

const envSchema = z.object({
  STRIPE_SECRET_KEY: z.string().min(1, "STRIPE_SECRET_KEY is required"),
  STRIPE_PRICE_STARTER: z.string().min(1, "STRIPE_PRICE_STARTER is required"),
  STRIPE_PRICE_PRO: z.string().min(1, "STRIPE_PRICE_PRO is required"),
  STRIPE_PRICE_BUSINESS: z.string().min(1, "STRIPE_PRICE_BUSINESS is required"),
  STRIPE_PRICE_BUISNESS: z.string().optional(),
  NEXTAUTH_URL: z.string().min(1).optional(),
  NEXT_PUBLIC_URL: z.string().min(1).optional(),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  const formatted = parsed.error.issues
    .map((issue) => `${issue.path.join('.') || 'env'}: ${issue.message}`)
    .join('\n');
  throw new Error(`❌ Invalid environment variables:\n${formatted}`);
}

const env = parsed.data;

if (env.STRIPE_PRICE_BUISNESS) {
  console.warn(
    "[env] STRIPE_PRICE_BUISNESS is set but ignored. Please rename it to STRIPE_PRICE_BUSINESS."
  );
}

export const ENV = {
  STRIPE_SECRET_KEY: env.STRIPE_SECRET_KEY,
  STRIPE_PRICE_STARTER: env.STRIPE_PRICE_STARTER,
  STRIPE_PRICE_PRO: env.STRIPE_PRICE_PRO,
  STRIPE_PRICE_BUSINESS: env.STRIPE_PRICE_BUSINESS,
  NEXTAUTH_URL: env.NEXTAUTH_URL,
  NEXT_PUBLIC_URL: env.NEXT_PUBLIC_URL,
};

export type Env = typeof ENV;
