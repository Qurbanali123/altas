"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import DoctorTeamSections from "@/components/team/DoctorTeamSections";
import MediaImage from "@/components/MediaImage";
import {
  DEFAULT_TEAM_PAGE_CONTENT,
  type TeamPageContent,
  fetchPublicTeamPageContent,
} from "@/utils/teamPageApi";
import {
  PUBLIC_CMS_POLL_MS,
  setupVisiblePolling,
} from "@/utils/visiblePolling";

// ─── Icons ───────────────────────────────────────────────────────────────────
function CalendarIcon() {
  return (
    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
      <line x1="16" y1="2" x2="16" y2="6" />
      <line x1="8" y1="2" x2="8" y2="6" />
      <line x1="3" y1="10" x2="21" y2="10" />
    </svg>
  );
}

// ─── Speciality Item ──────────────────────────────────────────────────────────
function SpecialityItem({
  iconSrc,
  title,
  desc,
}: {
  iconSrc: string;
  title: string;
  desc: string;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <div className="specialities-item-icon text-[#7B2D3E] mb-0.5">
        <MediaImage
          path={iconSrc}
          optimize={{ width: 64 }}
          alt=""
          className="w-5 brightness-0 invert"
        />
      </div>
      <p className="specialities-item-title font-semibold text-[15.5px] text-[#F2E5C5] leading-snug">{title}</p>
      <p className="specialities-item-desc text-[13px] text-[#ffffff] leading-relaxed font-light">{desc}</p>
    </div>
  );
}

