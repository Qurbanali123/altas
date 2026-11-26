"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  mediaImageUrl,
  resolveMediaSource,
  type OptimizeImageOptions,
} from "@/utils/mediaUrl";

type MediaImageProps = Omit<
  React.ImgHTMLAttributes<HTMLImageElement>,
  "src" | "onError"
> & {
  path: string | undefined | null;
  optimize?: OptimizeImageOptions;
};

export function useOptimizedMediaSrc(
  path: string | undefined | null,
  optimize?: OptimizeImageOptions
) {
  const direct = useMemo(() => resolveMediaSource(path), [path]);
  const optimized = useMemo(
    () => mediaImageUrl(path, optimize),
    [path, optimize]
  );

  const [src, setSrc] = useState(optimized || direct);

  useEffect(() => {
    setSrc(mediaImageUrl(path, optimize) || direct);
  }, [path, optimize, direct]);

  const onError = useCallback(() => {
    // Cloudinary / broken URL → original path
    if (direct && src !== direct) {
      setSrc(direct);
      return;
    }
    // If a .webp path 404s, try png/jpg sibling
    if (src && /\.webp(\?|$)/i.test(src)) {
      const fallback = src.replace(/\.webp(\?|$)/i, ".png$1");
      if (fallback !== src) {
        setSrc(fallback);
        return;
      }
    }
  }, [direct, src]);

  return { src, onError, direct, optimized };
}

export default function MediaImage({
  path,
  optimize,
  alt = "",
  loading = "lazy",
  decoding = "async",
  ...props
}: MediaImageProps) {
  const { src, onError } = useOptimizedMediaSrc(path, optimize);

  if (!src) return null;

  return (
    <img
      src={src}
      alt={alt}
      loading={loading}
      decoding={decoding}
      onError={onError}
      {...props}
    />
  );
}
