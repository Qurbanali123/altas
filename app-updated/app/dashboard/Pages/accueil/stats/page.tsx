"use client";

import { useCallback, useEffect, useState } from "react";
import { useTheme } from "@/context/ThemeContext";
import { usePermissions } from "@/context/PermissionsContext";
import MediaImage from "@/components/MediaImage";
import UploadingOverlay from "@/components/admin/UploadingOverlay";
import { runOptimisticImageUpload } from "@/utils/optimisticImageUpload";
import {
  DEFAULT_HOME_STATS,
  type HomeStatsContent,
  fetchHomeStats,
  updateHomeStats,
  uploadPageImage,
} from "@/utils/homeStatsApi";

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

export default function AccueilStatsEditorPage() {
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

  const [content, setContent] = useState<HomeStatsContent>(DEFAULT_HOME_STATS);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      setContent(await fetchHomeStats());
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load Stats");
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
      setContent(await updateHomeStats(content));
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Save failed");
    } finally {
      setSaving(false);
    }
  }

  function updateStat(
    index: number,
    patch: Partial<HomeStatsContent["stats"][number]>
  ) {
    setContent((prev) => ({
      ...prev,
      stats: prev.stats.map((s, i) => (i === index ? { ...s, ...patch } : s)),
    }));
  }

  function addStat() {
    setContent((prev) => ({
      ...prev,
      stats: [
        ...prev.stats,
        { value: "0", label: "New stat", iconUrl: "/images/icon1.png" },
      ],
    }));
  }

  function removeStat(index: number) {
    setContent((prev) => ({
      ...prev,
      stats: prev.stats.filter((_, i) => i !== index),
    }));
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
            Accueil — Stats section
          </h1>
          <p className="text-sm mt-1" style={{ color: text2 }}>
            Edit the “Pourquoi choisir…” title, text, and stat cards below the hero.
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
          <FieldLabel text="Title" />
          <Field
            value={content.title}
            onChange={(v) => setContent((p) => ({ ...p, title: v }))}
            placeholder="Pourquoi choisir notre centre dentaire ?"
            isDark={isDark}
            half={false}
          />
        </div>
        <div>
          <FieldLabel text="Body" />
          <Field
            value={content.body}
            onChange={(v) => setContent((p) => ({ ...p, body: v }))}
            placeholder="Section description..."
            isDark={isDark}
            multiline
            rows={5}
            half={false}
          />
        </div>
      </div>

      <div style={sectionStyle}>
        <div className="flex items-center justify-between mb-4 gap-3 flex-wrap">
          <h2 className="text-sm font-bold" style={{ color: brand }}>
            Stat cards
          </h2>
          {canEdit && (
            <button
              type="button"
              onClick={addStat}
              className="text-xs font-semibold underline"
              style={{ color: brand }}
            >
              + Add stat
            </button>
          )}
        </div>

        <div className="flex flex-col gap-4">
          {content.stats.map((stat, index) => (
            <div
              key={`stat-${index}`}
              className="rounded-xl p-4"
              style={{ border: `1px solid ${borderCol}` }}
            >
              <div className="flex items-center justify-between mb-3">
                <p className="text-xs font-bold" style={{ color: text2 }}>
                  Stat {index + 1}
                </p>
                {canEdit && content.stats.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeStat(index)}
                    className="text-xs font-semibold"
                    style={{ color: "#b91c1c" }}
                  >
                    Remove
                  </button>
                )}
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
                <div>
                  <FieldLabel text="Value (number, + is added on site)" />
                  <Field
                    value={stat.value}
                    onChange={(v) => updateStat(index, { value: v })}
                    placeholder="3000"
                    isDark={isDark}
                    half={false}
                  />
                </div>
                <div>
                  <FieldLabel text="Label" />
                  <Field
                    value={stat.label}
                    onChange={(v) => updateStat(index, { label: v })}
                    placeholder="Patients"
                    isDark={isDark}
                    half={false}
                  />
                </div>
              </div>
              <div>
                <FieldLabel text="Icon" />
                <div className="flex items-center gap-2 mt-2">
                  <MediaImage
                    path={stat.iconUrl}
                    alt=""
                    className="w-10 h-10 object-contain shrink-0"
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
                          updateStat(index, { iconUrl: url })
                        );
                        e.target.value = "";
                      }}
                    />
                  </label>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {uploading && <UploadingOverlay />}
    </div>
  );
}
