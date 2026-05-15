import { useState, useEffect } from "react";
import { useAuth } from "@/context/auth-context";
import { motion } from "framer-motion";
import { 
  ClipboardList, 
  FileText, 
  AlertCircle,
  Download,
  Calendar,
  MapPin,
  Clock,
  BookOpen
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { courses } from "@/lib/institutional-data";
import type { Enrollment } from "@/lib/institutional-data";
import { fetchTraineeEnrollmentByEmail, updateTraineeEnrollmentByEmail } from "@/lib/trainee-enrollment-insforge";
import { useToast } from "@/hooks/use-toast";
import PrintModal from "@/components/print-modal";
import { cn } from "@/lib/utils";

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

export default function TraineeTrackingPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [userEnrollment, setUserEnrollment] = useState<Enrollment | null>(null);
  const [isFetching, setIsFetching] = useState(true);
  const [isCancelling, setIsCancelling] = useState(false);
  const [printTarget, setPrintTarget] = useState<Enrollment | null>(null);

  const loadEnrollment = async () => {
    if (!user?.email) return;
    setIsFetching(true);
    const res = await fetchTraineeEnrollmentByEmail(user.email);
    if (res.success && res.data) {
      setUserEnrollment(res.data as unknown as Enrollment);
    }
    setIsFetching(false);
  };

  useEffect(() => {
    loadEnrollment();
  }, [user?.email]);

  const handleCancelApplication = async (enrollment: Enrollment) => {
    if (!user?.email) return;
    if (confirm("Are you sure you want to cancel your application? This action cannot be undone.")) {
      setIsCancelling(true);
      try {
        const res = await updateTraineeEnrollmentByEmail(user.email, { status: "cancelled" });
        if (res.success) {
          toast({ title: "Application Cancelled", description: "Your application has been successfully cancelled." });
          await loadEnrollment();
        } else {
          toast({ title: "Cancellation Failed", description: res.error || "The system could not process the cancellation.", variant: "destructive" });
        }
      } catch (err) {
        toast({ title: "Error", description: "An unexpected error occurred.", variant: "destructive" });
      } finally {
        setIsCancelling(false);
      }
    }
  };

  // Only consider it an application if it has a course and isn't just the 'ready_to_apply' profile state
  const hasApplication = userEnrollment && userEnrollment.status.toLowerCase() !== "ready_to_apply";

  return (
    <div className="space-y-8 max-w-6xl mx-auto pb-20">
      {printTarget && (
        <PrintModal enrollment={printTarget} onClose={() => setPrintTarget(null)} />
      )}

      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-2"
      >
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-indigo-100 text-indigo-600 rounded-2xl flex items-center justify-center shadow-sm">
            <ClipboardList className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-3xl font-black tracking-tight text-gray-900">Application Tracking</h1>
            <p className="text-gray-500 font-medium">Monitor the status of your submitted course applications.</p>
          </div>
        </div>
      </motion.div>

      {isFetching ? (
        <div className="flex justify-center items-center py-20">
          <div className="w-8 h-8 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin" />
        </div>
      ) : !hasApplication ? (
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex flex-col items-center justify-center py-20 bg-gray-50 rounded-[2.5rem] border-2 border-dashed border-gray-200"
        >
          <FileText className="h-12 w-12 text-gray-300 mb-4" />
          <p className="text-gray-500 font-bold mb-4">You don't have any active course applications.</p>
          <Button asChild className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl">
            <Link href="/trainee/application">Browse Courses</Link>
          </Button>
        </motion.div>
      ) : (
        <motion.div 
          variants={container}
          initial="hidden"
          animate="show"
          className="space-y-6"
        >
          <motion.div variants={item}>
            <Card className="border border-gray-200 shadow-md rounded-3xl overflow-hidden">
              <div className="bg-gray-50 border-b border-gray-100 p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <span className="px-3 py-1 bg-indigo-100 text-indigo-700 text-xs font-bold rounded-full uppercase tracking-wider">
                      {userEnrollment.status}
                    </span>
                    <span className="text-gray-500 text-sm font-medium">Ref: {userEnrollment.refNo}</span>
                  </div>
                  <h3 className="text-xl font-black text-gray-900">
                    {courses.find(c => c.slug === userEnrollment.courseSlug)?.title || "Course"}
                  </h3>
                  <p className="text-sm text-gray-500 font-medium mt-1">Submitted on {new Date(userEnrollment.createdAt).toLocaleDateString()}</p>
                </div>
                <div className="flex flex-wrap items-center gap-3">
                  {!['cancelled', 'completed', 'rejected', 'enrolled', 'confirmed'].includes(userEnrollment.status.toLowerCase()) && (
                    <Button 
                      variant="destructive" 
                      onClick={() => handleCancelApplication(userEnrollment)}
                      disabled={isCancelling}
                      className="rounded-xl shadow-sm text-xs font-bold uppercase tracking-wider"
                    >
                      {isCancelling ? "Cancelling..." : "Cancel Application"}
                    </Button>
                  )}
                  {['pending', 'review', 'interview', 'enrolled', 'confirmed', 'completed'].includes(userEnrollment.status.toLowerCase()) && (
                    <Button 
                      variant="outline" 
                      onClick={() => setPrintTarget(userEnrollment)}
                      className="rounded-xl shadow-sm border-gray-200 text-gray-700 text-xs font-bold uppercase tracking-wider"
                    >
                      <Download className="w-4 h-4 mr-2" /> Download Form
                    </Button>
                  )}
                </div>
              </div>

              <CardContent className="p-6">
                <div className="mb-8">
                  <h4 className="text-sm font-bold text-gray-900 mb-6 uppercase tracking-wider">Processing Timeline</h4>
                  <div className="relative">
                    <div className="absolute left-[15px] md:left-1/2 md:-translate-x-1/2 top-4 bottom-4 w-1 bg-gray-100 rounded-full" />
                    
                    {(() => {
                      const statusLower = userEnrollment.status.toLowerCase();
                      const steps = [
                        { id: "submitted", label: "Application Submitted", sub: "We have received your application." },
                        { id: "review", label: "Under Review", sub: "We are reviewing your profile and documents." },
                        { id: "interview", label: "Interview / Assessment", sub: "Pending technical assessment." },
                        { id: "enrolled", label: "Enrolled", sub: "Admission completed successfully." }
                      ];

                      let currentStepIndex = 0;
                      if (['pending', 'submitted'].includes(statusLower)) currentStepIndex = 1;
                      else if (statusLower === 'review') currentStepIndex = 2;
                      else if (statusLower === 'interview') currentStepIndex = 3;
                      else if (['enrolled', 'confirmed', 'completed'].includes(statusLower)) currentStepIndex = 4;

                      // If cancelled/rejected, we show a different timeline or overlay
                      if (['cancelled', 'rejected'].includes(statusLower)) {
                        return (
                          <div className="relative flex flex-col items-center justify-center py-6 text-center z-10">
                            <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mb-4 border-4 border-white shadow-md">
                              <AlertCircle className="w-8 h-8" />
                            </div>
                            <h4 className="text-lg font-black text-red-700 uppercase tracking-widest">{statusLower}</h4>
                            <p className="text-gray-500 text-sm mt-2 max-w-md">
                              This application was {statusLower}. You may submit a new application for an available course.
                            </p>
                          </div>
                        );
                      }

                      return steps.map((step, idx) => {
                        const isCompleted = idx < currentStepIndex;
                        const isCurrent = idx === currentStepIndex - 1;
                        
                        return (
                          <div key={step.id} className="relative flex items-center justify-start md:justify-center mb-8 last:mb-0 group">
                            {/* Left Content (Desktop) */}
                            <div className="hidden md:block w-1/2 pr-12 text-right">
                              {isCompleted && (
                                <div className="opacity-100 transition-opacity">
                                  <h4 className={cn("text-sm font-bold", isCurrent ? "text-indigo-600" : "text-gray-900")}>{step.label}</h4>
                                  <p className="text-xs text-gray-500 mt-1">{step.sub}</p>
                                </div>
                              )}
                            </div>

                            {/* Center Node */}
                            <div className={cn(
                              "absolute left-0 md:left-1/2 md:-translate-x-1/2 w-8 h-8 rounded-full flex items-center justify-center z-10 border-4 border-white shadow-sm transition-all duration-300",
                              isCompleted ? (isCurrent ? "bg-indigo-600 text-white" : "bg-emerald-500 text-white") : "bg-gray-100 text-gray-400"
                            )}>
                              {idx + 1}
                            </div>

                            {/* Right Content */}
                            <div className="w-full pl-12 md:w-1/2 md:pl-12 text-left">
                              <div className={cn("transition-opacity", (!isCompleted && !isCurrent) ? "opacity-50" : "opacity-100")}>
                                <h4 className={cn("text-sm font-bold md:hidden", isCurrent ? "text-indigo-600" : "text-gray-900")}>{step.label}</h4>
                                <h4 className={cn("hidden md:block text-sm font-bold", (!isCompleted) ? "text-gray-900" : "text-transparent select-none")}>{step.label}</h4>
                                <p className="text-xs text-gray-500 mt-1 md:hidden">{step.sub}</p>
                                <p className={cn("hidden md:block text-xs text-gray-500 mt-1", (!isCompleted) ? "text-gray-500" : "text-transparent select-none")}>{step.sub}</p>
                              </div>
                            </div>
                          </div>
                        );
                      });
                    })()}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-6 border-t border-gray-100">
                  <div className="flex items-start gap-3">
                    <BookOpen className="w-5 h-5 text-gray-400 mt-0.5" />
                    <div>
                      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Enrollment Type</p>
                      <p className="text-sm font-medium text-gray-900 mt-0.5">{userEnrollment.enrollmentType}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Clock className="w-5 h-5 text-gray-400 mt-0.5" />
                    <div>
                      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Schedule</p>
                      <p className="text-sm font-medium text-gray-900 mt-0.5">{userEnrollment.preferredSchedule}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <FileText className="w-5 h-5 text-gray-400 mt-0.5" />
                    <div>
                      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Scholarship</p>
                      <p className="text-sm font-medium text-gray-900 mt-0.5">
                        {userEnrollment.scholarshipApplication?.includes("Yes") ? "TWSP Applicant" : "Self-funded"}
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
}