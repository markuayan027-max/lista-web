import { useState } from "react";
import { motion } from "framer-motion";
import {
  User, Mail, Phone, MapPin, BookOpen, Calendar, Briefcase,
  Download, FileSpreadsheet, FileText, Save, Pencil, X, CheckCircle2,
  Printer, ChevronDown,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/context/auth-context";
import { enrollments, courses } from "@/lib/institutional-data";
import type { Enrollment } from "@/lib/institutional-data";
import { exportSingleTraineeToExcel, exportSingleTraineeToWord } from "@/lib/export-utils";
import AvatarInitials from "@/components/avatar-initials";
import StatusBadge from "@/components/status-badge";
import { format } from "date-fns";

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.08 } },
};
const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { type: "spring" as const, stiffness: 300, damping: 24 } },
};

type EditableEnrollment = Omit<Enrollment, "status" | "consent" | "createdAt" | "id" | "refNo" | "userId">;

const FIELD_GROUPS = [
  {
    title: "Personal Information",
    icon: User,
    fields: [
      { key: "firstName", label: "First Name", type: "text", placeholder: "e.g. Maria", col: 1 },
      { key: "lastName", label: "Last Name", type: "text", placeholder: "e.g. Clara", col: 1 },
      { key: "dob", label: "Date of Birth", type: "date", col: 1 },
      { key: "gender", label: "Gender", type: "select", options: ["Male", "Female", "Prefer not to say"], col: 1 },
      { key: "civilStatus", label: "Civil Status", type: "select", options: ["Single", "Married", "Widowed", "Separated"], col: 1 },
    ],
  },
  {
    title: "Contact Details",
    icon: Phone,
    fields: [
      { key: "traineeEmail", label: "Email Address", type: "email", placeholder: "e.g. name@email.com", col: 2 },
      { key: "contactNumber", label: "Contact Number", type: "text", placeholder: "e.g. 0917-123-4567", col: 1 },
      { key: "homeAddress", label: "Home Address", type: "text", placeholder: "e.g. Purok 3, Brgy. 24-A", col: 2 },
      { key: "city", label: "City / Municipality", type: "text", placeholder: "e.g. Gingoog City", col: 1 },
      { key: "province", label: "Province", type: "text", placeholder: "e.g. Misamis Oriental", col: 1 },
    ],
  },
  {
    title: "Educational Background",
    icon: BookOpen,
    fields: [
      { key: "education", label: "Highest Educational Attainment", type: "select", options: ["Elementary Graduate", "High School Graduate", "Senior High School Graduate", "College Level", "College Graduate", "Post-Graduate"], col: 2 },
      { key: "schoolLastAttended", label: "School Last Attended", type: "text", placeholder: "e.g. Gingoog City NHS", col: 2 },
      { key: "employmentStatus", label: "Employment Status", type: "select", options: ["Unemployed", "Underemployed", "Employed (seeking skills upgrade)", "Student"], col: 2 },
    ],
  },
  {
    title: "Course & Schedule",
    icon: Calendar,
    fields: [
      { key: "preferredSchedule", label: "Preferred Schedule", type: "select", options: ["Morning (8:00 AM – 12:00 PM)", "Afternoon (1:00 PM – 5:00 PM)", "Full Day (8:00 AM – 5:00 PM)"], col: 2 },
      { key: "enrollmentType", label: "Enrollment Type", type: "select", options: ["New Enrollee", "Re-enrollee", "Assessment Only (walk-in)"], col: 1 },
      { key: "scholarshipApplication", label: "Scholarship", type: "select", options: ["Yes, I want to apply for TWSP", "No, self-funded enrollment", "I need more information about scholarships"], col: 2 },
      { key: "heardFrom", label: "How did you hear about us?", type: "text", placeholder: "e.g. Facebook, Friend, etc.", col: 1 },
      { key: "notes", label: "Additional Notes", type: "textarea", placeholder: "Any additional information...", col: 2 },
    ],
  },
];

