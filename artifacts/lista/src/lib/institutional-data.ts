import { addDays } from "date-fns";

const today = new Date();

/**
 * Formats a date to YYYY-MM-DD string
 */
function formatDate(date: Date): string {
  return date.toISOString().split('T')[0];
}

// ============================================================================
// UTILS & CORE TYPES
// ============================================================================

export type UserRole = 'trainee' | 'staff' | 'admin';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatarUrl?: string;
  createdAt?: string;
}

export const siteConfig = {
  name: "Lorenz ISTA (LISTA)",
  tagline: "Investing in your future.",
  description: "Lorenz International Skills Training Academy (LISTA) is dedicated to empowering individuals through technical training and innovative education.",
  contact: {
    phone: "(088) 861-4200",
    mobile: "09051095284",
    email: "admin@lorenzinternational.org",
    address: "FJY Bldg., National Highway, Barangay 24-A, Gingoog City",
    social: {
      youtube: "https://www.youtube.com/channel/UCYm7d1QL0ERNWPO5-S03cJg",
    }
  }
};

// ============================================================================
// SCHOOL IDENTITY
// ============================================================================

export const schoolInfo = {
  fullName: "Lorenz International Skills Training Academy, Inc.",
  shortName: "Lorenz ISTA",
  acronym: "LISTA",
  tagline: "We are investing in your future.",
  taglines: [
    "We are investing in your future.",
    "We are here for you in pursuit of success in TechVoc Education.",
    "Your pathway to success. We equip you with the skills, knowledge and positive attitude to achieve your goals and secure a brighter future."
  ],
  founded: 2014,
  city: "Gingoog City",
  province: "Misamis Oriental",
  country: "Philippines",
  type: "Technical-Vocational Education and Training Institution (TVET)",
  website: "lorenzinternational.org",
  copyright: "© 2024 LORENZ INTERNATIONAL SKILLS TRAINING ACADEMY, INC. All Rights Reserved.",
};

export const contactInfo = {
  mainAddress: "FJY Bldg., National Highway, Barangay 24-A, Gingoog City, Misamis Oriental 9014, Philippines",
  altAddress: "Guno – Condeza Streets, Barangay 16, Gingoog City, Misamis Oriental, Philippines",
  farmAddress: "Sitio Civoleg, Lunotan, Gingoog City, Misamis Oriental",
  telephone: "(088) 861-4200",
  mobile1: "09051095284",
  mobile2: "0917-523-2724",
  mobile3: "0926-854-1906",
  mobile4: "0935-856-4298",
  officeHours: "Monday – Saturday, 8:00 AM – 5:00 PM",
  email: "admin@lorenzinternational.org",
  youtube: "https://www.youtube.com/channel/UCYm7d1QL0ERNWPO5-S03cJg",
};

export const leadership = [
  {
    id: "l1",
    name: "Lorenzo Tamparong Zapanta",
    role: "Founding Inspiration",
    bio: "The visionary behind LISTA whose legacy of kindness, unwavering dedication, and spirit of empowerment continues to inspire and impact generations of students in Gingoog City.",
    image: "/LISTA FOUNDER.webp",
  },
  {
    id: "l2",
    name: "Maggie Gudella Z. Tse",
    role: "School President & Owner",
    bio: "A prominent leader in TechVoc education and a respected resource person for agricultural training programs across Region X. Under her leadership, LISTA has expanded its reach through community partnerships and government-sponsored skills development initiatives.",
    sourceUrl: "https://ph.linkedin.com/in/maggie-tse-691484199",
  },
  {
    id: "l3",
    name: "Presca Villegas",
    role: "Staff Member",
    bio: "Dedicated administrative staff member ensuring smooth institutional operations and student support services.",
    sourceUrl: "https://ph.linkedin.com/in/presca-villegas-61aa4036a",
  },
  {
    id: "l4",
    name: "Ryan Campanai Oblig",
    role: "Staff Member",
    bio: "Technical and administrative professional contributing to the academy's growth and compliance.",
    sourceUrl: "https://ph.linkedin.com/in/ryan-campanai-oblig-a7b2224a",
  },
  {
    id: "l5",
    name: "Lina Theresa Zapanta Escudero",
    role: "School Administrator",
    bio: "Manages the day-to-day institutional operations and ensures academic excellence across all technical-vocational programs.",
  },
  {
    id: "l6",
    name: "Joseph Carlo Hormillada Espiritu",
    role: "Registrar / MIS Manager",
    bio: "Oversees student records, management information systems, and technical documentation for institutional compliance.",
  }
];

// ============================================================================
// COMPLIANCE & MISSION
// ============================================================================

export const accreditations = [
  { id: "ac1", code: "TESDA", name: "Technical Education and Skills Development Authority", role: "Primary Regulatory Body" },
  { id: "ac2", code: "CHED", name: "Commission on Higher Education", role: "Recognized Higher Education Partner" },
  { id: "ac3", code: "DepEd", name: "Department of Education", role: "JDVP-TVL Partner Institution" },
  { id: "ac4", code: "ATI", name: "Agricultural Training Institute — Northern Mindanao", role: "Official Training Partner" },
  { id: "ac5", code: "LTO", name: "Land Transportation Office", role: "Accredited Driving School Partner" },
  { id: "ac6", code: "CAO-Gingoog", name: "City Agriculture Office of Gingoog City", role: "Community Extension Partner" },
  { id: "ac7", code: "TWSP", name: "Training for Work Scholarship Program", role: "TESDA Scholarship Provider" },
];

export const missionVision = {
  mission: "Empowering individuals through collaborative technical training, innovative education, and industry-driven production services. We foster excellence and drive transformative growth within the global technological landscape.",
  vision: "To be the leading, nationally recognized center of excellence in providing accurate, reliable, and efficient competency assessments that align with global standards.",
  strategicTarget: "To consistently provide high-quality, industry-aligned competency assessment services that result in a 20% increase in client satisfaction within one year, leading to 1,500 successful certifications and a 75% employment rate among assessed individuals.",
};

export const pillars = [
  { id: "p1", title: "Quality Assessment", description: "TESDA-standard competency evaluation ensuring accuracy, integrity, and reliability for every learner." },
  { id: "p2", title: "Global Standards", description: "Programs and assessments aligned with internationally recognized industry requirements and qualifications." },
  { id: "p3", title: "Skills Development", description: "Practical, hands-on training that bridges the gap between classroom learning and real-world application." },
  { id: "p4", title: "Career Placement", description: "Committed to a 75% employment rate among certified graduates through industry linkages and career support." },
];

