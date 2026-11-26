"use client";

import { useCallback, useEffect, useState } from "react";
import { useTheme } from "@/context/ThemeContext";
import { usePermissions } from "@/context/PermissionsContext";
import MediaImage from "@/components/MediaImage";
import UploadingOverlay from "@/components/admin/UploadingOverlay";
import { runOptimisticImageUpload } from "@/utils/optimisticImageUpload";
import {
  DEFAULT_AVANT_APRES_CONTENT,
  type AvantApresPageContent,
  fetchAvantApresContent,
  updateAvantApresContent,
  uploadPageImage,
} from "@/utils/avantApresApi";

function FieldLabel({ text }: { text: string }) {
  return (
    <p className="text-[10px] font-bold tracking-widest uppercase mb-1.5" style={{ color: "#591727" }}>
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
  half = true,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
  isDark: boolean;
  multiline?: boolean;
  rows?: number;
  half?: boolean;
}) {
  const st: React.CSSProperties = {
    backgroundColor: isDark ? "#c9a898" : "#ffffff",
    borderColor: isDark ? "#5C2A3A" : "#7a7072",
    color: "#591727",
  };
  if (multiline) {
    return (
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        rows={rows}
        className="w-full px-4 py-3 rounded-2xl text-sm outline-none border resize-none"
        style={st}
      />
    );
  }
  return (
    <input
      type="text"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className={`${half ? "w-full sm:w-1/2" : "w-full"} px-4 py-3 rounded-2xl text-sm outline-none border`}
      style={st}
    />
  );
}

