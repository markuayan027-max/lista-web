import { useEffect, useMemo, useState, memo, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  User, Mail, MapPin, BookOpen, Calendar,
  Download, FileSpreadsheet, FileText, ShieldCheck, CreditCard, GraduationCap,
  Globe, Hash, ArrowUpRight,
  Clock, CheckCircle, Search, Upload, UserCheck, GraduationCap as EnrolledIcon, Camera, Pencil
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/context/auth-context";
import { courses } from "@/lib/institutional-data";
import type { Enrollment } from "@/lib/institutional-data";
import { exportSingleTraineeToExcel, exportSingleTraineeToWord } from "@/lib/export-utils";
import StatusBadge from "@/components/status-badge";
import { cn } from "@/lib/utils";
import { fetchTraineeEnrollmentByEmail, updateTraineeEnrollmentByEmail } from "@/lib/trainee-enrollment-insforge";
import { loadLocalProfile, saveLocalProfile, calculateProfileCompletion, clearLocalProfile, saveProfilePic, loadProfilePic } from "@/lib/profile-utils";

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.05 } },
};

const item = {
  hidden: { opacity: 0, y: 4 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.2 },
  },
};

type EditableEnrollment = Omit<Enrollment, "status" | "consent" | "createdAt" | "id" | "refNo" | "userId">;

const TABS = [
  { id: "personal", label: "Profile", icon: User },
  { id: "registry", label: "Registry", icon: BookOpen },
  { id: "academic", label: "Education", icon: GraduationCap },
  { id: "program", label: "Program", icon: Calendar },
  { id: "docs", label: "Documents", icon: FileText },
];

type InfoRowProps = {
  label: string;
  value: string | React.ReactNode;
  icon?: any;
  className?: string;
  fieldKey?: keyof EditableEnrollment;
  isEditing: boolean;
  inputValue: string;
  onChange: (key: keyof EditableEnrollment, value: string) => void;
  options?: { label: string; value: string }[];
};

