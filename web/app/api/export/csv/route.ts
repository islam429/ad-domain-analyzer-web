export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { db } from "@/lib/prisma";
import { requireOrg } from "@/lib/tenant";

const header = [
  "domain",
  "organic_etv",
  "paid_etv",
  "featured_snippet_etv",
  "local_pack_etv",
  "visits_search_total",
  "conversions_15",
  "conversions_25",
];

export async function GET() {
  const orgId = await requireOrg();
  const latest = await db.adRow.findFirst({
    where: { orgId },
    orderBy: [{ jobId: "desc" }, { id: "desc" }],
    select: { jobId: true },
  });

  const jobId = latest?.jobId;
  if (!jobId) {
    return new NextResponse("No data", { status: 404 });
  }

  const rows = await db.adRow.findMany({
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
  });
  const normalized = rows.map((row) => ({
    domain: row.domain,
    organic_etv: row.organicEtv,
    paid_etv: row.paidEtv,
    featured_snippet_etv: row.featuredSnippetEtv,
    local_pack_etv: row.localPackEtv,
    visits_search_total: row.visitsSearchTotal,
    conversions_15: row.conversions15,
    conversions_25: row.conversions25,
  }));

  const fmt = (v: unknown) => {
    if (v == null) return "";
    const num = Number(v);
    return Number.isFinite(num) ? String(Math.round(num)) : String(v);
  };

  const csv = [header.join(","), ...normalized.map((row) => header.map((key) => fmt((row as any)[key])).join(","))].join("\n");

  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": 'attachment; filename="latest.csv"',
    },
  });
}
