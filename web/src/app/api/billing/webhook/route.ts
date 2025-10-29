export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import Stripe from "stripe";

export async function POST(req: Request) {
  const secretKey = process.env.STRIPE_SECRET_KEY;
  const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;
  const signature = req.headers.get("stripe-signature");
  const rawBody = await req.text();

  if (!secretKey || !endpointSecret || !signature) {
    return new Response("Missing Stripe envs/signature", { status: 400 });
  }

  const stripe = new Stripe(secretKey);

  try {
    stripe.webhooks.constructEvent(rawBody, signature, endpointSecret);
    return new Response("ok", { status: 200 });
  } catch (err: any) {
    return new Response(`Invalid signature: ${err?.message ?? err}`, { status: 400 });
  }
}

// Optional test endpoint; remove when no longer needed.
// export async function GET() {
//   return new Response("ok", { status: 200 });
// }
