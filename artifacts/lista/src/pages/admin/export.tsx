import { useState } from "react";
import { motion } from "framer-motion";
import {
  Download, FileUp, FileText, Calendar,
  Loader2, Search, Eye, Filter,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import PrimaryButton from "@/components/primary-button";
import AvatarInitials from "@/components/avatar-initials";
import StatusBadge from "@/components/status-badge";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription
} from "@/components/ui/dialog";
import { useCourseBatches, useCourses, useEnrollments } from "@/hooks/use-lista-data";
import AdminTesdaPdfExportPortal from "@/components/admin-tesda-pdf-export-portal";
import type { Enrollment } from "@/lib/institutional-data";
import { format } from "date-fns";

const containerVariants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.1 } },
};
const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { type: "spring" as const, stiffness: 300, damping: 24 } },
};

export default function AdminExportPage() {
  const { toast } = useToast();
  const { data: enrollments = [], isLoading } = useEnrollments();
  const { data: courses = [] } = useCourses();
  const { data: courseBatches = [] } = useCourseBatches();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [batchFilter, setBatchFilter] = useState("all");
  const [exportingId, setExportingId] = useState<string | null>(null);
  const [previewEnrollment, setPreviewEnrollment] = useState<Enrollment | null>(null);
  const [pdfExportEnrollment, setPdfExportEnrollment] = useState<Enrollment | null>(null);

  const filtered = enrollments.filter((e) => {
    const q = search.toLowerCase();
    const matchesSearch =
      e.traineeName.toLowerCase().includes(q) ||
      e.traineeEmail.toLowerCase().includes(q) ||
      e.refNo.toLowerCase().includes(q);
    const matchesStatus = statusFilter === "all" || e.status === statusFilter;
    const matchesBatch =
      batchFilter === "all" ||
      (batchFilter === "unbatched"
        ? !e.batchCode
        : String(e.batchCode || "") === batchFilter);
    return matchesSearch && matchesStatus && matchesBatch;
  });

  const startPdfExport = (enrollment: Enrollment, id: string) => {
    setExportingId(id);
    setPdfExportEnrollment(enrollment);
  };

  const finishPdfExport = (success: boolean) => {
    setPdfExportEnrollment(null);
    setExportingId(null);
    if (success) {
      toast({ title: "PDF downloaded", description: "Official TESDA application form (A4, 2 pages)." });
    } else {
      toast({
        title: "PDF export failed",
        description: "Could not generate the application form PDF.",
        variant: "destructive",
      });
    }
  };

  return (
    <motion.div
      className="space-y-6"
      variants={containerVariants}
      initial="hidden"
      animate="show"
    >
      {/* Header Banner */}
      <motion.div variants={itemVariants}>
        <div className="bg-primary text-primary-foreground p-8 rounded-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
            <FileUp className="h-32 w-32" />
          </div>
          <div className="relative z-10 max-w-2xl">
            <h1 className="text-3xl font-bold tracking-tight">Admission Records Center</h1>
            <p className="text-primary-foreground/80 mt-2">
              Download official TESDA application forms as PDF. Choose A4 or Long bond paper when printing from the
              browser preview.
            </p>
          </div>
        </div>
      </motion.div>

      <div className="space-y-4">
          <motion.div variants={itemVariants} className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by name, email, or ref no..."
                className="pl-9 bg-card border-card-border"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-40 bg-card border-card-border">
                <Filter className="h-4 w-4 mr-2 text-muted-foreground" />
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="confirmed">Confirmed</SelectItem>
                <SelectItem value="waitlisted">Waitlisted</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
              </SelectContent>
            </Select>
            <Select value={batchFilter} onValueChange={setBatchFilter}>
              <SelectTrigger className="w-full sm:w-56 bg-card border-card-border">
                <SelectValue placeholder="All Batches" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Batches</SelectItem>
                <SelectItem value="unbatched">Unassigned</SelectItem>
                {Array.from(new Map(courseBatches.map((b) => [b.batchCode, b])).values())
                  .filter((b) => b.batchCode)
                  .map((b) => (
                    <SelectItem key={b.id} value={b.batchCode}>
                      {b.batchCode} — {b.batchName}
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
          </motion.div>

          <motion.div variants={itemVariants}>
            <Card className="border-card-border shadow-sm overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/30 hover:bg-muted/30">
                    <TableHead className="font-semibold text-muted-foreground">Trainee</TableHead>
                    <TableHead className="font-semibold text-muted-foreground">Course</TableHead>
                    <TableHead className="font-semibold text-muted-foreground">Status</TableHead>
                    <TableHead className="font-semibold text-muted-foreground">Date Applied</TableHead>
                    <TableHead className="text-right font-semibold text-muted-foreground">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-10 text-muted-foreground">
                        No trainees found.
                      </TableCell>
                    </TableRow>
                  ) : (
                    filtered.map((e) => {
                      const course = courses.find((c) => c.slug === e.courseSlug);
                      const rowId = e.id;
                      return (
                        <TableRow key={e.id} className="group hover:bg-muted/30">
                          <TableCell>
                            <div className="flex items-center gap-3">
                              <AvatarInitials name={e.traineeName} size="sm" />
                              <div>
                                <p className="font-semibold text-sm">{e.traineeName}</p>
                                <p className="text-xs text-muted-foreground">{e.refNo}</p>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell className="text-sm">
                            {course ? (
                              <div>
                                <p className="font-medium">{course.title}</p>
                                <p className="text-xs text-muted-foreground">{course.ncLevel}</p>
                              </div>
                            ) : (
                              <span className="text-muted-foreground">—</span>
                            )}
                          </TableCell>
                          <TableCell>
                            <StatusBadge status={e.status as any} />
                          </TableCell>
                          <TableCell className="text-sm text-muted-foreground">
                            {format(new Date(e.createdAt), "MMM dd, yyyy")}
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center justify-end gap-1">
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 opacity-0 group-hover:opacity-100"
                                onClick={() => setPreviewEnrollment(e)}
                                title="Preview"
                              >
                                <Eye className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 opacity-0 group-hover:opacity-100 text-blue-600"
                                disabled={exportingId === `${rowId}-doc`}
                                onClick={() => startPdfExport(e, `${rowId}-doc`)}
                                title="Download PDF application form"
                              >
                                {exportingId === `${rowId}-doc` ? (
                                  <Loader2 className="h-4 w-4 animate-spin" />
                                ) : (
                                  <FileText className="h-4 w-4" />
                                )}
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    })
                  )}
                </TableBody>
              </Table>
            </Card>
          </motion.div>
      </div>

      {/* Preview Dialog */}
      {previewEnrollment && (
        <Dialog open={!!previewEnrollment} onOpenChange={() => setPreviewEnrollment(null)}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <AvatarInitials name={previewEnrollment.traineeName} size="sm" />
                {previewEnrollment.traineeName}
              </DialogTitle>
              <DialogDescription>{previewEnrollment.refNo}</DialogDescription>
            </DialogHeader>
            <div className="grid grid-cols-2 gap-x-6 gap-y-3 text-sm py-2">
              {[
                ["Email", previewEnrollment.traineeEmail],
                ["Contact", previewEnrollment.contactNumber],
                ["DOB", previewEnrollment.dob],
                ["Gender", previewEnrollment.gender],
                ["Civil Status", previewEnrollment.civilStatus],
                ["Education", previewEnrollment.education],
                ["Employment", previewEnrollment.employmentStatus],
                ["Address", `${previewEnrollment.homeAddress}, ${previewEnrollment.city}`],
                ["Schedule", previewEnrollment.preferredSchedule],
                ["Scholarship", previewEnrollment.scholarshipApplication],
              ].map(([label, val]) => (
                <div key={label}>
                  <p className="text-xs font-semibold uppercase text-muted-foreground">{label}</p>
                  <p className="font-medium text-foreground truncate">{val || "—"}</p>
                </div>
              ))}
            </div>
            <div className="flex gap-2 pt-2 border-t border-card-border mt-2">
              <Button
                variant="outline"
                size="sm"
                className="flex-1 text-blue-700 border-blue-300 hover:bg-blue-50"
                onClick={() => {
                  const target = previewEnrollment;
                  setPreviewEnrollment(null);
                  startPdfExport(target, `preview-${target.id}`);
                }}
              >
                <FileText className="h-4 w-4 mr-2" /> PDF application form
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      )}

      {pdfExportEnrollment && (
        <AdminTesdaPdfExportPortal
          enrollment={pdfExportEnrollment}
          onDone={finishPdfExport}
        />
      )}
    </motion.div>
  );
}
