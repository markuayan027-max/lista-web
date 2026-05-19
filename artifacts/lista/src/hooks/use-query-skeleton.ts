import type { UseQueryResult } from "@tanstack/react-query";

export type QuerySkeletonPhase =
  | "idle"
  | "loading"
  | "fetching"
  | "revalidating"
  | "ready";

type QueryLike = Pick<
  UseQueryResult<unknown>,
  | "isLoading"
  | "isFetching"
  | "isPending"
  | "isPlaceholderData"
  | "status"
  | "fetchStatus"
  | "data"
>;

/** Maps TanStack Query state to skeleton phases (Graphify / InsForge fetch aware). */
export function getQuerySkeletonPhase(query: QueryLike): QuerySkeletonPhase {
  if (query.isLoading || query.isPending) return "loading";
  if (query.isFetching && !query.data) return "fetching";
  if (query.isFetching && query.isPlaceholderData) return "revalidating";
  if (query.isFetching) return "revalidating";
  if (query.status === "success") return "ready";
  return "idle";
}

export function shouldShowQuerySkeleton(query: QueryLike): boolean {
  const phase = getQuerySkeletonPhase(query);
  return phase === "loading" || phase === "fetching";
}

export function shouldShowRefetchOverlay(query: QueryLike): boolean {
  return getQuerySkeletonPhase(query) === "revalidating";
}

export function useQuerySkeleton(query: QueryLike) {
  const phase = getQuerySkeletonPhase(query);
  return {
    phase,
    showSkeleton: phase === "loading" || phase === "fetching",
    showRefetchOverlay: phase === "revalidating",
    isReady: phase === "ready",
  };
}
