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
  { id: 1, title: "Personal", icon: User },
  { id: 2, title: "Identity & Family", icon: FileCheck },
  { id: 3, title: "Complete Address", icon: MapPin },
  { id: 4, title: "Education & Work", icon: GraduationCap },
  { id: 5, title: "Course & Program", icon: CalendarDays },
  { id: 6, title: "Documents", icon: FileText },
  { id: 7, title: "Review", icon: CheckCircle2 },
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
    hidden: { opacity: 0, x: 20 },
    visible: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -20 }
  };

  if (isFinished) {
    return (
      <div className="min-h-screen bg-muted/30 flex items-center justify-center p-4">
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-md w-full"
        >
          <Card className="border-card-border shadow-xl overflow-hidden">
            <div className="h-2 bg-primary" />
            <CardContent className="pt-8 pb-8 px-6 text-center">
              <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircle2 className="h-8 w-8 text-emerald-600" />
              </div>
              <h1 className="text-2xl font-bold text-foreground mb-2">Registration Submitted!</h1>
              <p className="text-muted-foreground mb-8">
                Thank you, {formData.firstName}. Your application has been received and is now being processed.
              </p>

              <div className="grid grid-cols-1 gap-3 mb-8">
                <Button 
                  variant="outline" 
                  className="h-12 gap-2 border-emerald-200 text-emerald-700 hover:bg-emerald-50"
                  onClick={handleDownloadExcel}
                >
                  <FileSpreadsheet className="h-5 w-5" /> Download Admission Slip (Excel)
                </Button>
                <Button 
                  variant="outline" 
                  className="h-12 gap-2 border-blue-200 text-blue-700 hover:bg-blue-50"
                  onClick={handleDownloadWord}
                >
                  <Printer className="h-5 w-5" /> Download Admission Slip (Word)
                </Button>
              </div>

              <Button className="w-full h-12 text-lg font-bold" onClick={() => setLocation("/trainee")}>
                Go to Dashboard
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-muted/30 py-12 px-4">
      <div className="max-w-2xl mx-auto space-y-8">
        <div className="text-center space-y-2">
          <img src="/logo.webp" alt="LISTA Logo" className="h-16 w-auto mx-auto mb-4" />
          <h1 className="text-3xl font-extrabold tracking-tight text-foreground">Trainee Registration</h1>
          <p className="text-muted-foreground">Please complete the form to finish your enrollment process.</p>
          
          <div className="mt-4 flex items-center justify-center gap-4">
            <div className="flex-1 max-w-[200px] h-2 bg-muted rounded-full overflow-hidden">
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: `${completionPercentage}%` }}
                className="h-full bg-emerald-500"
              />
            </div>
            <span className="text-sm font-bold text-emerald-600">{completionPercentage}% Complete</span>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="relative">
          <div className="absolute top-5 left-0 w-full h-0.5 bg-muted rounded-full" />
          <div 
            className="absolute top-5 left-0 h-0.5 bg-primary rounded-full transition-all duration-300" 
            style={{ width: `${((currentStep - 1) / 6) * 100}%` }}
          />
          <div className="relative flex justify-between">
            {STEPS.map((step) => {
              const Icon = step.icon;
              const isActive = step.id <= currentStep;
              return (
                <div key={step.id} className="flex flex-col items-center">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 z-10 transition-colors ${
                    isActive ? 'bg-primary border-primary text-primary-foreground' : 'bg-background border-muted text-muted-foreground'
                  }`}>
                    <Icon className="h-5 w-5" />
                  </div>
                  <span className={`text-[10px] font-bold uppercase mt-2 tracking-wider ${isActive ? 'text-primary' : 'text-muted-foreground'}`}>
                    {step.title}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        <Card className="border-card-border shadow-lg overflow-hidden">
          <CardContent className="p-8">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentStep}
                variants={stepVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
                transition={{ duration: 0.2 }}
                className="space-y-6"
              >
                {currentStep === 1 && (
                  <div className="space-y-4">
                    <div className="grid grid-cols-3 gap-4">
                      <div className="space-y-2">
                        <label className="text-sm font-semibold">First Name</label>
                        <Input value={formData.firstName} onChange={e => updateForm({ firstName: e.target.value, traineeName: `${e.target.value} ${formData.middleName} ${formData.lastName}` })} />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-semibold">Middle Name</label>
                        <Input value={formData.middleName} onChange={e => updateForm({ middleName: e.target.value, traineeName: `${formData.firstName} ${e.target.value} ${formData.lastName}` })} />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-semibold">Last Name</label>
                        <Input value={formData.lastName} onChange={e => updateForm({ lastName: e.target.value, traineeName: `${formData.firstName} ${formData.middleName} ${e.target.value}` })} />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-sm font-semibold">Name Extension (Jr., Sr., III)</label>
                        <Input placeholder="e.g., Jr., Sr., III" value={formData.extensionName} onChange={e => updateForm({ extensionName: e.target.value })} />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-semibold">Nationality</label>
                        <Select value={formData.nationality} onValueChange={val => updateForm({ nationality: val })}>
                          <SelectTrigger><SelectValue /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Filipino">Filipino</SelectItem>
                            <SelectItem value="Dual Citizen">Dual Citizen</SelectItem>
                            <SelectItem value="Foreign National">Foreign National</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <div className="grid grid-cols-3 gap-4">
                      <div className="space-y-2">
                        <label className="text-sm font-semibold">Date of Birth</label>
                        <Input type="date" value={formData.dob} onChange={e => {
                          const dob = e.target.value;
                          const birthDate = new Date(dob);
                          const today = new Date();
                          let age = today.getFullYear() - birthDate.getFullYear();
                          const m = today.getMonth() - birthDate.getMonth();
                          if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) age--;
                          updateForm({ dob, age: Math.max(0, age) });
                        }} />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-semibold">Age</label>
                        <Input type="number" value={formData.age || ''} readOnly className="bg-muted" />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-semibold">Birth Place</label>
                        <Input placeholder="City/Municipality, Province" value={formData.birthPlace} onChange={e => updateForm({ birthPlace: e.target.value })} />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-sm font-semibold">Gender</label>
                        <Select value={formData.gender} onValueChange={val => updateForm({ gender: val as any })}>
                          <SelectTrigger><SelectValue /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Male">Male</SelectItem>
                            <SelectItem value="Female">Female</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-semibold">Civil Status</label>
                        <Select value={formData.civilStatus} onValueChange={val => updateForm({ civilStatus: val as any })}>
                          <SelectTrigger><SelectValue /></SelectTrigger>
                          <SelectContent>
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
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-sm font-semibold text-primary">Unique Learner Identifier (ULI)</label>
                        <Input 
                          placeholder="TESDA ULI (if available)" 
                          className="font-mono"
                          value={formData.uli} 
                          onChange={e => updateForm({ uli: e.target.value })} 
                        />
                        <p className="text-[10px] text-muted-foreground">Used for TESDA T2MIS registration</p>
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-semibold">Scholarship Voucher No.</label>
                        <Input placeholder="For TWSP/PESFA Scholars" value={formData.voucherNo} onChange={e => updateForm({ voucherNo: e.target.value })} />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-sm font-semibold">Learner Classification</label>
                        <Select value={formData.learnerClassification} onValueChange={val => updateForm({ learnerClassification: val })}>
                          <SelectTrigger><SelectValue /></SelectTrigger>
                          <SelectContent>
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
                        <label className="text-sm font-semibold">Client Type (TESDA)</label>
                        <Select value={formData.clientType} onValueChange={val => updateForm({ clientType: val })}>
                          <SelectTrigger><SelectValue /></SelectTrigger>
                          <SelectContent>
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
                      <label className="text-sm font-semibold">Qualification Type</label>
                      <Select value={formData.qualificationType} onValueChange={val => updateForm({ qualificationType: val as any })}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Full Qualification">Full Qualification</SelectItem>
                          <SelectItem value="COC">Certificate of Competency (COC)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-sm font-semibold">Father's Full Name</label>
                        <Input value={formData.fatherName} onChange={e => updateForm({ fatherName: e.target.value })} />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-semibold">Mother's Maiden Name</label>
                        <Input value={formData.motherMaidenName} onChange={e => updateForm({ motherMaidenName: e.target.value })} />
                      </div>
                    </div>
                    <div className="grid grid-cols-3 gap-4">
                      <div className="space-y-2">
                        <label className="text-sm font-semibold">Mother Tongue</label>
                        <Input value={formData.motherTongue} onChange={e => updateForm({ motherTongue: e.target.value })} />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-semibold">PSA Birth Cert No.</label>
                        <Input placeholder="Registry No." value={formData.psaNo} onChange={e => updateForm({ psaNo: e.target.value })} />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-semibold">Indigenous Group (if applicable)</label>
                        <Input placeholder="e.g., Manobo, Higaonon" value={formData.indigenousGroup} onChange={e => updateForm({ indigenousGroup: e.target.value, isIP: !!e.target.value })} />
                      </div>
                    </div>
                  </div>
                )}

                {currentStep === 3 && (
                  <div className="space-y-4">
                    <div className="grid grid-cols-3 gap-4">
                      <div className="space-y-2">
                        <label className="text-sm font-semibold">Mobile Number</label>
                        <Input placeholder="09XX-XXX-XXXX" value={formData.mobileNumber} onChange={e => updateForm({ mobileNumber: e.target.value })} />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-semibold">Telephone (Landline)</label>
                        <Input placeholder="(088) XXX-XXXX" value={formData.telephone} onChange={e => updateForm({ telephone: e.target.value })} />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-semibold">Email</label>
                        <Input type="email" value={formData.traineeEmail} onChange={e => updateForm({ traineeEmail: e.target.value })} />
                      </div>
                    </div>
                    <div className="border-t pt-4 mt-4">
                      <h4 className="text-sm font-bold text-primary mb-3 flex items-center gap-2">
                        <MapPin className="w-4 h-4" /> Complete Mailing Address
                      </h4>
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-semibold">House No. / Street / Purok</label>
                      <Input placeholder="e.g., Purok 3, Mahogany Street" value={formData.homeAddress} onChange={e => updateForm({ homeAddress: e.target.value })} />
                    </div>
                    <div className="grid grid-cols-3 gap-4">
                      <div className="space-y-2">
                        <label className="text-sm font-semibold">Barangay</label>
                        <Input placeholder="e.g., Barangay 24-A" value={formData.barangay} onChange={e => updateForm({ barangay: e.target.value })} />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-semibold">District</label>
                        <Input placeholder="e.g., District 1" value={formData.district} onChange={e => updateForm({ district: e.target.value })} />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-semibold">Zip Code</label>
                        <Input value={formData.zipCode} onChange={e => updateForm({ zipCode: e.target.value })} />
                      </div>
                    </div>
                    <div className="grid grid-cols-3 gap-4">
                      <div className="space-y-2">
                        <label className="text-sm font-semibold">City/Municipality</label>
                        <Input value={formData.city} onChange={e => updateForm({ city: e.target.value })} />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-semibold">Province</label>
                        <Input value={formData.province} onChange={e => updateForm({ province: e.target.value })} />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-semibold">Region</label>
                        <Select value={formData.region} onValueChange={val => updateForm({ region: val })}>
                          <SelectTrigger><SelectValue /></SelectTrigger>
                          <SelectContent>
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
                            <SelectItem value="NCR — National Capital Region">NCR — National Capital Region</SelectItem>
                            <SelectItem value="CAR — Cordillera">CAR — Cordillera</SelectItem>
                            <SelectItem value="BARMM">BARMM</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </div>
                )}

                {currentStep === 4 && (
                  <div className="space-y-4">
                    <div className="border-b pb-4">
                      <h4 className="text-sm font-bold text-primary mb-3 flex items-center gap-2">
                        <GraduationCap className="w-4 h-4" /> Educational Background
                      </h4>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-sm font-semibold">Highest Education Attainment</label>
                        <Select value={formData.education} onValueChange={val => updateForm({ education: val })}>
                          <SelectTrigger><SelectValue /></SelectTrigger>
                          <SelectContent>
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
                        <label className="text-sm font-semibold">Year Graduated</label>
                        <Input placeholder="e.g., 2020" value={formData.yearGraduated} onChange={e => updateForm({ yearGraduated: e.target.value })} />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-semibold">School Last Attended</label>
                      <Input placeholder="Complete school name" value={formData.schoolLastAttended} onChange={e => updateForm({ schoolLastAttended: e.target.value })} />
                    </div>

                    <div className="border-t pt-4 mt-6">
                      <h4 className="text-sm font-bold text-primary mb-3 flex items-center gap-2">
                        <Briefcase className="w-4 h-4" /> Employment Status
                      </h4>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-sm font-semibold">Employment Status</label>
                        <Select value={formData.employmentStatus} onValueChange={val => updateForm({ employmentStatus: val as any })}>
                          <SelectTrigger><SelectValue /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Unemployed">Unemployed</SelectItem>
                            <SelectItem value="Underemployed">Underemployed</SelectItem>
                            <SelectItem value="Employed (seeking skills upgrade)">Employed (seeking skills upgrade)</SelectItem>
                            <SelectItem value="Student">Student</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-semibold">Employment Type (if employed)</label>
                        <Select value={formData.employmentType} onValueChange={val => updateForm({ employmentType: val })}>
                          <SelectTrigger><SelectValue placeholder="Select type..." /></SelectTrigger>
                          <SelectContent>
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
                    <div className="space-y-2">
                      <label className="text-sm font-semibold">Company Name (if employed)</label>
                      <Input placeholder="Employer/Company name" value={formData.companyName} onChange={e => updateForm({ companyName: e.target.value })} />
                    </div>

                    <div className="border-t pt-4 mt-6">
                      <h4 className="text-sm font-bold text-primary mb-3">Work Experience (National Qualification-related)</h4>
                      <p className="text-[10px] text-muted-foreground mb-3">List up to 3 relevant work experiences</p>
                    </div>
                    <div className="space-y-3">
                      {[0, 1, 2].map((i) => (
                        <div key={i} className="grid grid-cols-6 gap-2 text-xs">
                          <Input 
                            placeholder="Company Name" 
                            value={formData.workExperience[i].company}
                            onChange={e => {
                              const newExp = [...formData.workExperience];
                              newExp[i] = { ...newExp[i], company: e.target.value };
                              updateForm({ workExperience: newExp });
                            }}
                          />
                          <Input 
                            placeholder="Position" 
                            value={formData.workExperience[i].position}
                            onChange={e => {
                              const newExp = [...formData.workExperience];
                              newExp[i] = { ...newExp[i], position: e.target.value };
                              updateForm({ workExperience: newExp });
                            }}
                          />
                          <Input 
                            placeholder="Inclusive Dates" 
                            value={formData.workExperience[i].inclusiveDates}
                            onChange={e => {
                              const newExp = [...formData.workExperience];
                              newExp[i] = { ...newExp[i], inclusiveDates: e.target.value };
                              updateForm({ workExperience: newExp });
                            }}
                          />
                          <Input 
                            placeholder="Monthly Salary" 
                            value={formData.workExperience[i].monthlySalary}
                            onChange={e => {
                              const newExp = [...formData.workExperience];
                              newExp[i] = { ...newExp[i], monthlySalary: e.target.value };
                              updateForm({ workExperience: newExp });
                            }}
                          />
                          <Input 
                            placeholder="Status" 
                            value={formData.workExperience[i].appointmentStatus}
                            onChange={e => {
                              const newExp = [...formData.workExperience];
                              newExp[i] = { ...newExp[i], appointmentStatus: e.target.value };
                              updateForm({ workExperience: newExp });
                            }}
                          />
                          <Input 
                            placeholder="Years Exp." 
                            value={formData.workExperience[i].noOfYearsExp}
                            onChange={e => {
                              const newExp = [...formData.workExperience];
                              newExp[i] = { ...newExp[i], noOfYearsExp: e.target.value };
                              updateForm({ workExperience: newExp });
                            }}
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {currentStep === 5 && (
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <label className="text-sm font-semibold">Select Course to Enroll</label>
                      <Select value={formData.courseSlug} onValueChange={val => updateForm({ courseSlug: val })}>
                        <SelectTrigger className="h-12"><SelectValue placeholder="Choose a course..." /></SelectTrigger>
                        <SelectContent>
                          {courses.map(c => (
                            <SelectItem key={c.slug} value={c.slug}>{c.title} ({c.ncLevel})</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-sm font-semibold">Enrollment Type</label>
                        <Select value={formData.enrollmentType} onValueChange={val => updateForm({ enrollmentType: val as any })}>
                          <SelectTrigger><SelectValue /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="New Enrollee">New Enrollee</SelectItem>
                            <SelectItem value="Re-enrollee">Re-enrollee</SelectItem>
                            <SelectItem value="Assessment Only (walk-in)">Assessment Only (walk-in)</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-semibold">Preferred Schedule</label>
                        <Select value={formData.preferredSchedule} onValueChange={val => updateForm({ preferredSchedule: val as any })}>
                          <SelectTrigger><SelectValue /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Morning (8:00 AM – 12:00 PM)">Morning (8am-12pm)</SelectItem>
                            <SelectItem value="Afternoon (1:00 PM – 5:00 PM)">Afternoon (1pm-5pm)</SelectItem>
                            <SelectItem value="Full Day (8:00 AM – 5:00 PM)">Full Day (8am-5pm)</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-semibold">Apply for Scholarship (TWSP)?</label>
                      <Select value={formData.scholarshipApplication} onValueChange={val => updateForm({ scholarshipApplication: val as any })}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Yes, I want to apply for TWSP">Yes, apply for TWSP</SelectItem>
                          <SelectItem value="No, self-funded enrollment">No, self-funded</SelectItem>
                          <SelectItem value="I need more information about scholarships">I need more information</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                )}

                {currentStep === 6 && (
                  <div className="space-y-6">
                    <div className="border-b pb-4">
                      <h4 className="text-sm font-bold text-primary mb-1 flex items-center gap-2">
                        <Upload className="w-4 h-4" /> Required Documents
                      </h4>
                      <p className="text-[10px] text-muted-foreground">Upload required documents now or complete later from your profile</p>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="border-2 border-dashed border-slate-200 rounded-xl p-4 text-center hover:border-primary/50 transition-colors cursor-pointer">
                        <Upload className="w-8 h-8 mx-auto mb-2 text-slate-400" />
                        <p className="text-xs font-semibold">PSA Birth Certificate</p>
                        <p className="text-[10px] text-muted-foreground">PDF, JPG, PNG</p>
                      </div>
                      <div className="border-2 border-dashed border-slate-200 rounded-xl p-4 text-center hover:border-primary/50 transition-colors cursor-pointer">
                        <Upload className="w-8 h-8 mx-auto mb-2 text-slate-400" />
                        <p className="text-xs font-semibold">Valid Government ID</p>
                        <p className="text-[10px] text-muted-foreground">PDF, JPG, PNG</p>
                      </div>
                      <div className="border-2 border-dashed border-slate-200 rounded-xl p-4 text-center hover:border-primary/50 transition-colors cursor-pointer">
                        <Upload className="w-8 h-8 mx-auto mb-2 text-slate-400" />
                        <p className="text-xs font-semibold">2x2 Photo (White BG)</p>
                        <p className="text-[10px] text-muted-foreground">Colored passport size</p>
                      </div>
                      <div className="border-2 border-dashed border-slate-200 rounded-xl p-4 text-center hover:border-primary/50 transition-colors cursor-pointer">
                        <Upload className="w-8 h-8 mx-auto mb-2 text-slate-400" />
                        <p className="text-xs font-semibold">Diploma / Report Card</p>
                        <p className="text-[10px] text-muted-foreground">PDF, JPG, PNG</p>
                      </div>
                    </div>
                    <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
                      <p className="text-xs text-amber-700">
                        <strong>Note:</strong> You can skip this step and upload documents later from your trainee dashboard. However, all required documents must be submitted before assessment.
                      </p>
                    </div>
                  </div>
                )}

                {currentStep === 7 && (
                  <div className="space-y-6">
                    <div className="bg-muted/30 p-4 rounded-xl space-y-3 max-h-64 overflow-y-auto">
                      <h3 className="font-bold text-center border-b border-card-border pb-2 mb-2 uppercase text-[10px] tracking-widest text-primary">Final Review</h3>
                      <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs">
                        <span className="text-muted-foreground">Name:</span>
                        <span className="font-semibold">{formData.lastName}, {formData.firstName} {formData.middleName} {formData.extensionName}</span>
                        <span className="text-muted-foreground">DOB:</span>
                        <span className="font-semibold">{formData.dob} ({formData.age} yrs old)</span>
                        <span className="text-muted-foreground">Address:</span>
                        <span className="font-semibold text-[10px]">{formData.homeAddress}, {formData.barangay}, {formData.city}</span>
                        <span className="text-muted-foreground">ULI:</span>
                        <span className="font-mono font-bold text-primary">{formData.uli || "NEW LEARNER"}</span>
                        <span className="text-muted-foreground">Classification:</span>
                        <span className="font-semibold">{formData.learnerClassification}</span>
                        <span className="text-muted-foreground">Client Type:</span>
                        <span className="font-semibold">{formData.clientType}</span>
                        <span className="text-muted-foreground">Qualification:</span>
                        <span className="font-semibold">{formData.qualificationType}</span>
                        <span className="text-muted-foreground">Course:</span>
                        <span className="font-semibold">{courses.find(c => c.slug === formData.courseSlug)?.title || "Not selected"}</span>
                        <span className="text-muted-foreground">Schedule:</span>
                        <span className="font-semibold">{formData.preferredSchedule}</span>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <Checkbox 
                        checked={formData.consent} 
                        onCheckedChange={(checked) => updateForm({ consent: checked as boolean })}
                      />
                      <p className="text-xs text-muted-foreground">
                        I hereby certify that the information above is true and correct, and I consent to the processing of my data for TESDA T2MIS registration in accordance with the Data Privacy Act of 2012.
                      </p>
                    </div>
                  </div>
                )}

                <div className="flex gap-4 pt-4">
                  {currentStep > 1 && (
                    <Button variant="outline" className="flex-1 h-12" onClick={prevStep}>
                      <ArrowLeft className="mr-2 h-4 w-4" /> Back
                    </Button>
                  )}
                  {currentStep < 7 ? (
                    <Button className="flex-1 h-12 gap-2" onClick={nextStep}>
                      Next Step <ArrowRight className="h-4 w-4" />
                    </Button>
                  ) : (
                    <Button 
                      className="flex-1 h-12 gap-2 bg-emerald-600 hover:bg-emerald-700" 
                      onClick={handleSubmit}
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? "Submitting..." : "Complete Registration"} <CheckCircle2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </motion.div>
            </AnimatePresence>

            {currentStep < 7 && (
              <div className="mt-8 pt-6 border-t text-center">
                <p className="text-xs text-muted-foreground mb-4">
                  Short on time? You can skip the rest for now and finish it later in your dashboard.
                </p>
                <Button 
                  variant="ghost" 
                  className="text-primary font-bold hover:bg-primary/5"
                  onClick={() => setLocation("/trainee")}
                >
                  Skip and Go to Dashboard
                </Button>
              </div>
            )}

          </CardContent>
        </Card>
      </div>
    </div>
  );
}