export default function AvantApresPageEditor() {
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const { canEditModule } = usePermissions();
  const canEdit = canEditModule("pages");

  const brand = "#591727";
  const borderCol = "#753141";
  const text2 = "#591727";

  const [content, setContent] = useState<AvantApresPageContent>(DEFAULT_AVANT_APRES_CONTENT);
  const [activeCaseCategory, setActiveCaseCategory] = useState(
    DEFAULT_AVANT_APRES_CONTENT.defaultCategory
  );
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  const sectionStyle: React.CSSProperties = {
    backgroundColor: isDark ? "#c9a898" : "#f0f0f0",
    borderColor: borderCol,
    borderWidth: 1,
    borderStyle: "solid",
    borderRadius: 16,
    padding: "20px 24px",
    marginBottom: 16,
  };

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchAvantApresContent();
      setContent(data);
      setActiveCaseCategory(data.defaultCategory || data.categories[0] || "");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load content");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  async function handleUpload(file: File, apply: (url: string) => void) {
    setUploading(true);
    setError(null);
    await runOptimisticImageUpload({
      file,
      upload: uploadPageImage,
      onPreview: apply,
      onSuccess: apply,
      onError: (err) => setError(err.message),
    });
    setUploading(false);
  }

  async function handleSave() {
    setSaving(true);
    setError(null);
    try {
      const savedData = await updateAvantApresContent(content);
      setContent(savedData);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Save failed");
    } finally {
      setSaving(false);
    }
  }

  function updateCategoryCases(
    category: string,
    updater: (items: AvantApresPageContent["cases"][0]["items"]) => AvantApresPageContent["cases"][0]["items"]
  ) {
    setContent((prev) => {
      const cases = [...prev.cases];
      const idx = cases.findIndex((c) => c.category === category);
      if (idx === -1) {
        cases.push({ category, items: updater([]) });
      } else {
        cases[idx] = { ...cases[idx], items: updater(cases[idx].items || []) };
      }
      return { ...prev, cases };
    });
  }

  const activeItems =
    content.cases.find((c) => c.category === activeCaseCategory)?.items || [];

  if (loading) {
    return (
      <div className="min-h-full ml-0 lg:ml-10 px-3 sm:px-4 mt-10">
        <p className="text-sm" style={{ color: text2 }}>Loading…</p>
      </div>
    );
  }

  return (
    <div className="min-h-full ml-0 lg:ml-10 transition-colors duration-300 px-3 sm:px-4 lg:px-0 mt-10 md:mt-14 lg:mt-10 pb-10">
      <div className="flex items-center justify-between mb-5 gap-3 flex-wrap">
        <div>
          <h1 className="text-3xl max-sm:text-xl font-bold" style={{ color: isDark ? "#ffffff" : brand }}>
            Pages — Avant/Après
          </h1>
          <p className="text-sm mt-1" style={{ color: text2 }}>
            Edit client page content. Design stays the same.
          </p>
        </div>
        <div className="flex gap-2">
          <a
            href="/pages/avant-apres"
            target="_blank"
            rel="noopener noreferrer"
            className="px-4 py-2 rounded-xl text-sm font-semibold border"
            style={{ borderColor: borderCol, color: brand }}
          >
            View page
          </a>
          {canEdit && (
            <button
              onClick={() => void handleSave()}
              disabled={saving || uploading}
              className="px-5 py-2 rounded-xl text-sm font-semibold text-white disabled:opacity-60"
              style={{ backgroundColor: isDark ? "#8B1A2E" : brand }}
            >
              {saving ? "Saving…" : "Save Page"}
            </button>
          )}
        </div>
      </div>

      {error && (
        <p className="text-sm mb-4 px-4 py-2 rounded-xl" style={{ backgroundColor: "#fde8e8", color: "#b00020" }}>
          {error}
        </p>
      )}
      {saved && (
        <p className="text-sm mb-4 px-4 py-2 rounded-xl" style={{ backgroundColor: "#e8f5e9", color: "#2e7d32" }}>
          Changes Saved.
        </p>
      )}

      <div style={sectionStyle}>
        <h2 className="text-lg font-bold mb-4" style={{ color: brand }}>Hero</h2>
        <div className="mb-4">
          <FieldLabel text="Title" />
          <Field
            value={content.hero.title}
            onChange={(v) => setContent((p) => ({ ...p, hero: { ...p.hero, title: v } }))}
            placeholder="Avant/Après"
            isDark={isDark}
          />
        </div>
        <div className="mb-4">
          <FieldLabel text="Body" />
          <Field
            value={content.hero.body}
            onChange={(v) => setContent((p) => ({ ...p, hero: { ...p.hero, body: v } }))}
            placeholder="Hero paragraph..."
            isDark={isDark}
            multiline
            rows={6}
          />
        </div>
        <FieldLabel text="Hero image" />
        <div className="flex items-center gap-2 mt-2">
          <div className="w-32 h-28 rounded-xl overflow-hidden border shrink-0" style={{ borderColor: borderCol }}>
            <MediaImage
              path={content.hero.imageUrl}
              alt=""
              className="w-full h-full object-cover"
              style={{ objectPosition: "center 28%" }}
            />
          </div>
          <label className="text-xs font-semibold cursor-pointer underline shrink-0" style={{ color: brand }}>
            Upload
            <input
              type="file"
              accept="image/*"
              className="hidden"
              disabled={!canEdit || uploading}
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (!f) return;
                void handleUpload(f, (url) =>
                  setContent((p) => ({ ...p, hero: { ...p.hero, imageUrl: url } }))
                );
                e.target.value = "";
              }}
            />
          </label>
        </div>
      </div>

      <div style={sectionStyle}>
        <h2 className="text-lg font-bold mb-4" style={{ color: brand }}>Categories & cases</h2>
        <div className="mb-4">
          <FieldLabel text="Categories (comma separated, order = tab order)" />
          <Field
            value={content.categories.join(", ")}
            onChange={(v) => {
              const categories = v
                .split(",")
                .map((c) => c.trim())
                .filter(Boolean);
              setContent((p) => ({ ...p, categories }));
            }}
            placeholder="Pédodontie, Dentisterie Esthétique, ..."
            isDark={isDark}
            half={false}
          />
        </div>
        <div className="mb-4">
          <FieldLabel text="Default active category" />
          <select
            value={content.defaultCategory}
            onChange={(e) => setContent((p) => ({ ...p, defaultCategory: e.target.value }))}
            className="w-full sm:w-1/2 px-4 py-3 rounded-2xl text-sm outline-none border"
            style={{
              backgroundColor: isDark ? "#c9a898" : "#ffffff",
              borderColor: isDark ? "#5C2A3A" : "#7a7072",
              color: brand,
            }}
          >
            {content.categories.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>

        <FieldLabel text="Edit cases for category" />
        <div className="flex flex-wrap gap-2 mt-2 mb-4">
          {content.categories.map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => setActiveCaseCategory(c)}
              className="px-3 py-1.5 rounded-full text-xs font-semibold border"
              style={{
                borderColor: borderCol,
                backgroundColor: c === activeCaseCategory ? brand : "#fff",
                color: c === activeCaseCategory ? "#fff" : brand,
              }}
            >
              {c}
            </button>
          ))}
        </div>

        <div className="flex flex-col gap-3">
          {activeItems.map((item, index) => (
            <div
              key={`${activeCaseCategory}-${index}`}
              className="rounded-xl border p-3 flex flex-wrap items-start gap-3"
              style={{ borderColor: borderCol, backgroundColor: isDark ? "#d0baa3" : "#fff" }}
            >
              <div className="w-28 h-20 rounded-lg overflow-hidden border shrink-0" style={{ borderColor: borderCol }}>
                <MediaImage path={item.imgSrc} alt="" className="w-full h-full object-cover" />
              </div>
              <div className="min-w-[160px]">
                <FieldLabel text="Label" />
                <select
                  value={item.label}
                  onChange={(e) =>
                    updateCategoryCases(activeCaseCategory, (items) => {
                      const next = [...items];
                      next[index] = { ...next[index], label: e.target.value };
                      return next;
                    })
                  }
                  className="w-full px-3 py-2 rounded-xl text-sm border outline-none"
                  style={{ borderColor: borderCol, color: brand }}
                >
                  <option value="Avant">Avant</option>
                  <option value="Après">Après</option>
                </select>
                <div className="flex items-center gap-3 mt-2">
                  <label className="text-xs font-semibold cursor-pointer underline" style={{ color: brand }}>
                    Upload
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      disabled={!canEdit || uploading}
                      onChange={(e) => {
                        const f = e.target.files?.[0];
                        if (!f) return;
                        void handleUpload(f, (url) =>
                          updateCategoryCases(activeCaseCategory, (items) => {
                            const next = [...items];
                            next[index] = { ...next[index], imgSrc: url };
                            return next;
                          })
                        );
                        e.target.value = "";
                      }}
                    />
                  </label>
                  {canEdit && (
                    <button
                      type="button"
                      className="text-xs font-semibold underline"
                      style={{ color: "#b91c1c" }}
                      onClick={() =>
                        updateCategoryCases(activeCaseCategory, (items) =>
                          items.filter((_, i) => i !== index)
                        )
                      }
                    >
                      Remove
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {canEdit && (
          <button
            type="button"
            className="mt-4 px-4 py-2 rounded-xl text-sm font-semibold border"
            style={{ borderColor: borderCol, color: brand }}
            onClick={() =>
              updateCategoryCases(activeCaseCategory, (items) => [
                ...items,
                { label: items.length % 2 === 0 ? "Après" : "Avant", imgSrc: "/images/teeth1.jpg" },
              ])
            }
          >
            + Add image to {activeCaseCategory || "category"}
          </button>
        )}
      </div>

      <div style={sectionStyle}>
        <h2 className="text-lg font-bold mb-2" style={{ color: brand }}>CTA section</h2>
        <p className="text-sm mb-3" style={{ color: text2 }}>
          This block is shared site-wide. Edit it once under{" "}
          <a href="/dashboard/Pages/cta" className="underline font-semibold" style={{ color: brand }}>
            Pages → CTA section
          </a>
          .
        </p>
        <a
          href="/dashboard/Pages/cta"
          className="inline-block px-4 py-2 rounded-xl text-sm font-semibold text-white"
          style={{ backgroundColor: isDark ? "#8B1A2E" : brand }}
        >
          Open shared CTA editor
        </a>
      </div>

      {uploading && <UploadingOverlay />}
    </div>
  );
}
