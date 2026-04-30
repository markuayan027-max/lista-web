export type UserRole = 'trainee' | 'staff' | 'admin';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatarUrl?: string;
}

// ============================================================================
// SCHOOL IDENTITY
// ============================================================================

export const schoolInfo = {
  fullName: "Lorenz International Skills Training Academy, Inc.",
  shortName: "Lorenz ISTA",
  acronym: "LISTA",
  tagline: "We are investing in your future.",
  founded: 2014,
  city: "Gingoog City",
  province: "Misamis Oriental",
  country: "Philippines",
  type: "TESDA-accredited Technical-Vocational Institution (TVET)",
  website: "lorenzinternational.org",
};

export const contactInfo = {
  mainAddress: "FJY Bldg., National Highway, Barangay 24-A, Gingoog City, Misamis Oriental",
  altAddress: "Guno–Condeza Streets, Brgy. 16, Gingoog City",
  farmAddress: "Lunotan, Gingoog City, Misamis Oriental",
  telephone: "(088) 861-4200",
  mobile1: "0955-881-5161",
  mobile2: "0917-523-2724",
  mobile3: "0926-854-1906",
  officeHours: "Monday – Saturday, 8:00 AM – 5:00 PM",
  email: "info@lorenzinternational.org",
};

export const leadership = [
  {
    id: "l1",
    name: "Ms. Maggie Zapanta-Tse",
    role: "School President",
    bio: "Visionary leader steering Lorenz ISTA's mission to empower Filipinos through industry-aligned technical education.",
  },
];

export const accreditations = [
  { id: "ac1", code: "TESDA", name: "Technical Education and Skills Development Authority", role: "Primary accreditor" },
  { id: "ac2", code: "CHED", name: "Commission on Higher Education", role: "Recognized" },
  { id: "ac3", code: "DepEd", name: "Department of Education", role: "Listed" },
  { id: "ac4", code: "ATI", name: "Agricultural Training Institute, Region X", role: "Partner" },
  { id: "ac5", code: "City Agriculture Office", name: "City Agriculture Office Gingoog", role: "Partner" },
  { id: "ac6", code: "TWSP", name: "Training for Work Scholarship Program (TESDA)", role: "Scholarship Partner" },
];

export const missionVision = {
  mission: "Empowering individuals through collaborative technical training, innovative education, and industry-driven production services. We foster excellence and drive transformative growth within the global technological landscape.",
  vision: "To be the leading, nationally recognized center of excellence in providing accurate, reliable, and efficient competency assessments aligned with global standards.",
};

export const pillars = [
  { id: "p1", title: "Quality Assessment", description: "PTCACS-certified evaluation aligned with global standards." },
  { id: "p2", title: "Global Standards", description: "Curriculum benchmarked against international competencies." },
  { id: "p3", title: "Skills Development", description: "Hands-on, practical, industry-driven training programs." },
  { id: "p4", title: "Career Placement", description: "75% target employment rate for our graduates." },
];

export const assessmentCenter = {
  name: "Lorenz ISTA Assessment Center",
  certifications: ["TESDA-accredited", "PTCACS-certified"],
  targetCertifications: 1500,
  targetEmploymentRate: 75,
  qualificationsCount: 7,
  objectives: [
    "Provide accurate and reliable competency assessments aligned with national standards.",
    "Deliver efficient assessment services to industry partners and aspiring professionals.",
    "Maintain a center of excellence recognized for quality and integrity.",
    "Strengthen pathways for Filipino workers to local and international employment.",
  ],
};

export const events = [
  {
    id: "ev1",
    title: "Women's Training in Urban Gardening & Composting",
    date: "2024-03-15",
    participants: 30,
    location: "LISTA Campus, Gingoog City",
    partners: ["ATI Northern Mindanao", "City Agriculture Office Gingoog"],
    description: "Empowered 30 women in sustainable urban gardening and composting techniques.",
  },
  {
    id: "ev2",
    title: "Rabbitry Training of Trainers (TOT)",
    date: "2024-06-10",
    participants: 20,
    duration: "5 days",
    location: "LISTA Farm, Lunotan",
    partners: ["ATI-RTC Region X"],
    description: "Five-day intensive training for 20 participants from 3 provinces on commercial rabbitry operations.",
  },
];

// ============================================================================
// COURSES (7 TESDA-Accredited Programs)
// ============================================================================

