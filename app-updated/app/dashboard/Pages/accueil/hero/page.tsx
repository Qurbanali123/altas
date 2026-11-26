"use client";

import { useCallback, useEffect, useState } from "react";
import { useTheme } from "@/context/ThemeContext";
import { usePermissions } from "@/context/PermissionsContext";
import MediaImage from "@/components/MediaImage";
import UploadingOverlay from "@/components/admin/UploadingOverlay";
import { runOptimisticImageUpload } from "@/utils/optimisticImageUpload";
import {
  DEFAULT_HOME_HERO,
  type HomeHeroContent,
  fetchHomeHero,
  updateHomeHero,
  uploadPageImage,
} from "@/utils/homeHeroApi";

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
      className={half ? "w-full sm:w-1/2" : "w-full"}
      style={st}
    />
  );
}

export default function AccueilHeroEditorPage() {
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

  const [content, setContent] = useState<HomeHeroContent>(DEFAULT_HOME_HERO);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      setContent(await fetchHomeHero());
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load Hero");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  async function handleUpload(
    file: File,
    apply: (url: string) => void,
    mode: "default" | "exact" = "default"
  ) {
    setUploading(true);
    setError(null);
    const { uploadPageImageExact } = await import("@/utils/ctaApi");
    await runOptimisticImageUpload({
      file,
      upload: mode === "exact" ? uploadPageImageExact : uploadPageImage,
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
      const savedContent = await updateHomeHero(content);
      setContent(savedContent);
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
            Accueil — Hero section
          </h1>
          <p className="text-sm mt-1" style={{ color: text2 }}>
            Edit the home page hero titles, texts, and images. After Save, open
            Accueil (or refocus the tab) — content refreshes within a few seconds.
          </p>
        </div>
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

      {error && (
        <p className="text-sm mb-4" style={{ color: "#b91c1c" }}>
          {error}
        </p>
      )}

      <div style={sectionStyle}>
        <h2 className="text-sm font-bold mb-4" style={{ color: brand }}>
          Titles
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
          <div>
            <FieldLabel text="Desktop title" />
            <Field
              value={content.titleDesktop}
              onChange={(v) => setContent((p) => ({ ...p, titleDesktop: v }))}
              placeholder="L' art du sourire"
              isDark={isDark}
              half={false}
            />
          </div>
          <div>
            <FieldLabel text="Desktop accent" />
            <Field
              value={content.titleDesktopAccent}
              onChange={(v) =>
                setContent((p) => ({ ...p, titleDesktopAccent: v }))
              }
              placeholder="naturel."
              isDark={isDark}
              half={false}
            />
          </div>
          <div>
            <FieldLabel text="Mobile title" />
            <Field
              value={content.titleMobileMain}
              onChange={(v) =>
                setContent((p) => ({ ...p, titleMobileMain: v }))
              }
              placeholder="L' art du sourire "
              isDark={isDark}
              half={false}
            />
          </div>
          <div>
            <FieldLabel text="Mobile accent" />
            <Field
              value={content.titleMobileAccent}
              onChange={(v) =>
                setContent((p) => ({ ...p, titleMobileAccent: v }))
              }
              placeholder="naturel."
              isDark={isDark}
              half={false}
            />
          </div>
        </div>
      </div>

      <div style={sectionStyle}>
        <h2 className="text-sm font-bold mb-4" style={{ color: brand }}>
          Subtitles
        </h2>
        <div className="mb-4">
          <FieldLabel text="Desktop subtitle" />
          <Field
            value={content.subtitleDesktop}
            onChange={(v) => setContent((p) => ({ ...p, subtitleDesktop: v }))}
            placeholder="Desktop subtitle..."
            isDark={isDark}
            multiline
            rows={3}
            half={false}
          />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <FieldLabel text="Mobile subtitle line 1" />
            <Field
              value={content.subtitleMobileLine1}
              onChange={(v) =>
                setContent((p) => ({ ...p, subtitleMobileLine1: v }))
              }
              placeholder="Line 1"
              isDark={isDark}
              half={false}
            />
          </div>
          <div>
            <FieldLabel text="Mobile subtitle line 2" />
            <Field
              value={content.subtitleMobileLine2}
              onChange={(v) =>
                setContent((p) => ({ ...p, subtitleMobileLine2: v }))
              }
              placeholder="Line 2"
              isDark={isDark}
              half={false}
            />
          </div>
        </div>
      </div>

      <div style={sectionStyle}>
        <h2 className="text-sm font-bold mb-4" style={{ color: brand }}>
          Subscribe card
        </h2>
        <div className="mb-4">
          <FieldLabel text="Card text (use new lines)" />
          <Field
            value={content.subscribeCardText}
            onChange={(v) =>
              setContent((p) => ({ ...p, subscribeCardText: v }))
            }
            placeholder={"Abonnez-vous à\nnos actualités et\nmises à jour"}
            isDark={isDark}
            multiline
            rows={3}
            half={false}
          />
        </div>
        <div className="mb-4">
          <FieldLabel text="Button label" />
          <Field
            value={content.subscribeButtonLabel}
            onChange={(v) =>
              setContent((p) => ({ ...p, subscribeButtonLabel: v }))
            }
            placeholder="S'abonner"
            isDark={isDark}
          />
        </div>
        <div>
          <FieldLabel text="Card background image" />
          <div className="flex items-center gap-2 mt-2">
            <MediaImage
              path={content.subscribeCardBgUrl}
              alt=""
              className="w-24 h-16 object-cover rounded-lg shrink-0"
            />
            <label
              className="text-xs font-semibold cursor-pointer underline shrink-0"
              style={{ color: brand }}
            >
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
                    setContent((p) => ({ ...p, subscribeCardBgUrl: url }))
                  );
                  e.target.value = "";
                }}
              />
            </label>
          </div>
        </div>
      </div>

      <div style={sectionStyle}>
        <h2 className="text-sm font-bold mb-4" style={{ color: brand }}>
          Booking card
        </h2>
        <div className="mb-4">
          <FieldLabel text="Card text" />
          <Field
            value={content.bookingCardText}
            onChange={(v) => setContent((p) => ({ ...p, bookingCardText: v }))}
            placeholder="Réservation en ligne instantanée"
            isDark={isDark}
            half={false}
          />
        </div>
        <div className="mb-4">
          <FieldLabel text="Link" />
          <Field
            value={content.bookingCardHref}
            onChange={(v) => setContent((p) => ({ ...p, bookingCardHref: v }))}
            placeholder="/pages/Appointment"
            isDark={isDark}
            half={false}
          />
        </div>
        <div>
          <FieldLabel text="Icon image" />
          <div className="flex items-center gap-2 mt-2">
            <MediaImage
              path={content.bookingCardIconUrl}
              alt=""
              className="w-16 h-16 object-contain shrink-0"
            />
            <label
              className="text-xs font-semibold cursor-pointer underline shrink-0"
              style={{ color: brand }}
            >
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
                    setContent((p) => ({ ...p, bookingCardIconUrl: url }))
                  );
                  e.target.value = "";
                }}
              />
            </label>
          </div>
        </div>
      </div>

      <div style={sectionStyle}>
        <h2 className="text-sm font-bold mb-4" style={{ color: brand }}>
          Images
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
          <div>
            <FieldLabel text="Background image" />
            <div className="flex items-center gap-2 mt-2">
              <MediaImage
                path={content.backgroundImageUrl}
                alt=""
                className="w-24 h-16 object-cover rounded-lg shrink-0"
              />
              <label
                className="text-xs font-semibold cursor-pointer underline shrink-0"
                style={{ color: brand }}
              >
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
                      setContent((p) => ({ ...p, backgroundImageUrl: url }))
                    );
                    e.target.value = "";
                  }}
                />
              </label>
            </div>
          </div>
          <div>
            <FieldLabel text="Doctor image" />
            <div className="flex items-center gap-2 mt-2">
              <MediaImage
                path={content.doctorImageUrl}
                alt=""
                className="w-16 h-20 object-contain shrink-0"
              />
              <label
                className="text-xs font-semibold cursor-pointer underline shrink-0"
                style={{ color: brand }}
              >
                Upload
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  disabled={!canEdit || uploading}
                  onChange={(e) => {
                    const f = e.target.files?.[0];
                    if (!f) return;
                    void handleUpload(
                      f,
                      (url) =>
                        setContent((p) => ({ ...p, doctorImageUrl: url })),
                      "exact"
                    );
                    e.target.value = "";
                  }}
                />
              </label>
            </div>
          </div>
        </div>
        <div>
          <FieldLabel text="Doctor image alt text" />
          <Field
            value={content.doctorImageAlt}
            onChange={(v) => setContent((p) => ({ ...p, doctorImageAlt: v }))}
            placeholder="Dental doctor"
            isDark={isDark}
          />
        </div>
      </div>

      {uploading && <UploadingOverlay />}
    </div>
  );
}