export const assessmentCenter = {
  name: "Lorenz ISTA Assessment Center",
  type: "TESDA-Accredited Competency Assessment Center",
  location: "FJY Bldg., National Highway, Barangay 24-A, Gingoog City, Misamis Oriental 9014",
  system: "Philippine TVET Competency Assessment and Certification System (PTCACS)",
  targetCertifications: 1500,
  targetEmploymentRate: 75,
  clientSatisfactionIncrease: 20,
  qualifications: [
    { name: "Agricultural Crops Production", ncLevel: "NC I", sector: "Agriculture" },
    { name: "Agricultural Crops Production", ncLevel: "NC II", sector: "Agriculture" },
    { name: "Beauty Care (Nailcare) Services", ncLevel: "NC II", sector: "Beauty/Wellness" },
    { name: "Bookkeeping", ncLevel: "NC II", sector: "Business" },
    { name: "Computer Systems Servicing", ncLevel: "NC II", sector: "ICT" },
    { name: "Driving", ncLevel: "NC II", sector: "Automotive" },
    { name: "Electrical Installation & Maintenance", ncLevel: "NC II", sector: "Construction" },
    { name: "HEO — Backhoe Loader Operations", ncLevel: "NC II", sector: "Construction" },
  ],
};

export const officialDocuments = [
  {
    id: "doc1",
    title: "TESDA Certificate of Accreditation",
    category: "Accreditation",
    issuedBy: "TESDA Region X",
    image: "/TESDA_Logo_official-removebg-preview.png",
    description: "Official accreditation as a Technical-Vocational Education and Training (TVET) institution."
  },
  {
    id: "doc2",
    title: "DepEd JDVP-TVL Partnership",
    category: "Partnership",
    issuedBy: "Dept. of Education",
    image: "/DepEd logo.png",
    description: "Certificate of partnership for the Joint Delivery Voucher Program for TVL students."
  },
  {
    id: "doc3",
    title: "ATI Training Site Certificate",
    category: "Training",
    issuedBy: "Agricultural Training Institute",
    image: "/ATI (Agricultural Training Institute) LOGO.png",
    description: "Official recognition as a certified training site for agricultural programs."
  },
  {
    id: "doc4",
    title: "LTO Accreditation",
    category: "Accreditation",
    issuedBy: "Land Transportation Office",
    image: "/logo.png",
    description: "Accredited driving school partner for professional driving programs."
  }
];

// ============================================================================
// EVENTS & MILESTONES
// ============================================================================

export const events = [
  {
    id: "ev1",
    title: "19th Commencement Exercises & TESDA Scholar Payout",
    date: "2024-03-24",
    endDate: "2024-03-24",
    participants: 800,
    location: "Arturo S. Lugod Memorial Gym, Gingoog City",
    partners: ["TESDA Region X", "DSWD – Assistance to Individuals in Crisis Situations (AICS)", "Office of the Speaker of the House"],
    description: "On March 24, 2024, LISTA held its 19th Commencement Exercises at the Arturo S. Lugod Memorial Gym. The event doubled as a payout ceremony where over 800 TESDA TWSP scholars each received ₱3,000 in financial assistance through the DSWD AICS program. Local government officials and a representative from the Office of the Speaker of the House graced the occasion alongside School President Maggie Gudella Z. Tse.",
  },
  {
    id: "ev2",
    title: "National Women's Celebration Month Capability Training",
    date: "2024-03-20",
    endDate: "2024-03-22",
    participants: 30,
    location: "Lorenz International Skills Training Academy, Gingoog City",
    partners: ["ATI Northern Mindanao (Region X)", "City Agriculture Office of Gingoog City"],
    description: "In March 2024, LISTA hosted a transformative three-day capability training program in support of National Women's Celebration Month. Thirty women from Gingoog City participated in practical sessions covering urban gardening, composting, soil preparation, and seedling cultivation — empowering them with sustainable livelihood skills.",
    sourceUrl: "https://ati2.da.gov.ph/ati-10/content/article/vic-thor-palarca/empowering-women-through-capability-training-recap-national-womens",
  },
  {
    id: "ev3",
    title: "Training of Trainers on Rabbitry Production",
    date: "2024-06-03",
    endDate: "2024-06-07",
    participants: 20,
    location: "LISTA Training Farm, Sitio Civoleg, Lunotan, Gingoog City",
    partners: ["ATI Regional Training Center X (ATI-RTC X)"],
    description: "In June 2024, LISTA's training farm in Lunotan became the venue for a five-day Training of Trainers on Rabbitry Production as an Enterprise — organized by ATI-RTC X. Twenty participants from Bukidnon, Misamis Oriental, and Misamis Occidental underwent intensive training on rabbit breeds, feeding, management, and meat processing.",
  },
];

// ============================================================================
// COURSES (Accredited Programs)
// ============================================================================

export interface Course {
  id: string;
  slug: string;
  title: string;
  ncLevel: string;
  category: string;
  level: string;
  twsp: boolean;
  tags: string[];
  durationHours: number;
  durationDays?: number;
  startDate?: string;
  endDate?: string;
  shortDescription: string;
  longDescription: string;
  trainer?: string;
  galleryImages: string[];
  isAvailable?: boolean;
  /** Paid program fee (PHP); null when TWSP or fee not set in InsForge. */
  fee?: number | null;
  originalFee?: number | null;
}

