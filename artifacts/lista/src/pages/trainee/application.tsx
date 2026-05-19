import { useAuth } from "@/context/auth-context";
import { motion } from "framer-motion";
import { useCourses, useTraineeProfile } from "@/hooks/use-lista-data";
import { isCourseOpenForEnrollment } from "@/lib/public-data-utils";
import {
  BookOpen,
  Lock,
  FileText,
  RefreshCw,
  AlertCircle,
  Search,
  CheckCircle2,
  Circle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ApplicationCourseCard } from "@/components/trainee/application-course-card";
import { useCourseCatalogFilters } from "@/hooks/use-course-catalog-filters";
import { useQuerySkeleton } from "@/hooks/use-query-skeleton";
import { Link } from "wouter";
import { cn } from "@/lib/utils";
import { useMemo, useState } from "react";
import type { Enrollment } from "@/lib/institutional-data";
import { ApplicationPageSkeleton } from "@/components/skeletons";
import {
  isTraineeApplicationFormComplete,
  mergeTraineeProfileSources,
} from "@/lib/profile-utils";

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.1 },
  },
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { type: "spring" as const, stiffness: 300, damping: 24 } },
};

export default function TraineeApplicationPage() {
  const { user } = useAuth();
  const coursesQuery = useCourses();
  const { data: courses = [], isError: coursesError, error: coursesErrorDetail, refetch } =
    coursesQuery;
  const { showSkeleton: coursesLoading } = useQuerySkeleton(coursesQuery);
  const profileQuery = useTraineeProfile(user?.email);
  const userEnrollment = (profileQuery.data as Enrollment | null) ?? null;
  const enrollmentLoading = profileQuery.isLoading;

  const profile = useMemo(
    () => mergeTraineeProfileSources(userEnrollment, user?.id),
    [userEnrollment],
  );
  const applicationFormComplete = isTraineeApplicationFormComplete(profile);

  const hasActiveEnrollment =
    userEnrollment &&
    !["completed", "cancelled", "rejected", "ready_to_apply"].includes(
      userEnrollment.status.toLowerCase(),
    );

  const canApplyToCourse = applicationFormComplete && !hasActiveEnrollment;

  const {
    searchQuery,
    setSearchQuery,
    selectedCategory,
    setSelectedCategory,
    categories,
    filteredCourses,
    clearFilters,
    hasActiveFilters,
  } = useCourseCatalogFilters(courses);

  if (coursesLoading) {
    return <ApplicationPageSkeleton message="Loading courses from LISTA…" />;
  }

  if (coursesError) {
    return (
      <div className="max-w-lg mx-auto py-20 px-6 text-center space-y-4">
        <AlertCircle className="h-12 w-12 text-destructive mx-auto" aria-hidden />
        <h2 className="text-xl font-black text-foreground">Could not load courses</h2>
        <p className="text-sm text-muted-foreground">
          {(coursesErrorDetail as Error)?.message ||
            "The course catalog did not respond. Check your connection and try again."}
        </p>
        <Button type="button" onClick={() => refetch()} className="gap-2">
          <RefreshCw className="h-4 w-4" />
          Retry
        </Button>
      </div>
    );
  }

  return (
    <motion.div className="space-y-10 max-w-6xl mx-auto pb-20">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-2"
      >
        <h1 className="text-4xl font-black tracking-tight text-foreground">Available Courses</h1>
        <p className="text-muted-foreground font-medium text-lg">
          Select a program to begin your TESDA certification journey.
        </p>
      </motion.div>

      {enrollmentLoading && (
        <p className="text-xs font-semibold text-muted-foreground animate-pulse" role="status">
          Checking your application status…
        </p>
      )}

      {!enrollmentLoading && !applicationFormComplete && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-primary-indigo/10 border border-primary-indigo/20 rounded-2xl p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
        >
          <div className="flex items-start gap-4">
            <FileText className="w-6 h-6 text-primary-indigo mt-1 shrink-0" />
            <div>
              <h2
                id="tesda-form-required-heading"
                className="text-lg font-bold text-foreground sm:text-xl"
              >
                Finish your TESDA learner profile before you apply
              </h2>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                Course applications stay locked until your official registration is complete — usually 10–15
                minutes. Complete all steps and accept the privacy consent, then return here.
              </p>
              <ol className="mt-4 space-y-2 text-sm text-foreground/90">
                <li className="flex items-start gap-2">
                  <Circle className="mt-0.5 h-4 w-4 shrink-0 text-primary-indigo" aria-hidden />
                  <span>All four registration steps</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" aria-hidden />
                  <span>
                    <strong className="font-semibold">Apply now</strong> unlocks on this page
                  </span>
                </li>
              </ol>
            </div>
          </div>
          <Link
            href="/trainee/register"
            className="shrink-0 bg-primary-indigo hover:bg-primary-indigo/90 text-primary-foreground px-6 py-3 rounded-xl text-[11px] font-black uppercase tracking-widest transition-colors"
          >
            Continue registration
          </Link>
        </motion.div>
      )}

      {courses.length > 0 && (
        <div className="space-y-4">
          <motion.div
            className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <p className="text-sm text-muted-foreground" role="status">
              Showing <span className="font-semibold text-foreground">{filteredCourses.length}</span> of{" "}
              <span className="font-semibold text-foreground">{courses.length}</span> programs
            </p>
          </motion.div>
          <div className="flex flex-col gap-3 sm:flex-row">
            <div className="relative w-full sm:max-w-sm">
              <Search
                className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
                aria-hidden
              />
              <Input
                type="search"
                placeholder="Search by name, sector, or NC level…"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="h-10 pl-9"
                aria-label="Search courses"
              />
            </div>
            <motion.div className="flex gap-2 overflow-x-auto pb-1 [&::-webkit-scrollbar]:hidden">
              {categories.map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setSelectedCategory(cat)}
                  className={cn(
                    "shrink-0 rounded-full border px-4 py-2 text-xs font-semibold transition-colors",
                    selectedCategory === cat
                      ? "border-primary bg-primary text-primary-foreground"
                      : "border-border bg-card text-muted-foreground hover:border-primary-indigo/40",
                  )}
                >
                  {cat}
                </button>
              ))}
            </motion.div>
          </div>
        </div>
      )}

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
              You currently have an active or pending enrollment. You must complete or cancel your current course
              before applying for a new one.
            </p>
          </div>
        </motion.div>
      )}

      {courses.length === 0 ? (
        <motion.div className="flex flex-col items-center justify-center py-20 bg-muted/50 rounded-[2.5rem] border-2 border-dashed border-border text-center px-6">
          <BookOpen className="h-12 w-12 text-muted-foreground/50 mb-4" />
          <h2 className="text-lg font-bold text-foreground">No programs published yet</h2>
          <p className="mt-2 max-w-md text-sm text-muted-foreground">
            LISTA has not published any open programs. Try again shortly or contact the registrar.
          </p>
          <Button type="button" variant="outline" className="mt-4 gap-2" onClick={() => refetch()}>
            <RefreshCw className="h-4 w-4" />
            Refresh catalog
          </Button>
        </motion.div>
      ) : filteredCourses.length === 0 ? (
        <motion.div className="flex flex-col items-center justify-center rounded-2xl border border-border bg-card px-6 py-16 text-center">
          <Search className="mb-3 h-8 w-8 text-muted-foreground/50" aria-hidden />
          <h2 className="font-bold text-foreground">No programs match your search</h2>
          <p className="mt-1 text-sm text-muted-foreground">Try another keyword or category.</p>
          {hasActiveFilters && (
            <Button type="button" variant="link" className="mt-4" onClick={clearFilters}>
              Clear filters
            </Button>
          )}
        </motion.div>
      ) : (
        <motion.div
          variants={container}
          initial="hidden"
          animate="show"
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {filteredCourses.map((course) => {
            const hasSlots = isCourseOpenForEnrollment(course);
            const canSelect = hasSlots && canApplyToCourse;

            return (
              <motion.div key={course.id} variants={item}>
                <ApplicationCourseCard
                  course={course}
                  hasSlots={hasSlots}
                  canSelect={canSelect}
                  applicationFormComplete={applicationFormComplete}
                  hasActiveEnrollment={Boolean(hasActiveEnrollment)}
                />
              </motion.div>
            );
          })}
        </motion.div>
      )}
    </motion.div>
  );
}
