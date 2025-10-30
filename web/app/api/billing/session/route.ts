export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import Stripe from "stripe";
import { ENV } from "@/env";

const stripe = new Stripe(ENV.STRIPE_SECRET_KEY);

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const sessionId = searchParams.get("session_id");

  if (!sessionId) {
    return NextResponse.json({ error: "Missing session_id" }, { status: 400 });
  }

  try {
    const session = await stripe.checkout.sessions.retrieve(sessionId, {
      expand: ["payment_intent", "subscription", "line_items"],
    });

    const amount = session.amount_total ?? session.amount_subtotal ?? null;
    const currency = session.currency ?? (session.payment_intent as Stripe.PaymentIntent | null)?.currency ?? null;
    const plan = session.metadata?.plan || session.metadata?.Plan || null;

    return NextResponse.json(
      {
        id: session.id,
        status: session.status,
        amount,
        currency,
        customer: session.customer,
        customer_email: session.customer_details?.email ?? session.customer_email ?? null,
        subscription: typeof session.subscription === "string" ? session.subscription : session.subscription?.id ?? null,
        plan,
      },
      { status: 200 },
    );
  } catch (err: any) {
    console.error("[billing-session][GET]", err?.message ?? err);
    return NextResponse.json({ error: String(err?.message ?? err) }, { status: 500 });
  }
}
