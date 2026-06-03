import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { enrollmentStatusLabel, type EnrollmentStatusId } from "@/lib/enrollment-domain";
import { normalizeEnrollmentStatus } from "@/lib/enrollment-status";

type VisualTone = "pending" | "confirmed" | "rejected" | "issued" | "in_progress" | "cancelled" | "revoked";

const toneConfig: Record<VisualTone, { className: string }> = {
  pending: {
    className: "bg-amber-100 text-amber-800 hover:bg-amber-100 border-amber-200",
  },
  confirmed: {
    className: "bg-emerald-100 text-emerald-800 hover:bg-emerald-100 border-emerald-200",
  },
  issued: {
    className: "bg-emerald-100 text-emerald-800 hover:bg-emerald-100 border-emerald-200",
  },
  rejected: {
    className: "bg-rose-100 text-rose-800 hover:bg-rose-100 border-rose-200",
  },
  in_progress: {
    className: "bg-blue-100 text-blue-800 hover:bg-blue-100 border-blue-200",
  },
  revoked: {
    className: "bg-rose-100 text-rose-800 hover:bg-rose-100 border-rose-200",
  },
  cancelled: {
    className: "bg-slate-100 text-slate-800 hover:bg-slate-100 border-slate-200",
  },
};

function toneForStatus(normalized: string): VisualTone {
  const map: Record<string, VisualTone> = {
    pending: "pending",
    confirmed: "confirmed",
    rejected: "rejected",
    issued: "issued",
    in_progress: "in_progress",
    cancelled: "cancelled",
    revoked: "revoked",
    waitlisted: "pending",
    review: "in_progress",
    interview: "in_progress",
    for_assessment: "in_progress",
    assessment_scheduled: "in_progress",
    assessment_failed: "rejected",
    enrolled: "confirmed",
    completed: "issued",
    ready_to_apply: "pending",
  };
  return map[normalized] ?? "pending";
}

interface StatusBadgeProps {
  status: string;
  className?: string;
}

export default function StatusBadge({ status, className }: StatusBadgeProps) {
  const normalized = normalizeEnrollmentStatus(status);
  const tone = toneForStatus(normalized);
  const label = enrollmentStatusLabel(status);
  const config = toneConfig[tone];

  return (
    <Badge
      variant="outline"
      className={cn("px-2.5 py-0.5 font-medium transition-colors", config.className, className)}
      title={label}
    >
      <span className="sr-only">Status: </span>
      {label}
    </Badge>
  );
}

export type { EnrollmentStatusId };