export const courses = [
  {
    id: "c1",
    slug: "computer-systems-servicing-nc-ii",
    title: "Computer Systems Servicing",
    ncLevel: "NC II",
    category: "ICT",
    level: "NC II",
    durationWeeks: 16,
    durationHours: 392,
    priceUSD: 8500,
    twsp: false,
    tags: ["Hardware", "Networking", "Troubleshooting"],
    shortDescription: "Master computer hardware, networking, and systems troubleshooting at NC II level.",
    longDescription: "A comprehensive TESDA NC II program in Computer Systems Servicing. Learn to install, configure, diagnose, and maintain computer systems and networks. Graduates qualify for roles as IT support technicians, network technicians, and computer service specialists.",
    syllabus: [
      { title: "Hardware Fundamentals", items: ["PC Components", "Assembly & Disassembly", "Peripheral Devices"] },
      { title: "Operating Systems", items: ["Windows Installation", "Driver Configuration", "System Recovery"] },
      { title: "Networking", items: ["LAN Setup", "Cable Crimping", "Router Configuration"] },
      { title: "Troubleshooting", items: ["Diagnostic Tools", "Repair Procedures", "Preventive Maintenance"] },
    ],
    careerOutcomes: ["IT Support Technician", "Network Technician", "Computer Service Specialist"],
    instructor: { name: "Engr. Mark Villanueva", title: "TESDA-Certified ICT Trainer" },
    coverImageUrl: "/course-web-dev.png",
  },
  {
    id: "c2",
    slug: "driving-nc-ii",
    title: "Driving",
    ncLevel: "NC II",
    category: "Automotive",
    level: "NC II",
    durationWeeks: 8,
    durationHours: 218,
    priceUSD: 6500,
    twsp: true,
    tags: ["Light Vehicle", "Defensive Driving", "TWSP"],
    shortDescription: "TESDA-certified Driving NC II — covered by TWSP scholarship.",
    longDescription: "Learn safe and professional driving of light motor vehicles. Covers traffic regulations, vehicle inspection, defensive driving, and emergency procedures. Fully covered by the TWSP scholarship program.",
    syllabus: [
      { title: "Traffic Rules & Regulations", items: ["LTO Code", "Road Signs", "Right of Way"] },
      { title: "Vehicle Operation", items: ["Pre-trip Inspection", "Maneuvering", "Parking Techniques"] },
      { title: "Defensive Driving", items: ["Hazard Perception", "Emergency Response", "Eco-Driving"] },
    ],
    careerOutcomes: ["Professional Driver", "Delivery Driver", "Personal Chauffeur"],
    instructor: { name: "Mr. Roberto Salazar", title: "Senior Driving Instructor" },
    coverImageUrl: "/course-project-management.png",
  },
  {
    id: "c3",
    slug: "electrical-installation-maintenance-nc-ii",
    title: "Electrical Installation & Maintenance",
    ncLevel: "NC II",
    category: "Construction",
    level: "NC II",
    durationWeeks: 16,
    durationHours: 402,
    priceUSD: 9500,
    twsp: false,
    tags: ["Wiring", "Installation", "Maintenance"],
    shortDescription: "Industry-standard electrical wiring, installation, and maintenance for residential and commercial systems.",
    longDescription: "Comprehensive training in electrical installation and maintenance per the Philippine Electrical Code. Learn to install, test, and maintain wiring systems for residential and commercial buildings.",
    syllabus: [
      { title: "Electrical Fundamentals", items: ["Ohm's Law", "Circuit Analysis", "Safety Practices"] },
      { title: "Wiring Installation", items: ["Conduit Bending", "Wire Pulling", "Panel Board Wiring"] },
      { title: "Testing & Maintenance", items: ["Multimeter Use", "Insulation Testing", "Fault Diagnosis"] },
    ],
    careerOutcomes: ["Licensed Electrician", "Maintenance Technician", "Electrical Apprentice"],
    instructor: { name: "Master Electrician Romeo Bacus", title: "PEC-Certified Trainer" },
    coverImageUrl: "/course-cybersecurity.png",
  },
  {
    id: "c4",
    slug: "heo-backhoe-loader-operations-nc-ii",
    title: "Heavy Equipment Operations — Backhoe Loader",
    ncLevel: "NC II",
    category: "Construction",
    level: "NC II",
    durationWeeks: 6,
    durationHours: 184,
    priceUSD: 12000,
    twsp: false,
    tags: ["Heavy Equipment", "Backhoe", "Construction"],
    shortDescription: "Operate backhoe loaders for excavation, loading, and construction site work.",
    longDescription: "Hands-on training in safe and efficient backhoe loader operations. Covers pre-operation checks, excavation techniques, loading procedures, and worksite safety per OSHC standards.",
    syllabus: [
      { title: "Equipment Familiarization", items: ["Controls & Instruments", "Pre-operation Checks", "Maintenance"] },
      { title: "Operations", items: ["Excavation", "Loading", "Trenching", "Backfilling"] },
      { title: "Site Safety", items: ["OSHC Compliance", "Hand Signals", "Emergency Procedures"] },
    ],
    careerOutcomes: ["Heavy Equipment Operator", "Construction Operator", "Site Foreman"],
    instructor: { name: "Mr. Jose Pacardo", title: "Senior HEO Trainer" },
    coverImageUrl: "/course-hospitality.png",
  },
  {
    id: "c5",
    slug: "bookkeeping-nc-iii",
    title: "Bookkeeping",
    ncLevel: "NC III",
    category: "Business",
    level: "NC III",
    durationWeeks: 12,
    durationHours: 292,
    priceUSD: 7500,
    twsp: true,
    tags: ["Accounting", "Finance", "TWSP"],
    shortDescription: "TESDA Bookkeeping NC III — full TWSP scholarship coverage available.",
    longDescription: "Advanced bookkeeping skills aligned with Philippine accounting standards. Learn journals, ledgers, trial balances, and financial statement preparation. Free under TWSP scholarship.",
    syllabus: [
      { title: "Basic Accounting", items: ["Accounting Equation", "Debit & Credit Rules", "Chart of Accounts"] },
      { title: "Journals & Ledgers", items: ["General Journal", "Subsidiary Ledgers", "Posting"] },
      { title: "Financial Reports", items: ["Trial Balance", "Income Statement", "Balance Sheet"] },
    ],
    careerOutcomes: ["Bookkeeper", "Accounting Clerk", "Finance Assistant"],
    instructor: { name: "Ms. Liza Mendoza, CPA", title: "Senior Bookkeeping Trainer" },
    coverImageUrl: "/course-marketing.png",
  },
  {
    id: "c6",
    slug: "agricultural-crops-production-nc-i",
    title: "Agricultural Crops Production",
    ncLevel: "NC I",
    category: "Agriculture",
    level: "NC I",
    durationWeeks: 10,
    durationHours: 246,
    priceUSD: 4500,
    twsp: true,
    tags: ["Farming", "Crops", "TWSP"],
    shortDescription: "TESDA NC I in crop production. Hands-on training at LISTA Lunotan farm.",
    longDescription: "Learn modern agricultural practices for crop production at our Lunotan training farm. Covers land preparation, planting, fertilization, pest management, and harvesting. Fully covered by TWSP scholarship.",
    syllabus: [
      { title: "Land Preparation", items: ["Soil Testing", "Plowing", "Bed Preparation"] },
      { title: "Planting & Care", items: ["Seedling Production", "Fertilization", "Irrigation"] },
      { title: "Pest & Harvest", items: ["IPM Strategies", "Harvesting Techniques", "Post-Harvest Handling"] },
    ],
    careerOutcomes: ["Farm Worker", "Crop Production Assistant", "Agripreneur"],
    instructor: { name: "Engr. Carlos Domingo", title: "Agriculturist & ATI Trainer" },
    coverImageUrl: "/course-healthcare.png",
  },
  {
    id: "c7",
    slug: "tailoring-nc-ii",
    title: "Tailoring",
    ncLevel: "NC II",
    category: "Garments",
    level: "NC II",
    durationWeeks: 12,
    durationHours: 275,
    priceUSD: 6000,
    twsp: false,
    tags: ["Sewing", "Pattern Making", "Garments"],
    shortDescription: "275-hour TESDA Tailoring NC II program. Make garments from pattern to finish.",
    longDescription: "Comprehensive tailoring program covering pattern drafting, cutting, machine sewing, and garment finishing. Minimum 275 training hours required for NC II certification.",
    syllabus: [
      { title: "Pattern Making", items: ["Body Measurement", "Drafting", "Pattern Layout"] },
      { title: "Cutting & Sewing", items: ["Fabric Cutting", "Machine Operation", "Seam Construction"] },
      { title: "Finishing", items: ["Hemming", "Buttonholes", "Pressing & Quality Check"] },
    ],
    careerOutcomes: ["Tailor", "Dressmaker", "Garment Production Worker"],
    instructor: { name: "Ms. Rosalinda Aquino", title: "Master Tailor & TESDA Trainer" },
    coverImageUrl: "/course-ui-ux.png",
  },
];

