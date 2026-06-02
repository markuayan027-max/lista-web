import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

export function CourseCardSkeleton({
  className,
  compact = false,
}: {
  className?: string;
  compact?: boolean;
}) {
  return (
    <div
      className={cn(
        "rounded-xl border border-border bg-card overflow-hidden h-full flex flex-col",
        className,
      )}
    >
      <Skeleton className={cn("w-full rounded-none shrink-0", compact ? "aspect-[3/2]" : "aspect-[16/10]")} />
      <div className={cn("flex flex-1 flex-col", compact ? "gap-2 p-4" : "gap-3 p-5")}>
        <Skeleton className="h-4 w-14 rounded-full" />
        <Skeleton className={cn("w-11/12", compact ? "h-4" : "h-5")} />
        <Skeleton className="h-3 w-full" />
        {!compact ? <Skeleton className="h-3 w-2/3" /> : null}
        <div className="mt-auto flex items-center justify-between border-t border-border pt-3">
          <Skeleton className="h-6 w-24 rounded-full" />
          <Skeleton className="h-3 w-12" />
        </div>
      </div>
    </div>
  );
}

export const COURSE_LISTING_GRID_CLASS =
  "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-5";

export function CourseGridSkeleton({
  count = 8,
  columns = COURSE_LISTING_GRID_CLASS,
  compact = false,
  className,
}: {
  count?: number;
  columns?: string;
  compact?: boolean;
  className?: string;
}) {
  return (
    <div className={cn("grid", columns, className)}>
      {Array.from({ length: count }).map((_, i) => (
        <CourseCardSkeleton key={i} compact={compact} />
      ))}
    </div>
  );
}

/** Width classes aligned with home program carousel slides. */
export const COURSE_CAROUSEL_SLIDE_CLASS =
  "snap-start shrink-0 w-[min(17.5rem,calc(100vw-2.5rem))] sm:w-[min(18.5rem,42vw)] md:w-auto";

export function CourseCarouselSkeleton({ count = 4 }: { count?: number }) {
  return (
    <div className="flex gap-4 overflow-hidden pb-2 sm:gap-5 md:grid md:grid-cols-2 md:gap-6 lg:grid-cols-3 xl:grid-cols-4 md:overflow-visible">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className={COURSE_CAROUSEL_SLIDE_CLASS}>
          <CourseCardSkeleton compact />
        </div>
      ))}
    </div>
  );
}
