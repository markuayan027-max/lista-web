import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Download, 
  Search, 
  Filter, 
  MoreHorizontal, 
  Check, 
  X,
  FileText,
  FileSpreadsheet,
  Printer
} from "lucide-react";
import { exportSingleTraineeToExcel, exportSingleTraineeToWord } from "@/lib/export-utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { useToast } from "@/hooks/use-toast";
import type { Enrollment } from "@/lib/institutional-data";
import PrintModal from "@/components/print-modal";
import StatusBadge from "@/components/status-badge";
import { useCourses, useEnrollments, useUpdateEnrollmentStatus } from "@/hooks/use-lista-data";
import { format } from "date-fns";
import { enrollmentStatusIs } from "@/lib/enrollment-status";

export default function StaffEnrollmentsPage() {
  const { toast } = useToast();
  const { data: enrollments = [], isLoading } = useEnrollments();
  const { data: courses = [] } = useCourses();
  const updateStatus = useUpdateEnrollmentStatus();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [courseFilter, setCourseFilter] = useState("all");
  const [selectedEnrollment, setSelectedEnrollment] = useState<any>(null);
  const [printTarget, setPrintTarget] = useState<Enrollment | null>(null);

  const filteredEnrollments = enrollments.filter(e => {
    if (enrollmentStatusIs(e.status, "ready_to_apply")) return false;

    const matchesSearch = e.traineeName.toLowerCase().includes(search.toLowerCase()) || 
                          e.refNo.toLowerCase().includes(search.toLowerCase()) ||
                          e.traineeEmail.toLowerCase().includes(search.toLowerCase());
    const matchesStatus =
      statusFilter === "all" || enrollmentStatusIs(e.status, statusFilter);
    const matchesCourse = courseFilter === "all" || e.courseSlug === courseFilter;
    return matchesSearch && matchesStatus && matchesCourse;
  });

  const handleAction = async (id: string, action: 'confirmed' | 'rejected') => {
    try {
      await updateStatus.mutateAsync({ id, status: action });
      toast({
        title: "Enrollment Updated",
        description: `Enrollment status changed to ${action}.`,
      });
      if (selectedEnrollment?.id === id) {
        setSelectedEnrollment({ ...selectedEnrollment, status: action });
      }
    } catch (err) {
      toast({
        title: "Update failed",
        description: err instanceof Error ? err.message : "Unknown error",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-6 h-full flex flex-col">
      <AnimatePresence>
        {printTarget && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <PrintModal enrollment={printTarget} onClose={() => setPrintTarget(null)} />
          </motion.div>
        )}
      </AnimatePresence>
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row sm:items-center justify-between gap-4"
      >
        <div className="min-w-0">
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Manage Enrollments</h1>
          <p className="text-muted-foreground mt-1 text-sm sm:text-base">Review and process trainee applications. Staff do not submit TESDA forms on this page.</p>
        </div>
        <Button variant="outline" className="shrink-0 bg-card w-full sm:w-auto touch-target">
          <Download className="mr-2 h-4 w-4" /> Export CSV
        </Button>
      </motion.div>

      <Card className="border-card-border shadow-sm flex-1 flex flex-col min-h-0">
        <div className="p-4 border-b border-card-border flex flex-col sm:flex-row gap-4 items-center bg-muted/20">
          <div className="relative flex-1 w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input 
              placeholder="Search by name, email, or Ref No..." 
              className="pl-9 bg-card"
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
          <div className="flex flex-col gap-2 w-full min-w-0 sm:flex-row sm:w-auto">
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full min-w-0 sm:w-[140px] bg-card">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="confirmed">Confirmed</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
              </SelectContent>
            </Select>
            <Select value={courseFilter} onValueChange={setCourseFilter}>
              <SelectTrigger className="w-full min-w-0 sm:w-[180px] bg-card">
                <SelectValue placeholder="Course" />
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

        <div className="flex-1 overflow-x-auto neat-scrollbar min-h-0">
          <Table className="min-w-[720px]">
            <TableHeader className="bg-muted/30 sticky top-0 z-10 backdrop-blur-sm">
              <TableRow>
                <TableHead className="w-[120px] font-semibold">Ref No</TableHead>
                <TableHead className="font-semibold">Trainee</TableHead>
                <TableHead className="font-semibold">Course</TableHead>
                <TableHead className="font-semibold">Date</TableHead>
                <TableHead className="font-semibold">Status</TableHead>
                <TableHead className="text-right font-semibold">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredEnrollments.length > 0 ? filteredEnrollments.map((enrollment) => {
                const course = courses.find(c => c.slug === enrollment.courseSlug);
                return (
                  <TableRow key={enrollment.id} className="hover:bg-muted/20">
                    <TableCell className="font-medium text-xs text-muted-foreground uppercase">{enrollment.refNo}</TableCell>
                    <TableCell>
                      <div className="font-semibold">{enrollment.traineeName}</div>
                      <div className="text-xs text-muted-foreground">{enrollment.traineeEmail}</div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm font-medium">{course?.title}</div>
                      <div className="text-xs text-muted-foreground">{course?.category}</div>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {format(new Date(enrollment.createdAt), "MMM dd, yyyy")}
                    </TableCell>
                    <TableCell>
                      <StatusBadge status={enrollment.status as any} />
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button variant="ghost" size="sm" onClick={() => setSelectedEnrollment(enrollment)}>
                          View
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-8 w-8 text-emerald-600" 
                          onClick={() => exportSingleTraineeToExcel(enrollment)}
                          title="Download Excel"
                        >
                          <FileSpreadsheet className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-blue-600"
                          onClick={() => setPrintTarget(enrollment)}
                          title="Print TESDA Application Form (A4 / Long)"
                        >
                          <Printer className="h-4 w-4" />
                        </Button>
                        {enrollment.status === 'pending' && (
                          <>
                            <Button size="icon" variant="outline" className="h-8 w-8 text-emerald-600 border-emerald-200 hover:bg-emerald-50" onClick={() => handleAction(enrollment.id, 'confirmed')}>
                              <Check className="h-4 w-4" />
                            </Button>
                            <Button size="icon" variant="outline" className="h-8 w-8 text-rose-600 border-rose-200 hover:bg-rose-50" onClick={() => handleAction(enrollment.id, 'rejected')}>
                              <X className="h-4 w-4" />
                            </Button>
                          </>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                );
              }) : (
                <TableRow>
                  <TableCell colSpan={6} className="h-40 text-center text-muted-foreground">
                    No enrollments found matching your filters.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </Card>

      {/* Detail Sheet */}
      <Sheet open={!!selectedEnrollment} onOpenChange={(open) => !open && setSelectedEnrollment(null)}>
        <SheetContent className="w-full sm:max-w-md overflow-y-auto">
          {selectedEnrollment && (
            <div className="space-y-6 py-6">
              <SheetHeader>
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-xs font-bold text-muted-foreground uppercase">{selectedEnrollment.refNo}</span>
                  <StatusBadge status={selectedEnrollment.status as any} />
                </div>
                <SheetTitle className="text-2xl">{selectedEnrollment.traineeName}</SheetTitle>
                <SheetDescription>{selectedEnrollment.traineeEmail}</SheetDescription>
              </SheetHeader>

              <div className="space-y-6">
                <div className="bg-muted/30 rounded-xl p-4 border border-card-border">
                  <h4 className="text-sm font-semibold mb-3 text-muted-foreground uppercase tracking-wider">Course Details</h4>
                  <p className="font-bold text-lg leading-tight mb-1">
                    {courses.find(c => c.slug === selectedEnrollment.courseSlug)?.title}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Applied on {format(new Date(selectedEnrollment.createdAt), "MMMM dd, yyyy")}
                  </p>
                </div>

                <div>
                  <h4 className="text-sm font-semibold mb-3 text-muted-foreground uppercase tracking-wider">Submitted Documents</h4>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between p-3 rounded-lg border border-card-border bg-card">
                      <div className="flex items-center gap-3">
                        <FileText className="h-5 w-5 text-primary" />
                        <span className="text-sm font-medium">Resume.pdf</span>
                      </div>
                      <Button variant="ghost" size="sm" className="h-8">View</Button>
                    </div>
                    <div className="flex items-center justify-between p-3 rounded-lg border border-card-border bg-card">
                      <div className="flex items-center gap-3">
                        <FileText className="h-5 w-5 text-primary" />
                        <span className="text-sm font-medium">ID_Copy.jpg</span>
                      </div>
                      <Button variant="ghost" size="sm" className="h-8">View</Button>
                    </div>
                  </div>
                </div>

                <div className="pt-2 flex flex-col gap-2">
                  <Button
                    variant="outline"
                    className="w-full gap-2 border-primary/30 text-primary hover:bg-primary/5"
                    onClick={() => setPrintTarget(selectedEnrollment)}
                  >
                    <Printer className="h-4 w-4" /> TESDA Form (Print / PDF)
                  </Button>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      className="flex-1 gap-2 border-emerald-200 text-emerald-700 hover:bg-emerald-50"
                      onClick={() => exportSingleTraineeToExcel(selectedEnrollment)}
                    >
                      <FileSpreadsheet className="h-4 w-4" /> Excel
                    </Button>
                    <Button
                      variant="outline"
                      className="flex-1 gap-2 border-primary-indigo/30 text-primary-indigo hover:bg-primary-indigo/10"
                      onClick={() => exportSingleTraineeToWord(selectedEnrollment)}
                    >
                      <FileText className="h-4 w-4" /> Word
                    </Button>
                  </div>
                </div>

                {selectedEnrollment.status === 'pending' && (
                  <div className="pt-4 border-t border-card-border flex gap-3">
                    <Button 
                      variant="outline" 
                      className="flex-1 border-rose-200 text-rose-600 hover:bg-rose-50"
                      onClick={() => handleAction(selectedEnrollment.id, 'rejected')}
                    >
                      Reject Application
                    </Button>
                    <Button 
                      className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white"
                      onClick={() => handleAction(selectedEnrollment.id, 'confirmed')}
                    >
                      Approve Application
                    </Button>
                  </div>
                )}
              </div>
            </div>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}

// Temporary workaround since TableBody isn't exported directly in the provided mock snippet, assuming it's called Body or similar.
// Fixing table body import based on standard shadcn table
const Card = ({ className, children, ...props }: any) => <div className={`bg-card text-card-foreground rounded-xl border ${className}`} {...props}>{children}</div>;
