import { CheckCircle2, Circle, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  evaluateTesdaRequirements,
  type TesdaRequirementRow,
} from "@/lib/tesda-requirements";
import type { Enrollment, TraineeDocument } from "@/lib/institutional-data";

type Props = {
  profile: Partial<Enrollment> | null | undefined;
  documents?: TraineeDocument[];
  className?: string;
  /** Shown as page heading; defaults to a sensible title. */
  title?: string;
  compact?: boolean;
};

function RequirementRow({ row, compact }: { row: TesdaRequirementRow; compact?: boolean }) {
  const Icon = row.status === "complete" ? CheckCircle2 : row.status === "partial" ? AlertCircle : Circle;
  const iconClass =
    row.status === "complete"
      ? "text-emerald-600"
      : row.status === "partial"
        ? "text-amber-600"
        : "text-muted-foreground";

  return (
    <li
      className={cn(
        "flex gap-3 rounded-lg border border-border/60 bg-card/50",
        compact ? "p-2.5" : "p-3",
      )}
    >
      <Icon className={cn("h-5 w-5 shrink-0 mt-0.5", iconClass)} aria-hidden />
      <div className="min-w-0">
        <p className={cn("font-medium text-foreground", compact && "text-sm")}>{row.label}</p>
        <p className={cn("text-muted-foreground", compact ? "text-xs" : "text-sm")}>{row.description}</p>
        <span className="sr-only">
          {row.status === "complete" ? "Complete" : row.status === "partial" ? "Partially complete" : "Not yet complete"}
        </span>
      </div>
    </li>
  );
}

export default function TesdaRequirementsChecklist({
  profile,
  documents,
  className,
  title = "TESDA registration requirements",
  compact = false,
}: Props) {
  const { rows, completeCount, total } = evaluateTesdaRequirements(profile, documents);
  const pct = total > 0 ? Math.round((completeCount / total) * 100) : 0;

  return (
    <section
      className={cn("space-y-3", className)}
      aria-labelledby="tesda-requirements-heading"
    >
      <div className="flex flex-wrap items-end justify-between gap-2">
        <div>
          <h2 id="tesda-requirements-heading" className={cn("font-bold tracking-tight", compact ? "text-base" : "text-lg")}>
            {title}
          </h2>
          <p className="text-sm text-muted-foreground mt-0.5">
            Typical documents and profile fields for TESDA-aligned enrollment in the Philippines.
          </p>
        </div>
        <p className="text-sm font-medium tabular-nums" aria-live="polite">
          {completeCount} of {total} complete ({pct}%)
        </p>
      </div>

      <ul className="space-y-2" role="list">
        {rows.map((row) => (
          <RequirementRow key={row.id} row={row} compact={compact} />
        ))}
      </ul>
    </section>
  );
}