export default function TraineeProfilePage() {
  const { user } = useAuth();
  const { toast } = useToast();

  const existing = enrollments.find((e) => e.traineeEmail === user?.email) || enrollments[0];
  const course = courses.find((c) => c.slug === existing?.courseSlug);

  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  const [form, setForm] = useState<Partial<EditableEnrollment>>({
    firstName: existing?.firstName ?? "",
    lastName: existing?.lastName ?? "",
    dob: existing?.dob ?? "",
    gender: existing?.gender ?? "Male",
    civilStatus: existing?.civilStatus ?? "Single",
    traineeEmail: existing?.traineeEmail ?? "",
    contactNumber: existing?.contactNumber ?? "",
    homeAddress: existing?.homeAddress ?? "",
    city: existing?.city ?? "",
    province: existing?.province ?? "",
    education: existing?.education ?? "",
    schoolLastAttended: existing?.schoolLastAttended ?? "",
    employmentStatus: existing?.employmentStatus ?? "Unemployed",
    preferredSchedule: existing?.preferredSchedule ?? "Morning (8:00 AM – 12:00 PM)",
    enrollmentType: existing?.enrollmentType ?? "New Enrollee",
    scholarshipApplication: existing?.scholarshipApplication ?? "No, self-funded enrollment",
    heardFrom: existing?.heardFrom ?? "",
    notes: existing?.notes ?? "",
    courseSlug: existing?.courseSlug ?? "",
    traineeName: existing?.traineeName ?? "",
  });

  const mergedEnrollment: Enrollment = { ...existing, ...form } as Enrollment;

  const handleChange = (key: string, value: string) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleSave = () => {
    setIsSaving(true);
    setTimeout(() => {
      setIsSaving(false);
      setIsEditing(false);
      toast({ title: "Profile Updated", description: "Your information has been saved." });
    }, 800);
  };

  const handleExportExcel = () => {
    setIsExporting(true);
    try {
      exportSingleTraineeToExcel(mergedEnrollment);
      toast({ title: "Excel Downloaded", description: "Your profile has been exported as .xlsx" });
    } catch {
      toast({ title: "Export Failed", description: "Could not generate Excel file.", variant: "destructive" });
    } finally {
      setIsExporting(false);
    }
  };

  const handleExportWord = async () => {
    setIsExporting(true);
    try {
      await exportSingleTraineeToWord(mergedEnrollment);
      toast({ title: "Word Downloaded", description: "Your admission form has been exported as .docx" });
    } catch {
      toast({ title: "Export Failed", description: "Could not generate Word document.", variant: "destructive" });
    } finally {
      setIsExporting(false);
    }
  };

  const renderField = (field: (typeof FIELD_GROUPS)[0]["fields"][0]) => {
    const value = (form as any)[field.key] ?? "";

    if (!isEditing) {
      return (
        <div key={field.key} className={field.col === 2 ? "col-span-2" : ""}>
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1">{field.label}</p>
          <p className="text-sm font-medium text-foreground">
            {field.key === "dob" && value ? format(new Date(value), "MMMM dd, yyyy") : value || <span className="text-muted-foreground/50 italic">Not provided</span>}
          </p>
        </div>
      );
    }

    if (field.type === "select") {
      return (
        <div key={field.key} className={`grid gap-1.5 ${field.col === 2 ? "col-span-2" : ""}`}>
          <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{field.label}</label>
          <Select value={value} onValueChange={(v) => handleChange(field.key, v)}>
            <SelectTrigger className="h-9 bg-background border-input">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {field.options!.map((opt) => (
                <SelectItem key={opt} value={opt}>{opt}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      );
    }

    if (field.type === "textarea") {
      return (
        <div key={field.key} className={`grid gap-1.5 ${field.col === 2 ? "col-span-2" : ""}`}>
          <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{field.label}</label>
          <Textarea
            value={value}
            onChange={(e) => handleChange(field.key, e.target.value)}
            placeholder={field.placeholder}
            className="resize-none bg-background border-input min-h-[80px]"
          />
        </div>
      );
    }

    return (
      <div key={field.key} className={`grid gap-1.5 ${field.col === 2 ? "col-span-2" : ""}`}>
        <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{field.label}</label>
        <Input
          type={field.type}
          value={value}
          onChange={(e) => handleChange(field.key, e.target.value)}
          placeholder={field.placeholder}
          className="h-9 bg-background border-input"
        />
      </div>
    );
  };

  return (
    <motion.div
      className="space-y-6 max-w-5xl mx-auto"
      variants={container}
      initial="hidden"
      animate="show"
    >
      {/* Page Header */}
      <motion.div variants={item} className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">My Profile</h1>
          <p className="text-muted-foreground text-sm mt-1">View and manage your trainee information record.</p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {/* Export Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="gap-2 border-card-border" disabled={isExporting}>
                <Download className="h-4 w-4" />
                Export
                <ChevronDown className="h-3 w-3 opacity-50" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-52">
              <DropdownMenuItem onClick={handleExportExcel} className="gap-2 cursor-pointer">
                <FileSpreadsheet className="h-4 w-4 text-emerald-600" />
                Download as Excel (.xlsx)
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleExportWord} className="gap-2 cursor-pointer">
                <FileText className="h-4 w-4 text-blue-600" />
                Download as Word (.docx)
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Edit / Save */}
          {isEditing ? (
            <>
              <Button variant="outline" size="sm" onClick={() => setIsEditing(false)} className="gap-2">
                <X className="h-4 w-4" />
                Cancel
              </Button>
              <Button size="sm" onClick={handleSave} disabled={isSaving} className="gap-2 bg-primary hover:bg-primary/90">
                {isSaving ? (
                  <span className="animate-pulse">Saving…</span>
                ) : (
                  <>
                    <Save className="h-4 w-4" />
                    Save Changes
                  </>
                )}
              </Button>
            </>
          ) : (
            <Button size="sm" variant="outline" onClick={() => setIsEditing(true)} className="gap-2 border-card-border">
              <Pencil className="h-4 w-4" />
              Edit Profile
            </Button>
          )}
        </div>
      </motion.div>

      {/* Identity Card */}
      <motion.div variants={item}>
        <Card className="border-card-border shadow-sm overflow-hidden">
          <div className="h-20 bg-gradient-to-r from-primary to-primary/60" />
          <CardContent className="pt-0 pb-6 px-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-end gap-4 -mt-10">
              <div className="w-20 h-20 rounded-2xl ring-4 ring-background overflow-hidden shrink-0">
                <AvatarInitials name={`${form.firstName} ${form.lastName}`} size="lg" />
              </div>
              <div className="flex-1 sm:pb-2">
                <h2 className="text-xl font-bold text-foreground">
                  {form.firstName} {form.lastName}
                </h2>
                <p className="text-sm text-muted-foreground">{form.traineeEmail}</p>
              </div>
              <div className="flex flex-wrap items-center gap-2 sm:pb-2">
                <StatusBadge status={existing?.status as any} />
                <Badge variant="outline" className="text-xs border-card-border">
                  {existing?.refNo}
                </Badge>
                {course && (
                  <Badge className="text-xs bg-primary/10 text-primary hover:bg-primary/10 border border-primary/20">
                    {course.title} {course.ncLevel}
                  </Badge>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Info sections */}
      {FIELD_GROUPS.map((group) => {
        const GroupIcon = group.icon;
        return (
          <motion.div key={group.title} variants={item}>
            <Card className="border-card-border shadow-sm">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-base">
                  <div className="w-7 h-7 bg-primary/10 rounded-lg flex items-center justify-center">
                    <GroupIcon className="h-4 w-4 text-primary" />
                  </div>
                  {group.title}
                  {isEditing && (
                    <Badge variant="outline" className="ml-auto text-xs text-amber-600 border-amber-300 bg-amber-50">
                      Editing
                    </Badge>
                  )}
                </CardTitle>
              </CardHeader>
              <Separator className="mb-4" />
              <CardContent>
                <div className="grid grid-cols-2 gap-x-8 gap-y-5">
                  {group.fields.map((field) => renderField(field))}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        );
      })}

      {/* Print Tip */}
      <motion.div variants={item}>
        <div className="flex items-center gap-3 p-4 rounded-xl bg-primary/5 border border-primary/15 text-sm text-muted-foreground">
          <Printer className="h-4 w-4 text-primary shrink-0" />
          <span>
            <strong className="text-foreground">Tip:</strong> Download as <strong>Word (.docx)</strong> to get a print-ready Admission Form with your complete details and signature blocks, or use <strong>Excel (.xlsx)</strong> for submitting data to staff.
          </span>
        </div>
      </motion.div>
    </motion.div>
  );
}
