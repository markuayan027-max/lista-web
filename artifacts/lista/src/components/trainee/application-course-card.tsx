import { Link } from "wouter";
import { motion } from "framer-motion";
import { ArrowRight, BookOpen, Clock, FileText, Lock } from "lucide-react";
import OptimizedImage from "@/components/optimized-image";
import { resolveCourseCoverImage } from "@/lib/course-images";
import type { Course } from "@/lib/institutional-data";
import { cn } from "@/lib/utils";
import { useState } from "react";

type ApplicationCourseCardProps = {
  course: Course;
  hasSlots: boolean;
  canSelect: boolean;
  applicationFormComplete: boolean;
  hasActiveEnrollment: boolean;
};

export function ApplicationCourseCard({
  course,
  hasSlots,
  canSelect,
  applicationFormComplete,
  hasActiveEnrollment,
}: ApplicationCourseCardProps) {
  const [imgError, setImgError] = useState(false);
  const coverPath = resolveCourseCoverImage(course.slug, course.category, undefined);

  return (
    <motion.article
      layout
      aria-labelledby={`course-card-title-${course.id}`}
      className={cn(
        "group flex h-full flex-col overflow-hidden rounded-2xl border bg-card shadow-sm transition-all duration-300 focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2",
        canSelect
          ? "border-border hover:border-primary-indigo/40 hover:shadow-md hover:shadow-primary-indigo/10"
          : "border-border/60 opacity-95",
      )}
    >
      <motion.div
        className="relative aspect-[16/10] overflow-hidden bg-muted"
        whileHover={canSelect ? { scale: 1.02 } : undefined}
        transition={{ type: "spring", stiffness: 400, damping: 28 }}
      >
        {!imgError ? (
          <OptimizedImage
            src={coverPath}
            alt={course.title}
            onError={() => setImgError(true)}
            className="absolute inset-0 h-full w-full"
            imgClassName="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <motion.div
            className="flex h-full w-full items-center justify-center bg-gradient-to-br from-muted to-muted/60"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <BookOpen className="h-10 w-10 text-muted-foreground/40" aria-hidden />
          </motion.div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
        <motion.div
          className="absolute left-3 top-3 flex flex-wrap gap-1.5"
          initial={{ opacity: 0, y: -6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
        >
          <span className="rounded-full bg-white/95 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-foreground shadow-sm">
            {course.category}
          </span>
          {hasSlots && course.twsp && (
            <span className="rounded-full bg-emerald-600 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-white shadow-sm">
              TWSP
            </span>
          )}
        </motion.div>
        {!hasSlots && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-background/75 p-4 text-center backdrop-blur-[2px]">
            <Lock className="mb-2 h-6 w-6 text-muted-foreground" aria-hidden />
            <p className="text-[10px] font-bold uppercase tracking-widest text-foreground">Slots filled</p>
            <p className="mt-1 text-xs text-muted-foreground">Check back when enrollment reopens.</p>
          </div>
        )}
      </motion.div>

      <div className="flex flex-1 flex-col gap-4 p-5">
        <div className="space-y-1.5">
          <h3
            id={`course-card-title-${course.id}`}
            className="text-lg font-bold leading-snug text-foreground transition-colors group-hover:text-primary-indigo"
          >
            {course.title}
          </h3>
          <p className="line-clamp-2 text-sm text-muted-foreground">{course.shortDescription}</p>
        </div>

        <div className="grid grid-cols-2 gap-3 border-t border-border/50 pt-3 text-sm">
          <motion.div className="flex items-center gap-2" whileHover={{ x: 2 }}>
            <Clock className="h-4 w-4 shrink-0 text-muted-foreground" aria-hidden />
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">Duration</p>
              <p className="font-semibold text-foreground">{course.durationHours} hrs</p>
            </div>
          </motion.div>
          <motion.div className="flex items-center gap-2" whileHover={{ x: 2 }}>
            <BookOpen className="h-4 w-4 shrink-0 text-muted-foreground" aria-hidden />
            <motion.div>
              <p className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">Level</p>
              <p className="font-semibold text-foreground">{course.ncLevel}</p>
            </motion.div>
          </motion.div>
        </div>

        <div className="mt-auto pt-1">
          {hasActiveEnrollment ? (
            <motion.div
              className="flex min-h-11 items-center justify-center gap-2 rounded-xl border border-border bg-muted px-3 text-[11px] font-bold uppercase tracking-widest text-muted-foreground cursor-not-allowed"
              aria-disabled="true"
              role="status"
            >
              Enrollment locked
              <Lock className="h-3.5 w-3.5 shrink-0" aria-hidden />
            </motion.div>
          ) : canSelect ? (
            <Link href={`/trainee/enroll?course=${course.slug}`} className="block">
              <motion.button
                type="button"
                aria-label={`Start application for ${course.title}`}
                className="flex min-h-11 h-11 w-full items-center justify-center gap-2 rounded-xl bg-primary text-[11px] font-bold uppercase tracking-widest text-primary-foreground transition-colors hover:bg-primary-indigo active:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 cursor-pointer touch-target"
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
              >
                Start application
                <ArrowRight className="h-4 w-4 shrink-0" aria-hidden />
              </motion.button>
            </Link>
          ) : !applicationFormComplete ? (
            <Link href="/trainee/register" className="block">
              <motion.button
                type="button"
                aria-label={`Complete TESDA registration to apply for ${course.title}`}
                className="flex min-h-11 h-11 w-full items-center justify-center gap-2 rounded-xl border border-primary-indigo/25 bg-primary-indigo/10 text-[11px] font-bold uppercase tracking-widest text-primary-indigo transition-colors hover:bg-primary-indigo/15 active:bg-primary-indigo/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 cursor-pointer touch-target"
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
              >
                Complete TESDA form
                <FileText className="h-3.5 w-3.5 shrink-0" aria-hidden />
              </motion.button>
            </Link>
          ) : (
            <motion.div
              className="flex min-h-11 items-center justify-center gap-2 rounded-xl border border-border bg-muted px-3 text-[11px] font-bold uppercase tracking-widest text-muted-foreground cursor-not-allowed"
              aria-disabled="true"
              role="status"
            >
              Waitlisted
              <Lock className="h-3.5 w-3.5 shrink-0" aria-hidden />
            </motion.div>
          )}
        </div>
      </div>
    </motion.article>
  );
}
