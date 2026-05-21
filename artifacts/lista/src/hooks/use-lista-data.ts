import { useMemo } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/context/auth-context";
import { deriveCertificatesFromEnrollments } from "@/lib/lista-insforge-data";
import { fetchTraineeEnrollmentByEmail } from "@/lib/trainee-enrollment-insforge";
import {
  bulkUpdateEnrollmentStatus,
  createCourseBatch,
  createAnnouncement,
  createSchedule,
  deleteAnnouncement,
  deleteSchedule,
  fetchAllEnrollments,
  fetchAnnouncements,
  fetchCourseBatches,
  fetchCourses,
  fetchFaqs,
  fetchSchedules,
  fetchTestimonials,
  fetchUsers,
  inviteStaffUser,
  joinEnrollmentBatch,
  markEnrollmentTesdaNcSent,
  transferEnrollmentBatch,
  updateCourseBatchStatus,
  updateAnnouncement,
  updateEnrollmentStatus,
  updateSchedule,
  updateUserRole,
  updateUserStatus,
} from "@/lib/lista-insforge-data";
import { quickApplyTraineeCourse } from "@/lib/trainee-enrollment-insforge";
import { insforgeEnrollmentRowToEnrollment } from "@/lib/lista-insforge-data";
import type { DbSchedule, ListaAnnouncement } from "@/lib/lista-insforge-data";
import type { Enrollment, UserRole } from "@/lib/institutional-data";

export const listaKeys = {
  users: ["lista", "users"] as const,
  enrollments: ["lista", "enrollments"] as const,
  courses: ["lista", "courses"] as const,
  announcements: ["lista", "announcements"] as const,
  schedules: ["lista", "schedules"] as const,
  courseBatches: ["lista", "course-batches"] as const,
  testimonials: ["lista", "testimonials"] as const,
  faqs: ["lista", "faqs"] as const,
  traineeProfile: (email: string) => ["lista", "trainee-profile", email] as const,
};

function unwrap<T>(result: { success: boolean; data?: T; error?: string }): T {
  if (!result.success) throw new Error(result.error || "Request failed");
  return result.data as T;
}

export function useUsers() {
  const { user, loading } = useAuth();
  const canListUsers = user?.role === "staff" || user?.role === "admin";
  return useQuery({
    queryKey: listaKeys.users,
    queryFn: async () => unwrap(await fetchUsers()),
    staleTime: 60_000,
    enabled: !loading && canListUsers,
  });
}

/** Shared trainee profile query — dedupes dashboard, schedule, tracking, application, etc. */
export type TraineeProfileQuery = {
  enrollment: Enrollment | null;
  activeEnrollment: Enrollment | null;
  history: Enrollment[];
  canQuickApply: boolean;
};

export function useTraineeProfileBundle(email: string | undefined) {
  const { user, loading } = useAuth();
  const normalized = email?.trim().toLowerCase() ?? "";
  const isSelf = Boolean(
    normalized && user?.email && user.email.trim().toLowerCase() === normalized,
  );
  return useQuery({
    queryKey: listaKeys.traineeProfile(normalized),
    queryFn: async (): Promise<TraineeProfileQuery> => {
      const res = await fetchTraineeEnrollmentByEmail(normalized);
      if (!res.success) {
        const msg = res.error ?? "";
        if (msg && !msg.toLowerCase().includes("not found")) {
          throw new Error(msg);
        }
        return { enrollment: null, activeEnrollment: null, history: [], canQuickApply: false };
      }
      const toEnrollment = (row: Record<string, unknown> | undefined | null) =>
        row ? (insforgeEnrollmentRowToEnrollment(row) as Enrollment) : null;
      const enrollment = toEnrollment(res.data ?? null);
      const activeEnrollment = toEnrollment(res.activeEnrollment ?? res.data ?? null);
      const history = (res.history ?? []).map((row) => insforgeEnrollmentRowToEnrollment(row) as Enrollment);
      return {
        enrollment: activeEnrollment ?? enrollment,
        activeEnrollment,
        history: history.length > 0 ? history : enrollment ? [enrollment] : [],
        canQuickApply: Boolean(res.canQuickApply),
      };
    },
    enabled: !loading && isSelf,
    staleTime: 60_000,
    retry: 1,
  });
}

