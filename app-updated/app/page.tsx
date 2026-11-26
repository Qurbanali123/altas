"use client";

import Image from 'next/image';
import { useState, useEffect, useRef, useMemo } from "react";
import Link from "next/link";
import OptimizedNextImage from "@/components/OptimizedNextImage";
import { mediaImageUrl, resolveMediaSource } from "@/utils/mediaUrl";
import { fetchPublicBlogs } from "@/utils/blogsApi";
import {
  fetchPublicSpecialities,
  specialityImageUrl,
  specialityPagePath,
} from "@/utils/specialitiesApi";
import { useSectionInView } from "@/utils/useSectionInView";
import { setupVisiblePolling, PUBLIC_CMS_POLL_MS } from "@/utils/visiblePolling";
import { subscribeNewsletterApi } from "@/utils/subscribersApi";
import {
  DEFAULT_HOME_HERO,
  type HomeHeroContent,
} from "@/utils/homeHeroApi";
import {
  DEFAULT_HOME_STATS,
  type HomeStatsContent,
} from "@/utils/homeStatsApi";
import {
  DEFAULT_HOME_ABOUT,
  type HomeAboutContent,
} from "@/utils/homeAboutApi";
import {
  DEFAULT_HOME_REVIEWS,
  type HomeReviewsContent,
} from "@/utils/homeReviewsApi";
import {
  DEFAULT_HOME_BLOGS,
  type HomeBlogsContent,
} from "@/utils/homeBlogsApi";
import {
  DEFAULT_HOME_FAQ,
  type HomeFaqContent,
  type HomeFaqItem,
} from "@/utils/homeFaqApi";
import {
  DEFAULT_HOME_VIDEO,
  resolveVideoPlayback,
  type HomeVideoContent,
} from "@/utils/homeVideoApi";
import { fetchPublicHomeBundle } from "@/utils/homeBundleApi";

type CarouselCard = {
  title: string;
  sub: string;
  image: string;
  href?: string;
};

const SPECIALTY_CARD_WIDTH = 200;
const SPECIALTY_CARD_GAP = 20; // gap-5
const SPECIALTY_CARD_SLOT = SPECIALTY_CARD_WIDTH + SPECIALTY_CARD_GAP;

function buildSpecialtyCarouselLoop(cards: CarouselCard[], viewportWidth: number) {
  if (cards.length === 0) {
    return { loop: [] as CarouselCard[], shiftPx: 0, durationMobile: 20, durationDesktop: 16 };
  }

  const minSetWidth = Math.max(viewportWidth || 1200, 900);
  let set = [...cards];
  while (set.length * SPECIALTY_CARD_SLOT < minSetWidth) {
    set = [...set, ...cards];
  }

  const shiftPx = set.length * SPECIALTY_CARD_SLOT;
  // Match original pace (~20 cards → 50s mobile / 32s desktop)
  const durationMobile = Math.max((set.length / 20) * 50, 12);
  const durationDesktop = Math.max((set.length / 20) * 32, 8);

  return {
    loop: [...set, ...set],
    shiftPx,
    durationMobile,
    durationDesktop,
  };
}

function isInsideSpecialtyCard(target: EventTarget | null): boolean {
  return target instanceof Element && !!target.closest("[data-specialty-card]");
}

const TOTAL_PAGES = 4;

// ─── ReviewCard component ───────────────────────────────────────────────────
function ReviewCard({
  review,
  topRight = false,
}: {
  review: { name: string; text: string; bg: string; stars: number };
  topRight?: boolean;
}) {
  const isLight = review.bg === "#e8dcc8" || review.bg === "#c8a87a" || review.bg === "#b09070";
  const textColor = isLight ? "#3d0818" : "#f0e6d3";
  const nameColor = isLight ? "#6b1228" : "#e8c97a";

  return (
    <div
      style={{
        background: review.bg,
        borderRadius: "20px",
        borderTopRightRadius: topRight ? "60px" : "20px",
        padding: "28px 26px 24px",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        minHeight: "200px",
      }}
    >
      <div style={{ marginBottom: "12px", display: "flex", gap: "3px" }}>
        {[...Array(review.stars)].map((_, i) => (
          <span key={i} style={{ color: "#c8960a", fontSize: "16px" }}>★</span>
        ))}
      </div>
      <p style={{ color: textColor, fontSize: "13px", lineHeight: 1.75, fontFamily: "var(--font-seasons-reg)", fontWeight: 100, flex: 1, marginBottom: "198px" }}>
        {review.text}
      </p>
      <p style={{ color: nameColor, fontSize: "13px", fontWeight: 600, fontFamily: "var(--font-seasons-reg)", letterSpacing: "0.02em" }}>
        -{review.name}
      </p>
    </div>
  );
}

// ─── BlogCard component ─────────────────────────────────────────────────────
function BlogCard({ post, onPause, onResume }: { post: { image: string; date: string; title: string; slug: string };
   onPause: () => void;
  onResume: () => void; }) {
  const [hovered, setHovered] = useState(false);

  return (
    <Link
      href={`/pages/Blogs/${post.slug}`}
      style={{ textDecoration: 'none', display: 'block' }}
    >
    <div  
    className="blog-card-wrapper"
        onMouseEnter={() => {
        setHovered(true);
        onPause();
      }}
      onMouseLeave={() => {
        setHovered(false);
        onResume();
      }}
      
      style={{
      
        flexShrink: 0,
        width: '380px',
        height: '370px',
        overflow: 'hidden',
        boxSizing: 'border-box',
        borderRadius: '24px',
        background: hovered ? '#5c0d2a' : '#f0f0f0',
        padding: '14px 14px 24px',
        display: 'flex',
        flexDirection: 'column',
        cursor: 'pointer',
        transition: 'background 0.4s ease',
        position: 'relative',
        border:'1px solid #753141'
      }}
    >
      {/* Image */}
      <div className="blogimg"
        style={{
          width: '100%',
          height: '220px',
          borderRadius: '16px',
          overflow: 'hidden',
          marginBottom: '16px',
          flexShrink: 0,
          position: 'relative',
        }}
      >
        <OptimizedNextImage
          path={post.image}
          fallbackSrc={mediaImageUrl("/images/blog1.jpg", { width: 600 })}
          optimize={{ width: 600 }}
          alt={post.title}
          fill
          style={{ objectFit: 'cover' }}
          loading="lazy"
        />
      </div>

      {/* Date */}
      <p
        style={{
          color: hovered ? '#ffffff' : '#3d0818',
          fontSize: '14px',
          letterSpacing: '0.03em',
          textAlign: 'right',
          marginBottom: '10px',
          fontFamily: "var(--font-seasons-reg)",
          transition: 'color 0.4s',
          paddingRight: '4px',
        }}
      >
        {post.date}
      </p>

      {/* Title + Arrow — fixed slot so arrow stays in the same place on every card */}
      <div className="blog-card-footer" style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', minHeight: 0 }}>
        <div className="blog-card-footer-row" style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: '12px', paddingLeft: '6px', paddingRight: '6px', minHeight: '72px' }}>
          <h3
            style={{
              color: hovered ? '#f0e6d3' : '#3d0818',
              fontSize: '15px',
              fontWeight: 400,
              lineHeight: 1.6,
              fontFamily: "var(--font-seasons-reg)",
              flex: 1,
              margin: 0,
              minHeight: '72px',
              display: '-webkit-box',
              WebkitLineClamp: 3,
              WebkitBoxOrient: 'vertical' as const,
              overflow: 'hidden',
              transition: 'color 0.4s',
            }}
          >
            {post.title}
          </h3>
          <div
            style={{
              flexShrink: 0,
              width: '49px',
              height: '49px',
              borderRadius: '50%',
              background: hovered ? '#F0F0F0' : '#5c0d2a',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: hovered ? '#711c31':'#FFFFFF',
              fontSize:'25px',
              marginBottom: '2px',
              alignSelf: 'flex-end',
            }}
          >
            ↗
          </div>
        </div>
      </div>
    </div>
    </Link>
  );
}
function FaqNestedItem({
  item,
  isOpen,
  onToggle,
}: {
  item: HomeFaqItem;
  isOpen: boolean;
  onToggle: () => void;
}) {
  return (
    <div style={{ borderTop: "1px solid #d4c4c8" }}>
      <button
        type="button"
        onClick={onToggle}
        style={{
          width: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "16px 0",
          background: "transparent",
          border: "none",
          cursor: "pointer",
          textAlign: "left",
          gap: "16px",
        }}
      >
        <span
          style={{
            color: "#591727",
            fontSize: "15px",
            fontWeight: 500,
            fontFamily: "var(--font-seasons-reg)",
            lineHeight: 1.45,
          }}
        >
          {item.q}
        </span>
        <span style={{ color: "#6b1228", fontSize: "14px", flexShrink: 0 }}>
          {isOpen ? "▲" : "▼"}
        </span>
      </button>
      <div
        style={{
          maxHeight: isOpen ? "400px" : "0px",
          overflow: "hidden",
          transition: "max-height 0.35s ease",
        }}
      >
        <p
          style={{
            color: "#591727",
            fontSize: "15px",
            lineHeight: 1.75,
            fontFamily: "var(--font-seasons-reg)",
            fontWeight: 400,
            padding: "0 0 16px",
            margin: 0,
          }}
        >
          {item.a}
        </p>
      </div>
    </div>
  );
}