const InfoRow = ({
  label,
  value,
  icon: Icon,
  fieldKey,
  className,
  isEditing,
  inputValue,
  onChange,
  options,
}: InfoRowProps) => (
  <div className={cn("flex flex-col gap-1.5 p-3 rounded-lg border border-zinc-200 bg-white", className)}>
    <div className="flex items-center gap-2 text-zinc-500">
      {Icon && <Icon className="h-3.5 w-3.5" />}
      <p className="text-xs font-medium">{label}</p>
    </div>
    {isEditing && fieldKey ? (
      options ? (
        <Select value={inputValue || ""} onValueChange={(val) => onChange(fieldKey, val)}>
          <SelectTrigger className="h-8 text-sm font-medium border-zinc-200 bg-zinc-50 focus:bg-white focus:ring-1 focus:ring-zinc-900 transition-colors">
            <SelectValue placeholder={`Select ${label}`} />
          </SelectTrigger>
          <SelectContent>
            {options.map((opt) => (
              <SelectItem key={opt.value} value={opt.value}>
                {opt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      ) : (
        <input
          type="text"
          className="w-full bg-zinc-50 border border-zinc-200 rounded-md px-2.5 py-1.5 text-sm font-medium text-zinc-900 focus:outline-none focus:ring-1 focus:ring-zinc-900 focus:bg-white transition-colors"
          value={inputValue || ""}
          onChange={(e) => onChange(fieldKey, e.target.value)}
        />
      )
    ) : (
      <p className="text-sm font-semibold text-zinc-900 pl-5">{value || "—"}</p>
    )}
  </div>
);

const MemoizedInfoRow = memo(InfoRow);

export default function TraineeProfilePage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("personal");

  const [existing, setExisting] = useState<Enrollment | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const [form, setForm] = useState<Partial<EditableEnrollment>>({});

  // ── Profile picture ──────────────────────────────────────────────────────
  const [profilePic, setProfilePic] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setProfilePic(loadProfilePic());
  }, []);

  const handleAvatarChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const maxBytes = 5 * 1024 * 1024; // 5 MB raw limit
    if (file.size > maxBytes) {
      toast({ title: "File too large", description: "Please choose an image smaller than 5 MB.", variant: "destructive" });
      return;
    }
    const reader = new FileReader();
    reader.onload = (ev) => {
      const original = ev.target?.result as string;
      // Compress to ≤200 KB JPEG via canvas
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        const MAX = 400; // px — enough for a circular avatar
        const scale = Math.min(1, MAX / Math.max(img.width, img.height));
        canvas.width = img.width * scale;
        canvas.height = img.height * scale;
        canvas.getContext("2d")?.drawImage(img, 0, 0, canvas.width, canvas.height);
        const compressed = canvas.toDataURL("image/jpeg", 0.75);
        setProfilePic(compressed);
        saveProfilePic(compressed);
        toast({ title: "Photo updated", description: "Your profile picture has been saved." });
      };
      img.src = original;
    };
    reader.readAsDataURL(file);
    // Reset input so the same file can be chosen again
    e.target.value = "";
  }, [toast]);

  useEffect(() => {
    if (!user?.email) {
      return;
    }

    const fetchProfile = async () => {
      try {
        const data = await fetchTraineeEnrollmentByEmail(user.email!);
        const draft = loadLocalProfile();
        
        if (data.success && data.data) {
          const dbData = data.data as unknown as Enrollment;
          
          const finalData = { 
            ...dbData, 
            ...Object.fromEntries(
              Object.entries(draft || {}).filter(([_, v]) => v !== "" && v !== null && v !== undefined && v !== "null")
            )
          };
          
          setExisting(finalData as unknown as Enrollment);
          setForm(finalData as unknown as EditableEnrollment);
        } else if (draft) {
          setExisting(draft as unknown as Enrollment);
          setForm(draft as unknown as EditableEnrollment);
        }
      } catch (err) {
        console.error("Error fetching profile", err);
        const draft = loadLocalProfile();
        if (draft) {
          setExisting(draft as unknown as Enrollment);
          setForm(draft as unknown as EditableEnrollment);
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchProfile();
  }, [user?.email]);

  useEffect(() => {
    if (isEditing && Object.keys(form).length > 0) {
      saveLocalProfile(form);
    }
  }, [form, isEditing]);

  const course = useMemo(() => 
    existing?.courseSlug ? courses.find((c) => c.slug === existing.courseSlug) : null
  , [existing?.courseSlug]);

  const mergedEnrollment = useMemo(
    () => ({ ...existing, ...form } as Enrollment),
    [existing, form]
  );

  const integrity = useMemo(() => calculateProfileCompletion(mergedEnrollment), [mergedEnrollment]);


  const handleChange = useCallback((key: keyof EditableEnrollment, value: string) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  }, []);

  const handleSave = async () => {
    if (!user?.email) return;

    // Validation
    if (!form.firstName?.trim() || !form.lastName?.trim() || !form.contactNumber?.trim()) {
      toast({ title: "Validation Error", description: "First Name, Last Name, and Contact Number are required.", variant: "destructive" });
      return;
    }

    const contactPattern = /^(09|\+639)\d{9}$/;
    if (form.contactNumber && !contactPattern.test(form.contactNumber)) {
      toast({ title: "Validation Error", description: "Invalid contact number. Please use 09XXXXXXXXX format.", variant: "destructive" });
      return;
    }

    setIsSaving(true);
    try {
      // Ensure age is a number before sending if it exists
      const payload: Partial<Enrollment> = { ...form } as Partial<Enrollment>;
      if (payload.age !== undefined && typeof payload.age === 'string') {
        payload.age = parseInt(payload.age, 10) || 0;
      }

      // If user selected a new course while status was cancelled or rejected, reset to pending
      if (payload.courseSlug && existing && (existing.status === "cancelled" || existing.status === "rejected")) {
        payload.status = "pending";
      }
      
      const data = await updateTraineeEnrollmentByEmail(user.email, payload);
      if (data.success) {
        setExisting(prev => ({ ...prev, ...payload }) as Enrollment);
        setIsEditing(false);
        clearLocalProfile();
        toast({ title: "Profile Updated", description: "Your information has been saved." });
      } else {
        toast({ title: "Update Failed", description: data.error || "Failed to save profile.", variant: "destructive" });
      }
    } catch (error) {
      toast({ title: "Error", description: "Network error occurred.", variant: "destructive" });
    } finally {
      setIsSaving(false);
    }
  };

  const handleDiscard = () => {
    setForm(existing as unknown as EditableEnrollment);
    setIsEditing(false);
    clearLocalProfile();
    toast({ title: "Changes Discarded", description: "Your profile has been reset." });
  };

  const handleExportExcel = () => {
    try {
      exportSingleTraineeToExcel(mergedEnrollment);
      toast({ title: "Excel Downloaded", description: "Your profile has been exported as .xlsx" });
    } catch {
      toast({ title: "Export Failed", description: "Could not generate Excel file.", variant: "destructive" });
    }
  };

  const handleExportWord = async () => {
    try {
      await exportSingleTraineeToWord(mergedEnrollment);
      toast({ title: "Word Downloaded", description: "Your admission form has been exported as .docx" });
    } catch {
      toast({ title: "Export Failed", description: "Could not generate Word document.", variant: "destructive" });
    }
  };

  if (isLoading) {
    return <div className="flex items-center justify-center min-h-[50vh]"><div className="w-5 h-5 border-2 border-zinc-900 border-t-transparent rounded-full animate-spin"></div></div>;
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-16 px-4 sm:px-6">
      {/* Header Section */}
      <motion.div 
        initial={{ opacity: 0, y: -5 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-6"
      >
        <div className="flex items-center gap-4">
          {/* ── Avatar (always clickable to upload) ── */}
          <div className="relative shrink-0">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleAvatarChange}
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="group relative w-16 h-16 rounded-full overflow-hidden border-2 border-zinc-200 hover:border-blue-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 transition-all shadow-sm"
              title="Click to change profile photo"
            >
              {profilePic ? (
                <img
                  src={profilePic}
                  alt="Profile"
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-zinc-100 flex items-center justify-center text-zinc-800">
                  <span className="text-xl font-semibold">{user?.name?.charAt(0) || "U"}</span>
                </div>
              )}
              {/* Hover overlay */}
              <span className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <Camera className="h-5 w-5 text-white" />
              </span>
            </button>
            {/* Persistent pencil badge */}
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="absolute bottom-0 right-0 w-5 h-5 bg-white rounded-full border border-zinc-200 shadow-sm flex items-center justify-center hover:bg-blue-50 hover:border-blue-300 transition-colors"
              title="Change photo"
            >
              <Camera className="h-2.5 w-2.5 text-zinc-600" />
            </button>
          </div>
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold tracking-tight text-zinc-900">
                {isEditing ? "Edit Profile" : `${form.firstName || user?.name?.split(' ')[0]}'s Profile`}
              </h1>
              {!isEditing && (
                <StatusBadge
                  status={
                    existing?.status === "confirmed" || existing?.status === "enrolled"
                      ? "confirmed"
                      : existing?.status === "rejected"
                        ? "rejected"
                        : existing?.status === "cancelled"
                          ? "cancelled"
                          : existing?.status === "review" || existing?.status === "interview"
                            ? "in_progress"
                            : "pending"
                  }
                />
              )}
            </div>
            <div className="flex items-center gap-3 text-zinc-500 text-xs font-medium">
              <span className="flex items-center gap-1">
                <Mail className="h-3.5 w-3.5" /> {user?.email}
              </span>
              <span className="text-zinc-300">•</span>
              <span className="flex items-center gap-1">
                <Hash className="h-3.5 w-3.5" /> {existing?.refNo || "LISTA-2026-PENDING"}
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {!isEditing ? (
            <>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm" className="h-9 gap-1.5 shadow-none border-zinc-200">
                    <Download className="h-3.5 w-3.5" /> Export
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <DropdownMenuItem onClick={handleExportExcel} className="gap-2 cursor-pointer">
                    <FileSpreadsheet className="h-4 w-4 text-emerald-600" />
                    <div className="flex flex-col">
                      <span className="text-sm font-medium">Spreadsheet</span>
                      <span className="text-[10px] text-zinc-500">Excel format</span>
                    </div>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={handleExportWord} className="gap-2 cursor-pointer">
                    <FileText className="h-4 w-4 text-blue-600" />
                    <div className="flex flex-col">
                      <span className="text-sm font-medium">Admission Form</span>
                      <span className="text-[10px] text-zinc-500">Word format</span>
                    </div>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
              <Button size="sm" onClick={() => setIsEditing(true)} className="h-9 gap-1.5 shadow-none">
                <Pencil className="h-3.5 w-3.5" /> Edit Profile
              </Button>
            </>
          ) : (
            <>
              <Button variant="ghost" size="sm" onClick={handleDiscard} className="h-9 text-zinc-600">
                Discard
              </Button>
              <Button size="sm" onClick={handleSave} disabled={isSaving} className="h-9 gap-1.5 shadow-none">
                {isSaving ? "Saving..." : "Save Profile"}
              </Button>
            </>
          )}
        </div>
      </motion.div>

      {/* Tabs */}
      <div className="flex items-center gap-1 border-b border-zinc-200 w-full overflow-x-auto no-scrollbar">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={cn(
              "flex items-center gap-2 px-4 py-2.5 text-sm font-medium transition-colors whitespace-nowrap border-b-2 -mb-px",
              activeTab === tab.id 
                ? "border-zinc-900 text-zinc-900" 
                : "border-transparent text-zinc-500 hover:text-zinc-800 hover:border-zinc-300"
            )}
          >
            <tab.icon className="h-4 w-4" />
            {tab.label}
          </button>
        ))}
      </div>

      {isEditing && (
        <div className="rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-900 flex items-center justify-between">
          <span className="font-medium">You are in edit mode. Changes won't apply until you save.</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Main Content Area */}
        <div className="lg:col-span-8 xl:col-span-9">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              variants={container}
              initial="hidden"
              animate="show"
              exit={{ opacity: 0, y: 4 }}
              className="space-y-6"
            >
              {activeTab === "personal" && (
                <>
                  <motion.div variants={item} className="space-y-3">
                    <h3 className="text-sm font-semibold text-zinc-900 border-b border-zinc-100 pb-1.5">Basic Information</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
                      {isEditing ? (
                        <>
                          <MemoizedInfoRow label="First Name" value={form.firstName || ""} icon={User} fieldKey="firstName" isEditing={isEditing} inputValue={form.firstName || ""} onChange={handleChange} />
                          <MemoizedInfoRow label="Middle Name" value={form.middleName || ""} icon={User} fieldKey="middleName" isEditing={isEditing} inputValue={form.middleName || ""} onChange={handleChange} />
                          <MemoizedInfoRow label="Last Name" value={form.lastName || ""} icon={User} fieldKey="lastName" isEditing={isEditing} inputValue={form.lastName || ""} onChange={handleChange} />
                          <MemoizedInfoRow label="Name Extension" value={form.extensionName || ""} icon={User} fieldKey="extensionName" isEditing={isEditing} inputValue={form.extensionName || ""} onChange={handleChange} />
                        </>
                      ) : (
                        <MemoizedInfoRow label="Full Name" value={`${form.firstName || ""} ${form.middleName || ""} ${form.lastName || ""} ${form.extensionName || ""}`.trim()} icon={User} className="md:col-span-2 xl:col-span-3" isEditing={isEditing} inputValue="" onChange={handleChange} />
                      )}
                      <MemoizedInfoRow label="Date of Birth" value={form.dob || ""} icon={Calendar} fieldKey="dob" isEditing={isEditing} inputValue={form.dob || ""} onChange={handleChange} />
                      <MemoizedInfoRow label="Birth Place" value={form.birthPlace || ""} icon={MapPin} fieldKey="birthPlace" isEditing={isEditing} inputValue={form.birthPlace || ""} onChange={handleChange} />
                      <MemoizedInfoRow 
                        label="Civil Status" 
                        value={form.civilStatus || ""} 
                        icon={Hash} 
                        fieldKey="civilStatus" 
                        isEditing={isEditing} 
                        inputValue={form.civilStatus || ""} 
                        onChange={handleChange} 
                        options={[
                          { label: "Single", value: "Single" },
                          { label: "Married", value: "Married" },
                          { label: "Widowed", value: "Widowed" },
                          { label: "Separated", value: "Separated" },
                        ]}
                      />
                      <MemoizedInfoRow 
                        label="Gender" 
                        value={form.gender || ""} 
                        icon={User} 
                        fieldKey="gender" 
                        isEditing={isEditing} 
                        inputValue={form.gender || ""} 
                        onChange={handleChange} 
                        options={[
                          { label: "Male", value: "Male" },
                          { label: "Female", value: "Female" },
                          { label: "Prefer not to say", value: "Prefer not to say" },
                        ]}
                      />
                      <MemoizedInfoRow label="Nationality" value={form.nationality || "Filipino"} icon={Globe} fieldKey="nationality" isEditing={isEditing} inputValue={form.nationality || ""} onChange={handleChange} />
                    </div>
                  </motion.div>

                  <motion.div variants={item} className="space-y-3">
                    <h3 className="text-sm font-semibold text-zinc-900 border-b border-zinc-100 pb-1.5">Location Details</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <MemoizedInfoRow label="Residential Address" value={form.homeAddress || ""} icon={MapPin} className="md:col-span-2" fieldKey="homeAddress" isEditing={isEditing} inputValue={form.homeAddress || ""} onChange={handleChange} />
                      <MemoizedInfoRow label="Barangay" value={form.barangay || ""} icon={MapPin} fieldKey="barangay" isEditing={isEditing} inputValue={form.barangay || ""} onChange={handleChange} />
                      <MemoizedInfoRow label="City / Municipality" value={form.city || ""} icon={MapPin} fieldKey="city" isEditing={isEditing} inputValue={form.city || ""} onChange={handleChange} />
                      <MemoizedInfoRow label="Province" value={form.province || ""} icon={MapPin} fieldKey="province" isEditing={isEditing} inputValue={form.province || ""} onChange={handleChange} />
                      <MemoizedInfoRow label="Region" value={form.region || ""} icon={MapPin} fieldKey="region" isEditing={isEditing} inputValue={form.region || ""} onChange={handleChange} />
                      <MemoizedInfoRow label="Zip Code" value={form.zipCode || ""} icon={MapPin} fieldKey="zipCode" isEditing={isEditing} inputValue={form.zipCode || ""} onChange={handleChange} />
                    </div>
                  </motion.div>
                </>
              )}

              {activeTab === "registry" && (
                <motion.div variants={item} className="space-y-6">
                  <div className="space-y-3">
                    <h3 className="text-sm font-semibold text-zinc-900 border-b border-zinc-100 pb-1.5">TESDA Registry</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <MemoizedInfoRow label="Unique Learner Identifier (ULI)" value={form.uli || ""} icon={Hash} fieldKey="uli" isEditing={isEditing} inputValue={form.uli || ""} onChange={handleChange} />
                      <MemoizedInfoRow 
                        label="Client Type" 
                        value={form.clientType || ""} 
                        icon={User} 
                        fieldKey="clientType" 
                        isEditing={isEditing} 
                        inputValue={form.clientType || ""} 
                        onChange={handleChange}
                        options={[
                          { label: "TVET Student", value: "TVET Student" },
                          { label: "Worker", value: "Worker" },
                          { label: "Displaced Worker", value: "Displaced Worker" },
                          { label: "Returning OFW", value: "Returning OFW" },
                        ]}
                      />
                      <MemoizedInfoRow 
                        label="Learner Classification" 
                        value={form.learnerClassification || ""} 
                        icon={User} 
                        fieldKey="learnerClassification" 
                        isEditing={isEditing} 
                        inputValue={form.learnerClassification || ""} 
                        onChange={handleChange}
                        options={[
                          { label: "Student", value: "Student" },
                          { label: "Unemployed", value: "Unemployed" },
                          { label: "Employed", value: "Employed" },
                        ]}
                      />
                      <MemoizedInfoRow 
                        label="Qualification Type" 
                        value={form.qualificationType || ""} 
                        icon={BookOpen} 
                        fieldKey="qualificationType" 
                        isEditing={isEditing} 
                        inputValue={form.qualificationType || ""} 
                        onChange={handleChange}
                        options={[
                          { label: "Full Qualification", value: "Full Qualification" },
                          { label: "COC", value: "COC" },
                        ]}
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    <h3 className="text-sm font-semibold text-zinc-900 border-b border-zinc-100 pb-1.5">Family Details</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <MemoizedInfoRow label="Father's Name" value={form.fatherName || ""} icon={User} fieldKey="fatherName" isEditing={isEditing} inputValue={form.fatherName || ""} onChange={handleChange} />
                      <MemoizedInfoRow label="Mother's Maiden Name" value={form.motherMaidenName || ""} icon={User} fieldKey="motherMaidenName" isEditing={isEditing} inputValue={form.motherMaidenName || ""} onChange={handleChange} />
                    </div>
                  </div>
                </motion.div>
              )}

              {activeTab === "academic" && (
                <motion.div variants={item} className="space-y-6">
                    <div className="space-y-3">
                      <h3 className="text-sm font-semibold text-zinc-900 border-b border-zinc-100 pb-1.5">Education Profile</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <div className="p-3 rounded-lg border border-zinc-200 bg-white">
                          <p className="text-xs font-medium text-zinc-500 mb-1">Highest Attainment</p>
                          {isEditing ? (
                            <Input className="h-8 text-sm" value={form.education || ""} onChange={e => handleChange("education", e.target.value)} />
                          ) : (
                            <p className="text-sm font-semibold text-zinc-900">{form.education || "Not specified"}</p>
                          )}
                        </div>
                        <div className="p-3 rounded-lg border border-zinc-200 bg-white">
                          <p className="text-xs font-medium text-zinc-500 mb-1">Employment Status</p>
                          {isEditing ? (
                            <Select value={form.employmentStatus || ""} onValueChange={(val) => handleChange("employmentStatus", val)}>
                              <SelectTrigger className="h-8 text-sm font-medium border-zinc-200 bg-zinc-50 focus:bg-white focus:ring-1 focus:ring-zinc-900 transition-colors">
                                <SelectValue placeholder="Select status" />
                              </SelectTrigger>
                              <SelectContent>
                                {[
                                  "Unemployed",
                                  "Underemployed",
                                  "Employed (seeking skills upgrade)",
                                  "Student",
                                ].map((s) => (
                                  <SelectItem key={s} value={s}>
                                    {s}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          ) : (
                            <Badge variant="secondary" className="bg-zinc-100 text-zinc-700 hover:bg-zinc-100 rounded-md font-medium">
                              {form.employmentStatus || "Not specified"}
                            </Badge>
                          )}
                        </div>
                        <div className="p-3 rounded-lg border border-zinc-200 bg-white md:col-span-2">
                          <p className="text-xs font-medium text-zinc-500 mb-1">Last Institution Attended</p>
                          {isEditing ? (
                            <Input className="h-8 text-sm" value={form.schoolLastAttended || ""} onChange={e => handleChange("schoolLastAttended", e.target.value)} />
                          ) : (
                            <p className="text-sm font-semibold text-zinc-900">{form.schoolLastAttended || "Not specified"}</p>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Section 4: Other Trainings */}
                    <div className="space-y-2">
                      <h3 className="text-sm font-semibold text-zinc-900">Other Training/Seminars Attended</h3>
                      <div className="rounded-lg border border-zinc-200 overflow-hidden">
                        <div className="overflow-x-auto">
                          <table className="w-full text-sm text-left">
                            <thead className="bg-zinc-50 text-xs font-medium text-zinc-500 border-b border-zinc-200">
                              <tr>
                                <th className="px-4 py-2 font-medium">Title</th>
                                <th className="px-4 py-2 font-medium">Venue</th>
                                <th className="px-4 py-2 font-medium">Dates</th>
                                <th className="px-4 py-2 font-medium">Hours</th>
                                <th className="px-4 py-2 font-medium">Conducted By</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-zinc-100 bg-white">
                              {(form.otherTrainings || []).length > 0 ? (
                                form.otherTrainings?.map((t, idx) => (
                                  <tr key={idx} className="hover:bg-zinc-50/50 transition-colors">
                                    <td className="px-4 py-2 text-zinc-900">{t.title}</td>
                                    <td className="px-4 py-2 text-zinc-600">{t.venue}</td>
                                    <td className="px-4 py-2 text-zinc-600">{t.inclusiveDates}</td>
                                    <td className="px-4 py-2 text-zinc-600">{t.noOfHours}</td>
                                    <td className="px-4 py-2 text-zinc-600">{t.conductedBy}</td>
                                  </tr>
                                ))
                              ) : (
                                <tr>
                                  <td colSpan={5} className="px-4 py-6 text-center text-xs text-zinc-500">No training records found.</td>
                                </tr>
                              )}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    </div>

                    {/* Section 5: Licensure Exams */}
                    <div className="space-y-2">
                      <h3 className="text-sm font-semibold text-zinc-900">Licensure Examination(s) Passed</h3>
                      <div className="rounded-lg border border-zinc-200 overflow-hidden">
                        <div className="overflow-x-auto">
                          <table className="w-full text-sm text-left">
                            <thead className="bg-zinc-50 text-xs font-medium text-zinc-500 border-b border-zinc-200">
                              <tr>
                                <th className="px-4 py-2 font-medium">Title</th>
                                <th className="px-4 py-2 font-medium">Year Taken</th>
                                <th className="px-4 py-2 font-medium">Venue</th>
                                <th className="px-4 py-2 font-medium">Rating</th>
                                <th className="px-4 py-2 font-medium">Remarks</th>
                                <th className="px-4 py-2 font-medium">Expiry Date</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-zinc-100 bg-white">
                              {(form.licensureExams || []).length > 0 ? (
                                form.licensureExams?.map((e, idx) => (
                                  <tr key={idx} className="hover:bg-zinc-50/50 transition-colors">
                                    <td className="px-4 py-2 text-zinc-900">{e.title}</td>
                                    <td className="px-4 py-2 text-zinc-600">{e.yearTaken}</td>
                                    <td className="px-4 py-2 text-zinc-600">{e.examinationVenue}</td>
                                    <td className="px-4 py-2 text-zinc-600">{e.rating}</td>
                                    <td className="px-4 py-2 text-zinc-600">{e.remarks}</td>
                                    <td className="px-4 py-2 text-zinc-600">{e.expiryDate}</td>
                                  </tr>
                                ))
                              ) : (
                                <tr>
                                  <td colSpan={6} className="px-4 py-6 text-center text-xs text-zinc-500">No licensure exams found.</td>
                                </tr>
                              )}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    </div>

                    {/* Section 6: Competency Assessments */}
                    <div className="space-y-2">
                      <h3 className="text-sm font-semibold text-zinc-900">Competency Assessment(s) Passed</h3>
                      <div className="rounded-lg border border-zinc-200 overflow-hidden">
                        <div className="overflow-x-auto">
                          <table className="w-full text-sm text-left">
                            <thead className="bg-zinc-50 text-xs font-medium text-zinc-500 border-b border-zinc-200">
                              <tr>
                                <th className="px-4 py-2 font-medium">Title</th>
                                <th className="px-4 py-2 font-medium">Qual. Level</th>
                                <th className="px-4 py-2 font-medium">Industry Sector</th>
                                <th className="px-4 py-2 font-medium">Certificate #</th>
                                <th className="px-4 py-2 font-medium">Date Issued</th>
                                <th className="px-4 py-2 font-medium">Expiration Date</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-zinc-100 bg-white">
                              {(form.competencyAssessments || []).length > 0 ? (
                                form.competencyAssessments?.map((c, idx) => (
                                  <tr key={idx} className="hover:bg-zinc-50/50 transition-colors">
                                    <td className="px-4 py-2 text-zinc-900">{c.title}</td>
                                    <td className="px-4 py-2 text-zinc-600">{c.qualificationLevel}</td>
                                    <td className="px-4 py-2 text-zinc-600">{c.industrySector}</td>
                                    <td className="px-4 py-2 text-zinc-600">{c.certificateNumber}</td>
                                    <td className="px-4 py-2 text-zinc-600">{c.dateOfIssuance}</td>
                                    <td className="px-4 py-2 text-zinc-600">{c.expirationDate}</td>
                                  </tr>
                                ))
                              ) : (
                                <tr>
                                  <td colSpan={6} className="px-4 py-6 text-center text-xs text-zinc-500">No competency assessments found.</td>
                                </tr>
                              )}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    </div>
                  </motion.div>
              )}

              {activeTab === "program" && (
                <motion.div variants={item} className="space-y-6">
                  {isEditing ? (
                    <div className="space-y-4 bg-white p-5 rounded-xl border border-zinc-200">
                      <div className="space-y-2">
                        <label className="text-sm font-semibold text-zinc-900 flex items-center gap-1.5">
                          <BookOpen className="h-4 w-4 text-zinc-500" /> Select Program
                        </label>
                        <Select value={form.courseSlug || "none"} onValueChange={(val) => handleChange("courseSlug", val === "none" ? "" : val)}>
                          <SelectTrigger className="w-full h-10 bg-zinc-50 border-zinc-200">
                            <SelectValue placeholder="Select a program to enroll in..." />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="none" className="text-zinc-500 italic">No program selected</SelectItem>
                            {courses.filter(c => c.isAvailable !== false).map((c) => (
                              <SelectItem key={c.slug} value={c.slug}>
                                {c.title} ({c.ncLevel})
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 pt-4 border-t border-zinc-100">
                        <div className="space-y-4">
                          <div className="space-y-2">
                            <label className="text-xs font-semibold text-zinc-700 flex items-center gap-1.5">
                              <Calendar className="h-3.5 w-3.5 text-zinc-500" /> Preferred Schedule
                            </label>
                            <Select value={form.preferredSchedule || ""} onValueChange={(val) => handleChange("preferredSchedule", val)}>
                              <SelectTrigger className="h-9 text-sm font-medium border-zinc-200 bg-zinc-50">
                                <SelectValue placeholder="Select schedule" />
                              </SelectTrigger>
                              <SelectContent>
                                {[
                                  "Morning (8:00 AM – 12:00 PM)",
                                  "Afternoon (1:00 PM – 5:00 PM)",
                                  "Full Day (8:00 AM – 5:00 PM)",
                                ].map((s) => (
                                  <SelectItem key={s} value={s}>{s}</SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="space-y-2">
                            <label className="text-xs font-semibold text-zinc-700 flex items-center gap-1.5">
                              <CreditCard className="h-3.5 w-3.5 text-zinc-500" /> Scholarship Status
                            </label>
                            <Select value={form.scholarshipApplication || ""} onValueChange={(val) => handleChange("scholarshipApplication", val)}>
                              <SelectTrigger className="h-9 text-sm font-medium border-zinc-200 bg-zinc-50">
                                <SelectValue placeholder="Select scholarship" />
                              </SelectTrigger>
                              <SelectContent>
                                {[
                                  "Yes, I want to apply for TWSP",
                                  "No, self-funded enrollment",
                                  "I need more information about scholarships",
                                ].map((s) => (
                                  <SelectItem key={s} value={s}>{s}</SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                        <div className="space-y-2">
                          <label className="text-xs font-semibold text-zinc-700">Trainee Notes</label>
                          <Textarea 
                            value={form.notes || ""} 
                            onChange={e => handleChange("notes", e.target.value)} 
                            className="min-h-[116px] text-sm bg-zinc-50 border-zinc-200" 
                            placeholder="Add any additional notes here..."
                          />
                        </div>
                      </div>
                    </div>
                  ) : course ? (
                    <div className="rounded-xl border border-zinc-200 overflow-hidden bg-white">
                      <div className="bg-zinc-50 p-5 border-b border-zinc-200">
                        <div className="space-y-3">
                          <Badge variant="secondary" className="bg-zinc-200 text-zinc-800 hover:bg-zinc-200 rounded font-medium inline-flex items-center gap-1">
                            <ShieldCheck className="h-3 w-3" /> Accredited Program
                          </Badge>
                          <div>
                            <h3 className="text-lg font-bold text-zinc-900">{course.title}</h3>
                            <p className="text-sm text-zinc-500">{course.shortDescription}</p>
                          </div>
                          <div className="flex gap-3 pt-1">
                            <div className="flex items-center gap-1.5 text-sm text-zinc-600">
                              <Clock className="h-4 w-4" />
                              <span className="font-medium">{course.durationHours} Hours</span>
                            </div>
                            <span className="text-zinc-300">•</span>
                            <div className="flex items-center gap-1.5 text-sm text-zinc-600">
                              <BookOpen className="h-4 w-4" />
                              <span className="font-medium">Level: {course.ncLevel}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="p-5 grid grid-cols-1 md:grid-cols-2 gap-5">
                        <div className="space-y-4">
                          <div className="space-y-1">
                            <p className="text-xs font-medium text-zinc-500 flex items-center gap-1.5">
                              <Calendar className="h-3.5 w-3.5" /> Preferred Schedule
                            </p>
                            <p className="text-sm font-semibold text-zinc-900">{form.preferredSchedule || "Not specified"}</p>
                          </div>
                          <div className="space-y-1">
                            <p className="text-xs font-medium text-zinc-500 flex items-center gap-1.5">
                              <CreditCard className="h-3.5 w-3.5" /> Scholarship Status
                            </p>
                            <p className="text-sm font-semibold text-zinc-900">{form.scholarshipApplication || "Not specified"}</p>
                          </div>
                        </div>
                        <div className="space-y-1">
                          <p className="text-xs font-medium text-zinc-500">Trainee Notes</p>
                          <p className="text-sm text-zinc-600 p-3 bg-zinc-50 rounded-md border border-zinc-100">
                            {form.notes || "No additional notes provided for this enrollment."}
                          </p>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="bg-zinc-50 border border-dashed border-zinc-200 rounded-xl p-8 text-center space-y-3">
                      <BookOpen className="h-8 w-8 text-zinc-400 mx-auto" />
                      <div>
                        <h3 className="text-base font-semibold text-zinc-900">No Active Program</h3>
                        <p className="text-sm text-zinc-500">You haven't enrolled in a technical qualification program yet.</p>
                      </div>
                      <Button variant="outline" size="sm" className="rounded-md mt-2 h-8">Browse Courses</Button>
                    </div>
                  )}
                </motion.div>
              )}

              {activeTab === "docs" && (
                <motion.div variants={item} className="flex flex-col items-center justify-center py-12 text-center border border-dashed border-zinc-200 bg-zinc-50 rounded-xl">
                  <FileText className="h-8 w-8 text-zinc-400 mb-3" />
                  <h3 className="text-sm font-semibold text-zinc-900 mb-1">No documents uploaded</h3>
                  <p className="text-xs text-zinc-500 max-w-xs mx-auto mb-4">
                    Upload your requirements to complete your profile and fast-track your enrollment.
                  </p>
                  <Button variant="outline" size="sm" className="h-8 rounded-md bg-white">
                    <Upload className="mr-2 h-3.5 w-3.5" /> Start Uploading
                  </Button>
                </motion.div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Sidebar: Status & Progress */}
        <div className="lg:col-span-4 xl:col-span-3 space-y-4">
          {/* Profile Integrity Card */}
          <motion.div 
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-xl border border-zinc-200 p-4 space-y-4"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[10px] font-semibold text-zinc-500 uppercase tracking-wider">Profile Integrity</p>
                <p className="text-xl font-bold text-zinc-900 leading-tight">{integrity}%</p>
              </div>
              <ShieldCheck className={cn("h-5 w-5", integrity === 100 ? "text-emerald-500" : "text-zinc-300")} />
            </div>
            
            <div className="h-1.5 w-full bg-zinc-100 rounded-full overflow-hidden">
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: `${integrity}%` }}
                transition={{ duration: 0.8, ease: "easeOut" }}
                className="h-full bg-zinc-900 rounded-full"
              />
            </div>

            <p className="text-xs text-zinc-500">
              {integrity === 100 
                ? "Your profile meets all requirements." 
                : "Complete your profile to enable priority processing."}
            </p>
          </motion.div>

          {/* Application Timeline */}
          <motion.div 
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-white rounded-xl border border-zinc-200 p-4"
          >
              <div className="mb-4">
                <h3 className="text-xs font-semibold text-zinc-900 flex items-center justify-between gap-1.5 mb-1">
                  <span className="flex items-center gap-1.5"><Clock className="h-3.5 w-3.5 text-zinc-500" /> Application Status</span>
                  {existing && !["ready_to_apply", "enrolled", "confirmed", "completed", "cancelled", "rejected"].includes(existing.status.toLowerCase()) && (
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="h-6 text-[10px] text-red-600 hover:text-red-700 hover:bg-red-50 p-0"
                      onClick={async () => {
                        if (confirm("Are you sure you want to cancel your application? This action cannot be undone.")) {
                          try {
                            const res = await updateTraineeEnrollmentByEmail(user!.email!, { status: "cancelled", courseSlug: "" });
                            if (res.success) {
                              setExisting(prev => prev ? { ...prev, status: "cancelled", courseSlug: "" } : null);
                              setForm(prev => prev ? { ...prev, status: "cancelled", courseSlug: "" } : {});
                              toast({ title: "Application Cancelled", description: "Your application has been successfully cancelled. You can now select a new program." });
                            } else {
                              toast({ title: "Cancellation Failed", description: res.error || "Unknown error", variant: "destructive" });
                            }
                          } catch (err) {
                            toast({ title: "Error", description: "Network error occurred.", variant: "destructive" });
                          }
                        }
                      }}
                    >
                      Cancel
                    </Button>
                  )}
                </h3>
                {existing?.refNo && (
                  <p className="text-[10px] font-mono text-zinc-500 pl-5">Ref: {existing.refNo}</p>
                )}
              </div>

            <div className="space-y-0 relative pl-1">
              <div className="absolute left-[13px] top-2 bottom-3 w-px bg-zinc-100" />
              
              {[
                { id: "submitted", label: "Submitted", sub: "Application received", icon: CheckCircle, active: !!existing && !["ready_to_apply"].includes(existing?.status?.toLowerCase()) },
                { id: "review", label: "In Review", sub: "Verification in progress", icon: Search, active: !!existing && ["review", "interview", "enrolled", "completed", "confirmed"].includes(existing?.status?.toLowerCase()) },
                { id: "interview", label: "Interview", sub: "Technical assessment", icon: UserCheck, active: !!existing && ["interview", "enrolled", "completed", "confirmed"].includes(existing?.status?.toLowerCase()) },
                { id: "enrolled", label: "Enrolled", sub: "Admission complete", icon: EnrolledIcon, active: !!existing && ["enrolled", "completed", "confirmed"].includes(existing?.status?.toLowerCase()) }
              ].map((step) => (
                <div key={step.id} className="relative flex gap-3 pb-4 last:pb-0">
                  <div className={cn(
                    "w-6 h-6 rounded-full flex items-center justify-center shrink-0 z-10 transition-colors duration-300",
                    step.active ? "bg-zinc-900 text-white" : "bg-white border border-zinc-200 text-zinc-300"
                  )}>
                    <step.icon className="h-3 w-3" />
                  </div>
                  <div className="pt-0.5">
                    <p className={cn("text-xs font-medium", step.active ? "text-zinc-900" : "text-zinc-400")}>
                      {step.label}
                    </p>
                    <p className="text-[10px] text-zinc-500">
                      {step.sub}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Quick Links */}
          <motion.div 
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="space-y-2"
          >
            <h3 className="text-[10px] font-semibold text-zinc-500 uppercase tracking-wider px-1">Trainee Resources</h3>
            <div className="grid grid-cols-1 gap-1.5">
              {[
                { label: "TESDA Online Portal", icon: Globe },
                { label: "Learning Materials", icon: BookOpen },
                { label: "Academy Guidelines", icon: ShieldCheck },
              ].map((link) => (
                <button key={link.label} className="flex items-center justify-between p-2.5 rounded-lg bg-white border border-zinc-200 hover:border-zinc-300 hover:bg-zinc-50 transition-colors group">
                  <div className="flex items-center gap-2.5">
                    <link.icon className="h-3.5 w-3.5 text-zinc-400 group-hover:text-zinc-600 transition-colors" />
                    <span className="text-xs font-medium text-zinc-700 group-hover:text-zinc-900 transition-colors">{link.label}</span>
                  </div>
                  <ArrowUpRight className="h-3.5 w-3.5 text-zinc-300 group-hover:text-zinc-500 transition-colors" />
                </button>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
