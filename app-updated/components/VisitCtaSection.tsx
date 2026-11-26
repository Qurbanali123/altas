"use client";

import { useEffect, useState } from "react";
import MediaImage from "@/components/MediaImage";
import { resolveMediaSource } from "@/utils/mediaUrl";
import {
  DEFAULT_SHARED_CTA,
  type SharedCtaContent,
  fetchPublicSharedCta,
} from "@/utils/ctaApi";
import {
  PUBLIC_CMS_POLL_MS,
  setupVisiblePolling,
} from "@/utils/visiblePolling";

type VisitCtaSectionProps = {
  /** Extra class on the outer spacing wrapper */
  outerClassName?: string;
  outerStyle?: React.CSSProperties;
};

export default function VisitCtaSection({
  outerClassName,
  outerStyle,
}: VisitCtaSectionProps) {
  const [cta, setCta] = useState<SharedCtaContent>(DEFAULT_SHARED_CTA);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      const data = await fetchPublicSharedCta();
      if (!cancelled) setCta(data);
    };
    const stopPolling = setupVisiblePolling(load, PUBLIC_CMS_POLL_MS);
    return () => {
      cancelled = true;
      stopPolling();
    };
  }, []);

  const bg = resolveMediaSource(cta.backgroundImageUrl);

  return (
    <>
      <style>{`
        .shared-cta-wrapper {
          margin: 0 auto 80px auto !important;
          max-width: 1200px;
          width: 100% !important;
          box-sizing: border-box;
          padding: 70px 40px;
        }
        @media (min-width: 1440px) {
          .shared-cta-wrapper {
            padding: 70px 60px !important;
            margin-bottom: 120px !important;
          }
        }
        @media (max-width: 1024px) and (min-width: 769px) {
          .shared-cta-wrapper {
            padding: 70px 40px !important;
            margin: 0 24px 80px 24px !important;
            width: auto !important;
            box-sizing: border-box;
          }
        }
        @media (max-width: 768px) {
          .shared-cta-outer {
            padding: 0 16px !important;
          }
          .shared-cta-wrapper {
            width: 100% !important;
            margin-left: 0 !important;
            margin-top: 40px !important;
            margin-bottom: 40px !important;
            padding: 60px 20px !important;
            border-radius: 16px !important;
          }
          .shared-cta-title {
            font-size: 18px !important;
            letter-spacing: 0.5px !important;
          }
          .shared-cta-body {
            font-size: 12px !important;
            max-width: 100% !important;
          }
          .shared-cta-hand {
            display: none !important;
          }
        }
        @media (max-width: 400px) {
          .shared-cta-title {
            font-size: 15px !important;
          }
        }
      `}</style>

      <div
        className={`shared-cta-outer ${outerClassName || ""}`.trim()}
        style={outerStyle}
      >
        <div
          className="shared-cta-wrapper"
          style={{
            backgroundImage: `url(${bg})`,
            backgroundRepeat: "no-repeat",
            backgroundSize: "100% 100%",
            backgroundPosition: "center",
            borderRadius: 20,
            padding: "80px 40px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            position: "relative",
            overflow: "hidden",
            textAlign: "center",
            width: "100%",
            marginTop: 60,
            marginBottom: 60,
            boxSizing: "border-box",
          }}
        >
          {/*
            mix-blend-mode must sit on a wrapper with NO opacity — opacity < 1
            isolates blending, so black JPEG fill stayed visible over the maroon card.
          */}
          <div
            className="shared-cta-hand-wrap"
            style={{
              position: "absolute",
              right: 0,
              bottom: 0,
              mixBlendMode: "lighten",
            }}
          >
            <MediaImage
              path={cta.handImageUrl}
              alt="Hand"
              className="shared-cta-hand"
              optimize={{ width: 440 }}
              style={{
                width: 220,
                objectFit: "contain",
                display: "block",
                transform: "scaleX(-1) scale(1.3) translateY(15px)",
                backgroundColor: "transparent",
              }}
            />
          </div>

          <div
            style={{
              position: "relative",
              zIndex: 2,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <h2
              className="shared-cta-title"
              style={{
                fontSize: 27,
                fontWeight: 500,
                color: "#D3D3D3",
                marginBottom: 14,
                textTransform: "uppercase",
                letterSpacing: "1px",
              }}
            >
              {cta.title}
            </h2>

            <p
              className="shared-cta-body"
              style={{
                fontSize: 20,
                color: "#FFFFFF",
                fontWeight: 300,
                lineHeight: 1.6,
                maxWidth: 600,
              }}
            >
              {cta.body}
            </p>

            <a
              href={cta.buttonHref || "/pages/Appointment"}
              style={{
                marginTop: 28,
                display: "inline-block",
                background: "transparent",
                border: "1.5px solid #FFFFFF",
                color: "#FFFFFF",
                padding: "13px 30px",
                borderRadius: 50,
                fontSize: 14,
                fontFamily: "'Jost', sans-serif",
                cursor: "pointer",
                textDecoration: "none",
                transition: "all 0.3s",
              }}
              onMouseEnter={(e) =>
                ((e.currentTarget as HTMLAnchorElement).style.background =
                  "rgba(255,255,255,0.1)")
              }
              onMouseLeave={(e) =>
                ((e.currentTarget as HTMLAnchorElement).style.background =
                  "transparent")
              }
            >
              {cta.buttonLabel}
            </a>
          </div>
        </div>
      </div>
    </>
  );
}
