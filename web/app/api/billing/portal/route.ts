export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import Stripe from "stripe";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { ENV } from "@/env";

function resolveBaseUrl(req: Request) {
  const preferred = ENV.NEXTAUTH_URL ?? ENV.NEXT_PUBLIC_URL;
  if (preferred && preferred.trim().length > 0) return preferred;
  const { protocol, host } = new URL(req.url);
  return `${protocol}//${host}`;
}

async function resolveCustomerId(userId?: string, userEmail?: string): Promise<string | undefined> {
  if (!userId && !userEmail) return undefined;

  const user = await prisma.user.findFirst({
    where: {
      OR: [
        userId ? { id: userId } : undefined,
        userEmail ? { email: userEmail.toLowerCase().trim() } : undefined,
      ].filter(Boolean) as any,
    },
    select: { stripeCustomerId: true, email: true },
  });

  return user?.stripeCustomerId ?? undefined;
}

async function createPortalSession(customerId: string, req: Request, returnUrl?: string) {
  const stripe = new Stripe(ENV.STRIPE_SECRET_KEY);
  const base = resolveBaseUrl(req);

  return stripe.billingPortal.sessions.create({
    customer: customerId,
    return_url: returnUrl ?? `${base}/billing`,
  });
}

export async function POST(req: Request) {
  try {
    const session = await auth();
    const user = session?.user as { id?: string; email?: string } | undefined;
    if (!user?.id && !user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { returnUrl } = await req.json().catch(() => ({} as { returnUrl?: string }));

    const customerId = await resolveCustomerId(user?.id, user?.email);
    if (!customerId) {
      return NextResponse.json({ error: "No Stripe customer" }, { status: 400 });
    }

    const portal = await createPortalSession(customerId, req, returnUrl);

    return NextResponse.json({ url: portal.url }, { status: 200 });
  } catch (err: any) {
    console.error("[billing-portal][POST]", err?.message ?? err);
    return NextResponse.json({ error: String(err?.message ?? err) }, { status: 500 });
  }
}

export async function GET(req: Request) {
  try {
    const session = await auth();
    const user = session?.user as { id?: string; email?: string } | undefined;
    if (!user?.id && !user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const customerId = await resolveCustomerId(user?.id, user?.email);
    if (!customerId) {
      return NextResponse.json({ error: "No Stripe customer" }, { status: 400 });
    }

    const portal = await createPortalSession(customerId, req);

    return NextResponse.redirect(portal.url!, 303);
  } catch (err: any) {
    console.error("[billing-portal][GET]", err?.message ?? err);
    return NextResponse.json({ error: String(err?.message ?? err) }, { status: 500 });
  }
}
