import { Router } from "express";
import { db } from "@workspace/db";
import { enrollments, users } from "@workspace/db/schema";
import { and, desc, eq, sql as dsql } from "drizzle-orm";
import { z } from "zod";
import { logger } from "../lib/logger.js";
import { assertEmailAccess, requireAuth } from "../middleware/auth.js";
import { ensureBatchSchemaReady } from "./batches.js";
import {
  assignBatchIfApplicable,
  canStartNewApplication,
  deactivateEnrollment,
  ensureEnrollmentLifecycleSchema,
  generateRefNo,
  getActiveEnrollmentByEmail,
  getEnrollmentHistoryByEmail,
  statusBlocksNewApplication,
} from "../lib/enrollment-lifecycle.js";

const router = Router();
router.use(requireAuth);

function coerceIsIp(value: unknown): boolean | null {
  if (value === undefined || value === null || value === "") return null;
  if (typeof value === "boolean") return value;
  const s = String(value).trim().toLowerCase();
  if (s === "true" || s === "yes" || s === "1") return true;
  if (s === "false" || s === "no" || s === "0") return false;
  return null;
}

const registerSchema = z.object({
  refNo: z.string().min(1),
  firstName: z.string().min(1),
  middleName: z.string().optional(),
  lastName: z.string().min(1),
  extensionName: z.string().optional(),
  traineeName: z.string().optional(),
  dob: z.string().min(1),
  birthPlace: z.string().optional(),
  age: z.coerce.string().optional(),
  gender: z.string().min(1),
  civilStatus: z.string().min(1),
  nationality: z.string().optional(),
  uli: z.string().optional(),
  voucherNo: z.string().optional(),
  psaNo: z.string().optional(),
  learnerClassification: z.string().optional(),
  clientType: z.string().optional(),
  qualificationType: z.string().optional(),
  motherMaidenName: z.string().optional(),
  fatherName: z.string().optional(),
  isIP: z.coerce.string().optional(),
  indigenousGroup: z.string().optional(),
  motherTongue: z.string().optional(),
  traineeEmail: z.string().email(),
  contactNumber: z.string().min(1),
  telephone: z.string().optional(),
  mobileNumber: z.string().optional(),
  homeAddress: z.string().min(1),
  barangay: z.string().optional(),
  district: z.string().optional(),
  city: z.string().min(1),
  province: z.string().min(1),
  region: z.string().optional(),
  zipCode: z.string().optional(),
  education: z.string().min(1),
  schoolLastAttended: z.string().optional(),
  yearGraduated: z.string().optional(),
  employmentStatus: z.string().optional(),
  employmentType: z.string().optional(),
  companyName: z.string().optional(),
  workExperience: z.array(z.any()).optional(),
  otherTrainings: z.array(z.any()).optional(),
  licensureExams: z.array(z.any()).optional(),
  competencyAssessments: z.array(z.any()).optional(),
  courseSlug: z.string().optional(),
  preferredSchedule: z.string().optional(),
  enrollmentType: z.string().min(1),
  scholarshipApplication: z.string().optional(),
  consent: z.boolean().optional(),
  status: z.enum(["Pending", "Confirmed", "Rejected", "Waitlisted", "Review", "Interview", "Enrolled", "Cancelled", "Completed", "Ready to Apply"]).default("Pending")
});

/** Serialize arrays not stored as dedicated columns into `notes` (schema-aligned). */
function supplementalEnrollmentNotes(data: {
  workExperience?: unknown;
  otherTrainings?: unknown;
  licensureExams?: unknown;
  competencyAssessments?: unknown;
}): string | undefined {
  const payload = {
    workExperience: data.workExperience,
    otherTrainings: data.otherTrainings,
    licensureExams: data.licensureExams,
    competencyAssessments: data.competencyAssessments,
  };
  const has = Object.values(payload).some((v) =>
    v !== undefined &&
    v !== null &&
    (Array.isArray(v) ? v.length > 0 : typeof v === "object" ? Object.keys(v as object).length > 0 : true),
  );
  if (!has) return undefined;
  return JSON.stringify(payload);
}

type RegisterBody = z.infer<typeof registerSchema>;

