import Stripe from "stripe";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  const stripeSecret = process.env.STRIPE_SECRET_KEY;
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  const signature = req.headers.get("stripe-signature");

  if (!stripeSecret || !webhookSecret || !signature) {
    return new Response("Missing Stripe configuration or signature", { status: 400 });
  }

  const stripe = new Stripe(stripeSecret);
  const rawBody = await req.text();

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(rawBody, signature, webhookSecret);
  } catch (err: any) {
    return new Response(`Webhook Error: ${err?.message ?? "invalid signature"}`, { status: 400 });
  }

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        // TODO: Persist checkout session details (e.g., mark subscription active)
        console.info("checkout.session.completed", session.id);
        break;
      }
      case "customer.subscription.created":
      case "customer.subscription.updated":
      case "customer.subscription.deleted": {
        const subscription = event.data.object as Stripe.Subscription;
        // TODO: Sync subscription status in your database
        console.info("subscription event", subscription.id, subscription.status);
        break;
      }
      case "invoice.payment_succeeded":
      case "invoice.payment_failed": {
        const invoice = event.data.object as Stripe.Invoice;
        // TODO: Handle invoice status updates, notifications, retries, etc.
        console.info("invoice event", invoice.id, invoice.status);
        break;
      }
      default:
        // Optional: log unhandled events
        console.debug("Unhandled Stripe event", event.type);
        break;
    }
  } catch (err: any) {
    return new Response(`Handler Error: ${err?.message ?? "unknown"}`, { status: 500 });
  }

  return new Response("ok", { status: 200 });
}

export async function GET() {
  return new Response("ok", { status: 200 });
}
