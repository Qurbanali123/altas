"use client";

import Image, { type ImageProps } from "next/image";
import { useOptimizedMediaSrc } from "@/components/MediaImage";
import type { OptimizeImageOptions } from "@/utils/mediaUrl";

type OptimizedNextImageProps = Omit<ImageProps, "src" | "onError"> & {
  path: string | undefined | null;
  fallbackSrc?: string;
  optimize?: OptimizeImageOptions;
};

export default function OptimizedNextImage({
  path,
  fallbackSrc,
  optimize,
  alt = "",
  ...props
}: OptimizedNextImageProps) {
  const { src, onError, direct } = useOptimizedMediaSrc(path, optimize);
  const displaySrc = src || fallbackSrc || direct;

  if (!displaySrc) return null;

  return (
    <Image
      {...props}
      src={displaySrc}
      alt={alt}
      unoptimized
      onError={onError}
    />
  );
}
