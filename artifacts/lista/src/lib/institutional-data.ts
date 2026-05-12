export type UserRole = 'trainee' | 'staff' | 'admin';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatarUrl?: string;
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
// COURSES (7 TESDA-Accredited Programs)
// ============================================================================

export const courses = [
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
    galleryImages: ["/agriculture-training.png"],
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
    galleryImages: ["https://images.unsplash.com/photo-1464226184884-fa280b87c399?auto=format&fit=crop&q=80&w=800"],
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
    galleryImages: ["https://images.unsplash.com/photo-1548550023-2bdb3c5beed7?auto=format&fit=crop&q=80&w=800"],
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
    galleryImages: ["https://images.unsplash.com/photo-1516467508483-a7212febe31a?auto=format&fit=crop&q=80&w=800"],
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
    galleryImages: ["https://images.unsplash.com/photo-1516467508483-a7212febe31a?auto=format&fit=crop&q=80&w=800"],
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
    galleryImages: ["/course-beauty-care.png"],
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
    shortDescription: "Advanced recording and management of financial transactions.",
    longDescription: "Equips students with the competency to perform bookkeeping functions including journalizing and posting transactions.",
    galleryImages: ["https://images.unsplash.com/photo-1554224155-6726b3ff858f?auto=format&fit=crop&q=80&w=800"],
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
    galleryImages: ["https://images.unsplash.com/photo-1555507036-ab1f4038808a?auto=format&fit=crop&q=80&w=800"],
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
    galleryImages: ["https://images.unsplash.com/photo-1581578731548-c64695ce6958?auto=format&fit=crop&q=80&w=800"],
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
    galleryImages: ["https://images.unsplash.com/photo-1586191582151-f703550259b1?auto=format&fit=crop&q=80&w=800"],
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
    slug: "smaw-nc-i",
    title: "Shielded Metal Arc Welding (SMAW)",
    ncLevel: "NC I",
    category: "Metals/Engineering",
    level: "NC I",
    twsp: true,
    tags: ["Welding", "Engineering", "TWSP"],
    durationHours: 268,
    shortDescription: "Foundational arc welding for mild steel.",
    longDescription: "Covers basic welding techniques and safety for shielded metal arc welding.",
    galleryImages: ["https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?auto=format&fit=crop&q=80&w=800"],
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

// ── Document type for trainee file vault ──
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

// ── Work experience entry (for CACO-07-F21 Section 3) ──
export interface WorkExperience {
  company: string;
  position: string;
  inclusiveDates: string;
  monthlySalary: string;
  appointmentStatus: string;
  noOfYearsExp: string;
}

// ── Training history entry ──
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

  // ── Name (expanded for TESDA compliance) ──
  firstName: string;
  middleName: string;
  lastName: string;
  extensionName?: string;           // Jr., Sr., III, etc.
  traineeName: string;              // Computed: lastName, firstName middleName extensionName

  // ── Birth & Identity ──
  dob: string;
  birthPlace: string;
  age?: number;                     // Auto-computed from DOB
  gender: "Male" | "Female" | "Prefer not to say";
  civilStatus: "Single" | "Married" | "Widowed" | "Separated";
  nationality: string;

  // ── TESDA Identifiers ──
  uli?: string;                     // TESDA Unique Learner Identifier
  voucherNo?: string;
  psaNo?: string;

  // ── Classification ──
  learnerClassification: string;
  clientType: string;               // TVET Student, Industry Worker, Community Member, etc.
  qualificationType: 'Full Qualification' | 'COC';

  // ── Family ──
  motherMaidenName: string;
  fatherName: string;
  isIP: boolean;
  indigenousGroup?: string;
  motherTongue: string;

  // ── Contact ──
  traineeEmail: string;
  contactNumber: string;
  telephone?: string;               // Landline
  mobileNumber?: string;            // Secondary mobile

  // ── Address (granular for TESDA forms) ──
  homeAddress: string;              // House No., Street, Purok
  barangay: string;
  district?: string;
  city: string;
  province: string;
  region: string;                   // e.g., "Region X — Northern Mindanao"
  zipCode: string;

  // ── Education ──
  education: string;
  schoolLastAttended?: string;
  yearGraduated?: string;

  // ── Employment (expanded for TWSP & MIS 03-01) ──
  employmentStatus: "Unemployed" | "Underemployed" | "Employed (seeking skills upgrade)" | "Student";
  employmentType?: string;          // Casual, Contractual, Permanent, Self-Employed, etc.
  companyName?: string;             // If employed
  workExperience?: WorkExperience[];

  // ── Course & Program ──
  courseSlug: string;
  preferredSchedule: "Morning (8:00 AM – 12:00 PM)" | "Afternoon (1:00 PM – 5:00 PM)" | "Full Day (8:00 AM – 5:00 PM)";
  enrollmentType: "New Enrollee" | "Re-enrollee" | "Assessment Only (walk-in)";
  scholarshipApplication: "Yes, I want to apply for TWSP" | "No, self-funded enrollment" | "I need more information about scholarships";

  // ── Documents & Compliance ──
  documents?: TraineeDocument[];
  documentStatus: 'complete' | 'partial' | 'missing';

  // ── Training History (multi-course tracking) ──
  previousEnrollments?: string[];   // IDs of past enrollment records
  trainingHistory?: TrainingHistoryEntry[];

  // ── Meta ──
  heardFrom?: string;
  notes?: string;
  consent: boolean;
  status: "pending" | "confirmed" | "rejected" | "waitlisted";
  createdAt: string;
  staffNotes?: { note: string; addedBy: string; addedAt: string }[];
}

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
];

