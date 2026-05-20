/**
 * Generates WebP assets + responsive widths and public/image-manifest.json.
 * Run: node scripts/optimize-public-images.mjs
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PUBLIC = path.resolve(__dirname, "..", "public");
const MANIFEST_PATH = path.resolve(__dirname, "..", "src", "lib", "image-manifest.json");

function readPreviousManifest() {
  if (!fs.existsSync(MANIFEST_PATH)) return null;
  try {
    return JSON.parse(fs.readFileSync(MANIFEST_PATH, "utf8"));
  } catch {
    return null;
  }
}

function getSourceFingerprint(inputPath, preset) {
  const stat = fs.statSync(inputPath);
  const presetDef = PRESETS[preset];
  return `${stat.size}:${stat.mtimeMs}:${preset}:${JSON.stringify(presetDef)}`;
}

function outputsExist(asset) {
  if (!asset || !asset.defaultSrc || !asset.variants) return false;
  const allOutputs = new Set([asset.defaultSrc, ...Object.values(asset.variants)]);
  for (const rel of allOutputs) {
    const target = path.join(PUBLIC, String(rel).replace(/^\//, ""));
    if (!fs.existsSync(target)) return false;
  }
  return true;
}

/** @type {Record<string, { widths: number[]; maxWidth: number; quality: number }>} */
const PRESETS = {
  hero: { widths: [640, 960, 1280, 1920], maxWidth: 1920, quality: 82 },
  course: { widths: [400, 640, 960, 1280], maxWidth: 1280, quality: 80 },
  portrait: { widths: [320, 480, 640], maxWidth: 640, quality: 82 },
  partner: { widths: [128, 192, 256], maxWidth: 256, quality: 88 },
  news: { widths: [400, 640, 960], maxWidth: 960, quality: 80 },
  og: { widths: [1200], maxWidth: 1200, quality: 85 },
};

/** source filename in public/ → preset + canonical web path (no spaces) */
const FILES = [
  { file: "hero.png", preset: "hero", out: "/hero" },
  { file: "agriculture-training.png", preset: "course", out: "/agriculture-training" },
  { file: "course-beauty-care.png", preset: "course", out: "/course-beauty-care" },
  { file: "course-hospitality.png", preset: "course", out: "/course-hospitality" },
  { file: "course-healthcare.png", preset: "course", out: "/course-healthcare" },
  { file: "course-marketing.png", preset: "course", out: "/course-marketing" },
  { file: "course-ui-ux.png", preset: "course", out: "/course-ui-ux" },
  { file: "graduate-bookkeeper.png", preset: "course", out: "/graduate-bookkeeper" },
  { file: "graduate-electrician.png", preset: "course", out: "/graduate-electrician" },
  { file: "graduate-it-support.png", preset: "course", out: "/graduate-it-support" },
  { file: "commencement_exercises.png", preset: "course", out: "/commencement_exercises" },
  { file: "news-scholarship.png", preset: "news", out: "/news-scholarship" },
  { file: "course-project-management.png", preset: "course", out: "/course-project-management" },
  { file: "course-cybersecurity.png", preset: "course", out: "/course-cybersecurity" },
  { file: "course-data-science.png", preset: "course", out: "/course-data-science" },
  { file: "course-dressmaking.png", preset: "course", out: "/course-dressmaking" },
  { file: "course-web-dev.png", preset: "course", out: "/course-web-dev" },
  { file: "assessment promotional image.png", preset: "portrait", out: "/assessment-promotional" },
  { file: "LISTA FOUNDER.webp", preset: "portrait", out: "/lista-founder", isWebp: true },
  { file: "logo.webp", preset: "partner", out: "/logo" },
  { file: "opengraph.jpg", preset: "og", out: "/opengraph" },
  {
    file: "TESDA_Logo_official-removebg-preview.png",
    preset: "partner",
    out: "/partners/tesda-logo",
  },
  { file: "DepEd logo.png", preset: "partner", out: "/partners/deped-logo" },
  {
    file: "ATI (Agricultural Training Institute) LOGO.png",
    preset: "partner",
    out: "/partners/ati-logo",
  },
  {
    file: "NVTC (National Vocational Training Council) is INTERNATIONAL LOGO.webp",
    preset: "partner",
    out: "/partners/nvtc-logo",
    isWebp: true,
  },
  { file: "logo.png", preset: "partner", out: "/partners/lto-logo" },
];

