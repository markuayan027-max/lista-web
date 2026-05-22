import { formatNcLevel } from "@/lib/format-nc-level";
import { cn } from "@/lib/utils";

export function NcLevelBadge({
  level,
  className,
}: {
  level: string | null | undefined;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-lg border border-slate-200 bg-slate-100 px-2.5 py-1",
        "text-xs sm:text-sm font-bold uppercase tracking-wide text-slate-800",
        className,
      )}
    >
      {formatNcLevel(level)}
    </span>
  );
}
