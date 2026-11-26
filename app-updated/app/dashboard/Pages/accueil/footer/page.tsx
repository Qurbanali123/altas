"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { useTheme } from "@/context/ThemeContext";
import { usePermissions } from "@/context/PermissionsContext";
import MediaImage from "@/components/MediaImage";
import UploadingOverlay from "@/components/admin/UploadingOverlay";
import { runOptimisticImageUpload } from "@/utils/optimisticImageUpload";
import {
  DEFAULT_HOME_FOOTER,
  FOOTER_SPECIALITIES_HREF,
  type HomeFooterContent,
  fetchHomeFooter,
  updateHomeFooter,
  uploadPageImage,
} from "@/utils/homeFooterApi";

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

export default function AccueilFooterEditorPage() {
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

  const [content, setContent] = useState<HomeFooterContent>(DEFAULT_HOME_FOOTER);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      setContent(await fetchHomeFooter());
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load Footer");
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
      setContent(await updateHomeFooter(content));
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Save failed");
    } finally {
      setSaving(false);
    }
  }

  function updateNav(index: number, patch: Partial<HomeFooterContent["navItems"][number]>) {
    setContent((prev) => ({
      ...prev,
      navItems: prev.navItems.map((item, i) =>
        i === index ? { ...item, ...patch } : item
      ),
    }));
  }

  function addNav() {
    setContent((prev) => ({
      ...prev,
      navItems: [...prev.navItems, { label: "New link", href: "/" }],
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
            Accueil — Footer section
          </h1>
          <p className="text-sm mt-1" style={{ color: text2 }}>
            Edit footer chrome only. Clinic contact & hours stay in Settings.
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
        Clinic name, email, phone, address, and business hours come from{" "}
        <Link
          href="/dashboard/Settings"
          className="font-semibold underline"
          style={{ color: brand }}
        >
          Settings
        </Link>
        . Do not recreate them here.
      </div>

      <div style={sectionStyle}>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
          <div>
            <FieldLabel text="Logo" />
            <div className="flex items-center gap-3 mt-2">
              <MediaImage
                path={content.logoUrl}
                alt=""
                className="w-16 h-16 object-contain shrink-0 rounded-lg"
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
          <div>
            <FieldLabel text="Background image" />
            <div className="flex items-center gap-3 mt-2">
              <MediaImage
                path={content.backgroundImageUrl}
                alt=""
                className="w-20 h-12 object-cover shrink-0 rounded-lg"
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
                      setContent((p) => ({ ...p, backgroundImageUrl: url }))
                    );
                    e.target.value = "";
                  }}
                />
              </label>
            </div>
          </div>
        </div>
        <div>
          <FieldLabel text="Logo alt text" />
          <Field
            value={content.logoAlt}
            onChange={(v) => setContent((p) => ({ ...p, logoAlt: v }))}
            placeholder="Atlas Dental Center"
            isDark={isDark}
          />
        </div>
      </div>

      <div style={sectionStyle}>
        <div className="mb-4">
          <FieldLabel text="Newsletter label" />
          <Field
            value={content.newsletterLabel}
            onChange={(v) => setContent((p) => ({ ...p, newsletterLabel: v }))}
            placeholder="SUBSCRIBE TO OUR NEWSLETTER"
            isDark={isDark}
          />
        </div>
        <div>
          <FieldLabel text="Newsletter placeholder" />
          <Field
            value={content.newsletterPlaceholder}
            onChange={(v) =>
              setContent((p) => ({ ...p, newsletterPlaceholder: v }))
            }
            placeholder="Votre email"
            isDark={isDark}
          />
        </div>
      </div>

      <div style={sectionStyle}>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
          <div>
            <FieldLabel text="Navigation title" />
            <Field
              value={content.navigationTitle}
              onChange={(v) => setContent((p) => ({ ...p, navigationTitle: v }))}
              placeholder="Navigation"
              isDark={isDark}
            />
          </div>
          <div>
            <FieldLabel text="Hours title" />
            <Field
              value={content.hoursTitle}
              onChange={(v) => setContent((p) => ({ ...p, hoursTitle: v }))}
              placeholder="Horaire"
              isDark={isDark}
            />
          </div>
          <div>
            <FieldLabel text="Contacts title" />
            <Field
              value={content.contactsTitle}
              onChange={(v) => setContent((p) => ({ ...p, contactsTitle: v }))}
              placeholder="Contacts"
              isDark={isDark}
            />
          </div>
        </div>

        <div className="flex items-center justify-between mb-3 gap-3 flex-wrap">
          <FieldLabel text="Navigation links" />
          {canEdit && (
            <button
              type="button"
              onClick={addNav}
              className="text-xs font-semibold underline"
              style={{ color: brand }}
            >
              + Add link
            </button>
          )}
        </div>
        <p className="text-xs mb-3" style={{ color: text2 }}>
          For “Nos spécialités”, set href to{" "}
          <code style={{ color: brand }}>{FOOTER_SPECIALITIES_HREF}</code> to
          auto-link the first published specialty.
        </p>
        <div className="flex flex-col gap-3">
          {content.navItems.map((item, index) => (
            <div
              key={index}
              className="rounded-xl p-4 grid grid-cols-1 sm:grid-cols-[1fr_1fr_auto] gap-3"
              style={{
                border: `1px solid ${borderCol}`,
                background: isDark ? "#1a1a1a" : "#faf7f4",
              }}
            >
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
                <Field
                  value={item.href}
                  onChange={(v) => updateNav(index, { href: v })}
                  placeholder="/"
                  isDark={isDark}
                />
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
        <div className="mb-4">
          <FieldLabel text="Instagram URL" />
          <Field
            value={content.instagramUrl}
            onChange={(v) => setContent((p) => ({ ...p, instagramUrl: v }))}
            placeholder="https://instagram.com/…"
            isDark={isDark}
          />
        </div>
        <div className="mb-4">
          <FieldLabel text="Facebook URL" />
          <Field
            value={content.facebookUrl}
            onChange={(v) => setContent((p) => ({ ...p, facebookUrl: v }))}
            placeholder="https://facebook.com/…"
            isDark={isDark}
          />
        </div>
        <div>
          <FieldLabel text="LinkedIn URL" />
          <Field
            value={content.linkedinUrl}
            onChange={(v) => setContent((p) => ({ ...p, linkedinUrl: v }))}
            placeholder="https://linkedin.com/…"
            isDark={isDark}
          />
        </div>
      </div>

      <div style={sectionStyle}>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
          <div>
            <FieldLabel text="Privacy label" />
            <Field
              value={content.privacyLabel}
              onChange={(v) => setContent((p) => ({ ...p, privacyLabel: v }))}
              placeholder="Privacy Policy"
              isDark={isDark}
            />
          </div>
          <div>
            <FieldLabel text="Privacy href" />
            <Field
              value={content.privacyHref}
              onChange={(v) => setContent((p) => ({ ...p, privacyHref: v }))}
              placeholder="/pages/Privacy_Policy"
              isDark={isDark}
            />
          </div>
          <div>
            <FieldLabel text="Terms label" />
            <Field
              value={content.termsLabel}
              onChange={(v) => setContent((p) => ({ ...p, termsLabel: v }))}
              placeholder="Terms & Conditions"
              isDark={isDark}
            />
          </div>
          <div>
            <FieldLabel text="Terms href" />
            <Field
              value={content.termsHref}
              onChange={(v) => setContent((p) => ({ ...p, termsHref: v }))}
              placeholder="/pages/Terms_condition"
              isDark={isDark}
            />
          </div>
        </div>
        <div>
          <FieldLabel text="Designer credit" />
          <Field
            value={content.creditText}
            onChange={(v) => setContent((p) => ({ ...p, creditText: v }))}
            placeholder="Designed & Developed by…"
            isDark={isDark}
          />
        </div>
      </div>

      {uploading && <UploadingOverlay />}
    </div>
  );
}
