import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

type Status = "pending" | "confirmed" | "rejected" | "issued" | "in_progress";

interface StatusBadgeProps {
  status: Status;
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
};

export default function StatusBadge({ status, className }: StatusBadgeProps) {
  const config = statusConfig[status];

  return (
    <Badge
      variant="outline"
      className={cn("px-2.5 py-0.5 font-medium transition-colors", config.className, className)}
    >
      {config.label}
    </Badge>
  );
}