/** @deprecated Use useCourses() / fetchCourses() — InsForge `courses` */
export const courses: Course[] = [
  {
    id: "c1",
    slug: "agricultural-crops-production-nc-i",
    title: "Agricultural Crops Production",
    ncLevel: "NC I",
    category: "Agriculture",
    level: "NC I",
    twsp: true,
    tags: ["Agriculture", "TWSP"],
    durationHours: 302,
    durationDays: 38,
    shortDescription: "Foundational training in crop cultivation and farm maintenance.",
    longDescription: "Covers the basic skills required to support nursery work, horticultural and agronomic crop production, and irrigation maintenance.",
    galleryImages: ["https://images.unsplash.com/photo-1592982537447-6f2a6a0c5c10?auto=format&fit=crop&q=80&w=800"],
    isAvailable: true,
  },
  {
    id: "c2",
    slug: "agricultural-crops-production-nc-ii",
    title: "Agricultural Crops Production",
    ncLevel: "NC II",
    category: "Agriculture",
    level: "NC II",
    twsp: true,
    tags: ["Agriculture", "TWSP"],
    durationHours: 336,
    shortDescription: "Intermediate crop production and post-harvest management.",
    longDescription: "Builds upon foundational agricultural skills, focusing on nursery management, systematic planting, crop maintenance, and post-harvest handling.",
    galleryImages: ["https://images.unsplash.com/photo-1625246333195-78d9c38ad449?auto=format&fit=crop&q=80&w=800"],
    isAvailable: false,
  },
  {
    id: "c3",
    slug: "animal-production-poultry-chicken-nc-ii",
    title: "Animal Production (Poultry-Chicken)",
    ncLevel: "NC II",
    category: "Agriculture",
    level: "NC II",
    twsp: true,
    tags: ["Agriculture", "Livestock", "TWSP"],
    durationHours: 300,
    shortDescription: "Training in poultry and chicken production management.",
    longDescription: "Covers competencies required for raising poultry and producing chicken for meat or eggs.",
    galleryImages: ["https://images.unsplash.com/photo-1516467508483-a7212febe31a?auto=format&fit=crop&q=80&w=800"],
  },
  {
    id: "c4",
    slug: "animal-production-ruminants-nc-ii",
    title: "Animal Production (Ruminants)",
    ncLevel: "NC II",
    category: "Agriculture",
    level: "NC II",
    twsp: true,
    tags: ["Agriculture", "Livestock", "TWSP"],
    durationHours: 300,
    shortDescription: "Management of ruminant animals like cattle and goats.",
    longDescription: "Focuses on the care, breeding, and production of ruminant livestock.",
    galleryImages: ["https://images.unsplash.com/photo-1527153857715-3908f2bae5e8?auto=format&fit=crop&q=80&w=800"],
  },
  {
    id: "c5",
    slug: "animal-production-swine-nc-ii",
    title: "Animal Production (Swine)",
    ncLevel: "NC II",
    category: "Agriculture",
    level: "NC II",
    twsp: true,
    tags: ["Agriculture", "Livestock", "TWSP"],
    durationHours: 300,
    shortDescription: "Professional swine raising and management.",
    longDescription: "Covers pig production, feeding, health management, and housing.",
    galleryImages: ["https://images.unsplash.com/photo-1594142404563-64cccaf5a10f?auto=format&fit=crop&q=80&w=800"],
  },
  {
    id: "c6",
    slug: "beauty-care-nail-care-services-nc-ii",
    title: "Beauty Care (Nail Care) Services",
    ncLevel: "NC II",
    category: "Beauty/Wellness",
    level: "NC II",
    twsp: true,
    tags: ["Beauty", "TWSP"],
    durationHours: 150,
    shortDescription: "Professional nail care and spa services.",
    longDescription: "Develops specialized skills in manicure, pedicure, and hand/foot spa treatments.",
    galleryImages: ["https://images.unsplash.com/photo-1519014816548-bf5fe059e98b?auto=format&fit=crop&q=80&w=800"],
  },
  {
    id: "c7",
    slug: "bookkeeping-nc-iii",
    title: "Bookkeeping",
    ncLevel: "NC III",
    category: "Business",
    level: "NC III",
    twsp: true,
    tags: ["Business", "TWSP"],
    durationHours: 292,
    startDate: formatDate(new Date()),
    endDate: formatDate(addDays(new Date(), 45)),
    shortDescription: "Advanced recording and management of financial transactions.",
    longDescription: "Equips students with the competency to perform bookkeeping functions including journalizing and posting transactions.",
    galleryImages: ["https://images.unsplash.com/photo-1450101499163-c8848c66ca85?auto=format&fit=crop&q=80&w=800"],
  },
  {
    id: "c8",
    slug: "bread-and-pastry-production-nc-ii",
    title: "Bread and Pastry Production",
    ncLevel: "NC II",
    category: "Tourism",
    level: "NC II",
    twsp: true,
    tags: ["Bakery", "Tourism", "TWSP"],
    durationHours: 141,
    shortDescription: "Baking and pastry arts for commercial service.",
    longDescription: "Covers the preparation and production of bakery products, pastry products, cakes, and desserts.",
    galleryImages: ["https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&q=80&w=800"],
  },
  {
    id: "c9",
    slug: "computer-systems-servicing-nc-ii",
    title: "Computer Systems Servicing - Mobile Training Program",
    ncLevel: "NC II",
    category: "ICT",
    level: "NC II",
    twsp: true,
    tags: ["ICT", "TWSP"],
    durationHours: 280,
    shortDescription: "Professional computer maintenance, networking, and server setup.",
    longDescription: "Covers the installation, configuration, and maintenance of computer systems, networking, and servers.",
    trainer: "Oseas G. Jesto, Jr.",
    galleryImages: ["https://images.unsplash.com/photo-1591799264318-7e6ef8ddb7ea?auto=format&fit=crop&q=80&w=800"],
  },
  {
    id: "c10",
    slug: "cookery-nc-ii",
    title: "Cookery",
    ncLevel: "NC II",
    category: "Tourism",
    level: "NC II",
    twsp: true,
    tags: ["Culinary", "Tourism", "TWSP"],
    durationHours: 316,
    shortDescription: "Professional kitchen skills and food preparation.",
    longDescription: "Focuses on the preparation of various hot and cold dishes for institutional or commercial kitchens.",
    galleryImages: ["https://images.unsplash.com/photo-1556910103-1c02745aae4d?auto=format&fit=crop&q=80&w=800"],
  },
  {
    id: "c11",
    slug: "domestic-work-nc-ii",
    title: "Domestic Work",
    ncLevel: "NC II",
    category: "Social",
    level: "NC II",
    twsp: true,
    tags: ["Service", "TWSP"],
    durationHours: 218,
    shortDescription: "Essential skills for household management and care.",
    longDescription: "Covers cleaning, laundry, cooking, and child/elderly care for domestic environments.",
    galleryImages: ["https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&q=80&w=800"],
  },
  {
    id: "c12",
    slug: "driving-nc-ii",
    title: "Driving - Mobile Training Program",
    ncLevel: "NC II",
    category: "Automotive",
    level: "NC II",
    twsp: true,
    tags: ["Automotive", "TWSP"],
    durationHours: 118,
    shortDescription: "Professional driving and basic vehicle maintenance.",
    longDescription: "Accredited by the LTO and TESDA, this course covers safe vehicle operation and defensive driving.",
    trainer: "Jojet A. Cañete",
    galleryImages: ["https://images.unsplash.com/photo-1449965408869-eaa3f722e40d?auto=format&fit=crop&q=80&w=800"],
  },
  {
    id: "c13",
    slug: "electrical-installation-maintenance-nc-ii",
    title: "Electrical Installation & Maintenance - Mobile Training Program",
    ncLevel: "NC II",
    category: "Construction",
    level: "NC II",
    twsp: true,
    tags: ["Construction", "TWSP"],
    durationHours: 402,
    shortDescription: "Building electrical systems installation and maintenance.",
    longDescription: "Covers the installation and maintenance of electrical wiring, lighting and related equipment.",
    trainer: "Rey Y. Maputol",
    galleryImages: ["https://images.unsplash.com/photo-1621905251918-48416bd8575a?auto=format&fit=crop&q=80&w=800"],
  },
  {
    id: "c14",
    slug: "food-beverage-services-nc-ii",
    title: "Food & Beverage Services",
    ncLevel: "NC II",
    category: "Tourism",
    level: "NC II",
    twsp: true,
    tags: ["Tourism", "TWSP"],
    durationHours: 356,
    shortDescription: "Professional service and hospitality management.",
    longDescription: "Covers the competencies required to provide food and beverage service to guests in various establishments.",
    galleryImages: ["https://images.unsplash.com/photo-1414235077428-338989a2e8c0?auto=format&fit=crop&q=80&w=800"],
  },
  {
    id: "c15",
    slug: "hairdressing-nc-ii",
    title: "Hairdressing",
    ncLevel: "NC II",
    category: "Beauty/Wellness",
    level: "NC II",
    twsp: true,
    tags: ["Beauty", "TWSP"],
    durationHours: 656,
    shortDescription: "Professional hair styling and chemical treatments.",
    longDescription: "Covers hair cutting, styling, coloring, and other chemical hair treatments.",
    galleryImages: ["https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&q=80&w=800"],
  },
  {
    id: "c16",
    slug: "heo-backhoe-loader-operations-nc-ii",
    title: "HEO — Backhoe Loader Operations - Mobile Training Program",
    ncLevel: "NC II",
    category: "Construction",
    level: "NC II",
    twsp: true,
    tags: ["Construction", "TWSP"],
    durationHours: 160,
    shortDescription: "Safe and productive operation of backhoe loader equipment.",
    longDescription: "Covers pre- and post-operation procedures and productive operation of backhoe loaders.",
    trainer: "Randy Q. Campion",
    galleryImages: ["https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&q=80&w=800"],
  },
  {
    id: "c17",
    slug: "heo-hydraulic-excavator-operations-nc-ii",
    title: "HEO — Hydraulic Excavator Operations",
    ncLevel: "NC II",
    category: "Construction",
    level: "NC II",
    twsp: true,
    tags: ["Construction", "TWSP"],
    durationHours: 160,
    shortDescription: "Operation and maintenance of hydraulic excavators.",
    longDescription: "Focuses on the safe operation and preventive maintenance of hydraulic excavator equipment.",
    galleryImages: ["https://images.unsplash.com/photo-1558618666-fcd25c85cd64?auto=format&fit=crop&q=80&w=800"],
  },
  {
    id: "c18",
    slug: "housekeeping-nc-ii",
    title: "Housekeeping",
    ncLevel: "NC II",
    category: "Tourism",
    level: "NC II",
    twsp: true,
    tags: ["Tourism", "TWSP"],
    durationHours: 436,
    shortDescription: "Professional guest room maintenance and laundry service.",
    longDescription: "Focuses on the competencies needed for maintaining guest rooms and providing laundry services in hotels.",
    galleryImages: ["https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&q=80&w=800"],
  },
  {
    id: "c19",
    slug: "organic-agriculture-production-nc-ii",
    title: "Organic Agriculture Production",
    ncLevel: "NC II",
    category: "Agriculture",
    level: "NC II",
    twsp: true,
    tags: ["Agriculture", "Organic", "TWSP"],
    durationHours: 232,
    shortDescription: "Sustainable organic farming and fertilization.",
    longDescription: "Covers the production of organic fertilizers, organic vegetables, organic chickens, and organic hogs.",
    galleryImages: ["https://images.unsplash.com/photo-1523348837708-15d4a09cfac2?auto=format&fit=crop&q=80&w=800"],
  },
  {
    id: "c20",
    slug: "basic-computer-literacy",
    title: "Basic Computer Literacy (BCL)",
    ncLevel: "Short Course",
    category: "ICT",
    level: "Beginner",
    twsp: false,
    tags: ["ICT", "Computers", "BCL"],
    durationHours: 40,
    shortDescription: "Fundamental computer skills for everyday use.",
    longDescription: "Covers basic computer operations, word processing, spreadsheets, and internet essentials. Estimated Fee: ₱2,500.",
    galleryImages: ["https://images.unsplash.com/photo-1531297484001-80022131f5a1?auto=format&fit=crop&q=80&w=800"],
  },
  {
    id: "c21",
    slug: "smaw-nc-ii",
    title: "Shielded Metal Arc Welding (SMAW)",
    ncLevel: "NC II",
    category: "Metals/Engineering",
    level: "NC II",
    twsp: true,
    tags: ["Welding", "Engineering", "TWSP"],
    durationHours: 268,
    shortDescription: "Professional arc welding and certification.",
    longDescription: "Advanced welding techniques for structural steel and industry certification.",
    galleryImages: ["https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?auto=format&fit=crop&q=80&w=800"],
  },
  {
    id: "c22",
    slug: "visual-graphic-design-nc-iii",
    title: "Visual Graphic Design",
    ncLevel: "NC III",
    category: "ICT",
    level: "NC III",
    twsp: true,
    tags: ["ICT", "Design", "TWSP"],
    durationHours: 487,
    shortDescription: "Professional graphic design and multimedia production.",
    longDescription: "Covers the skills for creating visual designs for print and electronic media.",
    galleryImages: ["https://images.unsplash.com/photo-1542744173-8e7e53415bb0?auto=format&fit=crop&q=80&w=800"],
  }
];

