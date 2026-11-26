"use client";

import { useCallback, useEffect, useState } from "react";
import { useTheme } from "@/context/ThemeContext";
import { usePermissions } from "@/context/PermissionsContext";
import MediaImage from "@/components/MediaImage";
import UploadingOverlay from "@/components/admin/UploadingOverlay";
import { runOptimisticImageUpload } from "@/utils/optimisticImageUpload";
import {
  DEFAULT_HOME_ABOUT,
  type HomeAboutContent,
  fetchHomeAbout,
  updateHomeAbout,
  uploadPageImage,
} from "@/utils/homeAboutApi";

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

export default function AccueilAboutEditorPage() {
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

  const [content, setContent] = useState<HomeAboutContent>(DEFAULT_HOME_ABOUT);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      setContent(await fetchHomeAbout());
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load About");
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
    cutout = false
  ) {
    setUploading(true);
    setError(null);
    const { uploadPageCutoutImage } = await import("@/utils/ctaApi");
    await runOptimisticImageUpload({
      file,
      upload: cutout ? uploadPageCutoutImage : uploadPageImage,
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
      setContent(await updateHomeAbout(content));
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
            Accueil — About section
          </h1>
          <p className="text-sm mt-1" style={{ color: text2 }}>
            Edit the Dr. Ghita card: title, text, button, and photo.
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
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
          <div>
            <FieldLabel text="Eyebrow" />
            <Field
              value={content.eyebrow}
              onChange={(v) => setContent((p) => ({ ...p, eyebrow: v }))}
              placeholder="À propos"
              isDark={isDark}
              half={false}
            />
          </div>
          <div>
            <FieldLabel text="Title" />
            <Field
              value={content.title}
              onChange={(v) => setContent((p) => ({ ...p, title: v }))}
              placeholder="Dr. Ghita Ouazzani Tnacheri"
              isDark={isDark}
              half={false}
            />
          </div>
        </div>
        <div className="mb-4">
          <FieldLabel text="Paragraph 1" />
          <Field
            value={content.paragraph1}
            onChange={(v) => setContent((p) => ({ ...p, paragraph1: v }))}
            placeholder="First paragraph..."
            isDark={isDark}
            multiline
            rows={5}
            half={false}
          />
        </div>
        <div>
          <FieldLabel text="Paragraph 2" />
          <Field
            value={content.paragraph2}
            onChange={(v) => setContent((p) => ({ ...p, paragraph2: v }))}
            placeholder="Second paragraph..."
            isDark={isDark}
            multiline
            rows={5}
            half={false}
          />
        </div>
      </div>

      <div style={sectionStyle}>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
          <div>
            <FieldLabel text="Button label" />
            <Field
              value={content.buttonLabel}
              onChange={(v) => setContent((p) => ({ ...p, buttonLabel: v }))}
              placeholder="Prendre rendez-vous"
              isDark={isDark}
              half={false}
            />
          </div>
          <div>
            <FieldLabel text="Button link" />
            <Field
              value={content.buttonHref}
              onChange={(v) => setContent((p) => ({ ...p, buttonHref: v }))}
              placeholder="/pages/Appointment"
              isDark={isDark}
              half={false}
            />
          </div>
        </div>
        <div className="mb-4">
          <FieldLabel text="Doctor image" />
          <div className="flex items-center gap-3 mt-2">
            <MediaImage
              path={content.imageUrl}
              alt=""
              className="w-20 h-28 object-contain shrink-0 rounded-lg"
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
                    (url) => setContent((p) => ({ ...p, imageUrl: url })),
                    true
                  );
                  e.target.value = "";
                }}
              />
            </label>
          </div>
        </div>
        <div>
          <FieldLabel text="Image alt text" />
          <Field
            value={content.imageAlt}
            onChange={(v) => setContent((p) => ({ ...p, imageAlt: v }))}
            placeholder="Dr. Ghita Ouazzani Tnacheri"
            isDark={isDark}
          />
        </div>
      </div>

      {uploading && <UploadingOverlay />}
    </div>
  );
}
