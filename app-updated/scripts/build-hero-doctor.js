/**
 * Build a clean hero doctor cutout: remove edge-connected black only,
 * despill dark fringe, keep full resolution / no blur.
 * Run: node scripts/build-hero-doctor.js
 */
const https = require("https");
const fs = require("fs");
const path = require("path");
const sharp = require("sharp");

function get(url) {
  return new Promise((resolve, reject) => {
    https
      .get(url, (res) => {
        const chunks = [];
        res.on("data", (c) => chunks.push(c));
        res.on("end", () => resolve(Buffer.concat(chunks)));
      })
      .on("error", reject);
  });
}

function edgeFloodRemoveBlack(data, w, h, blackMax = 10) {
  const n = w * h;
  const isBlack = new Uint8Array(n);
  for (let i = 0, p = 0; i < data.length; i += 4, p++) {
    if (Math.max(data[i], data[i + 1], data[i + 2]) <= blackMax) isBlack[p] = 1;
  }
  const seen = new Uint8Array(n);
  const stack = [];
  const push = (x, y) => {
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
    const p = stack.pop();
    const x = p % w;
    const y = (p / w) | 0;
    data[p * 4 + 3] = 0;
    push(x + 1, y);
    push(x - 1, y);
    push(x, y + 1);
    push(x, y - 1);
  }
  // Keep subject opaque; lightly fade only pixels that touch transparent bg
  // and are still very dark (anti-alias fringe) — avoids white halo.
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const p = y * w + x;
      if (seen[p]) continue;
      const i = p * 4;
      data[i + 3] = 255;
      const max = Math.max(data[i], data[i + 1], data[i + 2]);
      if (max > 40) continue;
      let nearClear = false;
      for (const [dx, dy] of [
        [1, 0],
        [-1, 0],
        [0, 1],
        [0, -1],
      ]) {
        const nx = x + dx;
        const ny = y + dy;
        if (nx < 0 || ny < 0 || nx >= w || ny >= h) continue;
        if (seen[ny * w + nx]) {
          nearClear = true;
          break;
        }
      }
      if (nearClear) {
        // Soft fringe against black → transparent (no white rim)
        data[i + 3] = 0;
      }
    }
  }
}

(async () => {
  const hero = JSON.parse(
    (
      await get(
        "https://altasbackend.atlasdentalcenter.com/api/pages/home-hero/public"
      )
    ).toString()
  );
  const url = hero.data.doctorImageUrl;
  const abs = url.startsWith("http")
    ? url
    : `https://altasbackend.atlasdentalcenter.com${url}`;
  const buf = await get(abs);
  const { data, info } = await sharp(buf)
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });

  edgeFloodRemoveBlack(data, info.width, info.height, 10);

  const png = await sharp(data, {
    raw: { width: info.width, height: info.height, channels: 4 },
  })
    .png({ compressionLevel: 6, effort: 7 })
    .toBuffer();

  const outPng = path.join(__dirname, "../public/images/udrimage.png");
  const outWebp = path.join(__dirname, "../public/images/udrimage.webp");
  fs.writeFileSync(outPng, png);
  await sharp(png).webp({ quality: 90, alphaQuality: 100 }).toFile(outWebp);
  console.log("wrote", outPng, png.length, "from", url);
})().catch((e) => {
  console.error(e);
  process.exit(1);
});
