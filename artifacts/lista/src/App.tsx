import { Switch, Route, Router as WouterRouter, Redirect, useLocation } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Suspense, type ComponentType, type ReactNode, useEffect } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as SonnerToaster } from "sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useAuth } from "@/context/auth-context";
import NotFound from "@/pages/not-found";

import PublicLayout from "@/layouts/public-layout";
import AuthLayout from "@/layouts/auth-layout";
import TraineeLayout from "@/layouts/trainee-layout";
import StaffLayout from "@/layouts/staff-layout";
import AdminLayout from "@/layouts/admin-layout";

import * as Pages from "@/route-pages";

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
    if (import.meta.env.DEV && localStorage.getItem("TEST_MODE") === "true") return;
    const returnTo = encodeURIComponent(
      `${window.location.pathname}${window.location.search}`,
    );
    setLocation(`/login?redirect=${returnTo}`);
  }, [user, loading, setLocation]);

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-background" data-testid="auth-loading">
        <div className="w-full max-w-sm px-6 space-y-4" aria-busy="true" aria-label="Loading session">
          <div className="h-10 w-10 rounded-xl skeleton-shimmer mx-auto" />
          <div className="h-3 w-32 skeleton-shimmer mx-auto rounded-md" />
          <div className="h-2 w-48 skeleton-shimmer mx-auto rounded-md" />
        </div>
      </div>
    );
  }

  if (!user) {
    if (import.meta.env.DEV && localStorage.getItem("TEST_MODE") === "true") {
      return <Layout>{children}</Layout>;
    }
    return null;
  }

  if (user.role !== allowedRole) {
    if (import.meta.env.DEV && localStorage.getItem("TEST_MODE") === "true") {
      return <Layout>{children}</Layout>;
    }
    
    // Redirect based on their actual role instead of showing a dead-end
    if (user.role === "admin") {
      return <Redirect to="/admin" />;
    } else if (user.role === "staff") {
      return <Redirect to="/staff" />;
    } else {
      return <Redirect to="/trainee" />;
    }
  }

  return <Layout>{children}</Layout>;
}

function RouteFallback() {
  return (
    <div
      className="flex min-h-[50vh] items-center justify-center bg-background"
      aria-busy="true"
      aria-label="Loading page"
    >
      <div className="h-10 w-10 rounded-xl skeleton-shimmer" />
    </div>
  );
}

