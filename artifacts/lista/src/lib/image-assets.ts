import { withBase } from "@/lib/with-base";
import manifest from "./image-manifest.json";

export type ImageManifestEntry = {
  defaultSrc: string;
  fallbackSrc: string;
  width: number;
  height: number;
  variants: Record<string, string>;
  preset: string;
};

type ImageManifest = {
  generatedAt: string;
  assets: Record<string, ImageManifestEntry>;
};

const MANIFEST = manifest as ImageManifest;

/** Legacy path → manifest key */
const LEGACY_PATH_TO_KEY: Record<string, string> = {
  "/hero.png": "/hero",
  "/hero.webp": "/hero",
  "/agriculture-training.png": "/agriculture-training",
  "/course-beauty-care.png": "/course-beauty-care",
  "/course-hospitality.png": "/course-hospitality",
  "/course-healthcare.png": "/course-healthcare",
  "/course-marketing.png": "/course-marketing",
  "/course-ui-ux.png": "/course-ui-ux",
  "/graduate-bookkeeper.png": "/graduate-bookkeeper",
  "/graduate-electrician.png": "/graduate-electrician",
  "/graduate-it-support.png": "/graduate-it-support",
  "/commencement_exercises.png": "/commencement_exercises",
  "/news-scholarship.png": "/news-scholarship",
  "/course-project-management.png": "/course-project-management",
  "/course-cybersecurity.png": "/course-cybersecurity",
  "/course-data-science.png": "/course-data-science",
  "/course-dressmaking.png": "/course-dressmaking",
  "/course-web-dev.png": "/course-web-dev",
  "/assessment promotional image.png": "/assessment-promotional",
  "/LISTA FOUNDER.webp": "/lista-founder",
  "/LISTA FOUNDER.png": "/lista-founder",
  "/logo.webp": "/logo",
  "/logo.png": "/logo",
  "/TESDA_Logo_official-removebg-preview.png": "/partners/tesda-logo",
  "/DepEd logo.png": "/partners/deped-logo",
  "/ATI (Agricultural Training Institute) LOGO.png": "/partners/ati-logo",
  "/NVTC (National Vocational Training Council) is INTERNATIONAL LOGO.webp": "/partners/nvtc-logo",
  "/NVTC (National Vocational Training Council) is INTERNATIONAL LOGO.webp.png":
    "/partners/nvtc-logo",
  "/opengraph.jpg": "/opengraph",
};

/** Original public paths — OptimizedImage serves WebP from the same source assets. */
export type PartnerLogo = {
  src: string;
  alt: string;
  /** Short name shown under the logo */
  label: string;
  /** Full institution name for identification (omit when the artwork already includes it) */
  fullLabel: string;
  /** Horizontal wordmark — uses a wide slot instead of a square seal frame */
  wide?: boolean;
};

export const PARTNER_LOGOS_HOME: readonly PartnerLogo[] = [
  {
    src: "/partners/tesda-logo.webp",
    alt: "TESDA Logo",
    label: "TESDA",
    fullLabel: "Technical Education & Skills Development Authority",
  },
  {
    src: "/partners/deped-logo.webp",
    alt: "Department of Education (DepEd)",
    label: "DepEd",
    fullLabel: "",
    wide: true,
  },
  {
    src: "/partners/ati-logo.webp",
    alt: "ATI Logo",
    label: "ATI",
    fullLabel: "Agricultural Training Institute",
  },
  {
    src: "/partners/nvtc-logo.webp",
    alt: "NVTC Logo",
    label: "NVTC",
    fullLabel: "National Vocational Training Council",
  },
] as const;

export const PARTNER_LOGOS_MARQUEE: readonly PartnerLogo[] = [
  ...PARTNER_LOGOS_HOME,
  {
    src: "/logo.png",
    alt: "LTO Logo",
    label: "LTO",
    fullLabel: "Land Transportation Office",
  },
];

const PRESET_SIZES: Record<string, string> = {
  hero: "(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 640px",
  course: "(max-width: 640px) 90vw, (max-width: 1024px) 45vw, 320px",
  portrait: "(max-width: 768px) 90vw, 480px",
  partner: "(max-width: 768px) 25vw, 128px",
  news: "(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 400px",
  og: "1200px",
};

function stripBasePath(src: string): string {
  const base = (import.meta.env.BASE_URL || "/").replace(/\/$/, "");
  if (!base || base === "/") return src;
  if (src.startsWith(base + "/")) return src.slice(base.length);
  if (src.startsWith(base)) return src.slice(base.length) || "/";
  return src;
}

function normalizePath(src: string): string {
  const trimmed = src.trim();
  if (!trimmed || trimmed.startsWith("data:")) {
    return trimmed;
  }
  if (trimmed.startsWith("http")) {
    try {
      const { pathname } = new URL(trimmed);
      return pathname || trimmed;
    } catch {
      return trimmed;
    }
  }
  const path = stripBasePath(trimmed);
  return path.startsWith("/") ? path : `/${path}`;
}

export function resolveManifestKey(src: string): string | null {
  const path = normalizePath(src);
  if (MANIFEST.assets[path]) return path;
  return LEGACY_PATH_TO_KEY[path] ?? null;
}

export function getManifestEntry(src: string): ImageManifestEntry | null {
  const key = resolveManifestKey(src);
  if (!key) return null;
  return MANIFEST.assets[key] ?? null;
}

export function buildSrcSet(
  variants: Record<string, string>,
  format: "webp" | "fallback" = "webp",
): string {
  return Object.entries(variants)
    .sort(([a], [b]) => Number(a) - Number(b))
    .map(([w, url]) => {
      const href = format === "webp" ? url : url.replace(/\.webp$/i, ".png");
      return `${withBase(href)} ${w}w`;
    })
    .join(", ");
}

export function defaultSizesForEntry(entry: ImageManifestEntry): string {
  return PRESET_SIZES[entry.preset] ?? "(max-width: 1200px) 100vw, 1200px";
}

/** Prefer WebP path for a legacy .png reference when manifest exists. */
export function toOptimizedPath(src: string): string {
  const entry = getManifestEntry(src);
  if (entry) return entry.defaultSrc;
  const path = normalizePath(src);
  if (path.endsWith(".png") || path.endsWith(".jpg") || path.endsWith(".jpeg")) {
    return path.replace(/\.(png|jpe?g)$/i, ".webp");
  }
  return path;
}

export function getLcpPreload(): { href: string; srcSet: string; sizes: string } | null {
  const entry = MANIFEST.assets["/hero"];
  if (!entry) return null;
  const srcSet = buildSrcSet(entry.variants);
  return {
    href: withBase(entry.defaultSrc),
    srcSet,
    sizes: defaultSizesForEntry(entry),
  };
}
