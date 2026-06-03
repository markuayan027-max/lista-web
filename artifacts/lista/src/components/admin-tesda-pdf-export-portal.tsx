import { useMemo, useRef } from "react";
import type { Enrollment } from "@/lib/institutional-data";
import OfficialApplicationForm from "@/components/official-application-form";
import { downloadApplicationFormPdf } from "@/lib/download-tesda-pdf";
import { useCourses } from "@/hooks/use-lista-data";
import { courseTitleBySlug } from "@/lib/lista-insforge-data";
import { resolvePassportPhotoUrl } from "@/lib/official-form-field-map";
import { getOfficialFormFillWarnings } from "@/lib/fill-official-application-form";

/** Off-screen render + html2pdf for admin/staff export actions (PDF only). */
export default function AdminTesdaPdfExportPortal({
  enrollment,
  onDone,
}: {
  enrollment: Enrollment;
  onDone: (success: boolean) => void;
}) {
  const { data: courses = [] } = useCourses();
  const courseTitle = courseTitleBySlug(courses, enrollment.courseSlug) ?? "";
  const passportPhotoUrl = useMemo(
    () => resolvePassportPhotoUrl(enrollment, null),
    [enrollment],
  );
  const fillWarnings = useMemo(
    () => getOfficialFormFillWarnings({ enrollment, courseTitle, passportPhotoUrl }),
    [enrollment, courseTitle, passportPhotoUrl],
  );
  const started = useRef(false);

  const handleReady = async () => {
    if (started.current) return;
    started.current = true;
    try {
      const safeRef = (enrollment.refNo || "Application-Form").replace(/[^\w-]+/g, "_");
      await downloadApplicationFormPdf(`${safeRef}.pdf`);
      onDone(true);
    } catch {
      onDone(false);
    }
  };

  return (
    <div
      className="pointer-events-none fixed -left-[200vw] top-0 z-[100] w-[210mm] opacity-0"
      aria-hidden
    >
      <OfficialApplicationForm
        enrollment={enrollment}
        courseTitle={courseTitle}
        passportPhotoOverride={passportPhotoUrl}
        fillWarnings={fillWarnings}
        onFormReady={() => void handleReady()}
      />
    </div>
  );
}
