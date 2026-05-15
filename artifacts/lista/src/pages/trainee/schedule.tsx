import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight, Clock, MapPin, User as UserIcon, Calendar as CalendarIcon, BookOpen, LayoutGrid, Calendar as CalendarMonthIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { schedules, courses, enrollments } from "@/lib/institutional-data";
import { format, addDays, startOfWeek, isSameDay, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, endOfWeek } from "date-fns";
import { useAuth } from "@/context/auth-context";
import { loadLocalProfile } from "@/lib/profile-utils";
import { cn } from "@/lib/utils";

export default function TraineeSchedulePage() {
  const { user } = useAuth();
  const [currentDate, setCurrentDate] = useState(new Date()); 
  const [view, setView] = useState<"week" | "month">("week");
  
  const weekStart = startOfWeek(currentDate, { weekStartsOn: 1 });
  const weekDays = Array.from({ length: 7 }).map((_, i) => addDays(weekStart, i));

  // Month logic
  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(monthStart);
  const calendarStart = startOfWeek(monthStart, { weekStartsOn: 1 });
  const calendarEnd = endOfWeek(monthEnd, { weekStartsOn: 1 });
  const calendarDays = eachDayOfInterval({ start: calendarStart, end: calendarEnd });

  // Dynamically determine the trainee's course
  const userEnrollment = enrollments.find(e => e.traineeEmail === user?.email);
  const draft = loadLocalProfile();
  const myEnrollment = userEnrollment || draft;
  
  const myCourse = myEnrollment?.courseSlug ? courses.find(c => c.slug === myEnrollment.courseSlug) : null;
  const mySchedules = myCourse ? schedules.filter(s => s.courseSlug === myCourse.slug) : [];

  const nextRange = () => setCurrentDate(addDays(currentDate, view === "week" ? 7 : 30));
  const prevRange = () => setCurrentDate(addDays(currentDate, view === "week" ? -7 : -30));
  const today = () => setCurrentDate(new Date());

  return (
    <div className="space-y-8 pb-10">
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col lg:flex-row lg:items-center justify-between gap-6"
      >
        <div className="space-y-1">
          <h1 className="text-3xl font-black tracking-tight text-slate-900">Class Schedule</h1>
          <p className="text-muted-foreground font-medium">Your upcoming sessions and events</p>
          {myCourse ? (
            <div className="flex flex-wrap items-center gap-x-4 gap-y-2 mt-3">
              <div className="flex items-center gap-2 bg-primary/5 px-3 py-1 rounded-full border border-primary/10">
                <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                <span className="text-xs font-bold text-primary uppercase tracking-wider">
                  {myCourse.title}
                </span>
              </div>
              {myCourse.startDate && myCourse.endDate && (
                <div className="flex items-center gap-2 text-slate-500 bg-slate-50 px-3 py-1 rounded-full border border-slate-200">
                  <CalendarIcon className="h-3.5 w-3.5" />
                  <span className="text-xs font-bold uppercase tracking-tight">
                    {format(new Date(myCourse.startDate), "MMM dd")} – {format(new Date(myCourse.endDate), "MMM dd, yyyy")}
                  </span>
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-2 mt-2 text-amber-600 bg-amber-50 px-3 py-1 rounded-full border border-amber-100 w-fit">
              <BookOpen className="h-3.5 w-3.5" />
              <span className="text-xs font-bold uppercase tracking-tight">No Active Enrollment Found</span>
            </div>
          )}
        </div>
        
        <div className="flex flex-col sm:flex-row items-center gap-3">
          <div className="flex bg-slate-100 p-1 rounded-xl border border-slate-200 w-full sm:w-auto">
            <Button 
              variant="ghost" 
              size="sm" 
              className={cn(
                "flex-1 sm:flex-none gap-2 rounded-lg text-xs font-bold transition-all h-9 px-4",
                view === "week" ? "bg-white shadow-sm text-primary" : "text-slate-500 hover:text-slate-700"
              )}
              onClick={() => setView("week")}
            >
              <LayoutGrid className="h-3.5 w-3.5" />
              Week
            </Button>
            <Button 
              variant="ghost" 
              size="sm" 
              className={cn(
                "flex-1 sm:flex-none gap-2 rounded-lg text-xs font-bold transition-all h-9 px-4",
                view === "month" ? "bg-white shadow-sm text-primary" : "text-slate-500 hover:text-slate-700"
              )}
              onClick={() => setView("month")}
            >
              <CalendarMonthIcon className="h-3.5 w-3.5" />
              Month
            </Button>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <Button variant="outline" size="sm" onClick={today} className="h-9 rounded-xl font-bold border-slate-200 hover:bg-slate-50">Today</Button>
            <div className="flex items-center border border-slate-200 rounded-xl bg-white shadow-sm">
              <Button variant="ghost" size="icon" className="rounded-l-xl h-9 w-9 hover:bg-slate-50 border-r border-slate-100" onClick={prevRange}>
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <div className="px-4 text-xs font-black uppercase tracking-widest text-slate-600 min-w-[140px] text-center">
                {view === "week" 
                  ? `${format(weekStart, "MMM dd")} - ${format(addDays(weekStart, 6), "MMM dd")}`
                  : format(currentDate, "MMMM yyyy")
                }
              </div>
              <Button variant="ghost" size="icon" className="rounded-r-xl h-9 w-9 hover:bg-slate-50 border-l border-slate-100" onClick={nextRange}>
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </motion.div>

      <AnimatePresence mode="wait">
        {view === "week" ? (
          <motion.div 
            key="week"
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 10 }}
            className="grid grid-cols-1 gap-4 lg:grid-cols-7 lg:gap-3"
          >
            {weekDays.map((day, i) => {
              const daySchedules = mySchedules.filter(s => isSameDay(new Date(s.date), day));
              const isTodayDate = isSameDay(day, new Date());

              return (
                <div key={i} className="flex flex-col gap-3 group">
                  <div className={cn(
                    "p-4 rounded-2xl text-center transition-all duration-300",
                    isTodayDate 
                      ? 'bg-primary text-white shadow-lg shadow-primary/20 ring-4 ring-primary/10 scale-[1.02]' 
                      : 'bg-white border border-slate-100 group-hover:border-slate-200'
                  )}>
                    <p className={cn(
                      "text-[10px] font-black uppercase tracking-[0.2em]",
                      isTodayDate ? 'text-white/80' : 'text-slate-400'
                    )}>
                      {format(day, "EEE")}
                    </p>
                    <p className="text-2xl font-black mt-0.5">{format(day, "dd")}</p>
                  </div>
                  
                  <div className="flex-1 flex flex-col gap-3 min-h-[120px]">
                    {daySchedules.length > 0 ? (
                      daySchedules.map((schedule) => {
                        const course = courses.find(c => c.slug === schedule.courseSlug);
                        return (
                          <motion.div
                            key={schedule.id}
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                          >
                            <Card className="border-none bg-slate-50 shadow-none hover:bg-slate-100/80 transition-all group/item overflow-hidden">
                              <CardContent className="p-4 relative">
                                <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary/20 group-hover/item:bg-primary transition-all" />
                                <div className="flex items-center gap-1.5 text-[10px] font-black text-primary uppercase tracking-wider mb-2">
                                  <Clock className="h-3 w-3" /> 
                                  {schedule.startTime} - {schedule.endTime}
                                </div>
                                <h4 className="text-sm font-bold text-slate-800 leading-tight mb-3 group-hover/item:text-primary transition-colors">
                                  {course?.title || schedule.courseSlug}
                                </h4>
                                <div className="space-y-2">
                                  <div className="flex items-center text-[11px] font-bold text-slate-500 bg-white/60 w-fit px-2 py-1 rounded-md border border-slate-100">
                                    <MapPin className="h-3 w-3 mr-1.5 text-slate-400" /> {schedule.room}
                                  </div>
                                  <div className="flex items-center text-[11px] font-bold text-slate-500 bg-white/60 w-fit px-2 py-1 rounded-md border border-slate-100">
                                    <UserIcon className="h-3 w-3 mr-1.5 text-slate-400" /> {schedule.trainer}
                                  </div>
                                </div>
                              </CardContent>
                            </Card>
                          </motion.div>
                        );
                      })
                    ) : (
                      <div className="flex-1 border-2 border-dashed border-slate-100 rounded-2xl flex items-center justify-center bg-slate-50/30 p-4 transition-colors group-hover:bg-slate-50/50">
                        <p className="text-[10px] text-slate-300 font-black uppercase tracking-widest text-center">No sessions</p>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </motion.div>
        ) : (
          <motion.div 
            key="month"
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -10 }}
            className="bg-white rounded-[2rem] border border-slate-100 shadow-xl shadow-slate-200/50 overflow-hidden"
          >
            <div className="grid grid-cols-7 border-b border-slate-100 bg-slate-50/50">
              {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(day => (
                <div key={day} className="py-4 text-center">
                  <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">{day}</span>
                </div>
              ))}
            </div>
            <div className="grid grid-cols-7">
              {calendarDays.map((day, i) => {
                const daySchedules = mySchedules.filter(s => isSameDay(new Date(s.date), day));
                const isCurrentMonth = isSameMonth(day, currentDate);
                const isTodayDate = isSameDay(day, new Date());

                return (
                  <div 
                    key={i} 
                    className={cn(
                      "min-h-[120px] p-2 border-r border-b border-slate-50 transition-all hover:bg-slate-50/30",
                      !isCurrentMonth && "bg-slate-50/20 opacity-40",
                      i % 7 === 6 && "border-r-0"
                    )}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <span className={cn(
                        "text-sm font-black w-7 h-7 flex items-center justify-center rounded-full transition-all",
                        isTodayDate ? "bg-primary text-white shadow-lg shadow-primary/20" : "text-slate-400"
                      )}>
                        {format(day, "d")}
                      </span>
                      {daySchedules.length > 0 && (
                        <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                      )}
                    </div>
                    <div className="space-y-1">
                      {daySchedules.map(session => (
                        <div 
                          key={session.id} 
                          className="px-2 py-1 bg-primary/5 border border-primary/10 rounded-md group/item cursor-default"
                        >
                          <p className="text-[9px] font-black text-primary truncate uppercase tracking-tighter">
                            {session.startTime} • {session.room}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
