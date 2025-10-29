export const runtime = "nodejs";

import { NextResponse } from "next/server";
import Stripe from "stripe";
import { auth } from "@/auth";

export async function POST(req: Request) {
  try {
    const s = await auth();
    const u = s?.user as { id?: string; email?: string } | undefined;
    if (!u?.id && !u?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const sk = process.env.STRIPE_SECRET_KEY;
    if (!sk) return NextResponse.json({ error: "Missing STRIPE_SECRET_KEY" }, { status: 500 });

    const { priceId } = await req.json();
    if (!priceId) return NextResponse.json({ error: "Missing priceId" }, { status: 400 });

    const stripe = new Stripe(sk);
    const base = process.env.NEXTAUTH_URL ?? "https://www.pryos.io";

    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: `${base}/billing/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${base}/billing/cancel`,
    });

    return NextResponse.json({ url: session.url }, { status: 200 });
  } catch (e: any) {
    return NextResponse.json({ error: String(e?.message ?? e) }, { status: 500 });
  }
}
