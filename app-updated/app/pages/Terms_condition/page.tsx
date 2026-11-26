"use client";

import { useEffect, useState } from "react";
import {
  DEFAULT_TERMS_CONTENT,
  type TermsPageContent,
  fetchPublicTermsContent,
} from "@/utils/termsApi";
import {
  PUBLIC_CMS_POLL_MS,
  setupVisiblePolling,
} from "@/utils/visiblePolling";

function TitleLines({ title }: { title: string }) {
  const lines = title.split(/\n/).filter((l) => l.length > 0);
  return (
    <>
      {lines.map((line, i) => (
        <span key={i}>
          {i > 0 && <br />}
          {line}
        </span>
      ))}
    </>
  );
}

export default function TermsConditionpage() {
  const [content, setContent] = useState<TermsPageContent>(DEFAULT_TERMS_CONTENT);

  useEffect(() => {
    let active = true;
    const load = async () => {
      const data = await fetchPublicTermsContent();
      if (active) setContent(data);
    };
    const stopPolling = setupVisiblePolling(load, PUBLIC_CMS_POLL_MS);
    return () => {
      active = false;
      stopPolling();
    };
  }, []);

  return (
    <>
      <style>{`

        .terms-page {
          background: #EFE7CE;
          min-height: 100vh;
          font-seasons !important;
        }

        .terms-eyebrow {
          font-size: 14px;
          font-weight: 600;
          letter-spacing: 0em;
          text-transform: uppercase;
          color: #591727;
          text-align: center;
          margin-bottom: 14px;
        }

        .terms-main-title {
          font-size: 36px;
          font-weight: 600;
          color: #591727;
          text-align: center;
          line-height: 1.25;
          margin-bottom: 10px;
          letter-spacing: 0.01em;
        }

        .terms-date {
          font-size: 20px;
          font-weight: 400;
          color: #591727;
          text-align: center;
          margin-bottom: 0;
        }

        .terms-card {
          background: #faf8f3;
          border-radius: 6px;
          padding: 72px 64px 48px;
          margin: 36px auto 0;
          max-width: 900px;
        }

        .terms-section {
          margin-bottom: 36px;
        }

        .terms-section:last-of-type {
          margin-bottom: 0;
        }

        .terms-section-title {
          font-size: 22px;
          font-weight: 600;
          color: #591727;
          margin-bottom: 14px;
          line-height: 1.3;
        }

        .terms-body {
          font-size: 14px;
          font-weight: 600;
          color: #5D5153;
          line-height: 1.28;
          margin-bottom: 14px;
        }

        .terms-body:last-child {
          margin-bottom: 0;
        }

        .terms-divider {
          border: none;
          border-top: 1px solid #d4c9b8;
          margin: 44px 0 32px;
        }

        .terms-contact-block {
          text-align: center;
        }

        .terms-contact-text {
          font-size: 17.5px;
          font-weight: 600;
          color: #5D5153;
          margin-bottom: 8px;
          line-height: 1.6;
        }

        .terms-contact-email {
          font-family: 'Cormorant Garamond', Georgia, serif;
          font-size: 18px;
          font-weight: 500;
          color: #591727;
          text-decoration: none;
          display: block;
          text-align: center;
        }

        .terms-contact-email:hover {
          opacity: 0.75;
        }

        /* ── Tablet (641px – 1024px) ── */
        @media (min-width: 641px) and (max-width: 1024px) {
          .terms-page section {
            padding: 140px 40px 56px !important;
          }
          .terms-main-title {
            font-size: 30px !important;
          }
          .terms-card {
            padding: 52px 40px 40px !important;
            max-width: 100% !important;
          }
          .terms-section-title {
            font-size: 19px !important;
          }
          .terms-body {
            font-size: 14px !important;
            line-height: 1.55 !important;
          }
          .terms-contact-text {
            font-size: 15px !important;
          }
          .terms-contact-email {
            font-size: 16px !important;
          }
        }

        /* ── Mobile (≤ 640px) ── */
        @media (max-width: 640px) {
          .terms-page section {
            padding: 140px 16px 48px !important;
          }
          .terms-eyebrow {
            font-size: 11px !important;
            letter-spacing: 0.1em !important;
            margin-bottom: 10px !important;
          }
          .terms-main-title {
            font-size: 22px !important;
            line-height: 1.3 !important;
            margin-bottom: 8px !important;
          }
          .terms-date {
            font-size: 14px !important;
          }
          .terms-card {
            padding: 28px 18px 28px !important;
            margin: 20px auto 0 !important;
            max-width: 100% !important;
            border-radius: 12px !important;
          }
          .terms-section {
            margin-bottom: 24px !important;
          }
          .terms-section-title {
            font-size: 16px !important;
            margin-bottom: 10px !important;
          }
          .terms-body {
            font-size: 11px !important;
            line-height: 1.65 !important;
            margin-bottom: 12px !important;
          }
          .terms-divider {
            margin: 28px 0 20px !important;
          }
          .terms-contact-text {
            font-size: 13px !important;
          }
          .terms-contact-email {
            font-size: 14px !important;
            word-break: break-all !important;
          }
        }
      `}</style>

      <main className="terms-page">
        <section style={{ padding: "180px 80px 72px", background: "#f4eee1" }}>
          <p className="terms-eyebrow">{content.eyebrow}</p>

          <h1 className="terms-main-title">
            <TitleLines title={content.title} />
          </h1>

          <p className="terms-date">{content.updatedAt}</p>

          <div className="terms-card">
            {content.sections.map((section, i) => (
              <div key={`${section.title}-${i}`} className="terms-section">
                <h2 className="terms-section-title">{section.title}</h2>
                {section.paragraphs.map((p, pi) => (
                  <p key={pi} className="terms-body">
                    {p}
                  </p>
                ))}
              </div>
            ))}

            <hr className="terms-divider" />

            <div className="terms-contact-block">
              <p className="terms-contact-text">{content.contactText}</p>
              <a href={`mailto:${content.contactEmail}`} className="terms-contact-email">
                {content.contactEmail}
              </a>
            </div>
          </div>
        </section>
      </main>
    </>
  );
}
