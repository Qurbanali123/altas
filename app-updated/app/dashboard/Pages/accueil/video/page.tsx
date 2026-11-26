"use client";

import { useCallback, useEffect, useState } from "react";
import { useTheme } from "@/context/ThemeContext";
import { usePermissions } from "@/context/PermissionsContext";
import MediaImage from "@/components/MediaImage";
import UploadingOverlay from "@/components/admin/UploadingOverlay";
import { runOptimisticImageUpload } from "@/utils/optimisticImageUpload";
import {
  DEFAULT_HOME_VIDEO,
  type HomeVideoContent,
  fetchHomeVideo,
  updateHomeVideo,
  uploadPageImage,
  resolveVideoPlayback,
} from "@/utils/homeVideoApi";

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
  rows = 3,
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

export default function AccueilVideoEditorPage() {
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

  const [content, setContent] = useState<HomeVideoContent>(DEFAULT_HOME_VIDEO);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const playback = resolveVideoPlayback(content.videoUrl);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      setContent(await fetchHomeVideo());
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load Video section");
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
      setContent(await updateHomeVideo(content));
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
            Accueil — Video section
          </h1>
          <p className="text-sm mt-1" style={{ color: text2 }}>
            Edit “Pourquoi nous choisir ?” copy, side image, and video link.
            YouTube/Vimeo/MP4 play embedded on the site (no redirect).
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
        <div className="mb-4">
          <FieldLabel text="Eyebrow" />
          <Field
            value={content.eyebrow}
            onChange={(v) => setContent((p) => ({ ...p, eyebrow: v }))}
            placeholder="Nous accueillons…"
            isDark={isDark}
          />
        </div>
        <div className="mb-4">
          <FieldLabel text="Title" />
          <Field
            value={content.title}
            onChange={(v) => setContent((p) => ({ ...p, title: v }))}
            placeholder="Pourquoi nous choisir ?"
            isDark={isDark}
          />
        </div>
        <div>
          <FieldLabel text="Subtitle (right column)" />
          <Field
            value={content.subtitle}
            onChange={(v) => setContent((p) => ({ ...p, subtitle: v }))}
            placeholder="Atlas Dental Center…"
            isDark={isDark}
            multiline
            rows={3}
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
            />
          </div>
          <div>
            <FieldLabel text="Button link" />
            <Field
              value={content.buttonHref}
              onChange={(v) => setContent((p) => ({ ...p, buttonHref: v }))}
              placeholder="/pages/Appointment"
              isDark={isDark}
            />
          </div>
        </div>
        <div className="mb-2">
          <FieldLabel text="Video URL (YouTube, Vimeo, or MP4 path)" />
          <Field
            value={content.videoUrl}
            onChange={(v) => setContent((p) => ({ ...p, videoUrl: v }))}
            placeholder="https://www.youtube.com/watch?v=… or /videos/file.mp4"
            isDark={isDark}
          />
        </div>
        <p className="text-xs mt-1" style={{ color: text2 }}>
          Detected playback:{" "}
          <span style={{ color: brand, fontWeight: 600 }}>
            {playback.kind === "file"
              ? `File — ${playback.src}`
              : `Embed (${playback.provider}) — plays on site`}
          </span>
        </p>
      </div>

      <div style={sectionStyle}>
        <div className="mb-4">
          <FieldLabel text="Side image" />
          <div className="flex items-center gap-3 mt-2">
            <MediaImage
              path={content.sideImageUrl}
              alt=""
              className="w-20 h-24 object-cover shrink-0 rounded-lg"
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
                    setContent((p) => ({ ...p, sideImageUrl: url }))
                  );
                  e.target.value = "";
                }}
              />
            </label>
          </div>
        </div>
        <div className="mb-4">
          <FieldLabel text="Side image alt" />
          <Field
            value={content.sideImageAlt}
            onChange={(v) => setContent((p) => ({ ...p, sideImageAlt: v }))}
            placeholder="Clinic treatment"
            isDark={isDark}
          />
        </div>
        <div>
          <FieldLabel text="Caption under image" />
          <Field
            value={content.caption}
            onChange={(v) => setContent((p) => ({ ...p, caption: v }))}
            placeholder="L'équilibre entre…"
            isDark={isDark}
            multiline
            rows={3}
          />
        </div>
      </div>

      {uploading && <UploadingOverlay />}
    </div>
  );
}
