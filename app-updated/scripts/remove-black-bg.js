/**
 * Remove near-black backgrounds from doctor cutout PNGs (in place).
 * Run: node scripts/remove-black-bg.js
 */
const fs = require("fs");
const path = require("path");
const sharp = require("sharp");

const FILES = [
  path.join(__dirname, "../public/images/udrimage.png"),
  path.join(__dirname, "../public/images/aboutDoc.png"),
];

const THRESHOLD = 38; // rgb below this → transparent

async function stripBlack(filePath) {
  if (!fs.existsSync(filePath)) {
    console.warn("skip missing", filePath);
    return;
  }
  const { data, info } = await sharp(filePath)
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });

  let cleared = 0;
  for (let i = 0; i < data.length; i += 4) {
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];
    const max = Math.max(r, g, b);
    if (max <= THRESHOLD) {
      data[i + 3] = 0;
      cleared += 1;
    } else if (max < THRESHOLD + 24) {
      // soft edge
      const t = (max - THRESHOLD) / 24;
      data[i + 3] = Math.round(data[i + 3] * t);
    }
  }

  const png = await sharp(data, {
    raw: { width: info.width, height: info.height, channels: 4 },
  })
    .png({ compressionLevel: 8 })
    .toBuffer();

  fs.writeFileSync(filePath, png);
  console.log(
    "ok",
    path.basename(filePath),
    `${info.width}x${info.height}`,
    `cleared=${cleared}`,
    `bytes=${png.length}`
  );

  // refresh webp sibling if present
  const webpPath = filePath.replace(/\.png$/i, ".webp");
  await sharp(png).webp({ quality: 82 }).toFile(webpPath);
  console.log("  webp", path.basename(webpPath));
}

(async () => {
  for (const f of FILES) {
    await stripBlack(f);
  }
})().catch((e) => {
  console.error(e);
  process.exit(1);
});
