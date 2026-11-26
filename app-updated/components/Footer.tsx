"use client";

import { useState, useEffect, useMemo } from "react";
import { FaInstagram, FaFacebook, FaLinkedin, FaMapMarkerAlt } from "react-icons/fa";
import { subscribeNewsletterApi } from "@/utils/subscribersApi";
import {
  DEFAULT_PUBLIC_CLINIC,
  fetchPublicClinicInfo,
  type PublicClinicInfo,
} from "@/utils/clinicPublicApi";
import {
  fetchPublicSpecialities,
  specialityPagePath,
} from "@/utils/specialitiesApi";
import { setupVisiblePolling, PUBLIC_CMS_POLL_MS } from "@/utils/visiblePolling";
import { resolveMediaSource } from "@/utils/mediaUrl";
import { staticWebpSibling } from "@/components/StaticPicture";
import {
  DEFAULT_HOME_FOOTER,
  FOOTER_SPECIALITIES_HREF,
  fetchPublicHomeFooter,
  type HomeFooterContent,
} from "@/utils/homeFooterApi";

const FRENCH_DAY_LABELS: Record<string, string> = {
  "Mon - Fri": "Lundi - Vendredi",
  "Mon-Fri": "Lundi - Vendredi",
  "Monday - Friday": "Lundi - Vendredi",
  Saturday: "Samedi",
  Sunday: "Dimanche",
};

function frenchDayLabel(label: string): string {
  return FRENCH_DAY_LABELS[label] ?? label;
}

const socialLinkStyle: React.CSSProperties = {
  width: "36px",
  height: "36px",
  borderRadius: "50%",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  textDecoration: "none",
  transition: "background 0.3s",
  background: "transparent",
  position: "relative",
  zIndex: 2,
  cursor: "pointer",
  flexShrink: 0,
};

function SocialLink({
  href,
  label,
  children,
}: {
  href: string;
  label: string;
  children: React.ReactNode;
}) {
  const [hovered, setHovered] = useState(false);

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={label}
      style={{
        ...socialLinkStyle,
        background: hovered ? "#c8960a22" : "transparent",
        color: "#FFFFFF",
      }}
      onClick={(e) => e.stopPropagation()}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {children}
    </a>
  );
}

function NavLink({
  href,
  children,
}: {
  href: string;
  children: React.ReactNode;
}) {
  const [hovered, setHovered] = useState(false);

  return (
    <a
      href={href}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        color: hovered ? "#D3D3D3" : "#f0e6d3",
        fontSize: "17px",
        textDecoration: "none",
      }}
    >
      {children}
    </a>
  );
}

function ContactLink({
  href,
  icon,
  children,
}: {
  href?: string;
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
  const [hovered, setHovered] = useState(false);

  const content = (
    <>
      <span
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          width: "20px",
          height: "20px",
          flexShrink: 0,
          color: "#ffffff",
          fontSize: "16px",
          lineHeight: 1,
          transform: "translateY(1px)",
        }}
      >
        {icon}
      </span>
      <span
        style={{
          color: hovered ? "#D3D3D3" : "#f0e6d3",
          fontSize: "17px",
          fontFamily: "var(--font-seasons-reg)",
          transition: "color 0.2s",
          lineHeight: 1.2,
        }}
      >
        {children}
      </span>
    </>
  );

  return (
    <div
      style={{ display: "flex", alignItems: "flex-start", gap: "12px" }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {href ? (
        <a
          href={href}
          style={{
            display: "flex",
            gap: "12px",
            textDecoration: "none",
            alignItems: "flex-start",
          }}
        >
          {content}
        </a>
      ) : (
        content
      )}
    </div>
  );
}

