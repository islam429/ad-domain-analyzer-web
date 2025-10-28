import { fetchUtils } from "react-admin";

/** Basis-URL aus den Vite-Env-Variablen */
const API_BASE = (import.meta.env.VITE_API_BASE ?? "").replace(/\/$/, "");

/** React-Admin kompatibler httpClient */
export const apiHttpClient: typeof fetchUtils.fetchJson = async (
  url,
  options = {}
) => {
  const headers = new Headers(
    (options.headers as HeadersInit) || { Accept: "application/json" }
  );

  if (!headers.has("Content-Type")) headers.set("Content-Type", "application/json");

  const token = localStorage.getItem("token");
  if (token) headers.set("Authorization", `Bearer ${token}`);

  return fetchUtils.fetchJson(url, {
    ...options,
    headers,
  });
};
