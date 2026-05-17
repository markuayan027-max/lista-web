import { useAuth } from "@/context/auth-context";
import { motion } from "framer-motion";
import { useCourses } from "@/hooks/use-lista-data";
import { scholarshipSlots } from "@/lib/institutional-data";
import { BookOpen, Clock, ArrowRight, Lock } from "lucide-react";
import { Link } from "wouter";
import { cn } from "@/lib/utils";
import { useEffect, useState } from "react";
import { fetchTraineeEnrollmentByEmail } from "@/lib/trainee-enrollment-insforge";
import type { Enrollment } from "@/lib/institutional-data";

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

export default function TraineeApplicationPage() {
  const { user } = useAuth();
  const { data: courses = [] } = useCourses();
  const [userEnrollment, setUserEnrollment] = useState<Enrollment | null>(null);
  const [isFetching, setIsFetching] = useState(true);

  useEffect(() => {
    if (user?.email) {
      fetchTraineeEnrollmentByEmail(user.email).then(res => {
        if (res.success && res.data) {
          setUserEnrollment(res.data as unknown as Enrollment);
        }
        setIsFetching(false);
      });
    } else {
      setIsFetching(false);
    }
  }, [user?.email]);

  // Determine if user has an active enrollment (not cancelled, not completed, not ready_to_apply)
  const hasActiveEnrollment = userEnrollment && !["completed", "cancelled", "rejected", "ready_to_apply"].includes(userEnrollment.status.toLowerCase());
  
  // Debug log to check data availability
  console.log("Courses available:", courses?.length);
  
  return (
    <div className="space-y-10 max-w-6xl mx-auto pb-20">
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-2"
      >
        <h1 className="text-4xl font-black tracking-tight text-gray-900">Available Courses</h1>
        <p className="text-gray-500 font-medium text-lg">Select a program to begin your TESDA certification journey.</p>
      </motion.div>

      {hasActiveEnrollment && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-amber-50 border border-amber-200 rounded-2xl p-6 flex items-start gap-4"
        >
          <Lock className="w-6 h-6 text-amber-500 mt-1 shrink-0" />
          <div>
            <h3 className="text-amber-900 font-bold text-lg">Active Enrollment Found</h3>
            <p className="text-amber-700 text-sm mt-1">
              You currently have an active or pending enrollment. You must complete or cancel your current course before applying for a new one.
            </p>
          </div>
        </motion.div>
      )}

      {(!courses || courses.length === 0) ? (
        <div className="flex flex-col items-center justify-center py-20 bg-gray-50 rounded-[2.5rem] border-2 border-dashed border-gray-200">
          <BookOpen className="h-12 w-12 text-gray-300 mb-4" />
          <p className="text-gray-500 font-bold">No courses are currently available for application.</p>
        </div>
      ) : (
        <motion.div 
          variants={container}
          initial="hidden"
          animate="show"
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {courses.map((course) => {
            const slotInfo = scholarshipSlots.find(s => s.courseSlug === course.slug);
            const hasSlots = slotInfo ? slotInfo.available > 0 : false;
            
            return (
              <motion.div key={course.id} variants={item}>
                <div className={cn(
                  "group relative h-full rounded-[2.5rem] transition-all duration-500 overflow-hidden border-2",
                  (hasSlots && !hasActiveEnrollment)
                    ? "bg-white border-gray-100 hover:border-indigo-100 hover:shadow-[0_20px_50px_rgba(79,70,229,0.1)] cursor-pointer" 
                    : "bg-gray-50/50 border-gray-100/50 cursor-not-allowed grayscale opacity-80"
                )}>
                  {/* Visual Status Overlay for No Slots */}
                  {!hasSlots && (
                    <div className="absolute inset-0 bg-white/40 backdrop-blur-[2px] z-10 flex flex-col items-center justify-center p-6 text-center">
                      <div className="w-12 h-12 bg-gray-900 text-white rounded-2xl flex items-center justify-center mb-3 shadow-lg">
                        <Lock className="w-5 h-5" />
                      </div>
                      <p className="text-gray-900 font-black uppercase tracking-widest text-[10px]">Slots Filled</p>
                      <p className="text-gray-500 text-xs font-bold mt-1 px-4">This course is currently frozen. Check back later.</p>
                    </div>
                  )}

                  <div className="p-8 space-y-6">
                    {/* Category & Badge */}
                    <div className="flex items-center justify-between">
                      <span className="px-4 py-1.5 bg-gray-100 text-gray-600 rounded-full text-[10px] font-black uppercase tracking-widest">
                        {course.category}
                      </span>
                      {hasSlots && (
                        <div className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 text-emerald-600 rounded-full text-[10px] font-black uppercase tracking-widest">
                          {slotInfo?.available} Slots Left
                        </div>
                      )}
                    </div>

                    {/* Title & Description */}
                    <div className="space-y-2">
                      <h3 className="text-xl font-black text-gray-900 leading-tight group-hover:text-indigo-600 transition-colors">
                        {course.title}
                      </h3>
                      <p className="text-sm text-gray-500 font-medium line-clamp-2">
                        {course.shortDescription}
                      </p>
                    </div>

                    {/* Stats */}
                    <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-50">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-xl bg-gray-50 flex items-center justify-center text-gray-400">
                          <Clock className="w-4 h-4" />
                        </div>
                        <div>
                          <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Duration</p>
                          <p className="text-xs font-bold text-gray-700">{course.durationHours} Hours</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-xl bg-gray-50 flex items-center justify-center text-gray-400">
                          <BookOpen className="w-4 h-4" />
                        </div>
                        <div>
                          <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Level</p>
                          <p className="text-xs font-bold text-gray-700">{course.ncLevel}</p>
                        </div>
                      </div>
                    </div>

                    {/* Action */}
                    <div className="pt-2">
                      {hasActiveEnrollment ? (
                        <div className="w-full h-12 bg-gray-100 text-gray-400 rounded-2xl flex items-center justify-center gap-2 font-black text-[11px] uppercase tracking-widest border border-gray-200 cursor-not-allowed">
                          Enrollment Locked <Lock className="w-3.5 h-3.5" />
                        </div>
                      ) : hasSlots ? (
                        <Link href={`/trainee/enroll?course=${course.slug}`}>
                          <button className="w-full h-12 bg-gray-900 hover:bg-indigo-600 text-white rounded-2xl flex items-center justify-center gap-2 font-black text-[11px] uppercase tracking-widest transition-all group-hover:shadow-lg group-hover:shadow-indigo-200">
                            Apply Now <ArrowRight className="w-4 h-4" />
                          </button>
                        </Link>
                      ) : (
                        <div className="w-full h-12 bg-gray-100 text-gray-400 rounded-2xl flex items-center justify-center gap-2 font-black text-[11px] uppercase tracking-widest border border-gray-200">
                          Waitlisted <Lock className="w-3.5 h-3.5" />
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </motion.div>
      )}
    </div>
  );
}

// Remove the local cn definition to use the imported one