// ─── FaqSection component ───────────────────────────────────────────────────
function FaqSection({ content }: { content: HomeFaqContent }) {
  const featuredFaqs = content.categories
    .filter((category) => category.items.length > 0)
    .map((category) => ({
      categoryId: category.id,
      categoryName: category.name,
      ...category.items[0],
    }));

  const [openFeaturedId, setOpenFeaturedId] = useState<string | null>(null);
  const [showCategoryMore, setShowCategoryMore] = useState(false);
  const [openNestedId, setOpenNestedId] = useState<string | null>(null);

  const toggleFeatured = (id: string) => {
    if (openFeaturedId === id) {
      setOpenFeaturedId(null);
      setShowCategoryMore(false);
      setOpenNestedId(null);
      return;
    }
    setOpenFeaturedId(id);
    setShowCategoryMore(false);
    setOpenNestedId(null);
  };

  return (
    <section
      style={{
        background: "#FFFFFF",
        fontFamily: "var(--font-seasons-reg)",
        padding: "80px 0 100px",
      }}
    >
      <div
        className="faq-inner"
        style={{
          maxWidth: "1200px",
          margin: "0 auto",
          display: "flex",
          gap: "90px",
          alignItems: "flex-start",
          marginRight: "62px",
        }}
      >
        <div style={{ flex: "0 0 340px" }}>
          <h2
            style={{
              color: "#6b1228",
              fontSize: "29px",
              fontWeight: 600,
              fontFamily: "var(--font-cinzel)",
              lineHeight: 1.2,
              marginBottom: "28px",
              letterSpacing: "0.01em",
            }}
          >
            {content.title}
          </h2>
          <p
            style={{
              color: "#45383B",
              fontSize: "18px",
              lineHeight: 1.6,
              fontFamily: "var(--font-seasons-reg)",
              fontWeight: 400,
            }}
          >
            {content.body}
          </p>
        </div>

        <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: "16px" }}>
          {featuredFaqs.map((faq) => {
            const isOpen = openFeaturedId === faq.id;
            const category = content.categories.find((c) => c.id === faq.categoryId);
            const relatedItems =
              category?.items.filter((item) => item.id !== faq.id) ?? [];

            return (
              <div
                key={faq.id}
                style={{
                  overflow: "hidden",
                  border: "1px solid #753141",
                  borderRadius: isOpen ? "12px" : "0",
                }}
              >
                <button
                  type="button"
                  onClick={() => toggleFeatured(faq.id)}
                  style={{
                    width: "100%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    padding: "22px 24px",
                    background: "#f0f0f0",
                    border: "none",
                    cursor: "pointer",
                    textAlign: "left",
                    gap: "20px",
                    borderRadius: isOpen ? "12px 12px 0 0" : "0",
                  }}
                >
                  <span
                    style={{
                      color: isOpen ? "#6b1220" : "#591727",
                      fontSize: "17px",
                      fontWeight: 500,
                      fontFamily: "var(--font-seasons-reg)",
                      lineHeight: 1.4,
                      letterSpacing: "0.01em",
                    }}
                  >
                    {faq.q}
                  </span>
                  <span style={{ color: isOpen ? "#6b1228" : "#300E16", fontSize: "18px", flexShrink: 0 }}>
                    {isOpen ? "▲" : "▼"}
                  </span>
                </button>

                <div
                  style={{
                    background: "#F0F0F0",
                    maxHeight: isOpen ? "1200px" : "0px",
                    overflow: "hidden",
                    transition: "max-height 0.45s cubic-bezier(.4,0,.2,1)",
                    borderRadius: isOpen ? "0 0 12px 12px" : "0",
                  }}
                >
                  <div style={{ padding: "4px 24px 20px" }}>
                    <p
                      style={{
                        color: "#591727",
                        fontSize: "16px",
                        lineHeight: 1.8,
                        fontFamily: "var(--font-seasons-reg)",
                        fontWeight: 400,
                        margin: "0 0 16px",
                      }}
                    >
                      {faq.a}
                    </p>

                    {relatedItems.length > 0 && (
                      <>
                        <button
                          type="button"
                          onClick={() => {
                            setShowCategoryMore((prev) => !prev);
                            setOpenNestedId(null);
                          }}
                          style={{
                            background: "none",
                            border: "none",
                            padding: 0,
                            cursor: "pointer",
                            fontFamily: "var(--font-seasons-reg)",
                            fontSize: "15px",
                            lineHeight: 1.5,
                            textAlign: "left",
                          }}
                        >
                          <span style={{ color: "#591727" }}>En savoir plus — </span>
                          <span
                            style={{
                              color: "#6b1228",
                              fontWeight: 600,
                              textDecoration: "underline",
                              textUnderlineOffset: "3px",
                            }}
                          >
                            {faq.categoryName}
                          </span>
                          <span style={{ color: "#591727" }}> {showCategoryMore && isOpen ? "▲" : "▼"}</span>
                        </button>

                        {showCategoryMore && (
                          <div
                            style={{
                              marginTop: "12px",
                              paddingTop: "4px",
                              borderTop: "1px solid #c9b4b8",
                            }}
                          >
                            {relatedItems.map((item) => (
                              <FaqNestedItem
                                key={item.id}
                                item={item}
                                isOpen={openNestedId === item.id}
                                onToggle={() =>
                                  setOpenNestedId((prev) => (prev === item.id ? null : item.id))
                                }
                              />
                            ))}
                          </div>
                        )}
                      </>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

// ─── Main Page ──────────────────────────────────────────────────────────────
export default function Home() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const [isCarouselPaused, setIsCarouselPaused] = useState(false);
  const [carouselCards, setCarouselCards] = useState<CarouselCard[]>([]);
  const [carouselViewportW, setCarouselViewportW] = useState(1200);
  const [page, setPage] = useState(0);
  const [isBlogPaused, setIsBlogPaused] = useState(false);
  const [blogShiftPx, setBlogShiftPx] = useState(0);
  const blogTrackRef = useRef<HTMLDivElement>(null);
  const carouselTrackRef = useRef<HTMLDivElement>(null);
  const carouselDesktopTrackRef = useRef<HTMLDivElement>(null);
  const carouselSectionRef = useRef<HTMLElement>(null);
  const carouselLeaveLockRef = useRef(false);
  const carouselOffsetRef = useRef(0);
  const carouselPausedRef = useRef(false);
  const carouselRafRef = useRef<number | null>(null);
  const blogSectionRef = useRef<HTMLElement>(null);
  const aboutSectionRef = useRef<HTMLElement>(null);
  const reviewsSectionRef = useRef<HTMLElement>(null);
  const videoSectionRef = useRef<HTMLElement>(null);
  const faqSectionRef = useRef<HTMLDivElement>(null);
  const carouselInView = useSectionInView(carouselSectionRef);
  const blogInView = useSectionInView(blogSectionRef);
  const reviewsInView = useSectionInView(reviewsSectionRef);
  const videoInView = useSectionInView(videoSectionRef);
  const faqInView = useSectionInView(faqSectionRef);
  const [blogPosts, setBlogPosts] = useState<
    { image: string; date: string; title: string; slug: string }[]
  >([]);
  const [isVideoPlaying, setIsVideoPlaying] = useState(false);
  const [isVideoHovered, setIsVideoHovered] = useState(false);
  const [embedStarted, setEmbedStarted] = useState(false);
  const [hero, setHero] = useState<HomeHeroContent>(DEFAULT_HOME_HERO);
  const [homeStats, setHomeStats] = useState<HomeStatsContent>(DEFAULT_HOME_STATS);
  const [homeAbout, setHomeAbout] = useState<HomeAboutContent>(DEFAULT_HOME_ABOUT);
  const [homeReviews, setHomeReviews] = useState<HomeReviewsContent>(DEFAULT_HOME_REVIEWS);
  const [homeBlogs, setHomeBlogs] = useState<HomeBlogsContent>(DEFAULT_HOME_BLOGS);
  const [homeFaq, setHomeFaq] = useState<HomeFaqContent>(DEFAULT_HOME_FAQ);
  const [homeVideo, setHomeVideo] = useState<HomeVideoContent>(DEFAULT_HOME_VIDEO);
  const [heroSubscribeOpen, setHeroSubscribeOpen] = useState(false);
  const [heroSubscribeEmail, setHeroSubscribeEmail] = useState("");
  const [heroSubscribing, setHeroSubscribing] = useState(false);
  const [heroSubscribeFeedback, setHeroSubscribeFeedback] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);
  // Exact uploaded doctor PNG only — never canvas/reprocess (that caused holes + white edges).
  const [heroDoctorSrc, setHeroDoctorSrc] = useState("/images/udrimage.png");

  useEffect(() => {
    let cancelled = false;
    // One bundle request instead of 7 parallel CMS calls (shared hosting drops bursts).
    const loadHomeCms = async () => {
      try {
        const data = await fetchPublicHomeBundle();
        if (cancelled) return;
        setHero(data.hero);
        setHomeStats(data.stats);
        setHomeAbout(data.about);
        setHomeReviews(data.reviews);
        setHomeBlogs(data.blogs);
        setHomeFaq(data.faq);
        setHomeVideo(data.video);
      } catch {
        // Keep current content on transient errors; defaults already in state
      }
    };
    const stopPolling = setupVisiblePolling(loadHomeCms, PUBLIC_CMS_POLL_MS);
    return () => {
      cancelled = true;
      stopPolling();
    };
  }, []);

  // Preload exact CMS URL, then swap — no blank frame, no pixel editing.
  // Never replace the sharp local cutout with a much smaller CMS upload (that
  // is what made the doctor look crisp on first paint, then blurry after load).
  useEffect(() => {
    const next =
      resolveMediaSource(hero.doctorImageUrl) || "/images/udrimage.png";
    if (next === heroDoctorSrc) return;
    let cancelled = false;
    const img = new window.Image();
    img.onload = () => {
      if (cancelled) return;
      const nextW = img.naturalWidth || 0;
      const keepingSharpDefault =
        /\/images\/udrimage\.(png|webp)(\?|$)/i.test(heroDoctorSrc) &&
        nextW > 0 &&
        nextW < 800;
      if (keepingSharpDefault) return;
      setHeroDoctorSrc(next);
    };
    img.onerror = () => {
      if (!cancelled) setHeroDoctorSrc("/images/udrimage.png");
    };
    img.src = next;
    return () => {
      cancelled = true;
    };
  }, [hero.doctorImageUrl, heroDoctorSrc]);

  const handleHeroSubscribe = async () => {
    const value = heroSubscribeEmail.trim();
    if (!value || heroSubscribing) return;

    setHeroSubscribing(true);
    setHeroSubscribeFeedback(null);
    try {
      const result = await subscribeNewsletterApi(value);
      setHeroSubscribeFeedback({ type: "success", message: result.message });
      setHeroSubscribeEmail("");
      window.setTimeout(() => {
        setHeroSubscribeFeedback(null);
        setHeroSubscribeOpen(false);
      }, 2500);
    } catch (err) {
      setHeroSubscribeFeedback({
        type: "error",
        message:
          err instanceof Error
            ? err.message
            : "Failed to subscribe. Please try again.",
      });
    } finally {
      setHeroSubscribing(false);
    }
  };

  useEffect(() => {
    if (!blogInView) return;

    let cancelled = false;
    fetchPublicBlogs({ page: 1, limit: 4, sort: "recent" })
      .then((data) => {
        if (cancelled) return;
        setBlogPosts(
          data.blogs.map((blog) => ({
            image: blog.image,
            date: blog.date,
            title: blog.title,
            slug: blog.slug,
          }))
        );
      })
      .catch(() => {
        if (!cancelled) setBlogPosts([]);
      });

    return () => {
      cancelled = true;
    };
  }, [blogInView]);

  const specialtyLoop = useMemo(
    () => buildSpecialtyCarouselLoop(carouselCards, carouselViewportW),
    [carouselCards, carouselViewportW]
  );

  const videoPlayback = useMemo(
    () => resolveVideoPlayback(homeVideo.videoUrl),
    [homeVideo.videoUrl]
  );

  useEffect(() => {
    setIsVideoPlaying(false);
    setEmbedStarted(false);
  }, [homeVideo.videoUrl]);

  useEffect(() => {
    const updateViewport = () => {
      setCarouselViewportW(window.innerWidth || 1200);
    };
    updateViewport();
    window.addEventListener("resize", updateViewport);
    return () => window.removeEventListener("resize", updateViewport);
  }, []);

  useEffect(() => {
    let cancelled = false;
    const loadSpecialities = async () => {
      try {
        const specs = await fetchPublicSpecialities({ bypassCache: true });
        if (cancelled) return;
        const next: CarouselCard[] = specs.map((s) => ({
          title: s.title,
          sub:
            s.description?.trim().slice(0, 160) ||
            "Découvrez nos soins spécialisés à Atlas Dental Center.",
          image: s.heroImageUrl || "/images/card10.png",
          href: specialityPagePath(s.slug),
        }));
        setCarouselCards((prev) => {
          if (
            prev.length === next.length &&
            prev.every(
              (c, i) =>
                c.title === next[i].title &&
                c.sub === next[i].sub &&
                c.image === next[i].image &&
                c.href === next[i].href
            )
          ) {
            return prev;
          }
          return next;
        });
      } catch {
        if (!cancelled) setCarouselCards([]);
      }
    };

    if (!carouselInView) return;
    const stopPolling = setupVisiblePolling(loadSpecialities, 30_000);
    return () => {
      cancelled = true;
      stopPolling();
    };
  }, [carouselInView]);

  useEffect(() => {
    const track = blogTrackRef.current;
    if (!track || blogPosts.length === 0) {
      setBlogShiftPx(0);
      return;
    }

    const updateShift = () => {
      setBlogShiftPx(track.scrollWidth / 2);
    };

    updateShift();
    const observer = new ResizeObserver(updateShift);
    observer.observe(track);
    window.addEventListener("resize", updateShift);

    return () => {
      observer.disconnect();
      window.removeEventListener("resize", updateShift);
    };
  }, [blogPosts]);

  useEffect(() => {
    carouselPausedRef.current = isCarouselPaused || openIndex !== null;
  }, [isCarouselPaused, openIndex]);

  // Smooth marquee: integer-pixel translate3d via rAF (no CSS animation jitter)
  useEffect(() => {
    if (!carouselInView || specialtyLoop.shiftPx <= 0) return;

    const speed = 120; // px per second — steady, no easing
    let last = performance.now();
    const loopAt = specialtyLoop.shiftPx;

    const paint = () => {
      const x = -Math.floor(carouselOffsetRef.current);
      const t = `translate3d(${x}px,0,0)`;
      if (carouselTrackRef.current) carouselTrackRef.current.style.transform = t;
      if (carouselDesktopTrackRef.current) {
        carouselDesktopTrackRef.current.style.transform = t;
      }
    };

    const tick = (now: number) => {
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      if (!carouselPausedRef.current) {
        carouselOffsetRef.current += speed * dt;
        if (carouselOffsetRef.current >= loopAt) {
          carouselOffsetRef.current -= loopAt;
        }
        paint();
      }
      carouselRafRef.current = window.requestAnimationFrame(tick);
    };

    paint();
    carouselRafRef.current = window.requestAnimationFrame(tick);
    return () => {
      if (carouselRafRef.current != null) {
        window.cancelAnimationFrame(carouselRafRef.current);
        carouselRafRef.current = null;
      }
    };
  }, [carouselInView, specialtyLoop.shiftPx]);

  const handleSpecialityCardPress = (instanceIndex: number) => {
    setIsCarouselPaused(true);
    setOpenIndex(instanceIndex);
  };

  const handleSpecialityCardRelease = () => {
    setOpenIndex(null);
    setIsCarouselPaused(false);
  };

  const scheduleCarouselLeaveUnlock = () => {
    carouselLeaveLockRef.current = true;
    window.setTimeout(() => {
      carouselLeaveLockRef.current = false;
    }, 350);
  };

  const tryCarouselCardRelease = () => {
    if (carouselLeaveLockRef.current) return;
    handleSpecialityCardRelease();
  };

  useEffect(() => {
    if (!isCarouselPaused) return;

    const onPointerDownOutside = (event: PointerEvent) => {
      if (!isInsideSpecialtyCard(event.target)) handleSpecialityCardRelease();
    };

    document.addEventListener("pointerdown", onPointerDownOutside);
    return () => {
      document.removeEventListener("pointerdown", onPointerDownOutside);
    };
  }, [isCarouselPaused]);

  const renderSpecialityCards = (mode: "touch" | "desktop") =>
    specialtyLoop.loop.map((card, i) => {
      // Unique instance — only this card opens and pushes neighbors (no overlap)
      const isOpen = openIndex === i;
      const interactionProps =
        mode === "touch"
          ? {
              "data-specialty-card": true,
              "data-index": i,
              onMouseEnter: () => {
                if (!window.matchMedia("(hover: hover)").matches) return;
                handleSpecialityCardPress(i);
              },
              onMouseLeave: (e: React.MouseEvent<HTMLDivElement>) => {
                if (!window.matchMedia("(hover: hover)").matches) return;
                if (isInsideSpecialtyCard(e.relatedTarget)) return;
                if (openIndex === i) tryCarouselCardRelease();
              },
              onPointerDown: (e: React.PointerEvent<HTMLDivElement>) => {
                if (e.pointerType === "mouse") return;
                e.stopPropagation();
                e.currentTarget.setPointerCapture(e.pointerId);
                scheduleCarouselLeaveUnlock();
                handleSpecialityCardPress(i);
              },
              onPointerUp: (e: React.PointerEvent<HTMLDivElement>) => {
                if (e.pointerType === "mouse") return;
                const el = e.currentTarget;
                if (!el.hasPointerCapture(e.pointerId)) return;
                el.releasePointerCapture(e.pointerId);
                const rect = el.getBoundingClientRect();
                const inside =
                  e.clientX >= rect.left &&
                  e.clientX <= rect.right &&
                  e.clientY >= rect.top &&
                  e.clientY <= rect.bottom;
                if (!inside) tryCarouselCardRelease();
              },
              onPointerLeave: (e: React.PointerEvent<HTMLDivElement>) => {
                if (e.pointerType === "mouse") return;
                if (isInsideSpecialtyCard(e.relatedTarget)) return;
                if (openIndex === i) tryCarouselCardRelease();
              },
            }
          : {
              onMouseEnter: () => handleSpecialityCardPress(i),
            };

      return (
        <div
          key={`card-${mode}-${i}`}
          className={`specialty-card relative z-0 flex cursor-pointer flex-col justify-between overflow-hidden rounded-2xl border border-[#711C31] px-5 pb-5 pt-6 h-[200px] touch-manipulation ${isOpen ? "is-open bg-[#0a1520]" : "bg-[#f0f0f0]"}`}
          {...interactionProps}
        >
          <div className="pointer-events-none absolute -left-20 top-[100px] z-0 h-[212px] w-[212px] rounded-full bg-[#D3D3D3] opacity-[0.99]" />
          {card.image ? (
            <img
              src={
                specialityImageUrl(card.image, { width: 480 }) ||
                mediaImageUrl(card.image, { width: 480 })
              }
              alt=""
              aria-hidden
              draggable={false}
              decoding="async"
              loading="lazy"
              className="pointer-events-none absolute inset-0 z-0 h-full w-full rounded-2xl object-cover"
              style={{ opacity: isOpen ? 0.5 : 0.16 }}
            />
          ) : null}
          <div
            className="pointer-events-none absolute inset-0 z-0 rounded-2xl"
            style={{
              background: isOpen
                ? "linear-gradient(135deg, rgba(90,22,39,0.72), rgba(113,28,49,0.9))"
                : "linear-gradient(180deg, rgba(240,240,240,0.94), rgba(240,240,240,0.88))",
            }}
          />
          <div className="relative z-[1] flex flex-1 flex-col">
            <h3
              className={`mb-3.5 font-cinzel text-[15px] font-bold leading-[1.4] ${isOpen ? "text-white" : "text-[#711C31]"}`}
            >
              {card.title}
            </h3>
            <div
              className={`overflow-hidden font-seasons text-xs leading-[1.7] ${isOpen ? "max-h-[100px] opacity-100 text-white" : "max-h-0 opacity-0 text-[#711C31]"}`}
            >
              {card.sub}
            </div>
          </div>
          <div className="relative z-[1] mt-5 flex items-center justify-between">
            {card.href ? (
              <Link
                href={card.href}
                className={`cursor-pointer border-none bg-transparent p-0 font-seasons text-[11px] font-bold uppercase tracking-[1.5px] no-underline ${isOpen ? "text-white" : "text-[#711C31]"}`}
                onClick={(e) => e.stopPropagation()}
              >
                Read More
              </Link>
            ) : (
              <span
                className={`font-seasons text-[11px] font-bold uppercase tracking-[1.5px] ${isOpen ? "text-white" : "text-[#711C31]"}`}
              >
                Read More
              </span>
            )}
            {card.href ? (
              <Link
                href={card.href}
                aria-label={`Read more about ${card.title}`}
                className={`absolute flex h-[38px] w-[38px] items-center justify-center rounded-full border-[1.5px] border-[#b8955a] text-[19px] no-underline ${isOpen ? "left-[90px] right-auto rotate-0 bg-[#F0F0F0] text-[#711C31]" : "left-auto right-0 rotate-[320deg] bg-[#711C31] text-white"}`}
                onClick={(e) => e.stopPropagation()}
              >
                →
              </Link>
            ) : (
              <div
                className={`absolute flex h-[38px] w-[38px] items-center justify-center rounded-full border-[1.5px] border-[#b8955a] text-[19px] ${isOpen ? "left-[90px] right-auto rotate-0 bg-[#F0F0F0] text-[#711C31]" : "left-auto right-0 rotate-[320deg] bg-[#711C31] text-white"}`}
              >
                →
              </div>
            )}
          </div>
        </div>
      );
    });

  const statsData = homeStats.stats;

  const renderStatCard = (stat: (typeof statsData)[number], i: number, variant: 'mobile' | 'desktop') => (
    <div
      key={`${variant}-${i}-${stat.label}`}
      className={
        variant === 'mobile'
          ? 'relative flex w-[44vw] max-w-[200px] min-w-[180px] shrink-0 flex-col justify-center border-r-2 border-[#711C31] px-4 py-3.5 pb-5'
          : 'relative flex min-w-0 flex-1 flex-col justify-center px-3 py-3.5 pb-5 md:ml-10 xl:ml-[90px] xl:px-5'
      }
    >
      {variant === 'desktop' && i < statsData.length && (
        <div className="absolute left-0 top-1/2 h-[70%] w-0.5 -translate-y-1/2 bg-[#711C31]" />
      )}
      <div className="mb-2.5 h-9 w-9">
        <img
          src={mediaImageUrl(stat.iconUrl, { width: 72 }) || stat.iconUrl}
          alt={stat.label}
          width={36}
          height={36}
          loading="lazy"
          decoding="async"
          className="h-9 w-9 object-contain"
        />
      </div>
      <p className="mb-1.5 flex items-start gap-0.5 overflow-visible font-cinzel text-[36px] font-bold leading-none md:text-[32px] xl:text-[36px]">
        <span className="shrink-0 text-[#711C31] [text-shadow:0_0_1px_#E3D083,0_1px_0_rgba(0,0,0,0.2)]">{String(stat.value).replace(/\+$/, '')}</span>
        <span className="mt-1.5 shrink-0 text-[30px] font-black leading-none text-[#711C31] md:mt-1 md:text-[26px] xl:mt-1.5 xl:text-[30px] [-webkit-text-stroke:0.1px_rgba(255,213,47,0.6)] [text-shadow:0_0_2px_rgba(227,208,131,0.85)]">+</span>
      </p>
      <p className="font-seasons text-xs font-medium tracking-[0.03em] text-[#6b1228]">{stat.label}</p>
    </div>
  );

  return (
    <div className="flex flex-col">

      {/* ───────────────── All Styles (desktop unchanged + mobile additions) ───────────────── */}
      <style>{`

       @media (min-width: 426px) and (max-width: 769px) {

          body, html { overflow-x: hidden !important; max-width: 100vw !important; }

      }
        @keyframes carousel-scroll-smooth {
          0%   { transform: translate3d(0, 0, 0); }
          100% { transform: translate3d(calc(-1 * var(--carousel-shift, 0px)), 0, 0); }
        }

        .specialties-carousel-viewport {
          overflow: hidden;
          -webkit-backface-visibility: hidden;
          backface-visibility: hidden;
          transform: translateZ(0);
        }
        .specialties-track {
          display: flex;
          width: max-content;
          gap: 20px;
          will-change: transform;
          transform: translate3d(0, 0, 0);
          backface-visibility: hidden;
          -webkit-font-smoothing: antialiased;
        }
        .specialty-card {
          box-sizing: border-box;
          flex: 0 0 200px;
          width: 200px;
          min-width: 200px;
          max-width: 200px;
          backface-visibility: hidden;
          transition: width 0.45s cubic-bezier(0.4, 0, 0.2, 1),
            flex-basis 0.45s cubic-bezier(0.4, 0, 0.2, 1),
            min-width 0.45s cubic-bezier(0.4, 0, 0.2, 1),
            max-width 0.45s cubic-bezier(0.4, 0, 0.2, 1),
            background-color 0.3s ease;
        }
        .specialty-card.is-open {
          flex: 0 0 290px;
          width: 290px;
          min-width: 290px;
          max-width: 290px;
        }
        @keyframes marquee-vertical {
          0%   { transform: translateY(0); }
          100% { transform: translateY(-50%); }
        }
        @keyframes blog-scroll {
          0%   { transform: translateX(0); }
          100% { transform: translateX(calc(-1 * var(--blog-shift, 0px))); }
        }
        @keyframes reviews-scroll {
          0%,   24% { transform: translateX(0%);   }
          33%,  57% { transform: translateX(-25%); }
          66%,  90% { transform: translateX(-50%); }
          100%      { transform: translateX(-75%); }
        }
        @keyframes reviews-scroll-mobile {
          0%,   24% { transform: translateX(0px); }
          33%,  57% { transform: translateX(calc(-1 * (100vw))); }
          66%,  90% { transform: translateX(calc(-2 * (100vw))); }
          99.9%     { transform: translateX(calc(-3 * (100vw))); }
          100%      { transform: translateX(0px); }
        }
        @keyframes dots-scroll {
          0%,   24% { transform: translateX(0px);  }
          33%,  57% { transform: translateX(18px); }
          66%,  90% { transform: translateX(36px); }
          99.9%     { transform: translateX(36px); opacity: 0; }
          100%      { transform: translateX(0px);  opacity: 1; }
        }
        @keyframes stats-scroll {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }

        @keyframes hero-title-in {
          from { opacity: 0; transform: translateY(22px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes hero-subtitle-in {
          from { opacity: 0; transform: translateY(16px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes hero-card-in {
          from { opacity: 0; transform: translateY(32px) scale(0.94); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
        @keyframes hero-doctor-rise {
          from { opacity: 0; transform: translateY(56px); }
          to { opacity: 1; transform: translateY(0); }
        }

        @keyframes hero-cursor-blink {
          0%, 49% { opacity: 1; }
          50%, 100% { opacity: 0; }
        }

        @media (max-width: 767px) {
          .hero-mobile-title {
            animation: hero-title-in 0.85s cubic-bezier(0.22, 1, 0.36, 1) both;
          }
          .hero-mobile-subtitle {
            animation: hero-subtitle-in 0.85s cubic-bezier(0.22, 1, 0.36, 1) 0.15s both;
          }
          .hero-mobile-card-1 {
            animation: hero-card-in 0.8s cubic-bezier(0.22, 1, 0.36, 1) 0.28s both;
          }
          .hero-mobile-card-2 {
            animation: hero-card-in 0.8s cubic-bezier(0.22, 1, 0.36, 1) 0.4s both;
          }
          .hero-doctor-wrap {
            animation: hero-doctor-rise 1s cubic-bezier(0.22, 1, 0.36, 1) 0.35s both;
          }
          .hero-section {
            padding-bottom: 0 !important;
          }
          .hero-doctor-panel {
            bottom: 0 !important;
            max-height: 100%;
            right: 10px !important;
          }
          .hero-content-col {
            max-width: 100%;
            padding-right: 42%;
          }
          .hero-cards-wrap {
            max-width: 56%;
            margin-top: 2px !important;
            position: relative;
            top: -8px;
          }
          .hero-mobile-subtitle {
            margin-bottom: 8px !important;
          }
          .hero-mobile-title .hero-title-main-line {
            display: block;
            white-space: nowrap;
          }
          .hero-mobile-title .hero-title-accent-line {
            display: block;
            color: #d3d3d3;
            margin-top: 2px;
          }
        }

        @media (max-width: 360px) {
          .hero-mobile-title {
            font-size: 19px !important;
            line-height: 1.15 !important;
          }
          .hero-mobile-title .hero-title-accent-line {
            font-size: 21px !important;
          }
          .hero-mobile-subtitle {
            font-size: 10.5px !important;
            line-height: 1.45 !important;
          }
          .hero-content-col {
            padding-right: 50% !important;
          }
          .hero-cards-wrap {
            transform: scale(0.52) !important;
            transform-origin: bottom left;
            max-width: 46% !important;
            margin-left: -8px !important;
            margin-right: 12px !important;
          }
          .hero-doctor-panel {
            width: 33% !important;
            height: 248px !important;
            right: 4px !important;
          }
          .hero-doctor-img {
            transform: scale(1.12) !important;
            transform-origin: bottom right !important;
          }
        }

        @media (max-width: 320px) {
          .hero-section {
            padding-top: 82px !important;
            padding-bottom: 12px !important;
          }
          .hero-mobile-title {
            margin-top: 14px !important;
            margin-bottom: 10px !important;
          }
          .hero-mobile-subtitle {
            margin-bottom: 8px !important;
          }
          .hero-cards-wrap {
            transform: none !important;
            zoom: 0.52;
            margin-top: 2px !important;
            top: -8px;
            margin-bottom: 0 !important;
            margin-left: -8px !important;
            max-width: 46% !important;
          }
          .hero-content-col {
            padding-bottom: 2px !important;
          }
          .hero-doctor-panel {
            height: 270px !important;
            width: 34% !important;
            right: -2px !important;
          }
          .hero-doctor-img {
            transform: scale(1.15) !important;
            transform-origin: bottom right !important;
          }
        }

        @media (min-width: 361px) and (max-width: 389px) {
          .hero-mobile-title {
            font-size: 21px !important;
          }
          .hero-mobile-title .hero-title-accent-line {
            font-size: 23px !important;
          }
          .hero-mobile-subtitle {
            font-size: 11.5px !important;
          }
          .hero-content-col {
            padding-right: 46% !important;
          }
          .hero-cards-wrap {
            transform: scale(0.54) !important;
            transform-origin: bottom left;
            max-width: 47% !important;
            margin-left: -5px !important;
            margin-right: 10px !important;
          }
          .hero-doctor-panel {
            width: 37% !important;
            height: 282px !important;
            right: 6px !important;
          }
          .hero-doctor-img {
            transform: scale(1.16) !important;
            transform-origin: bottom right !important;
          }
        }

        @media (min-width: 390px) and (max-width: 429px) {
          .hero-mobile-title {
            font-size: 23px !important;
          }
          .hero-mobile-title .hero-title-accent-line {
            font-size: 25px !important;
          }
          .hero-mobile-subtitle {
            font-size: 12px !important;
          }
          .hero-content-col {
            padding-right: 45% !important;
          }
          .hero-doctor-panel {
            width: 36% !important;
            height: 304px !important;
            right: 8px !important;
          }
          .hero-cards-wrap {
            transform: scale(0.6) !important;
            transform-origin: bottom left;
            max-width: 48% !important;
            margin-left: -4px !important;
            margin-right: 10px !important;
          }
          .hero-doctor-img {
            transform: scale(1.18) !important;
            transform-origin: bottom right !important;
          }
        }

        @media (min-width: 430px) and (max-width: 450px) {
          .hero-content-col {
            padding-right: 46% !important;
          }
          .hero-cards-wrap {
            transform: scale(0.62) !important;
            transform-origin: bottom left;
            max-width: 49% !important;
            margin-left: -3px !important;
            margin-right: 12px !important;
          }
          .hero-doctor-panel {
            width: 35% !important;
            height: 306px !important;
            right: 10px !important;
          }
          .hero-doctor-img {
            transform: scale(1.16) !important;
            transform-origin: bottom right !important;
          }
        }

        @media (min-width: 430px) and (max-width: 767px) {
          .hero-mobile-title {
            font-size: 26px !important;
          }
          .hero-mobile-title .hero-title-accent-line {
            font-size: 28px !important;
          }
          .hero-mobile-subtitle {
            font-size: 13px !important;
          }
        }

        @media (min-width: 451px) and (max-width: 767px) {
          .hero-doctor-panel {
            width: 40% !important;
            height: 330px !important;
            right: 12px !important;
          }
        }

        @media (max-width: 639px) and (min-width: 451px) {
          .hero-cards-wrap {
            transform: scale(0.7);
            transform-origin: bottom left;
          }
        }

        @media (min-width: 640px) and (max-width: 767px) {
          .hero-cards-wrap {
            transform: scale(0.82);
            transform-origin: bottom left;
            max-width: 58%;
          }
          .hero-doctor-panel {
            height: 358px !important;
          }
        }

        @media (min-width: 768px) {
          .hero-cards-wrap {
            transform: none !important;
            max-width: none !important;
          }
          .hero-content-col {
            padding-right: 0 !important;
          }
        }

        .reviews-section:hover .reviews-track,
        .reviews-section:hover .active-dot-indicator {
          animation-play-state: paused;
        }
        .reviews-track {
          display: flex;
          gap: 0px;
          width: max-content;
          will-change: transform;
          animation: reviews-scroll 16s linear infinite;
        }

        /* Wrappers — center about + reviews without changing inner design */
        .about-scale-wrap {
          width: 100%;
          display: flex;
          justify-content: center;
          margin-top: 80px;
        }
        .reviews-scale-wrap {
          width: 100%;
          display: flex;
          justify-content: center;
        }

        /*
          TABLET FIX (769px–1024px) — About & Reviews
          Real tablet-sized dimensions (no zoom scaling) so text/cards reflow properly.
        */
        @media (min-width: 769px) and (max-width: 1024px) {
          body, html { overflow-x: hidden !important; max-width: 100vw !important; }

          /* ---------- ABOUT / DOCTOR CARD ---------- */
          .about-scale-wrap {
            display: block;
            width: 100%;
            max-width: 100%;
            margin: 60px auto 0;
            zoom: 1;
          }

          .about-scale-wrap .about-section {
            width: calc(100% - 48px) !important;
            max-width: 920px !important;
            height: auto !important;
            min-height: 460px !important;
            margin: 0 auto !important;
            position: relative !important;
            left: auto !important;
            top: auto !important;
            transform: none !important;
            border-radius: 20px !important;
          }

          .about-inner {
            display: flex !important;
            min-height: 460px !important;
          }

          .about-left {
            flex: 0 0 60% !important;
            padding: 40px 28px 40px 36px !important;
          }

          .about-left h2 {
            font-size: 20px !important;
            margin-bottom: 20px !important;
          }

          .about-left p {
            font-size: 15px !important;
            line-height: 1.55 !important;
            margin-bottom: 18px !important;
            text-indent: 1.5em !important;
          }

          .about-left button {
            font-size: 13px !important;
            padding: 10px 24px !important;
          }

          .about-doc-img-desktop {
            width: 42% !important;
          }

          /* ---------- REVIEWS CARDS ---------- */
          .reviews-section {
            padding: 50px 0 10px !important;
            overflow: hidden !important;
          }

          .reviews-scale-wrap {
            display: flex !important;
            justify-content: center !important;
            width: 100% !important;
            max-width: 100% !important;
            margin: 0 auto !important;
            zoom: 1;
          }

          .reviews-container-wrapper {
            width: 840px !important;
            max-width: calc(100% - 48px) !important;
            overflow: hidden !important;
            margin: 0 auto !important;
          }

          .reviews-track {
            animation: reviews-scroll 16s linear infinite !important;
            width: max-content !important;
            gap: 0 !important;
          }

          .reviews-track > div.reviews-grid {
            display: grid !important;
            grid-template-columns: repeat(3, 280px) !important;
            grid-template-rows: 240px 235px !important;
            width: 840px !important;
            min-width: 840px !important;
            max-width: 840px !important;
            padding: 0 !important;
            gap: 0 !important;
            flex-shrink: 0 !important;
            box-sizing: border-box !important;
            justify-items: center !important;
          }

          .reviews-track > div.reviews-grid > div {
            width: 260px !important;
            height: 220px !important;
            min-width: 260px !important;
            max-width: 260px !important;
            min-height: 220px !important;
            padding: 16px 14px !important;
            box-sizing: border-box !important;
            overflow: hidden !important;
          }

          .reviews-track > div.reviews-grid > div p {
            font-size: 11px !important;
            line-height: 1.35 !important;
            display: -webkit-box !important;
            -webkit-line-clamp: 6 !important;
            -webkit-box-orient: vertical !important;
            overflow: hidden !important;
          }

          .reviews-track > div.reviews-grid > div span {
            font-size: 11.5px !important;
          }

          .reviews-track > div.reviews-grid > div > div:first-child {
            font-size: 16px !important;
            letter-spacing: 2px !important;
          }

          .reviews-track > div.reviews-grid > div h2 {
            font-size: 16px !important;
            margin-bottom: 10px !important;
          }

          .reviews-track > div.reviews-grid > div img {
            width: 88px !important;
            height: 88px !important;
          }
        }

        @media (min-width: 1025px) and (max-width: 1249px) {
          body, html { overflow-x: hidden !important; max-width: 100vw !important; }

          .about-scale-wrap {
            display: block;
            width: 1150px;
            max-width: none;
            margin: 80px auto 0;
            zoom: calc((100vw - 48px) / 1150);
          }
          .about-scale-wrap .about-section {
            width: 1150px !important;
            max-width: none !important;
            height: 640px !important;
            min-height: 640px !important;
            margin: 0 !important;
            position: relative !important;
            left: auto !important;
            transform: none !important;
            border-radius: 20px !important;
          }

          .reviews-section {
            padding: 60px 0 10px !important;
            overflow: hidden !important;
          }
          .reviews-scale-wrap {
            display: block;
            width: 1194px;
            max-width: none;
            margin: 0 auto;
            zoom: calc((100vw - 48px) / 1194);
          }
          .reviews-container-wrapper {
            width: 1194px !important;
            max-width: none !important;
            overflow: hidden !important;
            margin: 0 !important;
            position: relative !important;
            left: auto !important;
            transform: none !important;
          }
          .reviews-track > div.reviews-grid {
            display: grid !important;
            grid-template-columns: repeat(3, 388px) !important;
            grid-template-rows: 305px 300px !important;
            width: 1194px !important;
            min-width: 1194px !important;
            max-width: 1194px !important;
            padding: 0 0 0 30px !important;
            flex-shrink: 0 !important;
          }
          .reviews-track > div.reviews-grid > div {
            width: 360px !important;
            height: 280px !important;
          }
          .reviews-track {
            animation: reviews-scroll 16s linear infinite !important;
            width: max-content !important;
          }
        }

        /* Wide desktop: full native size, centered */
        @media (min-width: 1250px) {
          .about-scale-wrap {
            display: flex;
            justify-content: center;
            width: 100%;
            margin-top: 80px;
            zoom: 1;
          }
          .about-section {
            width: 1150px !important;
            max-width: 95% !important;
            height: 640px !important;
            margin-left: auto !important;
            margin-right: auto !important;
            position: relative !important;
            left: auto !important;
            transform: none !important;
          }
          .reviews-section {
            padding: 60px 0 10px !important;
          }
          .reviews-scale-wrap {
            display: flex;
            justify-content: center;
            width: 100%;
            zoom: 1;
          }
          .reviews-container-wrapper {
            width: 1194px !important;
            max-width: 100% !important;
            overflow: hidden !important;
            margin-left: auto !important;
            margin-right: auto !important;
            position: relative !important;
            left: auto !important;
            transform: none !important;
          }
        }


        /* ── DESKTOP GUARD: doctor image on the right, never in text flow ── */
        @media (min-width: 769px) {
          .about-doc-img-desktop {
            display: block !important;
            position: absolute !important;
            right: 0 !important;
            bottom: 0 !important;
            width: 46% !important;
            height: 100% !important;
            z-index: 4 !important;
            pointer-events: none !important;
          }
          .about-doc-img-mobile { display: none !important; }
        }

        /* ── MOBILE (≤768px) ── */
        
        @media (max-width: 768px) {

          /* prevent full-page horizontal overflow */
          body, html { overflow-x: hidden !important; max-width: 100vw !important; }

          /* ── ABOUT / DOCTOR SECTION ── */
          .about-section {
            width: calc(100% - 28px) !important;
            max-width: 100% !important;
            margin-left: 14px !important;
            margin-right: 14px !important;
            margin-top: 0 !important;
            border-radius: 16px !important;
            height: 320px !important;
            overflow: hidden !important;
            position: relative !important;
            transform: none !important;
          }
          .about-inner {
            flex-direction: row !important;
            min-height: unset !important;
            height: 100% !important;
          }
          .about-left {
            flex: 0 0 58% !important;
            width: 58% !important;
            padding: 22px 10px 20px 18px !important;
            justify-content: flex-start !important;
            z-index: 3 !important;
          }
          .about-left > div:first-child { margin-bottom: 8px !important; }
          .about-left > div:first-child span { font-size: 11px !important; }
          .about-left h2 {
            font-size: 13px !important;
            margin-bottom: 10px !important;
            line-height: 1.3 !important;
          }
          .about-left p {
            font-size: 10.5px !important;
            line-height: 1.5 !important;
            margin-bottom: 10px !important;
            text-indent: 0 !important;
            display: -webkit-box !important;
            -webkit-line-clamp: 4 !important;
            -webkit-box-orient: vertical !important;
            overflow: hidden !important;
          }
          .about-left p:last-of-type { display: none !important; }
          .about-left button { font-size: 10px !important; padding: 7px 14px !important; }
          .about-doc-img-desktop { display: none !important; }
          .about-doc-img-mobile {
            display: block !important;
            position: absolute !important;
            right: 0 !important;
            bottom: 0 !important;
            width: 44% !important;
            height: 100% !important;
            z-index: 4 !important;
            pointer-events: none !important;
          }

          @media (max-width: 768px) {

  /* hide last row cards */
  .reviews-track > div > div:nth-child(4),
  .reviews-track > div > div:nth-child(5) {
    display: none !important;
  }
}
          .reviews-section {
            padding: 60px 0px 16px !important;
            overflow: hidden !important;
          }
          .reviews-container-wrapper {
            overflow: hidden !important;
            width: 100% !important;
            margin: 0 !important;
            padding: 0 !important;
          }
          /* Switch track to mobile per-slide animation */
          .reviews-track {
            animation: reviews-scroll-mobile 15s linear infinite !important;
            gap: 0px !important;
            width: max-content !important;
          }
          /* Each "set" div becomes one full-viewport-width slide */
          .reviews-track > div {
            display: grid !important;
            grid-template-columns: 1fr 1fr !important;
            grid-template-rows: auto auto !important;
            gap: 12px !important;
            width: 100vw !important;
            min-width: 100vw !important;
            max-width: 100vw !important;
            box-sizing: border-box !important;
            flex-shrink: 0 !important;
            overflow: hidden !important;
            padding: 0 16px !important;
          }
          /* Adjust grid for max 4 cards (plus title card) */
          /* Since the prompt asks for max 4 cards in a row, but mobile is 2x2, we ensure cards are well spaced */
          .reviews-track > div > div {
            width: 100% !important;
            min-width: 0 !important;
            max-width: 100% !important;
            height: auto !important;
            min-height: 140px !important;
            max-height: none !important;
            padding: 14px !important;
            box-sizing: border-box !important;
            border-radius: 14px !important;
            border-top-left-radius: 14px !important;
            border-top-right-radius: 14px !important;
            border-bottom-left-radius: 14px !important;
            border-bottom-right-radius: 14px !important;
          }
          /* Text inside cards */
          .reviews-track > div > div p {
            font-size: 11px !important;
            line-height: 1.45 !important;
            margin: 5px 0 !important;
            text-indent: 0 !important;
            margin-left: 0 !important;
            display: -webkit-box !important;
            -webkit-line-clamp: 4 !important;
            -webkit-box-orient: vertical !important;
            overflow: hidden !important;
          }
          .reviews-track > div > div span {
            font-size: 11px !important;
            margin-left: 0 !important;
            letter-spacing: 0 !important;
          }
          .reviews-track > div > div > div:first-child {
            font-size: 12px !important;
            margin-bottom: 4px !important;
            margin-left: 0 !important;
            letter-spacing: 1px !important;
          }
          /* Title card (first child) — spans both columns */
          .reviews-track > div > div:first-child {
            grid-column: 1 / 0 !important;
            display: flex !important;
            flex-direction: row !important;
            align-items: center !important;
            justify-content: center !important;
            gap: 12px !important;
            padding: 10px 14px !important;
            min-height: unset !important;
            height: auto !important;
            width: 100% !important;
            max-width: 100% !important;
          }
          .reviews-track > div > div:first-child h2 {
            font-size: 14px !important;
            margin: 0 !important;
            text-align: center !important;
            line-height: 1.2 !important;
          }
          .reviews-track > div > div:first-child img {
            width:  86px !important;
            height: 86px !important;
            flex-shrink: 0 !important;
            margin-top:12px !important;
          }

          /* ── BLOG ── */
         /* ── BLOG ── */
.blog-header {
  padding: 0 20px !important;
  margin-left: 0 !important;
  margin-bottom: 30px !important;
}
.blog-header h2  { font-size: 22px !important; }
.blog-header p   { font-size: 15px !important; }

.blog-track {
  padding-left: 14px !important;
  gap: 12px !important;
}

.blog-track .blog-card-wrapper {
  width: 165px !important;
  min-width: 205px !important;
  max-width: 195px !important;
  height: 240px !important;
  min-height: 240px !important;
  max-height: 240px !important;
  padding: 8px 8px 14px !important;
  border-radius: 14px !important;
  flex-shrink: 0 !important;
  overflow: hidden !important;
  display: flex !important;
  flex-direction: column !important;
}

.blog-track .blog-card-wrapper .blogimg {
  height: 9px !important;
  min-height: 95px !important;
  max-height: 95px !important;
  flex-shrink: 0 !important;
  border-radius: 10px !important;
  margin-bottom: 14px !important;
}

.blog-track .blog-card-wrapper p {
  font-size: 10px !important;
  margin-bottom: 8px !important;
  flex-shrink: 0 !important;
}

.blog-track .blog-card-wrapper h3 {
  font-size: 11px !important;
  line-height: 1.35 !important;
  flex: 1 !important;
  min-height: 0 !important;
  overflow: hidden !important;
  display: -webkit-box !important;
  -webkit-line-clamp: 3 !important;
  -webkit-box-orient: vertical !important;
  align-self: flex-start !important;
}

.blog-track .blog-card-footer,
.blog-track .blog-card-wrapper > div:last-child {
  flex: 0 0 auto !important;
  justify-content: flex-start !important;
  align-items: stretch !important;
  margin-top: 6px !important;
}

.blog-track .blog-card-footer-row {
  min-height: 0 !important;
  gap: 10px !important;
  padding-left: 4px !important;
  padding-right: 2px !important;
  align-items: flex-end !important;
  justify-content: space-between !important;
}

.blog-track .blog-card-footer-row > div:last-child {
  width: 30px !important;
  height: 30px !important;
  font-size: 15px !important;
  flex-shrink: 0 !important;
  transform: none !important;
  margin-right: 0 !important;
  margin-bottom: 2px !important;
}

          /* ── FAQ ── */
          .faq-inner {
            flex-direction: column !important;
            gap: 32px !important;
            padding: 0 20px !important;
            margin-right: 0 !important;
            margin-top: -90px !important;
           
          }
          .faq-inner > div:first-child { flex: unset !important; }
          .faq-inner > div:first-child h2 { font-size: 22px !important; }
          .faq-inner > div:first-child p  { font-size: 15px !important; }
        }

        /* ── MOBILE about/reviews scale wrap reset ── */
        @media (max-width: 768px) {
          .about-scale-wrap {
            display: block;
            margin-top: 24px;
            height: auto;
            width: 100%;
            zoom: 1;
          }
          .reviews-scale-wrap {
            display: block;
            height: auto;
            width: 100%;
            zoom: 1;
          }
        }
      `}</style>

      {/* ───────────────── Hero Section ───────────────── */}
      <section
        className="
          hero-section
          relative flex overflow-hidden bg-[#5c0d2a] font-seasons
          flex-col items-start px-3.5 pt-[86px] pb-0
          sm:px-5 sm:pt-[100px]
          md:min-h-[520px] md:flex-row md:items-center md:px-6 md:pt-[140px] md:pb-[30px]
          lg:px-[60px] lg:pt-16 lg:pb-10
        "
      >
        <picture>
          {/\.(png|jpe?g)$/i.test(hero.backgroundImageUrl || "") ? (
            <source
              srcSet={(hero.backgroundImageUrl || "").replace(/\.(png|jpe?g)$/i, ".webp")}
              type="image/webp"
            />
          ) : null}
          <img
            src={hero.backgroundImageUrl || "/images/bg.png"}
            alt=""
            fetchPriority="high"
            decoding="async"
            width={1920}
            height={1080}
            className="pointer-events-none absolute inset-0 z-0 h-full w-full object-cover object-center"
            aria-hidden
          />
        </picture>
        {/* Mobile-only gradient for readability */}
        <div
          className="pointer-events-none absolute inset-0 z-[1] bg-gradient-to-b from-[#2a0612]/75 via-[#5c0d2a]/45 to-[#5c0d2a]/20 md:hidden"
          aria-hidden
        />

        <div className="hero-content-col relative z-10 flex w-full flex-col max-md:pb-1 md:max-w-[520px] md:pr-0">
          <h1
            className="
              hero-mobile-title
              font-cinzel mb-1.5 mt-4 w-full text-left font-bold uppercase leading-[1.12] tracking-[0.02em] text-white
              sm:mb-2 sm:mt-5
              md:mb-8 md:mt-0 md:max-w-none md:translate-y-0 md:text-left md:text-[34px]
              lg:translate-y-[90px]
            "
          >
            <span className="md:hidden">
              <span className="hero-title-main-line">{hero.titleMobileMain}</span>
              <span className="hero-title-accent-line">{hero.titleMobileAccent}</span>
            </span>
            <span className="hidden md:inline">
              {hero.titleDesktop}{" "}
              <span className="text-[#D3D3D3] md:text-[34px]">
                {hero.titleDesktopAccent}
              </span>
            </span>
          </h1>

          <p
            className="
              hero-mobile-subtitle
              mb-3 w-full text-left font-light leading-[1.5] tracking-[0.01em] text-white/90
              sm:mb-4
              md:mb-11 md:max-w-[420px] md:text-left md:translate-y-0 md:text-[17px] md:leading-relaxed
              lg:translate-y-[70px]
            "
          >
            <span className="md:hidden">
              {hero.subtitleMobileLine1}
              <br />
              {hero.subtitleMobileLine2}
            </span>
            <span className="hidden md:inline">{hero.subtitleDesktop}</span>
          </p>

          {/* Cards — same markup as tablet; scaled on mobile via CSS */}
          <div className="hero-cards-wrap relative z-20 mt-3 flex items-end gap-3.5 max-md:mb-0 md:mt-5 md:ml-0 lg:mt-8 lg:translate-y-4 xl:mt-0 xl:translate-y-0 xl:ml-[470px]">
            {/* Card 1 — Subscribe */}
            <div className="hero-mobile-card-1 relative z-50 flex min-h-[180px] w-[183px] shrink-0 flex-col items-center justify-end overflow-hidden rounded-2xl border-[1.5px] border-white bg-[#5c0d2a] p-2.5">
              <div
                className="absolute inset-0 z-0 bg-cover bg-center opacity-45"
                style={{
                  backgroundImage: `url(${mediaImageUrl(hero.subscribeCardBgUrl, { width: 400 })})`,
                }}
              />
              <div className="relative z-[1] mb-[18px] w-full rounded-[10px] bg-[#F0F0F0] px-3 pb-[18px] pt-3.5">
                <div className="absolute bottom-[-14px] right-0 h-0 w-0 border-t-[26px] border-r-[2px] border-l-[19px] border-t-[#F0F0F0] border-r-transparent border-l-transparent" />
                {heroSubscribeOpen ? (
                  <div className="flex flex-col gap-2">
                    <input
                      type="email"
                      value={heroSubscribeEmail}
                      onChange={(e) => setHeroSubscribeEmail(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          void handleHeroSubscribe();
                        }
                      }}
                      placeholder="Votre email"
                      disabled={heroSubscribing}
                      className="w-full rounded-md border border-[#6b1228]/25 bg-white px-2 py-1.5 text-center font-seasons text-[11px] text-[#6b1228] outline-none"
                      autoFocus
                    />
                    {heroSubscribeFeedback ? (
                      <p
                        role="alert"
                        className="m-0 text-center text-[10px] leading-tight"
                        style={{
                          color:
                            heroSubscribeFeedback.type === "success"
                              ? "#2f6b3a"
                              : "#b91c1c",
                        }}
                      >
                        {heroSubscribeFeedback.message}
                      </p>
                    ) : null}
                  </div>
                ) : (
                  <p className="m-0 text-center font-seasons text-[13px] font-semibold leading-[1.55] text-[#6b1228]">
                    {hero.subscribeCardText.split("\n").map((line, i, arr) => (
                      <span key={`${line}-${i}`}>
                        {line}
                        {i < arr.length - 1 ? <br /> : null}
                      </span>
                    ))}
                  </p>
                )}
              </div>
              {heroSubscribeOpen ? (
                <div className="relative z-[1] -translate-y-2.5 flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => void handleHeroSubscribe()}
                    disabled={heroSubscribing}
                    className="cursor-pointer rounded-full border-none bg-[#F0F0F0] px-3 py-[7px] font-seasons text-[11px] font-semibold tracking-[0.02em] text-[#6b1228] disabled:opacity-70"
                  >
                    {heroSubscribing ? "…" : "OK"}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setHeroSubscribeOpen(false);
                      setHeroSubscribeFeedback(null);
                      setHeroSubscribeEmail("");
                    }}
                    disabled={heroSubscribing}
                    className="cursor-pointer rounded-full border border-[#F0F0F0]/70 bg-transparent px-2.5 py-[6px] font-seasons text-[11px] font-semibold text-[#F0F0F0]"
                  >
                    ✕
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => {
                    setHeroSubscribeOpen(true);
                    setHeroSubscribeFeedback(null);
                  }}
                  className="relative z-[1] -translate-y-2.5 cursor-pointer rounded-full border-none bg-[#F0F0F0] px-[22px] py-[7px] font-seasons text-xs font-semibold tracking-[0.02em] text-[#6b1228]"
                >
                  {hero.subscribeButtonLabel}
                </button>
              )}
            </div>

            {/* Card 2 — Reservation */}
            <Link
              href={hero.bookingCardHref || "/pages/Appointment"}
              className="hero-mobile-card-2 relative z-50 block shrink-0"
            >
              <div className="relative z-50 flex min-h-[180px] w-[182px] cursor-pointer flex-col items-center justify-center gap-3.5 rounded-2xl border-[1.5px] border-white bg-[#898989] px-[18px] pb-5 pt-[22px] shadow-xl">
                <div className="relative flex h-[70px] w-[70px] items-center justify-center">
                  <Image
                    src={mediaImageUrl(hero.bookingCardIconUrl, { width: 140 })}
                    alt="Dental care"
                    fill
                    sizes="70px"
                    className="translate-y-1 scale-190 object-contain object-bottom"
                    loading="lazy"
                  />
                  <div className="absolute -bottom-[11px] right-0 flex h-[22px] w-[22px] items-center justify-center rounded-full bg-[#711C31] text-lg font-bold leading-none text-white shadow-[0_1px_4px_rgba(0,0,0,0.25)]">
                    +
                  </div>
                </div>
                <p className="m-0 text-center font-seasons text-sm font-bold leading-[1.4] text-[#3d0a1e]">
                  {hero.bookingCardText}
                </p>
              </div>
            </Link>
          </div>
        </div>

        {/* Doctor — mobile only */}
        <div className="hero-doctor-panel pointer-events-none absolute bottom-0 right-0 z-[5] flex w-[44%] items-end justify-end bg-transparent md:hidden">
          <div className="hero-doctor-wrap relative h-full w-full bg-transparent">
            <img
              src={heroDoctorSrc}
              alt={hero.doctorImageAlt}
              className="hero-doctor-img absolute inset-0 h-full w-full bg-transparent object-contain object-bottom scale-[1.22] sm:scale-[1.24]"
              decoding="async"
              fetchPriority="high"
              loading="eager"
              style={{ imageRendering: "auto", backfaceVisibility: "hidden" }}
              onError={(e) => {
                const el = e.currentTarget;
                if (el.src.includes("/images/udrimage.png")) return;
                el.src = "/images/udrimage.png";
              }}
            />
          </div>
        </div>

        {/* Doctor — tablet & desktop (unchanged) */}
        <div className="pointer-events-none relative z-0 hidden flex-1 items-end justify-end self-stretch bg-transparent md:flex">
          <div className="relative h-[460px] w-[380px] bg-transparent">
            <img
              src={heroDoctorSrc}
              alt={hero.doctorImageAlt}
              className="absolute inset-0 h-full w-full translate-y-1 scale-[1.30] bg-transparent object-contain object-bottom"
              decoding="async"
              fetchPriority="high"
              loading="eager"
              style={{ imageRendering: "auto", backfaceVisibility: "hidden" }}
              onError={(e) => {
                const el = e.currentTarget;
                if (el.src.includes("/images/udrimage.png")) return;
                el.src = "/images/udrimage.png";
              }}
            />
          </div>
        </div>
      </section>

      {/* ───────────────── Stats Section ───────────────── */}
      <section className="w-full bg-white font-seasons">
        <div className="max-w-full px-5 pt-10 pb-5 md:px-6 lg:max-w-[700px] lg:px-[88px] lg:pt-16 lg:pb-8">
          <h2 className="mb-3.5 font-cinzel text-[22px] font-semibold uppercase leading-[1.3] tracking-[0.08em] text-[#5A1628] md:text-[29px]">
            {homeStats.title}
          </h2>
          <p className="max-w-[620px] font-seasons text-[15px] font-medium leading-[1.75] text-[#4a3728] md:text-[17px] whitespace-pre-line">
            {homeStats.body}
          </p>
        </div>
        <div className="overflow-hidden border border-[#753141] bg-[#f0f0f0]">
          {/* Mobile: scrolling duplicate row — hidden from md (768px) up */}
          <div className="flex w-max flex-nowrap items-stretch will-change-transform animate-[stats-scroll_12s_linear_infinite] hover:[animation-play-state:paused] md:hidden">
            {[...statsData, ...statsData].map((stat, i) => renderStatCard(stat, i, 'mobile'))}
          </div>
          {/* Tablet & desktop: single row — same from md (768px) up */}
          <div className="hidden items-stretch md:flex">
            {statsData.map((stat, i) => renderStatCard(stat, i, 'desktop'))}
          </div>
        </div>
      </section>

      {/* ───────────────── Card Carousel Section ───────────────── */}
      <section ref={carouselSectionRef} className="overflow-hidden bg-white py-10 font-seasons">
        <div className="mb-6 max-w-[900px] px-5 md:px-6 lg:mb-10 lg:px-20">
          <h2 className="mb-2 font-cinzel text-[22px] font-semibold text-[#5A1628] md:text-[29px]">
            Nos spécialités
          </h2>
        </div>
        <div className="w-full overflow-hidden">
          {carouselInView && carouselCards.length > 0 ? (
            <>
          {/* Mobile & tablet — rAF integer-pixel marquee (no CSS animation shake) */}
          <div className="specialties-carousel-viewport w-full lg:hidden">
            <div ref={carouselTrackRef} className="specialties-track">
              {renderSpecialityCards("touch")}
            </div>
          </div>

          {/* Desktop — same rAF transform */}
          <div
            className="specialties-carousel-viewport hidden w-full lg:block"
            onMouseLeave={() => {
              setOpenIndex(null);
              setIsCarouselPaused(false);
            }}
          >
            <div ref={carouselDesktopTrackRef} className="specialties-track">
              {renderSpecialityCards("desktop")}
            </div>
          </div>
            </>
          ) : (
            <div className="min-h-[200px]" aria-hidden />
          )}
        </div>
      </section>

      {/* ───────────────── About / Doctor Section ───────────────── */}
      <div className="about-scale-wrap">
      <section
        ref={aboutSectionRef}
        className="about-section"
        style={{ background: 'linear-gradient(15deg, #5c0d2a 0%, #5c0d2a 10%, #5c0d2a 100%)', height: '640px', width: '1150px', maxWidth: '95%', marginTop: '0', marginLeft: 'auto', marginRight: 'auto', borderRadius: '20px', position: 'relative', overflow: 'hidden' }}
      >
        <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse at 30% 50%, transparent 40%, rgba(0,0,0,0.35) 100%)', zIndex: 1, pointerEvents: 'none' }} />
        <div className="about-inner" style={{ display: 'flex', minHeight: '220px', position: 'relative', zIndex: 2 }}>
          <div className="about-left" style={{ flex: '0 0 62%', padding: '60px 56px 60px 64px', display: 'flex', flexDirection: 'column', justifyContent: 'center', position: 'relative', zIndex: 3 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
              <div style={{ width: '36px', height: '1.5px', background: '#FFFFFF' }} />
              <span style={{ color: '#FFFFFF', fontSize: '14px', fontStyle: 'italic', letterSpacing: '0.04em', fontFamily: "var(--font-seasons-reg)" }}>{homeAbout.eyebrow}</span>
            </div>
            <h2 style={{ color: '#FFFFFF', fontSize: 'clamp(22px, 2.5vw, 24px)', fontWeight: 700, lineHeight: 1.2, marginBottom: '28px', fontFamily: "var(--font-cinzel)", letterSpacing: '0.01em', display: 'inline-block', maxWidth: '100%' }}>
              {homeAbout.title}
            </h2>
            <p style={{ color: '#FFFFFF', fontSize: '20px', lineHeight: 1.35, marginBottom: '28px', fontWeight: 400, textIndent: '2.5em' }}>
              {homeAbout.paragraph1}
            </p>
            <p style={{ color: '#FFFFFF', fontSize: '20px', lineHeight: 1.35, marginBottom: '44px', fontFamily: "var(--font-seasons-reg)", fontWeight: 400, textIndent: '2.5em' }}>
              {homeAbout.paragraph2}
            </p>
            <div>
              <Link href={homeAbout.buttonHref || "/pages/Appointment"}>
                <button
                  style={{ background: 'transparent', border: '1.5px solid #FFFFFF', color: '#FFFFFF', padding: '12px 30px', borderRadius: '999px', fontSize: '14px', fontFamily: "var(--font-seasons-reg)", fontWeight: 500, letterSpacing: '0.04em', cursor: 'pointer', transition: 'background 0.3s, color 0.3s' }}
                  onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = '#591727'; (e.currentTarget as HTMLButtonElement).style.color = '#f0e6d3'; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = 'transparent'; (e.currentTarget as HTMLButtonElement).style.color = '#f0e6d3'; }}
                >
                  {homeAbout.buttonLabel}
                </button>
              </Link>
            </div>
          </div>
          <div style={{ flex: '1', position: 'relative', minHeight: '320px', zIndex: 10 }} />
        </div>

        {/* Desktop image — absolute so it never pushes text/button down */}
        <div className="about-doc-img-desktop" style={{ background: "transparent" }}>
          <img
            src={
              resolveMediaSource(homeAbout.imageUrl) ||
              "/images/aboutDoc.png"
            }
            alt={homeAbout.imageAlt}
            style={{
              position: "absolute",
              inset: 0,
              width: "100%",
              height: "100%",
              objectFit: "contain",
              objectPosition: "bottom right",
              filter: "grayscale(100%)",
              background: "transparent",
            }}
            decoding="async"
            loading="eager"
            onError={(e) => {
              const el = e.currentTarget;
              if (el.src.includes("/images/aboutDoc.png")) return;
              el.src = "/images/aboutDoc.png";
            }}
          />
        </div>

        {/* Mobile image */}
        <div className="about-doc-img-mobile" style={{ background: "transparent" }}>
          <img
            src={
              resolveMediaSource(homeAbout.imageUrl) ||
              "/images/aboutDoc.png"
            }
            alt={homeAbout.imageAlt}
            style={{
              position: "absolute",
              inset: 0,
              width: "100%",
              height: "100%",
              objectFit: "contain",
              objectPosition: "bottom right",
              filter: "grayscale(100%)",
              background: "transparent",
            }}
            decoding="async"
            loading="eager"
            onError={(e) => {
              const el = e.currentTarget;
              if (el.src.includes("/images/aboutDoc.png")) return;
              el.src = "/images/aboutDoc.png";
            }}
          />
        </div>
      </section>
      </div>

      {/* ───────────────── Reviews Section ───────────────── */}
 <section
        ref={reviewsSectionRef}
        className="reviews-section"
        style={{
          background: '#FFFFFF',
          overflow: 'hidden',
          padding: '60px 0 10px',
          position: 'relative',
        }}
      >
        {reviewsInView ? (
        <>
        <div className="reviews-scale-wrap">
        <div className="reviews-container-wrapper" style={{ overflow: 'hidden', width: '100%' }}>
          <div className="reviews-track">
            {[0, 1, 2, 0].map((setIndex, i) => (
              <div
                key={i}
                className="reviews-grid"

                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(3, 388px)',
                  gridTemplateRows: '305px 300px',
                  gap: '0px',
                  flexShrink: 0,
                  paddingLeft: '30px',
                }}
              >
                {/* ── Row 1, Col 1: Title card ── */}
                <div style={{ width: '360px', height: '280px', borderRadius: '24px', padding: '20px 10px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', boxSizing: 'border-box' }}>
                  <div>
                    <h2 style={{ color: '#6b1228', fontSize: '25px', fontWeight: 700, fontFamily: "'Cinzel', serif", textTransform: 'uppercase', lineHeight: 1.1, letterSpacing: '0.04em', margin: '0 0 16px', textAlign: 'center' }}>
                      {homeReviews.title.split('\n').map((line, li) => (
                        <span key={li}>
                          {li > 0 && <br />}
                          {line}
                        </span>
                      ))}
                    </h2>
                    <div style={{ width: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                      <img src={mediaImageUrl(homeReviews.titleImageUrl, { width: 320 }) || homeReviews.titleImageUrl} alt={homeReviews.titleImageAlt} style={{ width: '160px', height: '160px', objectFit: 'contain', display: 'block' }} loading="lazy" decoding="async" />
                    </div>
                  </div>
                </div>

                {/* ── Row 1, Col 2 ── */}
                <div style={{ width: '360px', height: '280px', background: '#f0f0f0', borderRadius: '24px', padding: '30px 32px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', boxSizing: 'border-box' }}>
                  <div style={{ color: '#6b1228', fontSize: '26px', letterSpacing: '4px' }}>★★★★★</div>
                  <p style={{ color: '#3d0818', fontSize: '15px', lineHeight: 1.4, fontWeight: 400, margin: '10px 0', flex: 1 }}>&quot;{homeReviews.reviews[setIndex % homeReviews.reviews.length]?.text}&quot;</p>
                  <span style={{ color: '#3d0818', fontSize: '17px', fontWeight: 400, letterSpacing: '0.04em', fontFamily: "'Cormorant Garamond', serif" }}>-{homeReviews.reviews[setIndex % homeReviews.reviews.length]?.name}</span>
                </div>

                {/* ── Row 1, Col 3 ── */}
                <div style={{ width: '360px', height: '280px', background: '#a86e70', borderRadius: '25px 180px 25px 25px', padding: '32px 28px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', boxSizing: 'border-box' }}>
                  <div style={{ color: '#6b1228', fontSize: '22px', letterSpacing: '3px' }}>★★★★★</div>
                  <p style={{ color: '#6b1228', fontSize: '15px', lineHeight: 1.4, fontWeight: 400, margin: '10px 0', flex: 1 }}>&quot;{homeReviews.reviews[(setIndex + 1) % homeReviews.reviews.length]?.text}&quot;</p>
                  <span style={{ color: '#6b1228', fontSize: '17px', fontWeight: 500, letterSpacing: '0.04em', fontFamily: "'Cormorant Garamond', serif" }}>-{homeReviews.reviews[(setIndex + 1) % homeReviews.reviews.length]?.name}</span>
                </div>

                {/* ── Row 2, Col 1 ── */}
                <div style={{ width: '360px', height: '280px', background: '#f0f0f0', borderRadius: '25px 25px 25px 180px', padding: '32px 28px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', boxSizing: 'border-box' }}>
                  <div style={{ color: '#6b1228', marginLeft:'20px', fontSize: '25px', letterSpacing: '3px' }}>★★★★★</div>
                  <p style={{ color: '#3d0818', fontSize: '15px', lineHeight: 1.4,  fontWeight: 400, margin: '10px 20px', flex: 1 }}>&quot;{homeReviews.reviews[(setIndex + 2) % homeReviews.reviews.length]?.text}&quot;</p>
                  <span style={{ color: '#3d0818', fontSize: '17px', fontWeight: 400, letterSpacing: '0.04em', fontFamily: "'Cormorant Garamond', serif", marginLeft: '56px' }}>-{homeReviews.reviews[(setIndex + 2) % homeReviews.reviews.length]?.name}</span>
                </div>

                {/* ── Row 2, Col 2 ── */}
                <div style={{ width: '360px', height: '280px', background: '#c7ae9a', borderRadius: '24px', padding: '32px 28px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', boxSizing: 'border-box' }}>
                  <div style={{ color: '#6b1228', fontSize: '22px', letterSpacing: '3px' }}>★★★★★</div>
                  <p style={{ color: '#3d0818', fontSize: '15px', lineHeight: 1.4,  fontWeight: 400, margin: '10px 0', flex: 1 }}>&quot;{homeReviews.reviews[(setIndex + 3) % homeReviews.reviews.length]?.text}&quot;</p>
                  <span style={{ color: '#3d0818', fontSize: '17px', fontWeight: 400, letterSpacing: '0.04em', fontFamily: "'Cormorant Garamond', serif" }}>-{homeReviews.reviews[(setIndex + 3) % homeReviews.reviews.length]?.name}</span>
                </div>

                {/* ── Row 2, Col 3 ── */}
                <div style={{ width: '360px', height: '280px', background: '#936562', borderRadius: '25px 25px 180px 25px', padding: '32px 28px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', boxSizing: 'border-box' }}>
                  <div style={{ color: '#6b1228', fontSize: '22px', letterSpacing: '3px' }}>★★★★★</div>
                  <p style={{ color: '#6b1228', fontSize: '15px', lineHeight: 1.4,fontWeight: 400, margin: '10px 0', flex: 1 }}>&quot;{homeReviews.reviews[(setIndex + 4) % homeReviews.reviews.length]?.text}&quot;</p>
                  <span style={{ color: '#6b1228', fontSize: '17px', fontWeight: 400, letterSpacing: '0.04em', fontFamily: "'Cormorant Garamond', serif" }}>-{homeReviews.reviews[(setIndex + 4) % homeReviews.reviews.length]?.name}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
        </div>

        {/* Pagination dots */}
       {/* Pagination dots */}
{/* Pagination dots */}
<div style={{ display: 'flex', justifyContent: 'center', marginTop: '36px' }}>
  <div style={{ position: 'relative', display: 'flex', gap: '10px', alignItems: 'center' }}>
    {[...Array(TOTAL_PAGES)].map((_, i) => (
      <div key={i} style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#c4a87a' }} />
    ))}
    <div
  className="active-dot-indicator"
  style={{
    position: 'absolute',
    left: '0px',
    width: '10px',
    height: '8px',
    borderRadius: '999px',
    background: '#3d0814',
    animation: 'dots-scroll 15s linear infinite',
  }}
/>
  </div>
</div>
        </>
        ) : (
          <div className="min-h-[400px]" aria-hidden />
        )}
      </section>

      {/* ───────────────── Blog Carousel Section ───────────────── */}
      <section ref={blogSectionRef} style={{ background: '#FFFFFF', fontFamily: "var(--font-seasons-reg)", padding: '70px 0 80px', overflow: 'hidden' }}>
        <div className="blog-header" style={{ padding: '0 70px', marginBottom: '48px', marginLeft: '15px' }}>
          <div className="flex items-center gap-3 mb-4">
            <div style={{ width: '36px', height: '1.1px', background: '#6b1228' }} />
            <span style={{ color: '#6b1228', fontSize: '15px', fontStyle: 'italic', letterSpacing: '0.04em' }}>{homeBlogs.eyebrow}</span>
          </div>
          <h2 style={{ color: '#6b1228', fontSize: '29px', fontWeight: 600, fontFamily: "var(--font-cinzel)", lineHeight: 1.1, marginBottom: '20px', letterSpacing: '0.01em' }}>
            {homeBlogs.title}
          </h2>
          <p style={{ color: '#6b1228', fontSize: '18px', lineHeight: 1.75, maxWidth: '620px', fontFamily: "var(--font-seasons-reg)", fontWeight: 400 }}>
            {homeBlogs.body}
          </p>
        </div>
        {blogInView ? (
        <div style={{ overflow: 'hidden', width: '100%' }}>
          <div
            ref={blogTrackRef}
            className="blog-track"
            style={{
            display: 'flex',
            gap: '24px',
            width: 'max-content',
            animation: 'blog-scroll 30s linear infinite',
            animationPlayState: isBlogPaused ? 'paused' : 'running',
            paddingLeft: '60px',
            ['--blog-shift' as any]: `${blogShiftPx}px`,
          }}>
            {(blogPosts.length > 0 ? [...blogPosts, ...blogPosts] : []).map((post, i) => (
              <BlogCard
                key={i}
                post={post}
                onPause={() => setIsBlogPaused(true)}
                onResume={() => setIsBlogPaused(false)}
              />
            ))}
          </div>
        </div>
        ) : (
          <div className="min-h-[320px]" aria-hidden />
        )}
      </section>

      <div ref={faqSectionRef}>
        {faqInView ? <FaqSection content={homeFaq} /> : <div className="min-h-[400px]" aria-hidden />}
      </div>

      {/* ───────────────── Why Choose Us Video Section ───────────────── */}
      <section ref={videoSectionRef} className="bg-white font-seasons px-5 mb-10 min-[769px]:px-[60px] min-[769px]:mb-[60px]">
        {/* Header */}
        <div className="flex flex-col justify-start items-start gap-4 mb-4 max-[768px]:mb-3 min-[769px]:max-[1023px]:flex-row min-[769px]:max-[1023px]:items-start min-[769px]:max-[1023px]:gap-6 min-[1024px]:max-[1280px]:flex-row min-[1024px]:max-[1280px]:ml-2.5 min-[1024px]:max-[1280px]:gap-[29px] min-[1024px]:max-[1280px]:mb-2 min-[1281px]:flex-row min-[1281px]:justify-between min-[1281px]:ml-0 min-[1281px]:gap-[410px] min-[1281px]:mb-2">
          <div className="shrink-0 w-full min-[769px]:max-[1023px]:w-auto min-[769px]:max-[1023px]:basis-[340px] ml-0 min-[1024px]:max-[1280px]:basis-[62%] min-[1024px]:max-[1280px]:ml-[25px] min-[1281px]:ml-[25px] min-[1281px]:basis-[380px]">
            <p className="text-[#6b1228] text-base italic mb-2 mt-0 min-[1024px]:mt-5 min-[1024px]:mb-3 tracking-[0.04em]">
              {homeVideo.eyebrow}
            </p>
            <h2 className="text-[#6b1228] text-[29px] max-[768px]:text-[22px] font-semibold font-cinzel uppercase leading-[1.1] tracking-[0.02em]">
              {homeVideo.title}
            </h2>
          </div>
          <div className="flex flex-col items-start gap-2.5 w-full min-[769px]:max-[1023px]:w-auto min-[769px]:max-[1023px]:shrink min-[1024px]:flex-1 min-[1024px]:pt-7 min-[1024px]:max-w-none">
            <p className="text-[#6b1228] text-[17px] leading-[1.6] font-seasons font-normal max-w-[480px]">
              {homeVideo.subtitle}
            </p>
            <Link href={homeVideo.buttonHref || "/pages/Appointment"}>
              <button
                type="button"
                className="bg-[#5c0d2a] border-none text-[#f0e6d3] py-3.5 px-8 rounded-full text-[15px] font-seasons font-semibold tracking-[0.04em] cursor-pointer transition-colors duration-300 hover:bg-[#7a1038]"
              >
                {homeVideo.buttonLabel}
              </button>
            </Link>
          </div>
        </div>

        {/* Body: video + right col */}
        {videoInView ? (
        <div className="flex flex-row gap-[29px] items-start ml-2.5 max-[767px]:flex-col max-[767px]:gap-4 max-[767px]:ml-0">
          <div
            className="relative shrink-0 basis-[62%] border border-[#753141] rounded-2xl overflow-hidden bg-[#1a1008] aspect-[17/9] cursor-pointer max-[767px]:mt-3 max-[767px]:basis-auto max-[767px]:w-full min-[768px]:max-[1023px]:mt-[72px] min-[1024px]:mt-[110px]"
            onMouseEnter={() => setIsVideoHovered(true)}
            onMouseLeave={() => setIsVideoHovered(false)}
            onClick={() => {
              if (videoPlayback.kind === "embed") {
                if (!embedStarted) {
                  setEmbedStarted(true);
                  setIsVideoPlaying(true);
                }
                return;
              }
              const vid = document.getElementById('why-video') as HTMLVideoElement | null;
              if (vid) {
                if (vid.paused) {
                  vid.muted = false;
                  void vid.play();
                  setIsVideoPlaying(true);
                } else {
                  vid.pause();
                  setIsVideoPlaying(false);
                }
              }
            }}
          >
            {videoPlayback.kind === "embed" ? (
              embedStarted ? (
                <iframe
                  title={homeVideo.title}
                  src={`${videoPlayback.src}${videoPlayback.src.includes("?") ? "&" : "?"}autoplay=1`}
                  className="absolute inset-0 h-full w-full border-0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  allowFullScreen
                  referrerPolicy="strict-origin-when-cross-origin"
                />
              ) : videoPlayback.posterUrl ? (
                <img
                  src={videoPlayback.posterUrl}
                  alt=""
                  className="absolute inset-0 h-full w-full object-cover"
                  loading="lazy"
                  decoding="async"
                />
              ) : (
                <div className="absolute inset-0 bg-[#1a1008]" aria-hidden />
              )
            ) : (
              <video
                id="why-video"
                src={resolveMediaSource(videoPlayback.src) || videoPlayback.src}
                className="absolute inset-0 h-full w-full object-cover block"
                playsInline
                loop
                preload="metadata"
                muted
                onLoadedMetadata={(e) => {
                  const el = e.currentTarget;
                  if (el.currentTime < 0.05) {
                    try {
                      el.currentTime = 0.1;
                    } catch {
                      // Some browsers block seek until canplay
                    }
                  }
                }}
              />
            )}
            {((videoPlayback.kind === "embed" && !embedStarted) ||
              (videoPlayback.kind === "file" && (!isVideoPlaying || isVideoHovered))) && (
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="w-16 h-16 rounded-full border-[3px] border-[#711C31] bg-black/35 flex items-center justify-center text-[#711C31]">
                  {videoPlayback.kind === "file" && isVideoPlaying ? (
                    <span className="flex items-center gap-[5px]" aria-hidden>
                      <span className="block h-5 w-[5px] rounded-[1px] bg-[#711C31]" />
                      <span className="block h-5 w-[5px] rounded-[1px] bg-[#711C31]" />
                    </span>
                  ) : (
                    <span className="text-[26px] leading-none pl-0.5" aria-hidden>
                      ▶
                    </span>
                  )}
                </div>
              </div>
            )}
          </div>

          <div className="flex-1 flex flex-col gap-6 max-[767px]:gap-4 max-[767px]:mt-3 max-[767px]:basis-auto max-[767px]:w-full min-[768px]:mt-10">
            <div className="w-full rounded-2xl border border-[#753141] overflow-hidden relative aspect-[4/5] leading-none">
              <Image
                src={mediaImageUrl(homeVideo.sideImageUrl, { width: 800 }) || homeVideo.sideImageUrl}
                alt={homeVideo.sideImageAlt}
                fill
                sizes="(max-width: 768px) 100vw, 25vw"
                className="object-cover object-center"
                loading="lazy"
              />
            </div>
            <p className="text-[#5c0d2a] text-[17px] max-[768px]:text-[15px] leading-[1.4] font-seasons">
              {homeVideo.caption}
            </p>
          </div>
        </div>
        ) : (
          <div className="min-h-[280px]" aria-hidden />
        )}
      </section>

    </div>
  );
}