// ============================================================================
// SCHOLARSHIP COURSES (TWSP)
// ============================================================================

export const scholarshipSlots = [
  { id: "ss1", courseSlug: "bookkeeping-nc-iii", totalSlots: 25, takenSlots: 18, available: 7 },
  { id: "ss2", courseSlug: "driving-nc-ii", totalSlots: 30, takenSlots: 22, available: 8 },
  { id: "ss3", courseSlug: "agricultural-crops-production-nc-i", totalSlots: 20, takenSlots: 12, available: 8 },
];

// ============================================================================
// USERS
// ============================================================================

export const users: User[] = [
  { id: "u1", name: "Juan Dela Cruz", email: "juan.delacruz@email.com", role: "trainee" },
  { id: "u2", name: "Maria Santos", email: "maria.santos@email.com", role: "trainee" },
  { id: "u3", name: "Pedro Reyes", email: "pedro.reyes@email.com", role: "trainee" },
  { id: "u4", name: "Anna Villanueva", email: "anna.villanueva@email.com", role: "trainee" },
  { id: "u5", name: "Luis Bacus", email: "luis.bacus@email.com", role: "trainee" },
  { id: "u6", name: "Ms. Carmela Bautista", email: "carmela.bautista@lorenzinternational.org", role: "staff" },
  { id: "u7", name: "Mr. Antonio Lopez", email: "antonio.lopez@lorenzinternational.org", role: "staff" },
  { id: "u8", name: "Ms. Maggie Zapanta-Tse", email: "admin@lorenzinternational.org", role: "admin" },
];

