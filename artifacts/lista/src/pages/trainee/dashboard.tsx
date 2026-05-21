import { useState } from "react";
import { useAuth } from "@/context/auth-context";
import { Link } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { 
  BookOpen, 
  FileText, 
  CalendarDays, 
  Award, 
  ChevronRight,
  Clock,
  MapPin,
  User as UserIcon,
  HelpCircle,
  AlertCircle,
  Download
} from "lucide-react";
import StatCard from "@/components/stat-card";
import StatusBadge from "@/components/status-badge";
import AnnouncementCard from "@/components/announcement-card";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import {
  useAnnouncements,
  useCourses,
  useTraineeDerivedCertificates,
  useSchedules,
  useTraineeProfile,
  useTraineeProfileBundle,
  listaKeys,
} from "@/hooks/use-lista-data";
import QuickApplyModal from "@/components/trainee/quick-apply-modal";
import { useQueryClient } from "@tanstack/react-query";
import { courseTitleBySlug } from "@/lib/lista-insforge-data";
import type { Enrollment } from "@/lib/institutional-data";
import { format } from "date-fns";
import {
  calculateProfileCompletion,
  isTraineeApplicationFormComplete,
  loadLocalProfile,
  mergeTraineeProfileSources,
} from "@/lib/profile-utils";
import PrintModal from "@/components/print-modal";
import {
  updateTraineeEnrollmentByEmail,
  hasSubmittedCourseApplication,
  canCancelCourseApplication,
} from "@/lib/trainee-enrollment-insforge";
import { useToast } from "@/hooks/use-toast";

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.1 }
  }
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { type: "spring" as const, stiffness: 300, damping: 24 } }
};