// ============================================================================
// SCHOLARSHIP COURSES (TWSP)
// ============================================================================

export const scholarshipSlots = [
  { id: "ss1", courseSlug: "bookkeeping-nc-iii", totalSlots: 25, takenSlots: 18, available: 7 },
  { id: "ss2", courseSlug: "driving-nc-ii", totalSlots: 30, takenSlots: 22, available: 8 },
  { id: "ss3", courseSlug: "agricultural-crops-production-nc-i", totalSlots: 20, takenSlots: 12, available: 8 },
];

export const scholarshipAnnouncement = "Scholarship slots for Bookkeeping NC III, Driving NC II & Agricultural Crops Production NC I under Training for Work Scholarship Program (TWSP) with training benefits. Enroll now — limited slots only. First come, First served.";

// ============================================================================
// USERS
// ============================================================================

/** @deprecated Use useUsers() / fetchUsers() — InsForge `public.users` */
export const users: User[] = [
  { id: "u1", name: "Lina Theresa Zapanta Escudero", email: "lina.escudero@lorenzinternational.org", role: "staff" },
  { id: "u2", name: "Joseph Carlo Hormillada Espiritu", email: "joseph.espiritu@lorenzinternational.org", role: "staff" },
  { id: "u3", name: "Rhey Yordan Maputol", email: "rhey.maputol@lorenzinternational.org", role: "staff" },
  { id: "u4", name: "Jojet B. Andrino", email: "jojet.andrino@lorenzinternational.org", role: "staff" },
  { id: "u5", name: "Maggie Gudella Z. Tse", email: "admin@lorenzinternational.org", role: "admin" },
  { id: "u6", name: "Maria Clara", email: "maria.clara@email.com", role: "trainee" },
  { id: "u7", name: "Jose Rizal", email: "jose.rizal@email.com", role: "trainee" },
];

