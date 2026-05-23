import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

/** Matches compact course carousel card proportions on home. */
export function NewsCardSkeleton({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "flex flex-col overflow-hidden rounded-xl border border-border bg-card",
        className,
      )}
    >
      <Skeleton className="aspect-[3/2] w-full rounded-none" />
      <div className="flex flex-1 flex-col gap-3 p-4">
        <div className="flex items-center gap-2">
          <Skeleton className="h-5 w-20 rounded-full" />
          <Skeleton className="h-3 w-16" />
        </div>
        <Skeleton className="h-5 w-full" />
        <Skeleton className="h-3 w-full" />
        <Skeleton className="h-3 w-4/5" />
        <div className="mt-auto flex items-center justify-between border-t border-border pt-4">
          <Skeleton className="h-8 w-28 rounded-lg" />
          <Skeleton className="h-4 w-16" />
        </div>
      </div>
    </div>
  );
}

export function TestimonialCardSkeleton({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "flex flex-col rounded-xl border border-border bg-muted/40 p-6",
        className,
      )}
    >
      <Skeleton className="mb-4 h-8 w-6 rounded-sm" />
      <div className="space-y-2 flex-1">
        <Skeleton className="h-3 w-full" />
        <Skeleton className="h-3 w-full" />
        <Skeleton className="h-3 w-11/12" />
      </div>
      <div className="mt-6 flex items-center gap-3 border-t border-border pt-5">
        <Skeleton className="h-11 w-11 rounded-full" />
        <div className="space-y-2 flex-1">
          <Skeleton className="h-4 w-28" />
          <Skeleton className="h-3 w-20" />
        </div>
      </div>
    </div>
  );
}