// ============================================================================
// ENROLLMENTS (full 26-field enrollment records)
// ============================================================================

export interface Enrollment {
  id: string;
  refNo: string;
  userId?: string;
  // Section A: Personal
  firstName: string;
  lastName: string;
  traineeName: string; // computed convenience
  dob: string;
  gender: "Male" | "Female" | "Prefer not to say";
  civilStatus: "Single" | "Married" | "Widowed" | "Separated";
  // Section B: Contact
  traineeEmail: string;
  contactNumber: string;
  homeAddress: string;
  city: string;
  province: string;
  // Section C: Education
  education: string;
  schoolLastAttended?: string;
  // Section D: Course Selection
  courseSlug: string;
  preferredSchedule: "Morning (8AM-12PM)" | "Afternoon (1PM-5PM)" | "Full Day (8AM-5PM)";
  enrollmentType: "New Enrollee" | "Re-enrollee" | "Assessment Only";
  // Section E: Scholarship
  scholarshipApplication: "Yes, I want to apply" | "No, self-funded" | "I need more information";
  employmentStatus: "Unemployed" | "Underemployed" | "Employed (seeking upgrade)" | "Student";
  // Section F: Additional
  heardFrom?: string;
  notes?: string;
  consent: boolean;
  // Status
  status: "pending" | "confirmed" | "rejected" | "waitlisted";
  createdAt: string;
  staffNotes?: { note: string; addedBy: string; addedAt: string }[];
}

