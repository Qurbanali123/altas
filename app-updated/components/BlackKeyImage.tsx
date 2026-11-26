"use client";

import { useEffect, useState } from "react";

type BlackKeyImageProps = Omit<
  React.ImgHTMLAttributes<HTMLImageElement>,
  "src"
> & {
  src: string;
  /** RGB max channel at/below this becomes fully transparent. */
  threshold?: number;
};

function isKnownTransparentAsset(src: string): boolean {
  // These files were converted to real alpha PNGs in /public/images.
  return (
    /\/images\/udrimage\.(png|webp)(\?|$)/i.test(src) ||
    /\/images\/aboutDoc\.(png|webp)(\?|$)/i.test(src)
  );
}

/**
 * Permanently removes baked-in black backgrounds from cutout photos
 * by converting near-black pixels to alpha before display.
 * Known transparent assets skip processing (no delay / no flash).
 */
export default function BlackKeyImage({
  src,
  threshold = 38,
  alt = "",
  style,
  ...props
}: BlackKeyImageProps) {
  const skipProcess = isKnownTransparentAsset(src);
  const [cleanSrc, setCleanSrc] = useState<string | null>(
    skipProcess ? src : null
  );

  useEffect(() => {
    if (isKnownTransparentAsset(src)) {
      setCleanSrc(src);
      return;
    }

    let cancelled = false;
    let objectUrl: string | null = null;
    setCleanSrc(null);

    const img = new window.Image();
    img.crossOrigin = "anonymous";

    img.onload = () => {
      try {
        const canvas = document.createElement("canvas");
        canvas.width = img.naturalWidth || img.width;
        canvas.height = img.naturalHeight || img.height;
        const ctx = canvas.getContext("2d", { willReadFrequently: true });
        if (!ctx || !canvas.width || !canvas.height) {
          if (!cancelled) setCleanSrc(src);
          return;
        }
        ctx.drawImage(img, 0, 0);
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const d = imageData.data;
        const soft = threshold + 24;
        for (let i = 0; i < d.length; i += 4) {
          const max = Math.max(d[i], d[i + 1], d[i + 2]);
          if (max <= threshold) {
            d[i + 3] = 0;
          } else if (max < soft) {
            d[i + 3] = Math.round(d[i + 3] * ((max - threshold) / 24));
          }
        }
        ctx.putImageData(imageData, 0, 0);
        canvas.toBlob(
          (blob) => {
            if (cancelled) return;
            if (!blob) {
              setCleanSrc(src);
              return;
            }
            objectUrl = URL.createObjectURL(blob);
            setCleanSrc(objectUrl);
          },
          "image/png"
        );
      } catch {
        if (!cancelled) setCleanSrc(src);
      }
    };

    img.onerror = () => {
      if (!cancelled) setCleanSrc(src);
    };

    img.src = src;

    return () => {
      cancelled = true;
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [src, threshold]);

  if (!cleanSrc) {
    return (
      <span
        aria-hidden
        style={{
          display: "block",
          width: "100%",
          height: "100%",
          background: "transparent",
          ...(typeof style === "object" && style ? style : {}),
          opacity: 0,
          pointerEvents: "none",
        }}
      />
    );
  }

  return (
    <img
      src={cleanSrc}
      alt={alt}
      style={{ background: "transparent", ...style }}
      {...props}
    />
  );
}
