import { useMemo } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/context/auth-context";
import { deriveCertificatesFromEnrollments } from "@/lib/lista-insforge-data";
import { fetchTraineeEnrollmentByEmail } from "@/lib/trainee-enrollment-insforge";
import {
  bulkUpdateEnrollmentStatus,
  createAnnouncement,
  createSchedule,
  deleteAnnouncement,
  deleteSchedule,
  fetchAllEnrollments,
  fetchAnnouncements,
  fetchCourses,
  fetchFaqs,
  fetchSchedules,
  fetchTestimonials,
  fetchUsers,
  inviteUser,
  updateAnnouncement,
  updateEnrollmentStatus,
  updateSchedule,
  updateUserRole,
} from "@/lib/lista-insforge-data";
import type { DbSchedule, ListaAnnouncement } from "@/lib/lista-insforge-data";
import type { Enrollment, UserRole } from "@/lib/institutional-data";

export const listaKeys = {
  users: ["lista", "users"] as const,
  enrollments: ["lista", "enrollments"] as const,
  courses: ["lista", "courses"] as const,
  announcements: ["lista", "announcements"] as const,
  schedules: ["lista", "schedules"] as const,
  testimonials: ["lista", "testimonials"] as const,
  faqs: ["lista", "faqs"] as const,
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

export function useInviteUser() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: { name: string; email: string; role: UserRole }) =>
      unwrap(await inviteUser(input)),
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
  const selfEnrollmentQuery = useQuery({
    queryKey: [...listaKeys.enrollments, "self", email?.toLowerCase() ?? ""] as const,
    queryFn: async () => {
      if (!email) return [] as Enrollment[];
      const res = await fetchTraineeEnrollmentByEmail(email);
      if (!res.success || !res.data) return [];
      return [res.data as unknown as Enrollment];
    },
    enabled: Boolean(email),
    staleTime: 30_000,
  });
  const certificates = useMemo(
    () => deriveCertificatesFromEnrollments(selfEnrollmentQuery.data ?? [], courses),
    [selfEnrollmentQuery.data, courses],
  );
  return {
    data: certificates,
    isLoading: selfEnrollmentQuery.isLoading || coursesLoading,
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