// ============================================================================
// SCHEDULES
// ============================================================================

export const schedules = [
  { id: "s1", courseSlug: "computer-systems-servicing-nc-ii", date: "2024-11-16", startTime: "08:00", endTime: "17:00", trainer: "Oseas G. Jesto, Jr.", room: "Assessment Room 1" },
  { id: "s2", courseSlug: "computer-systems-servicing-nc-ii", date: "2024-11-17", startTime: "08:00", endTime: "17:00", trainer: "Oseas G. Jesto, Jr.", room: "Assessment Room 1" },
  { id: "s3", courseSlug: "computer-systems-servicing-nc-ii", date: "2024-11-19", startTime: "08:00", endTime: "17:00", trainer: "Oseas G. Jesto, Jr.", room: "Assessment Room 1" },
  { id: "s4", courseSlug: "computer-systems-servicing-nc-ii", date: "2024-11-20", startTime: "08:00", endTime: "17:00", trainer: "Oseas G. Jesto, Jr.", room: "Assessment Room 1" },
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
// FAQs
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
  category: "Announcement" | "Event" | "Achievement";
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
  },
  {
    id: "p10",
    title: "Bookkeeping NC III — Another Batch of Successful Graduates",
    excerpt: "LISTA congratulates the latest graduates of the Bookkeeping NC III program, now ready to serve as professional bookkeepers.",
    content: `Lorenz International Skills Training Academy (LISTA) is proud to celebrate the successful completion of another batch of Bookkeeping NC III trainees. These graduates are now equipped with the knowledge and skills to perform bookkeeping operations, prepare financial reports, and handle payroll — all in compliance with Philippine Accounting Standards.\n\nBookkeeping NC III graduates can pursue careers as:\n• Junior Bookkeeper\n• Accounting Clerk\n• Payroll Assistant\n• Office Administrator\n\nCongratulations to our newest graduates! May your careers flourish as you put your skills to work for the betterment of your families and community.`,
    date: "2024-04-30",
    category: "Achievement",
    imageUrl: "https://images.unsplash.com/photo-1554224154-26032ffc0d07?auto=format&fit=crop&q=80&w=800",

    author: "Academic Office",
  },
  {
    id: "p16",
    title: "A Glimpse into Sustainable Farming at LISTA Farm",
    excerpt: "Experience the beauty of agriculture at our training farm in Sitio Civoleg, where sustainable practices meet hands-on learning.",
    content: `Lorenz International Skills Training Academy (LISTA) is more than just a classroom. Our training farm in Sitio Civoleg, Lunotan, Gingoog City, serves as a living laboratory for our Agricultural Crops Production scholars. Here, students learn the importance of organic soil preparation, water conservation, and integrated pest management.

We believe that by teaching sustainable farming techniques, we are not only providing skills but also ensuring food security for the next generation. Thank you to our hardworking farm staff and students for keeping our 'green heart' beating!`,
    date: "2023-12-05",
    category: "Achievement",
    imageUrl: "https://images.unsplash.com/photo-1592982537447-6f2a6a0c7c18?auto=format&fit=crop&q=80&w=800",

    author: "Farm Management Office"
  },
  {
    id: "p17",
    title: "Secure Your Future — Enrollment for Batch 2025 is Open",
    excerpt: "Don't wait! Enrollment for our 2025 technical-vocational programs is now ongoing. Visit us to reserve your slot.",
    content: `New year, new skills! LISTA is now accepting enrollees for our first quarter batches of 2025. Whether you're looking to start a career in ICT, Agriculture, or Automotive, we have the right program for you.

Qualifications with Open Slots:
• Computer Systems Servicing NC II
• Driving NC II (Manual/Automatic)
• Electrical Installation & Maintenance NC II
• Agricultural Crops Production NC I/II

Visit our office at FJY Bldg., Gingoog City, or call 09051095284 for immediate assistance. Your journey to professional certification starts here!`,
    date: "2024-11-15",
    category: "Announcement",
    imageUrl: "https://images.unsplash.com/photo-1523240715181-014911d2fd01?auto=format&fit=crop&q=80&w=800",

    author: "Admissions Office"
  },
  {
    id: "p18",
    title: "Scan & Apply: New QR Code for Scholarship Applications",
    excerpt: "We've made it easier! Scan our new QR code to access the online scholarship application form for TESDA programs.",
    content: `In our effort to streamline the application process, LISTA has launched an online registration portal for all TESDA scholarship programs. Simply scan the QR code posted at our office or on our official Facebook page to fill out the application form from your mobile device.

This initiative aims to reduce waiting times and ensure that all interested applicants can easily submit their details for screening. For those who prefer manual registration, our office remains open Monday to Saturday.`,
    date: "2024-02-01",
    category: "Announcement",
    imageUrl: "https://images.unsplash.com/photo-1595079676339-1534802ad6cf?auto=format&fit=crop&q=80&w=800",

    author: "MIS Department"
  },
  {
    id: "p19",
    title: "Speaker Martin Romualdez Commends LISTA Scholars",
    excerpt: "The Office of the Speaker of the House recognizes the hard work of LISTA's 800+ scholars during the 2024 Commencement.",
    content: `We are deeply honored to have received recognition from Speaker Martin Romualdez during our 19th Commencement Exercises. The Speaker, through his representative, commended the resilience and dedication of our 800+ scholars who successfully completed their technical training under the TWSP program.

This high-level support reinforces the importance of technical-vocational education in the national development agenda. We are grateful for the Speaker's commitment to empowering the youth of Gingoog City through education and financial assistance.`,
    date: "2024-03-24",
    category: "Achievement",
    imageUrl: "https://images.unsplash.com/photo-1517048676732-d65bc937f952?auto=format&fit=crop&q=80&w=800",
    sourceUrl: "https://x.com/SpeakerMartinPH/status/1771033688551419911",
    author: "Administration"
  },
  {
    id: "p20",
    title: "Highlights from the HydroLeaf Farm Visit",
    excerpt: "Our Agriculture scholars recently visited HydroLeaf Farm for a specialized workshop on modern hydroponics and urban farming.",
    content: `Practical exposure is key to our training philosophy. Our latest batch of Agricultural Crops Production scholars spent a productive day at the HydroLeaf Farm in Gingoog City. The visit focused on modern hydroponic systems, nutrient management, and climate-resilient crop production.

Seeing these innovative technologies in action inspires our students to modernize their own farming practices. Special thanks to the HydroLeaf team for sharing their expertise and hosting our scholars!`,
    date: "2024-03-18",
    category: "Event",
    imageUrl: "https://images.unsplash.com/photo-1558449028-b53a39d100fc?auto=format&fit=crop&q=80&w=800",
    sourceUrl: "https://www.instagram.com/p/DHPbJQDpNoA/",
    author: "Department of Agriculture"
  },
  {
    id: "p21",
    title: "EIM NC II Terminal Report — Documenting Excellence",
    excerpt: "A comprehensive look at the successes and challenges of the Electrical Installation & Maintenance NC II program.",
    content: `The Academic Office has released the Terminal Report for the Electrical Installation & Maintenance (EIM) NC II Batch of 2023. The report highlights a 98% passing rate in the National Assessment and successful industry placements for over 80% of the graduates.\n\nThis documentation serves as a blueprint for improving our future training cycles and maintaining our status as a premier EIM training provider in Misamis Oriental. The report is available for review by our partners and stakeholders at the LISTA main office.`,
    date: "2023-08-15",
    category: "Achievement",
    imageUrl: "https://images.unsplash.com/photo-1581092160562-40aa08e78837?auto=format&fit=crop&q=80&w=800",
    sourceUrl: "https://www.coursehero.com/file/55670269/EIM-NC-II-Terminal-Report-82019docx/",
    author: "Academic Office"
  },
  {
    id: "p22",
    title: "Fast-Track Your Career: Enroll in Driving NC II Today!",
    excerpt: "Get your professional driver's license faster with LISTA's intensive Driving NC II program. New slots open for 2024!",
    content: `Lorenz ISTA Driving School is officially accepting new students for our Practical Driving Course (PDC). Whether you're a beginner or looking to upgrade your license, our certified instructors are here to guide you through every step.\n\nImmediate Slots Available for:\n• Driving NC II (Manual/Automatic)\n• Comprehensive Road Safety Seminar\n\nCall our hotline at 0935-856-4298 or 09051095284 to reserve your slot. Don't wait — empower yourself with a skill that opens doors!`,
    date: "2024-04-12",
    category: "Announcement",
    imageUrl: "https://images.unsplash.com/photo-1549890762-0a3f8933ad76?auto=format&fit=crop&q=80&w=800",

    author: "Driving School Office"
  },
  {
    id: "p23",
    title: "LISTA Training Centers — Expanding Our Reach",
    excerpt: "From our main building to our vocational training farms, LISTA continues to expand to better serve Gingoog City.",
    content: `We are excited to share that our training facilities are undergoing continuous upgrades to provide the best possible learning environment for our scholars. From our ICT laboratories at the FJY Bldg to our sprawling Agricultural Training Farm, we are investing in the infrastructure that will build the future of our students.\n\nThank you to our partners and the local government for their unwavering support in our expansion projects. Together, we are building a more skilled and competitive Gingoog City!`,
    date: "2023-09-20",
    category: "Announcement",
    imageUrl: "https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&q=80&w=800",

    author: "Operations Department"
  },
  {
    id: "p24",
    title: "Investing in Future Farmers — Agriculture NC I Slots",
    excerpt: "Join our latest batch of Agricultural Crops Production scholars and start your journey toward sustainable farming.",
    content: `The demand for skilled agricultural professionals is higher than ever. At LISTA, we are committed to providing the youth of Gingoog City with the technical expertise needed to thrive in the modern agricultural sector.\n\nOur Agriculture NC I/II programs cover everything from soil health to post-harvest management. Join us and become part of a community that values hard work, innovation, and sustainability. Visit our office today for more details on current scholarship slots!`,
    date: "2023-07-10",
    category: "Announcement",
    imageUrl: "https://images.unsplash.com/photo-1523348837708-15d4a09cfac2?auto=format&fit=crop&q=80&w=800",

    author: "Admissions Office"
  },
  {
    id: "p25",
    title: "Life at LISTA — Explore Our Photo Gallery",
    excerpt: "See our scholars in action! Explore our collection of photos and videos showcasing life, learning, and success at LISTA.",
    content: `Want to see what it's like to be a LISTA scholar? Our official Facebook photo gallery is packed with thousands of moments showcasing our training sessions, graduation ceremonies, farm visits, and community events.\n\nFrom the intensity of our driving courses to the joy of our commencement exercises, these photos tell the story of LISTA's mission in action. Click the link below to visit our full media archive and see why thousands of students choose LISTA for their technical education.`,
    date: "2026-01-01",
    category: "Announcement",
    imageUrl: "https://images.unsplash.com/photo-1529333166437-7750a6dd5a70?auto=format&fit=crop&q=80&w=800",

    author: "Public Relations Office"
  },
  {
    id: "p26",
    title: "LISTA Hosts Training of Trainers on Rabbitry Production",
    excerpt: "Continuing our mission to provide industry-driven services, LISTA successfully hosted a comprehensive Training of Trainers (TOT) focused on Rabbitry Production as a viable enterprise.",
    content: `In June 2024, Lorenz International Skills Training Academy (LISTA) hosted and participated in a specialized Training of Trainers (TOT) on Rabbitry Production as an Enterprise. This program was conducted in collaboration with the Department of Agriculture (DA) and the Agricultural Training Institute (ATI).\n\nThe training aimed to equip trainers with the knowledge and skills necessary to promote rabbitry as a sustainable and profitable agricultural business. Topics included rabbit breeding, housing management, nutrition, and market integration.\n\nThis initiative highlights LISTA's commitment to advancing agricultural enterprise and providing industry-driven skills training to its community.`,
    date: "2024-06-15",
    category: "Event",
    imageUrl: "https://images.unsplash.com/photo-1585110396000-c9ffd4e4b308?auto=format&fit=crop&q=80&w=800",

    author: "Farm Management Office",
  },
  {
    id: "p27",
    title: "2026 Competency Assessment Audit — Maintaining Excellence",
    excerpt: "LISTA successfully completed its 2026 Competency Assessment Center audit, ensuring the highest standards for technical certification.",
    content: `We are pleased to announce that the LISTA Competency Assessment Center has successfully passed its 2026 institutional audit. This rigorous process ensures that our assessment facilities, equipment, and certified assessors continue to meet the highest national standards set by TESDA.\n\nAs a leading assessment center in Gingoog City, we remain dedicated to providing fair, accurate, and efficient competency evaluations for all technical-vocational graduates. Thank you to our assessment team for their dedication to quality and integrity.`,
    date: "2026-05-01",
    category: "Achievement",
    imageUrl: "https://images.unsplash.com/photo-1454165833762-0165c069501a?auto=format&fit=crop&q=80&w=800",

    author: "Compliance Office",
  },
  {
    id: "p28",
    title: "A Decade of Integration: Celebrating 10 Years of Excellence",
    excerpt: "Reflecting on ten years of providing technical-vocational education and empowering the youth of Gingoog City.",
    content: `Lorenz International Skills Training Academy celebrates a decade of service to the community. Over the past ten years, we have integrated technical skills with character development, helping thousands of graduates find meaningful employment and start successful businesses.\n\nFrom our humble beginnings as a driving school to our current status as a multi-qualification institution, our mission remains the same: to provide accessible, high-quality training that changes lives. Thank you to all our partners, staff, and students who have been part of this journey!`,
    date: "2024-01-10",
    category: "Achievement",
    imageUrl: "https://images.unsplash.com/photo-1511632765486-a01980e01a18?auto=format&fit=crop&q=80&w=800",

    author: "Administration",
  },
  {
    id: "p29",
    title: "Empowering Women through Sustainable Agriculture",
    excerpt: "In celebration of National Women's Month, LISTA facilitated capability training programs empowering women through urban gardening and composting.",
    content: `In March 2024, in partnership with the City Agriculture Office and the Local Government Unit, LISTA hosted a specialized capability training for women. The program focused on Urban Gardening, Composting, and Seedling Care.\n\nThis initiative aimed to provide local women with sustainable skills that can be applied both at home and as a potential livelihood enterprise. Participants engaged in hands-on activities at our Lunotan Agricultural Training Farm, learning modern techniques to improve food security and environmental sustainability.\n\nLISTA continues to support gender empowerment through accessible technical-vocational education.`,
    date: "2024-03-22",
    category: "Community",
    imageUrl: "https://images.unsplash.com/photo-1590650153855-d9e808231d41?auto=format&fit=crop&q=80&w=800",
    sourceUrl: "https://ati2.da.gov.ph/ati-10/content/article/vic-thor-palarca/empowering-women-through-capability-training-recap-national-womens",
    author: "Community Relations",
  },
  {
    id: "p30",
    title: "Practical Driving Course: Mastering the Road with Confidence",
    excerpt: "Our latest batch of PDC students has successfully completed their hands-on training, demonstrating excellence in road safety and vehicle handling.",
    content: `At Lorenz International Skills Training Academy (LISTA), we take pride in our comprehensive Practical Driving Course (PDC). Our recent graduates have shown exceptional dedication to mastering the art of safe driving.\n\nUnder the guidance of our expert instructors, students learned defensive driving techniques, traffic rules, and advanced vehicle maneuvers. This hands-on training ensures that our scholars are not only licensed but are responsible and confident drivers ready for the road.\n\nCongratulations to all our successful PDC students! Your journey to a safer road starts here.`,
    date: "2024-05-05",
    category: "Training",
    imageUrl: "https://images.unsplash.com/photo-1449965072333-66e2bd0d6442?auto=format&fit=crop&q=80&w=800",

    author: "Driving School Dept",
  },
  {
    id: "p31",
    title: "Bookkeeping NC III Success: Excellence in Financial Management",
    excerpt: "Celebrating the high passing rate of our Bookkeeping NC III scholars in their recent national competency assessment.",
    content: `We are thrilled to announce the outstanding performance of our Bookkeeping NC III scholars. After months of intensive training in financial statements, ledgers, and taxation, our students have successfully passed their TESDA National Competency Assessment.\n\nThis achievement reflects the quality of instruction and the hard work of our scholars. As certified bookkeepers, they are now equipped with the technical skills to manage financial records for businesses and government agencies.\n\nLISTA remains committed to producing globally competitive professionals in the field of business and finance.`,
    date: "2024-04-18",
    category: "Achievement",
    imageUrl: "https://images.unsplash.com/photo-1554224155-6726b3ff858f?auto=format&fit=crop&q=80&w=800",

    author: "Business Dept",
  },
  {
    id: "p32",
    title: "Celebrating the Legacy of Our Founder: Lorenzo Tamparong",
    excerpt: "A tribute to the vision and leadership of Lorenzo Tamparong, the heart and soul behind LISTA's mission.",
    content: `Lorenz International Skills Training Academy (LISTA) is built on the foundation of service and excellence laid by our founder, Lorenzo Tamparong. His vision was to create an institution that provides not just skills, but hope and opportunity to the youth of Gingoog City.\n\nToday, we continue his legacy by maintaining the highest standards of technical-vocational education and community service. Every graduate, every scholarship, and every success story is a testament to the enduring impact of his leadership.\n\nWe celebrate his life and work as we continue to move forward with the same passion and dedication that he instilled in this academy.`,
    date: "2024-02-14",
    category: "Announcement",
    imageUrl: "https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&q=80&w=800",

    author: "Administration",
  },
  {
    id: "p33",
    title: "TWSP Scholarship Slots Now Open for 2024",
    excerpt: "Take the first step towards a brighter future with our fully-funded TESDA scholarship slots for various technical courses.",
    content: `Lorenz International Skills Training Academy is pleased to announce that application for the Training for Work Scholarship Program (TWSP) is now open! We are offering scholarship slots for Housekeeping NC II, Driving NC II, and Computer Systems Servicing NC II.\n\nQualified applicants will receive free training and a daily allowance. This is a great opportunity for unemployed individuals and career shifters to gain industry-recognized certifications and improve their employability. Visit our office today or scan the QR code in our official Facebook post to apply!`,
    date: "2024-01-25",
    category: "Admissions",
    imageUrl: "https://images.unsplash.com/photo-1546410531-bb4caa6b424d?auto=format&fit=crop&q=80&w=800",

    author: "Scholarship Office",
  },
  {
    id: "p34",
    title: "Start Your Driving Journey: Enrollment Open at Lorenz ISTA",
    excerpt: "Join the most trusted driving school in Gingoog City. Enroll now for our Practical Driving Course and become a safe, responsible driver.",
    content: `Are you ready to get behind the wheel? Lorenz ISTA Driving School is now accepting enrollees for our 15-hour Practical Driving Course (PDC). Our program is designed to equip you with the skills and confidence needed to navigate the roads safely.\n\nWe offer flexible schedules, modern vehicles, and expert instructors who are dedicated to your success. Whether you're a beginner or looking to upgrade your license, we have the right program for you. Enroll today and experience the Lorenz standard of driving excellence!`,
    date: "2024-06-01",
    category: "Training",
    imageUrl: "https://images.unsplash.com/photo-1596484552934-22ff611681a9?auto=format&fit=crop&q=80&w=800",

    author: "Driving School",
  },
  {
    id: "p35",
    title: "Assessment Center Now Accepting National Certification Applications",
    excerpt: "Get certified and upgrade your career! Our Competency Assessment Center is open for NC I, II, and III evaluations.",
    content: `Boost your professional credentials by becoming a TESDA-certified professional. The Lorenz International Competency Assessment Center is currently accepting applications for national certification in various qualifications, including Bookkeeping, CSS, and Driving.\n\nOur facility is equipped with industry-standard tools and assessed by certified evaluators to ensure a fair and rigorous evaluation process. Don't let your skills go unrecognized — apply for assessment today and open doors to better job opportunities!`,
    date: "2024-05-10",
    category: "Admissions",
    imageUrl: "https://images.unsplash.com/photo-1586281380117-5a60ae2050cc?auto=format&fit=crop&q=80&w=800",

    author: "Assessment Center",
  },
];

export const analyticsTrend = [
  { month: "Nov 2024", enrollments: 42 },
  { month: "Dec 2024", enrollments: 38 },
  { month: "Jan 2025", enrollments: 51 },
  { month: "Feb 2025", enrollments: 67 },
  { month: "Mar 2025", enrollments: 72 },
  { month: "Apr 2025", enrollments: 89 },
];
