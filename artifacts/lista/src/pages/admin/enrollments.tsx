import { useState } from "react";
import { motion } from "framer-motion";
import { Search, Filter, Download, Check, X, MoreHorizontal } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import StatusBadge from "@/components/status-badge";
import { useToast } from "@/hooks/use-toast";
import { enrollments as initialEnrollments, courses } from "@/lib/mock-data";

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.1 }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { type: "spring" as const, stiffness: 300, damping: 24 } }
};

export default function AdminEnrollmentsPage() {
  const { toast } = useToast();
  const [enrollments, setEnrollments] = useState(initialEnrollments);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [courseFilter, setCourseFilter] = useState("all");

  const toggleSelectAll = () => {
    if (selectedIds.length === filteredEnrollments.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filteredEnrollments.map(e => e.id));
    }
  };

  const toggleSelect = (id: string) => {
    if (selectedIds.includes(id)) {
      setSelectedIds(selectedIds.filter(i => i !== id));
    } else {
      setSelectedIds([...selectedIds, id]);
    }
  };

  const handleBulkAction = (action: 'confirm' | 'reject') => {
    setEnrollments(prev => prev.map(e => {
      if (selectedIds.includes(e.id)) {
        return { ...e, status: action === 'confirm' ? 'confirmed' : 'rejected' };
      }
      return e;
    }));
    toast({
      title: `Enrollments ${action === 'confirm' ? 'Approved' : 'Rejected'}`,
      description: `${selectedIds.length} enrollments have been updated.`,
    });
    setSelectedIds([]);
  };

  const handleSingleAction = (id: string, action: 'confirmed' | 'rejected') => {
    setEnrollments(prev => prev.map(e => {
      if (e.id === id) {
        return { ...e, status: action };
      }
      return e;
    }));
    toast({
      title: "Status Updated",
      description: `Enrollment status changed to ${action}.`,
    });
  };

  const filteredEnrollments = enrollments.filter(e => {
    const matchesSearch = e.traineeName.toLowerCase().includes(search.toLowerCase()) || 
                          e.refNo.toLowerCase().includes(search.toLowerCase()) ||
                          e.traineeEmail.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === "all" || e.status === statusFilter;
    const matchesCourse = courseFilter === "all" || e.courseSlug === courseFilter;
    
    return matchesSearch && matchesStatus && matchesCourse;
  });

  return (
    <motion.div 
      className="space-y-6"
      variants={containerVariants}
      initial="hidden"
      animate="show"
    >
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">All Enrollments</h1>
          <p className="text-muted-foreground text-sm mt-1">Manage and process student applications.</p>
        </div>
        <Button variant="outline" className="gap-2 font-semibold">
          <Download className="h-4 w-4" />
          Export CSV
        </Button>
      </div>

      <motion.div variants={itemVariants}>
        <Card className="border-card-border shadow-sm">
          <CardContent className="p-4">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input 
                  placeholder="Search by name, email, or Ref No..." 
                  className="pl-9 bg-muted/30 border-card-border"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
              <div className="flex gap-2 w-full sm:w-auto">
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-full sm:w-[140px] bg-white">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Filter className="h-4 w-4" />
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
                  <SelectTrigger className="w-full sm:w-[200px] bg-white">
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
          </CardContent>
        </Card>
      </motion.div>

      {selectedIds.length > 0 && (
        <motion.div 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-primary/5 border border-primary/20 rounded-lg p-3 flex items-center justify-between"
        >
          <span className="text-sm font-medium text-primary ml-2">
            {selectedIds.length} enrollments selected
          </span>
          <div className="flex gap-2">
            <Button size="sm" variant="outline" onClick={() => handleBulkAction('reject')} className="text-destructive border-destructive/20 hover:bg-destructive/10">
              Reject Selected
            </Button>
            <Button size="sm" onClick={() => handleBulkAction('confirm')} className="bg-emerald-600 hover:bg-emerald-700 text-white">
              Approve Selected
            </Button>
          </div>
        </motion.div>
      )}

      <motion.div variants={itemVariants}>
        <Card className="border-card-border shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/30 hover:bg-muted/30">
                  <TableHead className="w-12">
                    <Checkbox 
                      checked={selectedIds.length === filteredEnrollments.length && filteredEnrollments.length > 0}
                      onCheckedChange={toggleSelectAll}
                    />
                  </TableHead>
                  <TableHead className="font-semibold text-muted-foreground whitespace-nowrap">Ref No</TableHead>
                  <TableHead className="font-semibold text-muted-foreground whitespace-nowrap">Trainee</TableHead>
                  <TableHead className="font-semibold text-muted-foreground whitespace-nowrap">Course</TableHead>
                  <TableHead className="font-semibold text-muted-foreground whitespace-nowrap">Date</TableHead>
                  <TableHead className="font-semibold text-muted-foreground whitespace-nowrap">Status</TableHead>
                  <TableHead className="w-12"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredEnrollments.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                      No enrollments found matching your filters.
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredEnrollments.map((enrollment) => {
                    const course = courses.find(c => c.slug === enrollment.courseSlug);
                    return (
                      <TableRow key={enrollment.id} className="group hover:bg-muted/30">
                        <TableCell>
                          <Checkbox 
                            checked={selectedIds.includes(enrollment.id)}
                            onCheckedChange={() => toggleSelect(enrollment.id)}
                          />
                        </TableCell>
                        <TableCell className="font-medium text-xs uppercase tracking-wider">{enrollment.refNo}</TableCell>
                        <TableCell>
                          <div>
                            <p className="font-semibold whitespace-nowrap">{enrollment.traineeName}</p>
                            <p className="text-xs text-muted-foreground">{enrollment.traineeEmail}</p>
                          </div>
                        </TableCell>
                        <TableCell className="text-sm font-medium whitespace-nowrap max-w-[200px] truncate" title={course?.title}>
                          {course?.title || enrollment.courseSlug}
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground whitespace-nowrap">
                          {new Date(enrollment.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                        </TableCell>
                        <TableCell>
                          <StatusBadge status={enrollment.status as any} />
                        </TableCell>
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-8 w-8 opacity-0 group-hover:opacity-100 focus:opacity-100 transition-opacity">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-[160px]">
                              <DropdownMenuItem 
                                className="text-emerald-600 font-medium cursor-pointer"
                                onClick={() => handleSingleAction(enrollment.id, 'confirmed')}
                                disabled={enrollment.status === 'confirmed'}
                              >
                                <Check className="mr-2 h-4 w-4" />
                                Approve
                              </DropdownMenuItem>
                              <DropdownMenuItem 
                                className="text-destructive font-medium cursor-pointer"
                                onClick={() => handleSingleAction(enrollment.id, 'rejected')}
                                disabled={enrollment.status === 'rejected'}
                              >
                                <X className="mr-2 h-4 w-4" />
                                Reject
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </div>
          
          <div className="p-4 border-t border-card-border flex items-center justify-between text-sm text-muted-foreground bg-muted/10">
            <div>
              Showing {filteredEnrollments.length > 0 ? 1 : 0} to {Math.min(10, filteredEnrollments.length)} of {filteredEnrollments.length} entries
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" disabled>Previous</Button>
              <Button variant="outline" size="sm" disabled={filteredEnrollments.length <= 10}>Next</Button>
            </div>
          </div>
        </Card>
      </motion.div>
    </motion.div>
  );
}
