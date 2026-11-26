"use client";

import { useCallback, useEffect, useState } from "react";
import { useTheme } from "@/context/ThemeContext";
import { usePermissions } from "@/context/PermissionsContext";
import MediaImage from "@/components/MediaImage";
import UploadingOverlay from "@/components/admin/UploadingOverlay";
import { runOptimisticImageUpload } from "@/utils/optimisticImageUpload";
import {
  DEFAULT_NOTRE_CENTRE_CONTENT,
  type NotreCentrePageContent,
  fetchNotreCentreContent,
  updateNotreCentreContent,
  uploadPageImage,
} from "@/utils/notreCentreApi";

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
  /** Short fields default to half width; set false inside grid columns */
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

export default function NotreCentreEditorPage() {
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const { canEditModule } = usePermissions();
  const canEdit = canEditModule("pages");
  const brand = "#591727";
  const borderCol = "#753141";
  const text2 = "#591727";

  const [content, setContent] = useState<NotreCentrePageContent>(DEFAULT_NOTRE_CENTRE_CONTENT);
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
      setContent(await fetchNotreCentreContent());
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
      setContent(await updateNotreCentreContent(content));
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Save failed");
    } finally {
      setSaving(false);
    }
  }

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
            Pages — Notre centre
          </h1>
          <p className="text-sm mt-1" style={{ color: text2 }}>
            Edit client page content. Design stays the same. CTA is shared under Pages → CTA section.
          </p>
        </div>
        <div className="flex gap-2">
          <a
            href="/pages/notre-centre"
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
              {saving ? "Saving…" : saved ? "Saved" : "Save"}
            </button>
          )}
        </div>
      </div>

      {error && (
        <p className="text-sm mb-4" style={{ color: "#b91c1c" }}>
          {error}
        </p>
      )}

      <div style={sectionStyle}>
        <h2 className="text-lg font-bold mb-4" style={{ color: brand }}>Hero</h2>
        <div className="mb-4">
          <FieldLabel text="Title" />
          <Field
            value={content.hero.title}
            onChange={(v) => setContent((p) => ({ ...p, hero: { ...p.hero, title: v } }))}
            placeholder="Notre centre"
            isDark={isDark}
          />
        </div>
        <div className="mb-4">
          <FieldLabel text="Bold lead (first paragraph prefix)" />
          <Field
            value={content.introBoldLead}
            onChange={(v) => setContent((p) => ({ ...p, introBoldLead: v }))}
            placeholder="Atlas Dental Center a été "
            isDark={isDark}
          />
        </div>
        {content.introParagraphs.map((para, idx) => (
          <div key={idx} className="mb-4">
            <FieldLabel text={`Paragraph ${idx + 1}${idx === 0 ? " (after bold lead)" : ""}`} />
            <Field
              value={para}
              onChange={(v) =>
                setContent((p) => {
                  const introParagraphs = [...p.introParagraphs];
                  introParagraphs[idx] = v;
                  return { ...p, introParagraphs };
                })
              }
              placeholder={`Paragraph ${idx + 1}`}
              isDark={isDark}
              multiline
              rows={4}
            />
          </div>
        ))}
        {canEdit && (
          <div className="flex gap-2 mb-4">
            <button
              type="button"
              className="px-3 py-1.5 rounded-xl text-xs font-semibold border"
              style={{ borderColor: borderCol, color: brand }}
              onClick={() =>
                setContent((p) => ({ ...p, introParagraphs: [...p.introParagraphs, ""] }))
              }
            >
              + Add paragraph
            </button>
            {content.introParagraphs.length > 1 && (
              <button
                type="button"
                className="px-3 py-1.5 rounded-xl text-xs font-semibold border"
                style={{ borderColor: borderCol, color: brand }}
                onClick={() =>
                  setContent((p) => ({
                    ...p,
                    introParagraphs: p.introParagraphs.slice(0, -1),
                  }))
                }
              >
                Remove last paragraph
              </button>
            )}
          </div>
        )}
        <FieldLabel text="Hero image" />
        <div className="flex items-center gap-2 mt-2">
          <div className="w-40 h-28 rounded-xl overflow-hidden border shrink-0" style={{ borderColor: borderCol }}>
            <MediaImage path={content.hero.imageUrl} alt="" className="w-full h-full object-cover" />
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
        <h2 className="text-lg font-bold mb-4" style={{ color: brand }}>À quoi s&apos;attendre</h2>
        <div className="mb-4">
          <FieldLabel text="Section title" />
          <Field
            value={content.expectTitle}
            onChange={(v) => setContent((p) => ({ ...p, expectTitle: v }))}
            placeholder="À quoi s'attendre..."
            isDark={isDark}
          />
        </div>
        {content.steps.map((step, idx) => (
          <div key={idx} className="mb-5 pb-4 border-b" style={{ borderColor: `${borderCol}55` }}>
            <p className="text-sm font-bold mb-2" style={{ color: brand }}>
              Step {step.num}
            </p>
            <div className="mb-3">
              <FieldLabel text="Title" />
              <Field
                value={step.title}
                onChange={(v) =>
                  setContent((p) => {
                    const steps = [...p.steps];
                    steps[idx] = { ...steps[idx], title: v };
                    return { ...p, steps };
                  })
                }
                placeholder="Step title"
                isDark={isDark}
              />
            </div>
            <div className="mb-3">
              <FieldLabel text="Body" />
              <Field
                value={step.body}
                onChange={(v) =>
                  setContent((p) => {
                    const steps = [...p.steps];
                    steps[idx] = { ...steps[idx], body: v };
                    return { ...p, steps };
                  })
                }
                placeholder="Step body"
                isDark={isDark}
                multiline
                rows={4}
              />
            </div>
            <FieldLabel text="Image" />
            <div className="flex items-center gap-2 mt-2">
              <MediaImage path={step.imgSrc} alt="" className="w-24 h-16 object-cover rounded-lg shrink-0" />
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
                      setContent((p) => {
                        const steps = [...p.steps];
                        steps[idx] = { ...steps[idx], imgSrc: url };
                        return { ...p, steps };
                      })
                    );
                    e.target.value = "";
                  }}
                />
              </label>
            </div>
          </div>
        ))}
      </div>

      <div style={sectionStyle}>
        <h2 className="text-lg font-bold mb-4" style={{ color: brand }}>Explore our space</h2>
        <div className="mb-4">
          <FieldLabel text="Section title" />
          <Field
            value={content.exploreTitle}
            onChange={(v) => setContent((p) => ({ ...p, exploreTitle: v }))}
            placeholder="Explore our space"
            isDark={isDark}
          />
        </div>
        {content.slides.map((slide, idx) => (
          <div key={idx} className="mb-4 flex flex-wrap items-start gap-3">
            <MediaImage path={slide.src} alt="" className="w-28 h-20 object-cover rounded-lg shrink-0" />
            <div className="min-w-[180px] w-full sm:w-1/2 max-w-md">
              <FieldLabel text={`Slide ${idx + 1} alt`} />
              <Field
                value={slide.alt}
                onChange={(v) =>
                  setContent((p) => {
                    const slides = [...p.slides];
                    slides[idx] = { ...slides[idx], alt: v };
                    return { ...p, slides };
                  })
                }
                placeholder="Alt text"
                isDark={isDark}
                half={false}
              />
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
                        setContent((p) => {
                          const slides = [...p.slides];
                          slides[idx] = { ...slides[idx], src: url };
                          return { ...p, slides };
                        })
                      );
                      e.target.value = "";
                    }}
                  />
                </label>
                {canEdit && content.slides.length > 1 && (
                  <button
                    type="button"
                    className="text-xs font-semibold underline"
                    style={{ color: "#b91c1c" }}
                    onClick={() =>
                      setContent((p) => ({
                        ...p,
                        slides: p.slides.filter((_, i) => i !== idx),
                      }))
                    }
                  >
                    Remove
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
        {canEdit && (
          <button
            type="button"
            className="mt-2 px-4 py-2 rounded-xl text-sm font-semibold border"
            style={{ borderColor: borderCol, color: brand }}
            onClick={() =>
              setContent((p) => ({
                ...p,
                slides: [...p.slides, { src: "/images/slide1.jpeg", alt: "Slide" }],
              }))
            }
          >
            + Add slide
          </button>
        )}
      </div>

      {uploading && <UploadingOverlay />}
    </div>
  );
}
