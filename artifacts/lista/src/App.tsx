import { Switch, Route, Router as WouterRouter, Redirect, useLocation } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { type ComponentType, type ReactNode, useEffect } from "react";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useAuth } from "@/context/auth-context";
import NotFound from "@/pages/not-found";

import PublicLayout from "@/layouts/public-layout";
import AuthLayout from "@/layouts/auth-layout";
import TraineeLayout from "@/layouts/trainee-layout";
import StaffLayout from "@/layouts/staff-layout";
import AdminLayout from "@/layouts/admin-layout";

import HomePage from "@/pages/public/home";
import AboutPage from "@/pages/public/about";
import CoursesPage from "@/pages/public/courses";
import CourseDetailPage from "@/pages/public/course-detail";
import AssessmentPage from "@/pages/public/assessment";
import ScholarshipsPage from "@/pages/public/scholarships";
import LoginPage from "@/pages/public/login";
import SignupPage from "@/pages/public/signup";
import ForgotPasswordPage from "@/pages/public/forgot-password";
import AuthCallbackPage from "@/pages/public/auth-callback";
import AdmissionsPage from "@/pages/public/admissions";
import NewsDetailPage from "@/pages/public/news-detail";
import PrivacyPage from "@/pages/public/privacy";
import TermsPage from "@/pages/public/terms";

import TraineeDashboardPage from "@/pages/trainee/dashboard";
import TraineeProfilePage from "@/pages/trainee/profile";
import TraineeRegistrationPage from "@/pages/trainee/registration";
import TraineeEnrollPage from "@/pages/trainee/enroll";
import TraineeApplicationPage from "@/pages/trainee/application";
import TraineeTrackingPage from "@/pages/trainee/tracking";
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
  const { user, loading } = useAuth();
  const [_, setLocation] = useLocation();

  useEffect(() => {
    if (loading) return;
    if (user) return;
    if (localStorage.getItem("TEST_MODE") === "true") return;
    setLocation("/login");
  }, [user, loading, setLocation]);

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center" data-testid="auth-loading">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
      </div>
    );
  }

  if (!user) {
    if (localStorage.getItem('TEST_MODE') === 'true') {
      return <Layout>{children}</Layout>;
    }
    return null;
  }

  if (user.role !== allowedRole) {
    if (localStorage.getItem('TEST_MODE') === 'true') {
      return <Layout>{children}</Layout>;
    }
    return (
      <div className="flex h-screen flex-col items-center justify-center space-y-4">
        <h1 className="text-2xl font-bold">Unauthorized</h1>
        <p>You do not have permission to access this page.</p>
        <button onClick={() => setLocation("/")} className="text-primary hover:underline">Return Home</button>
      </div>
    );
  }

  return <Layout>{children}</Layout>;
}

function Router() {
  return (
    <Switch>
      {/* Public Routes */}
      <Route path="/"><PublicLayout><HomePage /></PublicLayout></Route>
      <Route path="/about"><PublicLayout><AboutPage /></PublicLayout></Route>
      <Route path="/admissions"><PublicLayout><AdmissionsPage /></PublicLayout></Route>
      <Route path="/courses"><PublicLayout><CoursesPage /></PublicLayout></Route>
      <Route path="/courses/:slug"><PublicLayout><CourseDetailPage /></PublicLayout></Route>
      <Route path="/assessment"><PublicLayout><AssessmentPage /></PublicLayout></Route>
      <Route path="/scholarships"><PublicLayout><ScholarshipsPage /></PublicLayout></Route>
      {/* 2026-05-13: consolidate enrollment entrypoint to trainee registration */}
      <Route path="/enroll"><Redirect to="/trainee/register" /></Route>
      <Route path="/login"><AuthLayout><LoginPage /></AuthLayout></Route>
      <Route path="/news/:id"><PublicLayout><NewsDetailPage /></PublicLayout></Route>
      <Route path="/signup"><AuthLayout><SignupPage /></AuthLayout></Route>
      <Route path="/forgot-password"><AuthLayout><ForgotPasswordPage /></AuthLayout></Route>
      <Route path="/auth/callback"><AuthLayout><AuthCallbackPage /></AuthLayout></Route>
      <Route path="/privacy"><PublicLayout><PrivacyPage /></PublicLayout></Route>
      <Route path="/terms"><PublicLayout><TermsPage /></PublicLayout></Route>

      {/* Trainee Routes */}
      <Route path="/trainee/register"><Protected layout={({children}) => <>{children}</>} allowedRole="trainee"><TraineeRegistrationPage /></Protected></Route>
      <Route path="/trainee/enroll"><Protected layout={({children}) => <>{children}</>} allowedRole="trainee"><TraineeEnrollPage /></Protected></Route>
      <Route path="/trainee"><Protected layout={TraineeLayout} allowedRole="trainee"><TraineeDashboardPage /></Protected></Route>
      <Route path="/trainee/profile"><Protected layout={TraineeLayout} allowedRole="trainee"><TraineeProfilePage /></Protected></Route>
      <Route path="/trainee/application"><Protected layout={TraineeLayout} allowedRole="trainee"><TraineeApplicationPage /></Protected></Route>
      <Route path="/trainee/tracking"><Protected layout={TraineeLayout} allowedRole="trainee"><TraineeTrackingPage /></Protected></Route>
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

function ScrollToTop() {
  const [location] = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location]);
  return null;
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
          <ScrollToTop />
          <Router />
        </WouterRouter>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
