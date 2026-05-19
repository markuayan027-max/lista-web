import type { UseQueryResult } from "@tanstack/react-query";
import { cn } from "@/lib/utils";
import { ContentFadeIn } from "@/components/skeletons/primitives";
import {
  shouldShowQuerySkeleton,
  shouldShowRefetchOverlay,
} from "@/hooks/use-query-skeleton";

type QueryBoundaryProps<T> = {
  query: Pick<
    UseQueryResult<T>,
    | "isLoading"
    | "isFetching"
    | "isPending"
    | "isPlaceholderData"
    | "status"
    | "fetchStatus"
    | "data"
  >;
  skeleton: React.ReactNode;
  children: React.ReactNode;
  className?: string;
  minHeight?: string;
  /** Keep layout shell visible during background refetch */
  preserveOnRefetch?: boolean;
};

export function QueryBoundary<T>({
  query,
  skeleton,
  children,
  className,
  minHeight,
  preserveOnRefetch = true,
}: QueryBoundaryProps<T>) {
  const showSkeleton = shouldShowQuerySkeleton(query);
  const showOverlay = preserveOnRefetch && shouldShowRefetchOverlay(query);

  if (showSkeleton) {
    return (
      <div
        className={cn("w-full", className)}
        style={minHeight ? { minHeight } : undefined}
        aria-busy="true"
        aria-live="polite"
      >
        {skeleton}
      </div>
    );
  }

  return (
    <div
      className={cn("relative w-full", className)}
      style={minHeight ? { minHeight } : undefined}
    >
      <ContentFadeIn>{children}</ContentFadeIn>
      {showOverlay ? (
        <div
          className="pointer-events-none absolute inset-0 z-10 rounded-[inherit] bg-background/40 backdrop-blur-[1px] animate-pulse"
          aria-hidden
        />
      ) : null}
    </div>
  );
}

/** Lightweight wrapper when you only have a boolean loading flag. */
export function SkeletonGate({
  loading,
  skeleton,
  children,
  className,
}: {
  loading: boolean;
  skeleton: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}) {
  if (loading) {
    return (
      <div className={cn("w-full", className)} aria-busy="true">
        {skeleton}
      </div>
    );
  }
  return <ContentFadeIn className={className}>{children}</ContentFadeIn>;
}