// ============================================================================
// ENROLLMENTS
// ============================================================================

export interface TraineeDocument {
  id: string;
  type: 'psa_birth_cert' | 'valid_id' | 'passport_photo' | 'diploma' | 'barangay_cert' | 'voter_cert' | 'other';
  label: string;
  fileName: string;
  fileUrl: string;
  fileSize?: number;
  uploadedAt: string;
  verified: boolean;
  verifiedBy?: string;
  verifiedAt?: string;
}

export interface WorkExperience {
  company: string;
  position: string;
  inclusiveDates: string;
  monthlySalary: string;
  appointmentStatus: string;
  noOfYearsExp: string;
}

export interface OtherTraining {
  title: string;
  venue: string;
  inclusiveDates: string;
  noOfHours: string;
  conductedBy: string;
}

export interface LicensureExam {
  title: string;
  yearTaken: string;
  examinationVenue: string;
  rating: string;
  remarks: string;
  expiryDate: string;
}

export interface CompetencyAssessment {
  title: string;
  qualificationLevel: string;
  industrySector: string;
  certificateNumber: string;
  dateOfIssuance: string;
  expirationDate: string;
}

export interface TrainingHistoryEntry {
  id: string;
  courseSlug: string;
  batchName?: string;
  startDate?: string;
  endDate?: string;
  assessmentDate?: string;
  assessmentResult?: 'Competent' | 'Not Yet Competent' | 'Pending';
  ncCertificateNo?: string;
  status: 'enrolled' | 'completed' | 'dropped';
}

export interface Enrollment {
  id: string;
  refNo: string;
  userId?: string;
  firstName: string;
  middleName: string;
  lastName: string;
  extensionName?: string;
  traineeName: string;
  dob: string;
  birthPlace: string;
  age?: number;
  gender: "Male" | "Female" | "Prefer not to say";
  civilStatus: "Single" | "Married" | "Widowed" | "Separated";
  nationality: string;
  uli?: string;
  voucherNo?: string;
  psaNo?: string;
  learnerClassification: string;
  clientType: string;
  qualificationType: 'Full Qualification' | 'COC';
  motherMaidenName: string;
  fatherName: string;
  isIP: boolean;
  indigenousGroup?: string;
  motherTongue: string;
  traineeEmail: string;
  contactNumber: string;
  telephone?: string;
  mobileNumber?: string;
  homeAddress: string;
  barangay: string;
  district?: string;
  city: string;
  province: string;
  region: string;
  zipCode: string;
  education: string;
  schoolLastAttended?: string;
  yearGraduated?: string;
  employmentStatus: "Unemployed" | "Underemployed" | "Employed (seeking skills upgrade)" | "Student";
  employmentType?: string;
  companyName?: string;
  workExperience?: WorkExperience[];
  otherTrainings?: OtherTraining[];
  licensureExams?: LicensureExam[];
  competencyAssessments?: CompetencyAssessment[];
  courseSlug: string;
  preferredSchedule: "Morning (8:00 AM – 12:00 PM)" | "Afternoon (1:00 PM – 5:00 PM)" | "Full Day (8:00 AM – 5:00 PM)";
  enrollmentType: "New Enrollee" | "Re-enrollee" | "Assessment Only (walk-in)";
  scholarshipApplication: "Yes, I want to apply for TWSP" | "No, self-funded enrollment" | "I need more information about scholarships";
  documents?: TraineeDocument[];
  documentStatus: 'complete' | 'partial' | 'missing';
  previousEnrollments?: string[];
  trainingHistory?: TrainingHistoryEntry[];
  heardFrom?: string;
  notes?: string;
  consent: boolean;
  status:
    | "pending"
    | "confirmed"
    | "rejected"
    | "waitlisted"
    | "review"
    | "interview"
    | "enrolled"
    | "cancelled"
    | "completed"
    | "ready_to_apply";
  createdAt: string;
  staffNotes?: { note: string; addedBy: string; addedAt: string }[];
}

