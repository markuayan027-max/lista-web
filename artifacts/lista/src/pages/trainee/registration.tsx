import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useLocation } from "wouter";
import { useAuth } from "@/context/auth-context";
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
import { courses } from "@/lib/institutional-data";
import { exportSingleTraineeToExcel, exportSingleTraineeToWord } from "@/lib/export-utils";
import { lista } from "@/lib/insforge";
import { 
  saveLocalProfile, 
  loadLocalProfile, 
  clearLocalProfile, 
  calculateProfileCompletion 
} from "@/lib/profile-utils";
import { useEffect } from "react";

const STEPS = [
  { id: 1, title: "Personal", description: "Identity details", icon: User },
  { id: 2, title: "Registry", description: "TESDA records", icon: FileCheck },
  { id: 3, title: "Contact", description: "Reach details", icon: MapPin },
  { id: 4, title: "Profile", description: "Education & Work", icon: GraduationCap },
  { id: 5, title: "Program", description: "Course selection", icon: CalendarDays },
  { id: 6, title: "Materials", description: "Documentation", icon: FileText },
  { id: 7, title: "Review", description: "Confirmation", icon: CheckCircle2 },
];

export default function TraineeRegistrationPage() {
  const { user, completeRegistration } = useAuth();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isFinished, setIsFinished] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  const [formData, setFormData] = useState({
    // ── Name ──
    firstName: user?.name?.split(' ')[0] || "",
    middleName: "",
    lastName: user?.name?.split(' ').slice(1).join(' ') || "",
    extensionName: "",
    
    // ── Birth & Identity ──
    dob: "",
    birthPlace: "",
    age: 0,
    gender: "Male",
    civilStatus: "Single",
    nationality: "Filipino",
    
    // ── TESDA Identifiers ──
    uli: "",
    voucherNo: "",
    psaNo: "",
    
    // ── Classification ──
    learnerClassification: "Student",
    clientType: "TVET Student",
    qualificationType: "Full Qualification",
    
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
    employmentStatus: "Unemployed",
    employmentType: "",
    companyName: "",
    workExperience: [
      { company: "", position: "", inclusiveDates: "", monthlySalary: "", appointmentStatus: "", noOfYearsExp: "" },
      { company: "", position: "", inclusiveDates: "", monthlySalary: "", appointmentStatus: "", noOfYearsExp: "" },
      { company: "", position: "", inclusiveDates: "", monthlySalary: "", appointmentStatus: "", noOfYearsExp: "" }
    ],
    
    // ── Course & Program ──
    courseSlug: "",
    preferredSchedule: "Full Day (8:00 AM – 5:00 PM)",
    enrollmentType: "New Enrollee",
    scholarshipApplication: "Yes, I want to apply for TWSP",
    
    // ── Documents ──
    documents: [],
    
    // ── Meta ──
    refNo: `LISTA-${new Date().getFullYear()}-${Math.floor(10000 + Math.random() * 90000)}`,
    traineeName: user?.name || "",
    status: "pending",
    consent: false,
    createdAt: new Date().toISOString()
  });

  // ── Persistence & Auto-save ──
  
  // Load draft on mount
  useEffect(() => {
    const draft = loadLocalProfile();
    if (draft) {
      setFormData(prev => ({ ...prev, ...draft }));
      toast({
        title: "Draft Restored",
        description: "We've restored your progress from your last visit.",
      });
    }
    setIsLoaded(true);
  }, []);

  // Auto-save whenever formData changes
  useEffect(() => {
    if (isLoaded) {
      saveLocalProfile(formData);
    }
  }, [formData, isLoaded]);

  const completionPercentage = calculateProfileCompletion(formData);

  const updateForm = (updates: Partial<typeof formData>) => {
    setFormData(prev => ({ ...prev, ...updates }));
  };

  const nextStep = () => {
    if (currentStep < 7) setCurrentStep(prev => prev + 1);
  };

  const prevStep = () => {
    if (currentStep > 1) setCurrentStep(prev => prev - 1);
  };

  const handleSubmit = async () => {
    if (!formData.courseSlug) {
      toast({ title: "Error", description: "Please select a course.", variant: "destructive" });
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // Save to LISTA backend - ALL TESDA fields
      const { error } = await lista
        .from('enrollments')
        .insert([{
          refNo: formData.refNo,
          firstName: formData.firstName,
          middleName: formData.middleName,
          lastName: formData.lastName,
          extensionName: formData.extensionName,
          traineeName: `${formData.lastName}, ${formData.firstName} ${formData.middleName}`.trim(),
          dob: formData.dob || null,
          birthPlace: formData.birthPlace,
          age: formData.age,
          gender: formData.gender,
          civilStatus: formData.civilStatus,
          nationality: formData.nationality,
          uli: formData.uli,
          voucherNo: formData.voucherNo,
          psaNo: formData.psaNo,
          learnerClassification: formData.learnerClassification,
          clientType: formData.clientType,
          qualificationType: formData.qualificationType,
          motherMaidenName: formData.motherMaidenName,
          fatherName: formData.fatherName,
          isIP: formData.isIP,
          indigenousGroup: formData.indigenousGroup,
          motherTongue: formData.motherTongue,
          traineeEmail: formData.traineeEmail,
          contactNumber: formData.contactNumber,
          telephone: formData.telephone,
          mobileNumber: formData.mobileNumber,
          homeAddress: formData.homeAddress,
          barangay: formData.barangay,
          district: formData.district,
          city: formData.city,
          province: formData.province,
          region: formData.region,
          zipCode: formData.zipCode,
          education: formData.education,
          schoolLastAttended: formData.schoolLastAttended,
          yearGraduated: formData.yearGraduated,
          employmentStatus: formData.employmentStatus,
          employmentType: formData.employmentType,
          companyName: formData.companyName,
          workExperience: formData.workExperience,
          courseSlug: formData.courseSlug,
          preferredSchedule: formData.preferredSchedule,
          enrollmentType: formData.enrollmentType,
          scholarshipApplication: formData.scholarshipApplication,
          consent: formData.consent,
          documentStatus: 'missing',
          status: 'pending',
          userId: user?.id
        }]);

      if (error) throw error;

      clearLocalProfile();
      completeRegistration();
      setIsFinished(true);
      
      toast({
        title: "Registration Complete!",
        description: "Your info has been saved to the cloud and is ready for download.",
      });
    } catch (error: any) {
      toast({
        title: "Cloud Sync Failed",
        description: "Your registration was NOT saved to the cloud. Please check your Supabase connection.",
        variant: "destructive"
      });
      console.error("Supabase Error:", error);
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
            <h1 className="text-3xl font-black text-zinc-900 tracking-tight mb-3 uppercase">Enrollment Recorded</h1>
            <p className="text-zinc-500 text-sm leading-relaxed mb-10 font-medium">
              Your application for <span className="text-zinc-900 font-bold">{courses.find(c => c.slug === formData.courseSlug)?.title}</span> has been received. 
              Reference: <code className="bg-zinc-100 px-1.5 py-0.5 rounded text-zinc-900 font-mono text-[11px] font-bold">{formData.refNo}</code>
            </p>

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
              onClick={() => setLocation("/trainee")}
            >
              Back to Dashboard
            </Button>
          </div>
        </motion.div>
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
              <span className="text-zinc-900">{completionPercentage}%</span>
            </div>
            <div className="h-1 bg-zinc-100 rounded-full overflow-hidden">
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: `${completionPercentage}%` }}
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
            onClick={() => setLocation("/trainee")}
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
                    <span>{Math.round((currentStep / STEPS.length) * 100)}%</span>
                  </div>
                  <div className="h-1 bg-zinc-100 rounded-full overflow-hidden">
                    <div className="h-full bg-zinc-900" style={{ width: `${(currentStep / STEPS.length) * 100}%` }} />
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
                              className="h-10 border-zinc-200 focus:border-zinc-900 focus:ring-zinc-900 rounded-md"
                              placeholder="Given name"
                              value={formData.firstName} 
                              onChange={e => updateForm({ firstName: e.target.value, traineeName: `${e.target.value} ${formData.middleName} ${formData.lastName}` })} 
                            />
                          </div>
                          <div className="space-y-2">
                            <label className="text-xs font-semibold text-zinc-700">Middle Name</label>
                            <Input 
                              className="h-10 border-zinc-200 focus:border-zinc-900 focus:ring-zinc-900 rounded-md"
                              placeholder="Optional"
                              value={formData.middleName} 
                              onChange={e => updateForm({ middleName: e.target.value, traineeName: `${formData.firstName} ${e.target.value} ${formData.lastName}` })} 
                            />
                          </div>
                          <div className="space-y-2">
                            <label className="text-xs font-semibold text-zinc-700">Last Name</label>
                            <Input 
                              className="h-10 border-zinc-200 focus:border-zinc-900 focus:ring-zinc-900 rounded-md"
                              placeholder="Surname"
                              value={formData.lastName} 
                              onChange={e => updateForm({ lastName: e.target.value, traineeName: `${formData.firstName} ${formData.middleName} ${e.target.value}` })} 
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                          <div className="space-y-2">
                            <label className="text-xs font-semibold text-zinc-700">Name Extension</label>
                            <Input 
                              className="h-10 border-zinc-200 focus:border-zinc-900 focus:ring-zinc-900 rounded-md"
                              placeholder="e.g., Jr., Sr., III" 
                              value={formData.extensionName} 
                              onChange={e => updateForm({ extensionName: e.target.value })} 
                            />
                          </div>
                          <div className="space-y-2">
                            <label className="text-xs font-semibold text-zinc-700">Nationality</label>
                            <Select value={formData.nationality} onValueChange={val => updateForm({ nationality: val })}>
                              <SelectTrigger className="h-10 border-zinc-200 focus:ring-zinc-900 rounded-md">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent className="rounded-md">
                                <SelectItem value="Filipino">Filipino</SelectItem>
                                <SelectItem value="Dual Citizen">Dual Citizen</SelectItem>
                                <SelectItem value="Foreign National">Foreign National</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                          <div className="space-y-2">
                            <label className="text-xs font-semibold text-zinc-700">Date of Birth</label>
                            <Input 
                              type="date" 
                              className="h-10 border-zinc-200 focus:border-zinc-900 focus:ring-zinc-900 rounded-md"
                              value={formData.dob} 
                              onChange={e => {
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
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                          <div className="space-y-2">
                            <label className="text-xs font-semibold text-zinc-700">Unique Learner Identifier (ULI)</label>
                            <Input 
                              placeholder="TESDA ULI (if available)" 
                              className="h-10 font-mono text-sm border-zinc-200 focus:border-zinc-900 rounded-md"
                              value={formData.uli} 
                              onChange={e => updateForm({ uli: e.target.value })} 
                            />
                            <p className="text-[10px] text-zinc-500">Used for TESDA T2MIS registration</p>
                          </div>
                          <div className="space-y-2">
                            <label className="text-xs font-semibold text-zinc-700">Scholarship Voucher No.</label>
                            <Input className="h-10 border-zinc-200 rounded-md" placeholder="For TWSP/PESFA Scholars" value={formData.voucherNo} onChange={e => updateForm({ voucherNo: e.target.value })} />
                          </div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                          <div className="space-y-2">
                            <label className="text-xs font-semibold text-zinc-700">Learner Classification</label>
                            <Select value={formData.learnerClassification} onValueChange={val => updateForm({ learnerClassification: val })}>
                              <SelectTrigger className="h-10 border-zinc-200 rounded-md"><SelectValue /></SelectTrigger>
                              <SelectContent className="rounded-md">
                                <SelectItem value="Student">Student</SelectItem>
                                <SelectItem value="Out-of-School Youth">Out-of-School Youth</SelectItem>
                                <SelectItem value="OFW / OFW Dependent">OFW / OFW Dependent</SelectItem>
                                <SelectItem value="Indigenous People">Indigenous People</SelectItem>
                                <SelectItem value="PWD">PWD</SelectItem>
                                <SelectItem value="Solo Parent">Solo Parent</SelectItem>
                                <SelectItem value="Displaced Worker">Displaced Worker</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="space-y-2">
                            <label className="text-xs font-semibold text-zinc-700">Client Type (TESDA)</label>
                            <Select value={formData.clientType} onValueChange={val => updateForm({ clientType: val })}>
                              <SelectTrigger className="h-10 border-zinc-200 rounded-md"><SelectValue /></SelectTrigger>
                              <SelectContent className="rounded-md">
                                <SelectItem value="TVET Student">TVET Student</SelectItem>
                                <SelectItem value="TVET Graduate">TVET Graduate</SelectItem>
                                <SelectItem value="Industry Worker">Industry Worker</SelectItem>
                                <SelectItem value="SCEP">SCEP</SelectItem>
                                <SelectItem value="Community Member">Community Member</SelectItem>
                                <SelectItem value="OFW">OFW</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                        <div className="space-y-2">
                          <label className="text-xs font-semibold text-zinc-700">Qualification Type</label>
                          <Select value={formData.qualificationType} onValueChange={val => updateForm({ qualificationType: val as any })}>
                            <SelectTrigger className="h-10 border-zinc-200 rounded-md"><SelectValue /></SelectTrigger>
                            <SelectContent className="rounded-md">
                              <SelectItem value="Full Qualification">Full Qualification</SelectItem>
                              <SelectItem value="COC">Certificate of Competency (COC)</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                          <div className="space-y-2">
                            <label className="text-xs font-semibold text-zinc-700">Father's Full Name</label>
                            <Input className="h-10 border-zinc-200 rounded-md" value={formData.fatherName} onChange={e => updateForm({ fatherName: e.target.value })} />
                          </div>
                          <div className="space-y-2">
                            <label className="text-xs font-semibold text-zinc-700">Mother's Maiden Name</label>
                            <Input className="h-10 border-zinc-200 rounded-md" value={formData.motherMaidenName} onChange={e => updateForm({ motherMaidenName: e.target.value })} />
                          </div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                          <div className="space-y-2">
                            <label className="text-xs font-semibold text-zinc-700">Mother Tongue</label>
                            <Input className="h-10 border-zinc-200 rounded-md" value={formData.motherTongue} onChange={e => updateForm({ motherTongue: e.target.value })} />
                          </div>
                          <div className="space-y-2">
                            <label className="text-xs font-semibold text-zinc-700">PSA Birth Cert No.</label>
                            <Input className="h-10 border-zinc-200 rounded-md" placeholder="Registry No." value={formData.psaNo} onChange={e => updateForm({ psaNo: e.target.value })} />
                          </div>
                          <div className="space-y-2">
                            <label className="text-xs font-semibold text-zinc-700">Indigenous Group</label>
                            <Input className="h-10 border-zinc-200 rounded-md" placeholder="e.g., Manobo" value={formData.indigenousGroup} onChange={e => updateForm({ indigenousGroup: e.target.value, isIP: !!e.target.value })} />
                          </div>
                        </div>
                      </div>
                    )}

                    {currentStep === 3 && (
                      <div className="space-y-5">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                          <div className="space-y-2">
                            <label className="text-xs font-semibold text-zinc-700">Mobile Number</label>
                            <Input className="h-10 border-zinc-200 rounded-md" placeholder="09XX-XXX-XXXX" value={formData.mobileNumber} onChange={e => updateForm({ mobileNumber: e.target.value })} />
                          </div>
                          <div className="space-y-2">
                            <label className="text-xs font-semibold text-zinc-700">Telephone</label>
                            <Input className="h-10 border-zinc-200 rounded-md" placeholder="(088) XXX-XXXX" value={formData.telephone} onChange={e => updateForm({ telephone: e.target.value })} />
                          </div>
                          <div className="space-y-2">
                            <label className="text-xs font-semibold text-zinc-700">Email</label>
                            <Input className="h-10 border-zinc-200 rounded-md" type="email" value={formData.traineeEmail} onChange={e => updateForm({ traineeEmail: e.target.value })} />
                          </div>
                        </div>
                        <div className="border-t border-zinc-100 pt-5 mt-2">
                          <h4 className="text-sm font-semibold text-zinc-900 mb-4">Complete Mailing Address</h4>
                          <div className="space-y-5">
                            <div className="space-y-2">
                              <label className="text-xs font-semibold text-zinc-700">House No. / Street / Purok</label>
                              <Input className="h-10 border-zinc-200 rounded-md" placeholder="e.g., Purok 3, Mahogany Street" value={formData.homeAddress} onChange={e => updateForm({ homeAddress: e.target.value })} />
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                              <div className="space-y-2">
                                <label className="text-xs font-semibold text-zinc-700">Barangay</label>
                                <Input className="h-10 border-zinc-200 rounded-md" placeholder="e.g., Barangay 24-A" value={formData.barangay} onChange={e => updateForm({ barangay: e.target.value })} />
                              </div>
                              <div className="space-y-2">
                                <label className="text-xs font-semibold text-zinc-700">District</label>
                                <Input className="h-10 border-zinc-200 rounded-md" placeholder="e.g., District 1" value={formData.district} onChange={e => updateForm({ district: e.target.value })} />
                              </div>
                              <div className="space-y-2">
                                <label className="text-xs font-semibold text-zinc-700">Zip Code</label>
                                <Input className="h-10 border-zinc-200 rounded-md" value={formData.zipCode} onChange={e => updateForm({ zipCode: e.target.value })} />
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

                    {currentStep === 4 && (
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
                              <Input className="h-10 border-zinc-200 rounded-md" placeholder="e.g., 2020" value={formData.yearGraduated} onChange={e => updateForm({ yearGraduated: e.target.value })} />
                            </div>
                          </div>
                          <div className="space-y-2 mt-5">
                            <label className="text-xs font-semibold text-zinc-700">School Last Attended</label>
                            <Input className="h-10 border-zinc-200 rounded-md" placeholder="Complete school name" value={formData.schoolLastAttended} onChange={e => updateForm({ schoolLastAttended: e.target.value })} />
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
                                    value={formData.workExperience[i].company}
                                    onChange={e => {
                                      const newExp = [...formData.workExperience];
                                      newExp[i] = { ...newExp[i], company: e.target.value };
                                      updateForm({ workExperience: newExp });
                                    }}
                                  />
                                  <Input 
                                    className="h-9 text-sm bg-white" placeholder="Position" 
                                    value={formData.workExperience[i].position}
                                    onChange={e => {
                                      const newExp = [...formData.workExperience];
                                      newExp[i] = { ...newExp[i], position: e.target.value };
                                      updateForm({ workExperience: newExp });
                                    }}
                                  />
                                </div>
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                                  <Input 
                                    className="h-9 text-xs bg-white" placeholder="Dates (e.g., 2020-2022)" 
                                    value={formData.workExperience[i].inclusiveDates}
                                    onChange={e => {
                                      const newExp = [...formData.workExperience];
                                      newExp[i] = { ...newExp[i], inclusiveDates: e.target.value };
                                      updateForm({ workExperience: newExp });
                                    }}
                                  />
                                  <Input 
                                    className="h-9 text-xs bg-white" placeholder="Salary" 
                                    value={formData.workExperience[i].monthlySalary}
                                    onChange={e => {
                                      const newExp = [...formData.workExperience];
                                      newExp[i] = { ...newExp[i], monthlySalary: e.target.value };
                                      updateForm({ workExperience: newExp });
                                    }}
                                  />
                                  <Input 
                                    className="h-9 text-xs bg-white" placeholder="Status" 
                                    value={formData.workExperience[i].appointmentStatus}
                                    onChange={e => {
                                      const newExp = [...formData.workExperience];
                                      newExp[i] = { ...newExp[i], appointmentStatus: e.target.value };
                                      updateForm({ workExperience: newExp });
                                    }}
                                  />
                                  <Input 
                                    className="h-9 text-xs bg-white" placeholder="Years" 
                                    value={formData.workExperience[i].noOfYearsExp}
                                    onChange={e => {
                                      const newExp = [...formData.workExperience];
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

                    {currentStep === 5 && (
                      <div className="space-y-6">
                        <div className="space-y-2">
                          <label className="text-xs font-semibold text-zinc-700">Select Course</label>
                          <Select value={formData.courseSlug} onValueChange={val => updateForm({ courseSlug: val })}>
                            <SelectTrigger className="h-12 border-zinc-200 rounded-md text-base"><SelectValue placeholder="Choose a program..." /></SelectTrigger>
                            <SelectContent className="rounded-md">
                              {courses.map(c => (
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

                    {currentStep === 6 && (
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
                             <p className="text-[13px] text-zinc-500 font-medium">You can securely upload these later from your trainee dashboard.</p>
                           </div>
                           <Button 
                            variant="outline" 
                            className="bg-white border-zinc-200 text-zinc-900 hover:bg-zinc-50 font-black text-[11px] uppercase tracking-widest px-8 h-12 rounded-xl transition-all active:scale-95"
                            onClick={nextStep}
                           >
                             Skip for now
                           </Button>
                        </div>
                      </div>
                    )}

                    {currentStep === 7 && (
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
                            <div className="sm:col-span-2 pt-3 border-t border-zinc-200">
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

                      {currentStep < 7 ? (
                        <Button 
                          className="h-14 px-12 bg-zinc-900 text-white hover:bg-zinc-800 rounded-2xl font-black text-[11px] uppercase tracking-widest shadow-xl shadow-zinc-100 transition-all active:scale-[0.98]" 
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
