import { z } from "zod";

const envSchema = z
  .object({
    STRIPE_SECRET_KEY: z.string().min(1, "STRIPE_SECRET_KEY is required"),
    STRIPE_PRICE_STARTER: z.string().min(1, "STRIPE_PRICE_STARTER is required"),
    STRIPE_PRICE_PRO: z.string().min(1, "STRIPE_PRICE_PRO is required"),
    STRIPE_PRICE_BUSINESS: z.string().optional(),
    STRIPE_PRICE_BUISNESS: z.string().optional(),
    NEXTAUTH_URL: z.string().min(1).optional(),
    NEXT_PUBLIC_URL: z.string().min(1).optional(),
  })
  .refine(
    (data) =>
      (data.STRIPE_PRICE_BUSINESS && data.STRIPE_PRICE_BUSINESS.trim().length > 0) ||
      (data.STRIPE_PRICE_BUISNESS && data.STRIPE_PRICE_BUISNESS.trim().length > 0),
    {
      message: "One of STRIPE_PRICE_BUSINESS or STRIPE_PRICE_BUISNESS must be provided",
      path: ["STRIPE_PRICE_BUSINESS"],
    },
  );

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  const formatted = parsed.error.issues
    .map((issue) => `${issue.path.join('.') || 'env'}: ${issue.message}`)
    .join('\n');
  throw new Error(`❌ Invalid environment variables:\n${formatted}`);
}

const env = parsed.data;

const normalizedBusinessPrice =
  env.STRIPE_PRICE_BUSINESS && env.STRIPE_PRICE_BUSINESS.trim().length > 0
    ? env.STRIPE_PRICE_BUSINESS
    : env.STRIPE_PRICE_BUISNESS!;

if (env.STRIPE_PRICE_BUISNESS && !env.STRIPE_PRICE_BUSINESS) {
  console.warn(
    "[env] STRIPE_PRICE_BUISNESS is set. Please rename it to STRIPE_PRICE_BUSINESS to avoid future issues."
  );
}

export const ENV = {
    STRIPE_SECRET_KEY: env.STRIPE_SECRET_KEY,
    STRIPE_PRICE_STARTER: env.STRIPE_PRICE_STARTER,
    STRIPE_PRICE_PRO: env.STRIPE_PRICE_PRO,
    STRIPE_PRICE_BUSINESS: normalizedBusinessPrice,
    NEXTAUTH_URL: env.NEXTAUTH_URL,
    NEXT_PUBLIC_URL: env.NEXT_PUBLIC_URL,
};

export type Env = typeof ENV;