export default function TraineeDashboardPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { data: courses = [] } = useCourses();
  const { data: schedules = [] } = useSchedules();
  const { data: announcements = [] } = useAnnouncements();
  const { data: certificates = [] } = useTraineeDerivedCertificates(user?.email);
  const { data: profileRow } = useTraineeProfile(user?.email);
  const { data: profileBundle } = useTraineeProfileBundle(user?.email);
  const [printTarget, setPrintTarget] = useState<any>(null);
  const [isCancelling, setIsCancelling] = useState(false);
  const [quickApplyOpen, setQuickApplyOpen] = useState(false);

  const userEnrollment = (profileRow as Enrollment | null) ?? null;

  // Real profile completion check
  const draft = loadLocalProfile(user?.id);
  
  const activeApplication = hasSubmittedCourseApplication(userEnrollment);

  const handleCancelApplication = async () => {
    if (!user?.email) return;
    if (confirm("Are you sure you want to cancel your application? This action cannot be undone.")) {
      setIsCancelling(true);
      try {
        const res = await updateTraineeEnrollmentByEmail(user.email, { status: "cancelled" });
      if (res.success) {
        toast({ title: "Application Cancelled", description: "Your application has been successfully cancelled." });
        if (user.email) {
          void queryClient.invalidateQueries({
            queryKey: listaKeys.traineeProfile(user.email.trim().toLowerCase()),
          });
        }
      } else {
        console.error("Cancellation failed:", res.error);
        toast({ 
          title: "Cancellation Failed", 
          description: res.error || "The system could not process the cancellation. Please contact support.", 
          variant: "destructive" 
        });
      }
      } catch (err) {
        toast({ title: "Error", description: "An unexpected error occurred.", variant: "destructive" });
      } finally {
        setIsCancelling(false);
      }
    }
  };
  
  // Use draft for percentage if it's more complete than real enrollment
  const draftPercentage = calculateProfileCompletion(draft);
  const enrollmentPercentage = calculateProfileCompletion(userEnrollment);
  const completionPercentage = Math.max(draftPercentage, enrollmentPercentage);
  
  const profileIncomplete = completionPercentage < 100;
  const displayPercentage = completionPercentage;
  const mergedProfile = mergeTraineeProfileSources(userEnrollment, user?.id);
  const applicationFormComplete = isTraineeApplicationFormComplete(mergedProfile);

  const myCourseSlug = activeApplication ? userEnrollment?.courseSlug : undefined;
  const myCourseTitle = myCourseSlug ? courseTitleBySlug(courses, myCourseSlug) : null;
  const mySchedules = myCourseSlug ? schedules.filter((s) => s.courseSlug === myCourseSlug).slice(0, 3) : [];
  const recentAnnouncements = announcements
    .filter(a => a.targetRole === "all" || a.targetRole === "trainee");


  return (
    <div className="space-y-8">
      <QuickApplyModal
        open={quickApplyOpen}
        onOpenChange={setQuickApplyOpen}
        profile={profileRow}
      />
      {/* Print modal */}
      <AnimatePresence>
        {printTarget && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <PrintModal
              enrollment={printTarget}
              onClose={() => setPrintTarget(null)}
            />
          </motion.div>
        )}
      </AnimatePresence>

      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col md:flex-row md:items-end justify-between gap-4"
      >
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight break-words">Welcome back, {user?.name?.split(' ')[0]}</h1>
          <p className="text-muted-foreground mt-1">Here's what's happening with your learning journey.</p>
        </div>
      </motion.div>

      {!activeApplication && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-primary-indigo/10 border-l-4 border-l-primary-indigo border-y border-r border-primary-indigo/20 p-5 flex flex-col md:flex-row items-center justify-between gap-6 shadow-sm group"
        >
          <div className="flex items-center gap-5 text-center md:text-left">
            <div className="relative shrink-0">
              <div className="w-12 h-12 bg-card rounded-full flex items-center justify-center text-primary-indigo shadow-sm border border-primary-indigo/20">
                <BookOpen className="w-6 h-6 stroke-[2.5px]" />
              </div>
            </div>
            <div className="space-y-0.5">
              <h3 className="font-bold text-foreground text-sm uppercase tracking-wider">Course Application Required</h3>
              <p className="text-[13px] text-primary-indigo font-medium leading-relaxed max-w-xl">
                You haven't submitted an official course application yet. Please browse available courses and submit your application.
              </p>
            </div>
          </div>
          <Link href="/trainee/application" className="w-full md:w-auto bg-primary-indigo hover:bg-primary-indigo/90 text-primary-foreground px-6 py-2.5 rounded-lg text-[11px] font-black uppercase tracking-widest transition-all shadow-md active:scale-[0.98] text-center">
            View Courses
          </Link>
        </motion.div>
      )}

      {profileIncomplete && (
        <motion.div 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-card border-l-4 border-l-amber-500 border-y border-r border-border p-5 flex flex-col md:flex-row items-center justify-between gap-6 shadow-sm group"
        >
          <div className="flex items-center gap-5 text-center md:text-left">
            <div className="relative shrink-0">
              <div className="w-12 h-12 bg-amber-50 rounded-full flex items-center justify-center text-amber-600">
                <AlertCircle className="w-6 h-6 stroke-[2.5px]" />
              </div>
              <div className="absolute -top-1 -right-1 bg-amber-500 text-primary-foreground text-[9px] font-black px-1.5 py-0.5 rounded-full border-2 border-card">
                {displayPercentage}%
              </div>
            </div>
            <div className="space-y-0.5">
              <h3 className="font-bold text-foreground text-sm uppercase tracking-wider">{displayPercentage}% Profile Action Required</h3>
              <p className="text-[13px] text-muted-foreground font-medium leading-relaxed max-w-xl">
                Some TESDA-required fields are still missing. Complete them now to enable <span className="text-foreground font-bold">Instant Admission Slips</span> for your next enrollment.
              </p>
            </div>
          </div>
          <Link href="/trainee/profile" className="w-full md:w-auto bg-primary hover:bg-primary/90 text-primary-foreground px-6 py-2.5 rounded-lg text-[11px] font-black uppercase tracking-widest transition-all shadow-md active:scale-[0.98]">
            Complete Profile
          </Link>
        </motion.div>
      )}

      <motion.div 
        variants={container}
        initial="hidden"
        animate="show"
        className="grid grid-cols-1 md:grid-cols-2 gap-4"
      >
        <motion.div variants={item}>
          <StatCard
            label="Enrolled Course"
            value={myCourseTitle || "None"}
            icon={BookOpen}
            className="h-full"
          />
        </motion.div>
        <motion.div variants={item}>
          <StatCard
            label="Application Status"
            value={
              activeApplication && userEnrollment?.status ? (
                <StatusBadge status={userEnrollment.status} />
              ) : userEnrollment?.status === "ready_to_apply" ? (
                "Ready to Apply"
              ) : (
                "Not Applied"
              )
            }
            icon={FileText}
            className="h-full"
          />
        </motion.div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <motion.div 
          variants={container}
          initial="hidden"
          animate="show"
          className="lg:col-span-2 flex flex-col gap-8"
        >
          {/* Application Status Card */}
          <motion.div variants={item}>
            <Card className="border-card-border shadow-sm">
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-lg">Application Timeline</CardTitle>
                    <CardDescription>
                      {activeApplication && userEnrollment?.refNo
                        ? `Ref: ${userEnrollment.refNo}`
                        : "No active application"}
                    </CardDescription>
                  </div>
                  {activeApplication ? (
                    <div className="flex gap-2">
                      {canCancelCourseApplication(userEnrollment) && (
                        <Button 
                          variant="destructive" 
                          size="sm" 
                          onClick={handleCancelApplication} 
                          disabled={isCancelling}
                          className="hidden sm:flex bg-destructive/10 text-destructive hover:bg-destructive/20 hover:text-destructive border-none"
                        >
                          {isCancelling ? "Cancelling..." : "Cancel Application"}
                        </Button>
                      )}
                      <Button variant="outline" size="sm" onClick={() => setPrintTarget(userEnrollment)} className="hidden sm:flex">
                        <Download className="w-4 h-4 mr-2" /> Download Form
                      </Button>
                      <Button variant="outline" size="sm" asChild>
                        <Link href="/trainee/application">View Details</Link>
                      </Button>
                    </div>
                  ) : (
                    <Button size="sm" asChild>
                      <Link href="/trainee/application">Apply Now</Link>
                    </Button>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                {(() => {
                    const statusLower = userEnrollment?.status?.toLowerCase() || '';

                    if (!activeApplication) {
                      if (statusLower === "ready_to_apply" || profileBundle?.canQuickApply) {
                        return (
                          <div className="w-full flex flex-col items-center gap-4 py-4 bg-primary-indigo/10 rounded-xl border border-primary-indigo/20">
                            <div className="text-primary-indigo font-bold text-sm">
                              {profileBundle?.canQuickApply
                                ? "You may start a new course application."
                                : "Profile complete — you are ready to apply."}
                            </div>
                            <div className="flex flex-wrap gap-2 justify-center">
                              {profileBundle?.canQuickApply ? (
                                <Button
                                  size="sm"
                                  className="bg-primary-indigo hover:bg-primary-indigo/90 text-primary-foreground"
                                  onClick={() => setQuickApplyOpen(true)}
                                >
                                  Quick apply
                                </Button>
                              ) : null}
                              <Button size="sm" variant="outline" asChild>
                                <Link href="/trainee/application">Browse courses</Link>
                              </Button>
                            </div>
                          </div>
                        );
                      }
                      return (
                        <div className="w-full text-center text-muted-foreground text-sm py-6">
                          Browse courses and submit an application to track progress here.
                        </div>
                      );
                    }

                    if (statusLower === 'completed') {
                      return <div className="w-full text-center text-emerald-700 font-semibold py-2 bg-emerald-500/10 rounded-lg">Course Completed</div>;
                    }
                    if (statusLower === 'cancelled') {
                      return <div className="w-full text-center text-destructive font-semibold py-2 bg-destructive/10 rounded-lg">Application Cancelled</div>;
                    }
                    if (statusLower === 'rejected') {
                      return <div className="w-full text-center text-destructive font-semibold py-2 bg-destructive/10 rounded-lg">Application Rejected</div>;
                    }

                    const steps = ['Submitted', 'Review', 'Interview', 'Enrolled'];
                    
                    let currentStepIndex = 0; // Default to 0 for no active app
                    if (statusLower === 'pending' || statusLower === 'submitted') currentStepIndex = 1;
                    else if (statusLower === 'review') currentStepIndex = 2;
                    else if (statusLower === 'interview') currentStepIndex = 3;
                    else if (statusLower === 'approved' || statusLower === 'enrolled') currentStepIndex = 4;
                    
                    const progressWidth = currentStepIndex === 0 ? "0%" : `${((currentStepIndex - 1) / (steps.length - 1)) * 100}%`;

                    return (
                      <div className="flex items-center justify-between relative">
                        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-1 bg-muted rounded-full" />
                        <div className="absolute left-0 top-1/2 -translate-y-1/2 h-1 bg-primary rounded-full transition-all duration-500" style={{ width: progressWidth }} />
                        {steps.map((step, i) => {
                          const isCompleted = i < currentStepIndex;
                          const isCurrent = i === currentStepIndex - 1 || (currentStepIndex === 0 && i === 0);
                          
                          return (
                            <div key={step} className="relative flex flex-col items-center gap-2 bg-card px-2 z-10">
                              <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 transition-colors ${
                                isCompleted ? 'bg-primary border-primary text-primary-foreground' : 
                                isCurrent && currentStepIndex > 0 ? 'bg-background border-primary text-primary' : 
                                'bg-background border-muted text-muted-foreground'
                              }`}>
                                {i + 1}
                              </div>
                              <span className="text-xs font-semibold">{step}</span>
                            </div>
                          );
                        })}
                      </div>
                    );
                  })()}
              </CardContent>
            </Card>
          </motion.div>

          {/* Upcoming Sessions */}
          <motion.div variants={item} className="flex-1 flex flex-col">
            <Card className="border-card-border shadow-sm flex-1 flex flex-col">
              <CardHeader className="flex flex-row items-center justify-between pb-2 shrink-0">
                <CardTitle className="text-lg">Upcoming Sessions</CardTitle>
                <Button variant="ghost" size="sm" asChild>
                  <Link href="/trainee/schedule">Full Schedule <ChevronRight className="ml-1 h-4 w-4" /></Link>
                </Button>
              </CardHeader>
              <CardContent className="flex-1 flex flex-col">
                <div className="space-y-4 flex-1 flex flex-col justify-center">
                  {mySchedules.length > 0 ? mySchedules.map((schedule, i) => (
                    <div key={i} className="flex gap-4 p-4 rounded-xl bg-muted/30 border border-card-border">
                      <div className="flex flex-col items-center justify-center w-16 h-16 rounded-lg bg-primary/5 text-primary shrink-0">
                        <span className="text-sm font-bold uppercase">{format(new Date(schedule.date), "MMM")}</span>
                        <span className="text-xl font-bold leading-none">{format(new Date(schedule.date), "dd")}</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-semibold text-base truncate">{schedule.courseSlug.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}</h4>
                        <div className="mt-1 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground">
                          <span className="flex items-center"><Clock className="mr-1 h-3.5 w-3.5" /> {schedule.startTime} - {schedule.endTime}</span>
                          <span className="flex items-center"><MapPin className="mr-1 h-3.5 w-3.5" /> {schedule.room}</span>
                          <span className="flex items-center"><UserIcon className="mr-1 h-3.5 w-3.5" /> {schedule.trainer}</span>
                        </div>
                      </div>
                    </div>
                  )) : (
                    <p className="text-sm text-muted-foreground py-4 text-center">No upcoming sessions.</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </motion.div>

        <motion.div 
          variants={container}
          initial="hidden"
          animate="show"
          className="space-y-8"
        >
          {/* Quick Actions */}
          <motion.div variants={item}>
            <Card className="border-card-border shadow-sm">
              <CardHeader className="pb-4">
                <CardTitle className="text-lg">Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button variant="outline" className="w-full justify-start h-12" asChild>
                  <Link href="/trainee/schedule"><CalendarDays className="mr-2 h-4 w-4" /> View Schedule</Link>
                </Button>
                <Button variant="outline" className="w-full justify-start h-12" asChild>
                  <Link href="/trainee/certificate"><Award className="mr-2 h-4 w-4" /> Browse Certificates</Link>
                </Button>
                <Button variant="outline" className="w-full justify-start h-12" asChild>
                  <Link href="/trainee/help"><HelpCircle className="mr-2 h-4 w-4" /> Get Help</Link>
                </Button>
              </CardContent>
            </Card>
          </motion.div>

          {/* Recent Announcements */}
          <motion.div variants={item}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold tracking-tight">Recent Announcements</h3>
              <Button variant="ghost" size="sm" asChild className="h-8">
                <Link href="/trainee/announcements">View All</Link>
              </Button>
            </div>
            <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2 no-scrollbar">
              {recentAnnouncements.map(announcement => (
                <AnnouncementCard key={announcement.id} announcement={announcement} />
              ))}
            </div>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}
