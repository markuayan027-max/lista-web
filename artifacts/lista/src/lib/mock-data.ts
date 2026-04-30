export type UserRole = 'trainee' | 'staff' | 'admin';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatarUrl: string;
}

export const courses = [
  {
    id: "c1",
    slug: "web-development-bootcamp",
    title: "Web Development Bootcamp",
    category: "Technology",
    level: "Beginner",
    durationWeeks: 12,
    priceUSD: 1200,
    tags: ["React", "Node.js", "Full Stack"],
    shortDescription: "Learn to build modern web applications from scratch.",
    longDescription: "A comprehensive journey through modern web development. You will learn HTML, CSS, JavaScript, React, and Node.js, culminating in a full-stack capstone project.",
    syllabus: [
      { title: "Frontend Basics", items: ["HTML5", "CSS3", "Responsive Design"] },
      { title: "JavaScript Core", items: ["Variables", "Functions", "DOM Manipulation"] },
      { title: "React Framework", items: ["Components", "Hooks", "State Management"] }
    ],
    instructor: { name: "Sarah Jenkins", title: "Senior Software Engineer" },
    coverImageUrl: "/course-web-dev.png"
  },
  {
    id: "c2",
    slug: "data-science-fundamentals",
    title: "Data Science Fundamentals",
    category: "Data",
    level: "Intermediate",
    durationWeeks: 10,
    priceUSD: 1400,
    tags: ["Python", "Machine Learning", "Data Viz"],
    shortDescription: "Master the art of extracting insights from data.",
    longDescription: "Dive into data analysis, visualization, and basic machine learning using Python. Perfect for analysts wanting to upskill.",
    syllabus: [
      { title: "Python for Data", items: ["Pandas", "NumPy", "Data Cleaning"] },
      { title: "Data Visualization", items: ["Matplotlib", "Seaborn", "Dashboards"] },
      { title: "Intro to ML", items: ["Scikit-Learn", "Regression", "Classification"] }
    ],
    instructor: { name: "Dr. Michael Chen", title: "Data Scientist" },
    coverImageUrl: "/course-data-science.png"
  },
  {
    id: "c3",
    slug: "ui-ux-design",
    title: "UI/UX Design Masterclass",
    category: "Design",
    level: "Beginner",
    durationWeeks: 8,
    priceUSD: 950,
    tags: ["Figma", "User Research", "Prototyping"],
    shortDescription: "Design intuitive and beautiful digital experiences.",
    longDescription: "Learn the principles of user interface and user experience design. From user research to high-fidelity prototyping in Figma.",
    syllabus: [
      { title: "Design Thinking", items: ["User Personas", "Journey Mapping"] },
      { title: "Wireframing", items: ["Information Architecture", "Low-fi prototypes"] },
      { title: "High-Fidelity UI", items: ["Color Theory", "Typography", "Figma Mastery"] }
    ],
    instructor: { name: "Elena Rodriguez", title: "Product Designer" },
    coverImageUrl: "/course-ui-ux.png"
  },
  {
    id: "c4",
    slug: "healthcare-admin",
    title: "Healthcare Administration",
    category: "Healthcare",
    level: "Beginner",
    durationWeeks: 6,
    priceUSD: 800,
    tags: ["Management", "Compliance", "Operations"],
    shortDescription: "Essential skills for managing healthcare facilities.",
    longDescription: "Understand the operational, financial, and regulatory aspects of healthcare administration.",
    syllabus: [
      { title: "Healthcare Systems", items: ["Structure", "Policy", "Ethics"] },
      { title: "Operations Management", items: ["Scheduling", "Resource Allocation"] },
      { title: "Compliance", items: ["HIPAA", "Quality Assurance"] }
    ],
    instructor: { name: "James Wilson", title: "Healthcare Administrator" },
    coverImageUrl: "/course-healthcare.png"
  },
  {
    id: "c5",
    slug: "digital-marketing",
    title: "Digital Marketing Strategy",
    category: "Marketing",
    level: "Intermediate",
    durationWeeks: 6,
    priceUSD: 850,
    tags: ["SEO", "Social Media", "Analytics"],
    shortDescription: "Drive growth with modern digital marketing techniques.",
    longDescription: "A strategic approach to digital marketing covering SEO, content marketing, and paid advertising.",
    syllabus: [
      { title: "SEO & Content", items: ["Keyword Research", "On-page SEO"] },
      { title: "Social Media", items: ["Platform Strategy", "Community Management"] },
      { title: "Analytics", items: ["Google Analytics", "Campaign Tracking"] }
    ],
    instructor: { name: "Anita Patel", title: "Marketing Director" },
    coverImageUrl: "/course-marketing.png"
  },
  {
    id: "c6",
    slug: "cybersecurity-basics",
    title: "Cybersecurity Basics",
    category: "Technology",
    level: "Beginner",
    durationWeeks: 8,
    priceUSD: 1100,
    tags: ["Security", "Network", "Compliance"],
    shortDescription: "Protect systems and data from cyber threats.",
    longDescription: "An introduction to the fundamentals of information security, threat modeling, and network defense.",
    syllabus: [
      { title: "Security Principles", items: ["CIA Triad", "Risk Management"] },
      { title: "Network Security", items: ["Firewalls", "VPNs", "Intrusion Detection"] },
      { title: "Incident Response", items: ["Threat Intelligence", "Recovery"] }
    ],
    instructor: { name: "David Kim", title: "Security Analyst" },
    coverImageUrl: "/course-cybersecurity.png"
  },
  {
    id: "c7",
    slug: "hospitality-management",
    title: "Hospitality Management",
    category: "Business",
    level: "Beginner",
    durationWeeks: 10,
    priceUSD: 1000,
    tags: ["Service", "Operations", "Leadership"],
    shortDescription: "Excellence in service and hospitality operations.",
    longDescription: "Learn to manage hotels, restaurants, and events with a focus on exceptional customer service and operational efficiency.",
    syllabus: [
      { title: "Service Excellence", items: ["Customer Experience", "Conflict Resolution"] },
      { title: "Hotel Operations", items: ["Front Office", "Housekeeping"] },
      { title: "Event Management", items: ["Planning", "Catering", "Logistics"] }
    ],
    instructor: { name: "Maria Garcia", title: "Hospitality Consultant" },
    coverImageUrl: "/course-hospitality.png"
  },
  {
    id: "c8",
    slug: "project-management",
    title: "Agile Project Management",
    category: "Business",
    level: "Intermediate",
    durationWeeks: 6,
    priceUSD: 900,
    tags: ["Agile", "Scrum", "Leadership"],
    shortDescription: "Lead successful projects with Agile methodologies.",
    longDescription: "Master Agile and Scrum frameworks to deliver projects on time and adapt to changing requirements.",
    syllabus: [
      { title: "Agile Fundamentals", items: ["Values", "Principles", "Mindset"] },
      { title: "Scrum Framework", items: ["Roles", "Events", "Artifacts"] },
      { title: "Execution", items: ["Sprint Planning", "Velocity", "Retrospectives"] }
    ],
    instructor: { name: "Robert Taylor", title: "Agile Coach" },
    coverImageUrl: "/course-project-management.png"
  }
];

