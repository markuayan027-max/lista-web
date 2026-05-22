import { lazy, type ComponentType } from "react";

/** Route-level code splitting — keeps initial JS off admin/staff/trainee/heavy public pages. */
const page = <T extends ComponentType<unknown>>(
  factory: () => Promise<{ default: T }>,
) => lazy(factory);

export const HomePage = page(() => import("@/pages/public/home"));
export const AboutPage = page(() => import("@/pages/public/about"));
export const CoursesPage = page(() => import("@/pages/public/courses"));
export const CourseDetailPage = page(() => import("@/pages/public/course-detail"));
export const AssessmentPage = page(() => import("@/pages/public/assessment"));
export const ScholarshipsPage = page(() => import("@/pages/public/scholarships"));
export const LoginPage = page(() => import("@/pages/public/login"));
export const SignupPage = page(() => import("@/pages/public/signup"));
export const ForgotPasswordPage = page(() => import("@/pages/public/forgot-password"));
export const AuthCallbackPage = page(() => import("@/pages/public/auth-callback"));
export const AdmissionsPage = page(() => import("@/pages/public/admissions"));
export const ContactPage = page(() => import("@/pages/public/contact"));
export const NewsDetailPage = page(() => import("@/pages/public/news-detail"));
export const PrivacyPage = page(() => import("@/pages/public/privacy"));
export const TermsPage = page(() => import("@/pages/public/terms"));

export const TraineeDashboardPage = page(() => import("@/pages/trainee/dashboard"));
export const TraineeProfilePage = page(() => import("@/pages/trainee/profile"));
export const TraineeRegistrationPage = page(() => import("@/pages/trainee/registration"));
export const TraineeEnrollPage = page(() => import("@/pages/trainee/enroll"));
export const TraineeApplicationPage = page(() => import("@/pages/trainee/application"));
export const TraineeTrackingPage = page(() => import("@/pages/trainee/tracking"));
export const TraineeSchedulePage = page(() => import("@/pages/trainee/schedule"));
export const TraineeCertificatePage = page(() => import("@/pages/trainee/certificate"));
export const TraineeAnnouncementsPage = page(() => import("@/pages/trainee/announcements"));
export const TraineeHelpPage = page(() => import("@/pages/trainee/help"));

export const StaffOverviewPage = page(() => import("@/pages/staff/overview"));
export const StaffEnrollmentsPage = page(() => import("@/pages/staff/enrollments"));
export const StaffSearchPage = page(() => import("@/pages/staff/search"));
export const StaffSchedulePage = page(() => import("@/pages/staff/schedule"));
export const StaffAnnouncementsPage = page(() => import("@/pages/staff/announcements"));

export const AdminAnalyticsPage = page(() => import("@/pages/admin/analytics"));
export const AdminEnrollmentsPage = page(() => import("@/pages/admin/enrollments"));
export const AdminUsersPage = page(() => import("@/pages/admin/users"));
export const AdminAnnouncementsPage = page(() => import("@/pages/admin/announcements"));
export const AdminSchedulePage = page(() => import("@/pages/admin/schedule"));
export const AdminCertificatesPage = page(() => import("@/pages/admin/certificates"));
export const AdminExportPage = page(() => import("@/pages/admin/export"));
export const AdminSettingsPage = page(() => import("@/pages/admin/settings"));
