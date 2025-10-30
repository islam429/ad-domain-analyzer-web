export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import Stripe from "stripe";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { ENV } from "@/env";

const PRICE_MAP: Record<string, string | undefined> = {
  starter: ENV.STRIPE_PRICE_STARTER,
  pro: ENV.STRIPE_PRICE_PRO,
  business: ENV.STRIPE_PRICE_BUSINESS,
};

type StripeUser = { id?: string; email?: string } | undefined;

function resolveBaseUrl(req: Request) {
  const preferred = ENV.NEXTAUTH_URL ?? ENV.NEXT_PUBLIC_URL;
  if (preferred && preferred.trim().length > 0) {
    return preferred;
  }
  const { protocol, host } = new URL(req.url);
  return `${protocol}//${host}`;
}

function resolvePrice(priceId?: string | null, plan?: string | null) {
  const planKey = plan?.toLowerCase() ?? undefined;
  return priceId || (planKey ? PRICE_MAP[planKey] : undefined);
}

type CheckoutOptions = {
  plan?: string;
  userId?: string;
  customerId?: string;
  customerEmail?: string;
};

async function createCheckoutSession(priceId: string, req: Request, options: CheckoutOptions = {}) {
  const stripe = new Stripe(ENV.STRIPE_SECRET_KEY);
  const base = resolveBaseUrl(req);

  const price = await stripe.prices.retrieve(priceId);
  const lineItem: Stripe.Checkout.SessionCreateParams.LineItem = { price: priceId };
  if (price.recurring?.usage_type !== "metered") {
    lineItem.quantity = 1;
  }

  const params: Stripe.Checkout.SessionCreateParams = {
    mode: "subscription",
    line_items: [lineItem],
    success_url: `${base}/billing/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${base}/billing/cancel`,
  };

  if (options.customerId) {
    params.customer = options.customerId;
  } else if (options.customerEmail) {
    params.customer_email = options.customerEmail;
  }

  const idempotencyKey = `${options.userId ?? "anon"}:${options.plan ?? priceId}:${Math.floor(Date.now() / 5000)}`;

  return stripe.checkout.sessions.create(params, { idempotencyKey });
}

export async function POST(req: Request) {
  let planLabel: string | undefined;
  try {
    const session = await auth();
    const user = session?.user as StripeUser;
    const adminToken = process.env.ADMIN_API_TOKEN;
    const okByToken = adminToken && req.headers.get("authorization") === `Bearer ${adminToken}`;
    if (!user?.id && !user?.email && !okByToken) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { priceId, plan } = await req
      .json()
      .catch(() => ({} as { priceId?: string; plan?: string }));

    const planKey = plan?.toLowerCase();
    const resolvedPrice = resolvePrice(priceId, planKey ?? undefined);
    if (!resolvedPrice) {
      return NextResponse.json({ error: "Missing priceId" }, { status: 400 });
    }

    let customerId: string | undefined;
    let customerEmail: string | undefined = user?.email ?? undefined;

    if (user?.id) {
      const record = await prisma.user.findUnique({
        where: { id: user.id },
        select: { stripeCustomerId: true, email: true },
      });
      if (record?.stripeCustomerId) {
        customerId = record.stripeCustomerId;
        customerEmail = undefined;
      } else if (record?.email) {
        customerEmail = record.email;
      }
    }

    planLabel = planKey ?? resolvedPrice;
    const checkout = await createCheckoutSession(resolvedPrice, req, {
      plan: planLabel,
      userId: user?.id ?? user?.email ?? undefined,
      customerId,
      customerEmail,
    });

    return NextResponse.json({ url: checkout.url }, { status: 200 });
  } catch (err: any) {
    console.error("[checkout][POST]", {
      message: err?.message ?? err,
      plan: planLabel,
    });
    return NextResponse.json({ error: String(err?.message ?? err) }, { status: 500 });
  }
}

export async function GET(req: Request) {
  let planLabel: string | undefined;
  try {
    const params = new URL(req.url).searchParams;
    const priceParam = params.get("priceId") ?? params.get("price") ?? undefined;
    const planParam = params.get("plan") ?? undefined;
    const planKey = planParam?.toLowerCase();
    const resolvedPrice = resolvePrice(priceParam, priceParam ? undefined : planKey);
    if (!resolvedPrice) {
      return NextResponse.json({ error: "Missing priceId" }, { status: 400 });
    }

    planLabel = planKey ?? resolvedPrice;
    const checkout = await createCheckoutSession(resolvedPrice, req, {
      plan: planLabel,
      userId: req.headers.get("x-forwarded-for") ?? undefined,
    });

    return NextResponse.redirect(checkout.url!, 303);
  } catch (err: any) {
    console.error("[checkout][GET]", {
      message: err?.message ?? err,
      plan: planLabel,
    });
    return NextResponse.json({ error: String(err?.message ?? err) }, { status: 500 });
  }
}
