import { Skeleton } from "@/components/ui/skeleton";

export function ProfileSkeleton() {
  return (
    <div
      className="max-w-7xl mx-auto space-y-6 pb-16 px-4 sm:px-6"
      aria-busy="true"
      aria-label="Loading profile"
    >
      <div className="flex flex-col gap-4 pt-6 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
          <Skeleton className="h-16 w-16 shrink-0 rounded-full" />
          <div className="space-y-2 flex-1">
            <Skeleton className="h-7 w-48 max-w-full" />
            <Skeleton className="h-4 w-64 max-w-full" />
            <Skeleton className="h-3 w-40" />
          </div>
        </div>
        <div className="flex flex-col gap-2 w-full sm:w-auto sm:flex-row">
          <Skeleton className="h-11 w-full sm:w-44 rounded-xl" />
          <Skeleton className="h-11 w-full sm:w-36 rounded-xl" />
        </div>
      </div>
      <div className="flex gap-2 overflow-hidden border-b border-border pb-px">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-9 w-20 sm:w-24 shrink-0 rounded-md" />
        ))}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-8 space-y-4">
          <Skeleton className="h-5 w-40" />
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-[72px] w-full rounded-lg" />
            ))}
          </div>
        </div>
        <div className="lg:col-span-4 space-y-4">
          <Skeleton className="h-[220px] w-full rounded-2xl" />
          <Skeleton className="h-40 w-full rounded-xl" />
        </div>
      </div>
    </div>
  );
}
