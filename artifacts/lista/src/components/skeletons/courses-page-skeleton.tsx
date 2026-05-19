import { Skeleton } from "@/components/ui/skeleton";
import { CourseGridSkeleton } from "@/components/skeletons/course-grid-skeleton";

export function CoursesPageSkeleton({ message = "Loading programs…" }: { message?: string }) {
  return (
    <div className="w-full bg-white min-h-[calc(100vh-80px)]" aria-busy="true" aria-live="polite">
      <section className="border-b border-slate-100 pt-14 pb-10">
        <div className="container mx-auto px-6 md:px-8">
          <Skeleton className="h-10 w-48 mb-4 max-w-full" />
          <p className="text-sm font-semibold text-primary/80 animate-pulse mb-3">{message}</p>
          <Skeleton className="h-4 w-full max-w-xl mb-8" />
          <div className="flex flex-col sm:flex-row gap-3">
            <Skeleton className="h-10 w-full sm:max-w-xs shrink-0 rounded-md" />
            <div className="flex gap-2 flex-1 overflow-hidden">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-10 w-24 shrink-0 rounded-md" />
              ))}
            </div>
          </div>
        </div>
      </section>
      <div className="bg-emerald-50/80 border-b border-emerald-100">
        <div className="container mx-auto px-6 md:px-8 py-4">
          <Skeleton className="h-12 w-full max-w-2xl" />
        </div>
      </div>
      <section className="py-12">
        <div className="container mx-auto px-6 md:px-8">
          <CourseGridSkeleton count={8} />
        </div>
      </section>
    </div>
  );
}
