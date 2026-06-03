import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  Filter,
  Check,
  X,
  Printer,
  MoreHorizontal,
  Eye,
  ChevronRight,
  Users,
  CheckCircle2,
  XCircle,
} from "lucide-react";
import { format } from "date-fns";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useToast } from "@/hooks/use-toast";
import type { Enrollment } from "@/lib/institutional-data";
import PrintModal from "@/components/print-modal";
import StatusBadge from "@/components/status-badge";
import { TableSkeleton } from "@/components/skeletons";
import BatchPickerDialog, { type BatchPickerMode } from "@/components/batch-picker-dialog";
import EnrollmentDetailSheet from "@/components/enrollments/enrollment-detail-sheet";
import {
  useBulkUpdateEnrollmentStatus,
  useCourses,
  useCourseBatches,
  useEnrollments,
  useJoinEnrollmentBatch,
  useMarkTesdaNcSent,
  useTransferEnrollmentBatch,
  useUpdateEnrollmentStatus,
} from "@/hooks/use-lista-data";
import { enrollmentStatusIs } from "@/lib/enrollment-status";
import { STAFF_ADMIN_STATUS_FILTER_OPTIONS } from "@/lib/enrollment-domain";
import { getEnrollmentStatusActions } from "@/lib/enrollment-staff-actions";
import { courseTitleBySlug } from "@/lib/lista-insforge-data";
import type { CourseBatchRow } from "@/lib/lista-insforge-data";

export type EnrollmentsWorkspaceMode = "staff" | "admin";

type Props = {
  mode: EnrollmentsWorkspaceMode;
};

function StatPill({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <motion.div
      className={`flex items-center gap-2 sm:gap-3 px-3 sm:px-5 py-2.5 sm:py-3 rounded-2xl border min-w-0 ${color}`}
    >
      <span className="text-xl sm:text-2xl font-black tabular-nums">{value}</span>
      <span className="text-[10px] sm:text-xs font-bold uppercase tracking-widest opacity-70">{label}</span>
    </motion.div>
  );
}

