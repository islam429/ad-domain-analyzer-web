export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function GET() {
  const session = await auth();
  const email = session?.user?.email?.toLowerCase().trim();
  if (!email) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const membership = await prisma.membership.findFirst({
    where: { userId: email },
    select: { orgId: true },
  });
  const orgId = membership?.orgId ?? null;
  if (!orgId) {
    return NextResponse.json({
      jobId: null,
      rows: [],
      summary: { domains: 0, visits_total: 0, conversions_15_total: 0, conversions_25_total: 0 },
    });
  }

  const latest = await prisma.adRow.findFirst({
    where: { orgId },
    orderBy: [{ jobId: "desc" }, { id: "desc" }],
    select: { jobId: true },
  });

  const jobId = latest?.jobId ?? null;

  const rows = jobId
    ? await prisma.adRow.findMany({
        where: { jobId, orgId },
        orderBy: { id: "asc" },
        select: {
          domain: true,
          organicEtv: true,
          paidEtv: true,
          featuredSnippetEtv: true,
          localPackEtv: true,
          visitsSearchTotal: true,
          conversions15: true,
          conversions25: true,
        },
      })
    : [];

  const jobIdOut = typeof jobId === "bigint" ? Number(jobId) : jobId;

  const roundValue = (x: number | null | undefined) => (x == null ? null : Math.round(x));
  const rounded = rows.map((r) => ({
    ...r,
    organic_etv: roundValue(r.organicEtv),
    paid_etv: roundValue(r.paidEtv),
    featured_snippet_etv: roundValue(r.featuredSnippetEtv),
    local_pack_etv: roundValue(r.localPackEtv),
    visits_search_total: roundValue(r.visitsSearchTotal),
    conversions_15: roundValue(r.conversions15),
    conversions_25: roundValue(r.conversions25),
  }));

  const n = (x: number | null | undefined) => (x == null ? 0 : Number(x));
  const sum = (key: keyof (typeof rows)[number]) =>
    rows.reduce((acc, row) => acc + n((row as any)[key]), 0);

  const summary = {
    domains: rows.length,
    visits_total: Math.round(sum("visitsSearchTotal")),
    conversions_15_total: Math.round(sum("conversions15")),
    conversions_25_total: Math.round(sum("conversions25")),
  };

  return NextResponse.json({
    jobId: jobIdOut,
    rows: rounded,
    summary,
  });
}