function Router() {
  return (
    <Suspense fallback={<RouteFallback />}>
    <Switch>
      {/* Public Routes */}
      <Route path="/"><PublicLayout><Pages.HomePage /></PublicLayout></Route>
      <Route path="/about"><PublicLayout><Pages.AboutPage /></PublicLayout></Route>
      <Route path="/admissions"><PublicLayout><Pages.AdmissionsPage /></PublicLayout></Route>
      <Route path="/contact"><PublicLayout><Pages.ContactPage /></PublicLayout></Route>
      <Route path="/courses"><PublicLayout><Pages.CoursesPage /></PublicLayout></Route>
      <Route path="/courses/:slug"><PublicLayout><Pages.CourseDetailPage /></PublicLayout></Route>
      <Route path="/assessment"><PublicLayout><Pages.AssessmentPage /></PublicLayout></Route>
      <Route path="/scholarships"><PublicLayout><Pages.ScholarshipsPage /></PublicLayout></Route>
      {/* 2026-05-13: consolidate enrollment entrypoint to trainee registration */}
      <Route path="/enroll">
        <Redirect to="/login?redirect=%2Ftrainee%2Fregister" />
      </Route>
      <Route path="/login"><AuthLayout><Pages.LoginPage /></AuthLayout></Route>
      <Route path="/news/:id"><PublicLayout><Pages.NewsDetailPage /></PublicLayout></Route>
      <Route path="/signup"><AuthLayout><Pages.SignupPage /></AuthLayout></Route>
      <Route path="/forgot-password"><AuthLayout><Pages.ForgotPasswordPage /></AuthLayout></Route>
      <Route path="/activate-account"><AuthLayout><Pages.ForgotPasswordPage /></AuthLayout></Route>
      <Route path="/auth/callback"><AuthLayout><Pages.AuthCallbackPage /></AuthLayout></Route>
      <Route path="/privacy"><PublicLayout><Pages.PrivacyPage /></PublicLayout></Route>
      <Route path="/terms"><PublicLayout><Pages.TermsPage /></PublicLayout></Route>

      {/* Trainee Routes */}
      <Route path="/trainee/register"><Protected layout={({children}) => <>{children}</>} allowedRole="trainee"><Pages.TraineeRegistrationPage /></Protected></Route>
      <Route path="/trainee/enroll"><Protected layout={({children}) => <>{children}</>} allowedRole="trainee"><Pages.TraineeEnrollPage /></Protected></Route>
      <Route path="/trainee"><Protected layout={TraineeLayout} allowedRole="trainee"><Pages.TraineeDashboardPage /></Protected></Route>
      <Route path="/trainee/preferences">
        <Protected layout={TraineeLayout} allowedRole="trainee">
          <Redirect to="/trainee/profile" />
        </Protected>
      </Route>
      <Route path="/trainee/profile"><Protected layout={TraineeLayout} allowedRole="trainee"><Pages.TraineeProfilePage /></Protected></Route>
      <Route path="/trainee/application"><Protected layout={TraineeLayout} allowedRole="trainee"><Pages.TraineeApplicationPage /></Protected></Route>
      <Route path="/trainee/tracking"><Protected layout={TraineeLayout} allowedRole="trainee"><Pages.TraineeTrackingPage /></Protected></Route>
      <Route path="/trainee/schedule"><Protected layout={TraineeLayout} allowedRole="trainee"><Pages.TraineeSchedulePage /></Protected></Route>
      <Route path="/trainee/certificate"><Protected layout={TraineeLayout} allowedRole="trainee"><Pages.TraineeCertificatePage /></Protected></Route>
      <Route path="/trainee/announcements"><Protected layout={TraineeLayout} allowedRole="trainee"><Pages.TraineeAnnouncementsPage /></Protected></Route>
      <Route path="/trainee/help"><Protected layout={TraineeLayout} allowedRole="trainee"><Pages.TraineeHelpPage /></Protected></Route>

      {/* Staff Routes */}
      <Route path="/staff"><Protected layout={StaffLayout} allowedRole="staff"><Pages.StaffOverviewPage /></Protected></Route>
      <Route path="/staff/enrollments"><Protected layout={StaffLayout} allowedRole="staff"><Pages.StaffEnrollmentsPage /></Protected></Route>
      <Route path="/staff/search"><Protected layout={StaffLayout} allowedRole="staff"><Pages.StaffSearchPage /></Protected></Route>
      <Route path="/staff/schedule"><Protected layout={StaffLayout} allowedRole="staff"><Pages.StaffSchedulePage /></Protected></Route>
      <Route path="/staff/announcements"><Protected layout={StaffLayout} allowedRole="staff"><Pages.StaffAnnouncementsPage /></Protected></Route>

      {/* Admin Routes */}
      <Route path="/admin"><Protected layout={AdminLayout} allowedRole="admin"><Pages.AdminAnalyticsPage /></Protected></Route>
      <Route path="/admin/enrollments"><Protected layout={AdminLayout} allowedRole="admin"><Pages.AdminEnrollmentsPage /></Protected></Route>
      <Route path="/admin/users"><Protected layout={AdminLayout} allowedRole="admin"><Pages.AdminUsersPage /></Protected></Route>
      <Route path="/admin/announcements"><Protected layout={AdminLayout} allowedRole="admin"><Pages.AdminAnnouncementsPage /></Protected></Route>
      <Route path="/admin/schedule"><Protected layout={AdminLayout} allowedRole="admin"><Pages.AdminSchedulePage /></Protected></Route>
      <Route path="/admin/certificates"><Protected layout={AdminLayout} allowedRole="admin"><Pages.AdminCertificatesPage /></Protected></Route>
      <Route path="/admin/export"><Protected layout={AdminLayout} allowedRole="admin"><Pages.AdminExportPage /></Protected></Route>
      <Route path="/admin/settings"><Protected layout={AdminLayout} allowedRole="admin"><Pages.AdminSettingsPage /></Protected></Route>

      {/* Not Found */}
      <Route><PublicLayout><NotFound /></PublicLayout></Route>
    </Switch>
    </Suspense>
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
        <SonnerToaster position="top-center" richColors closeButton theme="light" />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