function isUniqueViolation(error: unknown): boolean {
  const err = error as { code?: string; cause?: { code?: string } };
  return err?.code === "23505" || err?.cause?.code === "23505";
}

function enrollmentValuesFromRegister(data: RegisterBody, notesExtra?: string) {
  return {
    refNo: data.refNo,
    firstName: data.firstName,
    middleName: data.middleName,
    lastName: data.lastName,
    extensionName: data.extensionName,
    traineeName:
      data.traineeName || `${data.lastName}, ${data.firstName} ${data.middleName || ""}`.trim(),
    dob: data.dob,
    birthPlace: data.birthPlace,
    age: data.age,
    gender: data.gender,
    civilStatus: data.civilStatus,
    nationality: data.nationality,
    email: data.traineeEmail.trim().toLowerCase(),
    contact: data.contactNumber,
    telephone: data.telephone,
    address: data.homeAddress,
    barangay: data.barangay,
    district: data.district,
    city: data.city,
    province: data.province,
    region: data.region,
    zipCode: data.zipCode,
    education: data.education,
    school: data.schoolLastAttended,
    yearGraduated: data.yearGraduated,
    course: data.courseSlug,
    schedule: data.preferredSchedule,
    enrollType: data.enrollmentType,
    scholarship: data.scholarshipApplication,
    employment: data.employmentStatus,
    employmentType: data.employmentType,
    companyName: data.companyName,
    notes: notesExtra,
    uli: data.uli,
    voucherNo: data.voucherNo,
    psaNo: data.psaNo,
    learnerClassification: data.learnerClassification,
    clientType: data.clientType,
    qualificationType: data.qualificationType,
    motherMaidenName: data.motherMaidenName,
    fatherName: data.fatherName,
    isIP: coerceIsIp(data.isIP),
    indigenousGroup: data.indigenousGroup,
    motherTongue: data.motherTongue,
    consent: data.consent ?? false,
    status: data.status,
  };
}

router.post("/register", async (req, res) => {
  try {
    await ensureBatchSchemaReady();
    const data = registerSchema.parse(req.body);
    if (!assertEmailAccess(req, data.traineeEmail)) {
      return res.status(403).json({ success: false, error: "Cannot register for another user's email" });
    }

    const email = data.traineeEmail.trim().toLowerCase();
    const notesExtra = supplementalEnrollmentNotes(data);
    const values = enrollmentValuesFromRegister(data, notesExtra);

    const [pubUser] = await db.select({ id: users.id }).from(users).where(eq(users.email, email)).limit(1);
    const valuesWithUser = { ...values, userId: pubUser?.id ?? null };

    await ensureEnrollmentLifecycleSchema();
    const active = await getActiveEnrollmentByEmail(email);

    if (active && statusBlocksNewApplication(String(active.status ?? ""))) {
      const { refNo: _keepRef, ...patch } = values;
      const [updated] = await db
        .update(enrollments)
        .set({ ...patch, isActive: true, updatedAt: new Date() })
        .where(eq(enrollments.id, active.id))
        .returning();
      if (updated?.course && String(updated.course).trim()) {
        await assignBatchIfApplicable(
          updated.id,
          String(updated.course ?? ""),
          String(updated.status ?? ""),
          "auto_assign",
        );
      }
      logger.info({ email }, "Profile updated on active enrollment");
      return res.status(200).json({ success: true, data: updated, updated: true });
    }

    const history = await getEnrollmentHistoryByEmail(email, 1);
    const last = history[0];
    const nextCycle = (last?.cycleNumber ?? 0) + 1;
    const insertValues = {
      ...valuesWithUser,
      refNo: generateRefNo(),
      isActive: true,
      cycleNumber: nextCycle,
      previousEnrollmentId: last?.id ?? null,
    };

    try {
      const [enrollment] = await db.insert(enrollments).values(insertValues).returning();
      if (enrollment?.course) {
        await assignBatchIfApplicable(
          enrollment.id,
          String(enrollment.course ?? ""),
          String(enrollment.status ?? ""),
          "auto_assign",
        );
      }
      return res.status(201).json({ success: true, data: enrollment });
    } catch (insertError) {
      if (!isUniqueViolation(insertError)) {
        throw insertError;
      }
      const fallbackActive = await getActiveEnrollmentByEmail(email);
      if (!fallbackActive) throw insertError;
      const [updated] = await db
        .update(enrollments)
        .set({ ...insertValues, updatedAt: new Date() })
        .where(eq(enrollments.id, fallbackActive.id))
        .returning();
      return res.status(200).json({ success: true, data: updated, updated: true });
    }
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ success: false, error: "Validation Error", details: error.errors });
    }

    console.error("Error registering trainee:", error);
    const message =
      error instanceof Error && error.message.includes("timeout")
        ? "Database connection timed out — try again in a moment"
        : "Internal Server Error";
    return res.status(500).json({ success: false, error: message });
  }
});

