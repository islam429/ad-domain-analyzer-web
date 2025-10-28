export const runtime = "nodejs";

import type Stripe from "stripe";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { stripe } from "@/lib/stripe-client";

function getUserIdFromSession(session: Stripe.Checkout.Session): string | undefined {
  const fromMetadata = typeof session.metadata?.userId === "string" ? session.metadata.userId : undefined;
  const fromAltMetadata = typeof session.metadata?.user_id === "string" ? session.metadata.user_id : undefined;
  const fromClientRef =
    typeof session.client_reference_id === "string" ? session.client_reference_id : undefined;

  // Wir erwarten die userId aus den Checkout-Metadaten bzw. client_reference_id.
  // TODO: Quelle final prüfen, sobald Checkout die userId zuverlässig liefert.
  return fromMetadata ?? fromAltMetadata ?? fromClientRef;
}

function getUserIdFromSubscription(subscription: Stripe.Subscription): string | undefined {
  const meta = (subscription.metadata ?? {}) as Record<string, unknown>;

  const id1 =
    typeof meta["userId"] === "string" && (meta["userId"] as string).length > 0
      ? (meta["userId"] as string)
      : undefined;

  const id2 =
    typeof meta["user_id"] === "string" && (meta["user_id"] as string).length > 0
      ? (meta["user_id"] as string)
      : undefined;

  return id1 ?? id2;
}

async function applySubscriptionStatus(userId: string, status: Stripe.Subscription.Status) {
  const normalizedStatus = status;

  const data: {
    stripeSubscriptionStatus: string;
    plan?: string;
  } = { stripeSubscriptionStatus: normalizedStatus };

  const db = prisma as unknown as {
    user: { update: (args: any) => Promise<any> };
  };

  if (normalizedStatus === "active" || normalizedStatus === "trialing") {
    data.plan = "pro";
  } else if (normalizedStatus === "canceled") {
    data.plan = "free";
  }

  try {
    await db.user.update({
      where: { id: userId },
      data,
    });
  } catch (err) {
    console.error("Failed to update user subscription status", { userId, status, err });
  }
}

export async function POST(req: Request) {
  const rawBody = await req.text();

  const signature = req.headers.get("stripe-signature");
  if (!signature) {
    return new Response("Missing Stripe signature", { status: 400 });
  }

  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!webhookSecret) {
    return new Response("Missing STRIPE_WEBHOOK_SECRET", { status: 500 });
  }

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(rawBody, signature, webhookSecret);
  } catch (err: any) {
    console.error("Stripe webhook signature verification failed", err);
    return new Response(`Webhook Error: ${err.message}`, { status: 400 });
  }

  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object as Stripe.Checkout.Session;
      const subscriptionId = session.subscription as string | undefined;
      const subscription = subscriptionId ? await stripe.subscriptions.retrieve(subscriptionId) : undefined;
      const userId =
        getUserIdFromSession(session) || (subscription ? getUserIdFromSubscription(subscription) : undefined);

      if (userId && subscription) {
        await applySubscriptionStatus(userId, subscription.status);
      } else {
        console.warn("Checkout session completed without userId", {
          sessionId: session.id,
        });
      }
      break;
    }

    case "customer.subscription.updated": {
      const subscription = event.data.object as Stripe.Subscription;
      const userId = getUserIdFromSubscription(subscription);
      if (userId) {
        await applySubscriptionStatus(userId, subscription.status);
      } else {
        console.warn("Subscription updated without userId metadata", { subscriptionId: subscription.id });
      }
      break;
    }

    case "customer.subscription.deleted": {
      const subscription = event.data.object as Stripe.Subscription;
      const userId = getUserIdFromSubscription(subscription);
      if (userId) {
        await applySubscriptionStatus(userId, "canceled");
      } else {
        console.warn("Subscription deleted without userId metadata", { subscriptionId: subscription.id });
      }
      break;
    }

    default:
      // ignore unrelated events
      break;
  }

  return NextResponse.json({ received: true });
}
