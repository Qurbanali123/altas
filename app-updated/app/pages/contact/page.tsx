"use client";

import { useEffect, useState } from "react";
import { submitContactFormApi } from "@/utils/subscribersApi";
import VisitCtaSection from "@/components/VisitCtaSection";
import {
  DEFAULT_CONTACT_CONTENT,
  type ContactPageContent,
  fetchPublicContactContent,
} from "@/utils/contactApi";
import {
  PUBLIC_CMS_POLL_MS,
  setupVisiblePolling,
} from "@/utils/visiblePolling";

// ─── Icons ────────────────────────────────────────────────────────────────────
function PhoneIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 13a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.6 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 9.91a16 16 0 0 0 6.08 6.08l1.28-.9a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/>
    </svg>
  );
}
function MailIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
      <polyline points="22,6 12,13 2,6"/>
    </svg>
  );
}
function MapPinIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
      <circle cx="12" cy="10" r="3"/>
    </svg>
  );
}
function InstagramIcon() {
  return (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
    </svg>
  );
}
function FacebookIcon() {
  return (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="currentColor">
      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
    </svg>
  );
}
function LinkedInIcon() {
  return (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="currentColor">
      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
    </svg>
  );
}

// ─── Contact Info Row ─────────────────────────────────────────────────────────
function ContactRow({
  icon,
  children,
}: {
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div
      className="flex items-start gap-3"
      style={{
        border: "1px solid #711C31",
        borderRadius: 10,
        padding: "12px 16px",
        background: "#fff",
      }}
    >
      <div
        style={{
          width: 34,
          height: 34,
          borderRadius: 2,
          border: "1px solid #711C31",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "#7B2D3E",
          flexShrink: 0,
        }}
      >
        {icon}
      </div>
      <div style={{ fontSize: 13, color: "#591727", lineHeight: 1.6, fontWeight: "500" }}>
        {children}
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function ContactPage() {
  const [content, setContent] = useState<ContactPageContent>(DEFAULT_CONTACT_CONTENT);
  const [form, setForm] = useState({ nom: "", email: "", message: "" });
  const [sent, setSent] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; message: string } | null>(null);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      const data = await fetchPublicContactContent();
      if (!cancelled) setContent(data);
    };
    const stopPolling = setupVisiblePolling(load, PUBLIC_CMS_POLL_MS);
    return () => {
      cancelled = true;
      stopPolling();
    };
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (submitting) return;

    setSubmitting(true);
    setFeedback(null);

    try {
      const result = await submitContactFormApi({
        name: form.nom.trim(),
        email: form.email.trim(),
        message: form.message.trim(),
      });
      setSent(true);
      setFeedback({ type: "success", message: result.message });
      setForm({ nom: "", email: "", message: "" });
      setTimeout(() => {
        setSent(false);
        setFeedback(null);
      }, 4000);
    } catch (err) {
      setFeedback({
        type: "error",
        message: err instanceof Error ? err.message : "Failed to submit the form. Please try again.",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const inputStyle: React.CSSProperties = {
   width: "100%",
    background: "transparent",
    border: "1px solid #FFFFFF",
    borderRadius: 3,
    padding: "12px 16px",
    color: "#fff",
    fontSize: 13.5,
    fontFamily: "'Jost', sans-serif",
    fontWeight: 300,
    outline: "none",
    transition: "border-color 0.2s",
  };

  return (
    <>
      <style>{`

        /* LARGE DESKTOPS */
        @media (min-width: 1440px) {
          .cta-outer {
            padding: 0 100px !important;
          }
        }

        /* TABLET / SMALL LAPTOP */
        @media (max-width: 1024px) and (min-width: 769px) {
          .cta-outer {
            padding: 0 48px !important;
          }
            .contact-card-wrapper {
    display: flex !important;
    flex-direction: row !important; /* keep row */
  }

  .contact-form-panel {
    width: 50% !important;
    padding: 32px 24px !important;
  }

  .contact-card-section {
    padding: 10px 60px 30px 60px !important;
  }

  button[type="submit"] {
    width: 100% !important;
  }


        }

        @media (max-width: 768px) {

          /* Section 1 — Title */
          .contact-title-section {
            padding: 140px 20px 30px !important;
          }
          .contact-title-section h1 {
            font-size: 22px !important;
            letter-spacing: 0.5px !important;
          }

          /* Section 2 — Card wrapper */
          .contact-card-section {
            padding: 10px 16px 30px 16px !important;
          }
          .contact-card-wrapper {
            flex-direction: column !important;
            height: auto !important;
            border-radius: 14px !important;
          }

          /* Left panel — Form */
          .contact-form-panel {
            width: 100% !important;
            padding: 32px 20px !important;
            align-items: stretch !important;
          }
          .contact-form-panel h2 {
            font-size: 18px !important;
          }
          .contact-form-accent-line {
            margin-left: 0 !important;
          }
          .contact-input,
          .contact-form-panel input,
          .contact-form-panel textarea,
          .contact-form-panel button[type="submit"] {
            width: 100% !important;
            box-sizing: border-box !important;
          }
          .contact-form-panel form {
            width: 100% !important;
          }

          /* Right panel — Info */
          .contact-info-panel {
            padding: 28px 20px !important;
            gap: 16px !important;
          }

          /* CTA outer wrapper */
          .cta-outer {
            padding: 0 16px !important;
          }

          /* CTA inner card */
          .cta-wrapper {
            margin-top: 40px !important;
            margin-bottom: 40px !important;
            padding: 60px 20px !important;
            border-radius: 16px !important;
          }
          .cta-title {
            font-size: 18px !important;
            letter-spacing: 0.5px !important;
          }
          .cta-body {
            font-size: 12px !important;
            max-width: 100% !important;
          }
          .cta-body br {
            display: none !important;
          }
          .contact-cta-hand {
            display: none !important;
          }
        }
      `}</style>

      <main style={{ fontFamily: "'Jost', sans-serif", background: "#FFFFFF" }}>

        {/* ═══════════════════════════════════════════════════════
            SECTION 1 — PAGE TITLE
        ═══════════════════════════════════════════════════════ */}
        <section
          className="contact-title-section"
          style={{ background: "#FFFFFF", padding: "156px 80px 40px", textAlign: "center" }}
        >
          <h1
            style={{
              fontSize: 34,
              fontWeight: 500,
              color: "#711C31",
              letterSpacing: "1px",
              textTransform: "uppercase",
            }}
          >
            {content.pageTitle}
          </h1>
        </section>

        {/* ═══════════════════════════════════════════════════════
            SECTION 2 — CONTACT CARD (two panels)
        ═══════════════════════════════════════════════════════ */}
        <section
          className="contact-card-section"
          style={{ padding: "10px 100px 30px 100px" }}
        >
          <div
            className="contact-card-wrapper"
            style={{
              borderRadius: 20,
              overflow: "hidden",
              display: "flex",
              boxShadow: "0 8px 40px rgba(0,0,0,0.08)",
              height: 630,
            }}
          >
            {/* ── Left panel: Form ── */}
            <div
              className="contact-form-panel"
              style={{
                background: "#711C31",
                width: "48%",
                flexShrink: 0,
                padding: "48px 44px",
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <h2
                style={{
                  fontSize: 22,
                  fontWeight: 500,
                  color: "#fff",
                  marginBottom: 8,
                  letterSpacing: "0.3px",
                }}
              >
                {content.formTitle}
              </h2>
              <div
                className="contact-form-accent-line"
                style={{
                  width: 59,
                  marginLeft: "-140px",
                  height: 4,
                  background: "#FFFFFF",
                  borderRadius: 2,
                  marginBottom: 32,
                }}
              />

              <form
                onSubmit={handleSubmit}
                style={{ display: "flex", flexDirection: "column", gap: 14, flex: 1, width: "100%" }}
              >
                <input
                  className="contact-input"
                  type="text"
                  placeholder={content.namePlaceholder}
                  value={form.nom}
                  onChange={(e) => setForm({ ...form, nom: e.target.value })}
                  style={inputStyle}
                  required
                />
                <input
                  className="contact-input"
                  type="email"
                  placeholder={content.emailPlaceholder}
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  style={inputStyle}
                  required
                />
                <textarea
                  className="contact-input"
                  placeholder={content.messagePlaceholder}
                  value={form.message}
                  onChange={(e) => setForm({ ...form, message: e.target.value })}
                  rows={5}
                  style={{ ...inputStyle, resize: "none" }}
                  required
                />

                {feedback ? (
                  <p
                    role="alert"
                    style={{
                      margin: 0,
                      padding: "10px 12px",
                      borderRadius: 6,
                      fontSize: 13,
                      lineHeight: 1.45,
                      background: feedback.type === "success" ? "#fff5f5" : "#fff0f0",
                      color: feedback.type === "success" ? "#591727" : "#8B1A2E",
                      border: "1px solid #e8a0a8",
                    }}
                  >
                    {feedback.message}
                  </p>
                ) : null}

                <button
                  type="submit"
                  disabled={submitting}
                  style={{
                    marginTop: 4,
                    width: "100%",
                    maxWidth: "100%",
                    background: "#ffffff",
                    border: "1px solid #ffffff",
                    borderRadius: 3,
                    color: "#300E16",
                    fontSize: 17,
                    fontWeight: 500,
                    padding: "13px 0",
                    cursor: "pointer",
                    letterSpacing: "1px",
                    transition: "background 0.25s",
                  }}
                  onMouseEnter={(e) =>
                    ((e.currentTarget as HTMLButtonElement).style.background = "#F0F0F0")
                  }
                  onMouseLeave={(e) =>
                    ((e.currentTarget as HTMLButtonElement).style.background = "#F0F0F0")
                  }
                >
                  {sent ? "Envoyé ✓" : submitting ? "Envoi…" : content.submitLabel}
                </button>
              </form>
            </div>

            {/* ── Right panel: Info ── */}
            <div
              className="contact-info-panel"
              style={{
                flex: 1,
                background: "#F0F0F0",
                padding: "48px 44px",
                display: "flex",
                flexDirection: "column",
                gap: 20,
              }}
            >
              <p style={{ fontSize: 14, color: "#5a4040", lineHeight: 1.75, fontWeight: 300, marginBottom: 4 }}>
                {content.infoIntro}
              </p>

              {/* Map */}
              <div
                style={{
                  width: "100%",
                  height: 180,
                  borderRadius: 10,
                  overflow: "hidden",
                  border: "1px solid rgba(0,0,0,0.08)",
                  background: "#ddd",
                  flexShrink: 0,
                }}
              >
                <iframe
                  className="map-iframe"
                  src={content.mapEmbedUrl}
                  allowFullScreen
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  style={{ width: "100%", height: "100%", border: 0, borderRadius: 10 }}
                />
              </div>

              {/* Contact rows */}
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                <ContactRow icon={<PhoneIcon />}>
                  {content.phones.map((phone) => (
                    <div key={phone}>{phone}</div>
                  ))}
                </ContactRow>
                <ContactRow icon={<MailIcon />}>
                  {content.email}
                </ContactRow>
                <ContactRow icon={<MapPinIcon />}>
                  {content.address.split("\n").map((line, i) => (
                    <span key={i}>
                      {i > 0 ? <br /> : null}
                      {line}
                    </span>
                  ))}
                </ContactRow>
              </div>

              {/* Social icons */}
              <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, marginTop: "auto" }}>
                {[
                  { icon: <InstagramIcon />, label: "Instagram", href: content.instagramUrl },
                  { icon: <FacebookIcon />, label: "Facebook", href: content.facebookUrl },
                  { icon: <LinkedInIcon />, label: "LinkedIn", href: content.linkedinUrl },
                ].map(({ icon, label, href }) => (
                  <a
                    key={label}
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={label}
                    style={{
                      width: 36,
                      height: 36,
                      borderRadius: "50%",
                      border: "1px solid rgba(123,45,62,0.25)",
                      background: "transparent",
                      color: "#7B2D3E",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      cursor: "pointer",
                      transition: "all 0.2s",
                    }}
                    onMouseEnter={(e) => {
                      const b = e.currentTarget as HTMLAnchorElement;
                      b.style.background = "#7B2D3E";
                      b.style.color = "#fff";
                    }}
                    onMouseLeave={(e) => {
                      const b = e.currentTarget as HTMLAnchorElement;
                      b.style.background = "transparent";
                      b.style.color = "#7B2D3E";
                    }}
                  >
                    {icon}
                  </a>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ═══════════════════════════════════════════════════════
            SECTION 3 — CTA (shared)
        ═══════════════════════════════════════════════════════ */}
        <VisitCtaSection outerStyle={{ padding: "0 100px", boxSizing: "border-box" }} />

      </main>
    </>
  );
}
