import { useState, useMemo } from "react";
import { useAuth } from "@/context/auth-context";
import { motion } from "framer-motion";
import {
  ClipboardList,
  FileText,
  AlertCircle,
  Download,
  Clock,
  BookOpen,
  RefreshCw,
  ArrowRight,
  UserCircle,
  WifiOff,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { useCourses, useTraineeProfile, listaKeys } from "@/hooks/use-lista-data";
import { useQueryClient } from "@tanstack/react-query";
import { courseTitleBySlug } from "@/lib/lista-insforge-data";
import type { Enrollment } from "@/lib/institutional-data";
import {
  updateTraineeEnrollmentByEmail,
  hasSubmittedCourseApplication,
  canCancelCourseApplication,
} from "@/lib/trainee-enrollment-insforge";
import { useToast } from "@/hooks/use-toast";
import PrintModal from "@/components/print-modal";
import { cn } from "@/lib/utils";
import { TrackingSkeleton } from "@/components/skeletons";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.1 },
  },
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { type: "spring" as const, stiffness: 300, damping: 24 } },
};

const TIMELINE_STEPS = [
  { id: "submitted", label: "Application Submitted", sub: "We have received your application." },
  { id: "review", label: "Under Review", sub: "We are reviewing your profile and documents." },
  { id: "interview", label: "Interview / Assessment", sub: "Pending technical assessment." },
  { id: "enrolled", label: "Enrolled", sub: "Admission completed successfully." },
] as const;

const STATUS_LABELS: Record<string, string> = {
  pending: "Pending Review",
  review: "Under Review",
  interview: "Interview / Assessment",
  enrolled: "Enrolled",
  confirmed: "Confirmed",
  completed: "Completed",
  cancelled: "Cancelled",
  rejected: "Rejected",
  waitlisted: "Waitlisted",
  ready_to_apply: "Profile Only",
};

const STATUS_GUIDANCE: Record<string, string> = {
  pending: "Your application is in the queue. Staff will review it soon — check back here for updates.",
  review: "Our team is verifying your documents. You may be contacted if anything is missing.",
  interview: "Prepare for your assessment. Watch your email and SMS for schedule details.",
  enrolled: "Congratulations — you are enrolled. Visit Schedule for class details.",
  confirmed: "Your slot is confirmed. Download your official form for your records.",
  completed: "This program is marked complete. Certificates may be available under Certificates.",
  waitlisted: "You are on the waitlist. We will notify you when a slot opens.",
  cancelled: "This application was cancelled. You can apply again for another course.",
  rejected: "This application was not approved. You may apply for a different course.",
};

const PRINTABLE_STATUSES = new Set([
  "pending",
  "review",
  "interview",
  "enrolled",
  "confirmed",
  "completed",
  "waitlisted",
]);

