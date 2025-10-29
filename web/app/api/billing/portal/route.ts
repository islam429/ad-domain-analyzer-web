export const runtime = "nodejs";

import { NextResponse } from "next/server";
import Stripe from "stripe";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

type Body = {
  customerId?: string;
  returnUrl?: string;
};

export async function POST(req: Request) {
  try {
    const secret = process.env.STRIPE_SECRET_KEY;
    if (!secret) {
      return NextResponse.json({ error: "Missing STRIPE_SECRET_KEY" }, { status: 500 });
    }

    const stripe = new Stripe(secret);

    const { customerId, returnUrl } = (await req.json().catch(() => ({}))) as Body;

    let resolvedCustomerId = customerId;
    if (!resolvedCustomerId) {
      const session = await auth();
      const email = session?.user?.email;
      if (!email) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }

      const membership = await prisma.membership.findFirst({
        where: { userId: email },
        select: { orgId: true },
      });
      const org = membership
        ? await prisma.organization.findUnique({ where: { id: membership.orgId }, select: { stripeId: true } })
        : null;
      if (!org?.stripeId) {
        return NextResponse.json({ error: "No Stripe customer" }, { status: 400 });
      }
      resolvedCustomerId = org.stripeId;
    }

    if (!resolvedCustomerId) {
      return NextResponse.json({ error: "Missing customerId" }, { status: 400 });
    }

    const fallbackReturn = process.env.NEXTAUTH_URL ?? process.env.NEXT_PUBLIC_URL ?? "https://www.pryos.io";

    const session = await stripe.billingPortal.sessions.create({
      customer: resolvedCustomerId,
      return_url: returnUrl ?? `${fallbackReturn}/billing`,
    });

    return NextResponse.json({ url: session.url }, { status: 200 });
  } catch (err: any) {
    return NextResponse.json({ error: String(err?.message ?? err) }, { status: 500 });
  }
}
