import type { Course, Post, User } from "@/lib/institutional-data";
import { resolveCourseCoverImage } from "@/lib/course-images";
import {
  announcementToPost,
  type DbTestimonial,
  type ListaAnnouncement,
  type ListaPost,
} from "@/lib/lista-insforge-data";
import { contactInfo, posts as institutionalPosts, schoolInfo } from "@/lib/institutional-data";

/** Hide legacy commencement / speaker-linked stories from public news surfaces. */
export function isBlockedPublicNewsItem(text: string): boolean {
  const hay = text.toLowerCase();
  return (
    hay.includes("romualdez") ||
    hay.includes("speakermartin") ||
    hay.includes("speaker martin") ||
    hay.includes("19th commencement") ||
    hay.includes("office of the speaker")
  );
}

export function isBlockedPublicAnnouncement(a: ListaAnnouncement): boolean {
  return isBlockedPublicNewsItem(`${a.title} ${a.body}`);
}

export function isBlockedPublicPost(p: ListaPost): boolean {
  return isBlockedPublicNewsItem(
    `${p.title} ${p.excerpt} ${p.content} ${p.sourceUrl ?? ""}`,
  );
}

const DEFAULT_NEWS_IMAGE = "/news-scholarship.png";

export function resolveAnnouncementImageUrl(title: string, body: string): string {
  const hay = `${title} ${body}`.toLowerCase();
  if (hay.includes("scholarship") || hay.includes("twsp")) return DEFAULT_NEWS_IMAGE;
  if (hay.includes("women") || hay.includes("garden"))
    return "https://images.unsplash.com/photo-1416879595882-3373a0480b5b?auto=format&fit=crop&q=80&w=800";
  if (hay.includes("rabbit") || hay.includes("agri") || hay.includes("crop"))
    return "/agriculture-training.png";
  if (hay.includes("driving")) {
    return "https://images.unsplash.com/photo-1449965408869-eaa3f722e40d?auto=format&fit=crop&q=80&w=800";
  }
  if (hay.includes("graduate") || hay.includes("css") || hay.includes("computer"))
    return "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&q=80&w=800";
  return "/hero.png";
}

export function institutionalPostToListaPost(p: Post): ListaPost {
  return {
    id: p.id,
    title: p.title,
    excerpt: p.excerpt,
    content: p.content,
    date: p.date,
    category: p.category,
    imageUrl: p.imageUrl,
    author: p.author,
    sourceUrl: p.sourceUrl,
  };
}

/** Live announcements merged with curated posts; blocked stories excluded. */
export function buildPublicNewsFeed(announcements: ListaAnnouncement[]): ListaPost[] {
  const live = announcements
    .filter((a) => !isBlockedPublicAnnouncement(a))
    .map((a) => {
      const post = announcementToPost(a);
      return {
        ...post,
        imageUrl: post.imageUrl || resolveAnnouncementImageUrl(a.title, a.body),
      };
    })
    .filter((p) => !isBlockedPublicPost(p));

  const fallback = institutionalPosts
    .map(institutionalPostToListaPost)
    .filter((p) => !isBlockedPublicPost(p));

  const seen = new Set<string>();
  const merged: ListaPost[] = [];
  for (const post of [...live, ...fallback]) {
    const key = post.title.trim().toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    merged.push(post);
  }

  return merged.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}

export type HeroCourseItem = {
  id: string;
  slug: string;
  name: string;
  sector: string;
  ncLevel: string;
  description: string;
  shortDescription: string;
  coverImageUrl?: string;
  twspScholarship?: string;
  isFrozen?: boolean;
};

export type CourseListingPricing = {
  isScholarship: boolean;
  price?: number;
  originalPrice?: number;
  bestseller?: boolean;
  enrolledCount?: number;
};

/** National TESDA program catalog — descriptive content, not mock metrics. */
export const TESDA_SCHOLARSHIP_PROGRAMS = [
  {
    id: "twsp",
    title: "Training for Work Scholarship Program (TWSP)",
    description:
      "A TESDA scholarship program providing immediate help to job seekers through relevant skills training and competency assessment.",
    amount: "Full Tuition + Allowance",
    deadline: "Ongoing / Limited Slots",
    eligibility: [
      "Filipino citizen, at least 18 years old",
      "High school graduate or equivalent",
      "Unemployed or underemployed",
      "Not a current recipient of other TESDA scholarships",
    ],
  },
  {
    id: "step",
    title: "Special Training for Employment Program (STEP)",
    description:
      "Community-based specialty training program that addresses the specific skills needs of the communities and promote self-employment.",
    amount: "Free Training + Toolkit",
    deadline: "Seasonal",
    eligibility: [
      "Must be at least 15 years old",
      "Member of a marginalized group",
      "Willing to undergo entrepreneurship training",
    ],
  },
  {
    id: "pesfa",
    title: "Private Education Student Financial Assistance (PESFA)",
    description:
      "Educational assistance to poor but deserving students in post-secondary non-degree courses.",
    amount: "Tuition Subsidy",
    deadline: "Per Academic Year",
    eligibility: [
      "Annual family income not exceeding P300,000",
      "High school graduate",
      "At least 18 years old",
    ],
  },
] as const;

