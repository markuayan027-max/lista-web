import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

type Status = "pending" | "confirmed" | "rejected" | "issued" | "in_progress" | "cancelled";

/** DB enum uses Pascal case; legacy rows may use other labels. */
function normalizeStatus(raw: string): Status {
  const key = raw.trim().toLowerCase().replace(/\s+/g, "_");
  const aliases: Record<string, Status> = {
    pending: "pending",
    confirmed: "confirmed",
    rejected: "rejected",
    issued: "issued",
    in_progress: "in_progress",
    cancelled: "cancelled",
    waitlisted: "pending",
    review: "pending",
    interview: "in_progress",
    enrolled: "confirmed",
    completed: "issued",
    ready_to_apply: "pending",
  };
  return aliases[key] ?? "pending";
}

interface StatusBadgeProps {
  status: Status | string;
  className?: string;
}

const statusConfig: Record<Status, { label: string; className: string }> = {
  pending: {
    label: "Pending",
    className: "bg-amber-100 text-amber-700 hover:bg-amber-100 border-amber-200",
  },
  confirmed: {
    label: "Confirmed",
    className: "bg-emerald-100 text-emerald-700 hover:bg-emerald-100 border-emerald-200",
  },
  issued: {
    label: "Issued",
    className: "bg-emerald-100 text-emerald-700 hover:bg-emerald-100 border-emerald-200",
  },
  rejected: {
    label: "Rejected",
    className: "bg-rose-100 text-rose-700 hover:bg-rose-100 border-rose-200",
  },
  in_progress: {
    label: "In Progress",
    className: "bg-blue-100 text-blue-700 hover:bg-blue-100 border-blue-200",
  },
  cancelled: {
    label: "Cancelled",
    className: "bg-slate-100 text-slate-700 hover:bg-slate-100 border-slate-200",
  },
};

export default function StatusBadge({ status, className }: StatusBadgeProps) {
  const normalized =
    typeof status === "string" && !(status in statusConfig)
      ? normalizeStatus(status)
      : (status as Status);
  const config = statusConfig[normalized] ?? statusConfig.pending;

  return (
    <Badge
      variant="outline"
      className={cn("px-2.5 py-0.5 font-medium transition-colors", config.className, className)}
    >
      {config.label}
    </Badge>
  );
}
