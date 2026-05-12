import { useState } from "react";
import { motion } from "framer-motion";
import { ChevronLeft, ChevronRight, Clock, MapPin, User as UserIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { schedules, courses } from "@/lib/institutional-data";
import { format, addDays, startOfWeek, isSameDay } from "date-fns";

export default function TraineeSchedulePage() {
  const [currentDate, setCurrentDate] = useState(new Date("2023-10-15")); // Using mock data date as center
  
  const weekStart = startOfWeek(currentDate, { weekStartsOn: 1 });
  const weekDays = Array.from({ length: 7 }).map((_, i) => addDays(weekStart, i));

  // Get trainee's mock schedule (just use all schedules for demo)
  const mySchedules = schedules;

  const nextWeek = () => setCurrentDate(addDays(currentDate, 7));
  const prevWeek = () => setCurrentDate(addDays(currentDate, -7));
  const today = () => setCurrentDate(new Date("2023-10-15"));

  return (
    <div className="space-y-8">
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row sm:items-center justify-between gap-4"
      >
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Class Schedule</h1>
          <p className="text-muted-foreground mt-1">Your upcoming sessions and events</p>
        </div>
        
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={today}>Today</Button>
          <div className="flex items-center border border-card-border rounded-md">
            <Button variant="ghost" size="icon" className="rounded-none rounded-l-md h-9" onClick={prevWeek}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <div className="px-4 text-sm font-medium w-40 text-center">
              {format(weekStart, "MMM dd")} - {format(addDays(weekStart, 6), "MMM dd")}
            </div>
            <Button variant="ghost" size="icon" className="rounded-none rounded-r-md h-9" onClick={nextWeek}>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </motion.div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="grid grid-cols-1 gap-4 lg:grid-cols-7 lg:gap-2"
      >
        {weekDays.map((day, i) => {
          const daySchedules = mySchedules.filter(s => isSameDay(new Date(s.date), day));
          const isTodayDate = isSameDay(day, new Date("2023-10-15")); // Mock today

          return (
            <div key={i} className="flex flex-col gap-3">
              <div className={`p-3 rounded-lg text-center ${isTodayDate ? 'bg-primary text-primary-foreground' : 'bg-muted/50 border border-card-border'}`}>
                <p className={`text-xs font-bold uppercase tracking-wider ${isTodayDate ? 'text-primary-foreground/80' : 'text-muted-foreground'}`}>
                  {format(day, "EEE")}
                </p>
                <p className="text-xl font-bold">{format(day, "dd")}</p>
              </div>
              
              <div className="flex-1 flex flex-col gap-2 min-h-[100px]">
                {daySchedules.length > 0 ? (
                  daySchedules.map((schedule) => {
                    const course = courses.find(c => c.slug === schedule.courseSlug);
                    return (
                      <Card key={schedule.id} className="border-primary/20 bg-primary/5 shadow-none overflow-hidden">
                        <div className="w-1 h-full bg-primary absolute left-0 top-0" />
                        <CardContent className="p-3 relative">
                          <p className="text-[11px] font-bold text-primary mb-1 flex items-center">
                            <Clock className="h-3 w-3 mr-1 inline" /> 
                            {schedule.startTime} - {schedule.endTime}
                          </p>
                          <h4 className="text-sm font-bold leading-tight mb-2">{course?.title}</h4>
                          <div className="space-y-1">
                            <p className="text-[11px] text-muted-foreground flex items-center">
                              <MapPin className="h-3 w-3 mr-1 inline" /> {schedule.room}
                            </p>
                            <p className="text-[11px] text-muted-foreground flex items-center">
                              <UserIcon className="h-3 w-3 mr-1 inline" /> {schedule.trainer}
                            </p>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })
                ) : (
                  <div className="flex-1 border-2 border-dashed border-card-border rounded-lg flex items-center justify-center bg-card/50 p-4">
                    <p className="text-xs text-muted-foreground font-medium text-center">No sessions</p>
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