export const enrollments: Enrollment[] = [
  {
    id: "e1",
    refNo: "LISTA-2026-00001",
    userId: "u1",
    firstName: "Juan",
    lastName: "Dela Cruz",
    traineeName: "Juan Dela Cruz",
    dob: "2000-01-15",
    gender: "Male",
    civilStatus: "Single",
    traineeEmail: "juan.delacruz@email.com",
    contactNumber: "0917-123-4567",
    homeAddress: "123 Rizal St., Brgy. 5",
    city: "Gingoog City",
    province: "Misamis Oriental",
    education: "Senior High School Graduate",
    schoolLastAttended: "Gingoog City National High School",
    courseSlug: "electrical-installation-maintenance-nc-ii",
    preferredSchedule: "Morning (8AM-12PM)",
    enrollmentType: "New Enrollee",
    scholarshipApplication: "No, self-funded",
    employmentStatus: "Unemployed",
    heardFrom: "Facebook",
    consent: true,
    status: "pending",
    createdAt: "2026-04-25T08:32:00Z",
  },
  {
    id: "e2",
    refNo: "LISTA-2026-00002",
    userId: "u2",
    firstName: "Maria",
    lastName: "Santos",
    traineeName: "Maria Santos",
    dob: "1998-07-22",
    gender: "Female",
    civilStatus: "Single",
    traineeEmail: "maria.santos@email.com",
    contactNumber: "0926-854-1234",
    homeAddress: "456 Mabini Ave., Brgy. 16",
    city: "Gingoog City",
    province: "Misamis Oriental",
    education: "College Level",
    schoolLastAttended: "Misamis Oriental State College",
    courseSlug: "bookkeeping-nc-iii",
    preferredSchedule: "Afternoon (1PM-5PM)",
    enrollmentType: "New Enrollee",
    scholarshipApplication: "Yes, I want to apply",
    employmentStatus: "Underemployed",
    heardFrom: "TESDA Website",
    consent: true,
    status: "confirmed",
    createdAt: "2026-04-22T10:15:00Z",
    staffNotes: [
      { note: "TWSP eligibility verified. Approved for Bookkeeping NC III.", addedBy: "Ms. Carmela Bautista", addedAt: "2026-04-23T09:00:00Z" },
    ],
  },
  {
    id: "e3",
    refNo: "LISTA-2026-00003",
    userId: "u3",
    firstName: "Pedro",
    lastName: "Reyes",
    traineeName: "Pedro Reyes",
    dob: "1995-03-10",
    gender: "Male",
    civilStatus: "Married",
    traineeEmail: "pedro.reyes@email.com",
    contactNumber: "0955-881-9999",
    homeAddress: "Purok 3, Brgy. Lunotan",
    city: "Gingoog City",
    province: "Misamis Oriental",
    education: "Vocational Graduate",
    schoolLastAttended: "TESDA Regional Training Center",
    courseSlug: "driving-nc-ii",
    preferredSchedule: "Full Day (8AM-5PM)",
    enrollmentType: "New Enrollee",
    scholarshipApplication: "Yes, I want to apply",
    employmentStatus: "Unemployed",
    heardFrom: "Friend or Family",
    consent: true,
    status: "confirmed",
    createdAt: "2026-04-20T14:45:00Z",
  },
  {
    id: "e4",
    refNo: "LISTA-2026-00004",
    userId: "u4",
    firstName: "Anna",
    lastName: "Villanueva",
    traineeName: "Anna Villanueva",
    dob: "2002-11-30",
    gender: "Female",
    civilStatus: "Single",
    traineeEmail: "anna.villanueva@email.com",
    contactNumber: "0917-555-7890",
    homeAddress: "Block 4 Lot 12, Greenview Subd.",
    city: "Gingoog City",
    province: "Misamis Oriental",
    education: "Senior High School Graduate",
    schoolLastAttended: "Gingoog Christian School",
    courseSlug: "computer-systems-servicing-nc-ii",
    preferredSchedule: "Morning (8AM-12PM)",
    enrollmentType: "New Enrollee",
    scholarshipApplication: "No, self-funded",
    employmentStatus: "Student",
    heardFrom: "Facebook",
    notes: "Interested in IT support career path.",
    consent: true,
    status: "pending",
    createdAt: "2026-04-26T11:22:00Z",
  },
  {
    id: "e5",
    refNo: "LISTA-2026-00005",
    userId: "u5",
    firstName: "Luis",
    lastName: "Bacus",
    traineeName: "Luis Bacus",
    dob: "1990-06-05",
    gender: "Male",
    civilStatus: "Married",
    traineeEmail: "luis.bacus@email.com",
    contactNumber: "0926-111-2233",
    homeAddress: "Sitio Maligaya, Brgy. 24-A",
    city: "Gingoog City",
    province: "Misamis Oriental",
    education: "High School Graduate",
    courseSlug: "agricultural-crops-production-nc-i",
    preferredSchedule: "Full Day (8AM-5PM)",
    enrollmentType: "New Enrollee",
    scholarshipApplication: "Yes, I want to apply",
    employmentStatus: "Underemployed",
    heardFrom: "Walk-in",
    consent: true,
    status: "waitlisted",
    createdAt: "2026-04-18T08:00:00Z",
  },
  {
    id: "e6",
    refNo: "LISTA-2026-00006",
    firstName: "Joselito",
    lastName: "Mercado",
    traineeName: "Joselito Mercado",
    dob: "1988-09-18",
    gender: "Male",
    civilStatus: "Married",
    traineeEmail: "jose.mercado@email.com",
    contactNumber: "0917-888-4321",
    homeAddress: "Brgy. Hinaplanon, Iligan",
    city: "Iligan City",
    province: "Lanao del Norte",
    education: "College Graduate",
    schoolLastAttended: "MSU-IIT",
    courseSlug: "heo-backhoe-loader-operations-nc-ii",
    preferredSchedule: "Full Day (8AM-5PM)",
    enrollmentType: "New Enrollee",
    scholarshipApplication: "No, self-funded",
    employmentStatus: "Employed (seeking upgrade)",
    heardFrom: "Friend or Family",
    consent: true,
    status: "rejected",
    createdAt: "2026-04-15T09:30:00Z",
    staffNotes: [
      { note: "Class is full for the upcoming cycle. Advised to apply next batch.", addedBy: "Mr. Antonio Lopez", addedAt: "2026-04-16T13:00:00Z" },
    ],
  },
  {
    id: "e7",
    refNo: "LISTA-2026-00007",
    firstName: "Catherine",
    lastName: "Aquino",
    traineeName: "Catherine Aquino",
    dob: "1996-12-01",
    gender: "Female",
    civilStatus: "Single",
    traineeEmail: "cathy.aquino@email.com",
    contactNumber: "0955-333-2211",
    homeAddress: "P-1, Brgy. Poblacion",
    city: "Claveria",
    province: "Misamis Oriental",
    education: "Senior High School Graduate",
    courseSlug: "tailoring-nc-ii",
    preferredSchedule: "Afternoon (1PM-5PM)",
    enrollmentType: "New Enrollee",
    scholarshipApplication: "I need more information",
    employmentStatus: "Unemployed",
    heardFrom: "Facebook",
    consent: true,
    status: "pending",
    createdAt: "2026-04-28T15:10:00Z",
  },
  {
    id: "e8",
    refNo: "LISTA-2026-00008",
    firstName: "Renato",
    lastName: "Domingo",
    traineeName: "Renato Domingo",
    dob: "1985-04-22",
    gender: "Male",
    civilStatus: "Married",
    traineeEmail: "renato.d@email.com",
    contactNumber: "0917-444-5566",
    homeAddress: "Sitio Bagong Silang",
    city: "Magsaysay",
    province: "Misamis Oriental",
    education: "High School Graduate",
    courseSlug: "electrical-installation-maintenance-nc-ii",
    preferredSchedule: "Morning (8AM-12PM)",
    enrollmentType: "Assessment Only",
    scholarshipApplication: "No, self-funded",
    employmentStatus: "Employed (seeking upgrade)",
    heardFrom: "TESDA Website",
    consent: true,
    status: "confirmed",
    createdAt: "2026-04-12T10:00:00Z",
  },
];

