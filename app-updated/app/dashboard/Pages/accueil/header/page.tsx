"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { useTheme } from "@/context/ThemeContext";
import { usePermissions } from "@/context/PermissionsContext";
import MediaImage from "@/components/MediaImage";
import UploadingOverlay from "@/components/admin/UploadingOverlay";
import { runOptimisticImageUpload } from "@/utils/optimisticImageUpload";
import {
  DEFAULT_HOME_HEADER,
  type HomeHeaderContent,
  type HomeHeaderNavItem,
  fetchHomeHeader,
  updateHomeHeader,
  uploadPageImage,
} from "@/utils/homeHeaderApi";

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
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
  isDark: boolean;
}) {
  return (
    <input
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className="w-full"
      style={{
        borderRadius: 12,
        border: `1px solid ${isDark ? "#3a3a3a" : "#e5d5c8"}`,
        background: isDark ? "#1a1a1a" : "#fff",
        color: isDark ? "#fff" : "#2c1a1a",
        padding: "10px 12px",
        fontSize: 13,
      }}
    />
  );
}

export default function AccueilHeaderEditorPage() {
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

  const [content, setContent] = useState<HomeHeaderContent>(DEFAULT_HOME_HEADER);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      setContent(await fetchHomeHeader());
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load Header");
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
      setContent(await updateHomeHeader(content));
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Save failed");
    } finally {
      setSaving(false);
    }
  }

  function updateNav(index: number, patch: Partial<HomeHeaderNavItem>) {
    setContent((prev) => ({
      ...prev,
      navItems: prev.navItems.map((item, i) => {
        if (i !== index) return item;
        const next = { ...item, ...patch };
        if (next.type === "specialities") next.href = "";
        return next;
      }),
    }));
  }

  function addNav(type: "link" | "specialities" = "link") {
    setContent((prev) => ({
      ...prev,
      navItems: [
        ...prev.navItems,
        type === "specialities"
          ? { type: "specialities", label: "Nos spécialités", href: "" }
          : { type: "link", label: "New link", href: "/" },
      ],
    }));
  }

  function removeNav(index: number) {
    setContent((prev) => ({
      ...prev,
      navItems: prev.navItems.filter((_, i) => i !== index),
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
            Accueil — Header section
          </h1>
          <p className="text-sm mt-1" style={{ color: text2 }}>
            Edit logo, navigation labels/links, and Contact button. Specialty
            dropdown items stay managed under Specialities.
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

      <div
        className="mb-5 rounded-xl px-4 py-3 text-sm"
        style={{
          background: isDark ? "#1a1a1a" : "#faf7f4",
          border: `1px solid ${borderCol}`,
          color: text2,
        }}
      >
        Social icons use URLs from{" "}
        <Link
          href="/dashboard/Pages/accueil/footer"
          className="font-semibold underline"
          style={{ color: brand }}
        >
          Footer section
        </Link>
        . Specialty pages come from{" "}
        <Link
          href="/dashboard/Specialities"
          className="font-semibold underline"
          style={{ color: brand }}
        >
          Specialities
        </Link>
        .
      </div>

      <div style={sectionStyle}>
        <div className="mb-4">
          <FieldLabel text="Logo" />
          <div className="flex items-center gap-3 mt-2">
            <MediaImage
              path={content.logoUrl}
              alt=""
              className="w-24 h-14 object-contain shrink-0 rounded-lg"
            />
            <label
              className="text-xs font-semibold cursor-pointer underline"
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
                    setContent((p) => ({ ...p, logoUrl: url }))
                  );
                  e.target.value = "";
                }}
              />
            </label>
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <FieldLabel text="Logo alt" />
            <Field
              value={content.logoAlt}
              onChange={(v) => setContent((p) => ({ ...p, logoAlt: v }))}
              placeholder="Atlas Dental Center"
              isDark={isDark}
            />
          </div>
          <div>
            <FieldLabel text="Logo click link (home)" />
            <Field
              value={content.logoHref}
              onChange={(v) => setContent((p) => ({ ...p, logoHref: v }))}
              placeholder="/"
              isDark={isDark}
            />
          </div>
        </div>
      </div>

      <div style={sectionStyle}>
        <div className="flex items-center justify-between mb-3 gap-3 flex-wrap">
          <FieldLabel text="Navigation items" />
          {canEdit && (
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => addNav("link")}
                className="text-xs font-semibold underline"
                style={{ color: brand }}
              >
                + Add link
              </button>
              <button
                type="button"
                onClick={() => addNav("specialities")}
                className="text-xs font-semibold underline"
                style={{ color: brand }}
              >
                + Add specialities dropdown
              </button>
            </div>
          )}
        </div>
        <div className="flex flex-col gap-3">
          {content.navItems.map((item, index) => (
            <div
              key={index}
              className="rounded-xl p-4 grid grid-cols-1 sm:grid-cols-[140px_1fr_1fr_auto] gap-3"
              style={{
                border: `1px solid ${borderCol}`,
                background: isDark ? "#1a1a1a" : "#faf7f4",
              }}
            >
              <div>
                <FieldLabel text="Type" />
                <select
                  value={item.type}
                  disabled={!canEdit}
                  onChange={(e) =>
                    updateNav(index, {
                      type: e.target.value as HomeHeaderNavItem["type"],
                    })
                  }
                  className="w-full"
                  style={{
                    borderRadius: 12,
                    border: `1px solid ${borderCol}`,
                    background: isDark ? "#1a1a1a" : "#fff",
                    color: isDark ? "#fff" : "#2c1a1a",
                    padding: "10px 12px",
                    fontSize: 13,
                  }}
                >
                  <option value="link">Link</option>
                  <option value="specialities">Specialities dropdown</option>
                </select>
              </div>
              <div>
                <FieldLabel text="Label" />
                <Field
                  value={item.label}
                  onChange={(v) => updateNav(index, { label: v })}
                  placeholder="Accueil"
                  isDark={isDark}
                />
              </div>
              <div>
                <FieldLabel text="Href" />
                {item.type === "specialities" ? (
                  <p className="text-xs pt-2" style={{ color: text2 }}>
                    Dropdown items come from Specialities (not edited here).
                  </p>
                ) : (
                  <Field
                    value={item.href}
                    onChange={(v) => updateNav(index, { href: v })}
                    placeholder="/"
                    isDark={isDark}
                  />
                )}
              </div>
              {canEdit && content.navItems.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeNav(index)}
                  className="text-xs underline self-end mb-2"
                  style={{ color: "#b91c1c" }}
                >
                  Remove
                </button>
              )}
            </div>
          ))}
        </div>
      </div>

      <div style={sectionStyle}>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <FieldLabel text="Contact button label" />
            <Field
              value={content.contactLabel}
              onChange={(v) => setContent((p) => ({ ...p, contactLabel: v }))}
              placeholder="Contact"
              isDark={isDark}
            />
          </div>
          <div>
            <FieldLabel text="Contact button link" />
            <Field
              value={content.contactHref}
              onChange={(v) => setContent((p) => ({ ...p, contactHref: v }))}
              placeholder="/pages/contact"
              isDark={isDark}
            />
          </div>
        </div>
      </div>

      {uploading && <UploadingOverlay />}
    </div>
  );
}
