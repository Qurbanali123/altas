"use client";

import { useEffect, useState } from "react";

type Props = Omit<React.ImgHTMLAttributes<HTMLImageElement>, "src"> & {
  src: string;
  fallbackSrc?: string;
  /** Max RGB channel treated as studio black (background only). */
  blackMax?: number;
};

/**
 * Remove black studio background without cutting hair:
 * only near-black pixels connected to the image edges become transparent.
 * Interior dark hair stays fully opaque. No mix-blend.
 */
export function removeEdgeBlackToAlpha(
  imageData: ImageData,
  blackMax = 12
): void {
  const { width: w, height: h, data } = imageData;
  const n = w * h;
  const isBlack = new Uint8Array(n);
  for (let i = 0, p = 0; i < data.length; i += 4, p++) {
    const max = Math.max(data[i], data[i + 1], data[i + 2]);
    if (max <= blackMax) isBlack[p] = 1;
  }

  const seen = new Uint8Array(n);
  const stack: number[] = [];
  const push = (x: number, y: number) => {
    if (x < 0 || y < 0 || x >= w || y >= h) return;
    const p = y * w + x;
    if (seen[p] || !isBlack[p]) return;
    seen[p] = 1;
    stack.push(p);
  };

  for (let x = 0; x < w; x++) {
    push(x, 0);
    push(x, h - 1);
  }
  for (let y = 0; y < h; y++) {
    push(0, y);
    push(w - 1, y);
  }

  while (stack.length) {
    const p = stack.pop()!;
    const x = p % w;
    const y = (p / w) | 0;
    data[p * 4 + 3] = 0;
    push(x + 1, y);
    push(x - 1, y);
    push(x, y + 1);
    push(x, y - 1);
  }

  // Non-background pixels: full opacity (fixes semi-transparent hair).
  for (let i = 0, p = 0; i < data.length; i += 4, p++) {
    if (!seen[p]) data[i + 3] = 255;
  }
}

export default function CutoutImage({
  src,
  fallbackSrc,
  blackMax = 12,
  alt = "",
  style,
  ...props
}: Props) {
  const [outSrc, setOutSrc] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    let objectUrl: string | null = null;
    setOutSrc(null);
    const safe = fallbackSrc || src;

    const img = new window.Image();
    img.crossOrigin = "anonymous";

    const finish = (url: string) => {
      if (!cancelled) setOutSrc(url);
    };

    img.onload = () => {
      try {
        const w = img.naturalWidth || img.width;
        const h = img.naturalHeight || img.height;
        const canvas = document.createElement("canvas");
        canvas.width = w;
        canvas.height = h;
        const ctx = canvas.getContext("2d", { willReadFrequently: true });
        if (!ctx || !w || !h) {
          finish(safe);
          return;
        }
        ctx.drawImage(img, 0, 0);
        const imageData = ctx.getImageData(0, 0, w, h);
        removeEdgeBlackToAlpha(imageData, blackMax);
        ctx.putImageData(imageData, 0, 0);
        canvas.toBlob((blob) => {
          if (cancelled) return;
          if (!blob) {
            finish(safe);
            return;
          }
          objectUrl = URL.createObjectURL(blob);
          finish(objectUrl);
        }, "image/png");
      } catch {
        finish(safe);
      }
    };

    img.onerror = () => finish(safe);
    img.src = src;

    return () => {
      cancelled = true;
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [src, fallbackSrc, blackMax]);

  if (!outSrc) {
    return (
      <span
        aria-hidden
        className={
          typeof props.className === "string" ? props.className : undefined
        }
        style={{
          display: "block",
          background: "transparent",
          opacity: 0,
          pointerEvents: "none",
          ...(typeof style === "object" && style ? style : {}),
        }}
      />
    );
  }

  return (
    <img
      src={outSrc}
      alt={alt}
      style={{ background: "transparent", ...style }}
      {...props}
    />
  );
}
