"use client";

import { useEffect, useState } from "react";
import {
  DEFAULT_PRIVACY_CONTENT,
  type PrivacyPageContent,
  fetchPublicPrivacyContent,
} from "@/utils/privacyApi";
import {
  PUBLIC_CMS_POLL_MS,
  setupVisiblePolling,
} from "@/utils/visiblePolling";

function ChevronUp() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="18 15 12 9 6 15" />
    </svg>
  );
}

function ChevronDown() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="6 9 12 15 18 9" />
    </svg>
  );
}

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

export default function PrivacyPolicypage() {
  const [openIndex, setOpenIndex] = useState<number>(0);
  const [content, setContent] = useState<PrivacyPageContent>(DEFAULT_PRIVACY_CONTENT);

  useEffect(() => {
    let active = true;
    const load = async () => {
      const data = await fetchPublicPrivacyContent();
      if (active) setContent(data);
    };
    const stopPolling = setupVisiblePolling(load, PUBLIC_CMS_POLL_MS);
    return () => {
      active = false;
      stopPolling();
    };
  }, []);

  const toggle = (i: number) => setOpenIndex(openIndex === i ? -1 : i);

  return (
    <>
      <style>{`
        .pp-page {
          background: #f4eee1;
          min-height: 100vh;
        }

        .pp-title {
          font-size: 36px;
          font-weight: 600;
          color: #591727;
          text-align: center;
          line-height: 1.25;
          margin-bottom: 10px;
          letter-spacing: 0.01em;
        }

        .pp-date {
          font-size: 15.5px;
          font-weight: 400;
          color: #7a6a5a;
          text-align: center;
          margin-bottom: 0;
          letter-spacing: 0.01em;
        }

        .pp-accordion-wrap {
          max-width: 760px;
          margin: 52px auto 0;
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .pp-accordion-item {
          background: #faf7f0;
          border-radius: 12px;
          overflow: hidden;
          box-shadow: 0 1px 8px rgba(80,40,20,0.07);
        }

        .pp-accordion-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 13px 22px;
          font-size: 18px;
          cursor: pointer;
          background: transparent;
          border: none;
          width: 100%;
          text-align: left;
          transition: background 0.18s;
        }

        .pp-accordion-header:hover {
          background: rgba(113,28,49,0.03);
        }

        .pp-accordion-title {
          font-size: 22px;
          font-weight: 500;
          color: #591727;
          margin-bottom: 14px;
          line-height: 1.3;
        }

        .pp-accordion-icon {
          color: #711C31;
          flex-shrink: 0;
          margin-left: 16px;
          display: flex;
          align-items: center;
          transition: transform 0.25s ease;
        }

        .pp-accordion-body {
          padding: 0 32px 28px;
        }

        .pp-accordion-inner {
          background: #ede8dc;
          border-radius: 8px;
          padding: 24px 28px;
          font-family: 'Cormorant Garamond', Georgia, serif;
          font-weight: 500;
          font-size: 18px;
          color: #2a1e14;
          line-height: 1.75;
        }

        .pp-accordion-text {
          font-size: 16px;
          font-weight: 500;
          color: #2a1e14;
          line-height: 1.35;
          letter-spacing: 0.01em;
          margin: 0;
        }

        .pp-accordion-content {
          display: grid;
          grid-template-rows: 0fr;
          transition: grid-template-rows 0.32s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .pp-accordion-content.open {
          grid-template-rows: 1fr;
        }

        .pp-accordion-content-inner {
          overflow: hidden;
        }

        @media (max-width: 640px) {
          .pp-section {
            padding: 140px 20px 60px !important;
          }
          .pp-title {
            font-size: 26px;
          }
          .pp-date {
            font-size: 13.5px;
          }
          .pp-accordion-wrap {
            margin: 32px auto 0;
            gap: 12px;
          }
          .pp-accordion-header {
            padding: 12px 16px;
          }
          .pp-accordion-title {
            font-size: 17px;
            margin-bottom: 0;
          }
          .pp-accordion-body {
            padding: 0 14px 20px;
          }
          .pp-accordion-inner {
            padding: 16px 18px;
            font-size: 15px;
          }
          .pp-accordion-text {
            font-size: 14px;
            line-height: 1.6;
          }
        }
      `}</style>

      <main className="pp-page">
        <section className="pp-section" style={{ padding: "180px 80px 80px", background: "#f4eee1" }}>
          <h1 className="pp-title">
            <TitleLines title={content.title} />
          </h1>

          <p className="pp-date">{content.updatedAt}</p>

          <div className="pp-accordion-wrap">
            {content.sections.map((section, i) => {
              const isOpen = openIndex === i;
              return (
                <div key={`${section.title}-${i}`} className="pp-accordion-item">
                  <button
                    className="pp-accordion-header"
                    onClick={() => toggle(i)}
                    aria-expanded={isOpen}
                  >
                    <span className="pp-accordion-title">{section.title}</span>
                    <span className="pp-accordion-icon">
                      {isOpen ? <ChevronUp /> : <ChevronDown />}
                    </span>
                  </button>

                  <div className={`pp-accordion-content${isOpen ? " open" : ""}`}>
                    <div className="pp-accordion-content-inner">
                      <div className="pp-accordion-body">
                        <div className="pp-accordion-inner">
                          <p className="pp-accordion-text">{section.content}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      </main>
    </>
  );
}
