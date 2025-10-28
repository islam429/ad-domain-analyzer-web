// web/src/lib/call-worker.ts
import { GoogleAuth } from "google-auth-library";

export async function callWorker<TReq, TRes>(path: string, body: TReq): Promise<TRes> {
  const base = process.env.WORKER_URL!;
  const target = `${base.replace(/\/$/, "")}${path}`;
  const auth = new GoogleAuth({
    credentials: JSON.parse(process.env.GCP_SA_KEY!),
    scopes: ["https://www.googleapis.com/auth/cloud-platform"],
  });
  const idClient = await auth.getIdTokenClient(target);
  const res = await idClient.request<TRes>({
    url: target,
    method: "POST",
    data: body,
    headers: { "Content-Type": "application/json" },
  });
  return res.data as TRes;
}
