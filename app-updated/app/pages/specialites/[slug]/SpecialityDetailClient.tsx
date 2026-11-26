"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import SpecialtyPageTemplate from "@/components/specialites/SpecialtyPageTemplate";
import { applyClientSeo } from "@/utils/applyClientSeo";
import {
  fetchPublicSpecialityBySlug,
  type PublicSpecialityDetail,
} from "@/utils/specialitiesApi";

export default function SpecialityDetailClient() {
  const params = useParams();
  const slug = String(params?.slug ?? "");
  const [data, setData] = useState<PublicSpecialityDetail | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const activeSlug =
      slug && slug !== "_fallback"
        ? slug
        : window.location.pathname.match(/\/pages\/specialites\/([^/]+)\/?$/)?.[1] ?? "";

    if (!activeSlug || activeSlug === "_fallback") {
      setLoading(false);
      setError("Speciality not found");
      return;
    }

    let cancelled = false;

    (async () => {
      setLoading(true);
      setError(null);
      try {
        const speciality = await fetchPublicSpecialityBySlug(activeSlug);
        if (!cancelled) setData(speciality);
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Speciality not found");
          setData(null);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [slug]);

  useEffect(() => {
    if (!data) return;
    applyClientSeo({
      title: data.seo?.title || data.title,
      description: data.seo?.description || data.description,
      canonicalUrl:
        data.seo?.canonicalUrl ||
        (typeof window !== "undefined"
          ? `${window.location.origin}/pages/specialites/${data.slug}`
          : ""),
      schema: data.seo?.schema,
      schemaScriptId: "speciality-jsonld",
    });
  }, [data]);

  if (loading) {
    return (
      <main
        style={{
          minHeight: "60vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          marginTop: 120,
        }}
      >
        <p style={{ color: "#711C31", fontSize: 16 }}>Chargement…</p>
      </main>
    );
  }

  if (error || !data) {
    return (
      <main
        style={{
          minHeight: "60vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          marginTop: 120,
          flexDirection: "column",
          gap: 12,
        }}
      >
        <p style={{ color: "#711C31", fontSize: 18, fontWeight: 600 }}>
          Spécialité introuvable
        </p>
        <a href="/" style={{ color: "#591727", fontSize: 14 }}>
          Retour à l&apos;accueil
        </a>
      </main>
    );
  }

  return <SpecialtyPageTemplate data={data} />;
}
