export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import Stripe from "stripe";
import { auth } from "@/lib/auth";

type StripeUser = { id?: string; email?: string } | undefined;

function resolveBaseUrl(req: Request) {
  if (process.env.NEXTAUTH_URL && process.env.NEXTAUTH_URL.trim().length > 0) {
    return process.env.NEXTAUTH_URL;
  }
  const { protocol, host } = new URL(req.url);
  return `${protocol}//${host}`;
}

async function createCheckoutSession(priceId: string, req: Request, stripe: Stripe) {
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

    const secret = process.env.STRIPE_SECRET_KEY;
    if (!secret) {
      return NextResponse.json({ error: "Missing STRIPE_SECRET_KEY" }, { status: 500 });
    }

    const { priceId } = await req.json().catch(() => ({} as { priceId?: string }));
    if (!priceId) {
      return NextResponse.json({ error: "Missing priceId" }, { status: 400 });
    }

    const stripe = new Stripe(secret);
    const checkout = await createCheckoutSession(priceId, req, stripe);

    return NextResponse.json({ url: checkout.url }, { status: 200 });
  } catch (err: any) {
    return NextResponse.json({ error: String(err?.message ?? err) }, { status: 500 });
  }
}

export async function GET(req: Request) {
  try {
    const params = new URL(req.url).searchParams;
    const priceId = params.get("priceId") ?? params.get("price") ?? params.get("plan");
    if (!priceId) {
      return NextResponse.json({ error: "Missing priceId" }, { status: 400 });
    }

    const secret = process.env.STRIPE_SECRET_KEY;
    if (!secret) {
      return NextResponse.json({ error: "Missing STRIPE_SECRET_KEY" }, { status: 500 });
    }
    const stripe = new Stripe(secret);
    const checkout = await createCheckoutSession(priceId, req, stripe);

    return NextResponse.json({ url: checkout.url }, { status: 200 });
  } catch (err: any) {
    return NextResponse.json({ error: String(err?.message ?? err) }, { status: 500 });
  }
}