router.get("/profile", async (req, res) => {
  const email = req.query.email as string;
  if (!email) {
    return res.status(400).json({ success: false, error: "Email is required" });
  }
  if (!assertEmailAccess(req, email)) {
    return res.status(403).json({ success: false, error: "Forbidden" });
  }

  const normalizedEmail = email.trim().toLowerCase();

  try {
    await ensureBatchSchemaReady();
    await ensureEnrollmentLifecycleSchema();
    const active = await getActiveEnrollmentByEmail(normalizedEmail);
    const history = await getEnrollmentHistoryByEmail(normalizedEmail);
    if (!active && history.length === 0) {
      return res.status(404).json({ success: false, error: "Profile not found" });
    }

    const canQuickApply =
      !active ||
      canStartNewApplication({
        status: active.status,
        tesdaNcSentAt: active.tesdaNcSentAt,
        isActive: active.isActive,
      });

    return res.json({
      success: true,
      data: active ?? history[0],
      activeEnrollment: active,
      history,
      canQuickApply,
    });
  } catch (error) {
    console.error("Error fetching trainee profile:", error);
    return res.status(500).json({ success: false, error: "Internal Server Error" });
  }
});

const applySchema = z.object({
  courseSlug: z.string().min(1),
  batchId: z.string().uuid().optional(),
  preferredSchedule: z.string().optional(),
  enrollmentType: z.string().optional(),
});

router.post("/apply", async (req, res) => {
  try {
    await ensureBatchSchemaReady();
    await ensureEnrollmentLifecycleSchema();
    const body = applySchema.parse(req.body);
    const email = (req.body.traineeEmail as string | undefined)?.trim().toLowerCase()
      ?? req.authUser?.email?.trim().toLowerCase();
    if (!email) {
      return res.status(400).json({ success: false, error: "Email is required" });
    }
    if (!assertEmailAccess(req, email)) {
      return res.status(403).json({ success: false, error: "Forbidden" });
    }

    const active = await getActiveEnrollmentByEmail(email);
    if (active && statusBlocksNewApplication(String(active.status ?? ""))) {
      return res.status(409).json({
        success: false,
        error: "You already have an active application. Cancel it or wait for staff to complete the cycle.",
      });
    }

    const history = await getEnrollmentHistoryByEmail(email, 1);
    const template = active ?? history[0];
    if (!template) {
      return res.status(400).json({
        success: false,
        error: "Complete your TESDA profile before applying to a course.",
      });
    }

    if (active && !canStartNewApplication({
      status: active.status,
      tesdaNcSentAt: active.tesdaNcSentAt,
      isActive: active.isActive,
    })) {
      return res.status(409).json({
        success: false,
        error: "Your current training cycle must be completed and TESDA NC marked as sent before a new application.",
      });
    }

    if (active) {
      await deactivateEnrollment(active.id);
    }

    const nextCycle = (history[0]?.cycleNumber ?? 0) + 1;
    const [created] = await db
      .insert(enrollments)
      .values({
        refNo: generateRefNo(),
        userId: template.userId,
        firstName: template.firstName,
        middleName: template.middleName,
        lastName: template.lastName,
        extensionName: template.extensionName,
        traineeName: template.traineeName,
        dob: template.dob,
        birthPlace: template.birthPlace,
        age: template.age,
        gender: template.gender,
        civilStatus: template.civilStatus,
        nationality: template.nationality,
        email,
        contact: template.contact,
        telephone: template.telephone,
        address: template.address,
        barangay: template.barangay,
        district: template.district,
        city: template.city,
        province: template.province,
        region: template.region,
        zipCode: template.zipCode,
        education: template.education,
        school: template.school,
        yearGraduated: template.yearGraduated,
        course: body.courseSlug,
        schedule: body.preferredSchedule ?? template.schedule,
        enrollType: body.enrollmentType ?? template.enrollType,
        scholarship: template.scholarship,
        employment: template.employment,
        employmentType: template.employmentType,
        companyName: template.companyName,
        notes: template.notes,
        consent: template.consent,
        status: "Pending",
        isActive: true,
        cycleNumber: nextCycle,
        previousEnrollmentId: template.id,
        uli: template.uli,
        voucherNo: template.voucherNo,
        psaNo: template.psaNo,
        learnerClassification: template.learnerClassification,
        clientType: template.clientType,
        qualificationType: template.qualificationType,
        motherMaidenName: template.motherMaidenName,
        fatherName: template.fatherName,
        isIP: coerceIsIp(template.isIP),
        indigenousGroup: template.indigenousGroup,
        motherTongue: template.motherTongue,
      })
      .returning();

    if (!created) {
      return res.status(500).json({ success: false, error: "Could not create application" });
    }

    const assignResult = await assignBatchIfApplicable(
      created.id,
      body.courseSlug,
      "pending",
      "auto_assign",
    );

    const [fresh] = await db
      .select()
      .from(enrollments)
      .where(eq(enrollments.id, created.id))
      .limit(1);

    return res.status(201).json({
      success: true,
      data: fresh,
      batchAssignment: assignResult,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ success: false, error: "Validation Error", details: error.errors });
    }
    logger.error({ err: error }, "POST /api/trainees/apply failed");
    return res.status(500).json({ success: false, error: "Internal Server Error" });
  }
});

