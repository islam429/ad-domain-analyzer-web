import "server-only";

import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export type Plan = "free" | "pro" | "enterprise";

export async function resolvePlanForCurrentUser(): Promise<Plan> {
  const session = await getServerSession(authOptions);
  const userId = session?.user?.id;
  if (!userId) return "free";

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { plan: true, stripeSubscriptionStatus: true },
  });

  if (!user) return "free";
  if (user.stripeSubscriptionStatus === "active" || user.stripeSubscriptionStatus === "trialing") return "pro";
  return (user.plan as Plan) ?? "free";
}
