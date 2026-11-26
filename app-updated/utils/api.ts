const PRODUCTION_API = "https://altasbackend.atlasdentalcenter.com";

function resolveApiBase(): string {
  const fromEnv = (process.env.NEXT_PUBLIC_API_URL || "").replace(/\/$/, "");
  if (fromEnv) return fromEnv;

  // Runtime safety net for static export if env was missing at build time.
  if (typeof window !== "undefined") {
    const host = window.location.hostname || "";
    if (host.includes("atlasdentalcenter.com")) {
      return PRODUCTION_API;
    }
  }

  return "http://localhost:5000";
}

export const API_BASE_URL = resolveApiBase();

export function apiUrl(path: string): string {
  // Re-resolve on each call in the browser so hostname fallback always works.
  const base =
    typeof window !== "undefined"
      ? resolveApiBase()
      : (process.env.NEXT_PUBLIC_API_URL || "").replace(/\/$/, "") ||
        "http://localhost:5000";
  const normalized = path.startsWith("/") ? path : `/${path}`;
  return `${base.replace(/\/$/, "")}${normalized}`;
}
