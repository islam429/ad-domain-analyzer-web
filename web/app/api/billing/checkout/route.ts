export const runtime = "nodejs";

import { NextResponse } from "next/server";
import Stripe from "stripe";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { PRICE_BY_PLAN, type Plan } from "@/lib/stripe";

type Body = { plan: Plan }

export async function POST(req: Request) {
  try {
    const session = await auth();
    const email = session?.user?.email;
    if (!email) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const secret = process.env.STRIPE_SECRET_KEY;
    if (!secret) {
      return NextResponse.json({ error: "Missing STRIPE_SECRET_KEY" }, { status: 500 });
    }
    const stripe = new Stripe(secret, { apiVersion: "2024-04-10" });

    const { plan } = (await req.json().catch(() => ({}))) as Body;
    if (!plan) return NextResponse.json({ error: "Missing plan" }, { status: 400 });

    const priceId = PRICE_BY_PLAN[plan];
    if (!priceId) {
      return NextResponse.json({ error: `Price ID missing for plan "${plan}"` }, { status: 500 });
    }

    const m = await prisma.membership.findFirst({ where: { userId: email }, select: { orgId: true } });
    if (!m) return NextResponse.json({ error: "No organization found" }, { status: 400 });
    const orgId = m.orgId;

    const org = await prisma.organization.findUnique({ where: { id: orgId }, select: { stripeId: true, name: true } });
    let customerId = org?.stripeId ?? undefined;
    if (!customerId) {
      const customer = await stripe.customers.create({ name: org?.name ?? "Workspace", email, metadata: { orgId } });
      customerId = customer.id;
      await prisma.organization.update({ where: { id: orgId }, data: { stripeId: customerId } });
    }

    const price = await stripe.prices.retrieve(priceId);
    if (!price.active) return NextResponse.json({ error: "Stripe price is inactive" }, { status: 400 });

    const line_items =
      price.recurring?.usage_type === "metered" ? [{ price: priceId }] : [{ price: priceId, quantity: 1 }];

    const checkout = await stripe.checkout.sessions.create({
      mode: "subscription",
      customer: customerId,
      line_items,
      success_url: `${process.env.NEXT_PUBLIC_URL}/billing/success`,
      cancel_url: `${process.env.NEXT_PUBLIC_URL}/billing/cancel`,
      metadata: { orgId, plan },
    });

    return NextResponse.json({ url: checkout.url });
  } catch (e: any) {
    console.error("Checkout error:", e?.message || e);
    return NextResponse.json({ error: e?.message || "Unknown checkout error" }, { status: 500 });
  }
}
