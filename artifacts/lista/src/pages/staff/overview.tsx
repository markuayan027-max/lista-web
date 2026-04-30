import { motion } from "framer-motion";
import { Link } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import StatCard from "@/components/stat-card";
import EnrollmentCard from "@/components/enrollment-card";
import { CalendarDays, Users, Award, FileText, Plus, Bell, ChevronRight } from "lucide-react";
import { schedules, enrollments, users, certificates } from "@/lib/mock-data";
import { isSameDay, parseISO } from "date-fns";

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.1 }
  }
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { type: "spring" as const, stiffness: 300, damping: 24 } }
};

export default function StaffOverviewPage() {
  const todayDate = new Date("2023-10-15"); // Mock today
  const todaysSessions = schedules.filter(s => isSameDay(parseISO(s.date), todayDate));
  const pendingEnrollments = enrollments.filter(e => e.status === "pending").length;
  const activeTrainees = users.filter(u => u.role === "trainee").length;
  
  return (
    <div className="space-y-8">
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="text-3xl font-bold tracking-tight">Staff Overview</h1>
        <p className="text-muted-foreground mt-1">Here's what's happening across the academy today.</p>
      </motion.div>

      <motion.div 
        variants={container}
        initial="hidden"
        animate="show"
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4"
      >
        <motion.div variants={item}>
          <StatCard
            label="Today's Sessions"
            value={todaysSessions.length.toString()}
            icon={CalendarDays}
            trend={{ value: 12, isPositive: true }}
          />
        </motion.div>
        <motion.div variants={item}>
          <StatCard
            label="Pending Enrollments"
            value={pendingEnrollments.toString()}
            icon={FileText}
            className="border-amber-200"
            accent="bg-amber-100 text-amber-700"
          />
        </motion.div>
        <motion.div variants={item}>
          <StatCard
            label="Active Trainees"
            value={activeTrainees.toString()}
            icon={Users}
            trend={{ value: 5, isPositive: true }}
          />
        </motion.div>
        <motion.div variants={item}>
          <StatCard
            label="Certificates Issued"
            value={certificates.filter(c => c.status === "issued").length.toString()}
            icon={Award}
          />
        </motion.div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <motion.div 
          variants={container}
          initial="hidden"
          animate="show"
          className="lg:col-span-2 space-y-8"
        >
          <motion.div variants={item}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold tracking-tight">Recent Enrollments</h3>
              <Button variant="ghost" size="sm" asChild>
                <Link href="/staff/enrollments">View All</Link>
              </Button>
            </div>
            <div className="space-y-3">
              {enrollments.slice(0, 5).map(enrollment => (
                <EnrollmentCard key={enrollment.id} enrollment={enrollment} />
              ))}
            </div>
          </motion.div>
        </motion.div>

        <motion.div 
          variants={container}
          initial="hidden"
          animate="show"
          className="space-y-8"
        >
          <motion.div variants={item}>
            <Card className="border-card-border shadow-sm">
              <CardHeader className="pb-4 border-b border-card-border">
                <CardTitle className="text-lg">Today's Schedule</CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <div className="divide-y divide-card-border">
                  {todaysSessions.length > 0 ? todaysSessions.map(session => (
                    <div key={session.id} className="p-4 hover:bg-muted/30 transition-colors">
                      <div className="flex justify-between mb-1">
                        <p className="text-sm font-bold text-primary">{session.startTime} - {session.endTime}</p>
                        <p className="text-xs font-semibold text-muted-foreground">{session.room}</p>
                      </div>
                      <p className="font-semibold text-sm truncate">{session.courseSlug.split('-').join(' ')}</p>
                      <p className="text-xs text-muted-foreground mt-1">{session.trainer}</p>
                    </div>
                  )) : (
                    <div className="p-8 text-center text-muted-foreground text-sm">
                      No sessions scheduled for today.
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div variants={item}>
            <Card className="border-card-border shadow-sm">
              <CardHeader className="pb-4">
                <CardTitle className="text-lg">Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button variant="outline" className="w-full justify-start h-12" asChild>
                  <Link href="/staff/announcements"><Bell className="mr-2 h-4 w-4 text-primary" /> Compose Announcement</Link>
                </Button>
                <Button variant="outline" className="w-full justify-start h-12" asChild>
                  <Link href="/staff/schedule"><Plus className="mr-2 h-4 w-4 text-primary" /> Add Session</Link>
                </Button>
                <Button variant="outline" className="w-full justify-start h-12" asChild>
                  <Link href="/staff/enrollments"><Users className="mr-2 h-4 w-4 text-primary" /> View Enrollments</Link>
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}
