import { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { CheckCircle2, ChevronLeft, ChevronRight, GraduationCap } from "lucide-react";
import { courses } from "@/lib/mock-data";
import PrimaryButton from "@/components/primary-button";
import FormInputField from "@/components/form-input-field";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import ModalSuccess from "@/components/modal-success";

type Step = 1 | 2 | 3;

interface FormData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  country: string;
  courseSlug: string;
}

export default function EnrollPage() {
  const [_, setLocation] = useLocation();
  const [step, setStep] = useState<Step>(1);
  const [modalOpen, setModalOpen] = useState(false);
  const [refNo, setRefNo] = useState("");
  const [errors, setErrors] = useState<Partial<FormData>>({});
  
  const [formData, setFormData] = useState<FormData>({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    country: "",
    courseSlug: ""
  });

  // Read ?course=slug from URL
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const courseParam = params.get("course");
    if (courseParam && courses.some(c => c.slug === courseParam)) {
      setFormData(prev => ({ ...prev, courseSlug: courseParam }));
      // If course is preselected, we could optionally start at step 1 and skip step 2 later, 
      // but for simplicity we'll just pre-fill step 2.
    }
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name as keyof FormData]) {
      setErrors(prev => ({ ...prev, [name]: undefined }));
    }
  };

  const validateStep1 = () => {
    const newErrors: Partial<FormData> = {};
    if (!formData.firstName) newErrors.firstName = "First name is required";
    if (!formData.lastName) newErrors.lastName = "Last name is required";
    if (!formData.email) newErrors.email = "Email is required";
    else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = "Invalid email format";
    if (!formData.phone) newErrors.phone = "Phone is required";
    if (!formData.country) newErrors.country = "Country is required";
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateStep2 = () => {
    if (!formData.courseSlug) {
      setErrors({ courseSlug: "Please select a course" });
      return false;
    }
    return true;
  };

  const handleNext = () => {
    if (step === 1 && validateStep1()) {
      setStep(2);
    } else if (step === 2 && validateStep2()) {
      setStep(3);
    }
  };

  const handleBack = () => {
    if (step > 1) setStep((step - 1) as Step);
  };

  const handleSubmit = () => {
    const num = Math.floor(1000 + Math.random() * 9000);
    setRefNo(`LISTA-2026-${num}`);
    setModalOpen(true);
  };

  const selectedCourse = courses.find(c => c.slug === formData.courseSlug);

  return (
    <div className="min-h-screen bg-slate-50 py-12">
      <div className="container mx-auto px-4 max-w-3xl">
        {/* Header */}
        <div className="text-center mb-10">
          <Link href="/" className="inline-flex items-center justify-center p-3 bg-white rounded-full shadow-sm mb-6 text-primary">
            <GraduationCap className="w-8 h-8" />
          </Link>
          <h1 className="text-3xl font-extrabold tracking-tight">Application for Admission</h1>
        </div>

        {/* Stepper */}
        <div className="flex items-center justify-between mb-12 relative">
          <div className="absolute left-0 top-1/2 w-full h-0.5 bg-card-border -z-10 -translate-y-1/2"></div>
          <div className="absolute left-0 top-1/2 h-0.5 bg-primary -z-10 -translate-y-1/2 transition-all duration-500" style={{ width: step === 1 ? '0%' : step === 2 ? '50%' : '100%' }}></div>
          
          {[1, 2, 3].map((s) => (
            <div key={s} className={cn(
              "w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm border-2 transition-colors",
              step >= s ? "bg-primary border-primary text-primary-foreground" : "bg-white border-card-border text-muted-foreground"
            )}>
              {step > s ? <CheckCircle2 className="w-5 h-5" /> : s}
            </div>
          ))}
        </div>

        {/* Form Container */}
        <div className="bg-white rounded-3xl p-8 md:p-12 border border-card-border shadow-sm">
          
          {/* Step 1: Personal Info */}
          {step === 1 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold mb-2">Personal Information</h2>
                <p className="text-muted-foreground">Tell us about yourself.</p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormInputField 
                  label="First Name" 
                  name="firstName" 
                  value={formData.firstName} 
                  onChange={handleChange}
                  error={errors.firstName}
                  placeholder="e.g. Jane"
                />
                <FormInputField 
                  label="Last Name" 
                  name="lastName" 
                  value={formData.lastName} 
                  onChange={handleChange}
                  error={errors.lastName}
                  placeholder="e.g. Doe"
                />
                <FormInputField 
                  label="Email Address" 
                  name="email" 
                  type="email"
                  value={formData.email} 
                  onChange={handleChange}
                  error={errors.email}
                  placeholder="jane@example.com"
                />
                <FormInputField 
                  label="Phone Number" 
                  name="phone" 
                  value={formData.phone} 
                  onChange={handleChange}
                  error={errors.phone}
                  placeholder="+1 (555) 000-0000"
                />
                <div className="md:col-span-2">
                  <FormInputField 
                    label="Country of Residence" 
                    name="country" 
                    value={formData.country} 
                    onChange={handleChange}
                    error={errors.country}
                    placeholder="e.g. United States"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Course Selection */}
          {step === 2 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold mb-2">Select a Program</h2>
                <p className="text-muted-foreground">Choose the course you wish to enroll in.</p>
                {errors.courseSlug && <p className="text-sm font-bold text-destructive mt-2">{errors.courseSlug}</p>}
              </div>

              <RadioGroup 
                value={formData.courseSlug} 
                onValueChange={(val) => {
                  setFormData(prev => ({...prev, courseSlug: val}));
                  setErrors({});
                }}
                className="grid grid-cols-1 gap-4"
              >
                {courses.map(course => (
                  <Label 
                    key={course.slug} 
                    htmlFor={course.slug}
                    className={cn(
                      "flex items-center justify-between p-4 rounded-xl border-2 cursor-pointer transition-all",
                      formData.courseSlug === course.slug 
                        ? "border-primary bg-primary/5" 
                        : "border-card-border hover:border-primary/50 bg-white"
                    )}
                  >
                    <div className="flex items-center gap-4">
                      <RadioGroupItem value={course.slug} id={course.slug} />
                      <div>
                        <p className="font-bold text-lg">{course.title}</p>
                        <p className="text-sm text-muted-foreground">{course.durationWeeks} weeks • {course.level}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-primary">${course.priceUSD}</p>
                    </div>
                  </Label>
                ))}
              </RadioGroup>
            </div>
          )}

          {/* Step 3: Review */}
          {step === 3 && (
            <div className="space-y-8">
              <div>
                <h2 className="text-2xl font-bold mb-2">Review Application</h2>
                <p className="text-muted-foreground">Please confirm your details before submitting.</p>
              </div>

              <div className="space-y-6">
                <div className="bg-slate-50 p-6 rounded-2xl border border-card-border">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="font-bold uppercase tracking-wider text-xs text-muted-foreground">Personal Details</h3>
                    <button onClick={() => setStep(1)} className="text-xs font-bold text-primary hover:underline">Edit</button>
                  </div>
                  <div className="grid grid-cols-2 gap-y-4 text-sm">
                    <div>
                      <p className="text-muted-foreground">Full Name</p>
                      <p className="font-bold">{formData.firstName} {formData.lastName}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Email</p>
                      <p className="font-bold">{formData.email}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Phone</p>
                      <p className="font-bold">{formData.phone}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Country</p>
                      <p className="font-bold">{formData.country}</p>
                    </div>
                  </div>
                </div>

                <div className="bg-slate-50 p-6 rounded-2xl border border-card-border">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="font-bold uppercase tracking-wider text-xs text-muted-foreground">Selected Program</h3>
                    <button onClick={() => setStep(2)} className="text-xs font-bold text-primary hover:underline">Edit</button>
                  </div>
                  {selectedCourse && (
                    <div>
                      <p className="font-bold text-lg">{selectedCourse.title}</p>
                      <p className="text-sm text-muted-foreground">{selectedCourse.category} • {selectedCourse.durationWeeks} weeks</p>
                      <p className="font-bold text-primary mt-2">Tuition: ${selectedCourse.priceUSD}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Form Actions */}
          <div className="flex justify-between mt-10 pt-6 border-t border-card-border">
            {step > 1 ? (
              <PrimaryButton variant="outline" onClick={handleBack} className="bg-white">
                <ChevronLeft className="w-4 h-4 mr-2" /> Back
              </PrimaryButton>
            ) : <div></div>}
            
            {step < 3 ? (
              <PrimaryButton onClick={handleNext}>
                Next Step <ChevronRight className="w-4 h-4 ml-2" />
              </PrimaryButton>
            ) : (
              <PrimaryButton onClick={handleSubmit} className="px-8">
                Submit Application
              </PrimaryButton>
            )}
          </div>

        </div>
      </div>

      <ModalSuccess
        open={modalOpen}
        onOpenChange={(open) => {
          setModalOpen(open);
          if (!open) setLocation("/login");
        }}
        title="Application Received"
        description={`Your application for ${selectedCourse?.title} has been successfully submitted. We will review it shortly.`}
        footer={
          <div className="w-full space-y-4">
             <div className="bg-slate-50 p-4 rounded-xl border border-card-border text-center">
                <p className="text-xs text-muted-foreground font-bold uppercase mb-1">Reference Number</p>
                <p className="text-lg font-mono font-bold text-foreground">{refNo}</p>
             </div>
             <PrimaryButton className="w-full" onClick={() => setLocation("/login")}>
                Go to Login
             </PrimaryButton>
          </div>
        }
      />
    </div>
  );
}
