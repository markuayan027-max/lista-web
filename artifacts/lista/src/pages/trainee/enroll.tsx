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
import { courses, type Enrollment } from "@/lib/institutional-data";
import { exportSingleTraineeToExcel, exportSingleTraineeToWord } from "@/lib/export-utils";
import { fetchTraineeEnrollmentByEmail, registerTraineeFromForm } from "@/lib/trainee-enrollment-insforge";
import { 
  saveLocalProfile, 
  loadLocalProfile, 
} from "@/lib/profile-utils";

const STEPS = [
  { id: 1, title: "Program", description: "Course selection", icon: CalendarDays },
  { id: 2, title: "Materials", description: "Documentation", icon: FileText },
  { id: 3, title: "Review", description: "Confirmation", icon: CheckCircle2 },
];

export default function TraineeEnrollPage() {
  const { user } = useAuth();
  const [location, setLocation] = useLocation();
  const { toast } = useToast();
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isFinished, setIsFinished] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  const [formData, setFormData] = useState<Enrollment | null>(null);

  useEffect(() => {
    const searchParams = new URLSearchParams(window.location.search);
    const urlCourse = searchParams.get('course');
    const draft = loadLocalProfile();
    
    const fetchExistingProfile = async () => {
      let initialData: any = draft || {};

      if (user?.email) {
        try {
          const data = await fetchTraineeEnrollmentByEmail(user.email!);
          if (data.success && data.data) {
            const dbData = data.data as unknown as Enrollment;
            const status = String(dbData.status).toLowerCase();
            
            if (!["completed", "cancelled", "rejected", "ready_to_apply"].includes(status)) {
              toast({ title: "Active Enrollment", description: "You already have an active application.", variant: "destructive" });
              setLocation("/trainee/tracking");
              return;
            }

            const cleanDbData = Object.fromEntries(
              Object.entries(dbData).filter(([k, v]) => 
                v !== null && v !== undefined && v !== "" && v !== "null"
              )
            );
            initialData = { ...initialData, ...cleanDbData };
          }
        } catch (error) {
          console.error("Error fetching database profile:", error);
        }
      }

      if (urlCourse) {
        initialData.courseSlug = urlCourse;
      }

      // Ensure some defaults
      if (!initialData.enrollmentType) initialData.enrollmentType = "New Enrollee";
      if (!initialData.preferredSchedule) initialData.preferredSchedule = "Full Day (8:00 AM – 5:00 PM)";
      if (!initialData.scholarshipApplication) initialData.scholarshipApplication = "Yes, I want to apply for TWSP";

      setFormData(initialData as Enrollment);
      setIsLoaded(true);
    };

    fetchExistingProfile();
  }, [user?.email, location]);

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
      saveLocalProfile(submissionData);
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
      <div className="min-h-screen bg-white flex items-center justify-center p-6">
        <motion.div 
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-md w-full"
        >
          <div className="text-center">
            <div className="w-12 h-12 bg-zinc-900 rounded-2xl flex items-center justify-center mx-auto mb-8">
              <CheckCircle2 className="h-6 w-6 text-white" />
            </div>
            <h1 className="text-3xl font-black text-zinc-900 tracking-tight mb-3 uppercase">Application Received</h1>
            <p className="text-zinc-500 text-sm leading-relaxed mb-10 font-medium">
              Your application for <span className="text-zinc-900 font-bold">{courses.find(c => c.slug === formData.courseSlug)?.title}</span> has been successfully submitted. 
              Reference: <code className="bg-zinc-100 px-1.5 py-0.5 rounded text-zinc-900 font-mono text-[11px] font-bold">{formData.refNo}</code>
            </p>

            <div className="bg-zinc-50 rounded-2xl p-6 mb-10 border border-zinc-100 text-left">
              <h3 className="text-sm font-bold text-zinc-900 mb-4">Application Timeline</h3>
              <div className="relative">
                <div className="absolute left-[15px] top-4 bottom-4 w-0.5 bg-zinc-200" />
                {[
                  { id: "submitted", label: "Submitted", sub: "Application received", active: true },
                  { id: "review", label: "In Review", sub: "Verification in progress", active: false },
                  { id: "interview", label: "Interview", sub: "Technical assessment", active: false },
                  { id: "enrolled", label: "Enrolled", sub: "Admission complete", active: false }
                ].map((step, idx) => (
                  <div key={step.id} className="relative flex gap-4 pb-6 last:pb-0 group">
                    <div className={cn(
                      "w-8 h-8 rounded-full flex items-center justify-center shrink-0 z-10 transition-all duration-500 text-[11px] font-bold",
                      step.active ? "bg-zinc-900 text-white shadow-md" : "bg-white border-2 border-zinc-200 text-zinc-400"
                    )}>
                      {idx + 1}
                    </div>
                    <div className="space-y-0.5 pt-1.5">
                      <p className={cn("text-sm font-bold transition-colors", step.active ? "text-zinc-900" : "text-zinc-400")}>{step.label}</p>
                      <p className="text-[10px] text-zinc-400 font-medium uppercase tracking-wider">{step.sub}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-3 mb-10">
              <Button 
                variant="outline" 
                className="w-full h-12 gap-3 border-zinc-100 text-zinc-500 hover:text-zinc-900 hover:bg-zinc-50 rounded-xl transition-all font-bold text-[11px] uppercase tracking-widest"
                onClick={handleDownloadExcel}
              >
                <FileSpreadsheet className="h-4 w-4" /> Export Admission Slip (.xlsx)
              </Button>
              <Button 
                variant="outline" 
                className="w-full h-12 gap-3 border-zinc-100 text-zinc-500 hover:text-zinc-900 hover:bg-zinc-50 rounded-xl transition-all font-bold text-[11px] uppercase tracking-widest"
                onClick={handleDownloadWord}
              >
                <Printer className="h-4 w-4" /> Export Form 1 (.docx)
              </Button>
            </div>

            <Button 
              className="w-full h-14 bg-zinc-900 text-white hover:bg-zinc-800 rounded-2xl font-black text-[11px] uppercase tracking-widest shadow-xl shadow-zinc-100 transition-all active:scale-[0.98]" 
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
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-zinc-100 border-t-zinc-900 rounded-full animate-spin" />
          <p className="text-xs font-bold text-zinc-400 uppercase tracking-widest">Loading Application Data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white flex flex-col md:flex-row font-sans text-zinc-900">
      <div className="w-full md:w-80 bg-white md:fixed md:h-full flex flex-col border-r border-zinc-100 z-10">
        <div className="p-8 pb-4">
          <div className="flex items-center gap-3 mb-10">
            <div className="w-8 h-8 bg-zinc-900 rounded-lg flex items-center justify-center">
              <CalendarDays className="h-4 w-4 text-white" />
            </div>
            <h1 className="text-sm font-black tracking-tight text-zinc-900 uppercase">Course Application</h1>
          </div>
          
          <div className="mb-8 space-y-1">
            <div className="flex justify-between items-center text-[10px] font-bold text-zinc-400 uppercase tracking-widest px-1">
              <span>Overall Progress</span>
              <span className="text-zinc-900">{stepProgress}%</span>
            </div>
            <div className="h-1 bg-zinc-100 rounded-full overflow-hidden">
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: `${stepProgress}%` }}
                className="h-full bg-zinc-900 transition-all duration-300 ease-out" 
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
                  isActive ? 'bg-zinc-50 text-zinc-900' : 
                  isCompleted ? 'hover:bg-zinc-50 text-zinc-400 hover:text-zinc-900' : 'text-zinc-300 cursor-not-allowed'
                }`}
                onClick={() => step.id < currentStep && setCurrentStep(step.id)}
                disabled={step.id > currentStep}
              >
                <div className={`flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center border text-[11px] font-bold transition-colors ${
                  isActive ? 'bg-zinc-900 border-zinc-900 text-white' : 
                  isCompleted ? 'bg-zinc-50 text-zinc-900 border-zinc-100 group-hover:border-zinc-200' : 
                  'border-zinc-100 text-zinc-200'
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
        
        <div className="p-8 border-t border-zinc-100">
           <Button 
            variant="ghost" 
            className="w-full justify-start text-zinc-400 hover:text-zinc-900 gap-3 text-xs font-semibold"
            onClick={() => setLocation("/trainee/application")}
           >
             <ArrowLeft className="h-4 w-4" /> Back to Courses
           </Button>
        </div>
      </div>

      <div className="flex-1 md:ml-80 flex flex-col min-h-screen bg-white">
         <div className="flex-1 p-6 md:p-12 lg:p-20 max-w-4xl w-full">
            <div className="mb-12">
               <motion.div
                 initial={{ opacity: 0, x: -4 }}
                 animate={{ opacity: 1, x: 0 }}
                 key={`title-${currentStep}`}
               >
                 <div className="flex items-center gap-2 mb-4">
                   <span className="text-[10px] font-black text-zinc-900 bg-zinc-100 px-2 py-0.5 rounded uppercase tracking-wider">Step 0{currentStep}</span>
                   <div className="h-px w-8 bg-zinc-200" />
                   <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Application Flow</span>
                 </div>
                 <h2 className="text-5xl font-black text-zinc-900 tracking-tight leading-none mb-4">{STEPS.find(s => s.id === currentStep)?.title}</h2>
                 <p className="text-lg text-zinc-500 font-medium max-w-md leading-relaxed">{STEPS.find(s => s.id === currentStep)?.description}.</p>
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
                          <label className="text-xs font-semibold text-zinc-700">Select Course</label>
                          <Select value={formData.courseSlug} onValueChange={val => updateForm({ courseSlug: val })}>
                            <SelectTrigger className="h-12 border-zinc-200 rounded-md text-base"><SelectValue placeholder="Choose a program..." /></SelectTrigger>
                            <SelectContent className="rounded-md">
                            {courses.filter(c => c.isAvailable !== false).map(c => (
                              <SelectItem key={c.slug} value={c.slug}>{c.title} ({c.ncLevel})</SelectItem>
                            ))}
                          </SelectContent>
                          </Select>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                          <div className="space-y-2">
                            <label className="text-xs font-semibold text-zinc-700">Enrollment Type</label>
                            <Select value={formData.enrollmentType} onValueChange={val => updateForm({ enrollmentType: val as any })}>
                              <SelectTrigger className="h-10 border-zinc-200 rounded-md"><SelectValue /></SelectTrigger>
                              <SelectContent className="rounded-md">
                                <SelectItem value="New Enrollee">New Enrollee</SelectItem>
                                <SelectItem value="Re-enrollee">Re-enrollee</SelectItem>
                                <SelectItem value="Assessment Only (walk-in)">Assessment Only (walk-in)</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="space-y-2">
                            <label className="text-xs font-semibold text-zinc-700">Preferred Schedule</label>
                            <Select value={formData.preferredSchedule} onValueChange={val => updateForm({ preferredSchedule: val as any })}>
                              <SelectTrigger className="h-10 border-zinc-200 rounded-md"><SelectValue /></SelectTrigger>
                              <SelectContent className="rounded-md">
                                <SelectItem value="Morning (8:00 AM – 12:00 PM)">Morning (8am-12pm)</SelectItem>
                                <SelectItem value="Afternoon (1:00 PM – 5:00 PM)">Afternoon (1pm-5pm)</SelectItem>
                                <SelectItem value="Full Day (8:00 AM – 5:00 PM)">Full Day (8am-5pm)</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                        <div className="space-y-2">
                          <label className="text-xs font-semibold text-zinc-700">Scholarship Application (TWSP)</label>
                          <Select value={formData.scholarshipApplication} onValueChange={val => updateForm({ scholarshipApplication: val as any })}>
                            <SelectTrigger className="h-10 border-zinc-200 rounded-md"><SelectValue /></SelectTrigger>
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
                            <div key={idx} className="group border border-zinc-100 rounded-3xl p-8 hover:bg-zinc-50 transition-all cursor-pointer flex flex-col items-center text-center">
                              <div className="w-14 h-14 bg-zinc-50 border border-zinc-100 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-white group-hover:scale-105 transition-all shadow-sm">
                                <Upload className="w-5 h-5 text-zinc-400 group-hover:text-zinc-900" />
                              </div>
                              <p className="text-sm font-black text-zinc-900 uppercase tracking-tight">{doc.label}</p>
                              <p className="text-[11px] text-zinc-400 mt-1 font-bold uppercase tracking-wider">{doc.sub}</p>
                            </div>
                          ))}
                        </div>
                        
                        <div className="bg-zinc-50 rounded-3xl p-8 flex flex-col md:flex-row items-center justify-between gap-6">
                           <div>
                             <h4 className="text-sm font-black text-zinc-900 uppercase tracking-tight mb-1">Missing some files?</h4>
                             <p className="text-[13px] text-zinc-500 font-medium">You can securely upload these later from your tracking dashboard.</p>
                           </div>
                           <Button 
                            variant="outline" 
                            className="bg-white border-zinc-200 text-zinc-900 hover:bg-zinc-50 font-black text-[11px] uppercase tracking-widest px-8 h-12 rounded-xl transition-all active:scale-95"
                            onClick={nextStep}
                           >
                             Skip file upload
                           </Button>
                        </div>
                      </div>
                    )}

                    {currentStep === 3 && (
                      <div className="space-y-6">
                        <div className="border border-zinc-200 rounded-lg overflow-hidden bg-zinc-50">
                          <div className="bg-zinc-100 px-4 py-3 border-b border-zinc-200">
                            <h3 className="text-sm font-semibold text-zinc-900">Application Review</h3>
                          </div>
                          <div className="p-4 grid grid-cols-1 sm:grid-cols-2 gap-y-4 gap-x-6 text-sm">
                            <div className="sm:col-span-2">
                              <span className="block text-xs text-zinc-500 mb-1">Selected Course</span>
                              <span className="font-medium text-zinc-900">{courses.find(c => c.slug === formData.courseSlug)?.title || "Not selected"}</span>
                            </div>
                            <div>
                              <span className="block text-xs text-zinc-500 mb-1">Schedule</span>
                              <span className="font-medium text-zinc-900">{formData.preferredSchedule}</span>
                            </div>
                            <div>
                              <span className="block text-xs text-zinc-500 mb-1">Scholarship</span>
                              <span className="font-medium text-zinc-900">{formData.scholarshipApplication.includes("Yes") ? "TWSP Applicant" : "Self-funded"}</span>
                            </div>
                            <div>
                              <span className="block text-xs text-zinc-500 mb-1">Applicant Name</span>
                              <span className="font-medium text-zinc-900">{formData.firstName} {formData.lastName}</span>
                            </div>
                          </div>
                        </div>

                        <label className="flex items-start gap-3 p-6 border border-zinc-100 rounded-3xl cursor-pointer hover:bg-zinc-50 transition-colors">
                          <Checkbox 
                            className="mt-0.5 border-zinc-300 data-[state=checked]:bg-zinc-900 data-[state=checked]:border-zinc-900"
                            checked={formData.consent} 
                            onCheckedChange={(checked) => updateForm({ consent: checked as boolean })}
                          />
                          <p className="text-[13px] text-zinc-500 font-medium leading-relaxed">
                            I confirm that my pre-filled profile information is accurate, and I consent to submit this official course application.
                          </p>
                        </label>
                      </div>
                    )}

                    <div className="flex items-center gap-4 pt-12 border-t border-zinc-50">
                      {currentStep > 1 && (
                        <Button 
                          variant="ghost" 
                          className="h-14 px-8 text-zinc-400 hover:text-zinc-900 font-black text-[11px] uppercase tracking-widest rounded-2xl" 
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
                              ? "bg-zinc-900 text-white hover:bg-zinc-800 shadow-xl shadow-zinc-100 active:scale-[0.98]" 
                              : "bg-zinc-100 text-zinc-400 cursor-not-allowed opacity-50"
                          )}
                          onClick={nextStep}
                        >
                          Continue <ArrowRight className="ml-2 h-3.5 w-3.5" />
                        </Button>
                      ) : (
                        <Button 
                          className="h-14 px-12 bg-zinc-900 text-white hover:bg-zinc-800 rounded-2xl font-black text-[11px] uppercase tracking-widest shadow-xl shadow-zinc-100 transition-all active:scale-[0.98]" 
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