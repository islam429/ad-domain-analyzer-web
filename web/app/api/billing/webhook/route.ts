export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const rawBody = await req.text();
    const signature = req.headers.get("stripe-signature");
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
    const secretKey = process.env.STRIPE_SECRET_KEY;

    if (!signature || !webhookSecret || !secretKey) {
      return new NextResponse("Missing stripe envs or signature", { status: 400 });
    }

    const { default: Stripe } = await import("stripe");
    const stripe = new Stripe(secretKey);

    let event;
    try {
      event = stripe.webhooks.constructEvent(rawBody, signature, webhookSecret);
    } catch (err) {
      return new NextResponse(`Invalid signature: ${String((err as any)?.message ?? err)}`, { status: 400 });
    }

    switch (event.type) {
      case "checkout.session.completed":
      case "customer.subscription.created":
      case "customer.subscription.updated":
      case "customer.subscription.deleted":
        break;
      default:
        break;
    }

    return NextResponse.json({ received: true });
  } catch (err) {
    return new NextResponse(`Webhook error: ${String((err as any)?.message ?? err)}`, { status: 500 });
  }
}
