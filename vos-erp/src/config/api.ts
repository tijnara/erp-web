// src/config/api.ts
// API configuration for vos-erp
// Note: This file is kept for legacy compatibility but most API calls now use Supabase directly

export type ApiConfig = {
  baseUrl: string;
};

// Legacy support - no longer used with Supabase
const DEFAULT_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8090";

function resolveBaseUrl(): string {
  const w: any = typeof window !== "undefined" ? (window as any) : undefined;
  const fromWindow = w?.__VOS_API_BASE__;
  if (typeof fromWindow === "string" && fromWindow.trim().length > 0) {
    return fromWindow.replace(/\/+$/, "");
  }
  return DEFAULT_BASE_URL;
}

export const API_BASE_URL: string = resolveBaseUrl();

export function apiUrl(path: string): string {
  const base = API_BASE_URL.replace(/\/+$/, "");
  const cleanPath = path.replace(/^\/+/, "");
  return `${base}/${cleanPath}`;
}


export const ITEMS_BASE = apiUrl("items");

export function itemsUrl(path: string = ""): string {
  const clean = path.replace(/^\/+/, "");
  return clean ? `${ITEMS_BASE}/${clean}` : ITEMS_BASE;
}