export const enrollments = [
  { id: "e1", refNo: "LISTA-2026-0001", traineeName: "Alex Johnson", traineeEmail: "alex@example.com", courseSlug: "web-development-bootcamp", status: "pending", createdAt: "2023-10-01T10:00:00Z" },
  { id: "e2", refNo: "LISTA-2026-0002", traineeName: "Sam Smith", traineeEmail: "sam@example.com", courseSlug: "data-science-fundamentals", status: "confirmed", createdAt: "2023-10-02T11:30:00Z" },
  { id: "e3", refNo: "LISTA-2026-0003", traineeName: "Jordan Lee", traineeEmail: "jordan@example.com", courseSlug: "ui-ux-design", status: "rejected", createdAt: "2023-10-03T09:15:00Z" },
  { id: "e4", refNo: "LISTA-2026-0004", traineeName: "Taylor Swift", traineeEmail: "taylor@example.com", courseSlug: "healthcare-admin", status: "confirmed", createdAt: "2023-10-04T14:20:00Z" },
  { id: "e5", refNo: "LISTA-2026-0005", traineeName: "Casey Brown", traineeEmail: "casey@example.com", courseSlug: "digital-marketing", status: "pending", createdAt: "2023-10-05T16:45:00Z" }
];

export const announcements = [
  { id: "a1", title: "Welcome to Fall Semester", body: "Classes begin next week. Please check your schedules.", targetRole: "all", createdAt: "2023-09-25T08:00:00Z", author: "Admin Office" },
  { id: "a2", title: "System Maintenance", body: "The learning portal will be down for maintenance on Sunday 2AM-4AM.", targetRole: "all", createdAt: "2023-09-28T10:00:00Z", author: "IT Support" },
  { id: "a3", title: "New Assignment Policy", body: "Please review the updated submission guidelines.", targetRole: "trainee", createdAt: "2023-10-01T09:00:00Z", author: "Academic Board" },
  { id: "a4", title: "Staff Meeting", body: "Monthly staff meeting this Friday at 3PM in Room A.", targetRole: "staff", createdAt: "2023-10-02T11:00:00Z", author: "HR" }
];

