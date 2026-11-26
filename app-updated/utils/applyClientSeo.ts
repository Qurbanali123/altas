/** Apply SEO meta tags in the browser (used by client-rendered public pages). */

function upsertMeta(attr: "name" | "property", key: string, content: string) {
  if (!content) return;
  let el = document.head.querySelector(`meta[${attr}="${key}"]`) as HTMLMetaElement | null;
  if (!el) {
    el = document.createElement("meta");
    el.setAttribute(attr, key);
    document.head.appendChild(el);
  }
  el.setAttribute("content", content);
}

function upsertCanonical(href: string) {
  if (!href) return;
  let link = document.head.querySelector('link[rel="canonical"]') as HTMLLinkElement | null;
  if (!link) {
    link = document.createElement("link");
    link.setAttribute("rel", "canonical");
    document.head.appendChild(link);
  }
  link.setAttribute("href", href);
}

function upsertJsonLd(id: string, schemaRaw: string) {
  const existing = document.getElementById(id);
  if (existing) existing.remove();
  const raw = String(schemaRaw || "").trim();
  if (!raw) return;
  try {
    JSON.parse(raw);
  } catch {
    return;
  }
  const script = document.createElement("script");
  script.id = id;
  script.type = "application/ld+json";
  script.text = raw;
  document.head.appendChild(script);
}

export function applyClientSeo(options: {
  title?: string;
  description?: string;
  canonicalUrl?: string;
  schema?: string;
  schemaScriptId?: string;
}) {
  if (typeof document === "undefined") return;

  const title = String(options.title || "").trim();
  if (title) document.title = title;

  const description = String(options.description || "").trim();
  if (description) {
    upsertMeta("name", "description", description);
    upsertMeta("property", "og:description", description);
  }
  if (title) {
    upsertMeta("property", "og:title", title);
  }

  const canonical = String(options.canonicalUrl || "").trim();
  if (canonical) {
    upsertCanonical(canonical);
    upsertMeta("property", "og:url", canonical);
  }

  upsertJsonLd(options.schemaScriptId || "page-jsonld", options.schema || "");
}
