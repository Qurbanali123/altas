const DEFAULT_MAX_DIMENSION = 1920;
const DEFAULT_QUALITY = 0.82;
const SKIP_BELOW_BYTES = 350_000;

export type CompressImageOptions = {
  maxDimension?: number;
  quality?: number;
  skipBelowBytes?: number;
};

function loadImageFromFile(file: File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve(img);
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("Failed to read image file."));
    };
    img.src = url;
  });
}

function canvasToBlob(
  canvas: HTMLCanvasElement,
  type: string,
  quality: number,
): Promise<Blob | null> {
  return new Promise((resolve) => {
    canvas.toBlob(resolve, type, quality);
  });
}

async function drawBitmapToCompressedFile(
  source: CanvasImageSource & { close?: () => void },
  width: number,
  height: number,
  file: File,
  quality: number,
): Promise<File> {
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;

  const ctx = canvas.getContext("2d");
  if (!ctx) return file;

  ctx.drawImage(source, 0, 0, width, height);
  source.close?.();

  const outputType =
    file.type === "image/png" || file.type === "image/webp"
      ? "image/jpeg"
      : file.type || "image/jpeg";
  const blob = await canvasToBlob(canvas, outputType, quality);
  if (!blob || blob.size >= file.size) return file;

  const baseName = file.name.replace(/\.[^.]+$/, "") || "upload";
  return new File([blob], `${baseName}.jpg`, {
    type: outputType,
    lastModified: Date.now(),
  });
}

async function compressWithCanvas(
  file: File,
  maxDimension: number,
  quality: number,
): Promise<File> {
  const img = await loadImageFromFile(file);
  const scale = Math.min(1, maxDimension / Math.max(img.width, img.height));

  if (scale >= 1 && file.size <= 1_500_000) {
    return file;
  }

  const width = Math.max(1, Math.round(img.width * scale));
  const height = Math.max(1, Math.round(img.height * scale));
  return drawBitmapToCompressedFile(img, width, height, file, quality);
}

/** Resize large photos in the browser before upload (faster on shared hosting). */
export async function compressImageForUpload(
  file: File,
  options: CompressImageOptions = {},
): Promise<File> {
  const maxDimension = options.maxDimension ?? DEFAULT_MAX_DIMENSION;
  const quality = options.quality ?? DEFAULT_QUALITY;
  const skipBelowBytes = options.skipBelowBytes ?? SKIP_BELOW_BYTES;

  if (!file.type.startsWith("image/") || file.size <= skipBelowBytes) {
    return file;
  }

  try {
    if (typeof createImageBitmap === "undefined") {
      return compressWithCanvas(file, maxDimension, quality);
    }

    const bitmap = await createImageBitmap(file);
    const longestEdge = Math.max(bitmap.width, bitmap.height);
    const scale = Math.min(1, maxDimension / longestEdge);

    if (scale >= 1 && file.size <= 1_500_000) {
      bitmap.close();
      return file;
    }

    const width = Math.max(1, Math.round(bitmap.width * scale));
    const height = Math.max(1, Math.round(bitmap.height * scale));

    if (scale < 1) {
      const resized = await createImageBitmap(bitmap, {
        resizeWidth: width,
        resizeHeight: height,
        resizeQuality: "medium",
      });
      bitmap.close();
      return drawBitmapToCompressedFile(resized, width, height, file, quality);
    }

    return drawBitmapToCompressedFile(bitmap, width, height, file, quality);
  } catch {
    try {
      return await compressWithCanvas(file, maxDimension, quality);
    } catch {
      return file;
    }
  }
}

export const BLOG_IMAGE_COMPRESS_OPTIONS: CompressImageOptions = {
  maxDimension: 1400,
  quality: 0.78,
  skipBelowBytes: 450_000,
};

export const DASHBOARD_IMAGE_COMPRESS_OPTIONS: CompressImageOptions = {
  maxDimension: 1400,
  quality: 0.78,
  skipBelowBytes: 450_000,
};

export const PROFILE_IMAGE_COMPRESS_OPTIONS: CompressImageOptions = {
  maxDimension: 900,
  quality: 0.8,
  skipBelowBytes: 250_000,
};

/**
 * Remove studio black via edge flood-fill only (keeps hair).
 * Does not re-encode smaller — full resolution PNG.
 */
export async function stripBlackBackgroundToPng(
  file: File,
  blackMax = 10
): Promise<File> {
  if (!file.type.startsWith("image/")) return file;

  const img = await loadImageFromFile(file);
  const w = img.naturalWidth || img.width;
  const h = img.naturalHeight || img.height;
  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d", { willReadFrequently: true });
  if (!ctx || !w || !h) return file;

  ctx.drawImage(img, 0, 0);
  const imageData = ctx.getImageData(0, 0, w, h);
  const data = imageData.data;
  const n = w * h;
  const isBlack = new Uint8Array(n);
  for (let i = 0, p = 0; i < data.length; i += 4, p++) {
    if (Math.max(data[i], data[i + 1], data[i + 2]) <= blackMax) isBlack[p] = 1;
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
  // Hair/arms fully opaque — background never shows through.
  for (let i = 0, p = 0; i < data.length; i += 4, p++) {
    if (seen[p]) continue;
    data[i + 3] = data[i + 3] > 8 ? 255 : 0;
  }
  ctx.putImageData(imageData, 0, 0);

  const blob = await canvasToBlob(canvas, "image/png", 1);
  if (!blob) return file;
  const baseName = file.name.replace(/\.[^.]+$/, "") || "cutout";
  return new File([blob], `${baseName}.png`, {
    type: "image/png",
    lastModified: Date.now(),
  });
}
