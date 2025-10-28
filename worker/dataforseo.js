// native fetch (Node >=18)
export async function fetchMonthlyVisits(domain) {
  const auth = Buffer.from(
    `${process.env.DATAFORSEO_LOGIN}:${process.env.DATAFORSEO_PASSWORD}`
  ).toString('base64');

  const res = await fetch("https://api.dataforseo.com/v3/traffic_analytics/similarweb/live",{
    method:"POST",
    headers:{ "Content-Type":"application/json", "Authorization":`Basic ${auth}` },
    body: JSON.stringify({ data: [{ target: domain }] })
  }).catch(() => null);

  if (!res || !res.ok) return 0;
  const json = await res.json().catch(() => null);
  return json?.tasks?.[0]?.result?.[0]?.traffic?.estimated_visits ?? 0;
}