const updateSchema = z.object({
  firstName: z.string().min(1).optional(),
  middleName: z.string().optional(),
  lastName: z.string().min(1).optional(),
  extensionName: z.string().optional(),
  traineeName: z.string().optional(),
  dob: z.string().min(1).optional(),
  birthPlace: z.string().optional(),
  age: z.coerce.string().optional(),
  gender: z.string().min(1).optional(),
  civilStatus: z.string().min(1).optional(),
  nationality: z.string().optional(),
  traineeEmail: z.string().email().optional(),
  contactNumber: z.string().min(1).optional(),
  telephone: z.string().optional(),
  mobileNumber: z.string().optional(),
  homeAddress: z.string().min(1).optional(),
  barangay: z.string().optional(),
  district: z.string().optional(),
  city: z.string().min(1).optional(),
  province: z.string().min(1).optional(),
  region: z.string().optional(),
  zipCode: z.string().optional(),
  education: z.string().min(1).optional(),
  schoolLastAttended: z.string().optional(),
  yearGraduated: z.string().optional(),
  employmentStatus: z.string().optional(),
  employmentType: z.string().optional(),
  companyName: z.string().optional(),
  workExperience: z.array(z.any()).optional(),
  otherTrainings: z.array(z.any()).optional(),
  licensureExams: z.array(z.any()).optional(),
  competencyAssessments: z.array(z.any()).optional(),
  courseSlug: z.string().min(1).optional(),
  preferredSchedule: z.string().min(1).optional(),
  enrollmentType: z.string().min(1).optional(),
  scholarshipApplication: z.string().optional(),
  consent: z.boolean().optional(),
  status: z.preprocess((val) => {
    if (typeof val === 'string') {
      const s = val.toLowerCase();
      if (s === 'ready_to_apply') return 'Ready to Apply';
      return s.charAt(0).toUpperCase() + s.slice(1);
    }
    return val;
  }, z.enum(["Pending", "Confirmed", "Rejected", "Waitlisted", "Review", "Interview", "Enrolled", "Cancelled", "Completed", "Ready to Apply"])).optional()
}).partial();

