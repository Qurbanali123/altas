'use client';

import Link from 'next/link';
import { useState, useEffect, useMemo } from 'react';
import { usePathname } from 'next/navigation';
import {
  fetchPublicSpecialities,
  specialityPagePath,
  type PublicSpecialityListItem,
} from '@/utils/specialitiesApi';
import { resolveMediaSource } from '@/utils/mediaUrl';
import { staticWebpSibling } from '@/components/StaticPicture';
import { setupVisiblePolling, PUBLIC_CMS_POLL_MS } from '@/utils/visiblePolling';
import {
  DEFAULT_HOME_HEADER,
  fetchPublicHomeHeader,
  type HomeHeaderContent,
} from '@/utils/homeHeaderApi';
import {
  DEFAULT_HOME_FOOTER,
  fetchPublicHomeFooter,
  type HomeFooterContent,
} from '@/utils/homeFooterApi';

export default function Header() {
  const [specialitesOpen, setSpecialitesOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [mobileSpecialitesOpen, setMobileSpecialitesOpen] = useState(false);
  const [dynamicSpecialities, setDynamicSpecialities] = useState<PublicSpecialityListItem[]>([]);
  const [header, setHeader] = useState<HomeHeaderContent>(DEFAULT_HOME_HEADER);
  const [footerSocials, setFooterSocials] = useState<Pick<HomeFooterContent, 'instagramUrl' | 'facebookUrl' | 'linkedinUrl'>>({
    instagramUrl: DEFAULT_HOME_FOOTER.instagramUrl,
    facebookUrl: DEFAULT_HOME_FOOTER.facebookUrl,
    linkedinUrl: DEFAULT_HOME_FOOTER.linkedinUrl,
  });

  const pathname = usePathname();
  const isHomePage = pathname === '/';

  useEffect(() => {
    fetchPublicSpecialities()
      .then(setDynamicSpecialities)
      .catch(() => setDynamicSpecialities([]));
  }, []);

  useEffect(() => {
    let cancelled = false;
    const loadHeader = async () => {
      try {
        const data = await fetchPublicHomeHeader();
        if (!cancelled) setHeader(data);
      } catch {
        // Keep defaults
      }
    };
    const stopPolling = setupVisiblePolling(loadHeader, PUBLIC_CMS_POLL_MS);
    return () => {
      cancelled = true;
      stopPolling();
    };
  }, []);

  useEffect(() => {
    let cancelled = false;
    const loadSocials = async () => {
      try {
        const data = await fetchPublicHomeFooter();
        if (!cancelled) {
          setFooterSocials({
            instagramUrl: data.instagramUrl,
            facebookUrl: data.facebookUrl,
            linkedinUrl: data.linkedinUrl,
          });
        }
      } catch {
        // Keep defaults
      }
    };
    const stopPolling = setupVisiblePolling(loadSocials, PUBLIC_CMS_POLL_MS);
    return () => {
      cancelled = true;
      stopPolling();
    };
  }, []);

  const specialiteNavItems = useMemo(
    () =>
      dynamicSpecialities.map((s) => ({
        name: s.title,
        path: specialityPagePath(s.slug),
      })),
    [dynamicSpecialities]
  );

  // Prefer local webp when uploaded; always keep png as fallback (never blank).
  const logoSrc = resolveMediaSource(header.logoUrl) || header.logoUrl || '/images/altaslogo.png';
  const logoWebp = staticWebpSibling(logoSrc);
  const logoHref = header.logoHref || '/';
  const navTextStyle = {
    color: isHomePage ? '#FFFFFF' : '#711C31',
    textDecoration: 'none' as const,
    fontSize: '14.5px',
    fontFamily: "var(--font-seasons-reg)",
    padding: '2px 8px',
    borderRadius: '20px',
    whiteSpace: 'nowrap' as const,
  };

  const socialItems = [
    {
      label: 'Instagram',
      href: footerSocials.instagramUrl,
      icon: (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#FFFFFF" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <rect x="2" y="2" width="20" height="20" rx="5" />
          <circle cx="12" cy="12" r="5" />
          <circle cx="17.5" cy="6.5" r="1" fill="#FFD52F" stroke="none" />
        </svg>
      ),
    },
    {
      label: 'Facebook',
      href: footerSocials.facebookUrl,
      icon: (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="#FFFFFF">
          <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
        </svg>
      ),
    },
    {
      label: 'LinkedIn',
      href: footerSocials.linkedinUrl,
      icon: (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="#FFFFFF">
          <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
        </svg>
      ),
    },
  ];

  const renderNavItems = (opts: { mobile?: boolean }) =>
    header.navItems.map((item, index) => {
      if (item.type === 'specialities') {
        if (opts.mobile) {
          return (
            <div
              key={`spec-${index}`}
              style={{
                borderBottom: isHomePage
                  ? '1px solid rgba(255,255,255,0.15)'
                  : '1px solid rgba(89,23,39,0.15)',
              }}
            >
              <button
                onClick={() => setMobileSpecialitesOpen((o) => !o)}
                style={{
                  background: 'none',
                  border: 'none',
                  color: isHomePage ? '#FFFFFF' : '#591727',
                  fontSize: '18px',
                  fontFamily: "var(--font-seasons-reg)",
                  cursor: 'pointer',
                  padding: '14px 0',
                  width: '100%',
                  textAlign: 'left',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                }}
              >
                {item.label}
                <span
                  style={{
                    fontSize: '14px',
                    transition: 'transform 0.2s',
                    display: 'inline-block',
                    transform: mobileSpecialitesOpen ? 'rotate(180deg)' : 'none',
                  }}
                >
                  ▾
                </span>
              </button>
              {mobileSpecialitesOpen && (
                <div style={{ paddingLeft: 16, paddingBottom: 8 }}>
                  {specialiteNavItems.map((s) => (
                    <Link
                      key={s.name}
                      href={s.path}
                      onClick={() => setMobileMenuOpen(false)}
                      style={{
                        display: 'block',
                        color: isHomePage ? 'rgba(255,255,255,0.8)' : '#711C31',
                        textDecoration: 'none',
                        padding: '10px 0',
                        fontSize: '15px',
                        fontFamily: "var(--font-seasons-reg)",
                      }}
                    >
                      {s.name}
                    </Link>
                  ))}
                </div>
              )}
            </div>
          );
        }

        return (
          <div
            key={`spec-${index}`}
            style={{ position: 'relative' }}
            onMouseLeave={() => setSpecialitesOpen(false)}
          >
            <button
              onClick={() => setSpecialitesOpen(!specialitesOpen)}
              style={{
                background: 'none',
                border: 'none',
                color: isHomePage ? '#FFFFFF' : '#711C31',
                fontSize: '14.5px',
                fontFamily: "var(--font-seasons-reg)",
                cursor: 'pointer',
                padding: '2px 8px',
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                whiteSpace: 'nowrap',
              }}
            >
              {item.label}
              <span style={{ fontSize: '10px' }}>▾</span>
            </button>
            {specialitesOpen && (
              <div
                style={{
                  position: 'absolute',
                  top: '100%',
                  left: 0,
                  background: '#FFFFFF',
                  border: '1px solid rgba(232,201,122,0.3)',
                  borderRadius: '8px',
                  minWidth: '160px',
                  zIndex: 100,
                  marginTop: '0px',
                  paddingTop: '15px',
                }}
              >
                {specialiteNavItems.map((s) => (
                  <Link
                    key={s.name}
                    href={s.path}
                    onClick={() => setSpecialitesOpen(false)}
                    style={{
                      display: 'block',
                      color: '#591727',
                      textDecoration: 'none',
                      padding: '8px 16px',
                      fontSize: '14px',
                      fontFamily: "var(--font-seasons-reg)",
                    }}
                  >
                    {s.name}
                  </Link>
                ))}
              </div>
            )}
          </div>
        );
      }

      if (opts.mobile) {
        return (
          <Link
            key={`${item.label}-${index}`}
            href={item.href || '/'}
            className="header-mobile-nav-link"
            onClick={() => setMobileMenuOpen(false)}
            style={{
              color: isHomePage ? '#FFFFFF' : '#591727',
              textDecoration: 'none',
              fontSize: '18px',
              fontFamily: "var(--font-seasons-reg)",
              padding: '14px 0',
              borderBottom: isHomePage
                ? '1px solid rgba(255,255,255,0.15)'
                : '1px solid rgba(89,23,39,0.15)',
            }}
          >
            {item.label}
          </Link>
        );
      }

      return (
        <Link key={`${item.label}-${index}`} href={item.href || '/'} style={navTextStyle}>
          {item.label}
        </Link>
      );
    });

  return (
    <>
      <header
        className={mobileMenuOpen ? 'header-mobile-menu-open' : undefined}
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          zIndex: 2000,
          padding: isHomePage ? '10px 32px' : '40px 60px',
          background: 'transparent',
          fontFamily: "var(--font-seasons-reg)",
        }}
      >
        {isHomePage && (
          <div
            className="header-social-top"
            style={{
              display: 'flex',
              justifyContent: 'flex-end',
              gap: '14px',
              marginBottom: '6px',
              marginRight: '8px',
            }}
          >
            {socialItems.map(({ label, href, icon }) => (
              <a
                key={label}
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={label}
                style={{ opacity: 0.85, display: 'flex', alignItems: 'center' }}
              >
                {icon}
              </a>
            ))}
          </div>
        )}

        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '20px',
          }}
        >
          <Link
            href={logoHref}
            aria-label="Go to home"
            style={{ display: 'inline-flex', lineHeight: 0 }}
            onClick={() => setMobileMenuOpen(false)}
          >
            <picture>
              {logoWebp ? <source srcSet={logoWebp} type="image/webp" /> : null}
              <img
                src={logoSrc}
                alt={header.logoAlt}
                width={153}
                height={94}
                className="header-logo"
                decoding="async"
                style={{
                  marginRight: '10px',
                  filter: isHomePage
                    ? 'none'
                    : 'brightness(0) saturate(100%) invert(16%) sepia(41%) saturate(1876%) hue-rotate(314deg) brightness(92%) contrast(95%)',
                }}
              />
            </picture>
          </Link>

          <nav
            className="header-desktop-nav"
            style={{
              flex: 1,
              maxWidth: '560px',
              border: isHomePage ? '1px solid #FFFFFF' : 'none',
              borderRadius: '50px',
              padding: '8px 28px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '4px',
            }}
          >
            {renderNavItems({ mobile: false })}
          </nav>

          <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
            <Link
              href={header.contactHref || '/pages/contact'}
              className="header-desktop-contact"
              style={{
                background: isHomePage ? '#FFFFFF' : '#551625',
                color: isHomePage ? '#3d0a1e' : '#FFFFFF',
                borderRadius: '30px',
                padding: isHomePage ? '6px 30px' : '6px 50px',
                fontFamily: "var(--font-seasons-reg)",
                fontSize: '14.5px',
                fontWeight: 500,
                textDecoration: 'none',
                whiteSpace: 'nowrap',
                border: '1px solid transparent',
              }}
              onMouseEnter={(e) => {
                const el = e.currentTarget;
                el.style.background = isHomePage ? '#551625' : '#FFFFFF';
                el.style.color = isHomePage ? '#FFFFFF' : '#551625';
                el.style.border = isHomePage ? '1px solid #FFFFFF' : '1px solid #551625';
              }}
              onMouseLeave={(e) => {
                const el = e.currentTarget;
                el.style.background = isHomePage ? '#FFFFFF' : '#551625';
                el.style.color = isHomePage ? '#551625' : '#FFFFFF';
                el.style.border = '1px solid transparent';
              }}
            >
              {header.contactLabel}
            </Link>
          </div>

          <button
            className="header-hamburger"
            onClick={() => setMobileMenuOpen((o) => !o)}
            aria-label="Toggle menu"
            style={{
              display: 'none',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              padding: '4px',
              flexDirection: 'column',
              gap: '5px',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            {mobileMenuOpen ? (
              <svg
                width="26"
                height="26"
                viewBox="0 0 24 24"
                fill="none"
                stroke={isHomePage ? '#FFFFFF' : '#591727'}
                strokeWidth="2"
                strokeLinecap="round"
              >
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            ) : (
              <svg
                width="26"
                height="26"
                viewBox="0 0 24 24"
                fill="none"
                stroke={isHomePage ? '#FFFFFF' : '#591727'}
                strokeWidth="2"
                strokeLinecap="round"
              >
                <line x1="3" y1="6" x2="21" y2="6" />
                <line x1="3" y1="12" x2="21" y2="12" />
                <line x1="3" y1="18" x2="21" y2="18" />
              </svg>
            )}
          </button>
        </div>
      </header>

      {mobileMenuOpen && (
        <div
          className="header-mobile-drawer"
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            zIndex: 1999,
            background: isHomePage ? 'rgba(61,10,30,0.97)' : 'rgba(255,255,255,0.98)',
            display: 'flex',
            flexDirection: 'column',
            padding: '100px 32px 40px',
            gap: '0px',
            overflowY: 'auto',
          }}
        >
          {renderNavItems({ mobile: true })}

          <Link
            href={header.contactHref || '/pages/contact'}
            onClick={() => setMobileMenuOpen(false)}
            style={{
              marginTop: 32,
              textAlign: 'center',
              background: isHomePage ? '#FFFFFF' : '#551625',
              color: isHomePage ? '#3d0a1e' : '#FFFFFF',
              borderRadius: '30px',
              padding: '12px 40px',
              fontFamily: "var(--font-seasons-reg)",
              fontSize: '16px',
              fontWeight: 500,
              textDecoration: 'none',
              alignSelf: 'flex-start',
            }}
          >
            {header.contactLabel}
          </Link>

          {isHomePage && (
            <div style={{ display: 'flex', gap: 18, marginTop: 40 }}>
              {socialItems.map(({ label, href, icon }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={label}
                  style={{ opacity: 0.85 }}
                >
                  {icon}
                </a>
              ))}
            </div>
          )}
        </div>
      )}

      <style>{`
        @media (max-width: 768px) {
          .header-social-top {
            display: none !important;
          }
          .header-logo {
            margin-left: -15px !important;
            width: 120px !important;
            height: auto !important;
          }
          .header-desktop-nav {
            display: none !important;
          }
          .header-desktop-contact {
            display: none !important;
          }
          .header-hamburger {
            display: flex !important;
            position: relative;
            z-index: 2001;
          }
          .header-mobile-drawer {
            display: flex !important;
          }
          header.header-mobile-menu-open {
            pointer-events: none;
          }
          header.header-mobile-menu-open .header-hamburger {
            pointer-events: auto;
          }
          .header-mobile-nav-link {
            display: block;
            width: 100%;
            position: relative;
            z-index: 1;
          }
        }

        @media (min-width: 769px) and (max-width: 1024px) {
          .header-desktop-nav {
            display: none !important;
          }
          .header-desktop-contact {
            display: none !important;
          }
          .header-hamburger {
            display: flex !important;
          }
        }

        @media (min-width: 1025px) {
          .header-hamburger {
            display: none !important;
          }
          .header-desktop-nav {
            display: flex !important;
          }
          .header-desktop-contact {
            display: inline-flex !important;
          }
          .header-mobile-drawer {
            display: none !important;
          }
        }
      `}</style>
    </>
  );
}
