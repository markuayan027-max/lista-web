import type { Course, User } from "@/lib/institutional-data";
import type { DbTestimonial } from "@/lib/lista-insforge-data";
import { contactInfo, schoolInfo } from "@/lib/institutional-data";

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
    coverImageUrl: course.galleryImages?.[0],
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