export function isCourseOpenForEnrollment(course: Course): boolean {
  return course.isAvailable !== false;
}

export function mapCourseToHeroItem(course: Course): HeroCourseItem {
  return {
    id: course.id,
    slug: course.slug,
    name: course.title,
    sector: course.category,
    ncLevel: course.ncLevel,
    description: course.longDescription,
    shortDescription: course.shortDescription,
    coverImageUrl: resolveCourseCoverImage(
      course.slug,
      course.category,
      course.galleryImages?.[0],
    ),
    twspScholarship: course.twsp ? "true" : "false",
    isFrozen: !isCourseOpenForEnrollment(course),
  };
}

export function getCourseListingPricing(course: Course): CourseListingPricing {
  if (course.twsp) {
    return { isScholarship: true, bestseller: course.tags.includes("Bestseller") };
  }
  if (course.fee != null && course.fee > 0) {
    return {
      isScholarship: false,
      price: course.fee,
      originalPrice: course.originalFee ?? undefined,
      bestseller: course.tags.includes("Bestseller"),
    };
  }
  return { isScholarship: false, bestseller: course.tags.includes("Bestseller") };
}

export function formatPublicCount(value: number): string {
  if (value >= 10_000) return `${Math.floor(value / 1000)}k+`;
  if (value >= 1_000) return `${(value / 1000).toFixed(1).replace(/\.0$/, "")}k+`;
  return String(value);
}

export function computeHomeHeroStats(courses: Course[], users: User[]) {
  const trainees = users.filter((u) => u.role === "trainee").length;
  const twspPrograms = courses.filter((c) => c.twsp).length;
  const years =
    schoolInfo.founded > 0 ? Math.max(1, new Date().getFullYear() - schoolInfo.founded) : 0;

  return [
    { value: formatPublicCount(trainees), label: "Registered Trainees", icon: "UserCheck" as const },
    { value: String(courses.length), label: "Programs", icon: "Library" as const },
    { value: String(twspPrograms), label: "TWSP Programs", icon: "BookOpen" as const },
    {
      value: years > 0 ? `${years}+` : "—",
      label: "Years Serving Learners",
      icon: "Trophy" as const,
    },
  ];
}

export function computeScholarshipPageStats(courses: Course[], faqCount: number) {
  const twspOpen = courses.filter((c) => c.twsp && isCourseOpenForEnrollment(c)).length;
  return [
    { label: "TWSP programs open", value: String(twspOpen), icon: "Award" as const },
    { label: "Programs in catalog", value: String(courses.length), icon: "Users" as const },
    {
      label: "Scholarship programs",
      value: String(TESDA_SCHOLARSHIP_PROGRAMS.length),
      icon: "Info" as const,
    },
    { label: "Scholarship FAQs", value: String(faqCount), icon: "DollarSign" as const },
  ];
}

export type SiteSettings = {
  institutionName: string;
  supportEmail: string;
  phoneNumber: string;
  address: string;
  primaryColor: string;
  accentColor: string;
};

const SETTINGS_STORAGE_KEY = "lista-site-settings";

export function defaultSiteSettings(): SiteSettings {
  return {
    institutionName: schoolInfo.fullName,
    supportEmail: contactInfo.email,
    phoneNumber: contactInfo.mobile1,
    address: contactInfo.mainAddress,
    primaryColor: "#0f172a",
    accentColor: "#3b82f6",
  };
}

export function loadSiteSettings(): SiteSettings {
  try {
    const raw = localStorage.getItem(SETTINGS_STORAGE_KEY);
    if (!raw) return defaultSiteSettings();
    return { ...defaultSiteSettings(), ...JSON.parse(raw) };
  } catch {
    return defaultSiteSettings();
  }
}

export function saveSiteSettings(settings: SiteSettings): void {
  localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(settings));
}

export function countScholarshipFaqs(faqs: { category: string }[]): number {
  return faqs.filter((f) => f.category.toLowerCase().includes("scholarship")).length;
}

export type PublicTestimonial = {
  id: string;
  quote: string;
  attribution: string;
  name: string;
  role: string;
  imageUrl: string;
};

export function mapTestimonialsForHome(testimonials: DbTestimonial[]): PublicTestimonial[] {
  return testimonials.slice(0, 3).map((t) => ({
    id: t.id,
    quote: t.quote,
    attribution: t.name,
    name: t.name,
    role: t.role || "LISTA Graduate",
    imageUrl: t.imageUrl || "/hero.png",
  }));
}