/** Active enrollment row for pages that expect a single profile record. */
export function useTraineeProfile(email: string | undefined) {
  const bundle = useTraineeProfileBundle(email);
  return {
    ...bundle,
    data: bundle.data?.activeEnrollment ?? bundle.data?.enrollment ?? null,
  };
}

export function useQuickApplyTrainee() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ email, courseSlug }: { email: string; courseSlug: string }) => {
      const res = await quickApplyTraineeCourse(email, courseSlug);
      if (!res.success) throw new Error(res.error || "Apply failed");
      return res.data;
    },
    onSuccess: (_data, vars) => {
      void qc.invalidateQueries({ queryKey: listaKeys.traineeProfile(vars.email.trim().toLowerCase()) });
      void qc.invalidateQueries({ queryKey: listaKeys.enrollments });
    },
  });
}

export function useMarkTesdaNcSent() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, note }: { id: string; note?: string }) =>
      unwrap(await markEnrollmentTesdaNcSent(id, note)),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: listaKeys.enrollments });
    },
  });
}

export function useJoinEnrollmentBatch() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ enrollmentId, batchId }: { enrollmentId: string; batchId: string }) =>
      unwrap(await joinEnrollmentBatch(enrollmentId, batchId)),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: listaKeys.enrollments });
    },
  });
}

export function useTransferEnrollmentBatch() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ enrollmentId, batchId }: { enrollmentId: string; batchId: string }) =>
      unwrap(await transferEnrollmentBatch(enrollmentId, batchId)),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: listaKeys.enrollments });
    },
  });
}

export function useInviteStaffUser() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: { name: string; email: string; role: "staff" | "admin" }) =>
      unwrap(await inviteStaffUser(input)),
    onSuccess: () => qc.invalidateQueries({ queryKey: listaKeys.users }),
  });
}

/** @deprecated Use useInviteStaffUser — SDK-only insert removed in Phase B */
export const useInviteUser = useInviteStaffUser;

export function useUpdateUserStatus() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      userId,
      status,
    }: {
      userId: string;
      status: "active" | "deactivated";
    }) => unwrap(await updateUserStatus(userId, status)),
    onSuccess: () => qc.invalidateQueries({ queryKey: listaKeys.users }),
  });
}

export function useUpdateUserRole() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ userId, role }: { userId: string; role: UserRole }) =>
      unwrap(await updateUserRole(userId, role)),
    onSuccess: () => qc.invalidateQueries({ queryKey: listaKeys.users }),
  });
}

export function useEnrollments(options?: { live?: boolean }) {
  const { user, loading } = useAuth();
  const staffOrAdmin =
    options?.live === true || user?.role === "staff" || user?.role === "admin";

  return useQuery({
    queryKey: listaKeys.enrollments,
    queryFn: async () => unwrap(await fetchAllEnrollments()),
    staleTime: staffOrAdmin ? 0 : 30_000,
    refetchOnWindowFocus: staffOrAdmin,
    refetchOnReconnect: staffOrAdmin,
    refetchInterval: staffOrAdmin ? 10_000 : false,
    enabled: !loading,
  });
}

export function useUpdateEnrollmentStatus() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, status }: { id: string; status: Enrollment["status"] }) =>
      unwrap(await updateEnrollmentStatus(id, status)),
    onSuccess: () => qc.invalidateQueries({ queryKey: listaKeys.enrollments }),
  });
}

export function useBulkUpdateEnrollmentStatus() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ ids, status }: { ids: string[]; status: Enrollment["status"] }) =>
      unwrap(await bulkUpdateEnrollmentStatus(ids, status)),
    onSuccess: () => qc.invalidateQueries({ queryKey: listaKeys.enrollments }),
  });
}

export function useCourses() {
  return useQuery({
    queryKey: listaKeys.courses,
    queryFn: async () => unwrap(await fetchCourses()),
    staleTime: 5 * 60_000,
    gcTime: 30 * 60_000,
    refetchOnWindowFocus: true,
    refetchOnReconnect: true,
    retry: 2,
    retryDelay: (attempt) => Math.min(1000 * 2 ** attempt, 8_000),
  });
}