/** @deprecated Use useEnrollments() / fetchAllEnrollments() — InsForge `enrollments` */
export const enrollments: Enrollment[] = [
  {
    id: "e1",
    refNo: "LISTA-2024-00001",
    userId: "u6",
    firstName: "Maria",
    middleName: "Santos",
    lastName: "Clara",
    extensionName: "",
    traineeName: "Clara, Maria Santos",
    dob: "2000-01-15",
    birthPlace: "Gingoog City",
    age: 26,
    gender: "Female",
    civilStatus: "Single",
    nationality: "Filipino",
    uli: "",
    psaNo: "",
    learnerClassification: "Student",
    clientType: "TVET Student",
    qualificationType: "Full Qualification",
    motherMaidenName: "Dela Cruz",
    fatherName: "Juan Clara",
    isIP: false,
    motherTongue: "Cebuano",
    traineeEmail: "maria.clara@email.com",
    contactNumber: "0917-123-4567",
    homeAddress: "Purok 3",
    barangay: "Barangay 24-A",
    city: "Gingoog City",
    province: "Misamis Oriental",
    region: "Region X — Northern Mindanao",
    zipCode: "9014",
    education: "Senior High School Graduate",
    schoolLastAttended: "Gingoog City Comprehensive National High School",
    yearGraduated: "2018",
    employmentStatus: "Unemployed",
    courseSlug: "bookkeeping-nc-iii",
    preferredSchedule: "Morning (8:00 AM – 12:00 PM)",
    enrollmentType: "New Enrollee",
    scholarshipApplication: "Yes, I want to apply for TWSP",
    documentStatus: "partial",
    heardFrom: "Facebook",
    consent: true,
    status: "confirmed",
    createdAt: "2024-03-01T08:32:00Z",
  },
  {
    id: "e2",
    refNo: "LISTA-2024-00002",
    userId: "u7",
    firstName: "Jose",
    middleName: "Protacio",
    lastName: "Rizal",
    extensionName: "",
    traineeName: "Rizal, Jose Protacio",
    dob: "1990-06-19",
    birthPlace: "Calamba, Laguna",
    age: 34,
    gender: "Male",
    civilStatus: "Single",
    nationality: "Filipino",
    uli: "",
    psaNo: "",
    learnerClassification: "Student",
    clientType: "TVET Student",
    qualificationType: "Full Qualification",
    motherMaidenName: "Realonda",
    fatherName: "Francisco Mercado",
    isIP: false,
    motherTongue: "Tagalog",
    traineeEmail: "jose.rizal@email.com",
    contactNumber: "0918-765-4321",
    homeAddress: "Poblacion",
    barangay: "Barangay 1",
    city: "Gingoog City",
    province: "Misamis Oriental",
    region: "Region X — Northern Mindanao",
    zipCode: "9014",
    education: "College Graduate",
    schoolLastAttended: "University of Santo Tomas",
    yearGraduated: "2012",
    employmentStatus: "Employed (seeking skills upgrade)",
    courseSlug: "driving-nc-ii",
    preferredSchedule: "Afternoon (1:00 PM – 5:00 PM)",
    enrollmentType: "New Enrollee",
    scholarshipApplication: "No, self-funded enrollment",
    documentStatus: "complete",
    heardFrom: "Website",
    consent: true,
    status: "confirmed",
    createdAt: "2024-04-10T10:15:00Z",
  },
];

// ============================================================================
// SCHEDULES
// ============================================================================

export const schedules = [
  { id: "s1", courseSlug: "computer-systems-servicing-nc-ii", date: formatDate(addDays(today, 1)), startTime: "08:00", endTime: "17:00", trainer: "Oseas G. Jesto, Jr.", room: "Assessment Room 1" },
  { id: "s2", courseSlug: "computer-systems-servicing-nc-ii", date: formatDate(addDays(today, 2)), startTime: "08:00", endTime: "17:00", trainer: "Oseas G. Jesto, Jr.", room: "Assessment Room 1" },
  { id: "s3", courseSlug: "computer-systems-servicing-nc-ii", date: formatDate(addDays(today, 4)), startTime: "08:00", endTime: "17:00", trainer: "Oseas G. Jesto, Jr.", room: "Assessment Room 1" },
  { id: "s4", courseSlug: "computer-systems-servicing-nc-ii", date: formatDate(addDays(today, 5)), startTime: "08:00", endTime: "17:00", trainer: "Oseas G. Jesto, Jr.", room: "Assessment Room 1" },
  { id: "s5", courseSlug: "bookkeeping-nc-iii", date: formatDate(today), startTime: "09:00", endTime: "12:00", trainer: "Joseph Espiritu", room: "Lab 2" },
  { id: "s6", courseSlug: "bookkeeping-nc-iii", date: formatDate(addDays(today, 2)), startTime: "13:00", endTime: "17:00", trainer: "Joseph Espiritu", room: "Lab 2" },
];

// ============================================================================
// ANNOUNCEMENTS
// ============================================================================

export const announcements = [
  {
    id: "a1",
    title: "TWSP Scholarship Slots Available!",
    body: "Scholarship slots for Bookkeeping NC III, Driving NC II & Agricultural Crops Production NC I under Training for Work Scholarship Program (TWSP) with training benefits. Enroll now — limited slots only. First come, First served.",
    targetRole: "all",
    createdAt: "2024-10-28T08:00:00Z",
    author: "Admissions Office",
  },
  {
    id: "a2",
    title: "National Women's Celebration Month Capability Training",
    body: "In March 2024, LISTA hosted a transformative three-day capability training program in support of National Women's Celebration Month. Thirty women from Gingoog City participated in practical sessions covering urban gardening, composting, soil preparation, and seedling cultivation.",
    targetRole: "all",
    createdAt: "2024-03-20T09:00:00Z",
    author: "Academic Office",
  },
  {
    id: "a3",
    title: "Training of Trainers on Rabbitry Production",
    body: "In June 2024, LISTA's training farm in Lunotan became the venue for a five-day Training of Trainers on Rabbitry Production as an Enterprise — organized by ATI-RTC X. Twenty participants from Bukidnon, Misamis Oriental, and Misamis Occidental underwent intensive training.",
    targetRole: "all",
    createdAt: "2024-06-03T12:00:00Z",
    author: "Administration",
  },
];

// ============================================================================
// FAQS
// ============================================================================

