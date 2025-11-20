// src/config/api.ts
// Centralized API base URL and helpers for vos-erp

export type ApiConfig = {
  baseUrl: string;
};

// CHANGE: Set default to empty string for relative paths (e.g. "/api/...")
// or specific URL if using a separate backend service.
const DEFAULT_BASE_URL = "";

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
  // If base is empty, ensure we don't start with a double slash
  return base ? `${base}/${cleanPath}` : `/${cleanPath}`;
}

// CHANGE: Removed ITEMS_BASE and itemsUrl as they were specific to Directus structure
