import { pgTable, text, timestamp, uuid, pgEnum, index, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const userRoleEnum = pgEnum("user_role", ["trainee", "staff", "admin"]);
export const userStatusEnum = pgEnum("user_status", ["active", "deactivated"]);

export const users = pgTable("lms_users_legacy", {
  id: uuid("id").primaryKey().defaultRandom(),
  firstName: text("first_name").notNull(),
  lastName: text("last_name").notNull(),
  email: text("email").notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  role: userRoleEnum("role").notNull().default("trainee"),
  status: userStatusEnum("status").notNull().default("active"),
  enrollmentId: uuid("enrollment_id"),
  lastLogin: timestamp("last_login"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (table) => {
  return {
    emailIdx: index("users_email_idx").on(table.email),
    roleIdx: index("users_role_idx").on(table.role),
  }
});

export const enrollmentStatusEnum = pgEnum("enrollment_status", ["Pending", "Confirmed", "Rejected", "Waitlisted", "Review", "Interview", "Enrolled", "Cancelled", "Completed", "Ready to Apply"]);

export const enrollments = pgTable("lms_enrollments_legacy", {
  id: uuid("id").primaryKey().defaultRandom(),
  refNo: text("ref_no").notNull().unique(),
  userId: uuid("user_id").references(() => users.id),
  firstName: text("first_name").notNull(),
  middleName: text("middle_name"),
  lastName: text("last_name").notNull(),
  extensionName: text("extension_name"),
  traineeName: text("trainee_name"),
  dob: text("dob").notNull(),
  birthPlace: text("birth_place"),
  age: text("age"),
  gender: text("gender").notNull(),
  civilStatus: text("civil_status").notNull(),
  nationality: text("nationality"),
  email: text("email").notNull(),
  contact: text("contact").notNull(),
  telephone: text("telephone"),
  address: text("address").notNull(),
  barangay: text("barangay"),
  district: text("district"),
  city: text("city").notNull(),
  province: text("province").notNull(),
  region: text("region"),
  zipCode: text("zip_code"),
  education: text("education").notNull(),
  school: text("school"),
  yearGraduated: text("year_graduated"),
  course: text("course"), // Made nullable to support "Ready to Apply" status
  schedule: text("schedule"), // Made nullable to support "Ready to Apply" status
  enrollType: text("enroll_type").notNull(),
  scholarship: text("scholarship"),
  employment: text("employment"),
  employmentType: text("employment_type"),
  companyName: text("company_name"),
  heardFrom: text("heard_from"),
  notes: text("notes"),
  status: enrollmentStatusEnum("status").notNull().default("Pending"),
  uli: text("uli"),
  voucherNo: text("voucher_no"),
  psaNo: text("psa_no"),
  learnerClassification: text("learner_classification"),
  clientType: text("client_type"),
  qualificationType: text("qualification_type"),
  motherMaidenName: text("mother_maiden_name"),
  fatherName: text("father_name"),
  isIP: boolean("is_ip"),
  indigenousGroup: text("indigenous_group"),
  motherTongue: text("mother_tongue"),
  consent: boolean("consent").notNull().default(false),
  submittedAt: timestamp("submitted_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (table) => {
  return {
    refNoIdx: index("enrollment_ref_no_idx").on(table.refNo),
    userIdIdx: index("enrollment_user_id_idx").on(table.userId),
    statusIdx: index("enrollment_status_idx").on(table.status),
  }
});

export const announcements = pgTable("announcements", {
  id: uuid("id").primaryKey().defaultRandom(),
  title: text("title").notNull(),
  body: text("body").notNull(),
  target: text("target").notNull(), // 'all', 'trainee', 'staff', 'admin'
  targetCourse: text("target_course"),
  fileUrl: text("file_url"),
  publishAt: timestamp("publish_at"),
  createdBy: uuid("created_by").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => {
  return {
    targetIdx: index("announcement_target_idx").on(table.target),
  }
});

export const schedules = pgTable("schedules", {
  id: uuid("id").primaryKey().defaultRandom(),
  course: text("course").notNull(),
  startDate: timestamp("start_date").notNull(),
  endDate: timestamp("end_date").notNull(),
  timeSlot: text("time_slot").notNull(),
  location: text("location").notNull(),
  trainer: text("trainer").notNull(),
  notes: text("notes"),
  notifiedAt: timestamp("notified_at"),
  createdBy: uuid("created_by").references(() => users.id),
}, (table) => {
  return {
    courseIdx: index("schedule_course_idx").on(table.course),
  }
});

export const courses = pgTable("courses", {
  id: uuid("id").primaryKey().defaultRandom(),
  slug: text("slug").notNull().unique(),
  name: text("name").notNull(),
  ncLevel: text("nc_level").notNull(),
  sector: text("sector").notNull(),
  description: text("description").notNull(),
  shortDescription: text("short_description"),
  duration: text("duration"),
  twspScholarship: text("twsp_scholarship").notNull().default("false"), // 'true' or 'false'
  isAssessmentOnly: text("is_assessment_only").notNull().default("false"),
  coverImageUrl: text("cover_image_url"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => {
  return {
    slugIdx: index("course_slug_idx").on(table.slug),
  }
});

export const faqs = pgTable("faqs", {
  id: uuid("id").primaryKey().defaultRandom(),
  question: text("question").notNull(),
  answer: text("answer").notNull(),
  category: text("category"),
  order: text("order").notNull().default("0"),
});

export const testimonials = pgTable("testimonials", {
  id: uuid("id").primaryKey().defaultRandom(),
  quote: text("quote").notNull(),
  attribution: text("attribution").notNull(),
  name: text("name"),
  role: text("role"),
});

export const cases = pgTable("cases", {
  id: uuid("id").primaryKey().defaultRandom(),
  title: text("title").notNull(),
  description: text("description"),
  status: text("status").notNull().default("open"), // open, closed, investigation
  priority: text("priority").notNull().default("medium"), // low, medium, high
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (table) => {
  return {
    statusIdx: index("case_status_idx").on(table.status),
    priorityIdx: index("case_priority_idx").on(table.priority),
  }
});

export const incidents = pgTable("incidents", {
  id: uuid("id").primaryKey().defaultRandom(),
  caseId: uuid("case_id").references(() => cases.id),
  studentId: uuid("student_id").references(() => users.id),
  type: text("type").notNull(), // disciplinary, attendance, performance, etc.
  description: text("description").notNull(),
  occurrenceDate: timestamp("occurrence_date").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => {
  return {
    studentIdIdx: index("incident_student_id_idx").on(table.studentId),
    caseIdIdx: index("incident_case_id_idx").on(table.caseId),
    typeIdx: index("incident_type_idx").on(table.type),
  }
});

export const insertUserSchema = createInsertSchema(users).omit({ id: true, createdAt: true, updatedAt: true });
export const insertEnrollmentSchema = createInsertSchema(enrollments).omit({ id: true, submittedAt: true, updatedAt: true });
export const insertAnnouncementSchema = createInsertSchema(announcements).omit({ id: true, createdAt: true });
export const insertScheduleSchema = createInsertSchema(schedules).omit({ id: true });
export const insertCourseSchema = createInsertSchema(courses).omit({ id: true, createdAt: true });
export const insertFaqSchema = createInsertSchema(faqs).omit({ id: true });
export const insertTestimonialSchema = createInsertSchema(testimonials).omit({ id: true });
export const insertCaseSchema = createInsertSchema(cases).omit({ id: true, createdAt: true, updatedAt: true });
export const insertIncidentSchema = createInsertSchema(incidents).omit({ id: true, createdAt: true });

export type User = typeof users.$inferSelect;
export type Enrollment = typeof enrollments.$inferSelect;
export type Announcement = typeof announcements.$inferSelect;
export type Schedule = typeof schedules.$inferSelect;
export type Course = typeof courses.$inferSelect;
export type Faq = typeof faqs.$inferSelect;
export type Testimonial = typeof testimonials.$inferSelect;
export type Case = typeof cases.$inferSelect;
export type Incident = typeof incidents.$inferSelect;
