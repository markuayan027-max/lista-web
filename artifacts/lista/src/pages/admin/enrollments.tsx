import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search, Filter, Download, Check, X, MoreHorizontal,
  Printer, Eye, ChevronRight, FileText, Clock, Users, CheckCircle2, XCircle
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import StatusBadge from "@/components/status-badge";
import { useToast } from "@/hooks/use-toast";
import { enrollments as initialEnrollments, courses, Enrollment } from "@/lib/institutional-data";
import PrintableTESDAForm from "@/components/printable-tesda-form";

// ── Stats card ────────────────────────────────────────────────────────────────
function StatPill({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div className={`flex items-center gap-3 px-5 py-3 rounded-2xl border ${color}`}>
      <span className="text-2xl font-black">{value}</span>
      <span className="text-xs font-bold uppercase tracking-widest opacity-70">{label}</span>
    </div>
  );
}

// ── Print modal ───────────────────────────────────────────────────────────────
function PrintModal({ enrollment, onClose }: { enrollment: Enrollment; onClose: () => void }) {
  const course = courses.find(c => c.slug === enrollment.courseSlug);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/60 backdrop-blur-sm overflow-y-auto py-8">
      {/* Backdrop click */}
      <div className="absolute inset-0" onClick={onClose} />

      <div className="relative z-10 w-full max-w-5xl mx-4">
        {/* Toolbar */}
        <div className="no-print flex items-center justify-between bg-white rounded-2xl px-6 py-4 mb-4 shadow-xl border border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center">
              <FileText className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="font-black text-slate-900 text-sm">{enrollment.traineeName}</p>
              <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">{enrollment.refNo}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              onClick={onClose}
              className="rounded-xl font-bold text-slate-500"
            >
              <X className="w-4 h-4 mr-2" /> Close
            </Button>
            <Button
              onClick={handlePrint}
              className="rounded-xl font-bold gap-2 bg-primary hover:bg-primary/90 shadow-lg shadow-primary/20"
            >
              <Printer className="w-4 h-4" /> Print / Download PDF
            </Button>
          </div>
        </div>

        {/* Form preview */}
        <div className="overflow-hidden rounded-2xl shadow-2xl border border-slate-200 bg-white">
          <PrintableTESDAForm
            data={{
              ...enrollment,
              // ── Name ──
              firstName: enrollment.firstName,
              middleName: enrollment.middleName || "",
              lastName: enrollment.lastName,
              extensionName: enrollment.extensionName || "",
              
              // ── Birth & Identity ──
              dob: enrollment.dob,
              birthPlace: enrollment.birthPlace || "",
              age: enrollment.age,
              nationality: enrollment.nationality || "Filipino",
              
              // ── Contact ──
              email: enrollment.traineeEmail,
              contact: enrollment.contactNumber,
              telephone: enrollment.telephone || "",
              mobileNumber: enrollment.mobileNumber || enrollment.contactNumber,
              
              // ── Address ──
              address: enrollment.homeAddress,
              barangay: enrollment.barangay || "",
              district: enrollment.district || "",
              city: enrollment.city,
              province: enrollment.province,
              region: enrollment.region || "Region X — Northern Mindanao",
              zipCode: enrollment.zipCode || "9014",
              
              // ── Family ──
              motherName: enrollment.motherMaidenName,
              fatherName: enrollment.fatherName,
              
              // ── Demographics ──
              gender: enrollment.gender,
              civilStatus: enrollment.civilStatus,
              
              // ── Education ──
              education: enrollment.education,
              school: enrollment.schoolLastAttended || "",
              
              // ── Employment ──
              employmentStatus: enrollment.employmentStatus,
              employmentType: enrollment.employmentType || "",
              companyName: enrollment.companyName || "",
              
              // ── TESDA-specific ──
              clientType: enrollment.clientType || enrollment.learnerClassification,
              qualificationType: enrollment.qualificationType || "Full Qualification",
              
              // ── Work Experience ──
              workExperience: enrollment.workExperience || [],
              
              // ── Course ──
              courseName: course?.title,
              schedule: enrollment.preferredSchedule,
              
              // ── Meta ──
              enrollType: enrollment.enrollmentType,
              scholarship: enrollment.scholarshipApplication,
              heardFrom: enrollment.heardFrom || "",
              notes: enrollment.notes || "",
            }}
            refNo={enrollment.refNo}
          />
        </div>
      </div>
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────
export default function AdminEnrollmentsPage() {
  const { toast } = useToast();
  const [enrollments, setEnrollments] = useState(initialEnrollments);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [courseFilter, setCourseFilter] = useState("all");
  const [printTarget, setPrintTarget] = useState<Enrollment | null>(null);

  const toggleSelectAll = () => {
    if (selectedIds.length === filteredEnrollments.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filteredEnrollments.map(e => e.id));
    }
  };

  const toggleSelect = (id: string) => {
    setSelectedIds(prev =>
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const handleBulkAction = (action: "confirm" | "reject") => {
    setEnrollments(prev =>
      prev.map(e =>
        selectedIds.includes(e.id)
          ? { ...e, status: action === "confirm" ? "confirmed" : "rejected" }
          : e
      )
    );
    toast({
      title: `Enrollments ${action === "confirm" ? "Approved" : "Rejected"}`,
      description: `${selectedIds.length} enrollments have been updated.`,
    });
    setSelectedIds([]);
  };

  const handleSingleAction = (id: string, action: "confirmed" | "rejected") => {
    setEnrollments(prev =>
      prev.map(e => (e.id === id ? { ...e, status: action } : e))
    );
    toast({
      title: "Status Updated",
      description: `Enrollment status changed to ${action}.`,
    });
  };

  const filteredEnrollments = enrollments.filter(e => {
    const matchesSearch =
      e.traineeName.toLowerCase().includes(search.toLowerCase()) ||
      e.refNo.toLowerCase().includes(search.toLowerCase()) ||
      e.traineeEmail.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === "all" || e.status === statusFilter;
    const matchesCourse = courseFilter === "all" || e.courseSlug === courseFilter;
    return matchesSearch && matchesStatus && matchesCourse;
  });

  // Stat counts
  const pending = enrollments.filter(e => e.status === "pending").length;
  const confirmed = enrollments.filter(e => e.status === "confirmed").length;
  const rejected = enrollments.filter(e => e.status === "rejected").length;

  return (
    <>
      {/* Print modal */}
      <AnimatePresence>
        {printTarget && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <PrintModal
              enrollment={printTarget}
              onClose={() => setPrintTarget(null)}
            />
          </motion.div>
        )}
      </AnimatePresence>

      <motion.div
        className="space-y-6"
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl font-black tracking-tight text-slate-900">All Enrollments</h1>
            <p className="text-slate-400 text-sm mt-1">Manage, approve, and print TESDA application forms.</p>
          </div>
          <Button variant="outline" className="gap-2 font-semibold rounded-xl border-slate-200">
            <Download className="h-4 w-4" /> Export CSV
          </Button>
        </div>

        {/* Stat pills */}
        <div className="flex flex-wrap gap-3">
          <StatPill label="Total" value={enrollments.length} color="bg-slate-50 border-slate-200 text-slate-700" />
          <StatPill label="Pending" value={pending} color="bg-amber-50 border-amber-200 text-amber-700" />
          <StatPill label="Confirmed" value={confirmed} color="bg-emerald-50 border-emerald-200 text-emerald-700" />
          <StatPill label="Rejected" value={rejected} color="bg-rose-50 border-rose-200 text-rose-700" />
        </div>

        {/* Search + Filters */}
        <Card className="border-slate-100 shadow-sm rounded-2xl">
          <CardContent className="p-4">
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input
                  placeholder="Search by name, email, or Ref No..."
                  className="pl-9 bg-slate-50 border-slate-100 rounded-xl"
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                />
              </div>
              <div className="flex gap-2">
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-[140px] bg-white rounded-xl border-slate-200">
                    <div className="flex items-center gap-2 text-slate-500">
                      <Filter className="h-3 w-3" />
                      <SelectValue placeholder="Status" />
                    </div>
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="confirmed">Confirmed</SelectItem>
                    <SelectItem value="rejected">Rejected</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={courseFilter} onValueChange={setCourseFilter}>
                  <SelectTrigger className="w-[200px] bg-white rounded-xl border-slate-200">
                    <SelectValue placeholder="All Courses" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Courses</SelectItem>
                    {courses.map(c => (
                      <SelectItem key={c.slug} value={c.slug}>{c.title}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Bulk action bar */}
        <AnimatePresence>
          {selectedIds.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="bg-primary/5 border border-primary/20 rounded-2xl p-3 flex items-center justify-between"
            >
              <span className="text-sm font-bold text-primary ml-2">
                {selectedIds.length} selected
              </span>
              <div className="flex gap-2">
                <Button size="sm" variant="outline" onClick={() => handleBulkAction("reject")}
                  className="text-rose-600 border-rose-200 hover:bg-rose-50 rounded-xl font-bold">
                  <XCircle className="w-3 h-3 mr-1" /> Reject
                </Button>
                <Button size="sm" onClick={() => handleBulkAction("confirm")}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold">
                  <CheckCircle2 className="w-3 h-3 mr-1" /> Approve
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Table */}
        <Card className="border-slate-100 shadow-sm overflow-hidden rounded-2xl">
          <div className="overflow-x-auto hide-scrollbar">
            <Table>
              <TableHeader>
                <TableRow className="bg-slate-50/80 hover:bg-slate-50/80 border-b border-slate-100">
                  <TableHead className="w-12">
                    <Checkbox
                      checked={selectedIds.length === filteredEnrollments.length && filteredEnrollments.length > 0}
                      onCheckedChange={toggleSelectAll}
                    />
                  </TableHead>
                  <TableHead className="font-black text-[10px] uppercase tracking-widest text-slate-400">Ref No</TableHead>
                  <TableHead className="font-black text-[10px] uppercase tracking-widest text-slate-400">Trainee</TableHead>
                  <TableHead className="font-black text-[10px] uppercase tracking-widest text-slate-400">Course</TableHead>
                  <TableHead className="font-black text-[10px] uppercase tracking-widest text-slate-400">Date Applied</TableHead>
                  <TableHead className="font-black text-[10px] uppercase tracking-widest text-slate-400">Status</TableHead>
                  <TableHead className="w-32 font-black text-[10px] uppercase tracking-widest text-slate-400">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredEnrollments.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-16 text-slate-400">
                      <div className="flex flex-col items-center gap-3">
                        <Users className="w-10 h-10 opacity-30" />
                        <p className="font-bold text-sm">No enrollments found</p>
                        <p className="text-xs">Try adjusting your filters</p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredEnrollments.map(enrollment => {
                    const course = courses.find(c => c.slug === enrollment.courseSlug);
                    return (
                      <TableRow key={enrollment.id} className="group hover:bg-slate-50/60 border-b border-slate-50 transition-colors">
                        <TableCell>
                          <Checkbox
                            checked={selectedIds.includes(enrollment.id)}
                            onCheckedChange={() => toggleSelect(enrollment.id)}
                          />
                        </TableCell>
                        <TableCell className="font-mono text-xs font-bold text-slate-500 uppercase tracking-wider">
                          {enrollment.refNo}
                        </TableCell>
                        <TableCell>
                          <div>
                            <p className="font-bold text-slate-800 whitespace-nowrap">{enrollment.traineeName}</p>
                            <p className="text-xs text-slate-400">{enrollment.traineeEmail}</p>
                          </div>
                        </TableCell>
                        <TableCell className="text-sm font-medium max-w-[180px] truncate text-slate-600" title={course?.title}>
                          {course?.title || enrollment.courseSlug}
                        </TableCell>
                        <TableCell className="text-xs text-slate-400 whitespace-nowrap">
                          {new Date(enrollment.createdAt).toLocaleDateString("en-PH", {
                            month: "short", day: "numeric", year: "numeric"
                          })}
                        </TableCell>
                        <TableCell>
                          <StatusBadge status={enrollment.status as any} />
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            {/* Print / View form button */}
                            <Button
                              size="sm"
                              variant="ghost"
                              className="h-8 w-8 p-0 rounded-lg hover:bg-primary/10 hover:text-primary text-slate-400"
                              title="View & Print TESDA Form"
                              onClick={() => setPrintTarget(enrollment)}
                            >
                              <Printer className="w-4 h-4" />
                            </Button>

                            {/* More actions */}
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-8 w-8 p-0 rounded-lg text-slate-400 hover:text-slate-700"
                                >
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end" className="w-[180px] rounded-xl">
                                <DropdownMenuItem
                                  className="text-slate-600 font-medium cursor-pointer rounded-lg"
                                  onClick={() => setPrintTarget(enrollment)}
                                >
                                  <Eye className="mr-2 h-4 w-4" /> View Form
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  className="text-emerald-600 font-medium cursor-pointer rounded-lg"
                                  onClick={() => handleSingleAction(enrollment.id, "confirmed")}
                                  disabled={enrollment.status === "confirmed"}
                                >
                                  <Check className="mr-2 h-4 w-4" /> Approve
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  className="text-rose-600 font-medium cursor-pointer rounded-lg"
                                  onClick={() => handleSingleAction(enrollment.id, "rejected")}
                                  disabled={enrollment.status === "rejected"}
                                >
                                  <X className="mr-2 h-4 w-4" /> Reject
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </div>

          <div className="p-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-400 bg-slate-50/50">
            <span>
              Showing {filteredEnrollments.length} of {enrollments.length} enrollments
            </span>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" disabled className="rounded-lg text-xs">Previous</Button>
              <Button variant="outline" size="sm" disabled={filteredEnrollments.length <= 10} className="rounded-lg text-xs">Next</Button>
            </div>
          </div>
        </Card>
      </motion.div>
    </>
  );
}
