"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { useTheme } from "@/context/ThemeContext";
import { usePermissions } from "@/context/PermissionsContext";
import {
  DEFAULT_HOME_BLOGS,
  type HomeBlogsContent,
  fetchHomeBlogs,
  updateHomeBlogs,
} from "@/utils/homeBlogsApi";

function FieldLabel({ text }: { text: string }) {
  return (
    <p
      className="text-[10px] font-bold tracking-widest uppercase mb-1.5"
      style={{ color: "#591727" }}
    >
      {text}
    </p>
  );
}

function Field({
  value,
  onChange,
  placeholder,
  isDark,
  multiline = false,
  rows = 4,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
  isDark: boolean;
  multiline?: boolean;
  rows?: number;
}) {
  const st: React.CSSProperties = {
    borderRadius: 12,
    border: `1px solid ${isDark ? "#3a3a3a" : "#e5d5c8"}`,
    background: isDark ? "#1a1a1a" : "#fff",
    color: isDark ? "#fff" : "#2c1a1a",
    padding: "10px 12px",
    fontSize: 13,
  };
  if (multiline) {
    return (
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        rows={rows}
        className="w-full"
        style={st}
      />
    );
  }
  return (
    <input
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className="w-full"
      style={st}
    />
  );
}

export default function AccueilBlogsEditorPage() {
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const { canEditModule } = usePermissions();
  const canEdit = canEditModule("pages");
  const brand = "#711C31";
  const text2 = isDark ? "#aaa" : "#6b5a5e";
  const borderCol = isDark ? "#3a3a3a" : "#e5d5c8";
  const sectionStyle: React.CSSProperties = {
    background: isDark ? "#141414" : "#fff",
    border: `1px solid ${borderCol}`,
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
  };

  const [content, setContent] = useState<HomeBlogsContent>(DEFAULT_HOME_BLOGS);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      setContent(await fetchHomeBlogs());
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load Blog section");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  async function handleSave() {
    setSaving(true);
    setError(null);
    try {
      setContent(await updateHomeBlogs(content));
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Save failed");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="min-h-full ml-0 lg:ml-10 px-3 sm:px-4 mt-10">
        <p className="text-sm" style={{ color: text2 }}>
          Loading…
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-full ml-0 lg:ml-10 transition-colors duration-300 px-3 sm:px-4 lg:px-0 mt-10 md:mt-14 lg:mt-10 pb-10">
      <div className="flex items-center justify-between mb-5 gap-3 flex-wrap">
        <div>
          <h1
            className="text-3xl max-sm:text-xl font-bold"
            style={{ color: isDark ? "#ffffff" : brand }}
          >
            Accueil — Blog section
          </h1>
          <p className="text-sm mt-1" style={{ color: text2 }}>
            Edit only the section header. Blog cards stay managed under Blogs.
          </p>
        </div>
        {canEdit && (
          <button
            onClick={() => void handleSave()}
            disabled={saving}
            className="px-5 py-2 rounded-xl text-sm font-semibold text-white disabled:opacity-60"
            style={{ backgroundColor: isDark ? "#8B1A2E" : brand }}
          >
            {saving ? "Saving…" : saved ? "Saved" : "Save"}
          </button>
        )}
      </div>

      {error && (
        <p className="text-sm mb-4" style={{ color: "#b91c1c" }}>
          {error}
        </p>
      )}

      <div
        className="mb-5 rounded-xl px-4 py-3 text-sm"
        style={{
          background: isDark ? "#1a1a1a" : "#faf7f4",
          border: `1px solid ${borderCol}`,
          color: text2,
        }}
      >
        Carousel cards come from published posts in{" "}
        <Link
          href="/dashboard/Blogs"
          className="font-semibold underline"
          style={{ color: brand }}
        >
          Blogs
        </Link>
        . Do not recreate posts here.
      </div>

      <div style={sectionStyle}>
        <div className="mb-4">
          <FieldLabel text="Eyebrow" />
          <Field
            value={content.eyebrow}
            onChange={(v) => setContent((p) => ({ ...p, eyebrow: v }))}
            placeholder="Perspicacité et Inspiration"
            isDark={isDark}
          />
        </div>
        <div className="mb-4">
          <FieldLabel text="Title" />
          <Field
            value={content.title}
            onChange={(v) => setContent((p) => ({ ...p, title: v }))}
            placeholder="Nos blogs"
            isDark={isDark}
          />
        </div>
        <div>
          <FieldLabel text="Description" />
          <Field
            value={content.body}
            onChange={(v) => setContent((p) => ({ ...p, body: v }))}
            placeholder="Section description…"
            isDark={isDark}
            multiline
            rows={5}
          />
        </div>
      </div>
    </div>
  );
}