export const faqs = [
  {
    id: "f1",
    question: "Who can apply for the TWSP scholarship?",
    answer: "Filipino citizens who are unemployed, underemployed, or employed but wanting to upgrade their skills. Applicants must not have an existing active TESDA scholarship.",
    category: "Scholarship",
  },
  {
    id: "f2",
    question: "Is the TWSP scholarship really free?",
    answer: "Yes. TWSP covers full training costs. Scholars may also receive a training stipend/allowance depending on the TESDA-approved program.",
    category: "Scholarship",
  },
  {
    id: "f3",
    question: "How many scholarship slots are available?",
    answer: "Slots are limited and filled on a first-come, first-served basis. Contact us directly at 09051095284 to check current slot availability.",
    category: "Scholarship",
  },
  {
    id: "f4",
    question: "What documents are required to apply?",
    answer: "PSA Birth Certificate, valid government-issued ID, proof of residency, and your latest educational certificate.",
    category: "Admissions",
  },
  {
    id: "f5",
    question: "How long does training take?",
    answer: "Duration varies per course. Tailoring NC II requires a minimum of 275 hours. Agricultural Crops Production NC I and Driving NC II are shorter programs.",
    category: "Academics",
  },
  {
    id: "f6",
    question: "Can I get assessed even if I didn't train at LISTA?",
    answer: "Yes. The LISTA Assessment Center is open to workers and graduates from other institutions. As long as your qualification is on our list of assessable courses, you can apply for assessment.",
    category: "Assessment",
  },
];

// ============================================================================
// TESTIMONIALS
// ============================================================================

export const testimonials = [
  {
    id: "t1",
    name: "Juan Dela Cruz",
    role: "Licensed Electrician",
    quote: "Salamat sa Lorenz ISTA! Nakakuha na ako ng trabaho bilang electrician. Inirekomenda ko sa lahat ng kaibigan ko.",
    imageUrl: "/graduate-electrician.png",
  },
  {
    id: "t2",
    name: "Elena Santos",
    role: "Bookkeeper, TWSP Scholar",
    quote: "Nag-avail ako ng TWSP scholarship para sa Bookkeeping. Libre ang training at sobrang dami akong natutunan. Ngayon ay employed na ako!",
    imageUrl: "/graduate-bookkeeper.png",
  },
  {
    id: "t3",
    name: "Ricardo Reyes",
    role: "IT Support Technician",
    quote: "Ang instructors dito ay propesyonal at maalam. Hindi lang teorya ang ituturo sa iyo — hands-on talaga ang lahat.",
    imageUrl: "/graduate-it-support.png",
  },
  {
    id: "t4",
    name: "Maria Luz",
    role: "PTCACS Certified",
    quote: "Ang Lorenz Assessment Center ay mabilis at maayos ang proseso. Nakuha ko agad ang aking NC II certificate.",
    imageUrl: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&q=80&w=400",
  },
];

// ============================================================================
// CERTIFICATES
// ============================================================================

export const certificates = [
  {
    id: "cert1",
    userId: "u1",
    courseSlug: "electrical-installation-maintenance-nc-ii",
    ncLevel: "NC II",
    status: "issued" as const,
    progressStage: "passed" as const,
    issuedAt: "2024-05-15T10:00:00Z",
    fileUrl: "#"
  },
  {
    id: "cert2",
    userId: "u2",
    courseSlug: "bookkeeping-nc-iii",
    ncLevel: "NC III",
    status: "issued" as const,
    progressStage: "passed" as const,
    issuedAt: "2024-06-20T14:30:00Z",
    fileUrl: "#"
  }
];

// ============================================================================
// NEWS & UPDATES (POSTS)
// ============================================================================

export interface Post {
  id: string;
  title: string;
  excerpt: string;
  content: string;
  date: string;
  category: "Announcement" | "Event" | "Achievement" | "Community" | "Training" | "Admissions";
  imageUrl: string;
  author: string;
  sourceUrl?: string;
}