// ============================================================================
// SCHEDULES
// ============================================================================

export const schedules = [
  { id: "s1", courseSlug: "computer-systems-servicing-nc-ii", date: "2026-05-04", startTime: "08:00", endTime: "12:00", trainer: "Engr. Mark Villanueva", room: "ICT Lab 1" },
  { id: "s2", courseSlug: "bookkeeping-nc-iii", date: "2026-05-05", startTime: "13:00", endTime: "17:00", trainer: "Ms. Liza Mendoza", room: "Room 201" },
  { id: "s3", courseSlug: "driving-nc-ii", date: "2026-05-06", startTime: "08:00", endTime: "17:00", trainer: "Mr. Roberto Salazar", room: "Driving Range" },
  { id: "s4", courseSlug: "electrical-installation-maintenance-nc-ii", date: "2026-05-07", startTime: "08:00", endTime: "12:00", trainer: "Master Electrician Romeo Bacus", room: "Workshop A" },
  { id: "s5", courseSlug: "agricultural-crops-production-nc-i", date: "2026-05-08", startTime: "08:00", endTime: "17:00", trainer: "Engr. Carlos Domingo", room: "LISTA Farm, Lunotan" },
  { id: "s6", courseSlug: "tailoring-nc-ii", date: "2026-05-09", startTime: "13:00", endTime: "17:00", trainer: "Ms. Rosalinda Aquino", room: "Garments Studio" },
  { id: "s7", courseSlug: "heo-backhoe-loader-operations-nc-ii", date: "2026-05-11", startTime: "08:00", endTime: "17:00", trainer: "Mr. Jose Pacardo", room: "HEO Yard" },
  { id: "s8", courseSlug: "computer-systems-servicing-nc-ii", date: "2026-05-13", startTime: "08:00", endTime: "12:00", trainer: "Engr. Mark Villanueva", room: "ICT Lab 1" },
];

