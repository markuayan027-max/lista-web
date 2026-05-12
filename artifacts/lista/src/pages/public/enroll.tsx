import { useState, useMemo, useEffect, useRef } from "react";
import { useLocation, Link } from "wouter";
import { CheckCircle2, ChevronLeft, ChevronRight, GraduationCap, MapPin, Phone, Mail, User, BookOpen, Calendar, HelpCircle, Clock, Award, Plus, Trash2, Printer, Download, ArrowRight, Sparkles } from "lucide-react";
import { useGetCourses } from "@workspace/api-client-react";
import { courses as mockCourses, schoolInfo } from "@/lib/institutional-data";
import PrimaryButton from "@/components/primary-button";
import FormInputField from "@/components/form-input-field";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import ModalSuccess from "@/components/modal-success";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAuth } from "@/context/auth-context";
import PrintableTESDAForm from "@/components/printable-tesda-form";

type Step = 1 | 2 | 3 | 4;

interface WorkExperience {
  company: string;
  position: string;
  dates: string;
  salary: string;
  status: string;
  yearsExp: string;
}

interface FormData {
  firstName: string;
  lastName: string;
  middleName: string;
  extensionName: string;
  email: string;
  contact: string;
  address: string;
  barangay: string;
  district: string;
  city: string;
  province: string;
  region: string;
  zipCode: string;
  motherName: string;
  fatherName: string;
  dob: string;
  birthPlace: string;
  age: string;
  gender: string;
  civilStatus: string;
  education: string;
  school: string;
  employmentStatus: string;
  clientType: string;
  workExperience: WorkExperience[];
  courseSlug: string;
  qualificationType: "Full Qualification" | "COC";
  schedule: string;
  enrollType: string;
  scholarship: string;
  heardFrom: string;
  notes: string;
}