// ─── Main Page ───────────────────────────────────────────────────────────────
export default function AProposPage() {
  const [teamPage, setTeamPage] = useState<TeamPageContent>(DEFAULT_TEAM_PAGE_CONTENT);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      const data = await fetchPublicTeamPageContent();
      if (!cancelled) setTeamPage(data);
    };
    const stopPolling = setupVisiblePolling(load, PUBLIC_CMS_POLL_MS);
    return () => {
      cancelled = true;
      stopPolling();
    };
  }, []);

  const philosophy = teamPage.philosophy;
  const clinical = teamPage.clinicalSpecialities;
  const journey = teamPage.journey;

  return (
    <>
      <style>{`

        .hero-about-flex {
          align-items: flex-start !important;
        }

        .hero-about-section-first {
          padding-bottom: 14px !important;
        }

        .doctor-second-block {
          margin-top: 18px;
        }

        .doctor-sections-divider {
          border-top: 1px solid rgba(255, 255, 255, 0.12);
          margin: 18px 56px 18px;
        }

        .hero-about-section-alt {
          margin-top: 0 !important;
          padding-top: 14px !important;
          padding-bottom: 16px !important;
          border-top: none !important;
          min-height: 0 !important;
        }

        /* ──────────────────────────────────────── MOBILE (≤ 768px) ──────────────────────────────────────── */
      @media (min-width: 426px) and (max-width: 768px) {

  .hero-about-flex {
    flex-direction: row !important;
    align-items: center !important;
    justify-content: space-between !important;
  }

  .hero-about-text {
    text-align: left !important;
    max-width: 62% !important;
    margin-bottom: 0 !important;
  }

  .doctor-card-wrapper {
    max-width: 45% !important;
    margin: 0 !important;
    display: flex !important;
    justify-content: center !important;
  }

  .doctor-image-container {
    height: 360px !important;
    justify-content: center !important;
    align-items: flex-end !important;
  }
}
      
        @media (max-width: 360px) {



  .doctor-image-container {
    width: 100% !important;
  }

  .doctor-bg-card {
    width: 100% !important;
    max-width: 290px !important;
  }

    .doctor-card-wrapper {
  width: 100% !important;
  margin: 0 auto !important;
  padding: 0 !important;
  display: flex !important;
  justify-content: center !important;
  align-items: center !important;
}

}
        
        @media (max-width: 768px) {
          /* Hero Section */
          .hero-about-section {
            height: auto !important;
            padding: 24px 16px !important;
          }

          .hero-about-section-first {
            margin-top: 130px !important;
            padding-bottom: 14px !important;
          }

          .hero-about-section-alt {
            margin-top: 0 !important;
            padding-top: 14px !important;
            padding-bottom: 12px !important;
            min-height: 0 !important;
          }

          .doctor-second-block {
            margin-top: 12px !important;
          }

          .doctor-sections-divider {
            margin: 14px 16px !important;
          }

          .hero-about-flex {
            flex-direction: column !important;
            align-items: center !important;
          }

          .hero-about-text {
            max-width: 100% !important;
            padding: 0 !important;
            margin-bottom: 30px !important;
            text-align: center !important;
          }

          .hero-about-text h1 {
            font-size: 24px !important;
            line-height: 1.3 !important;
            margin-bottom: 16px !important;
          }

          .hero-about-desc {
            font-size: 15.5px !important;
            line-height: 1.45 !important;
            margin-bottom: 10px !important;
            max-width: 100% !important;
          }

          .hero-about-desc:last-of-type {
            margin-bottom: 0 !important;
          }

          .hero-about-text-label {
            font-size: 12px !important;
          }

          /* Doctor Image Card */
          .doctor-card-wrapper {
            width: 100% !important;
            padding: 0 !important;
            margin-right: 0 !important;
            margin-bottom: 0 !important;
          }

          .doctor-image-container {
            width: 100% !important;
            height: 370px !important;
            display: flex !important;
            align-items: flex-end !important;
            justify-content: center !important;
           
          }

          .doctor-bg-card {
            top: 20px !important;
            width: 280px !important;
            height: 300px !important;
            margin-top: 40px !important;
          }

          .doctor-fade-overlay {
            width: 100% !important;
  max-width: 100% !important;
            height: 160px !important;
            bottom: -15px !important;
          }

          /* Philosophy Section */
          .philosophy-section {
            border-radius: 16px !important;
            margin: 20px 16px !important;
            margin-bottom: 20px !important;
          }

          .philosophy-container {
            padding: 20px !important;
          }

          .philosophy-flex {
            flex-direction: column !important;
            gap: 16px !important;
          }

          .philosophy-card {
            padding: 16px !important;
            min-height: auto !important;
          }

          .philosophy-card h3 {
            font-size: 18px !important;
            margin-bottom: 12px !important;
          }

          .philosophy-card p {
            font-size: 14px !important;
            line-height: 1.6 !important;
          }

          .philosophy-badges {
            gap: 8px !important;
            margin-top: 12px !important;
            flex-wrap: wrap !important;
          }

          .philosophy-badge {
            font-size: 9px !important;
            gap: 4px !important;
          }

          .journey-card {
            width: 100% !important;
            padding: 20px !important;
            flex-shrink: unset !important;
          }

          .journey-card h3 {
            font-size: 16px !important;
            margin-bottom: 8px !important;
          }

          .journey-card p {
            font-size: 12px !important;
            margin-bottom: 12px !important;
          }

          .journey-btn {
            padding: 8px 16px !important;
            font-size: 12px !important;
          }

          /* Specialities Section */
          .specialities-section {
            padding: 10px 16px !important;
          }

          .specialities-container {
            min-height: auto !important;
            flex-direction: column !important;
            padding: 1px !important;
            
          }

          .specialities-content {
            flex: 1 !important;
            z-index: 10 !important;
            margin-bottom: 80px !important;
          }

          .specialities-title {
            font-size: 18px !important;
            margin-bottom: 16px !important;
          }

         .specialities-grid {
            grid-template-columns: 1fr 1fr !important;
            gap: 20px !important;
            max-width: 100% !important;
          }

          .specialities-item-icon {
            width: 20px !important;
            height: 20px !important;
          }

          .specialities-item-title {
            font-size: 14px !important;
          }

          .specialities-item-desc {
            font-size: 12px !important;
          }

        

          .specialities-image {
           display:none;
          }
        }

        @media (min-width: 769px) and (max-width: 1024px) {

          html,
  body {
    overflow-x: hidden !important;
    width: 100%;
  }

  * {
    box-sizing: border-box;
  }
        
        
        /* Hero Section */
          .hero-about-section {
            height: auto !important;
            padding: 40px 10px !important;
            margin-left:50px;
          }

          .hero-about-section-first {
            margin-top: 130px !important;
            padding-bottom: 14px !important;
          }

          .hero-about-section-alt {
            margin-top: 0 !important;
            padding-top: 14px !important;
            padding-bottom: 16px !important;
            min-height: 0 !important;
          }

          .doctor-second-block {
            margin-top: 14px !important;
          }

          .doctor-sections-divider {
            margin: 16px 16px !important;
          }

          .hero-about-flex {
            flex-direction: row !important;
            align-items: flex-start !important;
          }

          .hero-about-text {
            max-width: 100% !important;
            padding: 0 !important;
            margin-bottom: 10px !important;
          }

          .hero-about-text h1 {
            font-size: 28px !important;
            line-height: 1.4 !important;
            margin-bottom: 16px !important;
          }

          .hero-about-desc {
            font-size: 16px !important;
            line-height: 1.45 !important;
            margin-bottom: 10px !important;
            max-width: 100% !important;
          }

          /* Doctor Image Card */
          .doctor-card-wrapper {
            width: 100% !important;
            padding: 0 !important;
            
            margin-right: 120px !important;
            margin-bottom: 20px !important;
          }

          .doctor-image-container {
            width: 100% !important;
            height: 340px !important;
            display: flex !important;
            align-items: flex-end !important;
            justify-content: center !important;
          }

          .doctor-bg-card {
            top: 10px !important;
            width: 370px !important;
            height: 360px !important;
            margin-top: 10px !important;
          }

          .doctor-fade-overlay {
            width: 460px !important;
            height: 210px !important;
            bottom: -60px !important;
          }
}

        /* ──────────────────────────────────────── TABLET (769px–1024px) ──────────────────────────────────────── */
        @media (min-width: 1025px) and (max-width: 1440px) {
           html,
  body {
    overflow-x: hidden !important;
    width: 100%;
  }

  * {
    box-sizing: border-box;
  }
        
        
        /* Hero Section */
          .hero-about-section {
            height: auto !important;
            padding: 0 60px !important;
          }

          .hero-about-section-first {
            margin-top: 130px !important;
            padding-top: 48px !important;
            padding-bottom: 14px !important;
          }

          .hero-about-section-alt {
            margin-top: 0 !important;
            padding-top: 14px !important;
            padding-bottom: 16px !important;
            min-height: 0 !important;
          }

          .doctor-second-block {
            margin-top: 14px !important;
          }

          .doctor-sections-divider {
            margin: 18px 56px !important;
          }

          .hero-about-flex {
            flex-direction: row !important;
            align-items: flex-start !important;
          }

          .hero-about-text {
            max-width: 100% !important;
            padding: 0 !important;
            margin-bottom: 0 !important;
          }

          .hero-about-text h1 {
            font-size: 35px !important;
            line-height: 1.4 !important;
            margin-bottom: 16px !important;
          }

          .hero-about-desc {
            font-size: 16px !important;
            line-height: 1.45 !important;
            margin-bottom: 10px !important;
            max-width: 100% !important;
          }

          /* Doctor Image Card */
          .doctor-card-wrapper {
            width: 100% !important;
            padding: 0 !important;
            margin-right: 120px !important;
            margin-bottom: 0 !important;
          }

          .doctor-image-container {
            width: 100% !important;
            height: 340px !important;
            display: flex !important;
            align-items: flex-end !important;
            justify-content: center !important;
          }

          .doctor-bg-card {
            top: 10px !important;
            width: 370px !important;
            height: 360px !important;
            margin-top: 10px !important;
          }

          .doctor-fade-overlay {
            width: 460px !important;
            height: 180px !important;
            bottom: -43px !important;
          }

          /* Philosophy Section */
          .philosophy-section {
            border-radius: 18px !important;
            margin: 20px 30px !important;
            margin-bottom: 20px !important;
          }

          .philosophy-container {
            padding: 24px !important;
          }

          .philosophy-flex {
            flex-direction: row !important;
            gap: 16px !important;
          }

          .philosophy-card {
            padding: 20px !important;
            min-height: 20px !important;
          }

          .philosophy-card h3 {
            font-size: 20px !important;
            margin-bottom: 14px !important;
          }

          .philosophy-card p {
            font-size: 15px !important;
            line-height: 1.6 !important;
          }

          .journey-card {
            width: 240px !important;
            flex-shrink: 0 !important;
            padding: 24px !important;
          }

          .journey-card h3 {
            font-size: 17px !important;
            margin-bottom: 10px !important;
          }

          .journey-card p {
            font-size: 13px !important;
          }

          /* Specialities Section */
          .specialities-section {
            padding: 24px 30px !important;
          }

          .specialities-container {
            min-height: 300px !important;
            padding: 24px !important;
          }

          .specialities-content {
            flex: 1 !important;
            max-width: 60% !important;
          }

          .specialities-title {
            font-size: 20px !important;
            margin-bottom: 18px !important;
          }

          .specialities-grid {
            grid-template-columns: 1fr 1fr !important;
            gap: 20px !important;
            max-width: 100% !important;
          }

          .specialities-image {
            width: 320px !important;
            height: 280px !important;
            scale: 1 !important;
            opacity: 0.4 !important;
          }
        }
      `}</style>

      <main
        className="w-full"
        
      >
        {/* ══════════════════════════════════════════════════════════
            SECTION 1 — NOTRE ÉQUIPE (burgundy background)
        ══════════════════════════════════════════════════════════ */}
        <div className="bg-[#711C31]">
          <DoctorTeamSections />

        {/* ══════════════════════════════════════════════════════════
            SECTION 2 — PHILOSOPHY + START YOUR JOURNEY
        ══════════════════════════════════════════════════════════ */}
       <div className="philosophy-section relative z-10 bg-[#FFFFFF] rounded-2xl mx-8 mb-10  mt-10 "> 
        <section
          className="philosophy-container w-full px-10 py-12 "
          style={{  }}
        >
          <div
            className="philosophy-flex rounded-2xl overflow-hidden flex"
            style={{ background: "transparent", gap: 16, }}
          >
            {/* Left card — Philosophy of Care */}
            <div
              className="philosophy-card flex-1 rounded-2xl p-8 flex flex-col justify-between"
              style={{ background: "#D3D3D3", minHeight: 280,border:'1px solid #753141' }}
            >
              <div>
                <p
                  className="mb-5 philosophy-card"
                  style={{
                   
                    fontSize: 24,
                    fontWeight: 600,
                    color: "#711C31",
                  }}
                >
                  {philosophy.title}
                </p>
                <p
                  className=" mb-6"
                  style={{
                    fontSize: 17.5,
                    color: "#5D5153",
                  
                    fontWeight: 500,
                    lineHeight: 1.65,
                    borderLeft: "none",
                  }}
                >
                  {philosophy.body}
              </p>
              </div>

              {/* Badges */}
              <div className="philosophy-badges flex items-center gap-6 mt-2">
                <div className="philosophy-badge flex items-center gap-2">
                   <MediaImage path={philosophy.badge1Icon} optimize={{ width: 40 }} alt="" className="w-[14px]" />
                  <span
                    className="tracking-widest"
                    style={{ fontSize: 11, fontWeight: 600, color: "#5a4040", letterSpacing: "0.12em" }}
                  >
                    {philosophy.badge1Text}
                  </span>
                </div>
                <div className="philosophy-badge flex items-center gap-2">
                 <MediaImage path={philosophy.badge2Icon} optimize={{ width: 40 }} alt="" className="w-[14px]" />
                  <span
                    className="tracking-widest"
                    style={{ fontSize: 11, fontWeight: 600, color: "#5a4040", letterSpacing: "0.12em" }}
                  >
                    {philosophy.badge2Text}
                  </span>
                </div>
              </div>
            </div>

            {/* Right card — Start Your Journey */}
            <div
              className="journey-card rounded-2xl p-8 flex flex-col items-center justify-center text-center"
          style={{ background: "#711C31", width: 260, flexShrink: 0 }}
            >
              {/* Calendar icon (or uploaded icon) */}
              <div className="mb-4" style={{ color: "#FFFFFF" }}>
                {journey.icon ? (
                  <MediaImage
                    path={journey.icon}
                    optimize={{ width: 64 }}
                    alt=""
                    className="w-8 h-8 object-contain brightness-0 invert"
                  />
                ) : (
                  <CalendarIcon />
                )}
              </div>

              <p
                className="mb-3"
                style={{
                 
                  fontSize: 19,
                  fontWeight: 500,
                  color: "#ffffff",
                }}
              >
                {journey.title}
              </p>
              <p
                className="mb-6 leading-relaxed"
                style={{ fontSize: 12.5, color: "rgba(255,255,255,0.75)", fontWeight: 300 }}
              >
                {journey.subtitle}
              </p>

              <Link href={journey.buttonLink || "/pages/Appointment"}>
  <button
    className="journey-btn transition-colors"
    style={{
      background: "transparent",
      border: "1px solid #FFFFFF",
      color: "#fff",
      padding: "10px 22px",
      borderRadius: 50,
      fontSize: 13,
      cursor: "pointer",
      letterSpacing: "0.3px",
    }}
    onMouseEnter={(e) =>
      ((e.currentTarget as HTMLButtonElement).style.background =
        "rgba(255,255,255,0.12)")
    }
    onMouseLeave={(e) =>
      ((e.currentTarget as HTMLButtonElement).style.background =
        "transparent")
    }
  >
    {journey.buttonText}
  </button>
</Link>
            </div>
          </div>
        </section>

        {/* ══════════════════════════════════════════════════════════
            SECTION 3 — CLINICAL SPECIALITIES
        ══════════════════════════════════════════════════════════ */}
      <section className="specialities-section w-full px-10 pb-14">
  <div
    className="specialities-container rounded-2xl overflow-hidden relative flex"
    style={{
      minHeight: 320,
      background: "#711C31",
    }}
  >
    {/* Right Side Image */}
   <div className="specialities-image absolute bottom-10 right-10 h-full w-[380px] overflow-hidden scale-128">
  <MediaImage
    path={clinical.image}
    optimize={{ width: 800 }}
    alt="Clinic"
    className="w-full h-full object-cover scale-x-[-1]"
  />

    </div>

    {/* Maroon Gradient Overlay */}
    <div
      className="absolute inset-0"
      style={{
       
         background:
  "linear-gradient(to top, rgba(40,8,15,0.98) 0%, rgba(113,28,49,0.38) 100%, rgba(160,70,95,0.30) 100%)",
      }}
    />

    {/* Main Content */}
    <div className="specialities-content relative z-10 flex-1 p-8 md:p-10">
      <p
        className="specialities-title mb-7"
        style={{
          fontSize: 24,
          fontWeight: 500,
          color: "#FFFFFF",
          letterSpacing: "0.3px",
        }}
      >
        {clinical.title}
      </p>

      {/* Grid */}
      <div
        className="specialities-grid grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-8"
        style={{ maxWidth: 700 }}
      >
        {clinical.items.map((item, index) => (
          <SpecialityItem
            key={`${item.title}-${index}`}
            iconSrc={item.icon}
            title={item.title}
            desc={item.desc}
          />
        ))}
      </div>
    </div>
  </div>
</section>
        </div>
        <div className="h-10 bg-[#711C31]"></div>
        </div>
      </main>
    </>
  );
}
