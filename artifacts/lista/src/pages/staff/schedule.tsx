import { useState } from "react";
import { motion } from "framer-motion";
import { Plus, ChevronLeft, ChevronRight, Clock, MapPin, User as UserIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import FormInputField from "@/components/form-input-field";
import PrimaryButton from "@/components/primary-button";
import { useToast } from "@/hooks/use-toast";
import { schedules as initialSchedules, courses } from "@/lib/institutional-data";
import { format, addDays, startOfWeek, isSameDay } from "date-fns";

export default function StaffSchedulePage() {
  const { toast } = useToast();
  const [schedules, setSchedules] = useState(initialSchedules);
  const [currentDate, setCurrentDate] = useState(new Date("2023-10-15"));
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const weekStart = startOfWeek(currentDate, { weekStartsOn: 1 });
  const weekDays = Array.from({ length: 7 }).map((_, i) => addDays(weekStart, i));

  const nextWeek = () => setCurrentDate(addDays(currentDate, 7));
  const prevWeek = () => setCurrentDate(addDays(currentDate, -7));
  const today = () => setCurrentDate(new Date("2023-10-15"));

  const handleAddSession = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const newSession = {
      id: "s" + Date.now(),
      courseSlug: formData.get("course") as string,
      date: formData.get("date") as string,
      startTime: formData.get("startTime") as string,
      endTime: formData.get("endTime") as string,
      trainer: formData.get("trainer") as string,
      room: formData.get("room") as string,
    };
    
    setSchedules([...schedules, newSession]);
    setIsDialogOpen(false);
    toast({
      title: "Session Added",
      description: "New schedule session has been created.",
    });
  };

  const getCategoryColor = (category?: string) => {
    switch (category) {
      case "Technology": return "border-blue-500 bg-blue-50 text-blue-800";
      case "Data": return "border-emerald-500 bg-emerald-50 text-emerald-800";
      case "Design": return "border-purple-500 bg-purple-50 text-purple-800";
      case "Healthcare": return "border-rose-500 bg-rose-50 text-rose-800";
      default: return "border-slate-500 bg-slate-50 text-slate-800";
    }
  };

  return (
    <div className="space-y-8">
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row sm:items-center justify-between gap-4"
      >
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Master Schedule</h1>
          <p className="text-muted-foreground mt-1">Manage all academy sessions and classes.</p>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="flex items-center border border-card-border rounded-md bg-white">
            <Button variant="ghost" size="icon" className="rounded-none rounded-l-md h-10" onClick={prevWeek}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <div className="px-4 text-sm font-semibold w-40 text-center" onClick={today} style={{cursor:'pointer'}}>
              {format(weekStart, "MMM dd")} - {format(addDays(weekStart, 6), "MMM dd")}
            </div>
            <Button variant="ghost" size="icon" className="rounded-none rounded-r-md h-10" onClick={nextWeek}>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
          
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button className="h-10 font-bold"><Plus className="mr-2 h-4 w-4" /> New Session</Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Add New Session</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleAddSession} className="space-y-4 pt-4">
                <div className="space-y-2">
                  <label className="text-sm font-semibold">Course</label>
                  <Select name="course" required>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a course" />
                    </SelectTrigger>
                    <SelectContent>
                      {courses.map(c => <SelectItem key={c.slug} value={c.slug}>{c.title}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                
                <FormInputField label="Date" name="date" type="date" required defaultValue="2023-10-15" />
                
                <div className="grid grid-cols-2 gap-4">
                  <FormInputField label="Start Time" name="startTime" type="time" required defaultValue="09:00" />
                  <FormInputField label="End Time" name="endTime" type="time" required defaultValue="12:00" />
                </div>
                
                <FormInputField label="Trainer Name" name="trainer" required placeholder="e.g. Sarah Jenkins" />
                <FormInputField label="Room / Location" name="room" required placeholder="e.g. Lab 1" />
                
                <PrimaryButton type="submit" className="w-full mt-2">Save Session</PrimaryButton>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </motion.div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="grid grid-cols-1 gap-4 lg:grid-cols-7 lg:gap-3"
      >
        {weekDays.map((day, i) => {
          const daySchedules = schedules.filter(s => isSameDay(new Date(s.date), day));
          const isTodayDate = isSameDay(day, new Date("2023-10-15")); 

          return (
            <div key={i} className="flex flex-col gap-3">
              <div className={`p-3 rounded-xl text-center shadow-sm ${isTodayDate ? 'bg-primary text-primary-foreground' : 'bg-white border border-card-border'}`}>
                <p className={`text-xs font-bold uppercase tracking-wider ${isTodayDate ? 'text-primary-foreground/80' : 'text-muted-foreground'}`}>
                  {format(day, "EEE")}
                </p>
                <p className="text-xl font-bold">{format(day, "dd")}</p>
              </div>
              
              <div className="flex-1 flex flex-col gap-2 min-h-[100px]">
                {daySchedules.length > 0 ? (
                  daySchedules.map((schedule) => {
                    const course = courses.find(c => c.slug === schedule.courseSlug);
                    const colorClasses = getCategoryColor(course?.category);
                    
                    return (
                      <Card key={schedule.id} className={`border-l-4 shadow-sm overflow-hidden ${colorClasses}`}>
                        <CardContent className="p-3">
                          <p className="text-[11px] font-bold mb-1 opacity-80 flex items-center">
                            <Clock className="h-3 w-3 mr-1 inline" /> 
                            {schedule.startTime} - {schedule.endTime}
                          </p>
                          <h4 className="text-xs font-bold leading-tight mb-2 line-clamp-2">{course?.title}</h4>
                          <div className="space-y-1">
                            <p className="text-[10px] opacity-70 flex items-center font-medium">
                              <MapPin className="h-3 w-3 mr-1 inline" /> {schedule.room}
                            </p>
                            <p className="text-[10px] opacity-70 flex items-center font-medium">
                              <UserIcon className="h-3 w-3 mr-1 inline" /> {schedule.trainer}
                            </p>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })
                ) : (
                  <div className="flex-1 border-2 border-dashed border-card-border rounded-xl flex items-center justify-center bg-transparent p-4">
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </motion.div>
    </div>
  );
}
