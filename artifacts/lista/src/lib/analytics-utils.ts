import {
  format,
  subMonths,
  startOfMonth,
  parseISO,
  isValid,
  startOfWeek,
  endOfWeek,
  subWeeks,
} from "date-fns";
import type { Enrollment, User, UserRole } from "@/lib/institutional-data";
import type { ListaAnnouncement } from "@/lib/lista-insforge-data";

const MONTH_LABELS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

export function isFormalEnrollment(e: Enrollment): boolean {
  return e.status !== "ready_to_apply";
}

export function parseEnrollmentDate(iso?: string): Date | null {
  if (!iso) return null;
  const d = parseISO(iso);
  return isValid(d) ? d : null;
}

/** Last N calendar months of enrollment counts from InsForge createdAt. */
export function buildMonthlyEnrollmentSeries(
  enrollments: Enrollment[],
  monthCount = 12,
): { name: string; enrollments: number }[] {
  const now = new Date();
  const buckets: { key: string; name: string; enrollments: number }[] = [];

  for (let i = monthCount - 1; i >= 0; i--) {
    const monthStart = startOfMonth(subMonths(now, i));
    const key = format(monthStart, "yyyy-MM");
    buckets.push({
      key,
      name: MONTH_LABELS[monthStart.getMonth()],
      enrollments: 0,
    });
  }

  const keyToIndex = new Map(buckets.map((b, i) => [b.key, i]));

  for (const e of enrollments) {
    if (!isFormalEnrollment(e)) continue;
    const d = parseEnrollmentDate(e.createdAt);
    if (!d) continue;
    const key = format(startOfMonth(d), "yyyy-MM");
    const idx = keyToIndex.get(key);
    if (idx !== undefined) buckets[idx].enrollments += 1;
  }

  return buckets.map(({ name, enrollments: count }) => ({ name, enrollments: count }));
}

/** Period-over-period % change; undefined if prior is 0 and current is 0. */
export function computePeriodTrend(
  current: number,
  previous: number,
): { value: number; isPositive: boolean } | undefined {
  if (current === 0 && previous === 0) return undefined;
  if (previous === 0) {
    return { value: 100, isPositive: current > 0 };
  }
  const pct = Math.round(((current - previous) / previous) * 1000) / 10;
  if (pct === 0) return undefined;
  return { value: Math.abs(pct), isPositive: pct > 0 };
}

export function countInLastDays(enrollments: Enrollment[], days: number, now = new Date()): number {
  const cutoff = new Date(now);
  cutoff.setDate(cutoff.getDate() - days);
  return enrollments.filter((e) => {
    if (!isFormalEnrollment(e)) return false;
    const d = parseEnrollmentDate(e.createdAt);
    return d !== null && d >= cutoff;
  }).length;
}

export function announcementsForRole(
  announcements: ListaAnnouncement[],
  role: "admin" | "staff" | "trainee",
): ListaAnnouncement[] {
  return announcements.filter((a) => a.targetRole === "all" || a.targetRole === role);
}

export function announcementCountForRole(
  announcements: ListaAnnouncement[],
  role: "admin" | "staff" | "trainee",
): number {
  return announcementsForRole(announcements, role).length;
}

/** Sessions whose date falls in the ISO week (Mon–Sun), 0 = current week. */
export function countSchedulesInWeek(
  schedules: { date: string }[],
  weekOffset: number,
  now = new Date(),
): number {
  const weekStart = startOfWeek(subWeeks(now, weekOffset), { weekStartsOn: 1 });
  const weekEnd = endOfWeek(subWeeks(now, weekOffset), { weekStartsOn: 1 });
  return schedules.filter((s) => {
    const d = parseISO(s.date);
    return isValid(d) && d >= weekStart && d <= weekEnd;
  }).length;
}

export function countUsersWithRoleInWindow(
  users: User[],
  role: UserRole,
  daysAgoEnd: number,
  daysAgoStart: number,
  now = new Date(),
): number {
  const windowEnd = new Date(now);
  windowEnd.setDate(windowEnd.getDate() - daysAgoEnd);
  const windowStart = new Date(now);
  windowStart.setDate(windowStart.getDate() - daysAgoStart);
  return users.filter((u) => {
    if (u.role !== role) return false;
    if (!u.createdAt) return false;
    const d = parseISO(u.createdAt);
    return isValid(d) && d >= windowStart && d < windowEnd;
  }).length;
}
