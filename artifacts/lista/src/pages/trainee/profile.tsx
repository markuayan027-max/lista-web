import { useEffect, useMemo, useState, memo, useCallback, useRef } from "react";
import { Link, useLocation } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import {
  User, Mail, MapPin, BookOpen, Calendar, Phone,
  FileText, ShieldCheck, CreditCard, GraduationCap,
  Globe, Hash, ArrowUpRight,
  Clock, CheckCircle, Search, Upload, UserCheck, GraduationCap as EnrolledIcon, Camera, Pencil
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/context/auth-context";
import { useCourses } from "@/hooks/use-lista-data";
import type { Enrollment } from "@/lib/institutional-data";
import PrintModal from "@/components/print-modal";
import StatusBadge from "@/components/status-badge";
import { cn } from "@/lib/utils";
import {
  fetchTraineeProfileBundle,
  updateTraineeEnrollmentByEmail,
  canCancelCourseApplication,
} from "@/lib/trainee-enrollment-insforge";
import {
  loadLocalProfile,
  getProfileIntegrityBreakdown,
  seedRegistrationDraftFromProfile,
  saveProfilePic,
  loadProfilePic,
} from "@/lib/profile-utils";
import { ProfileSkeleton } from "@/components/skeletons";
import TraineeProfileIntegrityCard from "@/components/trainee-profile-integrity-card";
import { ProfileFieldValue, ProfileTableEmpty } from "@/components/profile-empty-field";

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
  <div className={cn("flex flex-col gap-1.5 p-3 rounded-lg border border-border bg-card", className)}>
    <div className="flex items-center gap-2 text-muted-foreground">
      {Icon && <Icon className="h-3.5 w-3.5" />}
      <p className="text-xs font-medium">{label}</p>
    </div>
    {isEditing && fieldKey ? (
      options ? (
        <Select value={inputValue || ""} onValueChange={(val) => onChange(fieldKey, val)}>
          <SelectTrigger className="h-8 text-sm font-medium border-border bg-muted focus:bg-background focus:ring-1 focus:ring-ring transition-colors">
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
          className="w-full bg-muted border border-border rounded-md px-2.5 py-1.5 text-sm font-medium text-foreground focus:outline-none focus:ring-1 focus:ring-ring focus:bg-background transition-colors"
          value={inputValue || ""}
          onChange={(e) => onChange(fieldKey, e.target.value)}
        />
      )
    ) : (
      <ProfileFieldValue value={typeof value === "string" ? value : undefined} />
    )}
  </div>
);

const MemoizedInfoRow = memo(InfoRow);

const noopChange = () => {};

