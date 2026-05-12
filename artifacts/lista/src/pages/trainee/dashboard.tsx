import { useAuth } from "@/context/auth-context";
import { Link } from "wouter";
import { motion } from "framer-motion";
import { 
  BookOpen, 
  FileText, 
  CalendarDays, 
  Award, 
  ChevronRight,
  Clock,
  MapPin,
  User as UserIcon,
  HelpCircle,
  ExternalLink,
  Trophy,
  Star,
  TrendingUp,
  AlertCircle
} from "lucide-react";
import StatCard from "@/components/stat-card";
import StatusBadge from "@/components/status-badge";
import AnnouncementCard from "@/components/announcement-card";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { courses, enrollments, schedules, announcements, certificates } from "@/lib/institutional-data";
import { format } from "date-fns";
import { calculateProfileCompletion, loadLocalProfile } from "@/lib/profile-utils";

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

export default function TraineeDashboardPage() {
  const { user } = useAuth();
  
  const myEnrollment = enrollments.find(e => e.traineeEmail === user?.email) || enrollments[0];
  const myCourse = courses.find(c => c.slug === myEnrollment.courseSlug);
  const mySchedules = schedules.filter(s => s.courseSlug === myCourse?.slug).slice(0, 3);
  const myCerts = certificates.filter(c => c.userId === user?.id);
  const recentAnnouncements = announcements
    .filter(a => a.targetRole === "all" || a.targetRole === "trainee")
    .slice(0, 3);
    
  // Real profile completion check
  const draft = loadLocalProfile();
  const completionPercentage = calculateProfileCompletion(draft || myEnrollment);
  const profileIncomplete = completionPercentage < 100;

  return (
    <div className="space-y-8">
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col md:flex-row md:items-end justify-between gap-4"
      >
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Welcome back, {user?.name?.split(' ')[0]}</h1>
          <p className="text-muted-foreground mt-1">Here's what's happening with your learning journey.</p>
        </div>
      </motion.div>

      {profileIncomplete && (
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-amber-50 border border-amber-200 p-6 rounded-[2rem] flex flex-col md:flex-row items-center justify-between gap-6 shadow-sm"
        >
          <div className="flex items-center gap-4 text-center md:text-left">
            <div className="w-12 h-12 bg-amber-100 rounded-2xl flex items-center justify-center text-amber-600 shrink-0">
              <AlertCircle className="w-6 h-6" />
            </div>
            <div>
              <p className="font-black text-amber-900 uppercase tracking-widest text-xs mb-1">Incomplete Profile ({completionPercentage}%)</p>
              <p className="text-sm text-amber-700 font-medium leading-relaxed max-w-xl">
                Some TESDA-required fields are still missing. Complete them now to enable **Instant Admission Slips** for your next enrollment.
              </p>
            </div>
          </div>
          <Link href="/trainee/profile" className="w-full md:w-auto bg-amber-500 hover:bg-amber-600 text-white px-8 py-3 rounded-2xl text-xs font-black uppercase tracking-widest transition-all shadow-lg shadow-amber-500/20 text-center">
            Complete Profile
          </Link>
        </motion.div>
      )}

      <motion.div 
        variants={container}
        initial="hidden"
        animate="show"
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4"
      >
        <motion.div variants={item}>
          <StatCard
            label="Enrolled Course"
            value={myCourse?.title || "None"}
            icon={BookOpen}
            className="h-full"
          />
        </motion.div>
        <motion.div variants={item}>
          <StatCard
            label="Application Status"
            value={<StatusBadge status={myEnrollment.status as any} className="mt-1" />}
            icon={FileText}
            className="h-full"
          />
        </motion.div>
        <motion.div variants={item} className="md:col-span-1">
          <Card className="h-full border-primary/20 bg-gradient-to-br from-primary-indigo to-primary-electric text-white overflow-hidden relative group">
            <Trophy className="absolute top-2 right-2 h-16 w-16 text-white/10 -rotate-12 transition-transform group-hover:scale-110" />
            <CardHeader className="pb-2">
              <CardTitle className="text-xs font-black uppercase tracking-widest text-white/70">Current Rank</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-black">#12</div>
              <div className="text-[10px] font-bold text-white/80 uppercase mt-1">Global Standings</div>
              <div className="mt-4 flex items-center gap-2">
                <div className="flex-1 h-1.5 bg-white/20 rounded-full overflow-hidden">
                  <div className="h-full bg-accent-gold w-[85%]" />
                </div>
                <span className="text-[10px] font-black tracking-tighter">85%</span>
              </div>
            </CardContent>
          </Card>
        </motion.div>
        <motion.div variants={item}>
          <Card className="h-full border-accent-gold/20 bg-white overflow-hidden relative">
            <Star className="absolute top-2 right-2 h-12 w-12 text-accent-gold/5" />
            <CardHeader className="pb-2">
              <CardTitle className="text-xs font-black uppercase tracking-widest text-slate-400">Total Points</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <div className="text-3xl font-black text-slate-900">2,450</div>
                <div className="bg-accent-gold/10 text-accent-gold text-[10px] font-black px-1.5 py-0.5 rounded-md">RP</div>
              </div>
              <p className="text-[10px] font-bold text-emerald-600 mt-1 flex items-center gap-1">
                <TrendingUp className="h-3 w-3" /> +150 this week
              </p>
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <motion.div 
          variants={container}
          initial="hidden"
          animate="show"
          className="lg:col-span-2 space-y-8"
        >
          {/* Application Status Card */}
          <motion.div variants={item}>
            <Card className="border-card-border shadow-sm">
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-lg">Application Timeline</CardTitle>
                    <CardDescription>Ref: {myEnrollment.refNo}</CardDescription>
                  </div>
                  <Button variant="outline" size="sm" asChild>
                    <Link href="/trainee/application">View Details</Link>
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between relative">
                  <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-1 bg-muted rounded-full" />
                  <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1/2 h-1 bg-primary rounded-full" />
                  
                  {['Submitted', 'Review', 'Interview', 'Enrolled'].map((step, i) => (
                    <div key={step} className="relative flex flex-col items-center gap-2 bg-card px-2 z-10">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 ${
                        i < 2 ? 'bg-primary border-primary text-primary-foreground' : 
                        i === 2 ? 'bg-background border-primary text-primary' : 
                        'bg-background border-muted text-muted-foreground'
                      }`}>
                        {i + 1}
                      </div>
                      <span className="text-xs font-semibold">{step}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Upcoming Sessions */}
          <motion.div variants={item}>
            <Card className="border-card-border shadow-sm">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-lg">Upcoming Sessions</CardTitle>
                <Button variant="ghost" size="sm" asChild>
                  <Link href="/trainee/schedule">Full Schedule <ChevronRight className="ml-1 h-4 w-4" /></Link>
                </Button>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {mySchedules.length > 0 ? mySchedules.map((schedule, i) => (
                    <div key={i} className="flex gap-4 p-4 rounded-xl bg-muted/30 border border-card-border">
                      <div className="flex flex-col items-center justify-center w-16 h-16 rounded-lg bg-primary/5 text-primary shrink-0">
                        <span className="text-sm font-bold uppercase">{format(new Date(schedule.date), "MMM")}</span>
                        <span className="text-xl font-bold leading-none">{format(new Date(schedule.date), "dd")}</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-semibold text-base truncate">{schedule.courseSlug.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}</h4>
                        <div className="mt-1 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground">
                          <span className="flex items-center"><Clock className="mr-1 h-3.5 w-3.5" /> {schedule.startTime} - {schedule.endTime}</span>
                          <span className="flex items-center"><MapPin className="mr-1 h-3.5 w-3.5" /> {schedule.room}</span>
                          <span className="flex items-center"><UserIcon className="mr-1 h-3.5 w-3.5" /> {schedule.trainer}</span>
                        </div>
                      </div>
                    </div>
                  )) : (
                    <p className="text-sm text-muted-foreground py-4 text-center">No upcoming sessions.</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </motion.div>

        <motion.div 
          variants={container}
          initial="hidden"
          animate="show"
          className="space-y-8"
        >
          {/* Quick Actions */}
          <motion.div variants={item}>
            <Card className="border-card-border shadow-sm">
              <CardHeader className="pb-4">
                <CardTitle className="text-lg">Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button variant="outline" className="w-full justify-start h-12" asChild>
                  <Link href="/trainee/schedule"><CalendarDays className="mr-2 h-4 w-4" /> View Schedule</Link>
                </Button>
                <Button variant="outline" className="w-full justify-start h-12" asChild>
                  <Link href="/trainee/certificate"><Award className="mr-2 h-4 w-4" /> Browse Certificates</Link>
                </Button>
                <Button variant="outline" className="w-full justify-start h-12" asChild>
                  <Link href="/trainee/help"><HelpCircle className="mr-2 h-4 w-4" /> Get Help</Link>
                </Button>
              </CardContent>
            </Card>
          </motion.div>

          {/* Recent Announcements */}
          <motion.div variants={item}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold tracking-tight">Recent Announcements</h3>
              <Button variant="ghost" size="sm" asChild className="h-8">
                <Link href="/trainee/announcements">View All</Link>
              </Button>
            </div>
            <div className="space-y-4">
              {recentAnnouncements.map(announcement => (
                <AnnouncementCard key={announcement.id} announcement={announcement} />
              ))}
            </div>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}
