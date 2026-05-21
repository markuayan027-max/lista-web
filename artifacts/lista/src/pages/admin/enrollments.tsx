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
import type { Enrollment } from "@/lib/institutional-data";
import PrintModal from "@/components/print-modal";
import { useAuth } from "@/context/auth-context";
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
import { TableSkeleton } from "@/components/skeletons";
import { enrollmentStatusIs } from "@/lib/enrollment-status";

// Ã¢â€â‚¬Ã¢â€â‚¬ Stats card Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬
function StatPill({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <motion.div className={`flex items-center gap-2 sm:gap-3 px-3 sm:px-5 py-2.5 sm:py-3 rounded-2xl border min-w-0 ${color}`}>
      <span className="text-xl sm:text-2xl font-black tabular-nums">{value}</span>
      <span className="text-[10px] sm:text-xs font-bold uppercase tracking-widest opacity-70">{label}</span>
    </motion.div>
  );
}

// Ã¢â€â‚¬Ã¢â€â‚¬ Main Page Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬
export default function AdminEnrollmentsPage() {
  const { user } = useAuth();
  const isAdmin = user?.role === "admin";
  const { toast } = useToast();
  const { data: enrollments = [], isLoading, isError, error } = useEnrollments();
  const { data: courses = [] } = useCourses();
  const { data: courseBatches = [] } = useCourseBatches();
  const updateStatus = useUpdateEnrollmentStatus();
  const bulkUpdate = useBulkUpdateEnrollmentStatus();
  const markNcSent = useMarkTesdaNcSent();
  const joinBatch = useJoinEnrollmentBatch();
  const transferBatch = useTransferEnrollmentBatch();
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [courseFilter, setCourseFilter] = useState("all");
  const [batchFilter, setBatchFilter] = useState("all");
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

  const handleBulkAction = async (action: "confirm" | "reject") => {
    const status = action === "confirm" ? "confirmed" : "rejected";
    try {
      await bulkUpdate.mutateAsync({ ids: selectedIds, status });
      toast({
        title: `Enrollments ${action === "confirm" ? "Approved" : "Rejected"}`,
        description: `${selectedIds.length} enrollments updated in InsForge.`,
      });
      setSelectedIds([]);
    } catch (err) {
      toast({
        title: "Update failed",
        description: err instanceof Error ? err.message : "Unknown error",
        variant: "destructive",
      });
    }
  };

  const handleMarkNcSent = async (id: string) => {
    try {
      await markNcSent.mutateAsync({ id });
      toast({ title: "TESDA NC marked sent", description: "Cycle closed for quick re-apply." });
    } catch (err) {
      toast({
        title: "Update failed",
        description: err instanceof Error ? err.message : "Unknown error",
        variant: "destructive",
      });
    }
  };

  const handleJoinBatch = async (enrollment: Enrollment) => {
    const batches = courseBatches.filter(
      (b) => b.courseSlug === enrollment.courseSlug && b.status === "open" && b.seatsTaken < b.capacity,
    );
    if (batches.length === 0) {
      toast({ title: "No open batch", variant: "destructive" });
      return;
    }
    const batchId = window.prompt(
      `Batch ID:\n${batches.map((b) => `${b.batchCode} → ${b.id}`).join("\n")}`,
      batches[0]?.id,
    );
    if (!batchId?.trim()) return;
    try {
      await joinBatch.mutateAsync({ enrollmentId: enrollment.id, batchId: batchId.trim() });
      toast({ title: "Joined batch" });
    } catch (err) {
      toast({
        title: "Join failed",
        description: err instanceof Error ? err.message : "Unknown error",
        variant: "destructive",
      });
    }
  };

  const handleTransferBatch = async (enrollment: Enrollment) => {
    const batchId = window.prompt("Target batch ID:");
    if (!batchId?.trim()) return;
    try {
      await transferBatch.mutateAsync({ enrollmentId: enrollment.id, batchId: batchId.trim() });
      toast({ title: "Transferred" });
    } catch (err) {
      toast({
        title: "Transfer failed",
        description: err instanceof Error ? err.message : "Unknown error",
        variant: "destructive",
      });
    }
  };

  const handleSingleAction = async (id: string, action: "confirmed" | "rejected") => {
    try {
      await updateStatus.mutateAsync({ id, status: action });
      toast({
        title: "Status Updated",
        description: `Enrollment status changed to ${action}.`,
      });
    } catch (err) {
      toast({
        title: "Update failed",
        description: err instanceof Error ? err.message : "Unknown error",
        variant: "destructive",
      });
    }
  };

  // Stat counts - excluding 'ready_to_apply' from total and formal counts
  const formalEnrollments = enrollments.filter(
    (e) => !enrollmentStatusIs(e.status, "ready_to_apply"),
  );
  const pending = formalEnrollments.filter((e) => enrollmentStatusIs(e.status, "pending")).length;
  const confirmed = formalEnrollments.filter((e) =>
    enrollmentStatusIs(e.status, "confirmed", "enrolled"),
  ).length;
  const rejected = formalEnrollments.filter((e) => enrollmentStatusIs(e.status, "rejected")).length;

  const filteredEnrollments = formalEnrollments.filter(e => {
    const matchesSearch =
      e.traineeName.toLowerCase().includes(search.toLowerCase()) ||
      e.refNo.toLowerCase().includes(search.toLowerCase()) ||
      e.traineeEmail.toLowerCase().includes(search.toLowerCase());
    const matchesStatus =
      statusFilter === "all" || enrollmentStatusIs(e.status, statusFilter);
    const matchesCourse = courseFilter === "all" || e.courseSlug === courseFilter;
    const matchesBatch =
      batchFilter === "all" ||
      (batchFilter === "unbatched"
        ? !e.batchCode
        : String(e.batchCode || "") === batchFilter);
    return matchesSearch && matchesStatus && matchesCourse && matchesBatch;
  });

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
            <h1 className="text-2xl font-black tracking-tight text-foreground">All Enrollments</h1>
            <p className="text-muted-foreground text-sm mt-1">
              Review trainee submissions — approve, reject, or print the official TESDA application form.
            </p>
          </div>
        </div>

        {/* Stat pills */}
        <div className="flex flex-wrap gap-3">
          <StatPill label="Total" value={formalEnrollments.length} color="bg-muted border-border text-foreground/80" />
          <StatPill label="Pending" value={pending} color="bg-amber-50 border-amber-200 text-amber-700" />
          <StatPill label="Confirmed" value={confirmed} color="bg-emerald-50 border-emerald-200 text-emerald-700" />
          <StatPill label="Rejected" value={rejected} color="bg-rose-50 border-rose-200 text-rose-700" />
        </div>

        {/* Search + Filters */}
        <Card className="border-border shadow-sm rounded-2xl">
          <CardContent className="p-4">
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by name, email, or Ref No..."
                  className="pl-9 bg-muted border-border rounded-xl"
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                />
              </div>
              <div className="flex flex-col gap-2 min-w-0 w-full sm:flex-row sm:w-auto">
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-full min-w-0 sm:w-[140px] bg-card rounded-xl border-border">
                    <div className="flex items-center gap-2 text-muted-foreground">
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
                  <SelectTrigger className="w-full min-w-0 sm:w-[200px] bg-card rounded-xl border-border">
                    <SelectValue placeholder="All Courses" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Courses</SelectItem>
                    {courses.map(c => (
                      <SelectItem key={c.slug} value={c.slug}>{c.title}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select value={batchFilter} onValueChange={setBatchFilter}>
                  <SelectTrigger className="w-full min-w-0 sm:w-[220px] bg-card rounded-xl border-border">
                    <SelectValue placeholder="All Batches" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Batches</SelectItem>
                    <SelectItem value="unbatched">Unassigned</SelectItem>
                    {Array.from(
                      new Map(courseBatches.map((b) => [b.batchCode, b])).values(),
                    )
                      .filter((b) => b.batchCode)
                      .map((b) => (
                        <SelectItem key={b.id} value={b.batchCode}>
                          {b.batchCode} — {b.batchName}
                        </SelectItem>
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
                  className="bg-emerald-600 hover:bg-emerald-700 text-primary-foreground rounded-xl font-bold">
                  <CheckCircle2 className="w-3 h-3 mr-1" /> Approve
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Table */}
        <Card className="border-border shadow-sm overflow-hidden rounded-2xl">
          {isLoading ? (
            <TableSkeleton rows={10} columns={7} className="py-2" />
          ) : isError ? (
            <motion.div className="p-8 text-center text-destructive text-sm">
              {error instanceof Error ? error.message : "Failed to load enrollments"}
            </motion.div>
          ) : (
          <>
          <div className="overflow-x-auto hide-scrollbar">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/80 hover:bg-muted/80 border-b border-border">
                  <TableHead className="w-12">
                    <Checkbox
                      checked={selectedIds.length === filteredEnrollments.length && filteredEnrollments.length > 0}
                      onCheckedChange={toggleSelectAll}
                    />
                  </TableHead>
                  <TableHead className="font-black text-[10px] uppercase tracking-widest text-muted-foreground">Ref No</TableHead>
                  <TableHead className="font-black text-[10px] uppercase tracking-widest text-muted-foreground">Trainee</TableHead>
                  <TableHead className="font-black text-[10px] uppercase tracking-widest text-muted-foreground">Course</TableHead>
                  <TableHead className="font-black text-[10px] uppercase tracking-widest text-muted-foreground">Date Applied</TableHead>
                  <TableHead className="font-black text-[10px] uppercase tracking-widest text-muted-foreground">Status</TableHead>
                  <TableHead className="w-32 font-black text-[10px] uppercase tracking-widest text-muted-foreground">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredEnrollments.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-16 text-muted-foreground">
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
                      <TableRow key={enrollment.id} className="group hover:bg-muted/60 border-b border-border/50 transition-colors">
                        <TableCell>
                          <Checkbox
                            checked={selectedIds.includes(enrollment.id)}
                            onCheckedChange={() => toggleSelect(enrollment.id)}
                          />
                        </TableCell>
                        <TableCell className="font-mono text-xs font-bold text-muted-foreground uppercase tracking-wider">
                          {enrollment.refNo}
                        </TableCell>
                        <TableCell>
                          <div>
                            <p className="font-bold text-foreground whitespace-nowrap">{enrollment.traineeName}</p>
                            <p className="text-xs text-muted-foreground">{enrollment.traineeEmail}</p>
                          </div>
                        </TableCell>
                        <TableCell className="text-sm font-medium max-w-[180px] truncate text-muted-foreground" title={course?.title}>
                          {course?.title || enrollment.courseSlug}
                        </TableCell>
                        <TableCell className="text-xs text-muted-foreground whitespace-nowrap">
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
                              className="h-8 w-8 p-0 rounded-lg hover:bg-primary/10 hover:text-primary text-muted-foreground"
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
                                  className="h-8 w-8 p-0 rounded-lg text-muted-foreground hover:text-foreground/90"
                                >
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end" className="w-[180px] rounded-xl">
                                <DropdownMenuItem
                                  className="text-muted-foreground font-medium cursor-pointer rounded-lg"
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
                                {enrollmentStatusIs(enrollment.status, "completed") && !enrollment.tesdaNcSentAt && (
                                  <DropdownMenuItem
                                    className="cursor-pointer rounded-lg"
                                    onClick={() => handleMarkNcSent(enrollment.id)}
                                  >
                                    <CheckCircle2 className="mr-2 h-4 w-4" /> Mark TESDA NC sent
                                  </DropdownMenuItem>
                                )}
                                {(enrollmentStatusIs(enrollment.status, "waitlisted", "pending") ||
                                  !enrollment.batchId) && (
                                  <DropdownMenuItem
                                    className="cursor-pointer rounded-lg"
                                    onClick={() => handleJoinBatch(enrollment)}
                                  >
                                    <Users className="mr-2 h-4 w-4" /> Join batch
                                  </DropdownMenuItem>
                                )}
                                {enrollment.batchId && (
                                  <DropdownMenuItem
                                    className="cursor-pointer rounded-lg"
                                    onClick={() => handleTransferBatch(enrollment)}
                                  >
                                    <ChevronRight className="mr-2 h-4 w-4" /> Transfer batch
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

          <div className="p-4 border-t border-border flex items-center justify-between text-xs text-muted-foreground bg-muted/50">
            <span>
              Showing {filteredEnrollments.length} of {enrollments.length} enrollments
            </span>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" disabled className="rounded-lg text-xs">Previous</Button>
              <Button variant="outline" size="sm" disabled={filteredEnrollments.length <= 10} className="rounded-lg text-xs">Next</Button>
            </div>
          </div>
          </>
          )}
        </Card>
      </motion.div>
    </>
  );
}
