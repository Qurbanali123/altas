"use client";

import { useCallback, useEffect, useState } from "react";
import { useTheme } from "@/context/ThemeContext";
import { usePermissions } from "@/context/PermissionsContext";
import {
  DEFAULT_CONTACT_CONTENT,
  type ContactPageContent,
  fetchContactContent,
  updateContactContent,
} from "@/utils/contactApi";

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

export default function ContactEditorPage() {
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const { canEditModule } = usePermissions();
  const canEdit = canEditModule("pages");
  const brand = "#591727";
  const borderCol = "#753141";
  const text2 = "#591727";

  const [content, setContent] = useState<ContactPageContent>(DEFAULT_CONTACT_CONTENT);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
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
      setContent(await fetchContactContent());
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load content");
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
      setContent(await updateContactContent(content));
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
            Pages — Contact
          </h1>
          <p className="text-sm mt-1" style={{ color: text2 }}>
            Edit client page content. CTA is shared under Pages → CTA section.
          </p>
        </div>
        <div className="flex gap-2">
          <a
            href="/pages/contact"
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
              disabled={saving}
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
        <h2 className="text-lg font-bold mb-4" style={{ color: brand }}>Page & form</h2>
        <div className="mb-4">
          <FieldLabel text="Page title" />
          <Field
            value={content.pageTitle}
            onChange={(v) => setContent((p) => ({ ...p, pageTitle: v }))}
            placeholder="Connectez-vous avec nous"
            isDark={isDark}
          />
        </div>
        <div className="mb-4">
          <FieldLabel text="Form title" />
          <Field
            value={content.formTitle}
            onChange={(v) => setContent((p) => ({ ...p, formTitle: v }))}
            placeholder="Prenez contact"
            isDark={isDark}
          />
        </div>
        <div className="mb-4">
          <FieldLabel text="Name placeholder" />
          <Field
            value={content.namePlaceholder}
            onChange={(v) => setContent((p) => ({ ...p, namePlaceholder: v }))}
            placeholder="Votre nom"
            isDark={isDark}
          />
        </div>
        <div className="mb-4">
          <FieldLabel text="Email placeholder" />
          <Field
            value={content.emailPlaceholder}
            onChange={(v) => setContent((p) => ({ ...p, emailPlaceholder: v }))}
            placeholder="Votre email"
            isDark={isDark}
          />
        </div>
        <div className="mb-4">
          <FieldLabel text="Message placeholder" />
          <Field
            value={content.messagePlaceholder}
            onChange={(v) => setContent((p) => ({ ...p, messagePlaceholder: v }))}
            placeholder="Votre message"
            isDark={isDark}
          />
        </div>
        <div className="mb-4">
          <FieldLabel text="Submit button label" />
          <Field
            value={content.submitLabel}
            onChange={(v) => setContent((p) => ({ ...p, submitLabel: v }))}
            placeholder="Envoyez"
            isDark={isDark}
          />
        </div>
      </div>

      <div style={sectionStyle}>
        <h2 className="text-lg font-bold mb-4" style={{ color: brand }}>Info panel</h2>
        <div className="mb-4">
          <FieldLabel text="Intro text" />
          <Field
            value={content.infoIntro}
            onChange={(v) => setContent((p) => ({ ...p, infoIntro: v }))}
            placeholder="Intro paragraph..."
            isDark={isDark}
            multiline
            rows={3}
          />
        </div>
        <div className="mb-4">
          <FieldLabel text="Google Maps embed URL" />
          <Field
            value={content.mapEmbedUrl}
            onChange={(v) => setContent((p) => ({ ...p, mapEmbedUrl: v }))}
            placeholder="https://www.google.com/maps/embed?..."
            isDark={isDark}
            half={false}
          />
        </div>
        <div className="mb-4">
          <FieldLabel text="Phone numbers (one per line)" />
          <Field
            value={content.phones.join("\n")}
            onChange={(v) =>
              setContent((p) => ({
                ...p,
                phones: v
                  .split("\n")
                  .map((line) => line.trim())
                  .filter(Boolean),
              }))
            }
            placeholder={"05 37 77 77 79\n06 68 20 10 10"}
            isDark={isDark}
            multiline
            rows={3}
            half={false}
          />
        </div>
        <div className="mb-4">
          <FieldLabel text="Email" />
          <Field
            value={content.email}
            onChange={(v) => setContent((p) => ({ ...p, email: v }))}
            placeholder="contact@atlasdentalcenter.com"
            isDark={isDark}
          />
        </div>
        <div className="mb-4">
          <FieldLabel text="Address (line breaks allowed)" />
          <Field
            value={content.address}
            onChange={(v) => setContent((p) => ({ ...p, address: v }))}
            placeholder="Address..."
            isDark={isDark}
            multiline
            rows={3}
          />
        </div>
      </div>

      <div style={sectionStyle}>
        <h2 className="text-lg font-bold mb-4" style={{ color: brand }}>Social links</h2>
        <div className="mb-4">
          <FieldLabel text="Instagram URL" />
          <Field
            value={content.instagramUrl}
            onChange={(v) => setContent((p) => ({ ...p, instagramUrl: v }))}
            placeholder="https://instagram.com/..."
            isDark={isDark}
            half={false}
          />
        </div>
        <div className="mb-4">
          <FieldLabel text="Facebook URL" />
          <Field
            value={content.facebookUrl}
            onChange={(v) => setContent((p) => ({ ...p, facebookUrl: v }))}
            placeholder="https://facebook.com/..."
            isDark={isDark}
            half={false}
          />
        </div>
        <div className="mb-4">
          <FieldLabel text="LinkedIn URL" />
          <Field
            value={content.linkedinUrl}
            onChange={(v) => setContent((p) => ({ ...p, linkedinUrl: v }))}
            placeholder="https://linkedin.com/..."
            isDark={isDark}
            half={false}
          />
        </div>
      </div>
    </div>
  );
}
