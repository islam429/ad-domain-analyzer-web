import simpleRestProvider from "ra-data-simple-rest";
import { apiHttpClient } from "./api";

const API_BASE = (import.meta.env.VITE_API_BASE ?? "").replace(/\/$/, "");

export const dataProvider = simpleRestProvider(`${API_BASE}/api`, apiHttpClient);