// ============================================================================
// ANNOUNCEMENTS
// ============================================================================

export const announcements = [
  {
    id: "a1",
    title: "TWSP Scholarship Slots Now Open for Bookkeeping NC III",
    body: "Limited slots available for the Training for Work Scholarship Program (TWSP) covering full tuition for Bookkeeping NC III. Eligible applicants must be unemployed, underemployed, or employed Filipinos seeking an upgrade. Call (088) 861-4200 to inquire.",
    targetRole: "all",
    createdAt: "2026-04-28T08:00:00Z",
    author: "Admissions Office",
  },
  {
    id: "a2",
    title: "Welcome to the May 2026 Training Cycle",
    body: "Classes for the May 2026 batch begin on May 4. Confirmed trainees, please report to the LISTA campus at FJY Bldg., National Highway, Brgy. 24-A, Gingoog City by 7:30 AM on your scheduled start date.",
    targetRole: "trainee",
    createdAt: "2026-04-26T09:00:00Z",
    author: "Academic Office",
  },
  {
    id: "a3",
    title: "Holiday Notice — Labor Day",
    body: "The LISTA campus and Lunotan training farm will be closed on May 1, 2026 in observance of Labor Day. Regular office hours resume on May 2.",
    targetRole: "all",
    createdAt: "2026-04-25T12:00:00Z",
    author: "Administration",
  },
  {
    id: "a4",
    title: "Staff Meeting — Friday 3:00 PM",
    body: "Monthly staff coordination meeting this Friday at 3:00 PM in the Conference Room. Agenda: enrollment review, schedule planning for May batch, and assessment center updates.",
    targetRole: "staff",
    createdAt: "2026-04-27T11:00:00Z",
    author: "School President",
  },
  {
    id: "a5",
    title: "TESDA National Assessment Schedule Released",
    body: "The next TESDA National Competency Assessment for Computer Systems Servicing NC II and Electrical Installation NC II will be held on May 25–27, 2026 at the Lorenz ISTA Assessment Center. Register through your trainee dashboard.",
    targetRole: "trainee",
    createdAt: "2026-04-23T10:30:00Z",
    author: "Assessment Center",
  },
  {
    id: "a6",
    title: "Community Outreach — Rabbitry Workshop Open Slots",
    body: "Following the success of last June's Rabbitry TOT, we are opening 15 additional community slots for a 3-day rabbitry workshop in partnership with ATI Region X. Held at LISTA Farm, Lunotan.",
    targetRole: "all",
    createdAt: "2026-04-20T14:00:00Z",
    author: "Community Programs",
  },
];

// ============================================================================
// CERTIFICATES
// ============================================================================

export interface Certificate {
  id: string;
  userId: string;
  courseSlug: string;
  ncLevel: string;
  status: "in_progress" | "issued" | "rejected";
  progressStage?: "training" | "training_complete" | "assessment_taken" | "passed" | "failed";
  issuedAt?: string;
  fileUrl?: string;
}

export const certificates: Certificate[] = [
  {
    id: "cert1",
    userId: "u1",
    courseSlug: "electrical-installation-maintenance-nc-ii",
    ncLevel: "NC II",
    status: "in_progress",
    progressStage: "training",
  },
  {
    id: "cert2",
    userId: "u2",
    courseSlug: "bookkeeping-nc-iii",
    ncLevel: "NC III",
    status: "in_progress",
    progressStage: "assessment_taken",
  },
  {
    id: "cert3",
    userId: "u3",
    courseSlug: "driving-nc-ii",
    ncLevel: "NC II",
    status: "issued",
    issuedAt: "2026-03-15T00:00:00Z",
    fileUrl: "#",
    progressStage: "passed",
  },
  {
    id: "cert4",
    userId: "u4",
    courseSlug: "computer-systems-servicing-nc-ii",
    ncLevel: "NC II",
    status: "in_progress",
    progressStage: "training",
  },
];