export const schedules = [
  { id: "s1", courseSlug: "web-development-bootcamp", date: "2023-10-15", startTime: "09:00", endTime: "12:00", trainer: "Sarah Jenkins", room: "Lab 1" },
  { id: "s2", courseSlug: "data-science-fundamentals", date: "2023-10-16", startTime: "13:00", endTime: "16:00", trainer: "Dr. Michael Chen", room: "Lab 2" },
  { id: "s3", courseSlug: "ui-ux-design", date: "2023-10-17", startTime: "10:00", endTime: "12:00", trainer: "Elena Rodriguez", room: "Studio A" },
  { id: "s4", courseSlug: "healthcare-admin", date: "2023-10-18", startTime: "14:00", endTime: "17:00", trainer: "James Wilson", room: "Room 301" }
];

export const certificates = [
  { id: "cert1", userId: "u1", courseSlug: "web-development-bootcamp", status: "issued", issuedAt: "2023-08-15T00:00:00Z", fileUrl: "#" },
  { id: "cert2", userId: "u1", courseSlug: "ui-ux-design", status: "in_progress" }
];

export const users = [
  { id: "u1", name: "Alice Trainee", email: "alice@example.com", role: "trainee" },
  { id: "u2", name: "Bob Staff", email: "bob@example.com", role: "staff" },
  { id: "u3", name: "Charlie Admin", email: "charlie@example.com", role: "admin" }
];

export const testimonials = [
  { id: "t1", name: "Sarah M.", role: "Web Developer", quote: "LISTA transformed my career. The bootcamp was intense but totally worth it." },
  { id: "t2", name: "David K.", role: "UX Designer", quote: "The hands-on projects helped me build a portfolio that got me hired immediately." },
  { id: "t3", name: "Elena R.", role: "Data Analyst", quote: "Incredible instructors and a very supportive learning environment." }
];

export const faqs = [
  { id: "f1", question: "How do I apply?", answer: "You can apply through our online enrollment form.", category: "Admissions" },
  { id: "f2", question: "Are there scholarships available?", answer: "Yes, we offer merit and need-based scholarships.", category: "Financial" },
  { id: "f3", question: "What is the class schedule?", answer: "Schedules vary by course. Most have options for evening or weekend classes.", category: "Academics" },
  { id: "f4", question: "Do I get a certificate?", answer: "Yes, upon successful completion of your course, you will receive a verified digital certificate.", category: "Academics" }
];
