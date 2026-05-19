import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

export function CourseCardSkeleton({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "rounded-xl border border-slate-200 bg-white overflow-hidden h-full",
        className,
      )}
    >
      <Skeleton className="aspect-[16/10] w-full rounded-none" />
      <div className="p-4 space-y-3">
        <Skeleton className="h-3 w-16 rounded-full" />
        <Skeleton className="h-5 w-4/5" />
        <Skeleton className="h-3 w-full" />
        <Skeleton className="h-3 w-2/3" />
        <div className="flex justify-between pt-2">
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-4 w-14" />
        </div>
      </div>
    </div>
  );
}

export function CourseGridSkeleton({
  count = 8,
  columns = "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4",
  className,
}: {
  count?: number;
  columns?: string;
  className?: string;
}) {
  return (
    <div className={cn("grid gap-5", columns, className)}>
      {Array.from({ length: count }).map((_, i) => (
        <CourseCardSkeleton key={i} />
      ))}
    </div>
  );
}

export function CourseCarouselSkeleton({ count = 4 }: { count?: number }) {
  return (
    <div className="flex gap-6 overflow-hidden pb-2 md:grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="shrink-0 w-[85vw] md:w-auto">
          <CourseCardSkeleton />
        </div>
      ))}
    </div>
  );
}
