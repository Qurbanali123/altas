/** Make cutout subjects fully opaque so background never shows through hair/arms. */

export function hardenCutoutImageData(
  imageData: ImageData,
  blackMax = 10
): void {
  const { width: w, height: h, data } = imageData;
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

  // Subject (including hair / arms): fully opaque — never see-through.
  for (let i = 0, p = 0; i < data.length; i += 4, p++) {
    if (seen[p]) continue;
    data[i + 3] = data[i + 3] > 8 ? 255 : 0;
  }
}

/**
 * Returns a blob: URL of the hardened cutout, or the original src on failure.
 * Caller should revoke the blob URL when done if it starts with blob:.
 */
export async function hardenCutoutSrc(src: string): Promise<string> {
  if (/\/images\/udrimage\.(png|webp)(\?|$)/i.test(src)) {
    return src;
  }

  return new Promise((resolve) => {
    const img = new window.Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      try {
        const w = img.naturalWidth || img.width;
        const h = img.naturalHeight || img.height;
        const canvas = document.createElement("canvas");
        canvas.width = w;
        canvas.height = h;
        const ctx = canvas.getContext("2d", { willReadFrequently: true });
        if (!ctx || !w || !h) {
          resolve(src);
          return;
        }
        ctx.drawImage(img, 0, 0);
        const imageData = ctx.getImageData(0, 0, w, h);
        hardenCutoutImageData(imageData);
        ctx.putImageData(imageData, 0, 0);
        canvas.toBlob(
          (blob) => {
            if (!blob) {
              resolve(src);
              return;
            }
            resolve(URL.createObjectURL(blob));
          },
          "image/png"
        );
      } catch {
        resolve(src);
      }
    };
    img.onerror = () => resolve(src);
    img.src = src;
  });
}