export const posts: Post[] = [
  {
    id: "p2",
    title: "CSS NC II Batch 6 — Congratulations, Graduates!",
    excerpt: "November 2024 marks another milestone as LISTA proudly celebrates the graduation of Computer Systems Servicing NC II Batch 6.",
    content: `LISTA is proud to announce the successful completion of Computer Systems Servicing NC II Batch 6 in November 2024. These graduates demonstrated outstanding technical competence in computer installation, networking, and server management — achieving a high passing rate in the TESDA National Assessment. Their dedication and hard work are a testament to the quality training provided by LISTA's expert faculty.\n\nGraduates are now equipped to pursue careers as IT Support Technicians, Network Administrators, and Computer Repair Specialists both locally and internationally.`,
    date: "2024-11-20",
    category: "Achievement",
    imageUrl: "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&q=80&w=800",
    author: "Academic Office",
  },
  {
    id: "p3",
    title: "TWSP Scholarship Slots Now Open — Apply Today!",
    excerpt: "Grow your future with TESDA! The Agricultural Crops Production NC I scholarship is open with limited slots under the Training for Work Scholarship Program.",
    content: `Hello everyone! Scholarship slots are now available for the following qualifications under the Training for Work Scholarship Program (TWSP):\n\n• Agricultural Crops Production NC I\n• Bookkeeping NC III\n• Driving NC II\n• Computer Systems Servicing NC II\n\nBenefits include FREE tuition, training materials, and a training allowance. Slots are LIMITED — first come, first served. Don't miss this opportunity to invest in your future!\n\nCall or visit us:\n📞 09051095284 | 0917-523-2724 | 0935-856-4298\n📍 FJY Bldg., National Highway, Barangay 24-A, Gingoog City\n🕗 Monday–Saturday, 8:00 AM–5:00 PM`,
    date: "2024-10-28",
    category: "Announcement",
    imageUrl: "/news-scholarship.png",
    author: "Admissions Office",
  },
  {
    id: "p4",
    title: "19th Commencement: Over 800 Scholars Receive ₱3,000 Aid",
    excerpt: "LISTA's 19th Commencement Exercises on March 24, 2024 was a landmark event where over 800 TESDA scholars received ₱3,000 financial assistance through DSWD.",
    content: `Lorenz International Skills Training Academy, Inc. held its 19th Commencement Exercises on March 24, 2024, at the Arturo S. Lugod Memorial Gym in Gingoog City. The event was graced by local government officials and a representative from the Office of the Speaker of the House.\n\nIn a significant highlight, over 800 TESDA Training for Work Scholarship Program (TWSP) scholars each received ₱3,000 in financial assistance through the Department of Social Welfare and Development's (DSWD) Assistance to Individuals in Crisis Situations (AICS) program.\n\nThis milestone reflects LISTA's continued partnership with TESDA, DSWD, and the local government in empowering Gingoog City residents through quality technical-vocational education.`,
    date: "2024-03-24",
    category: "Event",
    imageUrl: "/commencement_exercises.png",
    sourceUrl: "https://x.com/SpeakerMartinPH/status/1771033688551419911",
    author: "Administration",
  },
  {
    id: "p5",
    title: "Empowering Women Through Urban Gardening Training",
    excerpt: "In celebration of National Women's Month, LISTA and the ATI empowered 30 Gingoog City women with urban gardening and composting skills.",
    content: `In March 2024, Lorenz International Skills Training Academy (LISTA), in partnership with the Agricultural Training Institute (ATI) Northern Mindanao and the City Agriculture Office of Gingoog City, hosted a three-day capability training program for 30 women from across Gingoog City.\n\nTopics covered included:\n• The role of Filipino women in agriculture\n• Urban gardening techniques\n• Composting and organic soil preparation\n• Lowland vegetable production\n• Seedling care and nursery management\n\nParticipants also visited the HydroLeaf Farm in Gingoog City for hands-on field exposure. This initiative is part of LISTA's commitment to community extension and sustainable livelihood development.`,
    date: "2024-03-22",
    category: "Event",
    imageUrl: "https://images.unsplash.com/photo-1416879595882-3373a0480b5b?auto=format&fit=crop&q=80&w=800",
    sourceUrl: "https://ati2.da.gov.ph/ati-10/content/article/vic-thor-palarca/empowering-women-through-capability-training-recap-national-womens",
    author: "Community Extension Office",
  },
  {
    id: "p6",
    title: "Practical Driving Course — Enroll Now!",
    excerpt: "Master the road with LISTA's TESDA-accredited Practical Driving NC II course. Open for new batches — limited slots!",
    content: `Ready to hit the road? LISTA's Lorenz ISTA Driving School offers the TESDA-accredited Driving NC II course covering both automatic and manual transmissions. Our certified driving instructors provide safe, structured, and comprehensive behind-the-wheel training.\n\nCourse Includes:\n• Basic Driving Theory & Road Safety\n• Vehicle Inspection & Maintenance\n• Practical Driving: Automatic & Manual Vehicles\n• TESDA Competency Assessment Preparation\n\nEnroll now! Limited slots per batch.\n\n📞 09051095284 | 0935-856-4298\n📍 FJY Bldg., National Highway, Barangay 24-A, Gingoog City`,
    date: "2024-09-15",
    category: "Announcement",
    imageUrl: "https://images.unsplash.com/photo-1449965408869-eaa3f722e40d?auto=format&fit=crop&q=80&w=800",
    author: "Driving School Office",
  },
  {
    id: "p7",
    title: "Agricultural Crops Production NC I — Scholarship Available!",
    excerpt: "Grow your future! TESDA scholarship slots are open for Agricultural Crops Production NC I under the TWSP program.",
    content: `Are you passionate about farming and sustainable agriculture? LISTA is now accepting scholar applicants for Agricultural Crops Production NC I under the TESDA Training for Work Scholarship Program (TWSP).\n\nProgram Highlights:\n• Hands-on training at LISTA's Lunotan training farm\n• Crop planting, care, harvesting, and post-harvest management\n• Soil health and organic farming practices\n• Livelihood enterprise development\n\nScholarship Benefits: FREE training, training materials, and training allowance.\n\nRequirements: Must be at least 18 years old, Filipino citizen, out-of-school youth or unemployed/underemployed.\n\n📞 09051095284 | 0917-523-2724\n📍 FJY Bldg., Gingoog City`,
    date: "2024-08-20",
    category: "Announcement",
    imageUrl: "https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&q=80&w=800",
    author: "Admissions Office",
  },
  {
    id: "p8",
    title: "The Story Behind LISTA — Founder Lorenzo S. Tamparong",
    excerpt: "Get to know the visionary behind Lorenz International Skills Training Academy: Mr. Lorenzo S. Tamparong, a man dedicated to empowering Gingoog City.",
    content: `Lorenz International Skills Training Academy (LISTA), Inc. was founded by Mr. Lorenzo S. Tamparong — a visionary entrepreneur from Gingoog City, Misamis Oriental. Known for his passion for technical education and community development, Mr. Tamparong established LISTA with the mission of providing affordable, high-quality, TESDA-accredited training to every Filipino who wishes to invest in a better future.\n\nUnder his leadership, LISTA grew from a small driving school into a full technical-vocational institution offering over 10 NC qualifications across agriculture, ICT, automotive, and business services.\n\nHis legacy continues through every graduate who carries the LISTA seal — a mark of competence, character, and commitment to excellence.`,
    date: "2024-06-15",
    category: "Achievement",
    imageUrl: "https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&q=80&w=800",
    author: "Administration",
  },
  {
    id: "p9",
    title: "Enrollment Requirements — What You Need to Apply",
    excerpt: "Planning to enroll at LISTA? Here's a complete list of documentary requirements for TESDA scholarship and regular enrollment.",
    content: `Thank you for your interest in Lorenz International Skills Training Academy (LISTA)! Here are the documentary requirements for enrollment:\n\nFor TESDA Scholarship (TWSP / STEP / PESFA):\n• 2 pieces 2x2 ID photo (white background)\n• Photocopy of Birth Certificate (PSA)\n• Photocopy of valid government-issued ID\n• Barangay Certificate of Residency\n• Certificate of No Current Employment (CNCE)\n• Latest Voter's ID or COMELEC Certificate of Voter Registration\n\nFor Regular Enrollment:\n• 2 pieces 2x2 ID photo\n• Photocopy of valid ID\n• Enrollment fee (see office for details)\n\nFor more information, visit us at FJY Bldg., National Highway, Barangay 24-A, Gingoog City, or call 09051095284.`,
    date: "2024-05-10",
    category: "Announcement",
    imageUrl: "https://images.unsplash.com/photo-1568667256549-094345857637?auto=format&fit=crop&q=80&w=800",
    author: "Admissions Office",
  }
];
