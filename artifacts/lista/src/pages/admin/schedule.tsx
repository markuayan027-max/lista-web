import { useState } from "react";
import { motion } from "framer-motion";
import { Plus, Calendar as CalendarIcon, Clock, MapPin, User, ChevronLeft, ChevronRight } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import PrimaryButton from "@/components/primary-button";
import FormInputField from "@/components/form-input-field";
import { schedules as initialSchedules, courses } from "@/lib/institutional-data";
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
  const [schedules, setSchedules] = useState(initialSchedules);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [view, setView] = useState("week"); // week is functional
  
  // Mock current week start
  const currentWeekStart = new Date(2023, 9, 15); // Oct 15, 2023 to match mock data
  const weekDays = Array.from({ length: 5 }).map((_, i) => addDays(currentWeekStart, i));

  const [form, setForm] = useState({
    courseSlug: "",
    date: format(currentWeekStart, "yyyy-MM-dd"),
    startTime: "09:00",
    endTime: "12:00",
    trainer: "",
    room: ""
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.courseSlug || !form.trainer || !form.room) {
      toast({ title: "Validation Error", description: "All fields are required.", variant: "destructive" });
      return;
    }

    const newSession = {
      id: `s${Date.now()}`,
      ...form
    };

    setSchedules([...schedules, newSession]);
    setIsDialogOpen(false);
    toast({ title: "Session Scheduled", description: "The new session has been added to the calendar." });
  };

  const getCourseColor = (slug: string) => {
    const colors = [
      "bg-blue-100 text-blue-800 border-blue-200",
      "bg-emerald-100 text-emerald-800 border-emerald-200",
      "bg-indigo-100 text-indigo-800 border-indigo-200",
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
              className={`text-xs px-4 h-7 ${view === "week" ? "bg-white shadow-sm" : ""}`}
              onClick={() => setView("week")}
            >
              Week
            </Button>
            <Button 
              variant={view === "month" ? "secondary" : "ghost"} 
              size="sm" 
              className={`text-xs px-4 h-7 ${view === "month" ? "bg-white shadow-sm" : ""}`}
              onClick={() => setView("month")}
            >
              Month
            </Button>
          </div>
          
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <PrimaryButton className="gap-2">
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
                        {courses.map(c => (
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
        </div>
      </div>

      <motion.div variants={itemVariants}>
        <Card className="border-card-border shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between py-4 border-b border-card-border">
            <div className="flex items-center gap-4">
              <Button variant="outline" size="icon" className="h-8 w-8">
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <h2 className="text-sm font-bold">Oct 15 - Oct 19, 2023</h2>
              <Button variant="outline" size="icon" className="h-8 w-8">
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
                        const course = courses.find(c => c.slug === session.courseSlug);
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
