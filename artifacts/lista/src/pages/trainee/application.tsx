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
  ChevronRight,
  Home,
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
import { enrollmentBlocksNewCourseApplication } from "@/lib/enrollment-status";
import { useCourseBatches } from "@/hooks/use-lista-data";

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
  const { data: courseBatches = [] } = useCourseBatches();

  const profile = useMemo(
    () => mergeTraineeProfileSources(userEnrollment, user?.id),
    [userEnrollment],
  );
  const applicationFormComplete = isTraineeApplicationFormComplete(profile);

  const hasActiveEnrollment =
    Boolean(userEnrollment) && enrollmentBlocksNewCourseApplication(userEnrollment?.status);

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
      <main
        className="max-w-lg mx-auto py-16 sm:py-20 px-4 sm:px-6 text-center space-y-4"
        role="alert"
        aria-live="assertive"
      >
        <AlertCircle className="h-12 w-12 text-destructive mx-auto" aria-hidden />
        <h2 className="text-xl sm:text-2xl font-black text-foreground">Could not load courses</h2>
        <p className="text-sm text-muted-foreground max-w-md mx-auto">
          {(coursesErrorDetail as Error)?.message ||
            "The course catalog did not respond. Check your internet connection, then try loading again."}
        </p>
        <Button
          type="button"
          onClick={() => refetch()}
          className="gap-2 touch-target focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 cursor-pointer"
        >
          <RefreshCw className="h-4 w-4 shrink-0" aria-hidden />
          Reload course catalog
        </Button>
      </main>
    );
  }

  return (
    <motion.main className="space-y-8 sm:space-y-10 max-w-6xl mx-auto pb-16 sm:pb-20 px-4 sm:px-6 lg:px-0">
      <nav aria-label="Breadcrumb" className="text-sm text-muted-foreground">
        <ol className="flex flex-wrap items-center gap-1.5">
          <li>
            <Link
              href="/trainee"
              className="inline-flex items-center gap-1 rounded-md font-medium transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            >
              <Home className="h-3.5 w-3.5 shrink-0" aria-hidden />
              Dashboard
            </Link>
          </li>
          <li aria-hidden className="opacity-50">
            /
          </li>
          <li>
            <span className="font-semibold text-foreground" aria-current="page">
              Available courses
            </span>
          </li>
        </ol>
      </nav>

      <motion.header
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-2"
      >
        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black tracking-tight text-foreground">
          Available Courses
        </h1>
        <p className="text-muted-foreground font-medium text-base sm:text-lg max-w-2xl">
          Select a program to begin your TESDA certification journey.
        </p>
      </motion.header>

      {enrollmentLoading && (
        <p
          className="text-xs font-semibold text-muted-foreground animate-pulse"
          role="status"
          aria-live="polite"
        >
          Checking your application status…
        </p>
      )}

      {!enrollmentLoading && !applicationFormComplete && (
        <motion.section
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          aria-labelledby="tesda-form-required-heading"
          className="bg-primary-indigo/10 border border-primary-indigo/20 rounded-2xl p-5 sm:p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-sm"
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
            className="inline-flex shrink-0 items-center justify-center gap-2 min-h-11 touch-target bg-primary-indigo hover:bg-primary-indigo/90 active:bg-primary-indigo/95 text-primary-foreground px-5 sm:px-6 py-3 rounded-xl text-[11px] font-black uppercase tracking-widest transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 cursor-pointer"
          >
            Continue registration
            <ChevronRight className="h-4 w-4 shrink-0" aria-hidden />
          </Link>
        </motion.section>
      )}

      {courses.length > 0 && (
        <section aria-label="Course catalog filters" className="space-y-4">
          <motion.div
            className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <p
              id="course-catalog-results-status"
              className="text-sm text-muted-foreground"
              role="status"
              aria-live="polite"
            >
              Showing <span className="font-semibold text-foreground">{filteredCourses.length}</span> of{" "}
              <span className="font-semibold text-foreground">{courses.length}</span> programs
            </p>
          </motion.div>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-stretch">
            <div className="relative w-full sm:max-w-sm">
              <Search
                className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground pointer-events-none"
                aria-hidden
              />
              <Input
                type="search"
                placeholder="Search by name, sector, or NC level…"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="h-11 min-h-11 pl-9 focus-visible:ring-2 focus-visible:ring-ring"
                aria-label="Search courses"
                aria-describedby="course-catalog-results-status"
              />
            </div>
            <motion.div
              role="group"
              aria-label="Filter by training sector"
              className="flex gap-2 overflow-x-auto pb-1 -mx-1 px-1 snap-x snap-mandatory [&::-webkit-scrollbar]:h-1.5 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-border"
            >
              {categories.map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setSelectedCategory(cat)}
                  aria-pressed={selectedCategory === cat}
                  className={cn(
                    "shrink-0 snap-start rounded-full border px-4 py-2.5 min-h-11 text-xs font-semibold transition-colors touch-target cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
                    selectedCategory === cat
                      ? "border-primary bg-primary text-primary-foreground shadow-sm"
                      : "border-border bg-card text-muted-foreground hover:border-primary-indigo/40 hover:bg-muted/50 active:bg-muted",
                  )}
                >
                  {cat}
                </button>
              ))}
            </motion.div>
          </div>
        </section>
      )}

      {hasActiveEnrollment && (
        <motion.section
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          role="alert"
          aria-live="polite"
          className="bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-2xl p-5 sm:p-6 flex items-start gap-4 shadow-sm"
        >
          <Lock className="w-6 h-6 text-amber-500 mt-1 shrink-0" aria-hidden />
          <div>
            <h3 className="text-amber-900 font-bold text-lg">Course still in progress</h3>
            <p className="text-amber-800 dark:text-amber-200/90 text-sm mt-1 leading-relaxed">
              Only one active program at a time. Once staff marks this course completed—or the enrollment is
              cancelled or rejected—you can apply to a new batch. Track progress in{" "}
              <Link
                href="/trainee/tracking"
                className="font-semibold underline underline-offset-2 hover:text-amber-950 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-600 rounded-sm"
              >
                My Applications
              </Link>
              .
            </p>
          </div>
        </motion.section>
      )}

      {courses.length === 0 ? (
        <motion.section
          role="status"
          className="flex flex-col items-center justify-center py-16 sm:py-20 bg-muted/50 rounded-2xl sm:rounded-[2.5rem] border-2 border-dashed border-border text-center px-6"
        >
          <BookOpen className="h-12 w-12 text-muted-foreground/50 mb-4" aria-hidden />
          <h2 className="text-lg font-bold text-foreground">No programs published yet</h2>
          <p className="mt-2 max-w-md text-sm text-muted-foreground leading-relaxed">
            LISTA has not published any open programs yet. Reload the catalog or contact the registrar for
            assistance.
          </p>
          <Button
            type="button"
            variant="outline"
            className="mt-4 gap-2 touch-target cursor-pointer focus-visible:ring-2 focus-visible:ring-ring"
            onClick={() => refetch()}
          >
            <RefreshCw className="h-4 w-4 shrink-0" aria-hidden />
            Reload catalog
          </Button>
        </motion.section>
      ) : filteredCourses.length === 0 ? (
        <motion.section
          role="status"
          className="flex flex-col items-center justify-center rounded-2xl border border-border bg-card px-6 py-14 sm:py-16 text-center"
        >
          <Search className="mb-3 h-8 w-8 text-muted-foreground/50" aria-hidden />
          <h2 className="font-bold text-foreground">No programs match your filters</h2>
          <p className="mt-1 text-sm text-muted-foreground max-w-sm">
            Try a different keyword or sector, or clear filters to see all programs.
          </p>
          {hasActiveFilters && (
            <Button
              type="button"
              variant="link"
              className="mt-4 touch-target cursor-pointer"
              onClick={clearFilters}
            >
              Clear all filters
            </Button>
          )}
        </motion.section>
      ) : (
        <motion.section
          variants={container}
          initial="hidden"
          animate="show"
          aria-label="Course catalog"
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6"
        >
          {filteredCourses.map((course) => {
            const batchHasSeat = courseBatches.some(
              (b) =>
                b.courseSlug === course.slug &&
                b.status === "open" &&
                Number(b.seatsTaken) < Number(b.capacity),
            );
            const hasSlots = isCourseOpenForEnrollment(course) && batchHasSeat;
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
        </motion.section>
      )}
    </motion.main>
  );
}
