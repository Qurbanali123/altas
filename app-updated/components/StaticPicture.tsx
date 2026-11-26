"use client";

import { useCallback, useMemo, useState } from "react";
import { resolveMediaSource } from "@/utils/mediaUrl";

type StaticPictureProps = Omit<
  React.ImgHTMLAttributes<HTMLImageElement>,
  "src" | "onError"
> & {
  /** Path like /images/logo.png — WebP sibling is tried first when present. */
  path: string | undefined | null;
};

/** Sibling webp path for static /images assets (optional file on disk). */
export function staticWebpSibling(path: string): string | null {
  if (!path.startsWith("/images/")) return null;
  if (/\.webp$/i.test(path)) return path;
  if (!/\.(png|jpe?g)$/i.test(path)) return null;
  return path.replace(/\.(png|jpe?g)$/i, ".webp");
}

/**
 * Performance-safe static image:
 * - Prefer .webp via <picture> when the browser supports it
 * - Always keep png/jpg as <img> fallback (never blank if webp missing)
 */
export default function StaticPicture({
  path,
  alt = "",
  loading = "lazy",
  decoding = "async",
  ...props
}: StaticPictureProps) {
  const original = useMemo(() => resolveMediaSource(path) || path || "", [path]);
  const webp = useMemo(
    () => (original ? staticWebpSibling(original) : null),
    [original]
  );
  const [useWebp, setUseWebp] = useState(Boolean(webp));

  const onError = useCallback(() => {
    setUseWebp(false);
  }, []);

  if (!original) return null;

  if (useWebp && webp && webp !== original) {
    return (
      <picture>
        <source srcSet={webp} type="image/webp" />
        <img
          src={original}
          alt={alt}
          loading={loading}
          decoding={decoding}
          onError={onError}
          {...props}
        />
      </picture>
    );
  }

  return (
    <img
      src={original}
      alt={alt}
      loading={loading}
      decoding={decoding}
      {...props}
    />
  );
}
