import { apiUrl } from "@/utils/api";
import { publicCmsFetch } from "@/utils/publicCmsFetch";
import {
  DEFAULT_HOME_HERO,
  mergeHomeHero,
  type HomeHeroContent,
} from "@/utils/homeHeroApi";
import {
  DEFAULT_HOME_STATS,
  mergeHomeStats,
  type HomeStatsContent,
} from "@/utils/homeStatsApi";
import {
  DEFAULT_HOME_ABOUT,
  mergeHomeAbout,
  type HomeAboutContent,
} from "@/utils/homeAboutApi";
import {
  DEFAULT_HOME_REVIEWS,
  mergeHomeReviews,
  type HomeReviewsContent,
} from "@/utils/homeReviewsApi";
import {
  DEFAULT_HOME_BLOGS,
  mergeHomeBlogs,
  type HomeBlogsContent,
} from "@/utils/homeBlogsApi";
import {
  DEFAULT_HOME_FAQ,
  mergeHomeFaq,
  type HomeFaqContent,
} from "@/utils/homeFaqApi";
import {
  DEFAULT_HOME_VIDEO,
  mergeHomeVideo,
  type HomeVideoContent,
} from "@/utils/homeVideoApi";

export type HomeCmsBundle = {
  hero: HomeHeroContent;
  stats: HomeStatsContent;
  about: HomeAboutContent;
  reviews: HomeReviewsContent;
  blogs: HomeBlogsContent;
  faq: HomeFaqContent;
  video: HomeVideoContent;
};

export const DEFAULT_HOME_BUNDLE: HomeCmsBundle = {
  hero: DEFAULT_HOME_HERO,
  stats: DEFAULT_HOME_STATS,
  about: DEFAULT_HOME_ABOUT,
  reviews: DEFAULT_HOME_REVIEWS,
  blogs: DEFAULT_HOME_BLOGS,
  faq: DEFAULT_HOME_FAQ,
  video: DEFAULT_HOME_VIDEO,
};

/** Single request for all homepage CMS sections (plus header/footer ignored here). */
export async function fetchPublicHomeBundle(): Promise<HomeCmsBundle> {
  const response = await publicCmsFetch(
    apiUrl(`/api/pages/home-bundle/public?t=${Date.now()}`)
  );
  const json = await response.json().catch(() => ({}));
  if (!response.ok || !json?.data) {
    throw new Error(json?.message || "Failed to load home CMS bundle");
  }
  const d = json.data;
  return {
    hero: mergeHomeHero(d.hero),
    stats: mergeHomeStats(d.stats),
    about: mergeHomeAbout(d.about),
    reviews: mergeHomeReviews(d.reviews),
    blogs: mergeHomeBlogs(d.blogs),
    faq: mergeHomeFaq(d.faq),
    video: mergeHomeVideo(d.video),
  };
}