export default function TraineeProfilePage() {
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const { data: courses = [] } = useCourses();
  const [activeTab, setActiveTab] = useState("personal");

  const [existing, setExisting] = useState<Enrollment | null>(null);
  const [profileSource, setProfileSource] = useState<"cloud" | "local" | "merged" | "none">("none");
  const [cloudSyncHint, setCloudSyncHint] = useState<string | undefined>();
  const [isLoading, setIsLoading] = useState(true);

  const [form, setForm] = useState<Partial<EditableEnrollment>>({});
  const [printTarget, setPrintTarget] = useState<Enrollment | null>(null);

  // ── Profile picture ──────────────────────────────────────────────────────
  const [profilePic, setProfilePic] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setProfilePic(loadProfilePic(user?.id));
  }, [user?.id]);

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
        saveProfilePic(compressed, user?.id);
        toast({ title: "Photo updated", description: "Your profile picture has been saved." });
      };
      img.src = original;
    };
    reader.readAsDataURL(file);
    // Reset input so the same file can be chosen again
    e.target.value = "";
  }, [toast, user?.id]);

  useEffect(() => {
    if (!user?.email) {
      return;
    }

    const fetchProfile = async () => {
      try {
        const { enrollment, source, cloudError } = await fetchTraineeProfileBundle(
          user.email!,
          user?.id,
        );
        setProfileSource(source);
        setCloudSyncHint(cloudError);

        if (enrollment) {
          const asEnrollment = enrollment as Enrollment;
          setExisting(asEnrollment);
          setForm(asEnrollment as unknown as EditableEnrollment);
        } else {
          setExisting(null);
          setForm({});
        }
      } catch (err) {
        console.error("Error fetching profile", err);
        const draft = loadLocalProfile(user?.id);
        if (draft) {
          setProfileSource("local");
          setExisting(draft as unknown as Enrollment);
          setForm(draft as unknown as EditableEnrollment);
        }
      } finally {
        setIsLoading(false);
      }
    };

    void fetchProfile();
  }, [user?.email, user?.id]);

  const course = useMemo(
    () => (existing?.courseSlug ? courses.find((c) => c.slug === existing.courseSlug) : null),
    [existing?.courseSlug, courses],
  );

  const mergedEnrollment = useMemo(
    () => ({ ...existing, ...form } as Enrollment),
    [existing, form]
  );

  const integrityBreakdown = useMemo(
    () => getProfileIntegrityBreakdown(mergedEnrollment),
    [mergedEnrollment],
  );
  const hasProfileData = useMemo(
    () =>
      Boolean(
        mergedEnrollment.firstName?.trim() ||
          mergedEnrollment.contactNumber?.trim() ||
          mergedEnrollment.mobileNumber?.trim(),
      ),
    [mergedEnrollment],
  );
  const displayContact = form.contactNumber?.trim() || form.mobileNumber?.trim() || "";
  /** Profile edits happen in the registration wizard (`/trainee/register?from=profile`). */
  const isEditing = false;

  const handleOpenRegistrationWizard = useCallback(() => {
    if (!user?.id || !user.email) return;
    seedRegistrationDraftFromProfile(mergedEnrollment, user.id, user.email);
    setLocation("/trainee/register?from=profile");
  }, [mergedEnrollment, setLocation, user?.email, user?.id]);

  const handleOpenTesdaFormPdf = () => {
    if (!hasProfileData) {
      toast({
        title: "Profile incomplete",
        description: "Add your name and contact details before opening the TESDA form.",
        variant: "destructive",
      });
      return;
    }
    const forPrint = {
      ...mergedEnrollment,
      refNo: mergedEnrollment.refNo || `LISTA-${new Date().getFullYear()}-DRAFT`,
      traineeEmail: mergedEnrollment.traineeEmail || user?.email || "",
      contactNumber: displayContact,
      mobileNumber: displayContact,
    } as Enrollment;
    setPrintTarget(forPrint);
  };

  if (isLoading) {
    return <ProfileSkeleton />;
  }

  return (
    <motion.div className="max-w-7xl mx-auto space-y-6 pb-16 px-4 sm:px-6">
      <AnimatePresence>
        {printTarget && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <PrintModal enrollment={printTarget} onClose={() => setPrintTarget(null)} />
          </motion.div>
        )}
      </AnimatePresence>
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
              className="group relative w-16 h-16 rounded-full overflow-hidden border-2 border-border hover:border-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring transition-all shadow-sm"
              title="Click to change profile photo"
            >
              {profilePic ? (
                <img
                  src={profilePic}
                  alt="Profile"
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-muted flex items-center justify-center text-foreground">
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
              className="absolute bottom-0 right-0 w-5 h-5 bg-card rounded-full border border-border shadow-sm flex items-center justify-center hover:bg-primary/10 hover:border-primary/30 transition-colors"
              title="Change photo"
            >
              <Camera className="h-2.5 w-2.5 text-muted-foreground" />
            </button>
          </div>
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold tracking-tight text-foreground">
                {form.firstName || form.lastName
                  ? `${[form.firstName, form.lastName].filter(Boolean).join(" ")}`
                  : `${user?.name?.split(" ")[0] || "Your"}'s Profile`}
              </h1>
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
            </div>
            <div className="flex items-center gap-3 text-muted-foreground text-xs font-medium">
              <span className="flex items-center gap-1">
                <Mail className="h-3.5 w-3.5" /> {user?.email}
              </span>
              <span className="text-muted-foreground/50">•</span>
              <span className="flex items-center gap-1">
                <Hash className="h-3.5 w-3.5" /> {existing?.refNo || "LISTA-2026-PENDING"}
              </span>
            </div>
          </div>
        </div>

        <motion.div className="flex flex-col gap-2 w-full sm:w-auto sm:flex-row">
          <Button
            size="sm"
            className="h-11 gap-2 shadow-md w-full sm:w-auto rounded-xl font-semibold"
            onClick={handleOpenTesdaFormPdf}
            disabled={!hasProfileData}
          >
            <FileText className="h-4 w-4 shrink-0" />
            TESDA Form (PDF)
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="h-11 gap-2 w-full sm:w-auto rounded-xl border-border"
            onClick={handleOpenRegistrationWizard}
          >
            <Pencil className="h-4 w-4 shrink-0" />
            Edit profile
          </Button>
        </motion.div>
      </motion.div>

      {/* Tabs */}
      <div className="flex items-center gap-1 border-b border-border w-full overflow-x-auto no-scrollbar">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={cn(
              "flex items-center gap-2 px-4 py-2.5 text-sm font-medium transition-colors whitespace-nowrap border-b-2 -mb-px",
              activeTab === tab.id 
                ? "border-primary text-foreground" 
                : "border-transparent text-muted-foreground hover:text-foreground hover:border-border"
            )}
          >
            <tab.icon className="h-4 w-4" />
            {tab.label}
          </button>
        ))}
      </div>

      {!hasProfileData && (
        <motion.div variants={item} className="rounded-xl border border-dashed border-border bg-muted/40 px-4 py-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <p className="text-sm font-semibold text-foreground">Complete your learner profile</p>
            <p className="text-xs text-muted-foreground max-w-md">
              {cloudSyncHint === "Profile not found"
                ? "No cloud record yet — finish registration or save from Edit Profile to sync with InsForge."
                : "Your TESDA profile is empty. Continue registration to pre-fill this page."}
            </p>
          </div>
          <Button size="sm" className="shrink-0 h-9" onClick={handleOpenRegistrationWizard}>
            Continue registration
          </Button>
        </motion.div>
      )}

      {hasProfileData && profileSource === "local" && (
        <motion.div variants={item} className="rounded-md border border-amber-200/80 bg-amber-50/80 px-3 py-2 text-xs text-amber-950">
          Showing data saved on this device. Save your profile to sync with InsForge.
        </motion.div>
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
                    <h3 className="text-sm font-semibold text-foreground border-b border-border/60 pb-1.5">Basic Information</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
                      <MemoizedInfoRow
                        label="Full Name"
                        value={`${form.firstName || ""} ${form.middleName || ""} ${form.lastName || ""} ${form.extensionName || ""}`.trim()}
                        icon={User}
                        className="md:col-span-2 xl:col-span-3"
                        isEditing={false}
                        inputValue=""
                        onChange={noopChange}
                      />
                      <MemoizedInfoRow label="Date of Birth" value={form.dob || ""} icon={Calendar} fieldKey="dob" isEditing={false} inputValue={form.dob || ""} onChange={noopChange} />
                      <MemoizedInfoRow label="Birth Place" value={form.birthPlace || ""} icon={MapPin} fieldKey="birthPlace" isEditing={false} inputValue={form.birthPlace || ""} onChange={noopChange} />
                      <MemoizedInfoRow 
                        label="Civil Status" 
                        value={form.civilStatus || ""} 
                        icon={Hash} 
                        fieldKey="civilStatus" 
                        isEditing={false} 
                        inputValue={form.civilStatus || ""} 
                        onChange={noopChange} 
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
                        isEditing={false} 
                        inputValue={form.gender || ""} 
                        onChange={noopChange} 
                        options={[
                          { label: "Male", value: "Male" },
                          { label: "Female", value: "Female" },
                          { label: "Prefer not to say", value: "Prefer not to say" },
                        ]}
                      />
                      <MemoizedInfoRow label="Nationality" value={form.nationality || "Filipino"} icon={Globe} fieldKey="nationality" isEditing={false} inputValue={form.nationality || ""} onChange={noopChange} />
                      <MemoizedInfoRow label="Contact Number (Mobile)" value={displayContact} icon={Phone} fieldKey="contactNumber" isEditing={false} inputValue={form.contactNumber || form.mobileNumber || ""} onChange={noopChange} />
                      <MemoizedInfoRow label="Landline (Tel)" value={form.telephone || ""} icon={Phone} fieldKey="telephone" isEditing={false} inputValue={form.telephone || ""} onChange={noopChange} />
                      <MemoizedInfoRow label="Email" value={form.traineeEmail || user?.email || ""} icon={Mail} isEditing={false} inputValue="" onChange={noopChange} />
                    </div>
                  </motion.div>

                  <motion.div variants={item} className="space-y-3">
                    <h3 className="text-sm font-semibold text-foreground border-b border-border/60 pb-1.5">Location Details</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <MemoizedInfoRow label="Residential Address" value={form.homeAddress || ""} icon={MapPin} className="md:col-span-2" fieldKey="homeAddress" isEditing={false} inputValue={form.homeAddress || ""} onChange={noopChange} />
                      <MemoizedInfoRow label="Barangay" value={form.barangay || ""} icon={MapPin} fieldKey="barangay" isEditing={false} inputValue={form.barangay || ""} onChange={noopChange} />
                      <MemoizedInfoRow label="City / Municipality" value={form.city || ""} icon={MapPin} fieldKey="city" isEditing={false} inputValue={form.city || ""} onChange={noopChange} />
                      <MemoizedInfoRow label="Province" value={form.province || ""} icon={MapPin} fieldKey="province" isEditing={false} inputValue={form.province || ""} onChange={noopChange} />
                      <MemoizedInfoRow label="Region" value={form.region || ""} icon={MapPin} fieldKey="region" isEditing={false} inputValue={form.region || ""} onChange={noopChange} />
                      <MemoizedInfoRow label="Zip Code" value={form.zipCode || ""} icon={MapPin} fieldKey="zipCode" isEditing={false} inputValue={form.zipCode || ""} onChange={noopChange} />
                    </div>
                  </motion.div>
                </>
              )}

              {activeTab === "registry" && (
                <motion.div variants={item} className="space-y-6">
                  <div className="space-y-3">
                    <h3 className="text-sm font-semibold text-foreground border-b border-border/60 pb-1.5">TESDA Registry</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <MemoizedInfoRow label="Unique Learner Identifier (ULI)" value={form.uli || ""} icon={Hash} fieldKey="uli" isEditing={false} inputValue={form.uli || ""} onChange={noopChange} />
                      <MemoizedInfoRow 
                        label="Client Type" 
                        value={form.clientType || ""} 
                        icon={User} 
                        fieldKey="clientType" 
                        isEditing={false} 
                        inputValue={form.clientType || ""} 
                        onChange={noopChange}
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
                        isEditing={false} 
                        inputValue={form.learnerClassification || ""} 
                        onChange={noopChange}
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
                        isEditing={false} 
                        inputValue={form.qualificationType || ""} 
                        onChange={noopChange}
                        options={[
                          { label: "Full Qualification", value: "Full Qualification" },
                          { label: "COC", value: "COC" },
                        ]}
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    <h3 className="text-sm font-semibold text-foreground border-b border-border/60 pb-1.5">Family Details</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <MemoizedInfoRow label="Father's Name" value={form.fatherName || ""} icon={User} fieldKey="fatherName" isEditing={false} inputValue={form.fatherName || ""} onChange={noopChange} />
                      <MemoizedInfoRow label="Mother's Maiden Name" value={form.motherMaidenName || ""} icon={User} fieldKey="motherMaidenName" isEditing={false} inputValue={form.motherMaidenName || ""} onChange={noopChange} />
                    </div>
                  </div>
                </motion.div>
              )}

              {activeTab === "academic" && (
                <motion.div variants={item} className="space-y-6">
                    <div className="space-y-3">
                      <h3 className="text-sm font-semibold text-foreground border-b border-border/60 pb-1.5">Education Profile</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <div className="p-3 rounded-lg border border-border bg-card">
                          <p className="text-xs font-medium text-muted-foreground mb-1">Highest Attainment</p>
                          <ProfileFieldValue value={form.education || undefined} />
                        </div>
                        <div className="p-3 rounded-lg border border-border bg-card">
                          <p className="text-xs font-medium text-muted-foreground mb-1">Employment Status</p>
                          {form.employmentStatus?.trim() ? (
                            <Badge variant="secondary" className="ml-5 bg-muted text-foreground/90 hover:bg-muted rounded-md font-medium">
                              {form.employmentStatus}
                            </Badge>
                          ) : (
                            <ProfileFieldValue value={undefined} />
                          )}
                        </div>
                        <div className="p-3 rounded-lg border border-border bg-card md:col-span-2">
                          <p className="text-xs font-medium text-muted-foreground mb-1">Last Institution Attended</p>
                          <ProfileFieldValue value={form.schoolLastAttended || undefined} />
                        </div>
                      </div>
                    </div>

                    {/* Section 4: Other Trainings */}
                    <div className="space-y-2">
                      <h3 className="text-sm font-semibold text-foreground">Other Training/Seminars Attended</h3>
                      <div className="rounded-lg border border-border overflow-hidden">
                        <div className="overflow-x-auto">
                          <table className="w-full text-sm text-left">
                            <thead className="bg-muted text-xs font-medium text-muted-foreground border-b border-border">
                              <tr>
                                <th className="px-4 py-2 font-medium">Title</th>
                                <th className="px-4 py-2 font-medium">Venue</th>
                                <th className="px-4 py-2 font-medium">Dates</th>
                                <th className="px-4 py-2 font-medium">Hours</th>
                                <th className="px-4 py-2 font-medium">Conducted By</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-border/60 bg-card">
                              {(form.otherTrainings || []).length > 0 ? (
                                form.otherTrainings?.map((t, idx) => (
                                  <tr key={idx} className="hover:bg-muted/50 transition-colors">
                                    <td className="px-4 py-2 text-foreground">{t.title}</td>
                                    <td className="px-4 py-2 text-muted-foreground">{t.venue}</td>
                                    <td className="px-4 py-2 text-muted-foreground">{t.inclusiveDates}</td>
                                    <td className="px-4 py-2 text-muted-foreground">{t.noOfHours}</td>
                                    <td className="px-4 py-2 text-muted-foreground">{t.conductedBy}</td>
                                  </tr>
                                ))
                              ) : (
                                <ProfileTableEmpty
                                  colSpan={5}
                                  message="No training records yet. Add them in the registration wizard."
                                  actionLabel="Edit profile"
                                  onAction={handleOpenRegistrationWizard}
                                />
                              )}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    </div>

                    {/* Section 5: Licensure Exams */}
                    <div className="space-y-2">
                      <h3 className="text-sm font-semibold text-foreground">Licensure Examination(s) Passed</h3>
                      <div className="rounded-lg border border-border overflow-hidden">
                        <div className="overflow-x-auto">
                          <table className="w-full text-sm text-left">
                            <thead className="bg-muted text-xs font-medium text-muted-foreground border-b border-border">
                              <tr>
                                <th className="px-4 py-2 font-medium">Title</th>
                                <th className="px-4 py-2 font-medium">Year Taken</th>
                                <th className="px-4 py-2 font-medium">Venue</th>
                                <th className="px-4 py-2 font-medium">Rating</th>
                                <th className="px-4 py-2 font-medium">Remarks</th>
                                <th className="px-4 py-2 font-medium">Expiry Date</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-border/60 bg-card">
                              {(form.licensureExams || []).length > 0 ? (
                                form.licensureExams?.map((e, idx) => (
                                  <tr key={idx} className="hover:bg-muted/50 transition-colors">
                                    <td className="px-4 py-2 text-foreground">{e.title}</td>
                                    <td className="px-4 py-2 text-muted-foreground">{e.yearTaken}</td>
                                    <td className="px-4 py-2 text-muted-foreground">{e.examinationVenue}</td>
                                    <td className="px-4 py-2 text-muted-foreground">{e.rating}</td>
                                    <td className="px-4 py-2 text-muted-foreground">{e.remarks}</td>
                                    <td className="px-4 py-2 text-muted-foreground">{e.expiryDate}</td>
                                  </tr>
                                ))
                              ) : (
                                <ProfileTableEmpty
                                  colSpan={6}
                                  message="No licensure exams on file yet."
                                  actionLabel="Continue registration"
                                  onAction={handleOpenRegistrationWizard}
                                />
                              )}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    </div>

                    {/* Section 6: Competency Assessments */}
                    <div className="space-y-2">
                      <h3 className="text-sm font-semibold text-foreground">Competency Assessment(s) Passed</h3>
                      <div className="rounded-lg border border-border overflow-hidden">
                        <div className="overflow-x-auto">
                          <table className="w-full text-sm text-left">
                            <thead className="bg-muted text-xs font-medium text-muted-foreground border-b border-border">
                              <tr>
                                <th className="px-4 py-2 font-medium">Title</th>
                                <th className="px-4 py-2 font-medium">Qual. Level</th>
                                <th className="px-4 py-2 font-medium">Industry Sector</th>
                                <th className="px-4 py-2 font-medium">Certificate #</th>
                                <th className="px-4 py-2 font-medium">Date Issued</th>
                                <th className="px-4 py-2 font-medium">Expiration Date</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-border/60 bg-card">
                              {(form.competencyAssessments || []).length > 0 ? (
                                form.competencyAssessments?.map((c, idx) => (
                                  <tr key={idx} className="hover:bg-muted/50 transition-colors">
                                    <td className="px-4 py-2 text-foreground">{c.title}</td>
                                    <td className="px-4 py-2 text-muted-foreground">{c.qualificationLevel}</td>
                                    <td className="px-4 py-2 text-muted-foreground">{c.industrySector}</td>
                                    <td className="px-4 py-2 text-muted-foreground">{c.certificateNumber}</td>
                                    <td className="px-4 py-2 text-muted-foreground">{c.dateOfIssuance}</td>
                                    <td className="px-4 py-2 text-muted-foreground">{c.expirationDate}</td>
                                  </tr>
                                ))
                              ) : (
                                <ProfileTableEmpty
                                  colSpan={6}
                                  message="No competency assessments on file yet."
                                  actionLabel="Continue registration"
                                  onAction={handleOpenRegistrationWizard}
                                />
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
                  {course ? (
                    <div className="rounded-xl border border-border overflow-hidden bg-card">
                      <div className="bg-muted p-5 border-b border-border">
                        <div className="space-y-3">
                          <Badge variant="secondary" className="bg-muted text-foreground hover:bg-muted rounded font-medium inline-flex items-center gap-1">
                            <ShieldCheck className="h-3 w-3" /> Accredited Program
                          </Badge>
                          <div>
                            <h3 className="text-lg font-bold text-foreground">{course.title}</h3>
                            <p className="text-sm text-muted-foreground">{course.shortDescription}</p>
                          </div>
                          <div className="flex gap-3 pt-1">
                            <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                              <Clock className="h-4 w-4" />
                              <span className="font-medium">{course.durationHours} Hours</span>
                            </div>
                            <span className="text-muted-foreground/50">•</span>
                            <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                              <BookOpen className="h-4 w-4" />
                              <span className="font-medium">Level: {course.ncLevel}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="p-5 grid grid-cols-1 md:grid-cols-2 gap-5">
                        <div className="space-y-4">
                          <div className="space-y-1">
                            <p className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
                              <Calendar className="h-3.5 w-3.5" /> Preferred Schedule
                            </p>
                            <p className="text-sm font-semibold text-foreground">{form.preferredSchedule || "Not specified"}</p>
                          </div>
                          <div className="space-y-1">
                            <p className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
                              <CreditCard className="h-3.5 w-3.5" /> Scholarship Status
                            </p>
                            <p className="text-sm font-semibold text-foreground">{form.scholarshipApplication || "Not specified"}</p>
                          </div>
                        </div>
                        <div className="space-y-1">
                          <p className="text-xs font-medium text-muted-foreground">Trainee Notes</p>
                          <p className="text-sm text-muted-foreground p-3 bg-muted rounded-md border border-border/60">
                            {form.notes || "No additional notes provided for this enrollment."}
                          </p>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="bg-muted border border-dashed border-border rounded-xl p-8 text-center space-y-3">
                      <BookOpen className="h-8 w-8 text-muted-foreground mx-auto" />
                      <div>
                        <h3 className="text-base font-semibold text-foreground">No Active Program</h3>
                        <p className="text-sm text-muted-foreground">You haven't enrolled in a technical qualification program yet.</p>
                      </div>
                      <Button variant="outline" size="sm" className="rounded-md mt-2 h-8" asChild>
                        <Link href="/courses">Browse courses</Link>
                      </Button>
                    </div>
                  )}
                </motion.div>
              )}

              {activeTab === "docs" && (
                <motion.div variants={item} className="flex flex-col items-center justify-center py-12 text-center border border-dashed border-border bg-muted rounded-xl">
                  <FileText className="h-8 w-8 text-muted-foreground mb-3" />
                  <h3 className="text-sm font-semibold text-foreground mb-1">No documents uploaded</h3>
                  <p className="text-xs text-muted-foreground max-w-xs mx-auto mb-4">
                    Upload your requirements to complete your profile and fast-track your enrollment.
                  </p>
                  <Button variant="outline" size="sm" className="h-8 rounded-md bg-card" onClick={handleOpenRegistrationWizard}>
                    <Upload className="mr-2 h-3.5 w-3.5" /> Add via registration
                  </Button>
                </motion.div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Sidebar: Status & Progress */}
        <div className="lg:col-span-4 xl:col-span-3 space-y-4">
          <TraineeProfileIntegrityCard
            breakdown={integrityBreakdown}
            onContinueRegistration={handleOpenRegistrationWizard}
          />

          <motion.div
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.05 }}
            className="rounded-2xl border border-primary/25 bg-primary/5 p-4 space-y-3"
          >
            <div className="flex items-start gap-3">
              <motion.div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-sm">
                <FileText className="h-5 w-5" />
              </motion.div>
              <div className="min-w-0 space-y-1">
                <p className="text-sm font-semibold text-foreground">Official TESDA application</p>
                <p className="text-xs text-muted-foreground leading-snug">
                  Preview or download your filled registration form for printing and submission.
                </p>
              </div>
            </div>
            <Button
              className="w-full h-11 rounded-xl font-semibold shadow-md"
              onClick={handleOpenTesdaFormPdf}
              disabled={!hasProfileData}
            >
              <FileText className="h-4 w-4 mr-2 shrink-0" />
              TESDA Form (PDF)
            </Button>
          </motion.div>

          {/* Application Timeline */}
          <motion.div 
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-card rounded-xl border border-border p-4"
          >
              <div className="mb-4">
                <h3 className="text-xs font-semibold text-foreground flex items-center justify-between gap-1.5 mb-1">
                  <span className="flex items-center gap-1.5"><Clock className="h-3.5 w-3.5 text-muted-foreground" /> Application Status</span>
                  {canCancelCourseApplication(existing) && (
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
                  <p className="text-[10px] font-mono text-muted-foreground pl-5">Ref: {existing.refNo}</p>
                )}
              </div>

            <div className="space-y-0 relative pl-1">
              <div className="absolute left-[13px] top-2 bottom-3 w-px bg-muted" />
              
              {[
                { id: "submitted", label: "Submitted", sub: "Application received", icon: CheckCircle, active: !!existing && !["ready_to_apply"].includes((existing.status ?? "pending").toLowerCase()) },
                { id: "review", label: "In Review", sub: "Verification in progress", icon: Search, active: !!existing && ["review", "interview", "enrolled", "completed", "confirmed"].includes((existing.status ?? "").toLowerCase()) },
                { id: "interview", label: "Interview", sub: "Technical assessment", icon: UserCheck, active: !!existing && ["interview", "enrolled", "completed", "confirmed"].includes((existing.status ?? "").toLowerCase()) },
                { id: "enrolled", label: "Enrolled", sub: "Admission complete", icon: EnrolledIcon, active: !!existing && ["enrolled", "completed", "confirmed"].includes((existing.status ?? "").toLowerCase()) }
              ].map((step) => (
                <div key={step.id} className="relative flex gap-3 pb-4 last:pb-0">
                  <div className={cn(
                    "w-6 h-6 rounded-full flex items-center justify-center shrink-0 z-10 transition-colors duration-300",
                    step.active ? "bg-primary text-primary-foreground" : "bg-card border border-border text-muted-foreground/50"
                  )}>
                    <step.icon className="h-3 w-3" />
                  </div>
                  <div className="pt-0.5">
                    <p className={cn("text-xs font-medium", step.active ? "text-foreground" : "text-muted-foreground")}>
                      {step.label}
                    </p>
                    <p className="text-[10px] text-muted-foreground">
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
            <h3 className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider px-1">Trainee Resources</h3>
            <div className="grid grid-cols-1 gap-1.5">
              {[
                { label: "TESDA Online Portal", icon: Globe },
                { label: "Learning Materials", icon: BookOpen },
                { label: "Academy Guidelines", icon: ShieldCheck },
              ].map((link) => (
                <button key={link.label} className="flex items-center justify-between p-2.5 rounded-lg bg-card border border-border hover:border-border hover:bg-muted transition-colors group">
                  <div className="flex items-center gap-2.5">
                    <link.icon className="h-3.5 w-3.5 text-muted-foreground group-hover:text-muted-foreground transition-colors" />
                    <span className="text-xs font-medium text-foreground/90 group-hover:text-foreground transition-colors">{link.label}</span>
                  </div>
                  <ArrowUpRight className="h-3.5 w-3.5 text-muted-foreground/50 group-hover:text-muted-foreground transition-colors" />
                </button>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
}
