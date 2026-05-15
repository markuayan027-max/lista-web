import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useLocation } from "wouter";
import { useAuth } from "@/context/auth-context";
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
import { courses, type Enrollment } from "@/lib/institutional-data";
import { exportSingleTraineeToExcel, exportSingleTraineeToWord } from "@/lib/export-utils";
import { fetchTraineeEnrollmentByEmail, registerTraineeFromForm } from "@/lib/trainee-enrollment-insforge";
import { 
  saveLocalProfile, 
  loadLocalProfile, 
  clearLocalProfile
} from "@/lib/profile-utils";

const STEPS = [
  { id: 1, title: "Personal", description: "Identity details", icon: User },
  { id: 2, title: "Contact", description: "Reach details", icon: MapPin },
  { id: 3, title: "Profile", description: "Education & Work", icon: GraduationCap },
  { id: 4, title: "Review", description: "Confirmation", icon: CheckCircle2 },
];

export default function TraineeRegistrationPage() {
  const { user, completeRegistration } = useAuth();
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
    city: "Gingoog City",
    province: "Misamis Oriental",
    region: "Region X — Northern Mindanao",
    zipCode: "9014",
    
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
    const draft = loadLocalProfile();
    const searchParams = new URLSearchParams(window.location.search);
    const urlCourse = searchParams.get('course');
    
    const fetchExistingProfile = async () => {
      // Step 1: Initialize with defaults from auth
      const userName = user?.name || "";
      const nameParts = userName.split(' ');
      let initialData = { 
        ...formData,
        traineeEmail: user?.email || "",
        firstName: nameParts[0] || "",
        lastName: nameParts.length > 1 ? nameParts.slice(1).join(' ') : "",
      };

      // Step 2: Try to fetch from database if user is logged in
      if (user?.email) {
        try {
          const data = await fetchTraineeEnrollmentByEmail(user.email!);
          if (data.success && data.data) {
            const dbData = data.data as unknown as Enrollment;
            
            // Check if user has an active enrollment (blocking ones)
            const status = String(dbData.status).toLowerCase();
            // We allow 'ready_to_apply' to be resumed/updated
            if (!["completed", "cancelled", "rejected", "ready_to_apply"].includes(status)) {
              toast({ title: "Active Enrollment", description: "You already have an active application. Please complete or cancel it first.", variant: "destructive" });
              setLocation("/trainee/application");
              return;
            }

            // Clean up DB data - ONLY merge fields that actually have content
            const cleanDbData = Object.fromEntries(
              Object.entries(dbData).filter(([k, v]) => 
                v !== null && v !== undefined && v !== "" && v !== "null" &&
                !["id", "status", "createdAt"].includes(k)
              )
            );

            initialData = {
              ...initialData,
              ...cleanDbData,
            };
          }
        } catch (error) {
          console.error("Error fetching database profile:", error);
        }
      }

      // Step 3: Merge with local draft
      // We only let draft fields override if they are NOT empty, 
      // ensuring that a blank draft doesn't wipe out the Profile data fetched from DB.
      if (draft) {
        const meaningfulDraft = Object.fromEntries(
          Object.entries(draft).filter(([_, v]) => v !== "" && v !== null && v !== undefined)
        );
        initialData = { ...initialData, ...meaningfulDraft };
      }

      // Step 4: URL course parameter takes priority
      if (urlCourse) {
        initialData.courseSlug = urlCourse;
      }

      // Step 5: Update state and mark as loaded
      setFormData(initialData as Enrollment);
      setIsLoaded(true);

      // Step 6: Smart Step Navigation
      // Check if Step 1-3 (Personal/Contact/Education) are already satisfied
      const s1Valid = !!(initialData.firstName && initialData.lastName && initialData.dob && initialData.birthPlace);
      const s2Valid = !!(initialData.mobileNumber && initialData.homeAddress && initialData.barangay);
      const s3Valid = !!(initialData.schoolLastAttended && initialData.yearGraduated);

      if (s1Valid && s2Valid && s3Valid) {
        // If they have a course intent (from URL or saved), go to Step 4 (Program Selection/Confirmation)
        if (urlCourse || initialData.courseSlug) {
          setCurrentStep(4);
        } else {
          // If no course but profile is done, start at Step 4 anyway
          setCurrentStep(4);
        }
      }
    };

    fetchExistingProfile();
  }, [user?.email]);

  // Auto-save whenever formData changes, but ONLY after initial load is complete
  useEffect(() => {
    if (isLoaded) {
      saveLocalProfile(formData);
    }
    // Expose formData to window for Playwright debugging in test mode
    if (localStorage.getItem('TEST_MODE') === 'true') {
      (window as any).formData = formData;
    }
  }, [formData, isLoaded]);

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
    if (currentStep === 1) {
      return !!(formData.firstName && formData.lastName && formData.dob && formData.birthPlace && formData.nationality && formData.gender && formData.civilStatus);
    } else if (currentStep === 2) {
      return !!(formData.mobileNumber && formData.homeAddress && formData.barangay);
    } else if (currentStep === 3) {
      return !!(formData.schoolLastAttended && formData.yearGraduated);
    }
    return true;
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
      try {
        await registerTraineeFromForm({ ...formData, status: "ready_to_apply" }, user.id);
        console.info("Profile partially saved to cloud as 'ready_to_apply'");
      } catch (e) {
        console.warn("Silent partial save failed:", e);
      }
    }

    if (currentStep < 4) setCurrentStep(prev => prev + 1);
  };

  const prevStep = () => {
    if (currentStep > 1) setCurrentStep(prev => prev - 1);
  };

  const handleSkipForNow = () => {
    // Save current progress before skipping
    saveLocalProfile(formData);
    completeRegistration();
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
      saveLocalProfile(submissionData);
      
      completeRegistration();
      setIsFinished(true);
      
      toast({
        title: "Registration Complete!",
        description: "Your info is now saved and pre-filled for future applications.",
      });
    } catch (error: any) {
      toast({
        title: "Cloud Sync Failed",
        description: "Your registration was NOT saved to the cloud. Please check your InsForge connection and policies.",
        variant: "destructive"
      });
      console.error("Enrollment sync error:", error);
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
    return (
      <div className="min-h-screen bg-white flex items-center justify-center p-6">
        <motion.div 
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.2, ease: "easeOut" }}
          className="max-w-md w-full"
        >
          <div className="text-center">
            <div className="w-12 h-12 bg-zinc-900 rounded-2xl flex items-center justify-center mx-auto mb-8">
              <CheckCircle2 className="h-6 w-6 text-white" />
            </div>
            <h1 className="text-3xl font-black text-zinc-900 tracking-tight mb-3 uppercase">Registration Complete</h1>
            <p className="text-zinc-500 text-sm leading-relaxed mb-10 font-medium">
              Your profile information has been securely saved and will be used to pre-fill your course applications.
            </p>

            <Button 
              className="w-full h-14 bg-zinc-900 text-white hover:bg-zinc-800 rounded-2xl font-black text-[11px] uppercase tracking-widest shadow-xl shadow-zinc-100 transition-all active:scale-[0.98]" 
              onClick={() => setLocation("/trainee/application")}
            >
              Browse Available Courses
            </Button>
            
            <Button 
              variant="ghost"
              className="w-full h-14 mt-2 text-zinc-500 hover:text-zinc-900 rounded-2xl font-bold text-[11px] uppercase tracking-widest transition-all" 
              onClick={() => setLocation("/trainee")}
            >
              Go to Dashboard
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
          <div className="w-12 h-12 border-4 border-zinc-100 border-t-zinc-900 rounded-full animate-spin" />
          <p className="text-xs font-bold text-zinc-400 uppercase tracking-widest">Loading Enrollment Data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white flex flex-col md:flex-row font-sans text-zinc-900 selection:bg-zinc-900 selection:text-white">
      {/* Sidebar */}
      <div className="w-full md:w-80 bg-white md:fixed md:h-full flex flex-col border-r border-zinc-100 z-10">
        <div className="p-8 pb-4">
          <div className="flex items-center gap-3 mb-10">
            <div className="w-8 h-8 bg-zinc-900 rounded-lg flex items-center justify-center">
              <GraduationCap className="h-4 w-4 text-white" />
            </div>
            <h1 className="text-sm font-black tracking-tight text-zinc-900 uppercase">Lista</h1>
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
            onClick={handleSkipForNow}
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
                   <span className="text-[10px] font-black text-zinc-900 bg-zinc-100 px-2 py-0.5 rounded uppercase tracking-wider">Step 0{currentStep}</span>
                   <div className="h-px w-8 bg-zinc-200" />
                   <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Registry Flow</span>
                 </div>
                 <h2 className="text-5xl font-black text-zinc-900 tracking-tight leading-none mb-4">{STEPS.find(s => s.id === currentStep)?.title}</h2>
                 <p className="text-lg text-zinc-500 font-medium max-w-md leading-relaxed">{STEPS.find(s => s.id === currentStep)?.description}. Please provide accurate information as per your official documents.</p>
               </motion.div>
               
               {/* Mobile progress bar */}
               <div className="md:hidden w-32">
                  <div className="flex justify-between text-[10px] font-bold mb-1 uppercase tracking-wider">
                    <span>Progress</span>
                    <span>{stepProgress}%</span>
                  </div>
                  <div className="h-1 bg-zinc-100 rounded-full overflow-hidden">
                    <div className="h-full bg-zinc-900" style={{ width: `${stepProgress}%` }} />
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
                            <label className="text-xs font-semibold text-zinc-700">First Name</label>
                            <Input 
                               name="firstName"
                               className="h-10 border-zinc-200 focus:border-zinc-900 focus:ring-zinc-900 rounded-md"
                               placeholder="Given name"
                               value={formData.firstName} 
                               onChange={handleChange} 
                             />
                          </div>
                          <div className="space-y-2">
                            <label className="text-xs font-semibold text-zinc-700">Middle Name</label>
                            <Input 
                               name="middleName"
                               className="h-10 border-zinc-200 focus:border-zinc-900 focus:ring-zinc-900 rounded-md"
                               placeholder="Optional"
                               value={formData.middleName} 
                               onChange={handleChange} 
                             />
                          </div>
                          <div className="space-y-2">
                            <label className="text-xs font-semibold text-zinc-700">Last Name</label>
                            <Input 
                               name="lastName"
                               className="h-10 border-zinc-200 focus:border-zinc-900 focus:ring-zinc-900 rounded-md"
                               placeholder="Surname"
                               value={formData.lastName} 
                               onChange={handleChange} 
                             />
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                          <div className="space-y-2">
                            <label className="text-xs font-semibold text-zinc-700">Name Extension</label>
                            <Input 
                              name="extensionName"
                              className="h-10 border-zinc-200 focus:border-zinc-900 focus:ring-zinc-900 rounded-md"
                              placeholder="e.g., Jr., Sr., III" 
                              value={formData.extensionName} 
                              onChange={handleChange} 
                            />
                          </div>
                          <div className="space-y-2">
                            <label className="text-xs font-semibold text-zinc-700">Nationality</label>
                            <Input 
                              name="nationality"
                              className="h-10 border-zinc-200 focus:border-zinc-900 focus:ring-zinc-900 rounded-md"
                              placeholder="e.g., Filipino"
                              value={formData.nationality} 
                              onChange={handleChange} 
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                          <div className="space-y-2">
                            <label className="text-xs font-semibold text-zinc-700">Date of Birth</label>
                            <Input 
                              name="dob"
                              type="date" 
                              className="h-10 border-zinc-200 focus:border-zinc-900 focus:ring-zinc-900 rounded-md"
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
                            <label className="text-xs font-semibold text-zinc-700">Age</label>
                            <div className="h-10 flex items-center px-3 bg-zinc-50 border border-zinc-200 rounded-md text-sm text-zinc-500">
                              {formData.age || '0'} years
                            </div>
                          </div>
                          <div className="space-y-2">
                            <label className="text-xs font-semibold text-zinc-700">Birth Place</label>
                            <Input 
                              className="h-10 border-zinc-200 focus:border-zinc-900 focus:ring-zinc-900 rounded-md"
                              placeholder="City/Province" 
                              value={formData.birthPlace} 
                              onChange={e => updateForm({ birthPlace: e.target.value })} 
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                          <div className="space-y-2">
                            <label className="text-xs font-semibold text-zinc-700">Gender</label>
                            <div className="flex gap-2 p-1 bg-zinc-100 rounded-md border border-zinc-200">
                              {['Male', 'Female'].map((g) => (
                                <button
                                  key={g}
                                  type="button"
                                  onClick={() => updateForm({ gender: g as any })}
                                  className={`flex-1 h-8 rounded-sm text-xs font-medium transition-all ${
                                    formData.gender === g 
                                      ? 'bg-white text-zinc-900 shadow-sm' 
                                      : 'text-zinc-500 hover:text-zinc-700'
                                  }`}
                                >
                                  {g}
                                </button>
                              ))}
                            </div>
                          </div>
                          <div className="space-y-2">
                            <label className="text-xs font-semibold text-zinc-700">Civil Status</label>
                            <Select value={formData.civilStatus} onValueChange={val => updateForm({ civilStatus: val as any })}>
                              <SelectTrigger className="h-10 border-zinc-200 focus:ring-zinc-900 rounded-md">
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
                            <label className="text-xs font-semibold text-zinc-700">Mobile Number</label>
                            <Input name="mobileNumber" className="h-10 border-zinc-200 rounded-md" placeholder="09XX-XXX-XXXX" value={formData.mobileNumber} onChange={handleChange} />
                          </div>
                          <div className="space-y-2">
                            <label className="text-xs font-semibold text-zinc-700">Telephone</label>
                            <Input name="telephone" className="h-10 border-zinc-200 rounded-md" placeholder="(088) XXX-XXXX" value={formData.telephone} onChange={handleChange} />
                          </div>
                          <div className="space-y-2">
                            <label className="text-xs font-semibold text-zinc-700">Email</label>
                            <Input name="traineeEmail" className="h-10 border-zinc-200 rounded-md" type="email" value={formData.traineeEmail} onChange={handleChange} />
                          </div>
                        </div>
                        <div className="border-t border-zinc-100 pt-5 mt-2">
                          <h4 className="text-sm font-semibold text-zinc-900 mb-4">Complete Mailing Address</h4>
                          <div className="space-y-5">
                            <div className="space-y-2">
                              <label className="text-xs font-semibold text-zinc-700">House No. / Street / Purok</label>
                              <Input name="homeAddress" className="h-10 border-zinc-200 rounded-md" placeholder="e.g., Purok 3, Mahogany Street" value={formData.homeAddress} onChange={handleChange} />
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                              <div className="space-y-2">
                                <label className="text-xs font-semibold text-zinc-700">Barangay</label>
                                <Input name="barangay" className="h-10 border-zinc-200 rounded-md" placeholder="e.g., Barangay 24-A" value={formData.barangay} onChange={handleChange} />
                              </div>
                              <div className="space-y-2">
                                <label className="text-xs font-semibold text-zinc-700">District</label>
                                <Input name="district" className="h-10 border-zinc-200 rounded-md" placeholder="e.g., District 1" value={formData.district} onChange={handleChange} />
                              </div>
                              <div className="space-y-2">
                                <label className="text-xs font-semibold text-zinc-700">Zip Code</label>
                                <Input name="zipCode" className="h-10 border-zinc-200 rounded-md" value={formData.zipCode} onChange={handleChange} />
                              </div>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                              <div className="space-y-2">
                                <label className="text-xs font-semibold text-zinc-700">City/Municipality</label>
                                <Input className="h-10 border-zinc-200 rounded-md" value={formData.city} onChange={e => updateForm({ city: e.target.value })} />
                              </div>
                              <div className="space-y-2">
                                <label className="text-xs font-semibold text-zinc-700">Province</label>
                                <Input className="h-10 border-zinc-200 rounded-md" value={formData.province} onChange={e => updateForm({ province: e.target.value })} />
                              </div>
                              <div className="space-y-2">
                                <label className="text-xs font-semibold text-zinc-700">Region</label>
                                <Select value={formData.region} onValueChange={val => updateForm({ region: val })}>
                                  <SelectTrigger className="h-10 border-zinc-200 rounded-md"><SelectValue /></SelectTrigger>
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
                          <h4 className="text-sm font-semibold text-zinc-900 mb-4">Educational Background</h4>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                            <div className="space-y-2">
                              <label className="text-xs font-semibold text-zinc-700">Highest Education</label>
                              <Select value={formData.education} onValueChange={val => updateForm({ education: val })}>
                                <SelectTrigger className="h-10 border-zinc-200 rounded-md"><SelectValue /></SelectTrigger>
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
                              <label className="text-xs font-semibold text-zinc-700">Year Graduated</label>
                              <Input name="yearGraduated" className="h-10 border-zinc-200 rounded-md" placeholder="e.g., 2020" value={formData.yearGraduated} onChange={handleChange} />
                            </div>
                          </div>
                          <div className="space-y-2 mt-5">
                            <label className="text-xs font-semibold text-zinc-700">School Last Attended</label>
                            <Input name="schoolLastAttended" className="h-10 border-zinc-200 rounded-md" placeholder="Complete school name" value={formData.schoolLastAttended} onChange={handleChange} />
                          </div>
                        </div>

                        <div className="border-t border-zinc-100 pt-5">
                          <h4 className="text-sm font-semibold text-zinc-900 mb-4">Employment Status</h4>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                            <div className="space-y-2">
                              <label className="text-xs font-semibold text-zinc-700">Current Status</label>
                              <Select value={formData.employmentStatus} onValueChange={val => updateForm({ employmentStatus: val as any })}>
                                <SelectTrigger className="h-10 border-zinc-200 rounded-md"><SelectValue /></SelectTrigger>
                                <SelectContent className="rounded-md">
                                  <SelectItem value="Unemployed">Unemployed</SelectItem>
                                  <SelectItem value="Underemployed">Underemployed</SelectItem>
                                  <SelectItem value="Employed (seeking skills upgrade)">Employed (seeking skills upgrade)</SelectItem>
                                  <SelectItem value="Student">Student</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                            <div className="space-y-2">
                              <label className="text-xs font-semibold text-zinc-700">Employment Type</label>
                              <Select value={formData.employmentType} onValueChange={val => updateForm({ employmentType: val })}>
                                <SelectTrigger className="h-10 border-zinc-200 rounded-md"><SelectValue placeholder="If employed..." /></SelectTrigger>
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
                            <label className="text-xs font-semibold text-zinc-700">Company Name</label>
                            <Input className="h-10 border-zinc-200 rounded-md" placeholder="Employer/Company name (if applicable)" value={formData.companyName} onChange={e => updateForm({ companyName: e.target.value })} />
                          </div>
                        </div>

                        <div className="border-t border-zinc-100 pt-5">
                          <h4 className="text-sm font-semibold text-zinc-900 mb-1">Work Experience</h4>
                          <p className="text-[10px] text-zinc-500 mb-4">List up to 3 relevant work experiences</p>
                          <div className="space-y-4">
                            {[0, 1, 2].map((i) => (
                              <div key={i} className="p-3 border border-zinc-200 rounded-md bg-zinc-50/50 space-y-3">
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
                        <div className="border border-zinc-200 rounded-lg overflow-hidden bg-zinc-50">
                          <div className="bg-zinc-100 px-4 py-3 border-b border-zinc-200">
                            <h3 className="text-sm font-semibold text-zinc-900">Review Information</h3>
                          </div>
                          <div className="p-4 grid grid-cols-1 sm:grid-cols-2 gap-y-4 gap-x-6 text-sm">
                            <div>
                              <span className="block text-xs text-zinc-500 mb-1">Full Name</span>
                              <span className="font-medium text-zinc-900">{formData.lastName}, {formData.firstName} {formData.middleName} {formData.extensionName}</span>
                            </div>
                            <div>
                              <span className="block text-xs text-zinc-500 mb-1">Date of Birth</span>
                              <span className="font-medium text-zinc-900">{formData.dob} ({formData.age} yrs)</span>
                            </div>
                            <div>
                              <span className="block text-xs text-zinc-500 mb-1">ULI</span>
                              <span className="font-mono font-medium text-zinc-900">{formData.uli || "NEW LEARNER"}</span>
                            </div>
                            <div>
                              <span className="block text-xs text-zinc-500 mb-1">Email</span>
                              <span className="font-medium text-zinc-900">{formData.traineeEmail}</span>
                            </div>
                            <div className="sm:col-span-2">
                              <span className="block text-xs text-zinc-500 mb-1">Address</span>
                              <span className="font-medium text-zinc-900">{formData.homeAddress}, {formData.barangay}, {formData.city}</span>
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
                            I certify that the information above is true and correct, and I consent to the processing of my data for TESDA T2MIS registration in accordance with the Data Privacy Act of 2012.
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

                      {currentStep > 1 && (
                        <Button 
                          variant="ghost" 
                          className="h-14 px-6 text-zinc-500 hover:text-zinc-900 font-bold text-[11px] uppercase tracking-widest rounded-2xl hidden sm:flex" 
                          onClick={handleSkipForNow}
                        >
                          Skip for now
                        </Button>
                      )}

                      {currentStep < 4 ? (
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
