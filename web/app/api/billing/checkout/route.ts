export const runtime = "nodejs";

import { NextResponse } from "next/server";
import Stripe from "stripe";
import { auth } from "@/lib/auth";
import { PRICE_BY_PLAN, type Plan } from "@/lib/stripe";

export async function POST(req: Request) {
  try {
    const session = await auth();
    const hasUser = Boolean(session?.user && (((session.user as any).id) || ((session.user as any).email)));

    const okByToken =
      process.env.ADMIN_API_TOKEN &&
      req.headers.get("authorization") === `Bearer ${process.env.ADMIN_API_TOKEN}`;

    if (!hasUser && !okByToken) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const secret = process.env.STRIPE_SECRET_KEY;
    if (!secret) {
      return NextResponse.json({ error: "Missing STRIPE_SECRET_KEY" }, { status: 500 });
    }
    const stripe = new Stripe(secret);

    const body = await req.json().catch(() => ({})) as { priceId?: string; plan?: Plan };
    const priceId = body.priceId ?? (body.plan ? PRICE_BY_PLAN[body.plan] : undefined);
    if (!priceId) {
      return NextResponse.json({ error: "Missing priceId" }, { status: 400 });
    }

    const baseUrl = process.env.NEXTAUTH_URL ?? process.env.NEXT_PUBLIC_URL ?? "https://www.pryos.io";

    const checkout = await stripe.checkout.sessions.create({
      mode: "subscription",
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: `${baseUrl}/billing/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${baseUrl}/billing/cancel`,
      metadata: body.plan ? { plan: body.plan } : undefined,
    });

    return NextResponse.json({ url: checkout.url }, { status: 200 });
  } catch (e: any) {
    console.error("Checkout error:", e?.message || e);
    return NextResponse.json({ error: e?.message || "Unknown checkout error" }, { status: 500 });
  }
}
