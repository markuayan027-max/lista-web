import { Switch, Route, Router as WouterRouter, Redirect } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import type { ComponentType, ReactNode } from "react";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useAuth } from "@/context/auth-context";
import NotFound from "@/pages/not-found";

import PublicLayout from "@/layouts/public-layout";
import TraineeLayout from "@/layouts/trainee-layout";
import StaffLayout from "@/layouts/staff-layout";
import AdminLayout from "@/layouts/admin-layout";

import HomePage from "@/pages/public/home";
import AboutPage from "@/pages/public/about";
import CoursesPage from "@/pages/public/courses";
import CourseDetailPage from "@/pages/public/course-detail";
import AssessmentPage from "@/pages/public/assessment";
import ScholarshipsPage from "@/pages/public/scholarships";
import EnrollPage from "@/pages/public/enroll";
import LoginPage from "@/pages/public/login";
import ForgotPasswordPage from "@/pages/public/forgot-password";

import TraineeDashboardPage from "@/pages/trainee/dashboard";
import TraineeApplicationPage from "@/pages/trainee/application";
import TraineeSchedulePage from "@/pages/trainee/schedule";
import TraineeCertificatePage from "@/pages/trainee/certificate";
import TraineeAnnouncementsPage from "@/pages/trainee/announcements";
import TraineeHelpPage from "@/pages/trainee/help";

import StaffOverviewPage from "@/pages/staff/overview";
import StaffEnrollmentsPage from "@/pages/staff/enrollments";
import StaffSearchPage from "@/pages/staff/search";
import StaffSchedulePage from "@/pages/staff/schedule";
import StaffAnnouncementsPage from "@/pages/staff/announcements";

import AdminAnalyticsPage from "@/pages/admin/analytics";
import AdminEnrollmentsPage from "@/pages/admin/enrollments";
import AdminUsersPage from "@/pages/admin/users";
import AdminAnnouncementsPage from "@/pages/admin/announcements";
import AdminSchedulePage from "@/pages/admin/schedule";
import AdminCertificatesPage from "@/pages/admin/certificates";
import AdminExportPage from "@/pages/admin/export";
import AdminSettingsPage from "@/pages/admin/settings";

const queryClient = new QueryClient();

type LayoutComponent = ComponentType<{ children: ReactNode }>;

function Protected({
  layout: Layout,
  children,
  allowedRole,
}: {
  layout: LayoutComponent;
  children: ReactNode;
  allowedRole: "trainee" | "staff" | "admin";
}) {
  const { user } = useAuth();

  if (!user) {
    return <Redirect to="/login" />;
  }

  if (user.role !== allowedRole) {
    return <Redirect to="/login" />;
  }

  return <Layout>{children}</Layout>;
}

function Router() {
  return (
    <Switch>
      {/* Public Routes */}
      <Route path="/"><PublicLayout><HomePage /></PublicLayout></Route>
      <Route path="/about"><PublicLayout><AboutPage /></PublicLayout></Route>
      <Route path="/courses"><PublicLayout><CoursesPage /></PublicLayout></Route>
      <Route path="/courses/:slug"><PublicLayout><CourseDetailPage /></PublicLayout></Route>
      <Route path="/assessment"><PublicLayout><AssessmentPage /></PublicLayout></Route>
      <Route path="/scholarships"><PublicLayout><ScholarshipsPage /></PublicLayout></Route>
      <Route path="/enroll"><PublicLayout><EnrollPage /></PublicLayout></Route>
      <Route path="/login"><PublicLayout><LoginPage /></PublicLayout></Route>
      <Route path="/forgot-password"><PublicLayout><ForgotPasswordPage /></PublicLayout></Route>

      {/* Trainee Routes */}
      <Route path="/trainee"><Protected layout={TraineeLayout} allowedRole="trainee"><TraineeDashboardPage /></Protected></Route>
      <Route path="/trainee/application"><Protected layout={TraineeLayout} allowedRole="trainee"><TraineeApplicationPage /></Protected></Route>
      <Route path="/trainee/schedule"><Protected layout={TraineeLayout} allowedRole="trainee"><TraineeSchedulePage /></Protected></Route>
      <Route path="/trainee/certificate"><Protected layout={TraineeLayout} allowedRole="trainee"><TraineeCertificatePage /></Protected></Route>
      <Route path="/trainee/announcements"><Protected layout={TraineeLayout} allowedRole="trainee"><TraineeAnnouncementsPage /></Protected></Route>
      <Route path="/trainee/help"><Protected layout={TraineeLayout} allowedRole="trainee"><TraineeHelpPage /></Protected></Route>

      {/* Staff Routes */}
      <Route path="/staff"><Protected layout={StaffLayout} allowedRole="staff"><StaffOverviewPage /></Protected></Route>
      <Route path="/staff/enrollments"><Protected layout={StaffLayout} allowedRole="staff"><StaffEnrollmentsPage /></Protected></Route>
      <Route path="/staff/search"><Protected layout={StaffLayout} allowedRole="staff"><StaffSearchPage /></Protected></Route>
      <Route path="/staff/schedule"><Protected layout={StaffLayout} allowedRole="staff"><StaffSchedulePage /></Protected></Route>
      <Route path="/staff/announcements"><Protected layout={StaffLayout} allowedRole="staff"><StaffAnnouncementsPage /></Protected></Route>

      {/* Admin Routes */}
      <Route path="/admin"><Protected layout={AdminLayout} allowedRole="admin"><AdminAnalyticsPage /></Protected></Route>
      <Route path="/admin/enrollments"><Protected layout={AdminLayout} allowedRole="admin"><AdminEnrollmentsPage /></Protected></Route>
      <Route path="/admin/users"><Protected layout={AdminLayout} allowedRole="admin"><AdminUsersPage /></Protected></Route>
      <Route path="/admin/announcements"><Protected layout={AdminLayout} allowedRole="admin"><AdminAnnouncementsPage /></Protected></Route>
      <Route path="/admin/schedule"><Protected layout={AdminLayout} allowedRole="admin"><AdminSchedulePage /></Protected></Route>
      <Route path="/admin/certificates"><Protected layout={AdminLayout} allowedRole="admin"><AdminCertificatesPage /></Protected></Route>
      <Route path="/admin/export"><Protected layout={AdminLayout} allowedRole="admin"><AdminExportPage /></Protected></Route>
      <Route path="/admin/settings"><Protected layout={AdminLayout} allowedRole="admin"><AdminSettingsPage /></Protected></Route>

      {/* Not Found */}
      <Route><PublicLayout><NotFound /></PublicLayout></Route>
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
          <Router />
        </WouterRouter>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