export default function EnrollmentsWorkspace({ mode }: Props) {
  const isAdmin = mode === "admin";
  const { toast } = useToast();
  const { data: enrollments = [], isLoading, isError, error, refetch } = useEnrollments();
  const { data: courses = [] } = useCourses();
  const { data: courseBatches = [] } = useCourseBatches();
  const updateStatus = useUpdateEnrollmentStatus();
  const bulkUpdate = useBulkUpdateEnrollmentStatus();
  const markNcSent = useMarkTesdaNcSent();
  const joinBatch = useJoinEnrollmentBatch();
  const transferBatch = useTransferEnrollmentBatch();

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [courseFilter, setCourseFilter] = useState("all");
  const [batchFilter, setBatchFilter] = useState("all");
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [detailEnrollment, setDetailEnrollment] = useState<Enrollment | null>(null);
  const [printTarget, setPrintTarget] = useState<Enrollment | null>(null);
  const [batchPickerOpen, setBatchPickerOpen] = useState(false);
  const [batchPickerMode, setBatchPickerMode] = useState<BatchPickerMode>("join");
  const [batchPickerEnrollment, setBatchPickerEnrollment] = useState<Enrollment | null>(null);
  const [batchActionLoading, setBatchActionLoading] = useState(false);
  const [statusUpdating, setStatusUpdating] = useState(false);

  const formalEnrollments = useMemo(
    () => enrollments.filter((e) => !enrollmentStatusIs(e.status, "ready_to_apply")),
    [enrollments],
  );

  const filteredEnrollments = useMemo(() => {
    return formalEnrollments.filter((e) => {
      const q = search.toLowerCase();
      const matchesSearch =
        e.traineeName.toLowerCase().includes(q) ||
        e.refNo.toLowerCase().includes(q) ||
        e.traineeEmail.toLowerCase().includes(q);
      const matchesStatus = statusFilter === "all" || enrollmentStatusIs(e.status, statusFilter);
      const matchesCourse = courseFilter === "all" || e.courseSlug === courseFilter;
      const matchesBatch =
        !isAdmin ||
        batchFilter === "all" ||
        (batchFilter === "unbatched" ? !e.batchCode : String(e.batchCode || "") === batchFilter);
      return matchesSearch && matchesStatus && matchesCourse && matchesBatch;
    });
  }, [formalEnrollments, search, statusFilter, courseFilter, batchFilter, isAdmin]);

  const stats = useMemo(() => {
    const pending = formalEnrollments.filter((e) => enrollmentStatusIs(e.status, "pending")).length;
    const confirmed = formalEnrollments.filter((e) =>
      enrollmentStatusIs(e.status, "confirmed", "enrolled"),
    ).length;
    const rejected = formalEnrollments.filter((e) => enrollmentStatusIs(e.status, "rejected")).length;
    const assessment = formalEnrollments.filter((e) =>
      enrollmentStatusIs(e.status, "for_assessment", "assessment_scheduled", "assessment_failed"),
    ).length;
    return { pending, confirmed, rejected, assessment };
  }, [formalEnrollments]);

  const openBatchPicker = (enrollment: Enrollment, pickerMode: BatchPickerMode) => {
    setBatchPickerEnrollment(enrollment);
    setBatchPickerMode(pickerMode);
    setBatchPickerOpen(true);
  };

  const openBatchesForEnrollment = (enrollment: Enrollment): CourseBatchRow[] =>
    courseBatches.filter(
      (b) =>
        b.courseSlug === enrollment.courseSlug &&
        b.status === "open" &&
        (b.seatsTaken ?? 0) < b.capacity,
    );

  const handleBatchPickerConfirm = async (batchId: string) => {
    if (!batchPickerEnrollment) return;
    setBatchActionLoading(true);
    try {
      if (batchPickerMode === "join") {
        await joinBatch.mutateAsync({ enrollmentId: batchPickerEnrollment.id, batchId });
        toast({ title: "Joined batch", description: "Trainee assigned to batch." });
      } else {
        await transferBatch.mutateAsync({ enrollmentId: batchPickerEnrollment.id, batchId });
        toast({ title: "Transferred", description: "Batch updated for this enrollment." });
      }
    } catch (err) {
      toast({
        title: "Batch update failed",
        description: err instanceof Error ? err.message : "Unknown error",
        variant: "destructive",
      });
    } finally {
      setBatchActionLoading(false);
    }
  };

  const handleStatusChange = async (id: string, status: Enrollment["status"]) => {
    setStatusUpdating(true);
    try {
      await updateStatus.mutateAsync({ id, status });
      toast({ title: "Status updated", description: `Enrollment is now ${status.replace(/_/g, " ")}.` });
      if (detailEnrollment?.id === id) {
        setDetailEnrollment({ ...detailEnrollment, status });
      }
    } catch (err) {
      toast({
        title: "Update failed",
        description: err instanceof Error ? err.message : "Unknown error",
        variant: "destructive",
      });
    } finally {
      setStatusUpdating(false);
    }
  };

  const handleMarkNcSent = async (id: string) => {
    try {
      await markNcSent.mutateAsync({ id });
      toast({
        title: "TESDA NC marked sent",
        description: "Trainee can start a new application after this cycle closes.",
      });
      if (detailEnrollment?.id === id) {
        setDetailEnrollment({ ...detailEnrollment, tesdaNcSentAt: new Date().toISOString() });
      }
    } catch (err) {
      toast({
        title: "Update failed",
        description: err instanceof Error ? err.message : "Unknown error",
        variant: "destructive",
      });
    }
  };

  const toggleSelectAll = () => {
    if (selectedIds.length === filteredEnrollments.length) setSelectedIds([]);
    else setSelectedIds(filteredEnrollments.map((e) => e.id));
  };

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) => (prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]));
  };

  const handleBulkAction = async (action: "confirm" | "reject") => {
    const status = action === "confirm" ? "confirmed" : "rejected";
    try {
      await bulkUpdate.mutateAsync({ ids: selectedIds, status });
      toast({
        title: action === "confirm" ? "Bulk approved" : "Bulk rejected",
        description: `${selectedIds.length} enrollment(s) updated.`,
      });
      setSelectedIds([]);
    } catch (err) {
      toast({
        title: "Bulk update failed",
        description: err instanceof Error ? err.message : "Admin permission required.",
        variant: "destructive",
      });
    }
  };

  const title = isAdmin ? "All Enrollments" : "Manage Enrollments";
  const subtitle = isAdmin
    ? "Review trainee submissions — approve, reject, assessment pipeline, or print the official TESDA form."
    : "Review and process trainee applications. Use the detail view for status changes and batch assignment.";

  return (
    <>
      <AnimatePresence>
        {printTarget && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <PrintModal enrollment={printTarget} onClose={() => setPrintTarget(null)} />
          </motion.div>
        )}
      </AnimatePresence>

      <BatchPickerDialog
        open={batchPickerOpen}
        onOpenChange={setBatchPickerOpen}
        mode={batchPickerMode}
        batches={batchPickerEnrollment ? openBatchesForEnrollment(batchPickerEnrollment) : []}
        traineeName={batchPickerEnrollment?.traineeName}
        courseTitle={
          batchPickerEnrollment?.courseSlug
            ? courseTitleBySlug(courses, batchPickerEnrollment.courseSlug)
            : undefined
        }
        loading={batchActionLoading}
        onConfirm={handleBatchPickerConfirm}
      />

      <EnrollmentDetailSheet
        enrollment={detailEnrollment}
        courses={courses}
        onClose={() => setDetailEnrollment(null)}
        onPrint={setPrintTarget}
        onStatusChange={handleStatusChange}
        onMarkNcSent={handleMarkNcSent}
        onBatchAction={openBatchPicker}
        statusUpdating={statusUpdating}
      />

      <motion.div
        className="space-y-6 h-full flex flex-col"
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">{title}</h1>
          <p className="text-muted-foreground mt-1 text-sm">{subtitle}</p>
        </div>

        {isAdmin && (
          <div className="flex flex-wrap gap-3">
            <StatPill label="Total" value={formalEnrollments.length} color="bg-muted border-border text-foreground/80" />
            <StatPill label="Pending" value={stats.pending} color="bg-amber-50 border-amber-200 text-amber-700" />
            <StatPill label="Assessment" value={stats.assessment} color="bg-blue-50 border-blue-200 text-blue-700" />
            <StatPill label="Confirmed" value={stats.confirmed} color="bg-emerald-50 border-emerald-200 text-emerald-700" />
            <StatPill label="Rejected" value={stats.rejected} color="bg-rose-50 border-rose-200 text-rose-700" />
          </div>
        )}

        <Card className="border-card-border shadow-sm flex-1 flex flex-col min-h-0 rounded-xl">
          <div className="p-4 border-b border-card-border flex flex-col sm:flex-row gap-3 bg-muted/20">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" aria-hidden />
              <Input
                id={`${mode}-enrollment-search`}
                aria-label="Search enrollments by name, email, or reference number"
                placeholder="Search by name, email, or Ref No..."
                className="pl-9 bg-card"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <div className="flex flex-col gap-2 w-full min-w-0 sm:flex-row sm:w-auto">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full min-w-0 sm:w-[160px] bg-card" aria-label="Filter by status">
                  {isAdmin ? (
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Filter className="h-3 w-3" aria-hidden />
                      <SelectValue placeholder="Status" />
                    </div>
                  ) : (
                    <SelectValue placeholder="Status" />
                  )}
                </SelectTrigger>
                <SelectContent>
                  {STAFF_ADMIN_STATUS_FILTER_OPTIONS.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={courseFilter} onValueChange={setCourseFilter}>
                <SelectTrigger className="w-full min-w-0 sm:w-[180px] bg-card" aria-label="Filter by course">
                  <SelectValue placeholder="Course" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All courses</SelectItem>
                  {courses.map((c) => (
                    <SelectItem key={c.slug} value={c.slug}>
                      {c.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {isAdmin && (
                <Select value={batchFilter} onValueChange={setBatchFilter}>
                  <SelectTrigger className="w-full min-w-0 sm:w-[200px] bg-card" aria-label="Filter by batch">
                    <SelectValue placeholder="Batch" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All batches</SelectItem>
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
              )}
            </div>
          </div>

          {isAdmin && selectedIds.length > 0 && (
            <div
              className="mx-4 mt-3 bg-primary/5 border border-primary/20 rounded-2xl p-3 flex items-center justify-between"
              role="region"
              aria-label="Bulk actions"
            >
              <span className="text-sm font-bold text-primary ml-2">{selectedIds.length} selected</span>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  className="text-rose-600 border-rose-200 hover:bg-rose-50"
                  onClick={() => void handleBulkAction("reject")}
                >
                  <XCircle className="w-3 h-3 mr-1" aria-hidden />
                  Reject
                </Button>
                <Button
                  size="sm"
                  className="bg-emerald-600 hover:bg-emerald-700 text-white"
                  onClick={() => void handleBulkAction("confirm")}
                >
                  <CheckCircle2 className="w-3 h-3 mr-1" aria-hidden />
                  Approve
                </Button>
              </div>
            </div>
          )}

          {isLoading ? (
            <TableSkeleton rows={10} columns={isAdmin ? 7 : 6} className="py-2" />
          ) : isError ? (
            <div className="p-8 text-center space-y-3" role="alert">
              <p className="text-sm text-destructive">
                {error instanceof Error ? error.message : "Failed to load enrollments"}
              </p>
              <Button variant="outline" size="sm" onClick={() => void refetch()}>
                Retry
              </Button>
            </div>
          ) : (
            <div className="flex-1 overflow-x-auto neat-scrollbar min-h-0">
              <Table className="min-w-[720px]">
                <TableHeader className="bg-muted/30 sticky top-0 z-10">
                  <TableRow>
                    {isAdmin && (
                      <TableHead className="w-12">
                        <Checkbox
                          checked={
                            selectedIds.length === filteredEnrollments.length &&
                            filteredEnrollments.length > 0
                          }
                          onCheckedChange={toggleSelectAll}
                          aria-label="Select all enrollments"
                        />
                      </TableHead>
                    )}
                    <TableHead className="font-semibold">Ref No</TableHead>
                    <TableHead className="font-semibold">Trainee</TableHead>
                    <TableHead className="font-semibold">Course</TableHead>
                    <TableHead className="font-semibold">Date</TableHead>
                    <TableHead className="font-semibold">Status</TableHead>
                    <TableHead className="text-right font-semibold">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredEnrollments.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={isAdmin ? 7 : 6} className="h-40 text-center text-muted-foreground">
                        <div className="flex flex-col items-center gap-2">
                          <Users className="w-8 h-8 opacity-30" aria-hidden />
                          <p>No enrollments match your filters.</p>
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredEnrollments.map((enrollment) => {
                      const course = courses.find((c) => c.slug === enrollment.courseSlug);
                      const quickActions = getEnrollmentStatusActions(enrollment.status).slice(0, 2);
                      return (
                        <TableRow key={enrollment.id} className="hover:bg-muted/20">
                          {isAdmin && (
                            <TableCell>
                              <Checkbox
                                checked={selectedIds.includes(enrollment.id)}
                                onCheckedChange={() => toggleSelect(enrollment.id)}
                                aria-label={`Select ${enrollment.traineeName}`}
                              />
                            </TableCell>
                          )}
                          <TableCell className="font-medium text-xs text-muted-foreground uppercase">
                            {enrollment.refNo}
                          </TableCell>
                          <TableCell>
                            <button
                              type="button"
                              className="text-left font-semibold hover:text-primary hover:underline"
                              onClick={() => setDetailEnrollment(enrollment)}
                            >
                              {enrollment.traineeName}
                            </button>
                            <div className="text-xs text-muted-foreground">{enrollment.traineeEmail}</div>
                          </TableCell>
                          <TableCell>
                            <div className="text-sm font-medium">{course?.title}</div>
                            {enrollment.batchCode && (
                              <div className="text-xs text-muted-foreground">Batch {enrollment.batchCode}</div>
                            )}
                          </TableCell>
                          <TableCell className="text-sm text-muted-foreground whitespace-nowrap">
                            {format(new Date(enrollment.createdAt), "MMM dd, yyyy")}
                          </TableCell>
                          <TableCell>
                            <StatusBadge status={enrollment.status} />
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex items-center justify-end gap-1">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setDetailEnrollment(enrollment)}
                              >
                                View
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8"
                                title="Print TESDA application form"
                                onClick={() => setPrintTarget(enrollment)}
                              >
                                <Printer className="h-4 w-4" />
                              </Button>
                              {quickActions.map((action) => (
                                <Button
                                  key={action.id}
                                  size="icon"
                                  variant="outline"
                                  className="h-8 w-8 hidden lg:inline-flex"
                                  title={action.label}
                                  onClick={() => void handleStatusChange(enrollment.id, action.status)}
                                >
                                  {action.variant === "destructive" ? (
                                    <X className="h-4 w-4 text-rose-600" />
                                  ) : (
                                    <Check className="h-4 w-4 text-emerald-600" />
                                  )}
                                </Button>
                              ))}
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" size="icon" className="h-8 w-8" aria-label="More actions">
                                    <MoreHorizontal className="h-4 w-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end" className="w-52 rounded-xl">
                                  <DropdownMenuItem onClick={() => setDetailEnrollment(enrollment)}>
                                    <Eye className="mr-2 h-4 w-4" />
                                    Open detail
                                  </DropdownMenuItem>
                                  <DropdownMenuItem onClick={() => setPrintTarget(enrollment)}>
                                    <Printer className="mr-2 h-4 w-4" />
                                    TESDA form
                                  </DropdownMenuItem>
                                  <DropdownMenuSeparator />
                                  {getEnrollmentStatusActions(enrollment.status).map((action) => (
                                    <DropdownMenuItem
                                      key={action.id}
                                      className={
                                        action.variant === "destructive" ? "text-rose-600" : undefined
                                      }
                                      onClick={() => void handleStatusChange(enrollment.id, action.status)}
                                    >
                                      {action.label}
                                    </DropdownMenuItem>
                                  ))}
                                  {enrollmentStatusIs(enrollment.status, "completed") &&
                                    !enrollment.tesdaNcSentAt && (
                                      <DropdownMenuItem
                                        onClick={() => void handleMarkNcSent(enrollment.id)}
                                      >
                                        <CheckCircle2 className="mr-2 h-4 w-4" />
                                        Mark TESDA NC sent
                                      </DropdownMenuItem>
                                    )}
                                  <DropdownMenuSeparator />
                                  {(enrollmentStatusIs(enrollment.status, "waitlisted", "pending") ||
                                    !enrollment.batchId) && (
                                    <DropdownMenuItem onClick={() => openBatchPicker(enrollment, "join")}>
                                      <Users className="mr-2 h-4 w-4" />
                                      Join batch
                                    </DropdownMenuItem>
                                  )}
                                  {enrollment.batchId && (
                                    <DropdownMenuItem onClick={() => openBatchPicker(enrollment, "transfer")}>
                                      <ChevronRight className="mr-2 h-4 w-4" />
                                      Transfer batch
                                    </DropdownMenuItem>
                                  )}
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
          )}

          {!isLoading && !isError && (
            <div className="p-3 border-t border-border text-xs text-muted-foreground bg-muted/30">
              Showing {filteredEnrollments.length} of {formalEnrollments.length} applications
            </div>
          )}
        </Card>
      </motion.div>
    </>
  );
}
