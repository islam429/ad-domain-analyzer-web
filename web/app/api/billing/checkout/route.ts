export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import Stripe from "stripe";
import { auth } from "@/lib/auth";

const PRICE_MAP: Record<string, string | undefined> = {
  starter: process.env.STRIPE_PRICE_STARTER,
  pro: process.env.STRIPE_PRICE_PRO,
  business: process.env.STRIPE_PRICE_BUISNESS ?? process.env.STRIPE_PRICE_BUSINESS,
};

type StripeUser = { id?: string; email?: string } | undefined;

function resolveBaseUrl(req: Request) {
  if (process.env.NEXTAUTH_URL && process.env.NEXTAUTH_URL.trim().length > 0) {
    return process.env.NEXTAUTH_URL;
  }
  const { protocol, host } = new URL(req.url);
  return `${protocol}//${host}`;
}

function resolvePrice(priceId?: string | null, plan?: string | null) {
  const planKey = plan?.toLowerCase() ?? undefined;
  return priceId || (planKey ? PRICE_MAP[planKey] : undefined);
}

async function createCheckoutSession(priceId: string, req: Request) {
  const secret = process.env.STRIPE_SECRET_KEY;
  if (!secret) throw new Error("Missing STRIPE_SECRET_KEY");

  const stripe = new Stripe(secret);
  const base = resolveBaseUrl(req);

  return stripe.checkout.sessions.create({
    mode: "subscription",
    line_items: [{ price: priceId, quantity: 1 }],
    success_url: `${base}/billing/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${base}/billing/cancel`,
  });
}

export async function POST(req: Request) {
  try {
    const session = await auth();
    const user = session?.user as StripeUser;
    if (!user?.id && !user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { priceId, plan } = await req
      .json()
      .catch(() => ({} as { priceId?: string; plan?: string }));

    const resolvedPrice = resolvePrice(priceId, plan ?? undefined);
    if (!resolvedPrice) {
      return NextResponse.json({ error: "Missing priceId" }, { status: 400 });
    }

    const checkout = await createCheckoutSession(resolvedPrice, req);

    return NextResponse.json({ url: checkout.url }, { status: 200 });
  } catch (err: any) {
    return NextResponse.json({ error: String(err?.message ?? err) }, { status: 500 });
  }
}

export async function GET(req: Request) {
  try {
    const params = new URL(req.url).searchParams;
    const priceOrPlan =
      params.get("priceId") ?? params.get("price") ?? params.get("plan") ?? undefined;
    const resolvedPrice = resolvePrice(priceOrPlan, priceOrPlan);
    if (!resolvedPrice) {
      return NextResponse.json({ error: "Missing priceId" }, { status: 400 });
    }

    const checkout = await createCheckoutSession(resolvedPrice, req);

    return NextResponse.redirect(checkout.url!, 303);
  } catch (err: any) {
    return NextResponse.json({ error: String(err?.message ?? err) }, { status: 500 });
  }
}