router.put("/profile", async (req, res) => {
  const email = req.query.email as string;
  if (!email) {
    return res.status(400).json({ success: false, error: "Email is required" });
  }
  if (!assertEmailAccess(req, email)) {
    return res.status(403).json({ success: false, error: "Forbidden" });
  }

  const normalizedEmail = email.trim().toLowerCase();

  try {
    await ensureBatchSchemaReady();
    const parsedData = updateSchema.parse(req.body) as any;

    if (
      parsedData.status &&
      req.authUser?.role === "trainee" &&
      !["Cancelled", "Ready to Apply", "Pending"].includes(parsedData.status)
    ) {
      return res.status(403).json({
        success: false,
        error: "Trainees cannot set this enrollment status",
      });
    }

    const notesExtra = supplementalEnrollmentNotes(parsedData);

    const updatePayload = {
      firstName: parsedData.firstName,
      middleName: parsedData.middleName,
      lastName: parsedData.lastName,
      extensionName: parsedData.extensionName,
      traineeName: parsedData.traineeName || (parsedData.lastName && parsedData.firstName ? `${parsedData.lastName}, ${parsedData.firstName} ${parsedData.middleName || ""}`.trim() : undefined),
      dob: parsedData.dob,
      birthPlace: parsedData.birthPlace,
      age: parsedData.age,
      gender: parsedData.gender,
      civilStatus: parsedData.civilStatus,
      nationality: parsedData.nationality,
      email: parsedData.traineeEmail,
      contact: parsedData.contactNumber,
      telephone: parsedData.telephone,
      address: parsedData.homeAddress,
      barangay: parsedData.barangay,
      district: parsedData.district,
      city: parsedData.city,
      province: parsedData.province,
      region: parsedData.region,
      zipCode: parsedData.zipCode,
      education: parsedData.education,
      school: parsedData.schoolLastAttended,
      yearGraduated: parsedData.yearGraduated,
      course: parsedData.courseSlug,
      schedule: parsedData.preferredSchedule,
      enrollType: parsedData.enrollmentType,
      scholarship: parsedData.scholarshipApplication,
      employment: parsedData.employmentStatus,
      employmentType: parsedData.employmentType,
      companyName: parsedData.companyName,
      ...(notesExtra !== undefined ? { notes: notesExtra } : {}),
      uli: parsedData.uli,
      voucherNo: parsedData.voucherNo,
      psaNo: parsedData.psaNo,
      learnerClassification: parsedData.learnerClassification,
      clientType: parsedData.clientType,
      qualificationType: parsedData.qualificationType,
      motherMaidenName: parsedData.motherMaidenName,
      fatherName: parsedData.fatherName,
      isIP: coerceIsIp(parsedData.isIP),
      indigenousGroup: parsedData.indigenousGroup,
      motherTongue: parsedData.motherTongue,
      consent: parsedData.consent,
      status: parsedData.status,
    };

    const filteredPayload = Object.fromEntries(
      Object.entries(updatePayload).filter(([, value]) => value !== undefined)
    );
    
    // #region agent log
    logger.info({ email, status: filteredPayload.status }, "Attempting profile update");
    // #endregion

    const active = await getActiveEnrollmentByEmail(normalizedEmail);
    const targetId = active?.id;
    if (!targetId) {
      const [latest] = await db
        .select()
        .from(enrollments)
        .where(eq(enrollments.email, normalizedEmail))
        .orderBy(desc(enrollments.updatedAt))
        .limit(1);
      if (!latest) {
        return res.status(404).json({ success: false, error: "Profile not found" });
      }
      const [updated] = await db
        .update(enrollments)
        .set(filteredPayload)
        .where(eq(enrollments.id, latest.id))
        .returning();
      return res.json({ success: true, data: updated });
    }

    const [updated] = await db
      .update(enrollments)
      .set(filteredPayload)
      .where(eq(enrollments.id, targetId))
      .returning();

    if (!updated) {
      return res.status(404).json({ success: false, error: "Profile not found" });
    }

    return res.json({ success: true, data: updated });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ success: false, error: "Validation Error", details: error.errors });
    }
    console.error("Error updating trainee profile:", error);
    return res.status(500).json({ success: false, error: "Internal Server Error" });
  }
});

export default router;
