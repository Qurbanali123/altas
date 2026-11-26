"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import VisitCtaSection from "@/components/VisitCtaSection";
import MediaImage from "@/components/MediaImage";
import {
  DEFAULT_NOTRE_CENTRE_CONTENT,
  type NotreCentrePageContent,
  type NotreCentreSlide,
  fetchPublicNotreCentreContent,
} from "@/utils/notreCentreApi";
import {
  PUBLIC_CMS_POLL_MS,
  setupVisiblePolling,
} from "@/utils/visiblePolling";

// ─── CAROUSEL ───────────────────────────────────────────────────────────────
function ExploreCarousel({ slides }: { slides: NotreCentreSlide[] }) {
  const [current, setCurrent] = useState(0);
  const [animating, setAnimating] = useState(false);
  const [direction, setDirection] = useState<"left" | "right" | null>(null);
  const [isMobile, setIsMobile] = useState(false);
  const autoRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const spaceSlides = slides.length > 0 ? slides : DEFAULT_NOTRE_CENTRE_CONTENT.slides;
  const total = spaceSlides.length;
  const [isTablet, setIsTablet] = useState(false);

  useEffect(() => {
    setCurrent((prev) => (prev >= total ? 0 : prev));
  }, [total]);

useEffect(() => {
  const checkSize = () => {
    setIsTablet(window.innerWidth >= 426 && window.innerWidth <= 768);
  };

  checkSize(); // run on mount
  window.addEventListener("resize", checkSize);

  return () => window.removeEventListener("resize", checkSize);
}, []);
  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth <= 768);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  const goTo = useCallback(
    (idx: number, dir?: "left" | "right") => {
      if (animating || idx === current) return;
      setDirection(dir ?? (idx > current ? "right" : "left"));
      setAnimating(true);
      setTimeout(() => {
        setCurrent(idx);
        setAnimating(false);
        setDirection(null);
      }, 350);
    },
    [animating, current]
  );

  const next = useCallback(() => goTo((current + 1) % total, "right"), [current, goTo, total]);
  const prev = useCallback(() => goTo((current - 1 + total) % total, "left"), [current, goTo, total]);

  useEffect(() => {
    autoRef.current = setInterval(next, 4000);
    return () => { if (autoRef.current) clearInterval(autoRef.current); };
  }, [next]);

  const pause = () => { if (autoRef.current) clearInterval(autoRef.current); };
  const resume = () => { autoRef.current = setInterval(next, 4000); };

  const prevIdx = (current - 1 + total) % total;
  const nextIdx = (current + 1) % total;

  if (isMobile) {
    return (
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", width: "100%", padding: "0 16px", boxSizing: "border-box" }}>
        <div style={{ position: "relative", width: "100%", borderRadius: 14, overflow: "hidden", background: "#c5b0a0" }}
          onTouchStart={pause}
          onTouchEnd={resume}
        >
          <div style={{
            width: "100%",
            height: isTablet ? 320 : 220,
            opacity: animating ? 0.75 : 1,
            transition: "opacity 0.35s ease, transform 0.35s ease",
            transform: animating
              ? `translateX(${direction === "right" ? "-12px" : "12px"})`
              : "translateX(0)",
          }}>
            <SlideImage slide={spaceSlides[current]} fill />
          </div>
          <button onClick={prev} style={{
            position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)",
            background: "rgba(255,255,255,0.7)", border: "none", borderRadius: "50%",
            width: 34, height: 34, display: "flex", alignItems: "center", justifyContent: "center",
            cursor: "pointer", fontSize: 16, color: "#711C31",
          }}>‹</button>
          <button onClick={next} style={{
            position: "absolute", right: 10, top: "50%", transform: "translateY(-50%)",
            background: "rgba(255,255,255,0.7)", border: "none", borderRadius: "50%",
            width: 34, height: 34, display: "flex", alignItems: "center", justifyContent: "center",
            cursor: "pointer", fontSize: 16, color: "#711C31",
          }}>›</button>
        </div>
        <div style={{ display: "flex", gap: 8, marginTop: 18 }}>
          {spaceSlides.map((_, i) => (
            <button key={i} onClick={() => goTo(i)} style={{
              width: i === current ? 32 : 10, height: 6, borderRadius: 3,
              border: "none", outline: "none", cursor: "pointer",
              background: i === current ? "#7B2D3E" : "#cfc4b9",
              transition: "all 0.3s ease", padding: 0,
            }} aria-label={`Slide ${i + 1}`} />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="explore-carousel" style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
      <div className="explore-carousel-track"
        onMouseEnter={pause}
        onMouseLeave={resume}
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          width: "100%",
          overflow: "hidden",
          position: "relative",
          userSelect: "none",
        }}
      >
        <div className="explore-slide left" onClick={prev}
          style={{
            width: 310, height: 260, flexShrink: 0, borderRadius: 14, overflow: "hidden",
            cursor: "pointer",
            opacity: animating ? 0.5 : 0.7,
            transition: "opacity 0.45s ease, transform 0.45s ease",
            transform: animating && direction === "left" ? "translateX(20px) scale(1.02)" : "translateX(0) scale(1)",
            zIndex: 1, marginRight: 2,
          }}
        >
          <SlideImage slide={spaceSlides[prevIdx]} fill />
        </div>
        <div className="explore-slide center"
          style={{
            width: 820, height: 399, flexShrink: 0, borderRadius: 14, overflow: "hidden",
            zIndex: 2, margin: "0 18px",
            opacity: animating ? 0.85 : 1,
            transition: "opacity 0.45s ease, transform 0.45s ease",
            transform: animating
              ? `scale(0.97) translateX(${direction === "right" ? "-12px" : direction === "left" ? "12px" : "0"})`
              : "scale(1) translateX(0)",
            boxShadow: "0 16px 48px rgba(0,0,0,0.18)",
          }}
        >
          <SlideImage slide={spaceSlides[current]} fill />
        </div>
        <div className="explore-slide right" onClick={next}
          style={{
            width: 310, height: 260, flexShrink: 0, borderRadius: 14, overflow: "hidden",
            cursor: "pointer",
            opacity: animating ? 0.5 : 0.7,
            transition: "opacity 0.45s ease, transform 0.45s ease",
            transform: animating && direction === "right" ? "translateX(-20px) scale(1.02)" : "translateX(0) scale(1)",
            zIndex: 1, marginLeft: -1,
          }}
        >
          <SlideImage slide={spaceSlides[nextIdx]} fill />
        </div>
      </div>
      <div className="explore-dots" style={{ display: "flex", gap: 8, marginTop: 28 }}>
        {spaceSlides.map((_, i) => (
          <button key={i} onClick={() => goTo(i)} style={{
            width: i === current ? 32 : 10, height: 6, borderRadius: 3,
            border: "none", outline: "none", cursor: "pointer",
            background: i === current ? "#7B2D3E" : "#cfc4b9",
            transition: "all 0.3s ease", padding: 0,
          }} aria-label={`Slide ${i + 1}`} />
        ))}
      </div>
    </div>
  );
}