async function processEntry({ file, preset, out, isWebp }, previousAsset, previousGeneratedAt) {
  const inputPath = path.join(PUBLIC, file);
  if (!fs.existsSync(inputPath)) {
    console.warn(`skip (missing): ${file}`);
    return null;
  }

  const sourceFingerprint = getSourceFingerprint(inputPath, preset);
  const inputMtime = fs.statSync(inputPath).mtimeMs;
  const previousBuildTime = Number.isFinite(previousGeneratedAt) ? previousGeneratedAt : 0;
  const unchangedSinceLastBuild = inputMtime <= previousBuildTime;
  if (previousAsset && outputsExist(previousAsset)) {
    if (previousAsset.sourceFingerprint === sourceFingerprint || unchangedSinceLastBuild) {
      return {
        key: out,
        ...previousAsset,
        sourceFingerprint,
        reused: true,
      };
    }
  }

  const { widths, maxWidth, quality } = PRESETS[preset];
  const outDir = path.join(PUBLIC, path.dirname(out).replace(/^\//, ""));
  fs.mkdirSync(outDir, { recursive: true });

  const baseName = path.basename(out);
  const pipeline = sharp(inputPath, { failOn: "none" }).rotate();
  const meta = await pipeline.metadata();
  const intrinsicW = meta.width ?? maxWidth;
  const intrinsicH = meta.height ?? maxWidth;

  const targetWidths = [...new Set(widths)]
    .filter((w) => w <= Math.min(maxWidth, intrinsicW))
    .sort((a, b) => a - b);
  if (!targetWidths.includes(Math.min(maxWidth, intrinsicW)) && intrinsicW <= maxWidth) {
    targetWidths.push(intrinsicW);
  }
  if (targetWidths.length === 0) targetWidths.push(Math.min(640, intrinsicW));

  const variants = {};
  const largestW = targetWidths[targetWidths.length - 1];

  const defaultRel = `${out}.webp`;
  const defaultDest = path.join(PUBLIC, defaultRel.replace(/^\//, ""));
  const inputIsDefault =
    path.resolve(inputPath) === path.resolve(defaultDest);

  for (const w of targetWidths) {
    const rel = w === largestW ? defaultRel : `${out}-${w}w.webp`;
    const dest = path.join(PUBLIC, rel.replace(/^\//, ""));
    if (inputIsDefault && w === largestW) {
      variants[w] = defaultRel;
      continue;
    }
    await sharp(inputPath)
      .rotate()
      .resize({ width: w, withoutEnlargement: true })
      .webp({ quality, effort: 4 })
      .toFile(dest);
    variants[w] = rel;
  }

  if (!inputIsDefault) {
    await sharp(inputPath)
      .rotate()
      .resize({ width: Math.min(maxWidth, intrinsicW), withoutEnlargement: true })
      .webp({ quality, effort: 4 })
      .toFile(defaultDest);
  }

  const defaultSrc = defaultRel;
  const scale = intrinsicW > 0 ? intrinsicH / intrinsicW : 1;

  return {
    key: out,
    defaultSrc,
    fallbackSrc: isWebp ? defaultSrc : `/${file.split(path.sep).pop()}`,
    width: intrinsicW,
    height: Math.round(intrinsicW * scale),
    variants,
    preset,
    sourceFingerprint,
    reused: false,
  };
}

async function main() {
  const previousManifest = readPreviousManifest();
  const previousAssets = previousManifest?.assets ?? {};
  const previousGeneratedAt = previousManifest?.generatedAt
    ? Date.parse(previousManifest.generatedAt)
    : 0;
  const manifest = { generatedAt: new Date().toISOString(), assets: {} };

  for (const entry of FILES) {
    const result = await processEntry(entry, previousAssets[entry.out], previousGeneratedAt);
    if (result) {
      manifest.assets[result.key] = {
        defaultSrc: result.defaultSrc,
        fallbackSrc: result.fallbackSrc,
        width: result.width,
        height: result.height,
        variants: result.variants,
        preset: result.preset,
        sourceFingerprint: result.sourceFingerprint,
      };
      if (result.reused) {
        console.log(`skip unchanged ${entry.file} → ${result.defaultSrc}`);
      } else {
        console.log(`ok ${entry.file} → ${result.defaultSrc}`);
      }
    }
  }

  fs.writeFileSync(MANIFEST_PATH, JSON.stringify(manifest, null, 2));
  console.log(`manifest → ${MANIFEST_PATH}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