function formatStatusLabel(status: string | undefined): string {
  const key = (status ?? "pending").toLowerCase();
  return STATUS_LABELS[key] ?? key.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

function formatSubmittedDate(iso: string | undefined): string {
  if (!iso) return "Date not recorded";
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "Date not recorded";
  return date.toLocaleDateString(undefined, {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

function displayField(value: string | null | undefined, fallback = "Not specified"): string {
  const trimmed = value?.trim();
  return trimmed ? trimmed : fallback;
}

function timelineStepIndex(statusLower: string): number {
  if (["pending", "submitted"].includes(statusLower)) return 1;
  if (statusLower === "review" || statusLower === "waitlisted") return 2;
  if (statusLower === "interview") return 3;
  if (["enrolled", "confirmed", "completed"].includes(statusLower)) return 4;
  return 0;
}

type TrackingView =
  | "loading"
  | "error"
  | "no-auth"
  | "profile-only"
  | "no-application"
  | "active";

export default function TraineeTrackingPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { data: courses = [] } = useCourses();
  const profileQuery = useTraineeProfile(user?.email);
  const userEnrollment = (profileQuery.data as Enrollment | null) ?? null;
  const loadState = profileQuery.isLoading ? "loading" : "idle";
  const fetchError =
    profileQuery.isError && !profileQuery.error?.message?.toLowerCase().includes("not found")
      ? profileQuery.error?.message ?? "We couldn't reach the server. Check your connection and try again."
      : null;
  const [isCancelling, setIsCancelling] = useState(false);
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
  const [printTarget, setPrintTarget] = useState<Enrollment | null>(null);

  const loadEnrollment = () => {
    if (user?.email) {
      void queryClient.invalidateQueries({
        queryKey: listaKeys.traineeProfile(user.email.trim().toLowerCase()),
      });
    }
  };

  const enrollment =
    userEnrollment && hasSubmittedCourseApplication(userEnrollment) ? userEnrollment : null;

  const profileOnly = Boolean(userEnrollment && !enrollment);

  const view: TrackingView = useMemo(() => {
    if (loadState === "loading") return "loading";
    if (!user?.email) return "no-auth";
    if (fetchError && !userEnrollment) return "error";
    if (profileOnly) return "profile-only";
    if (!enrollment) return "no-application";
    return "active";
  }, [loadState, user?.email, fetchError, userEnrollment, profileOnly, enrollment]);

  const courseTitle = enrollment
    ? courseTitleBySlug(courses, enrollment.courseSlug) || displayField(enrollment.courseSlug, "Course")
    : "";

  const statusLower = (enrollment?.status ?? "pending").toLowerCase();
  const statusGuidance =
    STATUS_GUIDANCE[statusLower] ??
    "Your application status will update here as staff process your enrollment.";

  const handleConfirmCancel = async () => {
    if (!user?.email || !enrollment) return;
    setIsCancelling(true);
    try {
      const res = await updateTraineeEnrollmentByEmail(user.email, { status: "cancelled" });
      if (res.success) {
        toast({
          title: "Application cancelled",
          description: "You can submit a new course application anytime.",
        });
        setCancelDialogOpen(false);
        await loadEnrollment();
      } else {
        toast({
          title: "Cancellation failed",
          description: res.error ?? "The system could not process the cancellation.",
          variant: "destructive",
        });
      }
    } catch {
      toast({
        title: "Something went wrong",
        description: "Please try again in a moment.",
        variant: "destructive",
      });
    } finally {
      setIsCancelling(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-8 max-w-6xl mx-auto pb-20"
    >
      {printTarget && (
        <PrintModal enrollment={printTarget} onClose={() => setPrintTarget(null)} />
      )}

      <AlertDialog open={cancelDialogOpen} onOpenChange={setCancelDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Cancel this application?</AlertDialogTitle>
            <AlertDialogDescription>
              This cannot be undone. You will need to apply again if you change your mind.
              {courseTitle ? ` Course: ${courseTitle}.` : ""}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isCancelling}>Keep application</AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => {
                e.preventDefault();
                void handleConfirmCancel();
              }}
              disabled={isCancelling}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isCancelling ? "Cancelling…" : "Yes, cancel application"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <header className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-12 h-12 bg-primary/10 text-primary rounded-2xl flex items-center justify-center shadow-sm"
            aria-hidden
          >
            <ClipboardList className="w-6 h-6" />
          </motion.div>
          <motion.div initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }}>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-foreground">My Applications</h1>
            <p className="text-muted-foreground font-medium">
              Track submitted course applications and download your official TESDA form.
            </p>
          </motion.div>
        </div>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => void loadEnrollment()}
          disabled={loadState === "loading"}
          className="rounded-xl shrink-0 self-start"
          aria-label="Refresh application status"
        >
          <RefreshCw className={cn("w-4 h-4 mr-2", loadState === "loading" && "animate-spin")} />
          Refresh
        </Button>
      </header>

      {view === "loading" && <TrackingSkeleton />}

      {view === "error" && (
        <EmptyStatePanel
          icon={WifiOff}
          title="Couldn't load your application"
          description={fetchError ?? "Something went wrong. Please try again."}
          action={
            <Button onClick={() => void loadEnrollment()} className="rounded-xl">
              <RefreshCw className="w-4 h-4 mr-2" /> Try again
            </Button>
          }
        />
      )}

      {view === "no-auth" && (
        <EmptyStatePanel
          icon={UserCircle}
          title="Sign in to track applications"
          description="Log in with the email you used when registering so we can find your enrollment."
          action={
            <Button asChild className="rounded-xl">
              <Link href="/login">Go to sign in</Link>
            </Button>
          }
        />
      )}

      {view === "profile-only" && (
        <EmptyStatePanel
          icon={FileText}
          title="Complete your course application"
          description="Your trainee profile is saved, but you haven't submitted a course application yet. Pick a program to continue."
          action={
            <div className="flex flex-col sm:flex-row gap-3">
              <Button asChild className="rounded-xl">
                <Link href="/trainee/application">
                  Apply for a course <ArrowRight className="w-4 h-4 ml-2" />
                </Link>
              </Button>
              <Button asChild variant="outline" className="rounded-xl">
                <Link href="/trainee/profile">Review profile</Link>
              </Button>
            </div>
          }
        />
      )}

      {view === "no-application" && (
        <EmptyStatePanel
          icon={FileText}
          title="No course applications yet"
          description="When you submit an application for a TESDA program, it will appear here with live status updates."
          action={
            <Button asChild className="rounded-xl">
              <Link href="/trainee/application">
                Browse courses <ArrowRight className="w-4 h-4 ml-2" />
              </Link>
            </Button>
          }
        />
      )}

      {view === "active" && enrollment && (
        <motion.div variants={container} initial="hidden" animate="show" className="space-y-6">
          <motion.div variants={item}>
            <Card className="border border-border shadow-md rounded-3xl overflow-hidden bg-card">
              <motion.div
                variants={item}
                className="bg-muted/40 border-b border-border p-6 flex flex-col md:flex-row md:items-center justify-between gap-4"
              >
                <motion.div>
                  <div className="flex flex-wrap items-center gap-2 mb-2">
                    <span
                      className="px-3 py-1 bg-primary/10 text-primary text-xs font-bold rounded-full uppercase tracking-wider"
                      role="status"
                    >
                      {formatStatusLabel(enrollment.status)}
                    </span>
                    {enrollment.refNo && (
                      <span className="text-muted-foreground text-sm font-medium">
                        Ref: {enrollment.refNo}
                      </span>
                    )}
                  </div>
                  <h2 className="text-xl font-black text-foreground">{courseTitle}</h2>
                  <p className="text-sm text-muted-foreground font-medium mt-1">
                    Submitted {formatSubmittedDate(enrollment.createdAt)}
                  </p>
                </motion.div>
                <div className="flex flex-wrap items-center gap-3">
                  {canCancelCourseApplication(enrollment) && (
                    <Button
                      variant="destructive"
                      onClick={() => setCancelDialogOpen(true)}
                      disabled={isCancelling}
                      className="rounded-xl shadow-sm text-xs font-bold uppercase tracking-wider"
                    >
                      Cancel application
                    </Button>
                  )}
                  {PRINTABLE_STATUSES.has(statusLower) && (
                    <Button
                      variant="outline"
                      onClick={() => setPrintTarget(enrollment)}
                      className="rounded-xl shadow-sm border-border text-foreground text-xs font-bold uppercase tracking-wider"
                    >
                      <Download className="w-4 h-4 mr-2" aria-hidden />
                      Official form
                    </Button>
                  )}
                </div>
              </motion.div>

              <CardContent className="p-6 space-y-8">
                <div
                  className="rounded-2xl border border-border bg-muted/30 p-4"
                  role="note"
                  aria-label="Status guidance"
                >
                  <p className="text-sm text-foreground font-medium leading-relaxed">{statusGuidance}</p>
                </div>

                <div>
                  <h3 className="text-sm font-bold text-foreground mb-6 uppercase tracking-wider">
                    Processing timeline
                  </h3>
                  <div className="relative">
                    <motion.div
                      className="absolute left-[15px] md:left-1/2 md:-translate-x-1/2 top-4 bottom-4 w-1 bg-border rounded-full"
                      aria-hidden
                    />

                    {["cancelled", "rejected"].includes(statusLower) ? (
                      <TerminalStatusBlock status={statusLower} />
                    ) : (
                      TIMELINE_STEPS.map((step, idx) => {
                        const currentStepIndex = timelineStepIndex(statusLower);
                        const isCompleted = idx < currentStepIndex;
                        const isCurrent = idx === currentStepIndex - 1;

                        return (
                          <div
                            key={step.id}
                            className="relative flex items-center justify-start md:justify-center mb-8 last:mb-0"
                          >
                            <div className="hidden md:block w-1/2 pr-12 text-right" aria-hidden>
                              {isCompleted && (
                                <div>
                                  <h4
                                    className={cn(
                                      "text-sm font-bold",
                                      isCurrent ? "text-primary" : "text-foreground",
                                    )}
                                  >
                                    {step.label}
                                  </h4>
                                  <p className="text-xs text-muted-foreground mt-1">{step.sub}</p>
                                </div>
                              )}
                            </div>

                            <div
                              className={cn(
                                "absolute left-0 md:left-1/2 md:-translate-x-1/2 w-8 h-8 rounded-full flex items-center justify-center z-10 border-4 border-card shadow-sm transition-all duration-300 text-xs font-bold",
                                isCompleted
                                  ? isCurrent
                                    ? "bg-primary text-primary-foreground"
                                    : "bg-emerald-600 text-primary-foreground"
                                  : "bg-muted text-muted-foreground",
                              )}
                              aria-current={isCurrent ? "step" : undefined}
                            >
                              {idx + 1}
                            </div>

                            <div className="w-full pl-12 md:w-1/2 md:pl-12 text-left">
                              <div
                                className={cn(
                                  "transition-opacity",
                                  !isCompleted && !isCurrent && "opacity-50",
                                )}
                              >
                                <h4
                                  className={cn(
                                    "text-sm font-bold md:hidden",
                                    isCurrent ? "text-primary" : "text-foreground",
                                  )}
                                >
                                  {step.label}
                                </h4>
                                <p className="text-xs text-muted-foreground mt-1">{step.sub}</p>
                              </div>
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>

                <dl className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-6 border-t border-border">
                  <DetailItem
                    icon={BookOpen}
                    label="Enrollment type"
                    value={displayField(enrollment.enrollmentType)}
                  />
                  <DetailItem
                    icon={Clock}
                    label="Preferred schedule"
                    value={displayField(enrollment.preferredSchedule)}
                  />
                  <DetailItem
                    icon={FileText}
                    label="Scholarship"
                    value={
                      enrollment.scholarshipApplication?.toLowerCase().includes("yes")
                        ? "TWSP applicant"
                        : "Self-funded"
                    }
                  />
                </dl>
              </CardContent>
            </Card>
          </motion.div>
        </motion.div>
      )}
    </motion.div>
  );
}

function EmptyStatePanel({
  icon: Icon,
  title,
  description,
  action,
}: {
  icon: typeof FileText;
  title: string;
  description: string;
  action: React.ReactNode;
}) {
  return (
    <motion.section
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      className="flex flex-col items-center justify-center py-16 px-6 bg-muted/30 rounded-[2.5rem] border-2 border-dashed border-border text-center"
      aria-labelledby="tracking-empty-title"
    >
      <Icon className="h-12 w-12 text-muted-foreground/50 mb-4" aria-hidden />
      <h2 id="tracking-empty-title" className="text-lg font-black text-foreground mb-2">
        {title}
      </h2>
      <p className="text-muted-foreground font-medium mb-6 max-w-md">{description}</p>
      {action}
    </motion.section>
  );
}

function TerminalStatusBlock({ status }: { status: string }) {
  return (
    <motion.div className="relative flex flex-col items-center justify-center py-6 text-center z-10">
      <div className="w-16 h-16 bg-destructive/10 text-destructive rounded-full flex items-center justify-center mb-4 border-4 border-card shadow-md">
        <AlertCircle className="w-8 h-8" aria-hidden />
      </div>
      <h4 className="text-lg font-black text-destructive uppercase tracking-widest">
        {formatStatusLabel(status)}
      </h4>
      <p className="text-muted-foreground text-sm mt-2 max-w-md">
        {STATUS_GUIDANCE[status] ??
          "This application is closed. You may submit a new application for an available course."}
      </p>
      <Button asChild variant="outline" className="mt-6 rounded-xl">
        <Link href="/trainee/application">Apply for another course</Link>
      </Button>
    </motion.div>
  );
}

function DetailItem({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof BookOpen;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-start gap-3">
      <Icon className="w-5 h-5 text-muted-foreground mt-0.5 shrink-0" aria-hidden />
      <div>
        <dt className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
          {label}
        </dt>
        <dd className="text-sm font-medium text-foreground mt-0.5">{value}</dd>
      </div>
    </div>
  );
}
