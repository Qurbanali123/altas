"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  fetchPublicStaff,
  type PublicStaff,
} from "@/utils/staffsApi";
import { useOptimizedMediaSrc } from "@/components/MediaImage";

const CARD_FILL = 1.06;
const TEXT_SPACER_BELOW = 48;
const MIN_IMAGE_COLUMN_HEIGHT = 280;

const DESC_STYLE: React.CSSProperties = {
  fontSize: "16px",
  lineHeight: 1.45,
  color: "#F0F0F0",
  fontWeight: 300,
  maxWidth: 680,
};

const NAME_STYLE: React.CSSProperties = {
  fontSize: "28px",
  fontWeight: 600,
  color: "#ffffff",
  letterSpacing: "0.5px",
  textTransform: "uppercase",
  whiteSpace: "nowrap",
  overflow: "hidden",
  textOverflow: "ellipsis",
};

function computePhotoHeight(cardHeight: number): number {
  return Math.round(cardHeight * CARD_FILL);
}

function DoctorImageCard({
  doctor,
  contentHeight,
  topOffset,
}: {
  doctor: PublicStaff;
  contentHeight: number | null;
  topOffset: number;
}) {
  const hasPhoto = Boolean(doctor.profilePhotoUrl?.trim());
  const { src: photoSrc, onError: onPhotoError } = useOptimizedMediaSrc(
    hasPhoto ? doctor.profilePhotoUrl : null,
    { width: 800 }
  );
  const cardRef = useRef<HTMLDivElement>(null);
  const imgRef = useRef<HTMLImageElement>(null);
  const [photoHeight, setPhotoHeight] = useState(424);
  const [isDesktop, setIsDesktop] = useState(true);

  useEffect(() => {
    const mq = window.matchMedia("(min-width: 769px)");
    const update = () => setIsDesktop(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);

  const columnHeight = isDesktop
    ? Math.max(contentHeight ?? MIN_IMAGE_COLUMN_HEIGHT, MIN_IMAGE_COLUMN_HEIGHT)
    : 320;

  const fitPhoto = useCallback(() => {
    const card = cardRef.current;
    if (!card) return;
    setPhotoHeight(computePhotoHeight(card.clientHeight));
  }, []);

  useEffect(() => {
    const card = cardRef.current;
    if (!card) return;

    const handleResize = () => fitPhoto();

    const observer = new ResizeObserver(handleResize);
    observer.observe(card);
    window.addEventListener("resize", handleResize);
    fitPhoto();

    return () => {
      observer.disconnect();
      window.removeEventListener("resize", handleResize);
    };
  }, [fitPhoto, photoSrc, columnHeight]);

  return (
    <div
      className="doctor-card-wrapper team-doctor-card-wrapper relative flex w-full lg:justify-end"
      style={{
        maxWidth: 490,
        margin: "0 auto",
        paddingRight: "24px",
        boxSizing: "border-box",
        height: columnHeight,
        marginTop: isDesktop ? topOffset : 24,
      }}
    >
      <div
        className="team-doctor-image-container"
        style={{ height: columnHeight }}
      >
        <div ref={cardRef} className="team-doctor-bg-card">
          <div className="team-doctor-photo-stage">
            {hasPhoto && photoSrc ? (
              <img
                ref={imgRef}
                className="team-doctor-photo"
                src={photoSrc}
                alt={doctor.fullName}
                onLoad={fitPhoto}
                onError={onPhotoError}
                style={{ height: photoHeight, width: "auto" }}
              />
            ) : null}
          </div>
        </div>

        <div className="team-doctor-fade-overlay" />
      </div>
    </div>
  );
}

function DoctorSection({
  doctor,
  isFirst,
}: {
  doctor: PublicStaff;
  isFirst: boolean;
}) {
  const headerRef = useRef<HTMLDivElement>(null);
  const bodyRef = useRef<HTMLDivElement>(null);
  const [headerHeight, setHeaderHeight] = useState(0);
  const [bodyHeight, setBodyHeight] = useState<number | null>(null);
  const NameTag = isFirst ? "h1" : "h2";

  useEffect(() => {
    const measure = () => {
      if (headerRef.current) setHeaderHeight(headerRef.current.offsetHeight);
      if (bodyRef.current) setBodyHeight(bodyRef.current.offsetHeight);
    };
    measure();

    const observer = new ResizeObserver(measure);
    if (headerRef.current) observer.observe(headerRef.current);
    if (bodyRef.current) observer.observe(bodyRef.current);
    window.addEventListener("resize", measure);

    return () => {
      observer.disconnect();
      window.removeEventListener("resize", measure);
    };
  }, [doctor]);

  const textPaddingClass = isFirst ? "pt-16" : "pt-2";

  return (
    <section
      id={`doctor-${doctor.id}`}
      className={`hero-about-section team-doctor-section ${
        isFirst ? "hero-about-section-first" : "hero-about-section-alt"
      } relative w-full`}
      style={{
        scrollMarginTop: "140px",
        height: "auto",
        marginTop: isFirst ? "130px" : 0,
        paddingTop: isFirst ? 0 : 0,
        paddingBottom: 16,
      }}
    >
      <div className="hero-about-flex team-doctor-row flex w-full items-start">
        <div className="team-doctor-text-col flex-1 lg:max-w-[65%] w-full">
          <div className={`hero-about-text flex flex-col px-19 ${textPaddingClass} pr-8 w-full`}>
            <div ref={headerRef}>
              {isFirst && (
                <p
                  className="hero-about-text-label text-[14px] font-light mb-3"
                  style={{
                    color: "#FFFFFF",
                    fontStyle: "italic",
                    letterSpacing: "0.3px",
                  }}
                >
                  Notre équipe
                </p>
              )}

              <NameTag
                className={`team-doctor-name ${isFirst ? "mb-5" : "mb-4"} leading-[1.2]`}
                style={NAME_STYLE}
                title={doctor.fullName}
              >
                {doctor.fullName}
              </NameTag>
            </div>

            <div ref={bodyRef}>
              {doctor.roleTitle && (
                <p
                  className="mb-3"
                  style={{
                    fontSize: "15px",
                    lineHeight: 1.4,
                    color: "#F0F0F0",
                    fontWeight: 400,
                    fontStyle: "italic",
                    maxWidth: 680,
                  }}
                >
                  {doctor.roleTitle}
                </p>
              )}

              {doctor.bio?.trim() && (
                <p
                  className="hero-about-desc mb-3"
                  style={{ ...DESC_STYLE, whiteSpace: "pre-line" }}
                >
                  {doctor.bio.trim()}
                </p>
              )}

              {doctor.specialties.length > 0 && (
                <p className="hero-about-desc" style={DESC_STYLE}>
                  {doctor.specialties.join(" · ")}
                </p>
              )}
            </div>
          </div>

          <div
            className="team-doctor-text-spacer"
            style={{ height: TEXT_SPACER_BELOW }}
            aria-hidden
          />
        </div>

        <DoctorImageCard
          doctor={doctor}
          contentHeight={bodyHeight}
          topOffset={headerHeight}
        />
      </div>
    </section>
  );
}

export default function DoctorTeamSections() {
  const [doctors, setDoctors] = useState<PublicStaff[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    fetchPublicStaff()
      .then((staff) => {
        if (!cancelled) {
          setDoctors(staff);
          setError(null);
        }
      })
      .catch((err: Error) => {
        if (!cancelled) {
          setError(err.message || "Impossible de charger l'équipe.");
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (loading || doctors.length === 0) return;

    const hash = window.location.hash;
    if (!hash.startsWith("#doctor-")) return;

    const scrollToDoctor = () => {
      const el = document.querySelector(hash);
      if (el) {
        el.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    };

    const timer = window.setTimeout(scrollToDoctor, 150);
    return () => window.clearTimeout(timer);
  }, [loading, doctors]);

  if (loading) {
    return (
      <section
        className="hero-about-section hero-about-section-first relative w-full flex items-center justify-center"
        style={{ height: 320, marginTop: "130px", paddingBottom: 0 }}
      >
        <p
          style={{
            color: "#F0F0F0",
            fontSize: "16px",
            fontStyle: "italic",
          }}
        >
          Chargement de l&apos;équipe…
        </p>
      </section>
    );
  }

  if (error) {
    return (
      <section
        className="hero-about-section hero-about-section-first relative w-full flex items-center justify-center"
        style={{ height: 280, marginTop: "130px", paddingBottom: 0 }}
      >
        <p style={{ color: "#F0F0F0", fontSize: "16px" }}>{error}</p>
      </section>
    );
  }

  if (doctors.length === 0) {
    return (
      <section
        className="hero-about-section hero-about-section-first relative w-full flex items-center justify-center"
        style={{ height: 280, marginTop: "130px", paddingBottom: 0 }}
      >
        <p
          style={{
            color: "#F0F0F0",
            fontSize: "16px",
            fontStyle: "italic",
          }}
        >
          Notre équipe sera bientôt présentée ici.
        </p>
      </section>
    );
  }

  const [firstDoctor, ...restDoctors] = doctors;

  return (
    <>
      <style>{`
        .team-doctor-row {
          align-items: flex-start !important;
        }

        .team-doctor-image-container {
          position: relative;
          width: 100%;
          max-width: 300px;
          overflow: visible !important;
        }

        .team-doctor-bg-card {
          position: absolute;
          bottom: 0;
          left: 50%;
          transform: translateX(-50%);
          width: 400px;
          height: 100%;
          border-radius: 30px 30px 0 0;
          background: linear-gradient(180deg, #F4E7D3 0%, #EAD7C1 55%, #B56C7D 100%);
          z-index: 1;
          overflow: visible;
        }

        .team-doctor-photo-stage {
          position: absolute;
          left: 50%;
          bottom: 0;
          transform: translateX(-50%);
          width: 320px;
          height: 100%;
          display: flex;
          align-items: flex-end;
          justify-content: center;
          z-index: 2;
          overflow: visible;
          pointer-events: none;
        }

        .team-doctor-photo {
          display: block;
          width: auto;
          height: auto;
          max-width: none;
          object-fit: contain;
          object-position: center bottom;
          flex-shrink: 0;
        }

        .team-doctor-fade-overlay {
          position: absolute;
          bottom: -20px;
          left: 50%;
          transform: translateX(-50%);
          width: 420px;
          height: 220px;
          background: linear-gradient(
            to top,
            rgba(113, 28, 49, 1) 15%,
            rgba(113, 28, 49, 0.85) 35%,
            rgba(113, 28, 49, 0) 100%
          );
          z-index: 10;
          pointer-events: none;
          filter: blur(4px);
          opacity: 2.5;
        }

        .team-doctor-section.hero-about-section-first {
          height: auto !important;
        }

        @media (max-width: 768px) {
          .team-doctor-name {
            font-size: 22px !important;
            white-space: normal !important;
            overflow: visible !important;
            text-overflow: unset !important;
          }

          .team-doctor-row {
            flex-direction: column !important;
            align-items: center !important;
          }

          .team-doctor-card-wrapper {
            height: auto !important;
            min-height: 320px !important;
            margin-top: 24px !important;
            align-self: center !important;
            justify-content: center !important;
            margin-left: auto !important;
            margin-right: auto !important;
            padding-right: 0 !important;
            padding-left: 0 !important;
            max-width: 300px !important;
          }

          .team-doctor-image-container {
            min-height: 320px !important;
            margin-left: auto !important;
            margin-right: auto !important;
          }

          .team-doctor-bg-card {
            width: 280px !important;
          }

          .team-doctor-photo-stage {
            width: 240px !important;
          }

          .team-doctor-fade-overlay {
            width: 100% !important;
            max-width: 100% !important;
            height: 160px !important;
            bottom: -15px !important;
          }
        }

        @media (max-width: 360px) {
          .team-doctor-photo-stage {
            width: 200px !important;
          }
        }
      `}</style>

      <DoctorSection doctor={firstDoctor} isFirst />

      {restDoctors.length > 0 && (
        <div className="doctor-second-block">
          <div className="doctor-sections-divider" aria-hidden="true" />
          {restDoctors.map((doctor) => (
            <DoctorSection key={doctor.id} doctor={doctor} isFirst={false} />
          ))}
        </div>
      )}
    </>
  );
}
