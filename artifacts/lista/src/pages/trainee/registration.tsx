import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Redirect, useLocation } from "wouter";
import { useAuth } from "@/context/auth-context";
import { getRoleHomePath, skipsTraineeApplication } from "@/lib/role-navigation";
import { cn } from "@/lib/utils";
import { 
  User, 
  MapPin, 
  GraduationCap, 
  CalendarDays, 
  CheckCircle2, 
  ArrowRight, 
  ArrowLeft,
  FileSpreadsheet,
  Printer,
  FileCheck,
  FileText,
  Building2,
  Briefcase,
  Upload
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
import type { Enrollment } from "@/lib/institutional-data";
import { exportSingleTraineeToExcel, exportSingleTraineeToWord } from "@/lib/export-utils";
import {
  prepareEnrollmentForInsforge,
  registerTraineeFromForm,
} from "@/lib/trainee-enrollment-insforge";
import {
  saveLocalProfile,
  loadLocalProfile,
  buildRegistrationDraft,
  buildRegistrationCloudPayload,
  isRegistrationStepComplete,
  loadRegistrationMaxStep,
  maxCompletedRegistrationStep,
  resolveRegistrationPersistStep,
  saveRegistrationMaxStep,
} from "@/lib/profile-utils";
import { enrollmentBlocksNewCourseApplication } from "@/lib/enrollment-status";

const STEPS = [
  { id: 1, title: "Personal", description: "Identity details", icon: User },
  { id: 2, title: "Contact", description: "Reach details", icon: MapPin },
  { id: 3, title: "Profile", description: "Education & Work", icon: GraduationCap },
  { id: 4, title: "Review", description: "Confirmation", icon: CheckCircle2 },
];

export default function TraineeRegistrationPage() {
  const { user, completeRegistration, markRegistrationPartial } = useAuth();
  const { data: courses = [] } = useCourses();
  const { data: cloudProfile } = useTraineeProfile(user?.email);
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isFinished, setIsFinished] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  const [formData, setFormData] = useState<Enrollment>({
    // ── Name ──
    firstName: user?.name?.split(' ')[0] || "",
    middleName: "",
    lastName: user?.name?.split(' ').slice(1).join(' ') || "",
    extensionName: "",
    traineeName: user?.name || "",
    
    // ── Birth & Identity ──
    dob: "",
    birthPlace: "",
    age: 0,
    gender: "Male" as "Male" | "Female" | "Prefer not to say",
    civilStatus: "Single" as "Single" | "Married" | "Widowed" | "Separated",
    nationality: "Filipino",
    
    // ── TESDA Identifiers ──
    uli: "",
    voucherNo: "",
    psaNo: "",
    
    // ── Classification ──
    learnerClassification: "Student",
    clientType: "TVET Student",
    qualificationType: "Full Qualification" as "Full Qualification" | "COC",
    
    // ── Family ──
    motherMaidenName: "",
    fatherName: "",
    isIP: false,
    indigenousGroup: "",
    motherTongue: "",
    
    // ── Contact ──
    traineeEmail: user?.email || "",
    contactNumber: "",
    telephone: "",
    mobileNumber: "",
    
    // ── Address ──
    homeAddress: "",
    barangay: "",
    district: "",
    city: "",
    province: "",
    region: "",
    zipCode: "",
    
    // ── Education ──
    education: "Senior High School Graduate",
    schoolLastAttended: "",
    yearGraduated: "",
    
    // ── Employment ──
    employmentStatus: "Unemployed" as "Unemployed" | "Underemployed" | "Employed (seeking skills upgrade)" | "Student",
    employmentType: "",
    companyName: "",
    workExperience: [
      { company: "", position: "", inclusiveDates: "", monthlySalary: "", appointmentStatus: "", noOfYearsExp: "" },
      { company: "", position: "", inclusiveDates: "", monthlySalary: "", appointmentStatus: "", noOfYearsExp: "" },
      { company: "", position: "", inclusiveDates: "", monthlySalary: "", appointmentStatus: "", noOfYearsExp: "" }
    ],
    
    // ── Course & Program ──
    courseSlug: "",
    preferredSchedule: "Full Day (8:00 AM – 5:00 PM)" as "Morning (8:00 AM – 12:00 PM)" | "Afternoon (1:00 PM – 5:00 PM)" | "Full Day (8:00 AM – 5:00 PM)",
    enrollmentType: "New Enrollee" as "New Enrollee" | "Re-enrollee" | "Assessment Only (walk-in)",
    scholarshipApplication: "Yes, I want to apply for TWSP" as "Yes, I want to apply for TWSP" | "No, self-funded enrollment" | "I need more information about scholarships",
    
    // ── Documents ──
    documents: [],
    documentStatus: 'missing' as 'complete' | 'partial' | 'missing',
    
    // ── Meta ──
    id: `e-${Math.random().toString(36).substr(2, 9)}`,
    refNo: `LISTA-${new Date().getFullYear()}-${Math.floor(10000 + Math.random() * 90000)}`,
    status: "ready_to_apply" as Enrollment["status"],
    consent: false,
    createdAt: new Date().toISOString()
  });

  const workExperienceRows: NonNullable<Enrollment["workExperience"]> =
    formData.workExperience ?? [
      {
        company: "",
        position: "",
        inclusiveDates: "",
        monthlySalary: "",
        appointmentStatus: "",
        noOfYearsExp: "",
      },
      {
        company: "",
        position: "",
        inclusiveDates: "",
        monthlySalary: "",
        appointmentStatus: "",
        noOfYearsExp: "",
      },
      {
        company: "",
        position: "",
        inclusiveDates: "",
        monthlySalary: "",
        appointmentStatus: "",
        noOfYearsExp: "",
      },
    ];

  // ── Persistence & Auto-save ──
  
  // Handle data loading and course parameter from URL
  useEffect(() => {
    const draft = loadLocalProfile(user?.id);
    const searchParams = new URLSearchParams(window.location.search);
    const urlCourse = searchParams.get('course');
    const fromProfile = searchParams.get('from') === 'profile';
    
    const buildInitialFromAuth = () => {
      const userName = user?.name || "";
      const nameParts = userName.split(" ");
      let initialData = {
        ...formData,
        traineeEmail: user?.email || "",
        firstName: nameParts[0] || "",
        lastName: nameParts.length > 1 ? nameParts.slice(1).join(" ") : "",
      };

      if (draft) {
        const meaningfulDraft = Object.fromEntries(
          Object.entries(draft).filter(([_, v]) => v !== "" && v !== null && v !== undefined),
        );
        initialData = { ...initialData, ...meaningfulDraft };
      }

      if (urlCourse) {
        initialData.courseSlug = urlCourse;
      }

      const completed = maxCompletedRegistrationStep(initialData);
      const visited = loadRegistrationMaxStep(user?.id);
      return {
        data: initialData as Enrollment,
        completed,
        visited,
      };
    };

    const applyInitial = (
      initialData: Enrollment,
      completed: number,
      visited: number,
    ) => {
      setFormData(initialData);
      setIsLoaded(true);
      if (completed >= 3) {
        setCurrentStep(4);
      } else if (visited >= 1 && visited <= 3) {
        setCurrentStep(visited);
      }
    };

    const { data: quickData, completed: quickCompleted, visited: quickVisited } =
      buildInitialFromAuth();
    applyInitial(quickData, quickCompleted, quickVisited);
  }, [user?.email, user?.id, user?.name]);

  useEffect(() => {
    if (!cloudProfile) return;

    const searchParams = new URLSearchParams(window.location.search);
    const fromProfile = searchParams.get("from") === "profile";
    const dbData = cloudProfile as Enrollment;
    if (!fromProfile && enrollmentBlocksNewCourseApplication(dbData.status)) {
      toast({
        title: "Active Enrollment",
        description:
          "You already have an active application. Please complete or cancel it first.",
        variant: "destructive",
      });
      setLocation("/trainee/application");
      return;
    }

    const cleanDbData = Object.fromEntries(
      Object.entries(dbData).filter(
        ([k, v]) =>
          v !== null &&
          v !== undefined &&
          v !== "" &&
          v !== "null" &&
          !["id", "status", "createdAt"].includes(k),
      ),
    );

    setFormData((prev) => {
      const merged = { ...prev, ...cleanDbData } as Enrollment;
      const completed = maxCompletedRegistrationStep(merged);
      if (completed >= 3) {
        setCurrentStep(4);
      }
      return merged;
    });
  }, [cloudProfile, setLocation, toast]);

  // Auto-save fields for steps the user has reached (including partial step data)
  useEffect(() => {
    if (isLoaded) {
      const persistStep = resolveRegistrationPersistStep(formData, currentStep, user?.id);
      saveRegistrationMaxStep(persistStep, user?.id);
      saveLocalProfile(
        buildRegistrationDraft(formData, persistStep, { authEmail: user?.email }),
        user?.id,
      );
    }
    // Expose formData to window for Playwright debugging in test mode
    if (import.meta.env.DEV && localStorage.getItem("TEST_MODE") === "true") {
      (window as any).formData = formData;
    }
  }, [formData, isLoaded, currentStep, user?.email]);

  const stepProgress = Math.round((currentStep / STEPS.length) * 100);

  const updateForm = useCallback((updates: Partial<typeof formData>) => {
    setFormData(prev => ({ ...prev, ...updates }));
  }, []);

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    
    setFormData(prev => {
      const next = { ...prev, [name]: value };
      // Auto-sync traineeName for printable forms
      if (['firstName', 'middleName', 'lastName'].includes(name)) {
        next.traineeName = `${next.firstName || ''} ${next.middleName || ''} ${next.lastName || ''}`.trim().replace(/\s+/g, ' ');
      }
      return next;
    });
  }, []);

  const isStepValid = () => {
    if (currentStep === 1) return isRegistrationStepComplete(1, formData);
    if (currentStep === 2) return isRegistrationStepComplete(2, formData);
    if (currentStep === 3) return isRegistrationStepComplete(3, formData);
    return true;
  };

  const persistDraft = (maxStep: number) => {
    const capped = Math.min(3, Math.max(0, maxStep));
    saveRegistrationMaxStep(capped, user?.id);
    saveLocalProfile(
      buildRegistrationDraft(formData, capped, { authEmail: user?.email }),
      user?.id,
    );
  };

  const syncProfileToCloud = async (
    maxStep: number,
  ): Promise<{ success: boolean; error?: string }> => {
    if (!user?.email) return { success: true };
    const payload = buildRegistrationCloudPayload(formData, maxStep, {
      authEmail: user.email,
    });
    const result = await registerTraineeFromForm(
      prepareEnrollmentForInsforge({ ...payload, status: "ready_to_apply" }, user.email),
      user.id,
    );
    if (!result.success) {
      console.error("[Registration] Cloud sync failed:", result.error);
    }
    return result;
  };

  const nextStep = async () => {
    if (!isStepValid()) {
      let errorMessage = "Please fill in all required fields to continue.";
      if (currentStep === 1) errorMessage = "Please fill in all identity details.";
      else if (currentStep === 2) errorMessage = "Please provide contact and complete address.";
      else if (currentStep === 3) errorMessage = "Please provide your educational background.";

      toast({
        title: "Required Info Missing",
        description: errorMessage,
        variant: "destructive",
      });
      return;
    }

    // Auto-save to cloud as "ready_to_apply" once basic profile (Step 1-3) is complete
    if (currentStep === 3 && user?.email) {
      const partial = await registerTraineeFromForm(
        prepareEnrollmentForInsforge({ ...formData, status: "ready_to_apply" }, user.email),
        user.id,
      );
      if (!partial.success) {
        toast({
          title: "Cloud sync issue",
          description: partial.error ?? "Could not save to InsForge. Data is kept on this device.",
          variant: "destructive",
        });
      }
    }

    if (currentStep < 4) {
      const next = currentStep + 1;
      saveRegistrationMaxStep(next, user?.id);
      setCurrentStep(next);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) setCurrentStep(prev => prev - 1);
  };

  const handleSkipForNow = async () => {
    if (currentStep === 1 && !isStepValid()) {
      toast({
        title: "Complete Step 1 First",
        description: "Fill in your identity details before leaving.",
        variant: "destructive",
      });
      return;
    }

    const persistStep = resolveRegistrationPersistStep(formData, currentStep, user?.id);
    if (persistStep === 0) {
      toast({
        title: "Complete Step 1 First",
        description: "Fill in your identity details before leaving.",
        variant: "destructive",
      });
      return;
    }

    persistDraft(persistStep);

    if (isRegistrationStepComplete(1, formData)) {
      const { success, error } = await syncProfileToCloud(persistStep);
      if (success) {
        toast({
          title: "Profile synced",
          description: "Your registration is saved to the cloud. You can continue anytime from Profile.",
        });
      } else {
        toast({
          title: "Saved on this device only",
          description:
            error ?? "Cloud sync failed. Your entries are kept locally — try again from Profile.",
          variant: "destructive",
        });
      }
    }

    markRegistrationPartial();
    setLocation("/trainee");
  };

  const handleSaveAndExit = async () => {
    if (currentStep === 1 && !isStepValid()) {
      toast({
        title: "Required Info Missing",
        description: "Please fill in all identity details before saving.",
        variant: "destructive",
      });
      return;
    }

    const persistStep = resolveRegistrationPersistStep(formData, currentStep, user?.id);
    persistDraft(persistStep);

    if (isRegistrationStepComplete(1, formData)) {
      const { success, error } = await syncProfileToCloud(persistStep);
      if (success) {
        toast({
          title: "Profile synced",
          description: "Your progress is saved to InsForge.",
        });
      } else {
        toast({
          title: "Saved on this device only",
          description: error ?? "Cloud sync failed. Try again from Profile.",
          variant: "destructive",
        });
      }
    }

    markRegistrationPartial();
    setLocation("/trainee");
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    
    try {
      // Formalize the status to "ready_to_apply" upon profile completion
      const submissionData = { ...formData, status: "ready_to_apply" as const };
      const { success, error } = await registerTraineeFromForm(submissionData, user?.id);
      if (!success) {
        throw new Error(error || "Failed to register");
      }

      // Ensure data is saved as a permanent pre-filled profile
      setFormData(submissionData);
      saveLocalProfile(
        buildRegistrationDraft(submissionData, 3, { authEmail: user?.email }),
        user?.id,
      );
      
      completeRegistration();
      setIsFinished(true);
      
      toast({
        title: "Registration Complete!",
        description: "Your info is now saved and pre-filled for future applications.",
      });
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Cloud sync failed";
      toast({
        title: "Cloud sync failed",
        description: message,
        variant: "destructive",
      });
      console.error("[Registration] Enrollment sync error:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDownloadExcel = () => {
    exportSingleTraineeToExcel(formData as any);
  };

  const handleDownloadWord = () => {
    exportSingleTraineeToWord(formData as any);
  };

  const stepVariants = {
    hidden: { opacity: 0, x: 4 },
    visible: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -4 }
  };

  if (isFinished) {
    const courseSlug = formData.courseSlug?.trim();
    const primaryHref = courseSlug
      ? `/trainee/enroll?course=${encodeURIComponent(courseSlug)}`
      : "/trainee/application";
    const primaryLabel = courseSlug
      ? "Continue course application"
      : "Browse courses & apply";

    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.2, ease: "easeOut" }}
          className="max-w-md w-full"
        >
          <div className="text-center">
            <div className="w-12 h-12 bg-primary rounded-2xl flex items-center justify-center mx-auto mb-6">
              <CheckCircle2 className="h-6 w-6 text-primary-foreground" />
            </div>
            <h1 className="text-3xl font-black text-foreground tracking-tight mb-3 uppercase">
              Profile saved
            </h1>
            <p className="text-muted-foreground text-sm leading-relaxed mb-6 font-medium">
              Your TESDA learner profile is on file. This is not a course enrollment yet — choose a
              program next to submit an application.
            </p>

            <div className="rounded-2xl border border-border bg-card p-4 text-left mb-8 space-y-3">
              <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                What happens next
              </p>
              <ol className="space-y-2 text-sm text-foreground list-none">
                <li className="flex gap-2">
                  <span className="font-bold text-primary shrink-0">1.</span>
                  <span>
                    <strong className="font-semibold">Profile complete</strong> — saved to InsForge
                  </span>
                </li>
                <li className="flex gap-2">
                  <span className="font-bold text-primary shrink-0">2.</span>
                  <span>Pick a course and submit your application</span>
                </li>
                <li className="flex gap-2">
                  <span className="font-bold text-primary shrink-0">3.</span>
                  <span>Track status and print your official form anytime</span>
                </li>
              </ol>
            </div>

            <Button
              className="w-full h-14 bg-primary text-primary-foreground hover:bg-primary/90 rounded-2xl font-black text-[11px] uppercase tracking-widest shadow-xl shadow-muted/30 transition-all active:scale-[0.98]"
              onClick={() => setLocation(primaryHref)}
            >
              {primaryLabel}
              <ArrowRight className="ml-2 h-4 w-4 inline" />
            </Button>

            <Button
              variant="ghost"
              className="w-full h-14 mt-2 text-muted-foreground hover:text-foreground rounded-2xl font-bold text-[11px] uppercase tracking-widest transition-all"
              onClick={() => setLocation("/trainee")}
            >
              Go to dashboard
            </Button>
          </div>
        </motion.div>
      </div>
    );
  }

  if (!isLoaded) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-border border-t-primary rounded-full animate-spin" />
          <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Loading Enrollment Data...</p>
        </div>
      </div>
    );
  }

  if (user && skipsTraineeApplication(user)) {
    return <Redirect to={getRoleHomePath(user.role)} />;
  }

  return (
    <div className="min-h-screen bg-background flex flex-col md:flex-row font-sans text-foreground selection:bg-primary selection:text-primary-foreground">
      {/* Sidebar */}
      <div className="w-full md:w-80 bg-card md:fixed md:h-full flex flex-col border-r border-border z-10">
        <div className="p-8 pb-4">
          <div className="flex items-center gap-3 mb-10">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <GraduationCap className="h-4 w-4 text-white" />
            </div>
            <h1 className="text-sm font-black tracking-tight text-foreground uppercase">Lista</h1>
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
                  isActive ? 'bg-muted/50 text-foreground' : 
                  isCompleted ? 'hover:bg-muted/50 text-muted-foreground hover:text-foreground' : 'text-muted-foreground/60 cursor-not-allowed'
                }`}
                onClick={() => step.id < currentStep && setCurrentStep(step.id)}
                disabled={step.id > currentStep}
              >
                <div className={`flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center border text-[11px] font-bold transition-colors ${
                  isActive ? 'bg-primary border-primary text-white' : 
                  isCompleted ? 'bg-muted/50 text-foreground border-border group-hover:border-border' : 
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
            onClick={handleSaveAndExit}
           >
             <ArrowLeft className="h-4 w-4" /> Save & Exit
           </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 md:ml-80 flex flex-col min-h-screen bg-white">
         <div className="flex-1 p-6 md:p-12 lg:p-20 max-w-4xl w-full">
            <div className="mb-12">
               <motion.div
                 initial={{ opacity: 0, x: -4 }}
                 animate={{ opacity: 1, x: 0 }}
                 key={`title-${currentStep}`}
                 transition={{ duration: 0.2 }}
               >
                 <div className="flex items-center gap-2 mb-4">
                   <span className="text-[10px] font-black text-foreground bg-muted px-2 py-0.5 rounded uppercase tracking-wider">Step 0{currentStep}</span>
                   <div className="h-px w-8 bg-border" />
                   <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Registry Flow</span>
                 </div>
                 <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-foreground tracking-tight leading-none mb-4">{STEPS.find(s => s.id === currentStep)?.title}</h2>
                 <p className="text-base sm:text-lg text-muted-foreground font-medium max-w-md leading-relaxed">{STEPS.find(s => s.id === currentStep)?.description}. Please provide accurate information as per your official documents.</p>
               </motion.div>
               
               {/* Mobile progress bar */}
               <div className="md:hidden w-32">
                  <div className="flex justify-between text-[10px] font-bold mb-1 uppercase tracking-wider">
                    <span>Progress</span>
                    <span>{stepProgress}%</span>
                  </div>
                  <div className="h-1 bg-muted rounded-full overflow-hidden">
                    <div className="h-full bg-primary" style={{ width: `${stepProgress}%` }} />
                  </div>
               </div>
            </div>

            <div className="mt-12">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={currentStep}
                    variants={stepVariants}
                    initial="hidden"
                    animate="visible"
                    exit="exit"
                    transition={{ duration: 0.15, ease: "easeOut" }}
                    className="space-y-12"
                  >
                    {currentStep === 1 && (
                      <div className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                          <div className="space-y-2">
                            <label className="text-xs font-semibold text-foreground/90">First Name</label>
                            <Input 
                               name="firstName"
                               className="h-10 border-border focus:border-primary focus:ring-ring rounded-md"
                               placeholder="Given name"
                               value={formData.firstName} 
                               onChange={handleChange} 
                             />
                          </div>
                          <div className="space-y-2">
                            <label className="text-xs font-semibold text-foreground/90">Middle Name</label>
                            <Input 
                               name="middleName"
                               className="h-10 border-border focus:border-primary focus:ring-ring rounded-md"
                               placeholder="Optional"
                               value={formData.middleName} 
                               onChange={handleChange} 
                             />
                          </div>
                          <div className="space-y-2">
                            <label className="text-xs font-semibold text-foreground/90">Last Name</label>
                            <Input 
                               name="lastName"
                               className="h-10 border-border focus:border-primary focus:ring-ring rounded-md"
                               placeholder="Surname"
                               value={formData.lastName} 
                               onChange={handleChange} 
                             />
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                          <div className="space-y-2">
                            <label className="text-xs font-semibold text-foreground/90">Name Extension</label>
                            <Input 
                              name="extensionName"
                              className="h-10 border-border focus:border-primary focus:ring-ring rounded-md"
                              placeholder="e.g., Jr., Sr., III" 
                              value={formData.extensionName} 
                              onChange={handleChange} 
                            />
                          </div>
                          <div className="space-y-2">
                            <label className="text-xs font-semibold text-foreground/90">Nationality</label>
                            <Input 
                              name="nationality"
                              className="h-10 border-border focus:border-primary focus:ring-ring rounded-md"
                              placeholder="e.g., Filipino"
                              value={formData.nationality} 
                              onChange={handleChange} 
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                          <div className="space-y-2">
                            <label className="text-xs font-semibold text-foreground/90">Date of Birth</label>
                            <Input 
                              name="dob"
                              type="date" 
                              className="h-10 border-border focus:border-primary focus:ring-ring rounded-md"
                              value={formData.dob} 
                              onChange={(e) => {
                                const dob = e.target.value;
                                const birthDate = new Date(dob);
                                const today = new Date();
                                let age = today.getFullYear() - birthDate.getFullYear();
                                const m = today.getMonth() - birthDate.getMonth();
                                if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) age--;
                                updateForm({ dob, age: Math.max(0, age) });
                              }} 
                            />
                          </div>
                          <div className="space-y-2">
                            <label className="text-xs font-semibold text-foreground/90">Age</label>
                            <div className="h-10 flex items-center px-3 bg-muted/50 border border-border rounded-md text-sm text-muted-foreground">
                              {formData.age || '0'} years
                            </div>
                          </div>
                          <div className="space-y-2">
                            <label className="text-xs font-semibold text-foreground/90">Birth Place</label>
                            <Input 
                              className="h-10 border-border focus:border-primary focus:ring-ring rounded-md"
                              placeholder="City/Province" 
                              value={formData.birthPlace} 
                              onChange={e => updateForm({ birthPlace: e.target.value })} 
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                          <div className="space-y-2">
                            <label className="text-xs font-semibold text-foreground/90">Gender</label>
                            <div className="flex gap-2 p-1 bg-muted rounded-md border border-border">
                              {['Male', 'Female'].map((g) => (
                                <button
                                  key={g}
                                  type="button"
                                  onClick={() => updateForm({ gender: g as any })}
                                  className={`flex-1 h-8 rounded-sm text-xs font-medium transition-all ${
                                    formData.gender === g 
                                      ? 'bg-white text-foreground shadow-sm' 
                                      : 'text-muted-foreground hover:text-foreground/90'
                                  }`}
                                >
                                  {g}
                                </button>
                              ))}
                            </div>
                          </div>
                          <div className="space-y-2">
                            <label className="text-xs font-semibold text-foreground/90">Civil Status</label>
                            <Select value={formData.civilStatus} onValueChange={val => updateForm({ civilStatus: val as any })}>
                              <SelectTrigger className="h-10 border-border focus:ring-ring rounded-md">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent className="rounded-md">
                                <SelectItem value="Single">Single</SelectItem>
                                <SelectItem value="Married">Married</SelectItem>
                                <SelectItem value="Widowed">Widowed</SelectItem>
                                <SelectItem value="Separated">Separated</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                      </div>
                    )}

                    {currentStep === 2 && (
                      <div className="space-y-5">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                          <div className="space-y-2">
                            <label className="text-xs font-semibold text-foreground/90">Mobile Number</label>
                            <Input name="mobileNumber" className="h-10 border-border rounded-md" placeholder="09XX-XXX-XXXX" value={formData.mobileNumber} onChange={handleChange} />
                          </div>
                          <div className="space-y-2">
                            <label className="text-xs font-semibold text-foreground/90">Telephone</label>
                            <Input name="telephone" className="h-10 border-border rounded-md" placeholder="(088) XXX-XXXX" value={formData.telephone} onChange={handleChange} />
                          </div>
                          <div className="space-y-2">
                            <label className="text-xs font-semibold text-foreground/90">Email</label>
                            <Input name="traineeEmail" className="h-10 border-border rounded-md" type="email" value={formData.traineeEmail} onChange={handleChange} />
                          </div>
                        </div>
                        <div className="border-t border-border pt-5 mt-2">
                          <h4 className="text-sm font-semibold text-foreground mb-4">Complete Mailing Address</h4>
                          <div className="space-y-5">
                            <div className="space-y-2">
                              <label className="text-xs font-semibold text-foreground/90">House No. / Street / Purok</label>
                              <Input name="homeAddress" className="h-10 border-border rounded-md" placeholder="e.g., Purok 3, Mahogany Street" value={formData.homeAddress} onChange={handleChange} />
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                              <div className="space-y-2">
                                <label className="text-xs font-semibold text-foreground/90">Barangay</label>
                                <Input name="barangay" className="h-10 border-border rounded-md" placeholder="e.g., Barangay 24-A" value={formData.barangay} onChange={handleChange} />
                              </div>
                              <div className="space-y-2">
                                <label className="text-xs font-semibold text-foreground/90">District</label>
                                <Input name="district" className="h-10 border-border rounded-md" placeholder="e.g., District 1" value={formData.district} onChange={handleChange} />
                              </div>
                              <div className="space-y-2">
                                <label className="text-xs font-semibold text-foreground/90">Zip Code</label>
                                <Input name="zipCode" className="h-10 border-border rounded-md" value={formData.zipCode} onChange={handleChange} />
                              </div>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                              <div className="space-y-2">
                                <label className="text-xs font-semibold text-foreground/90">City/Municipality</label>
                                <Input className="h-10 border-border rounded-md" placeholder="e.g., Gingoog City" value={formData.city} onChange={e => updateForm({ city: e.target.value })} />
                              </div>
                              <div className="space-y-2">
                                <label className="text-xs font-semibold text-foreground/90">Province</label>
                                <Input className="h-10 border-border rounded-md" placeholder="e.g., Misamis Oriental" value={formData.province} onChange={e => updateForm({ province: e.target.value })} />
                              </div>
                              <div className="space-y-2">
                                <label className="text-xs font-semibold text-foreground/90">Region</label>
                                <Select value={formData.region} onValueChange={val => updateForm({ region: val })}>
                                  <SelectTrigger className="h-10 border-border rounded-md"><SelectValue /></SelectTrigger>
                                  <SelectContent className="rounded-md">
                                    <SelectItem value="Region I — Ilocos">Region I — Ilocos</SelectItem>
                                    <SelectItem value="Region II — Cagayan Valley">Region II — Cagayan Valley</SelectItem>
                                    <SelectItem value="Region III — Central Luzon">Region III — Central Luzon</SelectItem>
                                    <SelectItem value="Region IV-A — CALABARZON">Region IV-A — CALABARZON</SelectItem>
                                    <SelectItem value="Region IV-B — MIMAROPA">Region IV-B — MIMAROPA</SelectItem>
                                    <SelectItem value="Region V — Bicol">Region V — Bicol</SelectItem>
                                    <SelectItem value="Region VI — Western Visayas">Region VI — Western Visayas</SelectItem>
                                    <SelectItem value="Region VII — Central Visayas">Region VII — Central Visayas</SelectItem>
                                    <SelectItem value="Region VIII — Eastern Visayas">Region VIII — Eastern Visayas</SelectItem>
                                    <SelectItem value="Region IX — Zamboanga Peninsula">Region IX — Zamboanga Peninsula</SelectItem>
                                    <SelectItem value="Region X — Northern Mindanao">Region X — Northern Mindanao</SelectItem>
                                    <SelectItem value="Region XI — Davao">Region XI — Davao</SelectItem>
                                    <SelectItem value="Region XII — SOCCSKSARGEN">Region XII — SOCCSKSARGEN</SelectItem>
                                    <SelectItem value="Region XIII — Caraga">Region XIII — Caraga</SelectItem>
                                    <SelectItem value="NCR — National Capital Region">NCR</SelectItem>
                                    <SelectItem value="CAR — Cordillera">CAR</SelectItem>
                                    <SelectItem value="BARMM">BARMM</SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {currentStep === 3 && (
                      <div className="space-y-6">
                        <div>
                          <h4 className="text-sm font-semibold text-foreground mb-4">Educational Background</h4>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                            <div className="space-y-2">
                              <label className="text-xs font-semibold text-foreground/90">Highest Education</label>
                              <Select value={formData.education} onValueChange={val => updateForm({ education: val })}>
                                <SelectTrigger className="h-10 border-border rounded-md"><SelectValue /></SelectTrigger>
                                <SelectContent className="rounded-md">
                                  <SelectItem value="Elementary Graduate">Elementary Graduate</SelectItem>
                                  <SelectItem value="High School Graduate">High School Graduate</SelectItem>
                                  <SelectItem value="Senior High School Graduate">Senior High School Graduate</SelectItem>
                                  <SelectItem value="College Level">College Level</SelectItem>
                                  <SelectItem value="College Graduate">College Graduate</SelectItem>
                                  <SelectItem value="TVET Graduate">TVET Graduate</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                            <div className="space-y-2">
                              <label className="text-xs font-semibold text-foreground/90">Year Graduated</label>
                              <Input name="yearGraduated" className="h-10 border-border rounded-md" placeholder="e.g., 2020" value={formData.yearGraduated} onChange={handleChange} />
                            </div>
                          </div>
                          <div className="space-y-2 mt-5">
                            <label className="text-xs font-semibold text-foreground/90">School Last Attended</label>
                            <Input name="schoolLastAttended" className="h-10 border-border rounded-md" placeholder="Complete school name" value={formData.schoolLastAttended} onChange={handleChange} />
                          </div>
                        </div>

                        <div className="border-t border-border pt-5">
                          <h4 className="text-sm font-semibold text-foreground mb-4">Employment Status</h4>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                            <div className="space-y-2">
                              <label className="text-xs font-semibold text-foreground/90">Current Status</label>
                              <Select value={formData.employmentStatus} onValueChange={val => updateForm({ employmentStatus: val as any })}>
                                <SelectTrigger className="h-10 border-border rounded-md"><SelectValue /></SelectTrigger>
                                <SelectContent className="rounded-md">
                                  <SelectItem value="Unemployed">Unemployed</SelectItem>
                                  <SelectItem value="Underemployed">Underemployed</SelectItem>
                                  <SelectItem value="Employed (seeking skills upgrade)">Employed (seeking skills upgrade)</SelectItem>
                                  <SelectItem value="Student">Student</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                            <div className="space-y-2">
                              <label className="text-xs font-semibold text-foreground/90">Employment Type</label>
                              <Select value={formData.employmentType} onValueChange={val => updateForm({ employmentType: val })}>
                                <SelectTrigger className="h-10 border-border rounded-md"><SelectValue placeholder="If employed..." /></SelectTrigger>
                                <SelectContent className="rounded-md">
                                  <SelectItem value="Casual">Casual</SelectItem>
                                  <SelectItem value="Contractual">Contractual</SelectItem>
                                  <SelectItem value="Job Order">Job Order</SelectItem>
                                  <SelectItem value="Probationary">Probationary</SelectItem>
                                  <SelectItem value="Permanent">Permanent</SelectItem>
                                  <SelectItem value="Self-Employed">Self-Employed</SelectItem>
                                  <SelectItem value="OFW">OFW</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                          </div>
                          <div className="space-y-2 mt-5">
                            <label className="text-xs font-semibold text-foreground/90">Company Name</label>
                            <Input className="h-10 border-border rounded-md" placeholder="Employer/Company name (if applicable)" value={formData.companyName} onChange={e => updateForm({ companyName: e.target.value })} />
                          </div>
                        </div>

                        <div className="border-t border-border pt-5">
                          <h4 className="text-sm font-semibold text-foreground mb-1">Work Experience</h4>
                          <p className="text-[10px] text-muted-foreground mb-4">List up to 3 relevant work experiences</p>
                          <div className="space-y-4">
                            {[0, 1, 2].map((i) => (
                              <div key={i} className="p-3 border border-border rounded-md bg-muted/50/50 space-y-3">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                  <Input 
                                    className="h-9 text-sm bg-white" placeholder="Company Name" 
                                    value={workExperienceRows[i].company}
                                    onChange={e => {
                                      const newExp = [...workExperienceRows];
                                      newExp[i] = { ...newExp[i], company: e.target.value };
                                      updateForm({ workExperience: newExp });
                                    }}
                                  />
                                  <Input 
                                    className="h-9 text-sm bg-white" placeholder="Position" 
                                    value={workExperienceRows[i].position}
                                    onChange={e => {
                                      const newExp = [...workExperienceRows];
                                      newExp[i] = { ...newExp[i], position: e.target.value };
                                      updateForm({ workExperience: newExp });
                                    }}
                                  />
                                </div>
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                                  <Input 
                                    className="h-9 text-xs bg-white" placeholder="Dates (e.g., 2020-2022)" 
                                    value={workExperienceRows[i].inclusiveDates}
                                    onChange={e => {
                                      const newExp = [...workExperienceRows];
                                      newExp[i] = { ...newExp[i], inclusiveDates: e.target.value };
                                      updateForm({ workExperience: newExp });
                                    }}
                                  />
                                  <Input 
                                    className="h-9 text-xs bg-white" placeholder="Salary" 
                                    value={workExperienceRows[i].monthlySalary}
                                    onChange={e => {
                                      const newExp = [...workExperienceRows];
                                      newExp[i] = { ...newExp[i], monthlySalary: e.target.value };
                                      updateForm({ workExperience: newExp });
                                    }}
                                  />
                                  <Input 
                                    className="h-9 text-xs bg-white" placeholder="Status" 
                                    value={workExperienceRows[i].appointmentStatus}
                                    onChange={e => {
                                      const newExp = [...workExperienceRows];
                                      newExp[i] = { ...newExp[i], appointmentStatus: e.target.value };
                                      updateForm({ workExperience: newExp });
                                    }}
                                  />
                                  <Input 
                                    className="h-9 text-xs bg-white" placeholder="Years" 
                                    value={workExperienceRows[i].noOfYearsExp}
                                    onChange={e => {
                                      const newExp = [...workExperienceRows];
                                      newExp[i] = { ...newExp[i], noOfYearsExp: e.target.value };
                                      updateForm({ workExperience: newExp });
                                    }}
                                  />
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}

                    {currentStep === 4 && (
                      <div className="space-y-6">
                        <div className="border border-border rounded-lg overflow-hidden bg-muted/50">
                          <div className="bg-muted px-4 py-3 border-b border-border">
                            <h3 className="text-sm font-semibold text-foreground">Review Information</h3>
                          </div>
                          <div className="p-4 grid grid-cols-1 sm:grid-cols-2 gap-y-4 gap-x-6 text-sm">
                            <div>
                              <span className="block text-xs text-muted-foreground mb-1">Full Name</span>
                              <span className="font-medium text-foreground">{formData.lastName}, {formData.firstName} {formData.middleName} {formData.extensionName}</span>
                            </div>
                            <div>
                              <span className="block text-xs text-muted-foreground mb-1">Date of Birth</span>
                              <span className="font-medium text-foreground">{formData.dob} ({formData.age} yrs)</span>
                            </div>
                            <div>
                              <span className="block text-xs text-muted-foreground mb-1">ULI</span>
                              <span className="font-mono font-medium text-foreground">{formData.uli || "NEW LEARNER"}</span>
                            </div>
                            <div>
                              <span className="block text-xs text-muted-foreground mb-1">Email</span>
                              <span className="font-medium text-foreground">{formData.traineeEmail}</span>
                            </div>
                            <div className="sm:col-span-2">
                              <span className="block text-xs text-muted-foreground mb-1">Address</span>
                              <span className="font-medium text-foreground">{formData.homeAddress}, {formData.barangay}, {formData.city}</span>
                            </div>
                          </div>
                        </div>

                        <label className="flex items-start gap-3 p-6 border border-border rounded-3xl cursor-pointer hover:bg-muted/50 transition-colors">
                          <Checkbox 
                            className="mt-0.5 border-border data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                            checked={formData.consent} 
                            onCheckedChange={(checked) => updateForm({ consent: checked as boolean })}
                          />
                          <p className="text-[13px] text-muted-foreground font-medium leading-relaxed">
                            I certify that the information above is true and correct, and I consent to the processing of my data for TESDA T2MIS registration in accordance with the Data Privacy Act of 2012.
                          </p>
                        </label>
                      </div>
                    )}

                    <div className="flex flex-col-reverse sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4 pt-8 sm:pt-12 border-t border-border/50 max-md:sticky max-md:bottom-0 max-md:z-20 max-md:bg-white max-md:py-4 max-md:pb-[max(1rem,env(safe-area-inset-bottom))] max-md:-mx-4 max-md:px-4 max-md:border-t max-md:shadow-[0_-8px_24px_rgba(0,0,0,0.06)]">
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

                      {currentStep > 1 && (
                        <Button 
                          variant="ghost" 
                          className="h-14 px-6 text-muted-foreground hover:text-foreground font-bold text-[11px] uppercase tracking-widest rounded-2xl hidden sm:flex" 
                          onClick={handleSkipForNow}
                        >
                          Skip for now
                        </Button>
                      )}

                      {currentStep < 4 ? (
                        <Button 
                          className={cn(
                            "h-14 w-full sm:w-auto px-8 sm:px-12 rounded-2xl font-black text-[11px] uppercase tracking-widest transition-all",
                            isStepValid() 
                              ? "bg-primary text-white hover:bg-primary/90 shadow-xl shadow-muted/30 active:scale-[0.98]" 
                              : "bg-muted text-muted-foreground cursor-not-allowed opacity-50"
                          )}
                          disabled={!isStepValid()}
                          onClick={nextStep}
                        >
                          Continue <ArrowRight className="ml-2 h-3.5 w-3.5" />
                        </Button>
                      ) : (
                        <Button 
                          className="h-14 w-full sm:w-auto px-8 sm:px-12 bg-primary text-white hover:bg-primary/90 rounded-2xl font-black text-[11px] uppercase tracking-widest shadow-xl shadow-muted/30 transition-all active:scale-[0.98]" 
                          onClick={handleSubmit}
                          disabled={!formData.consent || isSubmitting}
                        >
                          {isSubmitting ? "Processing..." : "Complete Registration"}
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
