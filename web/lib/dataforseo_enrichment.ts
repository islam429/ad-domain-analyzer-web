// lib/dataforseo_enrichment.ts
import { prisma } from '@/lib/prisma'

type EtvBundle = {
  organic_etv: number | null;
  paid_etv: number | null;
  featured_snippet_etv: number | null;
  local_pack_etv: number | null;
  visits_search_total: number | null;
};

const URL_LABS = 'https://api.dataforseo.com/v3/dataforseo_labs/google/bulk_traffic_estimation/live';

function chunk<T>(arr: T[], size = 100): T[][] {
  const out: T[][] = [];
  for (let i = 0; i < arr.length; i += size) out.push(arr.slice(i, i + size));
  return out;
}
function normalizeDomain(input: string): string {
  if (!input) return input;
  let s = input.trim();
  if (!/^https?:\/\//i.test(s)) s = 'http://' + s;
  try {
    const h = new URL(s).hostname.toLowerCase();
    return h.startsWith('www.') ? h.slice(4) : h;
  } catch {
    return input.toLowerCase();
  }
}

export async function enrichWithDataForSEOLabs(
  rawDomains: string[],
  opts?: { location_name?: string; language_name?: string; fallbackGlobal?: boolean }
): Promise<Record<string, EtvBundle>> {
  const domains = [...new Set(rawDomains.map(normalizeDomain))].filter(Boolean);
  const login = process.env.DATAFORSEO_LOGIN,
    password = process.env.DATAFORSEO_PASSWORD;

  const empty = (): EtvBundle => ({
    organic_etv: null,
    paid_etv: null,
    featured_snippet_etv: null,
    local_pack_etv: null,
    visits_search_total: null,
  });
  const result: Record<string, EtvBundle> = Object.fromEntries(domains.map((d) => [d, empty()]));

  if (!login || !password || domains.length === 0) return result;

  const location_name = opts?.location_name ?? undefined
  const language_name = opts?.language_name ?? undefined

  const cached = await prisma.trafficCache.findMany({
    where: {
      domain: { in: domains },
      country: location_name,
      language: language_name,
    },
  })
  const TTL = 30 * 24 * 60 * 60 * 1000
  const now = Date.now()
  const fresh = new Map(
    cached
      .filter((c) => now - new Date(c.updatedAt).getTime() < TTL)
      .map((c) => [
        c.domain,
        {
          organic_etv: c.organicEtv,
          paid_etv: c.paidEtv,
          featured_snippet_etv: c.featuredSnippetEtv,
          local_pack_etv: c.localPackEtv,
          visits_search_total: c.visitsSearchTotal,
        } satisfies EtvBundle,
      ]),
  )
  const need = domains.filter((d) => !fresh.has(d))

  for (const [domain, bundle] of fresh.entries()) {
    result[domain] = bundle
  }

  async function query(targets: string[], loc?: string, lang?: string) {
    const payload: any = [{ targets, item_types: ['organic', 'paid', 'featured_snippet', 'local_pack'] }];
    if (loc) payload[0].location_name = loc;
    if (lang) payload[0].language_name = lang;

    const res = await fetch(URL_LABS, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: 'Basic ' + Buffer.from(`${login}:${password}`).toString('base64'),
      },
      body: JSON.stringify(payload),
    });
    const json = await res.json().catch(async () => ({ parse_error: await res.text() }));
    return json;
  }

  const batches = chunk(need)
  for (const batch of batches) {
    if (!batch.length) continue
    const j = await query(batch, location_name ?? undefined, language_name ?? undefined);
    const ok = j?.status_code === 20000 && j?.tasks?.[0]?.status_code === 20000;
    if (!ok) {
      console.error('DataForSEO error (locale):', JSON.stringify(j, null, 2));
      continue;
    }

    const items = j.tasks[0].result?.[0]?.items ?? []

    if (items.length) {
      await prisma.$transaction(
        items.map((it: any) => {
          const keyCountry = location_name ?? ''
          const keyLanguage = language_name ?? ''
          const domainKey: { domain: string; country: string; language: string } = {
            domain: normalizeDomain(it?.target ?? ''),
            country: keyCountry,
            language: keyLanguage,
          }

          return prisma.trafficCache.upsert({
            where: {
              domain_country_language: domainKey,
            },
            update: {
              organicEtv: it?.metrics?.organic?.etv ?? null,
              paidEtv: it?.metrics?.paid?.etv ?? null,
              featuredSnippetEtv: it?.metrics?.featured_snippet?.etv ?? null,
              localPackEtv: it?.metrics?.local_pack?.etv ?? null,
              visitsSearchTotal:
                (it?.metrics?.organic?.etv ?? 0) +
                (it?.metrics?.paid?.etv ?? 0) +
                (it?.metrics?.featured_snippet?.etv ?? 0) +
                (it?.metrics?.local_pack?.etv ?? 0),
              updatedAt: new Date(),
            },
            create: {
              domain: domainKey.domain,
              country: keyCountry,
              language: keyLanguage,
              organicEtv: it?.metrics?.organic?.etv ?? null,
              paidEtv: it?.metrics?.paid?.etv ?? null,
              featuredSnippetEtv: it?.metrics?.featured_snippet?.etv ?? null,
              localPackEtv: it?.metrics?.local_pack?.etv ?? null,
              visitsSearchTotal:
                (it?.metrics?.organic?.etv ?? 0) +
                (it?.metrics?.paid?.etv ?? 0) +
                (it?.metrics?.featured_snippet?.etv ?? 0) +
                (it?.metrics?.local_pack?.etv ?? 0),
              updatedAt: new Date(),
            },
          })
        }),
      )
    }

    for (const it of items) {
      const d = normalizeDomain(it?.target ?? '');
      if (!d || !(d in result)) continue;
      const m = it?.metrics ?? {};
      const val = (x: any) => (Number.isFinite(+x) ? +x : null);
      const organic = val(m?.organic?.etv);
      const paid = val(m?.paid?.etv);
      const fs = val(m?.featured_snippet?.etv);
      const lp = val(m?.local_pack?.etv);
      const sum = (organic ?? 0) + (paid ?? 0) + (fs ?? 0) + (lp ?? 0);
      result[d] = {
        organic_etv: organic,
        paid_etv: paid,
        featured_snippet_etv: fs,
        local_pack_etv: lp,
        visits_search_total: [organic, paid, fs, lp].some((v) => v !== null) ? sum : null,
      };
    }
  }

  if (opts?.fallbackGlobal) {
    const missing = Object.entries(result)
      .filter(([, v]) => v.visits_search_total === null || v.visits_search_total === 0)
      .map(([k]) => k);

    for (const batch of chunk(missing)) {
      if (!batch.length) continue
      const j = await query(batch);
      const ok = j?.status_code === 20000 && j?.tasks?.[0]?.status_code === 20000;
      if (!ok) {
        console.error('DataForSEO error (global):', JSON.stringify(j, null, 2));
        continue;
      }

      const items = j.tasks[0].result?.[0]?.items ?? []

      if (items.length) {
        await prisma.$transaction(
          items.map((it: any) => {
            const domainKey: { domain: string; country: string; language: string } = {
              domain: normalizeDomain(it?.target ?? ''),
              country: '',
              language: '',
            }

            return prisma.trafficCache.upsert({
              where: {
                domain_country_language: domainKey,
              },
              update: {
                organicEtv: it?.metrics?.organic?.etv ?? null,
                paidEtv: it?.metrics?.paid?.etv ?? null,
                featuredSnippetEtv: it?.metrics?.featured_snippet?.etv ?? null,
                localPackEtv: it?.metrics?.local_pack?.etv ?? null,
                visitsSearchTotal:
                  (it?.metrics?.organic?.etv ?? 0) +
                  (it?.metrics?.paid?.etv ?? 0) +
                  (it?.metrics?.featured_snippet?.etv ?? 0) +
                  (it?.metrics?.local_pack?.etv ?? 0),
                updatedAt: new Date(),
              },
              create: {
                domain: normalizeDomain(it?.target ?? ''),
                country: '',
                language: '',
                organicEtv: it?.metrics?.organic?.etv ?? null,
                paidEtv: it?.metrics?.paid?.etv ?? null,
                featuredSnippetEtv: it?.metrics?.featured_snippet?.etv ?? null,
                localPackEtv: it?.metrics?.local_pack?.etv ?? null,
                visitsSearchTotal:
                  (it?.metrics?.organic?.etv ?? 0) +
                  (it?.metrics?.paid?.etv ?? 0) +
                  (it?.metrics?.featured_snippet?.etv ?? 0) +
                  (it?.metrics?.local_pack?.etv ?? 0),
                updatedAt: new Date(),
              },
            })
          }),
        )
      }

      for (const it of items) {
        const d = normalizeDomain(it?.target ?? '');
        const before = result[d];
        const wasEmpty = !before || before.visits_search_total === null || before.visits_search_total === 0;
        if (!wasEmpty) continue;

        const m = it?.metrics ?? {};
        const val = (x: any) => (Number.isFinite(+x) ? +x : null);
        const organic = val(m?.organic?.etv);
        const paid = val(m?.paid?.etv);
        const fs = val(m?.featured_snippet?.etv);
        const lp = val(m?.local_pack?.etv);
        const sum = (organic ?? 0) + (paid ?? 0) + (fs ?? 0) + (lp ?? 0);
        result[d] = {
          organic_etv: organic,
          paid_etv: paid,
          featured_snippet_etv: fs,
          local_pack_etv: lp,
          visits_search_total: [organic, paid, fs, lp].some((v) => v !== null) ? sum : null,
        };
      }
    }
  }

  return result;
}