// ============================================================================
// TESTIMONIALS
// ============================================================================

export const testimonials = [
  {
    id: "t1",
    name: "Graduate, Electrical NC II",
    role: "Licensed Electrician",
    quote: "Salamat sa Lorenz ISTA! Nakakuha na ako ng trabaho bilang electrician.",
  },
  {
    id: "t2",
    name: "Graduate, Bookkeeping NC III",
    role: "Bookkeeper, TWSP Scholar",
    quote: "Nag-avail ako ng TWSP scholarship para sa Bookkeeping. Libre ang training, sobrang worth it!",
  },
  {
    id: "t3",
    name: "Graduate, Computer Systems Servicing NC II",
    role: "IT Support Technician",
    quote: "Ang instructors dito ay propesyonal at maalam. Natuto talaga ako ng praktikal na skills.",
  },
  {
    id: "t4",
    name: "Assessment Client",
    role: "PTCACS Certified",
    quote: "Ang Lorenz Assessment Center ay mabilis at maayos ang proseso.",
  },
];

// ============================================================================
// FAQs
// ============================================================================

export const faqs = [
  {
    id: "f1",
    question: "Who can apply for TWSP?",
    answer: "The Training for Work Scholarship Program is open to unemployed, underemployed, or employed Filipinos seeking to upgrade their skills.",
    category: "Scholarship",
  },
  {
    id: "f2",
    question: "Is TWSP free?",
    answer: "Yes, TWSP provides full tuition coverage. A training allowance may also be granted depending on the course and program guidelines.",
    category: "Scholarship",
  },
  {
    id: "f3",
    question: "How many slots are available?",
    answer: "Slots are limited and awarded on a first-come, first-served basis. For current availability, call us at (088) 861-4200.",
    category: "Scholarship",
  },
  {
    id: "f4",
    question: "What documents are required for enrollment?",
    answer: "PSA Birth Certificate, a valid government ID, proof of residency, and your highest educational certificate.",
    category: "Admissions",
  },
  {
    id: "f5",
    question: "How long is the training?",
    answer: "Training duration varies by course. For example, Tailoring NC II requires a minimum of 275 training hours.",
    category: "Academics",
  },
  {
    id: "f6",
    question: "Can I enroll if I am self-funded?",
    answer: "Yes, self-funded enrollees are very welcome. Choose 'No, self-funded' on the enrollment form.",
    category: "Admissions",
  },
  {
    id: "f7",
    question: "What happens after I complete training?",
    answer: "After completing your training, you take the TESDA National Competency Assessment to receive your NC I, NC II, or NC III certification.",
    category: "Academics",
  },
  {
    id: "f8",
    question: "Do you offer online training?",
    answer: "All training is conducted face-to-face at our Gingoog City campus or Lunotan training farm. We do not offer fully online programs at this time.",
    category: "Academics",
  },
];

// ============================================================================
// ANALYTICS SEED (for admin charts)
// ============================================================================

export const analyticsTrend = [
  { month: "Nov 2025", enrollments: 42 },
  { month: "Dec 2025", enrollments: 38 },
  { month: "Jan 2026", enrollments: 51 },
  { month: "Feb 2026", enrollments: 67 },
  { month: "Mar 2026", enrollments: 72 },
  { month: "Apr 2026", enrollments: 89 },
];

export const dailyTrend = [
  { day: "Mon", count: 8 },
  { day: "Tue", count: 12 },
  { day: "Wed", count: 15 },
  { day: "Thu", count: 11 },
  { day: "Fri", count: 18 },
  { day: "Sat", count: 14 },
  { day: "Sun", count: 5 },
];

export const scholarshipDistribution = [
  { name: "TWSP Scholarship", value: 38, fill: "#D4900A" },
  { name: "Self-Funded", value: 95, fill: "#1B3A8C" },
  { name: "Pending Decision", value: 9, fill: "#7A89A8" },
];
