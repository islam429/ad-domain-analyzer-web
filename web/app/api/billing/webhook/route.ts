import Stripe from "stripe";
import { prisma } from "@/lib/prisma";
import { ENV } from "@/env";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function resolvePlanFromPrice(priceId: string, price: Stripe.Price | null): string | undefined {
  const planFromMeta = price?.metadata?.plan || price?.metadata?.Plan;
  if (typeof planFromMeta === "string" && planFromMeta.trim().length > 0) {
    return planFromMeta.toLowerCase();
  }

  const entry = Object.entries({
    starter: ENV.STRIPE_PRICE_STARTER,
    pro: ENV.STRIPE_PRICE_PRO,
    business: ENV.STRIPE_PRICE_BUSINESS,
  }).find(([, value]) => value === priceId);

  return entry?.[0];
}

async function upsertCustomer(session: Stripe.Checkout.Session) {
  const email = session.customer_details?.email ?? session.customer_email ?? undefined;
  const customerId = typeof session.customer === "string" ? session.customer : undefined;

  if (!customerId) return;

  if (email) {
    await prisma.user.updateMany({
      where: { email: email.toLowerCase().trim() },
      data: { stripeCustomerId: customerId },
    });
  }

  const userId = session.metadata?.userId || session.metadata?.user_id;
  if (userId) {
    await prisma.user.updateMany({
      where: { id: userId },
      data: { stripeCustomerId: customerId },
    });
  }
}

async function syncSubscription(subscription: Stripe.Subscription, stripe: Stripe) {
  const subId = subscription.id;
  const customerId = typeof subscription.customer === "string" ? subscription.customer : undefined;
  const status = subscription.status as Stripe.Subscription.Status;
  const priceId = typeof subscription.items?.data?.[0]?.price?.id === "string"
    ? subscription.items.data[0].price.id
    : undefined;

  if (!customerId || !priceId) {
    console.warn("[webhook] Missing customer or price for subscription", { subId, customerId, priceId });
    return;
  }

  const user = await prisma.user.findFirst({
    where: { stripeCustomerId: customerId },
    select: { id: true },
  });

  if (!user?.id) {
    console.warn("[webhook] No user for subscription", { customerId, subId });
    return;
  }

  let plan = resolvePlanFromPrice(priceId, null);
  if (!plan) {
    const price = await stripe.prices.retrieve(priceId).catch(() => null);
    plan = resolvePlanFromPrice(priceId, price);
  }

  await prisma.subscription.upsert({
    where: { id: subId },
    update: {
      status,
      priceId,
      plan: plan ?? priceId,
      currentPeriodEnd: subscription.current_period_end
        ? new Date(subscription.current_period_end * 1000)
        : null,
      cancelAtPeriodEnd: subscription.cancel_at_period_end ?? false,
    },
    create: {
      id: subId,
      userId: user.id,
      status,
      priceId,
      plan: plan ?? priceId,
      currentPeriodEnd: subscription.current_period_end
        ? new Date(subscription.current_period_end * 1000)
        : null,
      cancelAtPeriodEnd: subscription.cancel_at_period_end ?? false,
    },
  });
}

export async function POST(req: Request) {
  const signature = req.headers.get("stripe-signature");
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!signature || !webhookSecret) {
    return new Response("Missing Stripe signature or webhook secret", { status: 400 });
  }

  const stripe = new Stripe(ENV.STRIPE_SECRET_KEY);
  const rawBody = await req.text();

  let event: Stripe.Event;
  try {
    event = await stripe.webhooks.constructEventAsync(rawBody, signature, webhookSecret);
  } catch (err: any) {
    console.error("[webhook] Invalid signature", err?.message || err);
    return new Response(`Webhook Error: ${err?.message ?? "invalid signature"}`, { status: 400 });
  }

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        await upsertCustomer(session);
        if (session.subscription) {
          const subscription = await stripe.subscriptions.retrieve(session.subscription as string);
          await syncSubscription(subscription, stripe);
        }
        break;
      }
      case "customer.subscription.created":
      case "customer.subscription.updated":
      case "customer.subscription.deleted": {
        const subscription = event.data.object as Stripe.Subscription;
        await syncSubscription(subscription, stripe);
        break;
      }
      case "invoice.payment_succeeded":
      case "invoice.payment_failed": {
        const invoice = event.data.object as Stripe.Invoice;
        console.info(`[webhook] invoice status`, { id: invoice.id, status: invoice.status });
        break;
      }
      default:
        console.debug("[webhook] Unhandled event", event.type);
        break;
    }
  } catch (err: any) {
    console.error(`[webhook] Handler error`, err?.message ?? err);
    return new Response(`Handler Error: ${err?.message ?? err}`, { status: 500 });
  }

  return new Response(JSON.stringify({ received: true }), {
    status: 200,
    headers: { "content-type": "application/json" },
  });
}