export default function Footer() {
  const [email, setEmail] = useState("");
  const [btnHovered, setBtnHovered] = useState(false);
  const [subscribing, setSubscribing] = useState(false);
  const [clinic, setClinic] = useState<PublicClinicInfo>(DEFAULT_PUBLIC_CLINIC);
  const [footer, setFooter] = useState<HomeFooterContent>(DEFAULT_HOME_FOOTER);
  const [subscribeFeedback, setSubscribeFeedback] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);
  const [specialitiesHref, setSpecialitiesHref] = useState("/");

  useEffect(() => {
    let cancelled = false;

    const loadClinic = async () => {
      const data = await fetchPublicClinicInfo();
      if (!cancelled) setClinic(data);
    };

    void loadClinic();
    const stopPolling = setupVisiblePolling(loadClinic, 10 * 60 * 1000);

    return () => {
      cancelled = true;
      stopPolling();
    };
  }, []);

  useEffect(() => {
    let cancelled = false;
    const loadFooter = async () => {
      try {
        const data = await fetchPublicHomeFooter();
        if (!cancelled) setFooter(data);
      } catch {
        // Keep defaults on transient errors
      }
    };
    const stopPolling = setupVisiblePolling(loadFooter, PUBLIC_CMS_POLL_MS);
    return () => {
      cancelled = true;
      stopPolling();
    };
  }, []);

  useEffect(() => {
    fetchPublicSpecialities()
      .then((items) => {
        if (items.length > 0) {
          setSpecialitiesHref(specialityPagePath(items[0].slug));
        }
      })
      .catch(() => {});
  }, []);

  const handleNewsletterSubscribe = async () => {
    const value = email.trim();
    if (!value || subscribing) return;

    setSubscribing(true);
    setSubscribeFeedback(null);

    try {
      const result = await subscribeNewsletterApi(value);
      setSubscribeFeedback({ type: "success", message: result.message });
      setEmail("");
      window.setTimeout(() => setSubscribeFeedback(null), 4000);
    } catch (err) {
      setSubscribeFeedback({
        type: "error",
        message:
          err instanceof Error ? err.message : "Failed to subscribe. Please try again.",
      });
    } finally {
      setSubscribing(false);
    }
  };

  const navItems = useMemo(
    () =>
      footer.navItems.map((item) => ({
        label: item.label,
        href:
          item.href === FOOTER_SPECIALITIES_HREF ? specialitiesHref : item.href,
      })),
    [footer.navItems, specialitiesHref]
  );

  const logoSrc =
    resolveMediaSource(footer.logoUrl) || footer.logoUrl || "/images/altaslogo.png";
  const logoWebp = staticWebpSibling(logoSrc);
  const bgSrc =
    resolveMediaSource(footer.backgroundImageUrl) || footer.backgroundImageUrl;

  return (
    <>
      <style>{`
        .footer-main {
          display: flex;
          align-items: flex-start;
          gap: 45px;
          padding: 60px 80px 50px;
        }
        .footer-col1 {
          flex: 0 0 300px;
          display: flex;
          flex-direction: column;
        }
        .footer-col2,
        .footer-col3,
        .footer-col4 {
          flex: 1;
        }
        .footer-links-row {
          display: contents;
        }
        .footer-bottom-top {
          display: contents;
        }
        .footer-bottom {
          border-top: 1px solid #f0f0f0;
          padding: 18px 60px;
          display: flex;
          justify-content: space-between;
        }
        .footer-newsletter {
          display: flex;
          flex-direction: column;
          gap: 12px;
          width: 300px;
        }

        @media (min-width: 1441px) {
          .footer-main {
            padding: 70px 120px 60px;
            gap: 60px;
            max-width: 1920px;
            margin: 0 auto;
          }
          .footer-col1 {
            flex: 0 0 340px;
          }
          .footer-newsletter {
            width: 340px;
          }
          .footer-bottom {
            padding: 20px 120px;
            max-width: 1920px;
            margin: 0 auto;
          }
        }

        @media (max-width: 1280px) and (min-width: 1025px) {
          .footer-main {
            padding: 55px 50px 45px;
            gap: 30px;
          }
          .footer-col1 {
            flex: 0 0 240px;
          }
          .footer-newsletter {
            width: 240px;
          }
          .footer-bottom {
            padding: 18px 50px;
          }
        }

       @media (max-width: 1024px) and (min-width: 769px) {
  .footer-bottom {
    padding: 18px 60px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    flex-direction: row;
    gap: 20px;
    flex-wrap: nowrap;
  }
  .footer-bottom-top {
    display: flex !important;
    align-items: center;
    gap: 28px;
    flex-wrap: nowrap;
  }
  .footer-bottom-links {
    display: flex;
    gap: 24px;
    flex-wrap: nowrap;
    margin-left: 60px !important;
  }
  .footer-bottom-links a {
    white-space: nowrap;
  }
  .footer-bottom-bottom {
    white-space: nowrap;
    text-align: right;
    margin-left: auto;
  }
}

        @media (max-width: 768px) {
          .footer-main {
            flex-direction: column;
            gap: 32px;
            padding: 40px 24px 36px;
          }
          .footer-col1 {
            flex: none;
            width: 100%;
            display: flex !important;
            flex-direction: row !important;
            align-items: flex-start !important;
            justify-content: space-between !important;
            gap: 16px !important;
          }
          .footer-newsletter {
            width: auto !important;
            flex: 1 !important;
            max-width: 55% !important;
          }
          .footer-links-row {
            display: grid;
            grid-template-columns: repeat(2, minmax(0, 1fr));
            gap: 20px;
            width: 100%;
          }
          .footer-col2,
          .footer-col3,
          .footer-col4 {
            flex: none;
            width: 100%;
          }
          .footer-bottom {
            padding: 18px 24px;
            display: flex;
            flex-direction: row;
            gap: 10px;
          }
          .footer-bottom-top {
            width: 100%;
            display: flex !important;
            justify-content: space-between !important;
            align-items: center;
            gap: 10px;
            flex-wrap: nowrap !important;
          }
          .footer-copyright {
            white-space: nowrap;
            flex-shrink: 0;
          }
          .footer-bottom-links {
            display: flex !important;
            flex-direction: row !important;
            gap: 40px !important;
            align-items: center !important;
            justify-content: flex-end !important;
            white-space: nowrap !important;
            flex-shrink: 0;
            margin-left: 30px !important;
          }
          .footer-bottom a,
          .footer-bottom span {
            font-size: 14px !important;
            line-height: 1.4 !important;
          }
          .footer-bottom-bottom {
             width: 100%;
  text-align: left;
  display: flex;
  justify-content: flex-start;
          }
        }

        @media (max-width: 480px) {
          .footer-main {
            padding: 32px 16px 28px;
            gap: 24px;
          }
          .footer-newsletter {
            max-width: 60% !important;
          }
          .footer-newsletter input {
            min-width: 0;
          }
          .footer-links-row {
            gap: 14px;
            margin-right:10px !important;
          }
          .footer-col2 a,
          .footer-col3 p,
          .footer-col4 span {
            font-size: 14px;
          }
           .footer-bottom {
            padding: 16px 20px;
            display: grid;
            grid-template-columns: 1fr auto;
            gap: 6px 15px;
          }
          .footer-bottom-top {
            display: contents !important;
          }
          .footer-bottom span.footer-copyright {
            grid-column: 1;
            grid-row: 1;
            font-size: 10px !important;
            white-space: nowrap;
            align-self: center;
          }
          .footer-bottom-links {
            display: contents !important;
          }
          .footer-bottom-links a:nth-child(1) {
            grid-column: 2;
            grid-row: 1;
            font-size: 10px !important;
            line-height: 1.3;
            white-space: nowrap;
            text-align: right;
            align-self: center;
          }
          .footer-bottom-links a:nth-child(2) {
            grid-column: 2;
            grid-row: 2;
            font-size: 10px !important;
            line-height: 1.3;
            white-space: nowrap;
            text-align: right;
            align-self: center;
          }
          .footer-bottom-bottom {
            grid-column: 1;
            grid-row: 2;
            display: flex;
            justify-content: flex-start;
            align-self: center;
          }
          .footer-bottom-bottom span {
            font-size: 10px !important;
            line-height: 1.3;
            text-align: left;
          }

        @media (max-width: 319px) {
          .footer-main {
            padding: 24px 12px 20px;
            gap: 20px;
          }
          .footer-col1 {
            flex-direction: column !important;
            gap: 16px !important;
          }
          .footer-newsletter {
            max-width: 100% !important;
            width: 100% !important;
          }
          .footer-links-row {
            grid-template-columns: 1fr;
          }
          .footer-bottom {
          }
        }
      `}</style>

      <footer
        style={{
          backgroundImage: `
            linear-gradient(
              to bottom right,
              rgba(20, 0, 8, 0.85) 0%,
              rgba(40, 5, 18, 0.35) 25%,
              rgba(0, 0, 0, 0.05) 60%
            ),
            url('${bgSrc}')
          `,
          backgroundSize: "cover",
          backgroundPosition: "left",
          backgroundRepeat: "no-repeat",
          fontFamily: "var(--font-seasons-reg)",
        }}
      >
        <div className="footer-main">
          <div className="footer-col1">
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "2px",
                marginBottom: "42px",
              }}
            >
              <div
                style={{
                  width: "74px",
                  height: "74px",
                  position: "relative",
                  flexShrink: 0,
                }}
              >
                <picture>
                  {logoWebp ? <source srcSet={logoWebp} type="image/webp" /> : null}
                  <img
                    src={logoSrc}
                    alt={footer.logoAlt}
                    width={74}
                    height={74}
                    decoding="async"
                    loading="lazy"
                    style={{
                      width: "100%",
                      height: "100%",
                      objectFit: "contain",
                      transform: "scale(1.99) translateY(-5px)",
                      marginLeft: "18px",
                      pointerEvents: "none",
                    }}
                  />
                </picture>
              </div>

              <div
                style={{
                  display: "flex",
                  gap: "8px",
                  marginLeft: "0px",
                  marginTop: "10px",
                  position: "relative",
                  zIndex: 3,
                }}
              >
                <SocialLink href={footer.instagramUrl} label="Instagram">
                  <FaInstagram size={18} color="#FFFFFF" />
                </SocialLink>
                <SocialLink href={footer.facebookUrl} label="Facebook">
                  <FaFacebook size={18} color="#FFFFFF" />
                </SocialLink>
                <SocialLink href={footer.linkedinUrl} label="LinkedIn">
                  <FaLinkedin size={18} color="#FFFFFF" />
                </SocialLink>
              </div>
            </div>

            <div className="footer-newsletter">
              <span
                style={{
                  color: "#D3D3D3",
                  fontSize: "11px",
                  letterSpacing: "0.18em",
                  textTransform: "uppercase",
                  fontWeight: 600,
                  marginLeft: "2px",
                }}
              >
                {footer.newsletterLabel}
              </span>

              <div
                style={{
                  display: "flex",
                  border: "1.5px solid #FFFFFF",
                  borderRadius: "999px",
                  padding: "10px 10px 10px 20px",
                  alignItems: "center",
                }}
              >
                <input
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      void handleNewsletterSubscribe();
                    }
                  }}
                  placeholder={footer.newsletterPlaceholder}
                  disabled={subscribing}
                  style={{
                    flex: 1,
                    background: "transparent",
                    border: "none",
                    outline: "none",
                    color: "#f0e6d3",
                    minWidth: 0,
                  }}
                />
                <button
                  type="button"
                  onClick={() => void handleNewsletterSubscribe()}
                  disabled={subscribing}
                  onMouseEnter={() => setBtnHovered(true)}
                  onMouseLeave={() => setBtnHovered(false)}
                  style={{
                    width: "20px",
                    height: "20px",
                    borderRadius: "50%",
                    background: btnHovered ? "#711C31" : "",
                    border: "none",
                    cursor: subscribing ? "wait" : "pointer",
                    color: "#FFFFFF",
                    flexShrink: 0,
                    opacity: subscribing ? 0.7 : 1,
                  }}
                >
                  →
                </button>
              </div>
              {subscribeFeedback ? (
                <p
                  role="alert"
                  style={{
                    margin: "8px 2px 0",
                    fontSize: "11px",
                    lineHeight: 1.4,
                    color:
                      subscribeFeedback.type === "success" ? "#f0e6d3" : "#ffc9c9",
                  }}
                >
                  {subscribeFeedback.message}
                </p>
              ) : null}
            </div>
          </div>

          <div className="footer-links-row">
            <div className="footer-col2">
              <h4 style={{ color: "#F0F0F0", marginBottom: "20px", fontWeight: 500 }}>
                {footer.navigationTitle}
              </h4>
              {navItems.map((item) => (
                <div key={item.label} style={{ marginBottom: "12px" }}>
                  <NavLink href={item.href}>{item.label}</NavLink>
                </div>
              ))}
            </div>

            <div className="footer-col3">
              <h4 style={{ color: "#F0F0F0", marginBottom: "20px", fontWeight: 500 }}>
                {footer.hoursTitle}
              </h4>
              {clinic.businessHours.map((entry) => (
                <p key={entry.label} style={{ color: "#f0e6d3", marginBottom: "6px" }}>
                  {frenchDayLabel(entry.label)}: {entry.display}
                </p>
              ))}
            </div>
          </div>

          <div className="footer-col4">
            <h4 style={{ color: "#F0F0F0", marginBottom: "20px", fontWeight: 500 }}>
              {footer.contactsTitle}
            </h4>
            <div style={{ marginBottom: "6px" }}>
              <ContactLink href={`mailto:${clinic.clinicEmail}`} icon="✉">
                {clinic.clinicEmail}
              </ContactLink>
            </div>
            <div style={{ marginBottom: "6px" }}>
              <ContactLink icon="☎">{clinic.primaryContact}</ContactLink>
            </div>
            <div>
              <ContactLink icon={<FaMapMarkerAlt size={16} color="#ffffff" />}>
                {clinic.address}
              </ContactLink>
            </div>
          </div>
        </div>

        <div className="footer-bottom">
          <div className="footer-bottom-top">
            <span className="footer-copyright" style={{ color: "#ffffff" }}>
              © {clinic.clinicName} {new Date().getFullYear()}
            </span>
            <div className="footer-bottom-links flex gap-4">
              <NavLink href={footer.privacyHref}>{footer.privacyLabel}</NavLink>
              <NavLink href={footer.termsHref}>{footer.termsLabel}</NavLink>
            </div>
          </div>
          <div className="footer-bottom-bottom">
            <span style={{ color: "#ffffff" }}>{footer.creditText}</span>
          </div>
        </div>
      </footer>
    </>
  );
}
