/**
 * Only fix see-through hair/arms: keep every RGB pixel exactly as uploaded.
 * If a pixel is already visible (alpha > 0), make it fully opaque.
 * Does not remove pixels, does not change colors, does not reshape.
 */
export async function opaqueVisiblePixelsSrc(src: string): Promise<string> {
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
        const d = imageData.data;
        for (let i = 3; i < d.length; i += 4) {
          if (d[i] > 0) d[i] = 255;
        }
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
