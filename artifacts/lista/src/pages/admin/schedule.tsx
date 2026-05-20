import { useState } from "react";
import { motion } from "framer-motion";
import { Plus, Calendar as CalendarIcon, Clock, MapPin, User, ChevronLeft, ChevronRight, Settings2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import PrimaryButton from "@/components/primary-button";
import FormInputField from "@/components/form-input-field";
import { useCourseBatches, useCourses, useCreateCourseBatch, useCreateSchedule, useSchedules, useUpdateCourseBatchStatus } from "@/hooks/use-lista-data";
import { format, addDays, startOfWeek } from "date-fns";

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

export default function AdminSchedulePage() {
  const { toast } = useToast();
  const { data: schedules = [] } = useSchedules();
  const { data: courseBatches = [] } = useCourseBatches();
  const { data: courseList = [] } = useCourses();
  const createSchedule = useCreateSchedule();
  const createCourseBatch = useCreateCourseBatch();
  const updateBatchStatus = useUpdateCourseBatchStatus();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isPeriodsDialogOpen, setIsPeriodsDialogOpen] = useState(false);
  const [isBatchDialogOpen, setIsBatchDialogOpen] = useState(false);
  const [view, setView] = useState("week"); // week is functional
  
  const [currentDate, setCurrentDate] = useState(new Date());
  
  // Current week start
  const weekStart = startOfWeek(currentDate, { weekStartsOn: 1 });
  const weekDays = Array.from({ length: 5 }).map((_, i) => addDays(weekStart, i));

  const nextWeek = () => setCurrentDate(addDays(currentDate, 7));
  const prevWeek = () => setCurrentDate(addDays(currentDate, -7));

  const [form, setForm] = useState({
    courseSlug: "",
    date: format(new Date(), "yyyy-MM-dd"),
    startTime: "09:00",
    endTime: "12:00",
    trainer: "",
    room: ""
  });

  const [periodForm, setPeriodForm] = useState({
    courseSlug: "",
    startDate: "",
    endDate: ""
  });

  const [batchForm, setBatchForm] = useState({
    courseSlug: "",
    batchCode: "",
    batchName: "",
    capacity: 25,
    startDate: format(new Date(), "yyyy-MM-dd"),
    endDate: format(addDays(new Date(), 30), "yyyy-MM-dd"),
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.courseSlug || !form.trainer || !form.room) {
      toast({ title: "Validation Error", description: "All fields are required.", variant: "destructive" });
      return;
    }

    try {
      await createSchedule.mutateAsync({ ...form });
      setIsDialogOpen(false);
      toast({ title: "Session Scheduled", description: "The new session has been added to the calendar." });
    } catch (err) {
      toast({
        title: "Schedule failed",
        description: err instanceof Error ? err.message : "Could not create session.",
        variant: "destructive",
      });
    }
  };

  const handlePeriodUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!periodForm.courseSlug || !periodForm.startDate || !periodForm.endDate) {
      toast({ title: "Validation Error", description: "All fields are required.", variant: "destructive" });
      return;
    }

    setIsPeriodsDialogOpen(false);
    toast({
      title: "Course period noted",
      description: `Period dates saved locally for ${courseList.find((c) => c.slug === periodForm.courseSlug)?.title ?? periodForm.courseSlug}. Course date fields are not yet stored in InsForge.`,
    });
  };

  const handleCreateBatch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!batchForm.courseSlug || !batchForm.batchCode || !batchForm.batchName) {
      toast({ title: "Validation Error", description: "Course, batch code, and batch name are required.", variant: "destructive" });
      return;
    }
    if (batchForm.capacity < 1) {
      toast({ title: "Validation Error", description: "Capacity must be at least 1.", variant: "destructive" });
      return;
    }
    try {
      await createCourseBatch.mutateAsync({
        courseSlug: batchForm.courseSlug,
        batchCode: batchForm.batchCode.trim(),
        batchName: batchForm.batchName.trim(),
        capacity: Number(batchForm.capacity),
        startDate: batchForm.startDate,
        endDate: batchForm.endDate,
      });
      setIsBatchDialogOpen(false);
      setBatchForm({
        courseSlug: "",
        batchCode: "",
        batchName: "",
        capacity: 25,
        startDate: format(new Date(), "yyyy-MM-dd"),
        endDate: format(addDays(new Date(), 30), "yyyy-MM-dd"),
      });
      toast({ title: "Batch created", description: "The course batch is ready for enrollment assignment." });
    } catch (err) {
      toast({
        title: "Create batch failed",
        description: err instanceof Error ? err.message : "Could not create batch.",
        variant: "destructive",
      });
    }
  };

  const handleToggleBatch = async (id: string, next: "open" | "closed") => {
    try {
      await updateBatchStatus.mutateAsync({ id, status: next });
      toast({ title: "Batch updated", description: `Batch is now ${next}.` });
    } catch (err) {
      toast({
        title: "Batch update failed",
        description: err instanceof Error ? err.message : "Could not update batch.",
        variant: "destructive",
      });
    }
  };

  const getCourseColor = (slug: string) => {
    const colors = [
      "bg-primary-electric/15 text-primary-electric border-primary-electric/30",
      "bg-emerald-100 text-emerald-800 border-emerald-200",
      "bg-primary-indigo/15 text-primary-indigo border-primary-indigo/30",
      "bg-rose-100 text-rose-800 border-rose-200",
      "bg-amber-100 text-amber-800 border-amber-200",
      "bg-purple-100 text-purple-800 border-purple-200",
    ];
    const index = slug.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0);
    return colors[index % colors.length];
  };

  return (
    <motion.div 
      className="space-y-6"
      variants={containerVariants}
      initial="hidden"
      animate="show"
    >
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Master Schedule</h1>
          <p className="text-muted-foreground text-sm mt-1">Manage classes and resource allocation.</p>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="flex bg-muted/50 p-1 rounded-lg border border-card-border">
            <Button 
              variant={view === "week" ? "secondary" : "ghost"} 
              size="sm" 
              className={`text-xs px-4 h-7 ${view === "week" ? "bg-card shadow-sm" : ""}`}
              onClick={() => setView("week")}
            >
              Week
            </Button>
            <Button 
              variant={view === "month" ? "secondary" : "ghost"} 
              size="sm" 
              className={`text-xs px-4 h-7 ${view === "month" ? "bg-card shadow-sm" : ""}`}
              onClick={() => setView("month")}
            >
              Month
            </Button>
          </div>

          <Dialog open={isPeriodsDialogOpen} onOpenChange={setIsPeriodsDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" className="gap-2 h-10">
                <Settings2 className="h-4 w-4" />
                Course Periods
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[450px]">
              <form onSubmit={handlePeriodUpdate}>
                <DialogHeader>
                  <DialogTitle>Set Course Duration</DialogTitle>
                  <DialogDescription>Define when a specific course batch starts and stops.</DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid gap-1.5">
                    <label className="text-sm font-semibold tracking-tight">Course</label>
                    <Select 
                      value={periodForm.courseSlug} 
                      onValueChange={(val) => {
                        const course = courseList.find(c => c.slug === val);
                        setPeriodForm({
                          courseSlug: val,
                          startDate: course?.startDate || "",
                          endDate: course?.endDate || ""
                        });
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select course" />
                      </SelectTrigger>
                      <SelectContent>
                        {courseList.map(c => (
                          <SelectItem key={c.slug} value={c.slug}>{c.title}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <FormInputField
                      label="Start Date"
                      type="date"
                      value={periodForm.startDate}
                      onChange={(e) => setPeriodForm({...periodForm, startDate: e.target.value})}
                      required
                    />
                    <FormInputField
                      label="End Date"
                      type="date"
                      value={periodForm.endDate}
                      onChange={(e) => setPeriodForm({...periodForm, endDate: e.target.value})}
                      required
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button type="button" variant="outline" onClick={() => setIsPeriodsDialogOpen(false)}>Cancel</Button>
                  <PrimaryButton type="submit">Update Period</PrimaryButton>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
          
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <PrimaryButton className="gap-2 h-10">
                <Plus className="h-4 w-4" />
                New Session
              </PrimaryButton>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[450px]">
              <form onSubmit={handleSubmit}>
                <DialogHeader>
                  <DialogTitle>Schedule Session</DialogTitle>
                  <DialogDescription>Add a new class session to the master calendar.</DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid gap-1.5">
                    <label className="text-sm font-semibold tracking-tight">Course</label>
                    <Select value={form.courseSlug} onValueChange={(val) => setForm({...form, courseSlug: val})}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select course" />
                      </SelectTrigger>
                      <SelectContent>
                        {courseList.map(c => (
                          <SelectItem key={c.slug} value={c.slug}>{c.title}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <FormInputField
                      label="Date"
                      type="date"
                      value={form.date}
                      onChange={(e) => setForm({...form, date: e.target.value})}
                      required
                    />
                    <FormInputField
                      label="Room"
                      value={form.room}
                      onChange={(e) => setForm({...form, room: e.target.value})}
                      placeholder="e.g. Lab 1"
                      required
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <FormInputField
                      label="Start Time"
                      type="time"
                      value={form.startTime}
                      onChange={(e) => setForm({...form, startTime: e.target.value})}
                      required
                    />
                    <FormInputField
                      label="End Time"
                      type="time"
                      value={form.endTime}
                      onChange={(e) => setForm({...form, endTime: e.target.value})}
                      required
                    />
                  </div>

                  <FormInputField
                    label="Instructor"
                    value={form.trainer}
                    onChange={(e) => setForm({...form, trainer: e.target.value})}
                    placeholder="Instructor name"
                    required
                  />
                </div>
                <DialogFooter>
                  <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
                  <PrimaryButton type="submit">Schedule</PrimaryButton>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>

          <Dialog open={isBatchDialogOpen} onOpenChange={setIsBatchDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" className="gap-2 h-10">
                <Plus className="h-4 w-4" />
                Create Batch
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[520px]">
              <form onSubmit={handleCreateBatch}>
                <DialogHeader>
                  <DialogTitle>Create course batch</DialogTitle>
                  <DialogDescription>
                    Define the batch code/name, capacity, and date range for one course.
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid gap-1.5">
                    <label className="text-sm font-semibold tracking-tight">Course</label>
                    <Select
                      value={batchForm.courseSlug}
                      onValueChange={(val) => setBatchForm((prev) => ({ ...prev, courseSlug: val }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select course" />
                      </SelectTrigger>
                      <SelectContent>
                        {courseList.map((c) => (
                          <SelectItem key={c.slug} value={c.slug}>{c.title}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <FormInputField
                      label="Batch Code"
                      value={batchForm.batchCode}
                      onChange={(e) => setBatchForm({ ...batchForm, batchCode: e.target.value })}
                      placeholder="e.g. CK2-2026-A"
                      required
                    />
                    <FormInputField
                      label="Batch Name"
                      value={batchForm.batchName}
                      onChange={(e) => setBatchForm({ ...batchForm, batchName: e.target.value })}
                      placeholder="e.g. Cookery May 2026"
                      required
                    />
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    <FormInputField
                      label="Capacity"
                      type="number"
                      value={String(batchForm.capacity)}
                      onChange={(e) => setBatchForm({ ...batchForm, capacity: Number(e.target.value || 0) })}
                      min="1"
                      max="500"
                      required
                    />
                    <FormInputField
                      label="Start Date"
                      type="date"
                      value={batchForm.startDate}
                      onChange={(e) => setBatchForm({ ...batchForm, startDate: e.target.value })}
                      required
                    />
                    <FormInputField
                      label="End Date"
                      type="date"
                      value={batchForm.endDate}
                      onChange={(e) => setBatchForm({ ...batchForm, endDate: e.target.value })}
                      required
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button type="button" variant="outline" onClick={() => setIsBatchDialogOpen(false)}>Cancel</Button>
                  <PrimaryButton type="submit">Create Batch</PrimaryButton>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <motion.div variants={itemVariants}>
        <Card className="border-card-border shadow-sm">
          <CardHeader className="py-4 border-b border-card-border">
            <CardTitle className="text-base font-bold">Active course batches</CardTitle>
          </CardHeader>
          <CardContent className="p-4">
            {courseBatches.length === 0 ? (
              <p className="text-sm text-muted-foreground">No batches created yet.</p>
            ) : (
              <div className="overflow-x-auto hide-scrollbar">
                <table className="min-w-[760px] w-full text-sm">
                  <thead>
                    <tr className="text-left border-b border-card-border text-muted-foreground">
                      <th className="py-2 pr-3 font-semibold">Batch</th>
                      <th className="py-2 pr-3 font-semibold">Course</th>
                      <th className="py-2 pr-3 font-semibold">Seats</th>
                      <th className="py-2 pr-3 font-semibold">Period</th>
                      <th className="py-2 pr-3 font-semibold">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {courseBatches.map((batch) => {
                      const course = courseList.find((c) => c.slug === batch.courseSlug);
                      const isOpen = batch.status === "open";
                      return (
                        <tr key={batch.id} className="border-b border-card-border/50">
                          <td className="py-2 pr-3">
                            <p className="font-semibold">{batch.batchName}</p>
                            <p className="text-xs text-muted-foreground">{batch.batchCode}</p>
                          </td>
                          <td className="py-2 pr-3">{course?.title ?? batch.courseSlug}</td>
                          <td className="py-2 pr-3">{batch.seatsTaken} / {batch.capacity}</td>
                          <td className="py-2 pr-3">
                            {format(new Date(batch.startDate), "MMM d, yyyy")} - {format(new Date(batch.endDate), "MMM d, yyyy")}
                          </td>
                          <td className="py-2 pr-3">
                            <div className="flex items-center gap-2">
                              <span className="inline-flex rounded-full border px-2 py-0.5 text-xs font-semibold capitalize">
                                {batch.status}
                              </span>
                              {batch.status !== "archived" && (
                                <Button
                                  type="button"
                                  size="sm"
                                  variant="outline"
                                  className="h-7 px-2 text-xs"
                                  disabled={updateBatchStatus.isPending}
                                  onClick={() => handleToggleBatch(batch.id, isOpen ? "closed" : "open")}
                                >
                                  {isOpen ? "Close" : "Reopen"}
                                </Button>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>

      <motion.div variants={itemVariants}>
        <Card className="border-card-border shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between py-4 border-b border-card-border">
            <div className="flex items-center gap-4">
              <Button variant="outline" size="icon" className="h-8 w-8" onClick={prevWeek}>
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <h2 className="text-sm font-bold">{format(weekStart, "MMM dd")} - {format(addDays(weekStart, 4), "MMM dd, yyyy")}</h2>
              <Button variant="outline" size="icon" className="h-8 w-8" onClick={nextWeek}>
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="grid grid-cols-5 min-w-[800px] overflow-x-auto hide-scrollbar divide-x divide-card-border">
              {weekDays.map((day, i) => {
                const dateStr = format(day, "yyyy-MM-dd");
                const daySchedules = schedules.filter(s => s.date === dateStr).sort((a, b) => a.startTime.localeCompare(b.startTime));
                
                return (
                  <div key={i} className="min-h-[500px] flex flex-col">
                    <div className="p-3 text-center border-b border-card-border bg-muted/10">
                      <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">{format(day, "EEE")}</p>
                      <p className="text-lg font-bold mt-0.5">{format(day, "d")}</p>
                    </div>
                    <div className="flex-1 p-2 space-y-2 bg-muted/5">
                      {daySchedules.map(session => {
                        const course = courseList.find(c => c.slug === session.courseSlug);
                        return (
                          <div 
                            key={session.id} 
                            className={`p-2.5 rounded-lg border text-sm shadow-sm transition-all hover:-translate-y-0.5 ${getCourseColor(session.courseSlug)}`}
                          >
                            <p className="font-bold leading-tight mb-2">{course?.title || session.courseSlug}</p>
                            <div className="space-y-1.5 opacity-90">
                              <div className="flex items-center gap-1.5 text-xs font-medium">
                                <Clock className="h-3 w-3 shrink-0" />
                                <span>{session.startTime} - {session.endTime}</span>
                              </div>
                              <div className="flex items-center gap-1.5 text-xs">
                                <MapPin className="h-3 w-3 shrink-0" />
                                <span className="truncate">{session.room}</span>
                              </div>
                              <div className="flex items-center gap-1.5 text-xs">
                                <User className="h-3 w-3 shrink-0" />
                                <span className="truncate">{session.trainer}</span>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                      {daySchedules.length === 0 && (
                        <div className="h-full w-full flex items-center justify-center">
                          <p className="text-xs text-muted-foreground/50 font-medium">No sessions</p>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  );
}
