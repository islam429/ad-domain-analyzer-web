export const runtime = "nodejs";

import { NextResponse } from "next/server";
import Stripe from "stripe";
import { auth } from "@/auth";

export async function POST(req: Request) {
  const session = await auth();
  const isAuthed = Boolean(session?.user?.id || session?.user?.email);
  if (!isAuthed) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const secret = process.env.STRIPE_SECRET_KEY;
  if (!secret) return NextResponse.json({ error: "Missing STRIPE_SECRET_KEY" }, { status: 500 });

  const { priceId } = await req.json();
  if (!priceId) return NextResponse.json({ error: "Missing priceId" }, { status: 400 });

  const stripe = new Stripe(secret);
  const baseUrl = process.env.NEXTAUTH_URL ?? "https://www.pryos.io";

  const sessionStripe = await stripe.checkout.sessions.create({
    mode: "subscription",
    line_items: [{ price: priceId, quantity: 1 }],
    success_url: `${baseUrl}/billing/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${baseUrl}/billing/cancel`,
  });

  return NextResponse.json({ url: sessionStripe.url });
}
