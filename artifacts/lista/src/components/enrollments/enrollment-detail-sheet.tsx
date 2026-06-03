import { format } from "date-fns";
import { ExternalLink, FileText, Printer } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import StatusBadge from "@/components/status-badge";
import { enrollmentStatusIs } from "@/lib/enrollment-status";
import { getEnrollmentStatusActions } from "@/lib/enrollment-staff-actions";
import type { BatchPickerMode } from "@/components/batch-picker-dialog";
import type { Course } from "@/lib/institutional-data";
import type { Enrollment } from "@/lib/institutional-data";
import { cn } from "@/lib/utils";

type Props = {
  enrollment: Enrollment | null;
  courses: Course[];
  onClose: () => void;
  onPrint: (e: Enrollment) => void;
  onStatusChange: (id: string, status: Enrollment["status"]) => void;
  onMarkNcSent: (id: string) => void;
  onBatchAction: (enrollment: Enrollment, mode: BatchPickerMode) => void;
  statusUpdating?: boolean;
};

export default function EnrollmentDetailSheet({
  enrollment,
  courses,
  onClose,
  onPrint,
  onStatusChange,
  onMarkNcSent,
  onBatchAction,
  statusUpdating,
}: Props) {
  const open = Boolean(enrollment);
  const courseTitle = enrollment
    ? courses.find((c) => c.slug === enrollment.courseSlug)?.title
    : undefined;
  const statusActions = enrollment ? getEnrollmentStatusActions(enrollment.status) : [];
  const docs = enrollment?.documents ?? [];

  return (
    <Sheet open={open} onOpenChange={(next) => !next && onClose()}>
      <SheetContent className="w-full sm:max-w-md overflow-y-auto" aria-labelledby="enrollment-detail-title">
        {enrollment && (
          <div className="space-y-6 py-6">
            <SheetHeader>
              <div className="flex items-center gap-2 mb-2">
                <span className="text-xs font-bold text-muted-foreground uppercase">{enrollment.refNo}</span>
                <StatusBadge status={enrollment.status} />
              </div>
              <SheetTitle id="enrollment-detail-title" className="text-2xl">
                {enrollment.traineeName}
              </SheetTitle>
              <SheetDescription>{enrollment.traineeEmail}</SheetDescription>
            </SheetHeader>

            <div className="space-y-6">
              <div className="bg-muted/30 rounded-xl p-4 border border-card-border">
                <h4 className="text-sm font-semibold mb-3 text-muted-foreground uppercase tracking-wider">
                  Course details
                </h4>
                <p className="font-bold text-lg leading-tight mb-1">{courseTitle ?? enrollment.courseSlug}</p>
                {enrollment.batchCode && (
                  <p className="text-sm text-muted-foreground">Batch: {enrollment.batchCode}</p>
                )}
                <p className="text-sm text-muted-foreground mt-1">
                  Applied {format(new Date(enrollment.createdAt), "MMMM dd, yyyy")}
                </p>
              </div>

              <div>
                <h4 className="text-sm font-semibold mb-3 text-muted-foreground uppercase tracking-wider">
                  Submitted documents
                </h4>
                {docs.length === 0 ? (
                  <p className="text-sm text-muted-foreground" role="status">
                    No documents uploaded yet. Trainee can add files under Profile → Documents.
                  </p>
                ) : (
                  <ul className="space-y-2" role="list">
                    {docs.map((doc) => (
                      <li
                        key={doc.id ?? `${doc.type}-${doc.fileName}`}
                        className="flex items-center justify-between p-3 rounded-lg border border-card-border bg-card"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <FileText className="h-5 w-5 text-primary shrink-0" aria-hidden />
                          <span className="text-sm font-medium truncate">{doc.label ?? doc.fileName}</span>
                        </div>
                        {doc.fileUrl ? (
                          <Button variant="ghost" size="sm" className="h-8 shrink-0" asChild>
                            <a href={doc.fileUrl} target="_blank" rel="noopener noreferrer">
                              <ExternalLink className="h-4 w-4 mr-1" aria-hidden />
                              View
                            </a>
                          </Button>
                        ) : null}
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              {statusActions.length > 0 && (
                <div className="space-y-2 pt-2 border-t border-card-border">
                  <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Update status</p>
                  <div className="flex flex-col gap-2">
                    {statusActions.map((action) => (
                      <Button
                        key={action.id}
                        variant={action.variant ?? "default"}
                        size="sm"
                        disabled={statusUpdating}
                        className={cn(
                          action.variant === "default" &&
                            action.status === "confirmed" &&
                            "bg-emerald-600 hover:bg-emerald-700 text-white",
                        )}
                        onClick={() => onStatusChange(enrollment.id, action.status)}
                      >
                        {action.label}
                      </Button>
                    ))}
                  </div>
                </div>
              )}

              <div className="pt-2 border-t border-card-border">
                <Button
                  className="w-full gap-2 bg-primary hover:bg-primary/90 text-primary-foreground shadow-sm"
                  onClick={() => onPrint(enrollment)}
                >
                  <Printer className="h-4 w-4" aria-hidden />
                  TESDA form — print or download PDF
                </Button>
                <p className="mt-2 text-xs text-muted-foreground text-center">
                  Choose A4 or Long bond paper in the preview; adjust margins in your browser print dialog.
                </p>
              </div>

              <div className="pt-4 border-t border-card-border flex flex-col gap-2">
                <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Batch & certification</p>
                {(enrollmentStatusIs(enrollment.status, "waitlisted", "pending") || !enrollment.batchId) && (
                  <Button variant="outline" size="sm" onClick={() => onBatchAction(enrollment, "join")}>
                    Join open batch
                  </Button>
                )}
                {enrollment.batchId && (
                  <Button variant="outline" size="sm" onClick={() => onBatchAction(enrollment, "transfer")}>
                    Transfer batch
                  </Button>
                )}
                {enrollmentStatusIs(enrollment.status, "completed") && !enrollment.tesdaNcSentAt && (
                  <Button
                    size="sm"
                    className="bg-primary-indigo hover:bg-primary-indigo/90 text-primary-foreground"
                    onClick={() => onMarkNcSent(enrollment.id)}
                  >
                    Mark TESDA NC sent
                  </Button>
                )}
                {enrollment.tesdaNcSentAt && (
                  <p className="text-xs text-muted-foreground" role="status">
                    TESDA NC marked sent {format(new Date(enrollment.tesdaNcSentAt), "MMM d, yyyy")}. Trainee may
                    re-apply for another program.
                  </p>
                )}
              </div>
            </div>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}
