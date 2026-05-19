import { Skeleton } from "@/components/ui/skeleton";

export function ApplicationCardsSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="rounded-[2.5rem] border-2 border-gray-100 bg-white p-8 space-y-6 h-full min-h-[280px]"
        >
          <div className="flex justify-between">
            <Skeleton className="h-6 w-24 rounded-full" />
            <Skeleton className="h-6 w-16 rounded-full" />
          </div>
          <Skeleton className="h-7 w-4/5" />
          <Skeleton className="h-4 w-full" />
          <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-50">
            <Skeleton className="h-12 w-full rounded-xl" />
            <Skeleton className="h-12 w-full rounded-xl" />
          </div>
          <Skeleton className="h-12 w-full rounded-2xl mt-2" />
        </div>
      ))}
    </div>
  );
}

export function ApplicationPageSkeleton({ message = "Loading courses…" }: { message?: string }) {
  return (
    <div className="space-y-10 max-w-6xl mx-auto pb-20" aria-busy="true" aria-live="polite">
      <div className="space-y-2">
        <Skeleton className="h-10 w-72 max-w-full" />
        <Skeleton className="h-5 w-96 max-w-full" />
        <p className="text-sm font-semibold text-primary-indigo/80 animate-pulse pt-1">{message}</p>
      </div>
      <ApplicationCardsSkeleton count={6} />
    </div>
  );
}