export function useAnnouncements() {
  return useQuery({
    queryKey: listaKeys.announcements,
    queryFn: async () => unwrap(await fetchAnnouncements()),
    staleTime: 60_000,
  });
}

export function useSchedules() {
  return useQuery({
    queryKey: listaKeys.schedules,
    queryFn: async () => unwrap(await fetchSchedules()),
    staleTime: 60_000,
  });
}

export function useCourseBatches(courseSlug?: string) {
  return useQuery({
    queryKey: [...listaKeys.courseBatches, courseSlug ?? "all"],
    queryFn: async () => unwrap(await fetchCourseBatches(courseSlug)),
    staleTime: 30_000,
  });
}

export function useTestimonials() {
  return useQuery({
    queryKey: listaKeys.testimonials,
    queryFn: async () => unwrap(await fetchTestimonials()),
    staleTime: 5 * 60_000,
  });
}

export function useFaqs() {
  return useQuery({
    queryKey: listaKeys.faqs,
    queryFn: async () => unwrap(await fetchFaqs()),
    staleTime: 5 * 60_000,
  });
}

export function useDerivedCertificates() {
  const { data: enrollments = [], isLoading: enrollmentsLoading } = useEnrollments();
  const { data: courses = [], isLoading: coursesLoading } = useCourses();
  const certificates = useMemo(
    () => deriveCertificatesFromEnrollments(enrollments, courses),
    [enrollments, courses],
  );
  return { data: certificates, isLoading: enrollmentsLoading || coursesLoading };
}

/** Trainee-safe certificates — scopes to the signed-in user's enrollment via API, not all rows. */
export function useTraineeDerivedCertificates(email: string | undefined) {
  const { data: courses = [], isLoading: coursesLoading } = useCourses();
  const bundleQuery = useTraineeProfileBundle(email);
  const enrollments = useMemo(
    () => bundleQuery.data?.history ?? ([] as Enrollment[]),
    [bundleQuery.data?.history],
  );
  const certificates = useMemo(
    () => deriveCertificatesFromEnrollments(enrollments, courses),
    [enrollments, courses],
  );
  return {
    data: certificates,
    isLoading: bundleQuery.isLoading || coursesLoading,
  };
}

export function useCreateAnnouncement() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: { title: string; body: string; targetRole: string }) =>
      unwrap(await createAnnouncement(input)),
    onSuccess: () => qc.invalidateQueries({ queryKey: listaKeys.announcements }),
  });
}

export function useUpdateAnnouncement() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      id,
      ...input
    }: { id: string; title: string; body: string; targetRole: string }) =>
      unwrap(await updateAnnouncement(id, input)),
    onSuccess: () => qc.invalidateQueries({ queryKey: listaKeys.announcements }),
  });
}

export function useDeleteAnnouncement() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => unwrap(await deleteAnnouncement(id)),
    onSuccess: () => qc.invalidateQueries({ queryKey: listaKeys.announcements }),
  });
}

export function useCreateSchedule() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: Omit<DbSchedule, "id">) => unwrap(await createSchedule(input)),
    onSuccess: () => qc.invalidateQueries({ queryKey: listaKeys.schedules }),
  });
}

export function useCreateCourseBatch() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: {
      courseSlug: string;
      batchCode: string;
      batchName: string;
      capacity: number;
      startDate: string;
      endDate: string;
    }) => unwrap(await createCourseBatch(input)),
    onSuccess: () => qc.invalidateQueries({ queryKey: listaKeys.courseBatches }),
  });
}

export function useUpdateCourseBatchStatus() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: { id: string; status: "open" | "closed" | "archived" }) =>
      unwrap(await updateCourseBatchStatus(input.id, input.status)),
    onSuccess: () => qc.invalidateQueries({ queryKey: listaKeys.courseBatches }),
  });
}

export function useUpdateSchedule() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...input }: { id: string } & Partial<Omit<DbSchedule, "id">>) =>
      unwrap(await updateSchedule(id, input)),
    onSuccess: () => qc.invalidateQueries({ queryKey: listaKeys.schedules }),
  });
}

export function useDeleteSchedule() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => unwrap(await deleteSchedule(id)),
    onSuccess: () => qc.invalidateQueries({ queryKey: listaKeys.schedules }),
  });
}

export type { ListaAnnouncement, DbSchedule };