export default function EnrollPage() {
  const { user } = useAuth();
  const [_, setLocation] = useLocation();
  const printRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!user) {
      setLocation("/login?redirect=" + encodeURIComponent(window.location.pathname + window.location.search));
    }
  }, [user, setLocation]);

  const [step, setStep] = useState<Step>(1);
  const [submitted, setSubmitted] = useState(false);
  const [refNo, setRefNo] = useState("");
  const [errors, setErrors] = useState<Partial<FormData>>({});

  const { data: apiCourses } = useGetCourses();

  const coursesData = useMemo(() => {
    if (apiCourses && Array.isArray(apiCourses) && apiCourses.length > 0) {
      return apiCourses.map(c => ({
        id: c.id,
        slug: (c as any).slug || c.id.toString(),
        name: c.name,
        sector: c.sector,
        ncLevel: c.ncLevel,
        twspScholarship: c.twspScholarship
      }));
    }
    return (mockCourses || []).map(c => ({
      id: c.id,
      slug: c.slug,
      name: c.title,
      sector: c.category,
      ncLevel: c.ncLevel,
      twspScholarship: c.twsp ? "true" : "false"
    }));
  }, [apiCourses]);
  
  const [formData, setFormData] = useState<FormData>({
    firstName: "",
    lastName: "",
    middleName: "",
    extensionName: "",
    email: "",
    contact: "",
    address: "",
    barangay: "",
    district: "",
    city: "Gingoog City",
    province: "Misamis Oriental",
    region: "Region X",
    zipCode: "9014",
    motherName: "",
    fatherName: "",
    dob: "",
    birthPlace: "",
    age: "",
    gender: "",
    civilStatus: "",
    education: "",
    school: "",
    employmentStatus: "Unemployed",
    clientType: "TVET Graduate",
    workExperience: [],
    courseSlug: "",
    qualificationType: "Full Qualification",
    schedule: "Day (8:00 AM - 5:00 PM)",
    enrollType: "Training",
    scholarship: "None",
    heardFrom: "",
    notes: ""
  });

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const courseParam = params.get("course");
    const scholarshipParam = params.get("scholarship");
    
    if (courseParam && coursesData.some(c => c.slug === courseParam)) {
      setFormData(prev => ({ ...prev, courseSlug: courseParam }));
    }

    if (scholarshipParam) {
      const scholarshipMap: Record<string, string> = {
        'twsp': 'TWSP Approved',
        'step': 'STEP Approved',
        'pesfa': 'PESFA'
      };
      setFormData(prev => ({ 
        ...prev, 
        scholarship: scholarshipMap[scholarshipParam.toLowerCase()] || scholarshipParam 
      }));
    }
  }, [coursesData]);

  // Pre-fill major data from the authenticated user
  useEffect(() => {
    if (user) {
      const parts = user.name?.split(" ") || [];
      const fName = parts[0] || "";
      const lName = parts.length > 1 ? parts.slice(1).join(" ") : "";
      
      setFormData(prev => ({
        ...prev,
        firstName: prev.firstName || fName,
        lastName: prev.lastName || lName,
        email: prev.email || user.email || "",
        contact: prev.contact || (user as any).phone || (user as any).contact || "",
      }));
    }
  }, [user]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name as keyof FormData]) {
      setErrors(prev => ({ ...prev, [name]: undefined }));
    }
  };

  const handleWorkExpChange = (index: number, field: keyof WorkExperience, value: string) => {
    const newWorkExp = [...formData.workExperience];
    newWorkExp[index] = { ...newWorkExp[index], [field]: value };
    setFormData(prev => ({ ...prev, workExperience: newWorkExp }));
  };

  const addWorkExp = () => {
    setFormData(prev => ({
      ...prev,
      workExperience: [...prev.workExperience, { company: "", position: "", dates: "", salary: "", status: "", yearsExp: "" }]
    }));
  };

  const removeWorkExp = (index: number) => {
    setFormData(prev => ({
      ...prev,
      workExperience: prev.workExperience.filter((_, i) => i !== index)
    }));
  };

  const validateStep1 = () => {
    const newErrors: Partial<FormData> = {};
    if (!formData.firstName) newErrors.firstName = "Required";
    if (!formData.lastName) newErrors.lastName = "Required";
    if (!formData.email) newErrors.email = "Required";
    if (!formData.contact) newErrors.contact = "Required";
    if (!formData.address) newErrors.address = "Required";
    if (!formData.dob) newErrors.dob = "Required";
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateStep2 = () => {
    if (!formData.education) {
      setErrors({ education: "Required" });
      return false;
    }
    return true;
  };

  const validateStep3 = () => {
    if (!formData.courseSlug) {
      setErrors({ courseSlug: "Please select a course" });
      return false;
    }
    return true;
  };

  const handleNext = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    if (step === 1 && validateStep1()) {
      setStep(2);
    } else if (step === 2 && validateStep2()) {
      setStep(3);
    } else if (step === 3 && validateStep3()) {
      setStep(4);
    }
  };

  const handleBack = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    if (step > 1) setStep((step - 1) as Step);
  };

  const handleSubmit = () => {
    const num = Math.floor(1000 + Math.random() * 9000);
    setRefNo(`19030612340${num}`);
    setSubmitted(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handlePrint = () => {
    window.print();
  };

  const selectedCourse = coursesData?.find(c => c.slug === formData.courseSlug);

  if (submitted) {
    return (
      <div className="w-full bg-slate-50 min-h-screen py-12 md:py-20 animate-in fade-in duration-700">
        <div className="container mx-auto px-4 max-w-5xl">
           <div className="bg-white rounded-3xl p-8 md:p-12 border border-slate-200 shadow-2xl shadow-slate-200/50 text-center mb-8">
              <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-6 scale-110">
                 <CheckCircle2 className="w-10 h-10" />
              </div>
              <h1 className="text-4xl font-black tracking-tight mb-2">Success!</h1>
              <p className="text-slate-500 max-w-md mx-auto mb-8 text-lg">Your application has been received. Your official TESDA admission slip is ready for download.</p>
              
              <div className="inline-flex items-center gap-4 bg-slate-50 p-6 rounded-2xl border border-slate-100 mb-10">
                 <div className="text-left">
                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Reference Number</p>
                    <p className="text-2xl font-mono font-bold text-slate-800 tracking-wider">{refNo}</p>
                 </div>
                 <div className="h-10 w-px bg-slate-200"></div>
                 <button onClick={handlePrint} className="flex items-center gap-2 bg-primary text-white px-6 py-3 rounded-xl font-bold hover:shadow-lg hover:shadow-primary/30 transition-all">
                    <Printer className="w-5 h-5" /> Print / Download
                 </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-lg mx-auto">
                 <Link href="/dashboard" className="flex items-center justify-center gap-2 p-4 rounded-xl border border-slate-200 font-bold hover:bg-slate-50 transition-all">
                    Go to Dashboard <ArrowRight className="w-4 h-4" />
                 </Link>
                 <button onClick={() => setSubmitted(false)} className="text-slate-400 text-sm font-bold hover:text-primary transition-all">
                    Submit another application
                 </button>
              </div>
           </div>

           {/* ACTUAL PRINTABLE FORM PREVIEW */}
           <div className="relative group">
              <div className="absolute -top-6 left-1/2 -translate-x-1/2 bg-white px-4 py-1 rounded-full border border-slate-200 text-[10px] font-black uppercase tracking-widest text-slate-400 shadow-sm z-10">
                 Official Form Preview
              </div>
              <div className="overflow-hidden rounded-2xl border border-slate-200 shadow-sm opacity-90 group-hover:opacity-100 transition-opacity">
                <div className="scale-[0.8] origin-top md:scale-[1] flex justify-center py-8 bg-slate-800/5 backdrop-blur-sm">
                   <PrintableTESDAForm data={{ ...formData, courseName: selectedCourse?.name }} refNo={refNo} />
                </div>
              </div>
           </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full bg-[#fdfdfd] min-h-screen py-12 md:py-24">
      <div className="container mx-auto px-4 max-w-4xl">
        
        {/* Minimalist Header */}
        <div className="text-center mb-16 space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-primary/5 rounded-full border border-primary/10 text-primary mb-2">
             <Sparkles className="w-3 h-3" />
             <span className="text-[10px] font-black uppercase tracking-[0.2em]">Application Portal</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-black tracking-tight text-slate-900 leading-none">Admission Form</h1>
          <p className="text-slate-400 text-base max-w-md mx-auto font-medium">Join {schoolInfo.shortName} and master the skills of the future.</p>
        </div>

        {/* Minimalist Stepper */}
        <div className="flex items-center justify-center gap-3 mb-16">
          {[1, 2, 3, 4].map((s) => (
            <div key={s} className="flex items-center gap-3">
              <div className={cn(
                "h-2 rounded-full transition-all duration-500",
                step === s ? "w-12 bg-primary" : s < step ? "w-4 bg-primary/40" : "w-4 bg-slate-200"
              )} />
              {s < 4 && <div className="w-1 h-1 rounded-full bg-slate-200" />}
            </div>
          ))}
          <div className="ml-6 px-3 py-1 bg-slate-100 rounded-lg text-[10px] font-black uppercase tracking-widest text-slate-500">
             Step {step} of 4
          </div>
        </div>

        {/* Form Container - Minimalist style */}
        <div className="bg-white rounded-[2.5rem] p-8 md:p-14 border border-slate-100 shadow-[0_32px_64px_-16px_rgba(0,0,0,0.05)]">
          
          {/* Step 1: Profile */}
          {step === 1 && (
            <div className="animate-in fade-in slide-in-from-bottom-6 duration-700 space-y-12">
              <div className="space-y-2">
                <h2 className="text-3xl font-black text-slate-900">Personal Profile</h2>
                <p className="text-slate-400 text-sm font-medium">Fill in your identity details as per official records.</p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-4 gap-x-8 gap-y-10">
                <div className="md:col-span-2 space-y-8">
                   <div className="group space-y-2">
                      <Label className="text-xs font-black uppercase tracking-widest text-slate-400 group-focus-within:text-primary transition-colors">Surname</Label>
                      <input name="lastName" value={formData.lastName} onChange={handleChange} className="w-full bg-slate-50/50 border-b-2 border-slate-100 px-0 py-3 text-lg font-bold focus:outline-none focus:border-primary transition-all placeholder:text-slate-200" placeholder="e.g. Dela Cruz" />
                      {errors.lastName && <p className="text-[10px] font-bold text-destructive uppercase tracking-widest">{errors.lastName}</p>}
                   </div>
                   <div className="group space-y-2">
                      <Label className="text-xs font-black uppercase tracking-widest text-slate-400 group-focus-within:text-primary transition-colors">First Name</Label>
                      <input name="firstName" value={formData.firstName} onChange={handleChange} className="w-full bg-slate-50/50 border-b-2 border-slate-100 px-0 py-3 text-lg font-bold focus:outline-none focus:border-primary transition-all placeholder:text-slate-200" placeholder="e.g. Juan" />
                      {errors.firstName && <p className="text-[10px] font-bold text-destructive uppercase tracking-widest">{errors.firstName}</p>}
                   </div>
                </div>

                <div className="md:col-span-2 space-y-8">
                   <div className="group space-y-2">
                      <Label className="text-xs font-black uppercase tracking-widest text-slate-400 group-focus-within:text-primary transition-colors">Middle Name</Label>
                      <input name="middleName" value={formData.middleName} onChange={handleChange} className="w-full bg-slate-50/50 border-b-2 border-slate-100 px-0 py-3 text-lg font-bold focus:outline-none focus:border-primary transition-all placeholder:text-slate-200" placeholder="Santos" />
                   </div>
                   <div className="group space-y-2">
                      <Label className="text-xs font-black uppercase tracking-widest text-slate-400 group-focus-within:text-primary transition-colors">Extension</Label>
                      <input name="extensionName" value={formData.extensionName} onChange={handleChange} className="w-full bg-slate-50/50 border-b-2 border-slate-100 px-0 py-3 text-lg font-bold focus:outline-none focus:border-primary transition-all placeholder:text-slate-200" placeholder="e.g. Jr." />
                   </div>
                </div>

                <div className="md:col-span-4 grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-10 pt-8 border-t border-slate-50">
                   <div className="group space-y-2">
                      <Label className="text-xs font-black uppercase tracking-widest text-slate-400">Street Address</Label>
                      <input name="address" value={formData.address} onChange={handleChange} className="w-full border-b border-slate-200 py-2 focus:outline-none focus:border-primary font-bold" />
                   </div>
                   <div className="group space-y-2">
                      <Label className="text-xs font-black uppercase tracking-widest text-slate-400">Barangay</Label>
                      <input name="barangay" value={formData.barangay} onChange={handleChange} className="w-full border-b border-slate-200 py-2 focus:outline-none focus:border-primary font-bold" />
                   </div>
                   <div className="group space-y-2">
                      <Label className="text-xs font-black uppercase tracking-widest text-slate-400">City & Province</Label>
                      <div className="flex gap-4">
                         <input name="city" value={formData.city} onChange={handleChange} className="flex-1 border-b border-slate-200 py-2 focus:outline-none focus:border-primary font-bold" />
                         <input name="province" value={formData.province} onChange={handleChange} className="flex-1 border-b border-slate-200 py-2 focus:outline-none focus:border-primary font-bold" />
                      </div>
                   </div>
                   <div className="group space-y-2">
                      <Label className="text-xs font-black uppercase tracking-widest text-slate-400">Contact Number</Label>
                      <input name="contact" value={formData.contact} onChange={handleChange} className="w-full border-b border-slate-200 py-2 focus:outline-none focus:border-primary font-bold" placeholder="09XX-XXX-XXXX" />
                   </div>
                </div>

                <div className="md:col-span-4 grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-10 pt-8 border-t border-slate-50">
                   <div className="group space-y-2">
                      <Label className="text-xs font-black uppercase tracking-widest text-slate-400">Email Address</Label>
                      <input type="email" name="email" value={formData.email} onChange={handleChange} className="w-full border-b border-slate-200 py-2 focus:outline-none focus:border-primary font-bold" placeholder="your@email.com" />
                   </div>
                   <div className="group space-y-2">
                      <Label className="text-xs font-black uppercase tracking-widest text-slate-400">Date of Birth</Label>
                      <input type="date" name="dob" value={formData.dob} onChange={handleChange} className="w-full border-b border-slate-200 py-2 focus:outline-none focus:border-primary font-bold" />
                   </div>
                   <div className="group space-y-2">
                      <Label className="text-xs font-black uppercase tracking-widest text-slate-400">Birthplace</Label>
                      <input name="birthPlace" value={formData.birthPlace} onChange={handleChange} className="w-full border-b border-slate-200 py-2 focus:outline-none focus:border-primary font-bold" placeholder="City/Municipality, Province" />
                   </div>
                   <div className="group space-y-2">
                      <Label className="text-xs font-black uppercase tracking-widest text-slate-400">Sex / Gender</Label>
                      <Select value={formData.gender} onValueChange={(v) => setFormData(p => ({...p, gender: v}))}>
                        <SelectTrigger className="border-b border-slate-200 rounded-none h-10 px-0 font-bold focus:ring-0"><SelectValue placeholder="Select Gender" /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Male">Male</SelectItem>
                          <SelectItem value="Female">Female</SelectItem>
                        </SelectContent>
                      </Select>
                   </div>
                   <div className="group space-y-2">
                      <Label className="text-xs font-black uppercase tracking-widest text-slate-400">Civil Status</Label>
                      <Select value={formData.civilStatus} onValueChange={(v) => setFormData(p => ({...p, civilStatus: v}))}>
                        <SelectTrigger className="border-b border-slate-200 rounded-none h-10 px-0 font-bold focus:ring-0"><SelectValue placeholder="Select Status" /></SelectTrigger>
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
            </div>
          )}

          {/* Step 2: Background */}
          {step === 2 && (
            <div className="animate-in fade-in slide-in-from-bottom-6 duration-700 space-y-12">
              <div className="space-y-2">
                <h2 className="text-3xl font-black text-slate-900">Background</h2>
                <p className="text-slate-400 text-sm font-medium">Educational and professional history.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                <div className="space-y-2">
                  <Label className="text-xs font-black uppercase tracking-widest text-slate-400">Educational Attainment</Label>
                  <Select value={formData.education} onValueChange={(v) => setFormData(p => ({...p, education: v}))}>
                    <SelectTrigger className="border-none bg-slate-50 rounded-2xl h-14 font-bold text-slate-700 px-6"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Elementary graduate">Elementary graduate</SelectItem>
                      <SelectItem value="HS graduate">HS graduate</SelectItem>
                      <SelectItem value="TVET Graduate">TVET Graduate</SelectItem>
                      <SelectItem value="College Level">College Level</SelectItem>
                      <SelectItem value="College Graduate">College Graduate</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label className="text-xs font-black uppercase tracking-widest text-slate-400">Employment Status</Label>
                  <Select value={formData.employmentStatus} onValueChange={(v) => setFormData(p => ({...p, employmentStatus: v}))}>
                    <SelectTrigger className="border-none bg-slate-50 rounded-2xl h-14 font-bold text-slate-700 px-6"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Permanent">Permanent</SelectItem>
                      <SelectItem value="Contractual">Contractual</SelectItem>
                      <SelectItem value="Self-Employed">Self-Employed</SelectItem>
                      <SelectItem value="Unemployed">Unemployed</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-6">
                 <div className="flex items-center justify-between">
                    <h3 className="text-sm font-black uppercase tracking-[0.2em] text-slate-400">Work Experience</h3>
                    <button type="button" onClick={addWorkExp} className="text-[10px] font-black text-primary uppercase tracking-widest bg-primary/5 px-4 py-2 rounded-full border border-primary/10">Add Work</button>
                 </div>

                 {formData.workExperience.length > 0 ? (
                    <div className="space-y-4">
                       {formData.workExperience.map((exp, idx) => (
                          <div key={idx} className="grid grid-cols-1 md:grid-cols-5 gap-4 bg-slate-50/50 p-4 rounded-3xl border border-slate-100 group animate-in zoom-in-95 duration-300">
                             <input className="md:col-span-2 bg-white border border-slate-200 rounded-xl px-4 py-2 text-sm font-bold focus:outline-none focus:ring-1 focus:ring-primary" value={exp.company} onChange={(e) => handleWorkExpChange(idx, "company", e.target.value)} placeholder="Company" />
                             <input className="bg-white border border-slate-200 rounded-xl px-4 py-2 text-sm font-bold" value={exp.position} onChange={(e) => handleWorkExpChange(idx, "position", e.target.value)} placeholder="Position" />
                             <input className="bg-white border border-slate-200 rounded-xl px-4 py-2 text-sm font-bold" value={exp.dates} onChange={(e) => handleWorkExpChange(idx, "dates", e.target.value)} placeholder="Dates" />
                             <div className="flex items-center gap-2">
                                <input className="flex-1 bg-white border border-slate-200 rounded-xl px-4 py-2 text-sm font-bold" value={exp.yearsExp} onChange={(e) => handleWorkExpChange(idx, "yearsExp", e.target.value)} placeholder="Yrs" />
                                <button onClick={() => removeWorkExp(idx)} className="p-2 text-rose-500 hover:bg-rose-50 rounded-lg"><Trash2 className="w-4 h-4" /></button>
                             </div>
                          </div>
                       ))}
                    </div>
                 ) : (
                    <div className="p-12 border-2 border-dashed border-slate-100 rounded-[2rem] text-center">
                       <p className="text-slate-300 text-sm font-medium">No work experience listed. Add one if relevant to your chosen course.</p>
                    </div>
                 )}
              </div>
            </div>
          )}

          {/* Step 3: Program */}
          {step === 3 && (
            <div className="animate-in fade-in slide-in-from-bottom-6 duration-700 space-y-12">
              <div className="space-y-2">
                <h2 className="text-3xl font-black text-slate-900">The Program</h2>
                <p className="text-slate-400 text-sm font-medium">Select your desired qualification and schedule.</p>
              </div>

              <div className="space-y-8">
                 <div className="grid grid-cols-1 gap-4">
                    {coursesData.map(course => (
                       <label key={course.id} className={cn(
                          "flex items-center justify-between p-6 rounded-3xl border-2 transition-all cursor-pointer group",
                          formData.courseSlug === course.slug ? "border-primary bg-primary/5 shadow-lg shadow-primary/5" : "border-slate-50 bg-slate-50/50 hover:border-slate-100"
                       )}>
                          <div className="flex items-center gap-5">
                             <RadioGroupItem value={course.slug} checked={formData.courseSlug === course.slug} onSelect={() => setFormData(p => ({...p, courseSlug: course.slug}))} className="hidden" />
                             <div className={cn("w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all", formData.courseSlug === course.slug ? "border-primary bg-primary" : "border-slate-300 bg-white")}>
                                {formData.courseSlug === course.slug && <CheckCircle2 className="w-4 h-4 text-white" />}
                             </div>
                             <div className="space-y-0.5">
                                <p className="font-bold text-lg text-slate-800">{course.name}</p>
                                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">{course.ncLevel} • {course.sector}</p>
                             </div>
                          </div>
                          {course.twspScholarship === "true" && (
                             <span className="bg-emerald-500 text-white text-[9px] font-black px-3 py-1 rounded-full uppercase tracking-widest">Scholarship</span>
                          )}
                       </label>
                    ))}
                 </div>
              </div>
            </div>
          )}

          {/* Step 4: Review */}
          {step === 4 && (
            <div className="animate-in fade-in slide-in-from-bottom-6 duration-700 space-y-12">
              <div className="space-y-2">
                <h2 className="text-3xl font-black text-slate-900">Review</h2>
                <p className="text-slate-400 text-sm font-medium">Check your application before submission.</p>
              </div>

              <div className="space-y-8">
                 <div className="p-8 bg-slate-900 rounded-[2.5rem] text-white space-y-6">
                    <div className="flex justify-between items-start">
                       <div className="space-y-1">
                          <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500">Applicant</p>
                          <h3 className="text-2xl font-bold">{formData.firstName} {formData.lastName}</h3>
                       </div>
                       <button onClick={() => setStep(1)} className="text-[10px] font-black uppercase tracking-widest bg-white/10 hover:bg-white/20 px-4 py-2 rounded-full transition-all">Edit</button>
                    </div>
                    <div className="grid grid-cols-2 gap-8 text-sm">
                       <div>
                          <p className="text-slate-500 text-[10px] font-black uppercase mb-1">Contact</p>
                          <p className="font-medium">{formData.email}</p>
                          <p className="font-medium">{formData.contact}</p>
                       </div>
                       <div>
                          <p className="text-slate-500 text-[10px] font-black uppercase mb-1">Qualification</p>
                          <p className="font-medium">{selectedCourse?.name}</p>
                       </div>
                    </div>
                 </div>

                 <div className="flex items-start gap-4 p-6 bg-amber-50 rounded-3xl border border-amber-100 text-amber-700">
                    <HelpCircle className="w-6 h-6 shrink-0 mt-1 opacity-50" />
                    <p className="text-xs font-medium leading-relaxed">By submitting, you agree that all information is true. Your official Admission Slip will be generated immediately after clicking "Confirm & Submit".</p>
                 </div>
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex justify-between items-center mt-16 pt-10 border-t border-slate-50">
            <div className="flex items-center gap-4">
              {step > 1 ? (
                <button onClick={handleBack} className="flex items-center gap-2 text-sm font-black uppercase tracking-widest text-slate-400 hover:text-slate-600 transition-all">
                  <ChevronLeft className="w-4 h-4" /> Back
                </button>
              ) : <div />}
            </div>
            
            <div className="flex items-center gap-6">
               <button onClick={() => setLocation("/dashboard")} className="text-xs font-black uppercase tracking-widest text-slate-400 hover:text-primary transition-all">
                 Skip for Now
               </button>
               <PrimaryButton onClick={step < 4 ? handleNext : handleSubmit} className="rounded-full px-12 py-6 h-auto text-base font-black uppercase tracking-widest shadow-2xl shadow-primary/20">
                  {step < 4 ? "Continue" : "Confirm & Submit"}
               </PrimaryButton>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
