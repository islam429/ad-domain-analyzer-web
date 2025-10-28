export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { db } from "@/lib/prisma";

export async function GET(req: Request, { params }: { params: { id: string } }) {
  let jobId: number | null = null;
  if (params.id === "latest") {
    try {
      const row: any = await (db as any).job.findFirst({ orderBy: { id: "desc" }, select: { id: true } });
      jobId = row?.id ?? null;
    } catch {
      jobId = null;
    }
  } else {
    const n = Number(params.id);
    jobId = Number.isFinite(n) && n > 0 ? n : null;
  }
  if (!jobId) return NextResponse.json({ error: "Invalid job id" }, { status: 400 });

  const rows: any[] = await (db as any)
    .$queryRawUnsafe(`
      WITH latest AS (
        SELECT m.*
        FROM domain_metrics_monthly m
        JOIN (
          SELECT domain_id, MAX(year*100 + month) AS ym
          FROM domain_metrics_monthly GROUP BY domain_id
        ) t ON t.domain_id = m.domain_id AND t.ym = (m.year*100 + m.month)
      )
      SELECT ld.domain,
             COALESCE(lat.organic_etv,0)  AS organic_etv,
             COALESCE(lat.paid_etv,0)     AS paid_etv,
             COALESCE(lat.featured_snippet_etv,0) AS featured_snippet_etv,
             COALESCE(lat.local_pack_etv,0) AS local_pack_etv,
             COALESCE(lat.visits_search_total,
               COALESCE(lat.organic_etv,0)+COALESCE(lat.paid_etv,0)+COALESCE(lat.featured_snippet_etv,0)+COALESCE(lat.local_pack_etv,0)
             ) AS visits_search_total
      FROM job_result_domain jrd
      JOIN landing_domain ld ON ld.id = jrd.domain_id
      LEFT JOIN latest lat ON lat.domain_id = ld.id
      WHERE jrd.job_id = ${jobId}
      ORDER BY visits_search_total DESC NULLS LAST, ld.domain ASC
    `)
    .catch(async () => {
      return await (db as any).$queryRawUnsafe(`
        SELECT ld.domain,
               0 AS organic_etv, 0 AS paid_etv, 0 AS featured_snippet_etv, 0 AS local_pack_etv, 0 AS visits_search_total
        FROM landing_domain ld
        ORDER BY ld.last_seen DESC NULLS LAST, ld.domain ASC
        LIMIT 50
      `);
    });

  return NextResponse.json({ jobId, rows });
}
