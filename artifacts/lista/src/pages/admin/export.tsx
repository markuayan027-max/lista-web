import { useState } from "react";
import { motion } from "framer-motion";
import {
  Download, FileUp, FileText, Database, Users, Calendar,
  Loader2, FileSpreadsheet, Search, Eye, Filter,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import PrimaryButton from "@/components/primary-button";
import AvatarInitials from "@/components/avatar-initials";
import StatusBadge from "@/components/status-badge";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription
} from "@/components/ui/dialog";
import { useCourseBatches, useCourses, useEnrollments } from "@/hooks/use-lista-data";
import {
  exportTraineesToExcel,
  exportSingleTraineeToWord,
  exportAllTraineesToWord,
} from "@/lib/export-utils";
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
  const [batchLoading, setBatchLoading] = useState<string | null>(null);
  const [previewEnrollment, setPreviewEnrollment] = useState<Enrollment | null>(null);

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

  const doExport = async (fn: () => Promise<void> | void, id: string) => {
    setExportingId(id);
    try {
      await fn();
      toast({ title: "Export Successful", description: "File downloaded successfully." });
    } catch {
      toast({ title: "Export Failed", description: "Could not generate file.", variant: "destructive" });
    } finally {
      setExportingId(null);
    }
  };

  const doBatch = async (fn: () => Promise<void>, label: string) => {
    setBatchLoading(label);
    try {
      await fn();
      toast({ title: "Batch Export Complete", description: `${label} downloaded.` });
    } catch {
      toast({ title: "Export Failed", description: "Could not generate batch file.", variant: "destructive" });
    } finally {
      setBatchLoading(null);
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
              Download trainee application forms (Word/PDF) for printing, and Excel sheets for batch processing in the
              Batch Excel tab.
            </p>
          </div>
        </div>
      </motion.div>

      <Tabs defaultValue="trainees">
        <motion.div variants={itemVariants}>
          <TabsList className="bg-muted/50">
            <TabsTrigger value="trainees" className="gap-2">
              <Users className="h-4 w-4" /> Trainees
            </TabsTrigger>
            <TabsTrigger value="batch" className="gap-2">
              <Database className="h-4 w-4" /> Batch Excel
            </TabsTrigger>
          </TabsList>
        </motion.div>

        {/* ── Per-trainee application form (Word/PDF) ── */}
        <TabsContent value="trainees" className="space-y-4 mt-4">
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
                                onClick={() =>
                                  doExport(() => exportSingleTraineeToWord(e), `${rowId}-doc`)
                                }
                                title="PDF export application form"
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
        </TabsContent>

        {/* ── Batch Excel / Word ── */}
        <TabsContent value="batch" className="mt-4 space-y-3">
          <p className="text-sm text-muted-foreground max-w-3xl rounded-lg border border-border bg-muted/40 px-4 py-3">
            <strong className="font-semibold text-foreground">Batch / cohort tip:</strong> target roughly 25 trainees per class. Use the Trainees tab search and status filter, then run{" "}
            <strong className="font-semibold text-foreground">Filtered / Custom Excel</strong> to pull one cohort’s application packet in one click.
          </p>
          <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* All trainees Excel */}
            <Card className="border-card-border shadow-sm hover:border-emerald-300 transition-colors">
              <CardHeader>
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-emerald-50 rounded-xl flex items-center justify-center shrink-0">
                    <FileSpreadsheet className="h-6 w-6 text-emerald-600" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">All Trainees — Excel</CardTitle>
                    <CardDescription className="mt-1">
                      Export the complete list of all {enrollments.length} trainee(s) as a formatted Excel spreadsheet.
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardFooter className="border-t border-card-border pt-4">
                <Button
                  className="w-full font-semibold bg-emerald-600 hover:bg-emerald-700 text-white"
                  disabled={batchLoading === "excel"}
                  onClick={() =>
                    doBatch(() => Promise.resolve(exportTraineesToExcel(enrollments)), "excel")
                  }
                >
                  {batchLoading === "excel" ? (
                    <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Generating…</>
                  ) : (
                    <><Download className="h-4 w-4 mr-2" /> Download Excel</>
                  )}
                </Button>
              </CardFooter>
            </Card>

            {/* All trainees Word */}
            <Card className="border-card-border shadow-sm hover:border-blue-300 transition-colors">
              <CardHeader>
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center shrink-0">
                    <FileText className="h-6 w-6 text-blue-600" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">All Trainees — Word</CardTitle>
                    <CardDescription className="mt-1">
                      Export all {enrollments.length} trainee record(s) as a combined Word document suitable for printing.
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardFooter className="border-t border-card-border pt-4">
                <Button
                  className="w-full font-semibold bg-primary-indigo hover:bg-primary-indigo/90 text-primary-foreground"
                  disabled={batchLoading === "word"}
                  onClick={() => doBatch(() => exportAllTraineesToWord(enrollments), "word")}
                >
                  {batchLoading === "word" ? (
                    <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Generating…</>
                  ) : (
                    <><Download className="h-4 w-4 mr-2" /> Download Word</>
                  )}
                </Button>
              </CardFooter>
            </Card>

            {/* Filtered export */}
            <Card className="border-card-border shadow-sm md:col-span-2 hover:border-primary/30 transition-colors">
              <CardHeader>
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-primary/5 rounded-xl flex items-center justify-center shrink-0">
                    <Filter className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">Filtered / Custom Excel</CardTitle>
                    <CardDescription className="mt-1">
                      Use the search, status, and batch filter in the Trainees tab, then export only the matching records.
                      Currently <strong>{filtered.length}</strong> record(s) match your current filter.
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardFooter className="border-t border-card-border pt-4 gap-3">
                <Button
                  variant="outline"
                  className="flex-1 font-semibold text-emerald-700 border-emerald-300 hover:bg-emerald-50"
                  disabled={batchLoading === "filtered-xl"}
                  onClick={() =>
                    doBatch(() => Promise.resolve(exportTraineesToExcel(filtered, "LISTA_Filtered")), "filtered-xl")
                  }
                >
                  {batchLoading === "filtered-xl" ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <FileSpreadsheet className="h-4 w-4 mr-2" />
                  )}
                  Download Batch Excel
                </Button>
              </CardFooter>
            </Card>
          </motion.div>
        </TabsContent>
      </Tabs>

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
                onClick={async () => {
                  await exportSingleTraineeToWord(previewEnrollment);
                  setPreviewEnrollment(null);
                }}
              >
                <FileText className="h-4 w-4 mr-2" /> PDF application form
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </motion.div>
  );
}
