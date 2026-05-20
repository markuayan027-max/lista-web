import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useLocation } from "wouter";
import { useAuth } from "@/context/auth-context";
import { cn } from "@/lib/utils";
import { 
  CalendarDays, 
  CheckCircle2, 
  ArrowRight, 
  ArrowLeft,
  FileSpreadsheet,
  Printer,
  FileText,
  Upload
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { useCourses, useTraineeProfile } from "@/hooks/use-lista-data";
import { courseTitleBySlug } from "@/lib/lista-insforge-data";
import type { Enrollment } from "@/lib/institutional-data";
import { exportSingleTraineeToExcel, exportSingleTraineeToWord } from "@/lib/export-utils";
import { registerTraineeFromForm } from "@/lib/trainee-enrollment-insforge";
import {
  saveLocalProfile,
  loadLocalProfile,
  buildRegistrationDraft,
  isTraineeApplicationFormComplete,
  maxCompletedRegistrationStep,
} from "@/lib/profile-utils";
import { enrollmentBlocksNewCourseApplication } from "@/lib/enrollment-status";

const STEPS = [
  { id: 1, title: "Program", description: "Course selection", icon: CalendarDays },
  { id: 2, title: "Materials", description: "Documentation", icon: FileText },
  { id: 3, title: "Review", description: "Confirmation", icon: CheckCircle2 },
];

export default function TraineeEnrollPage() {
  const { user } = useAuth();
  const { data: courses = [] } = useCourses();
  const { data: cloudProfile, isFetched: profileFetched } = useTraineeProfile(user?.email);
  const [location, setLocation] = useLocation();
  const { toast } = useToast();
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isFinished, setIsFinished] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  const [formData, setFormData] = useState<Enrollment | null>(null);

  useEffect(() => {
    if (isLoaded) return;
    if (user?.email && !profileFetched) return;

    const searchParams = new URLSearchParams(window.location.search);
    const urlCourse = searchParams.get('course');
    const draft = loadLocalProfile(user?.id);
    let initialData: Record<string, unknown> = (draft as Record<string, unknown>) || {};

    if (cloudProfile) {
      const dbData = cloudProfile as Enrollment;

      if (enrollmentBlocksNewCourseApplication(dbData.status)) {
        toast({ title: "Active Enrollment", description: "You already have an active application.", variant: "destructive" });
        setLocation("/trainee/tracking");
        return;
      }

      const cleanDbData = Object.fromEntries(
        Object.entries(dbData).filter(
          ([, v]) => v !== null && v !== undefined && v !== "" && v !== "null",
        ),
      );
      initialData = { ...initialData, ...cleanDbData };
    }

    if (urlCourse) {
      initialData.courseSlug = urlCourse;
    }

    if (!initialData.enrollmentType) initialData.enrollmentType = "New Enrollee";
    if (!initialData.preferredSchedule) initialData.preferredSchedule = "Full Day (8:00 AM – 5:00 PM)";
    if (!initialData.scholarshipApplication) initialData.scholarshipApplication = "Yes, I want to apply for TWSP";

    const completed = maxCompletedRegistrationStep(initialData as unknown as Enrollment);
    const scoped = {
      ...initialData,
      ...buildRegistrationDraft(initialData as unknown as Enrollment, completed, {
        authEmail: user?.email,
      }),
    };

    setFormData(scoped as Enrollment);
    setIsLoaded(true);

    if (!isTraineeApplicationFormComplete(scoped as Enrollment)) {
      toast({
        title: "Application form incomplete",
        description: "Finish the TESDA registration form (all steps and consent) before applying to a course.",
        variant: "destructive",
      });
      const registerPath = urlCourse
        ? `/trainee/register?course=${encodeURIComponent(urlCourse)}`
        : "/trainee/register";
      setLocation(registerPath);
    }
  }, [
    cloudProfile,
    isLoaded,
    location,
    profileFetched,
    setLocation,
    toast,
    user?.email,
    user?.id,
  ]);

  const stepProgress = Math.round((currentStep / STEPS.length) * 100);

  const updateForm = useCallback((updates: Partial<Enrollment>) => {
    setFormData(prev => prev ? { ...prev, ...updates } : null);
  }, []);

  const isStepValid = () => {
    if (currentStep === 1) {
      return !!formData?.courseSlug;
    }
    return true;
  };

  const nextStep = () => {
    if (!isStepValid()) {
      toast({
        title: "Required Info Missing",
        description: "Please select a course to enroll in.",
        variant: "destructive",
      });
      return;
    }
    if (currentStep < 3) setCurrentStep(prev => prev + 1);
  };

  const prevStep = () => {
    if (currentStep > 1) setCurrentStep(prev => prev - 1);
  };

  const handleSubmit = async () => {
    if (!formData?.courseSlug) {
      toast({ title: "Error", description: "Please select a course.", variant: "destructive" });
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      const submissionData = { ...formData, status: "pending" as const };
      const { success, error } = await registerTraineeFromForm(submissionData, user?.id);
      if (!success) throw new Error(error || "Failed to submit application");

      setFormData(submissionData);
      saveLocalProfile(submissionData, user?.id);
      setIsFinished(true);
      
      toast({
        title: "Application Submitted!",
        description: "Your course application has been successfully submitted.",
      });
    } catch (error: any) {
      toast({
        title: "Submission Failed",
        description: "Your application was NOT saved. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDownloadExcel = () => formData && exportSingleTraineeToExcel(formData as any);
  const handleDownloadWord = () => formData && exportSingleTraineeToWord(formData as any);

  const stepVariants = {
    hidden: { opacity: 0, x: 4 },
    visible: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -4 }
  };

  if (isFinished && formData) {
    return (
      <div className="min-h-screen bg-card flex items-center justify-center p-6">
        <motion.div 
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-md w-full"
        >
          <div className="text-center">
            <div className="w-12 h-12 bg-primary rounded-2xl flex items-center justify-center mx-auto mb-8">
              <CheckCircle2 className="h-6 w-6 text-primary-foreground" />
            </div>
            <h1 className="text-3xl font-black text-foreground tracking-tight mb-3 uppercase">Application Received</h1>
            <p className="text-muted-foreground text-sm leading-relaxed mb-10 font-medium">
              Your application for <span className="text-foreground font-bold">{courseTitleBySlug(courses, formData.courseSlug)}</span> has been successfully submitted. 
              Reference: <code className="bg-muted px-1.5 py-0.5 rounded text-foreground font-mono text-[11px] font-bold">{formData.refNo}</code>
            </p>

            <div className="bg-muted rounded-2xl p-6 mb-10 border border-border text-left">
              <h3 className="text-sm font-bold text-foreground mb-4">Application Timeline</h3>
              <div className="relative">
                <div className="absolute left-[15px] top-4 bottom-4 w-0.5 bg-border" />
                {[
                  { id: "submitted", label: "Submitted", sub: "Application received", active: true },
                  { id: "review", label: "In Review", sub: "Verification in progress", active: false },
                  { id: "interview", label: "Interview", sub: "Technical assessment", active: false },
                  { id: "enrolled", label: "Enrolled", sub: "Admission complete", active: false }
                ].map((step, idx) => (
                  <div key={step.id} className="relative flex gap-4 pb-6 last:pb-0 group">
                    <div className={cn(
                      "w-8 h-8 rounded-full flex items-center justify-center shrink-0 z-10 transition-all duration-500 text-[11px] font-bold",
                      step.active ? "bg-primary text-primary-foreground shadow-md" : "bg-card border-2 border-border text-muted-foreground"
                    )}>
                      {idx + 1}
                    </div>
                    <div className="space-y-0.5 pt-1.5">
                      <p className={cn("text-sm font-bold transition-colors", step.active ? "text-foreground" : "text-muted-foreground")}>{step.label}</p>
                      <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider">{step.sub}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-3 mb-10">
              <Button 
                variant="outline" 
                className="w-full h-12 gap-3 border-border text-muted-foreground hover:text-foreground hover:bg-muted rounded-xl transition-all font-bold text-[11px] uppercase tracking-widest"
                onClick={handleDownloadExcel}
              >
                <FileSpreadsheet className="h-4 w-4" /> Export Admission Slip (.xlsx)
              </Button>
              <Button 
                variant="outline" 
                className="w-full h-12 gap-3 border-border text-muted-foreground hover:text-foreground hover:bg-muted rounded-xl transition-all font-bold text-[11px] uppercase tracking-widest"
                onClick={handleDownloadWord}
              >
                <Printer className="h-4 w-4" /> Export Form 1 (.docx)
              </Button>
            </div>

            <Button 
              className="w-full h-14 bg-primary text-primary-foreground hover:bg-primary/90 rounded-2xl font-black text-[11px] uppercase tracking-widest shadow-xl shadow-primary/10 transition-all active:scale-[0.98]" 
              onClick={() => setLocation("/trainee/tracking")}
            >
              Track Application Status
            </Button>
          </div>
        </motion.div>
      </div>
    );
  }

  if (!isLoaded || !formData) {
    return (
      <div className="min-h-screen bg-card flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-border border-t-primary rounded-full animate-spin" />
          <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Loading Application Data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col md:flex-row font-sans text-foreground">
      <div className="w-full md:w-80 bg-card md:fixed md:h-full flex flex-col border-r border-border z-10">
        <div className="p-8 pb-4">
          <div className="flex items-center gap-3 mb-10">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <CalendarDays className="h-4 w-4 text-primary-foreground" />
            </div>
            <h1 className="text-sm font-black tracking-tight text-foreground uppercase">Course Application</h1>
          </div>
          
          <div className="mb-8 space-y-1">
            <div className="flex justify-between items-center text-[10px] font-bold text-muted-foreground uppercase tracking-widest px-1">
              <span>Overall Progress</span>
              <span className="text-foreground">{stepProgress}%</span>
            </div>
            <div className="h-1 bg-muted rounded-full overflow-hidden">
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: `${stepProgress}%` }}
                className="h-full bg-primary transition-all duration-300 ease-out" 
              />
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-4 pb-10 space-y-1 no-scrollbar hidden md:block">
          {STEPS.map((step) => {
            const isCompleted = step.id < currentStep;
            const isActive = step.id === currentStep;
            return (
              <button 
                key={step.id} 
                className={`w-full text-left px-4 py-3 rounded-xl flex items-center gap-4 transition-all duration-200 group ${
                  isActive ? 'bg-muted text-foreground' : 
                  isCompleted ? 'hover:bg-muted text-muted-foreground hover:text-foreground' : 'text-muted-foreground/50 cursor-not-allowed'
                }`}
                onClick={() => step.id < currentStep && setCurrentStep(step.id)}
                disabled={step.id > currentStep}
              >
                <div className={`flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center border text-[11px] font-bold transition-colors ${
                  isActive ? 'bg-primary border-primary text-primary-foreground' : 
                  isCompleted ? 'bg-muted text-foreground border-border group-hover:border-border' : 
                  'border-border text-muted-foreground/40'
                }`}>
                  {isCompleted ? <CheckCircle2 className="w-4 h-4" /> : step.id}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-[13px] font-bold">{step.title}</div>
                  <div className="text-[11px] opacity-60 font-medium">{step.description}</div>
                </div>
              </button>
            );
          })}
        </div>
        
        <div className="p-8 border-t border-border">
           <Button 
            variant="ghost" 
            className="w-full justify-start text-muted-foreground hover:text-foreground gap-3 text-xs font-semibold"
            onClick={() => setLocation("/trainee/application")}
           >
             <ArrowLeft className="h-4 w-4" /> Back to Courses
           </Button>
        </div>
      </div>

      <div className="flex-1 md:ml-80 flex flex-col min-h-screen bg-card">
         <div className="flex-1 p-6 md:p-12 lg:p-20 max-w-4xl w-full">
            <div className="mb-12">
               <motion.div
                 initial={{ opacity: 0, x: -4 }}
                 animate={{ opacity: 1, x: 0 }}
                 key={`title-${currentStep}`}
               >
                 <div className="flex items-center gap-2 mb-4">
                   <span className="text-[10px] font-black text-foreground bg-muted px-2 py-0.5 rounded uppercase tracking-wider">Step 0{currentStep}</span>
                   <div className="h-px w-8 bg-border" />
                   <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Application Flow</span>
                 </div>
                 <h2 className="text-5xl font-black text-foreground tracking-tight leading-none mb-4">{STEPS.find(s => s.id === currentStep)?.title}</h2>
                 <p className="text-lg text-muted-foreground font-medium max-w-md leading-relaxed">{STEPS.find(s => s.id === currentStep)?.description}.</p>
               </motion.div>
            </div>

            <div className="mt-12">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={currentStep}
                    variants={stepVariants}
                    initial="hidden"
                    animate="visible"
                    exit="exit"
                    className="space-y-12"
                  >
                    {currentStep === 1 && (
                      <div className="space-y-6">
                        <div className="space-y-2">
                          <label className="text-xs font-semibold text-foreground/90">Select Course</label>
                          <Select value={formData.courseSlug} onValueChange={val => updateForm({ courseSlug: val })}>
                            <SelectTrigger className="h-12 border-border rounded-md text-base"><SelectValue placeholder="Choose a program..." /></SelectTrigger>
                            <SelectContent className="rounded-md">
                            {courses.filter(c => c.isAvailable !== false).map(c => (
                              <SelectItem key={c.slug} value={c.slug}>{c.title} ({c.ncLevel})</SelectItem>
                            ))}
                          </SelectContent>
                          </Select>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                          <div className="space-y-2">
                            <label className="text-xs font-semibold text-foreground/90">Enrollment Type</label>
                            <Select value={formData.enrollmentType} onValueChange={val => updateForm({ enrollmentType: val as any })}>
                              <SelectTrigger className="h-10 border-border rounded-md"><SelectValue /></SelectTrigger>
                              <SelectContent className="rounded-md">
                                <SelectItem value="New Enrollee">New Enrollee</SelectItem>
                                <SelectItem value="Re-enrollee">Re-enrollee</SelectItem>
                                <SelectItem value="Assessment Only (walk-in)">Assessment Only (walk-in)</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="space-y-2">
                            <label className="text-xs font-semibold text-foreground/90">Preferred Schedule</label>
                            <Select value={formData.preferredSchedule} onValueChange={val => updateForm({ preferredSchedule: val as any })}>
                              <SelectTrigger className="h-10 border-border rounded-md"><SelectValue /></SelectTrigger>
                              <SelectContent className="rounded-md">
                                <SelectItem value="Morning (8:00 AM – 12:00 PM)">Morning (8am-12pm)</SelectItem>
                                <SelectItem value="Afternoon (1:00 PM – 5:00 PM)">Afternoon (1pm-5pm)</SelectItem>
                                <SelectItem value="Full Day (8:00 AM – 5:00 PM)">Full Day (8am-5pm)</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                        <div className="space-y-2">
                          <label className="text-xs font-semibold text-foreground/90">Scholarship Application (TWSP)</label>
                          <Select value={formData.scholarshipApplication} onValueChange={val => updateForm({ scholarshipApplication: val as any })}>
                            <SelectTrigger className="h-10 border-border rounded-md"><SelectValue /></SelectTrigger>
                            <SelectContent className="rounded-md">
                              <SelectItem value="Yes, I want to apply for TWSP">Yes, apply for TWSP</SelectItem>
                              <SelectItem value="No, self-funded enrollment">No, self-funded</SelectItem>
                              <SelectItem value="I need more information about scholarships">I need more information</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    )}

                    {currentStep === 2 && (
                      <div className="space-y-12">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          {[
                            { label: "PSA Birth Certificate", sub: "Required for identity verification" },
                            { label: "Valid Government ID", sub: "Any official PH-issued identification" },
                            { label: "2x2 Portrait Photo", sub: "White background, formal attire" },
                            { label: "Academic Record", sub: "Latest diploma or transcript" }
                          ].map((doc, idx) => (
                            <div key={idx} className="group border border-border rounded-3xl p-8 hover:bg-muted transition-all cursor-pointer flex flex-col items-center text-center">
                              <div className="w-14 h-14 bg-muted border border-border rounded-2xl flex items-center justify-center mb-6 group-hover:bg-card group-hover:scale-105 transition-all shadow-sm">
                                <Upload className="w-5 h-5 text-muted-foreground group-hover:text-foreground" />
                              </div>
                              <p className="text-sm font-black text-foreground uppercase tracking-tight">{doc.label}</p>
                              <p className="text-[11px] text-muted-foreground mt-1 font-bold uppercase tracking-wider">{doc.sub}</p>
                            </div>
                          ))}
                        </div>
                        
                        <div className="bg-muted rounded-3xl p-8 flex flex-col md:flex-row items-center justify-between gap-6">
                           <div>
                             <h4 className="text-sm font-black text-foreground uppercase tracking-tight mb-1">Missing some files?</h4>
                             <p className="text-[13px] text-muted-foreground font-medium">You can securely upload these later from your tracking dashboard.</p>
                           </div>
                           <Button 
                            variant="outline" 
                            className="bg-card border-border text-foreground hover:bg-muted font-black text-[11px] uppercase tracking-widest px-8 h-12 rounded-xl transition-all active:scale-95"
                            onClick={nextStep}
                           >
                             Skip file upload
                           </Button>
                        </div>
                      </div>
                    )}

                    {currentStep === 3 && (
                      <div className="space-y-6">
                        <div className="border border-border rounded-lg overflow-hidden bg-muted">
                          <div className="bg-muted px-4 py-3 border-b border-border">
                            <h3 className="text-sm font-semibold text-foreground">Application Review</h3>
                          </div>
                          <div className="p-4 grid grid-cols-1 sm:grid-cols-2 gap-y-4 gap-x-6 text-sm">
                            <div className="sm:col-span-2">
                              <span className="block text-xs text-muted-foreground mb-1">Selected Course</span>
                              <span className="font-medium text-foreground">{courseTitleBySlug(courses, formData.courseSlug) || "Not selected"}</span>
                            </div>
                            <div>
                              <span className="block text-xs text-muted-foreground mb-1">Schedule</span>
                              <span className="font-medium text-foreground">{formData.preferredSchedule}</span>
                            </div>
                            <div>
                              <span className="block text-xs text-muted-foreground mb-1">Scholarship</span>
                              <span className="font-medium text-foreground">{formData.scholarshipApplication.includes("Yes") ? "TWSP Applicant" : "Self-funded"}</span>
                            </div>
                            <div>
                              <span className="block text-xs text-muted-foreground mb-1">Applicant Name</span>
                              <span className="font-medium text-foreground">{formData.firstName} {formData.lastName}</span>
                            </div>
                          </div>
                        </div>

                        <label className="flex items-start gap-3 p-6 border border-border rounded-3xl cursor-pointer hover:bg-muted transition-colors">
                          <Checkbox 
                            className="mt-0.5 border-border data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                            checked={formData.consent} 
                            onCheckedChange={(checked) => updateForm({ consent: checked as boolean })}
                          />
                          <p className="text-[13px] text-muted-foreground font-medium leading-relaxed">
                            I confirm that my pre-filled profile information is accurate, and I consent to submit this official course application.
                          </p>
                        </label>
                      </div>
                    )}

                    <div className="flex items-center gap-4 pt-12 border-t border-border/50">
                      {currentStep > 1 && (
                        <Button 
                          variant="ghost" 
                          className="h-14 px-8 text-muted-foreground hover:text-foreground font-black text-[11px] uppercase tracking-widest rounded-2xl" 
                          onClick={prevStep}
                        >
                          <ArrowLeft className="mr-2 h-3.5 w-3.5" /> Previous
                        </Button>
                      )}
                      
                      <div className="flex-1" />

                      {currentStep < 3 ? (
                        <Button 
                          className={cn(
                            "h-14 px-12 rounded-2xl font-black text-[11px] uppercase tracking-widest transition-all",
                            isStepValid() 
                              ? "bg-primary text-primary-foreground hover:bg-primary/90 shadow-xl shadow-primary/10 active:scale-[0.98]" 
                              : "bg-muted text-muted-foreground cursor-not-allowed opacity-50"
                          )}
                          disabled={!isStepValid()}
                          onClick={nextStep}
                        >
                          Continue <ArrowRight className="ml-2 h-3.5 w-3.5" />
                        </Button>
                      ) : (
                        <Button 
                          className="h-14 px-12 bg-primary text-primary-foreground hover:bg-primary/90 rounded-2xl font-black text-[11px] uppercase tracking-widest shadow-xl shadow-primary/10 transition-all active:scale-[0.98]" 
                          onClick={handleSubmit}
                          disabled={!formData.consent || isSubmitting}
                        >
                          {isSubmitting ? "Processing..." : "Submit Application"}
                        </Button>
                      )}
                    </div>
                  </motion.div>
                </AnimatePresence>
            </div>
          </div>
        </div>
      </div>
    );
}