// ─── SLIDE IMAGE ─────────────────────────────────────────────────────────────
function SlideImage({ slide }: { slide: { src: string; alt: string }; fill?: boolean }) {
  return (
    <MediaImage
      path={slide.src}
      alt={slide.alt}
      optimize={{ width: 1200 }}
      style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
    />
  );
}

// ─── STEP CARD ───────────────────────────────────────────────────────────────
interface StepCardProps {
  num: number;
  title: string;
  body: string;
  imgSrc?: string;
  imgAlt?: string;
}

function StepCard({ num, title, body, imgSrc, imgAlt }: StepCardProps) {
  return (
    <div
      className="step-card"
      style={{
        background: "#6B1E30",
        borderRadius: 16,
        overflow: "hidden",
        color: "#fff",
        paddingBottom: 16,
        display: "flex",
        flexDirection: "column",
        border: "1px solid #753141",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "16px 20px 14px" }}>
        <div style={{
          width: 26, height: 26, border: "1px solid #FFFFFF", borderRadius: "50%",
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: 13, fontWeight: 600, flexShrink: 0,
        }}>
          {num}
        </div>
        <span style={{ fontSize: 14, fontWeight: 500, letterSpacing: "0.3px" }}>{title}</span>
      </div>
      <div
        className="step-card-image"
        style={{
          width: "calc(100% - 32px)",
          height: 180,
          border: "1px solid #FFFFFF",
          overflow: "hidden",
          background: "linear-gradient(135deg,#8a3a50 0%,#5a1e2c 100%)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "rgba(255,255,255,0.4)",
          fontSize: 12,
          borderRadius: "14px",
          margin: "0 auto",
        }}
      >
        {imgSrc ? (
          <MediaImage path={imgSrc} alt={imgAlt ?? title} optimize={{ width: 600 }} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
        ) : (
          <span>Place image URL</span>
        )}
      </div>
      <p style={{
        padding: "12px 20px 0",
        fontSize: 14,
        lineHeight: 1.45,
        color: "rgba(255,255,255,0.88)",
        fontWeight: 400,
        margin: 0,
      }}>
        {body}
      </p>
    </div>
  );
}

