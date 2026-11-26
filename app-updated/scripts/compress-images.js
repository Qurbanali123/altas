/**
 * Compress public/images for PageSpeed (keeps visual look, shrinks bytes).
 * Writes optimized .webp siblings and re-encodes oversized originals in place.
 */
const fs = require("fs");
const path = require("path");
const sharp = require("sharp");

const DIR = path.join(__dirname, "..", "public", "images");
const MAX_EDGE = 1920;
const MIN_BYTES = 80 * 1024;

async function compressOne(filePath) {
  const ext = path.extname(filePath).toLowerCase();
  if (![".png", ".jpg", ".jpeg", ".webp"].includes(ext)) return null;
  if (ext === ".pdf") return null;

  const base = path.basename(filePath);
  const stat = fs.statSync(filePath);
  if (stat.size < MIN_BYTES && ext === ".webp") return null;

  const img = sharp(filePath, { failOn: "none" }).rotate();
  const meta = await img.metadata();
  const width = meta.width || MAX_EDGE;
  const targetW = Math.min(width, MAX_EDGE);

  const webpPath = filePath.replace(/\.(png|jpe?g|webp)$/i, ".webp");
  await sharp(filePath, { failOn: "none" })
    .rotate()
    .resize({ width: targetW, withoutEnlargement: true })
    .webp({ quality: 72, effort: 6 })
    .toFile(webpPath + ".tmp");
  fs.renameSync(webpPath + ".tmp", webpPath);

  // Re-encode original in place (same extension) so non-webp clients stay fast.
  const tmpOrig = filePath + ".tmp";
  if (ext === ".png") {
    await sharp(filePath, { failOn: "none" })
      .rotate()
      .resize({ width: targetW, withoutEnlargement: true })
      .png({ compressionLevel: 9, quality: 80, palette: false })
      .toFile(tmpOrig);
  } else if (ext === ".jpg" || ext === ".jpeg") {
    await sharp(filePath, { failOn: "none" })
      .rotate()
      .resize({ width: targetW, withoutEnlargement: true })
      .jpeg({ quality: 78, mozjpeg: true })
      .toFile(tmpOrig);
  } else {
    await sharp(filePath, { failOn: "none" })
      .rotate()
      .resize({ width: targetW, withoutEnlargement: true })
      .webp({ quality: 72, effort: 6 })
      .toFile(tmpOrig);
  }

  const before = stat.size;
  fs.renameSync(tmpOrig, filePath);
  const after = fs.statSync(filePath).size;
  const webpSize = fs.statSync(webpPath).size;
  return {
    base,
    beforeKb: Math.round(before / 1024),
    afterKb: Math.round(after / 1024),
    webpKb: Math.round(webpSize / 1024),
  };
}

async function main() {
  const files = fs
    .readdirSync(DIR)
    .filter((f) => /\.(png|jpe?g|webp)$/i.test(f))
    .map((f) => path.join(DIR, f));

  let saved = 0;
  for (const file of files) {
    try {
      const result = await compressOne(file);
      if (!result) continue;
      const delta = result.beforeKb - result.afterKb;
      saved += Math.max(0, delta);
      console.log(
        `${result.base}: ${result.beforeKb}KB → ${result.afterKb}KB (webp ${result.webpKb}KB)`
      );
    } catch (err) {
      console.warn(`skip ${path.basename(file)}:`, err.message);
    }
  }
  console.log(`Done. ~${saved}KB saved on originals (plus webp siblings).`);
}

main();
