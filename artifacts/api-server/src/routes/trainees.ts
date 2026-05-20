import { Router } from "express";
import { db } from "@workspace/db";
import { courseBatches, enrollments, users } from "@workspace/db/schema";
import { and, asc, eq, lt, sql as dsql } from "drizzle-orm";
import { z } from "zod";
import { logger } from "../lib/logger";
import { assertEmailAccess, requireAuth } from "../middleware/auth";
import { ensureBatchSchemaReady } from "./batches";

const router = Router();
router.use(requireAuth);

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
    isIP: data.isIP,
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

    async function assignBatchIfApplicable(enrollmentId: string, courseSlug: string | undefined, status: string) {
      const normalizedStatus = String(status || "").toLowerCase();
      const canAssign = Boolean(courseSlug) && normalizedStatus !== "ready to apply";
      if (!canAssign) return { assigned: false as const };

      // Find earliest open batch with available seats.
      const [batch] = await db
        .select()
        .from(courseBatches)
        .where(
          and(
            dsql`lower(${courseBatches.courseSlug}) = lower(${courseSlug})`,
            dsql`${courseBatches.status} = 'open'`,
            lt(courseBatches.seatsTaken, courseBatches.capacity),
          ),
        )
        .orderBy(asc(courseBatches.startDate), asc(courseBatches.createdAt))
        .limit(1);

      if (!batch) {
        await db
          .update(enrollments)
          .set({ status: "Waitlisted", batchId: null, batchCode: null, updatedAt: new Date() })
          .where(eq(enrollments.id, enrollmentId));
        return { assigned: false as const, waitlisted: true as const };
      }

      const newSeats = (batch.seatsTaken ?? 0) + 1;
      await db
        .update(courseBatches)
        .set({
          seatsTaken: newSeats,
          status: newSeats >= batch.capacity ? "closed" : "open",
          updatedAt: new Date(),
        })
        .where(eq(courseBatches.id, batch.id));

      await db
        .update(enrollments)
        .set({
          batchId: batch.id,
          batchCode: batch.batchCode,
          status: "Pending",
          updatedAt: new Date(),
        })
        .where(eq(enrollments.id, enrollmentId));

      return { assigned: true as const, batchId: batch.id, batchCode: batch.batchCode };
    }

    const [existing] = await db
      .select()
      .from(enrollments)
      .where(eq(enrollments.email, email))
      .limit(1);

    if (existing) {
      const { refNo: _keepRef, ...patch } = values;
      const [updated] = await db
        .update(enrollments)
        .set({ ...patch, updatedAt: new Date() })
        .where(eq(enrollments.id, existing.id))
        .returning();
      // Re-assign batch if a new course is being applied (and no batch yet).
      if (updated?.course) {
        await assignBatchIfApplicable(updated.id, String(updated.course ?? ""), String(updated.status ?? ""));
      }
      logger.info({ email }, "Enrollment updated via register (existing email)");
      return res.status(200).json({ success: true, data: updated, updated: true });
    }

    try {
      const [enrollment] = await db.insert(enrollments).values(valuesWithUser).returning();
      if (enrollment?.course) {
        await assignBatchIfApplicable(enrollment.id, String(enrollment.course ?? ""), String(enrollment.status ?? ""));
      }
      return res.status(201).json({ success: true, data: enrollment });
    } catch (insertError) {
      if (!isUniqueViolation(insertError)) {
        throw insertError;
      }
      const [updated] = await db
        .update(enrollments)
        .set({ ...valuesWithUser, updatedAt: new Date() })
        .where(eq(enrollments.email, email))
        .returning();
      if (!updated) {
        throw insertError;
      }
      if (updated?.course) {
        await assignBatchIfApplicable(updated.id, String(updated.course ?? ""), String(updated.status ?? ""));
      }
      logger.info({ email }, "Enrollment updated via register (unique conflict)");
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
    const [enrollment] = await db
      .select()
      .from(enrollments)
      .where(eq(enrollments.email, normalizedEmail))
      .limit(1);
    if (!enrollment) {
      return res.status(404).json({ success: false, error: "Profile not found" });
    }

    return res.json({ success: true, data: enrollment });
  } catch (error) {
    console.error("Error fetching trainee profile:", error);
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
      isIP: parsedData.isIP,
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

    const [updated] = await db
      .update(enrollments)
      .set(filteredPayload)
      .where(eq(enrollments.email, normalizedEmail))
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