// ─── MAIN PAGE ───────────────────────────────────────────────────────────────
export default function NotreCentrePage() {
  const [content, setContent] = useState<NotreCentrePageContent>(DEFAULT_NOTRE_CENTRE_CONTENT);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      const data = await fetchPublicNotreCentreContent();
      if (!cancelled) setContent(data);
    };
    const stopPolling = setupVisiblePolling(load, PUBLIC_CMS_POLL_MS);
    return () => {
      cancelled = true;
      stopPolling();
    };
  }, []);

  return (
    <main className="notre-centre-main" style={{ background: "#f4eee1", color: "#2c1a1a" }}>

      <style>{`

        /* ══════════════════════════════════════════════
           LARGE DESKTOPS  1441px+
        ══════════════════════════════════════════════ */

        .cta-wrapper {
  margin: 0 auto 80px auto !important; 
  max-width: 1200px;   /* key fix */
  width: 100% !important;
  box-sizing: border-box;
}
        @media (min-width: 1441px) {
          .notre-centre-hero {
            padding: 200px 120px 70px !important;
            gap: 120px !important;
          }
          .notre-centre-image {
            width: 600px !important;
            height: 430px !important;
          }
          .notre-centre-whattoexpect {
            padding: 60px 160px 90px !important;
          }
          .notre-centre-explore {
            padding: 70px 0 80px !important;
          }
          .cta-wrapper {

               @media (max-width: 1280px) and (min-width: 1025px) {
          .notre-centre-hero {
            gap: 60px !important;
            padding: 160px 40px 50px !important;
          }
          .notre-centre-image {
            width: 400px !important;
            height: 320px !important;
          }
          .notre-centre-whattoexpect {
            padding: 50px 50px 60px !important;
          }
          .howto-grid {
            gap: 18px !important;
          }
          .cta-wrapper {
            padding: 70px 60px !important;
          }
        }
          }
        }

        /* ══════════════════════════════════════════════
           SMALL LAPTOPS  1025px – 1280px
        ══════════════════════════════════════════════ */
        @media (max-width: 1280px) and (min-width: 1025px) {
          .notre-centre-hero {
            gap: 60px !important;
            padding: 160px 40px 50px !important;
          }
          .notre-centre-image {
            width: 400px !important;
            height: 320px !important;
          }
          .notre-centre-whattoexpect {
            padding: 50px 50px 60px !important;
          }
          .howto-grid {
            gap: 18px !important;
          }
          .cta-wrapper {
             padding: 70px 40px !important;
  margin: 0 auto !important;
  width: calc(100% - 80px) !important; /* creates left + right gap */
  box-sizing: border-box;
          }
        }

        /* ══════════════════════════════════════════════
           TABLETS  769px – 1024px
        ══════════════════════════════════════════════ */
        @media (max-width: 1024px) and (min-width: 769px) {
          /* Hero: stack to column, center-aligned */
          .notre-centre-hero {
            flex-direction: row !important;
            gap: 36px !important;
            padding: 170px 40px 50px !important;
            align-items: center !important;
          }
          .notre-centre-text {
            flex: unset !important;
            width: 100% !important;
          }
          .notre-centre-text h2 {
            font-size: 20px !important;
            margin-left: 0 !important;
            text-align: center !important;
          }
          .notre-centre-text p {
            margin-left: 0 !important;
            text-align: center !important;
          }
          .notre-centre-image {
            width: 100% !important;
            height: 300px !important;
            flex-shrink: unset !important;
            margin-right: 0 !important;
          }

          /* Step cards: 2-column grid */
          .notre-centre-whattoexpect {
            padding: 40px 40px 60px !important;
          }
          .notre-centre-whattoexpect h2 {
            margin-bottom: 28px !important;
          }
          .howto-grid {
  display: grid !important;
  grid-template-columns: repeat(3, 1fr) !important;
  gap: 14px !important;
  width: 100% !important;
  max-width: 100% !important;
  margin: 0 auto;
  padding: 0 !important;
}

/* slightly increase card width feel */
.step-card {
  padding-bottom: 10px !important;
  overflow: hidden !important;
  min-height: auto !important;
}

/* keep image same */
.step-card-image {
  margin-top: -170px !important;
  height: 70px !important;
  margin-bottom: -8px !important;
}

/* keep header same */
.step-card > div:first-child {
  padding: 6px 10px !important;
  transform: translateY(-80px) !important;
}

/* text alignment fix */
.step-card h3 {
  font-size: 14px !important;
  line-height: 1.3 !important;
  margin-bottom: 4px !important;

  /* helps equal alignment across cards */
  min-height: 36px !important;
}

/* IMPORTANT: equal paragraph alignment */
.step-card p {
  margin-top: 2px !important;
  margin-bottom: 0 !important;
  font-size: 12px !important;
  line-height: 1.4 !important;

  /* key fix for equal ending line */
  min-height: 60px !important;

  display: flex !important;
  align-items: flex-start !important;
}

          /* Explore carousel: already handles tablet via desktop branch */
          .notre-centre-explore {
            padding: 50px 0 60px !important;
          }
          .notre-centre-explore h2 {
            padding: 0 40px !important;
          }

          /* CTA */
          .cta-wrapper {
            width: calc(100% - 80px) !important;
            margin-left: 40px !important;
            margin-top: 50px !important;
            margin-bottom: 50px !important;
            padding: 70px 40px !important;
            border-radius: 18px !important;
          }
          .cta-title {
            font-size: 22px !important;
          }
          .cta-body {
            font-size: 17px !important;
          }
        }

        /* ══════════════════════════════════════════════
           LARGE MOBILE  481px – 768px
           (exact original rules — untouched)
        ══════════════════════════════════════════════ */
       @media (min-width: 426px) and (max-width: 768px) {

          /* ── Section 1: Hero ── */
          .notre-centre-hero {
            flex-direction: column !important;
            gap: 28px !important;
            padding: 150px 20px 40px !important;
            align-items: flex-start !important;
          }
          .notre-centre-text {
            flex: unset !important;
            width: 100% !important;
          }
          .notre-centre-text h2 {
            font-size: 18px !important;
            margin-left: 0 !important;
            text-align: left !important;
          }
          .notre-centre-text p {
            font-size: 15px !important;
            line-height: 1.55 !important;
            margin-left: 0 !important;
            text-align: left !important;
          }
          .notre-centre-text-desc {
            margin-left: 0 !important;
            text-align: left !important;
          }
          .notre-centre-image {
            width: 100% !important;
            height: 330px !important;
            flex-shrink: unset !important;
            margin-right: 0 !important;
          }

          /* ── Section 2: What to expect ── */
          .notre-centre-whattoexpect {
            padding: 30px 16px 48px !important;
          }
          .notre-centre-whattoexpect h2 {
            font-size: 22px !important;
            margin-bottom:24px !important;
          }
      .howto-grid {
  display: grid !important;
  grid-template-columns: repeat(3, 1fr) !important;
  gap: 14px !important;
  width: 100% !important;
  max-width: 100% !important;
  margin: 0 auto;
  padding: 0 !important;
}

/* slightly increase card width feel */
.step-card {
  padding-bottom: 10px !important;
  overflow: hidden !important;
  min-height: auto !important;
}

/* keep image same */
.step-card-image {
  margin-top: -170px !important;
  height: 70px !important;
  margin-bottom: -8px !important;
}

/* keep header same */
.step-card > div:first-child {
  padding: 6px 10px !important;
  transform: translateY(-80px) !important;
}

/* text alignment fix */
.step-card h3 {
  font-size: 14px !important;
  line-height: 1.3 !important;
  margin-bottom: 4px !important;

  /* helps equal alignment across cards */
  min-height: 36px !important;
}

/* IMPORTANT: equal paragraph alignment */
.step-card p {
  margin-top: 2px !important;
  margin-bottom: 0 !important;
  font-size: 12px !important;
  line-height: 1.4 !important;

  /* key fix for equal ending line */
  min-height: 60px !important;

  display: flex !important;
  align-items: flex-start !important;
}
          /* ── Section 3: Explore carousel ── */
          .notre-centre-explore {
            padding: 40px 0 50px !important;
          }
          .notre-centre-explore h2 {
            font-size: 22px !important;
            margin-bottom: 24px !important;
            padding: 0 16px !important;
          }

          /* ── Section 4: CTA ── */
          .cta-wrapper {
            width: calc(100% - 32px) !important;
            margin-left: 16px !important;
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
            font-size: 15px !important;
            max-width: 100% !important;
          }
          .cta-body br {
            display: none !important;
          }
          .cta-hand-img {
            display: none !important;
            
          }
        }

        /* ══════════════════════════════════════════════
           SMALL MOBILE  320px – 480px
           Inherits the 768px block above; only patch
           what overflows at narrower widths.
        ══════════════════════════════════════════════ */
        @media (max-width: 480px) {
          .notre-centre-hero {
            padding: 120px 16px 32px !important;
            gap: 20px !important;
          }
          .notre-centre-text h2 {
            font-size: 17px !important;
          }
          .notre-centre-text p {
            font-size: 14px !important;
            line-height: 1.55 !important;
          }
          .notre-centre-image {
            height: 200px !important;
          }

          .notre-centre-whattoexpect {
            padding: 24px 12px 36px !important;
          }
          .notre-centre-whattoexpect h2 {
            font-size: 20px !important;
          }
           .howto-grid {
    grid-template-columns: 1fr !important;
    gap: 14px !important;
    max-width: 390px !important;
    margin: 0 auto;
  }

  .step-card {
    padding-bottom: 10 !important;
    min-height: auto !important;
    overflow: hidden !important;
  }

  .step-card-image {
    height: 70px !important;
    margin-top: -150px !important;
    margin-bottom: 2px !important;
   
  }

  .step-card > div:first-child {
    padding: 6px 10px !important;
    transform: translateY(-67px) !important;
  }

  .step-card h3 {
    font-size: 14px !important;
    margin-bottom: 4px !important;
    line-height: 1.2 !important;
  }

  .step-card p {
    font-size: 12px !important;
    line-height: 1.4 !important;
    margin-top: 2px !important;
    margin-bottom: 0 !important;
  }


          .notre-centre-explore {
            padding: 30px 0 40px !important;
          }
          .notre-centre-explore h2 {
            font-size: 20px !important;
            padding: 0 12px !important;
          }

          .cta-wrapper {
            width: calc(100% - 24px) !important;
            margin-left: 12px !important;
            margin-top: 28px !important;
            margin-bottom: 28px !important;
            padding: 48px 16px !important;
            border-radius: 14px !important;
          }
          
          .cta-title {
            font-size: 16px !important;
          }
          .cta-body {
            font-size: 12px !important;
          }
            .cta-hand-img {
            display: none !important;
            
          }
        }

        /* Extra small phones — original rule kept intact */
        @media (max-width: 400px) {
          .hero-image {
            height: 210px !important;
          }
          .cta-title {
            font-size: 15px !important;
          }
        }

        /* ══════════════════════════════════════════════
           SAFETY NET  < 320px
        ══════════════════════════════════════════════ */
        @media (max-width: 319px) {
          .notre-centre-hero {
            padding: 100px 12px 24px !important;
          }
          .notre-centre-text h2 {
            font-size: 16px !important;
          }
          .notre-centre-text p {
            font-size: 13px !important;
            line-height: 1.55 !important;
          }
          .notre-centre-image {
            height: 170px !important;
          }
          .cta-wrapper {
            width: calc(100% - 16px) !important;
            margin-left: 8px !important;
            padding: 36px 12px !important;
          }
          .cta-title {
            font-size: 14px !important;
          }
          .cta-body {
            font-size: 13px !important;
          }
        }

        /* Mobile hero text: title + description share the same left edge */
        @media (max-width: 768px) {
          .notre-centre-hero {
            align-items: flex-start !important;
          }
          .notre-centre-text h2 {
            font-size: 18px !important;
            text-align: left !important;
            margin-left: 0 !important;
          }
          .notre-centre-text p {
            text-align: left !important;
            margin-left: 0 !important;
            line-height: 1.55 !important;
          }
          .notre-centre-text-desc {
            margin-left: 0 !important;
            text-align: left !important;
          }
        }
      `}</style>

      {/* ── 1. NOTRE CENTRE ── */}
      <section className="notre-centre-hero"
        style={{
          display: "flex",
          gap: 100,
          alignItems: "flex-start",
          padding: "180px 50px 50px",
          background: "#FFFFFF",
        }}
      >
        <div className="notre-centre-text" style={{ flex: 1 }}>
          <h2
            style={{
              fontSize: 25,
              fontWeight: 600,
              marginBottom: 22,
              letterSpacing: "0.5px",
              color: "#711C31",
              marginLeft: "26px",
            }}
          >
            {content.hero.title}
          </h2>
          <div
            className="notre-centre-text-desc"
            style={{
              marginLeft: "26px",
              display: "flex",
              flexDirection: "column",
              gap: "8px",
            }}
          >
            {content.introParagraphs.map((para, idx) => (
              <p key={idx} style={{ margin: 0, fontSize: 18, lineHeight: 1.2, color: "#5D5153" }}>
                {idx === 0 && content.introBoldLead ? (
                  <span className="font-bold">{content.introBoldLead}</span>
                ) : null}
                {para}
              </p>
            ))}
          </div>
        </div>

        <div className="notre-centre-image"
          style={{
            width: 500,
            height: 370,
            flexShrink: 0,
            borderRadius: 12,
            overflow: "hidden",
            background: "linear-gradient(135deg,#e8ddd0,#d4c5b5)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "#999",
            fontSize: 13,
            marginRight: "30px",
            border: "1px solid #753141",
          }}
        >
          <MediaImage
            path={content.hero.imageUrl}
            alt={content.hero.title}
            optimize={{ width: 1000 }}
            style={{ width: "100%", height: "100%", objectFit: "cover" }}
          />
        </div>
      </section>

      {/* ── 2. À QUOI S'ATTENDRE ── */}
      <section className="notre-centre-whattoexpect" style={{ background: "#FFFFFF", padding: "50px 80px 70px" }}>
        <h2
          style={{
            fontSize: 30,
            fontWeight: 500,
            textAlign: "center",
            marginBottom: 40,
            letterSpacing: "1px",
            color: "#711C31",
          }}
        >
          {content.expectTitle}
        </h2>

        <div className="howto-grid" style={{ display: "grid", gridTemplateColumns: "repeat(3,2fr)", gap: 24 }}>
          {content.steps.map((step) => (
            <StepCard
              key={step.num}
              num={step.num}
              title={step.title}
              imgSrc={step.imgSrc}
              body={step.body}
            />
          ))}
        </div>
      </section>

      {/* ── 3. EXPLORE OUR SPACE ── */}
      <section className="notre-centre-explore" style={{ background: "#F0F0F0", padding: "60px 0 70px", overflow: "hidden" }}>
        <h2
          style={{
            fontSize: 30,
            fontWeight: 500,
            textAlign: "center",
            marginBottom: 40,
            letterSpacing: "1px",
            color: "#711C31",
          }}
        >
          {content.exploreTitle}
        </h2>
        <ExploreCarousel slides={content.slides} />
      </section>

      {/* ── 4. CTA (shared) ── */}
      <VisitCtaSection />
    </main>
  );
}
