import { normalizeEnrollmentStatus } from "@/lib/enrollment-status";
import type { Enrollment } from "@/lib/institutional-data";

export type StatusAction = {
  id: string;
  label: string;
  status: Enrollment["status"];
  variant?: "default" | "destructive" | "outline";
};

/** Contextual status transitions staff/admin may apply from the detail sheet or menu. */
export function getEnrollmentStatusActions(status: string | undefined): StatusAction[] {
  const s = normalizeEnrollmentStatus(status);

  if (s === "pending") {
    return [
      { id: "confirm", label: "Approve application", status: "confirmed" },
      { id: "review", label: "Move to document review", status: "review", variant: "outline" },
      { id: "reject", label: "Reject", status: "rejected", variant: "destructive" },
    ];
  }
  if (s === "review") {
    return [
      { id: "confirm", label: "Confirm applicant", status: "confirmed" },
      { id: "interview", label: "Schedule interview", status: "interview", variant: "outline" },
      { id: "reject", label: "Reject", status: "rejected", variant: "destructive" },
    ];
  }
  if (s === "interview") {
    return [
      { id: "for_assessment", label: "Ready for competency assessment", status: "for_assessment" },
      { id: "confirm", label: "Confirm (skip interview)", status: "confirmed", variant: "outline" },
      { id: "reject", label: "Reject", status: "rejected", variant: "destructive" },
    ];
  }
  if (s === "for_assessment") {
    return [
      { id: "assessment_scheduled", label: "Assessment scheduled", status: "assessment_scheduled" },
      { id: "reject", label: "Reject", status: "rejected", variant: "destructive" },
    ];
  }
  if (s === "assessment_scheduled") {
    return [
      { id: "enrolled", label: "Passed — enroll in training", status: "enrolled" },
      {
        id: "assessment_failed",
        label: "Assessment not passed",
        status: "assessment_failed",
        variant: "destructive",
      },
    ];
  }
  if (s === "assessment_failed") {
    return [
      { id: "for_assessment", label: "Schedule reassessment", status: "for_assessment", variant: "outline" },
      { id: "reject", label: "Close application", status: "rejected", variant: "destructive" },
    ];
  }
  if (s === "confirmed") {
    return [{ id: "enrolled", label: "Mark enrolled in training", status: "enrolled" }];
  }
  if (s === "enrolled") {
    return [{ id: "completed", label: "Mark training completed", status: "completed" }];
  }
  if (s === "waitlisted") {
    return [
      { id: "pending", label: "Return to pending queue", status: "pending", variant: "outline" },
      { id: "reject", label: "Reject", status: "rejected", variant: "destructive" },
    ];
  }
  return [];
}
