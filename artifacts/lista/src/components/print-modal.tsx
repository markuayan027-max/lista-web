import { useEffect, useMemo, useState } from "react";
import { X, Printer, FileText, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { Enrollment } from "@/lib/institutional-data";
import { useCourses } from "@/hooks/use-lista-data";
import { courseTitleBySlug } from "@/lib/lista-insforge-data";
import OfficialApplicationForm from "@/components/official-application-form";
import { OfficialFormWarningsBanner } from "@/components/official-form-warnings-banner";
import { getOfficialFormFillWarnings } from "@/lib/fill-official-application-form";
import { downloadApplicationFormPdf } from "@/lib/download-tesda-pdf";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

export default function PrintModal({
  enrollment,
  onClose,
}: {
  enrollment: Enrollment;
  onClose: () => void;
}) {
  const { toast } = useToast();
  const { data: courses = [] } = useCourses();
  const courseTitle = courseTitleBySlug(courses, enrollment.courseSlug) ?? "";
  const [pdfLoading, setPdfLoading] = useState(false);
  const [warningsAcknowledged, setWarningsAcknowledged] = useState(false);

  const fillWarnings = useMemo(
    () => getOfficialFormFillWarnings({ enrollment, courseTitle }),
    [enrollment, courseTitle],
  );

  const hasFillWarnings = fillWarnings.length > 0;
  const printBlocked = hasFillWarnings && !warningsAcknowledged;

  useEffect(() => {
    setWarningsAcknowledged(false);
  }, [enrollment.id, enrollment.refNo]);

  const handlePrint = () => {
    if (printBlocked) {
      toast({
        title: "Review missing fields first",
        description: 'Choose "Continue anyway" or update your profile before printing.',
      });
      return;
    }
    window.print();
  };

  const handleDownloadPdf = async () => {
    if (printBlocked) {
      toast({
        title: "Review missing fields first",
        description: 'Choose "Continue anyway" or update your profile before downloading.',
      });
      return;
    }
    setPdfLoading(true);
    try {
      const safeRef = (enrollment.refNo || "Application-Form").replace(/[^\w-]+/g, "_");
      await downloadApplicationFormPdf(`${safeRef}.pdf`);
      toast({
        title: "PDF downloaded",
        description: "Saved as A4 (2 pages).",
      });
    } catch (err) {
      toast({
        title: "PDF download failed",
        description: err instanceof Error ? err.message : "Try Print → Save as PDF instead.",
        variant: "destructive",
      });
    } finally {
      setPdfLoading(false);
    }
  };

  return (
    <div
      className="print-modal-overlay fixed inset-0 z-50 flex items-start justify-center bg-black/60 backdrop-blur-sm overflow-y-auto py-8 print:static print:overflow-visible print:bg-white print:py-0"
      role="dialog"
      aria-modal="true"
      aria-label={`Official TESDA application form for ${enrollment.traineeName}`}
    >
      <div className="no-print absolute inset-0" onClick={onClose} aria-hidden="true" />

      <div className="relative z-10 w-full max-w-5xl mx-4 print:max-w-none print:mx-0">
        <div className="no-print flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-card rounded-2xl px-6 py-4 mb-4 shadow-xl border border-border">
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center"
              aria-hidden
            >
              <FileText className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="font-black text-foreground text-sm">{enrollment.traineeName}</p>
              <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                {enrollment.refNo}
              </p>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <Button variant="outline" onClick={onClose} className="rounded-xl font-bold">
              <X className="w-4 h-4 mr-2" aria-hidden />
              Close
            </Button>
            <Button
              variant="outline"
              onClick={() => void handleDownloadPdf()}
              disabled={pdfLoading || printBlocked}
              className="rounded-xl font-bold gap-2"
              aria-disabled={printBlocked}
              title={
                printBlocked
                  ? "Complete the checklist above or choose Continue anyway"
                  : undefined
              }
            >
              <Download className="w-4 h-4" aria-hidden />
              {pdfLoading ? "Generating…" : "Download PDF"}
            </Button>
            <Button
              onClick={handlePrint}
              disabled={printBlocked}
              className={cn(
                "rounded-xl font-bold gap-2 bg-primary hover:bg-primary/90 shadow-lg shadow-primary/20",
                printBlocked && "opacity-60 cursor-not-allowed",
              )}
              aria-disabled={printBlocked}
              title={
                printBlocked
                  ? "Complete the checklist above or choose Continue anyway"
                  : undefined
              }
            >
              <Printer className="w-4 h-4" aria-hidden />
              Print
            </Button>
          </div>
        </div>

        {printBlocked && (
          <OfficialFormWarningsBanner
            warnings={fillWarnings}
            onContinueAnyway={() => setWarningsAcknowledged(true)}
          />
        )}

        {hasFillWarnings && warningsAcknowledged && (
          <p
            className="no-print mb-3 rounded-xl border border-border bg-card px-4 py-2 text-center text-xs text-foreground/90"
            role="status"
          >
            Printing with {fillWarnings.length} incomplete{" "}
            {fillWarnings.length === 1 ? "field" : "fields"}. You can still{" "}
            <button
              type="button"
              className="font-semibold text-primary underline-offset-2 hover:underline"
              onClick={() => setWarningsAcknowledged(false)}
            >
              review the checklist
            </button>
            .
          </p>
        )}

        <p className="no-print mb-3 rounded-lg border border-border bg-card/95 px-3 py-2 text-center text-xs text-foreground/90">
          Official TESDA application form (2 pages). For <strong className="text-foreground">Print</strong>: use
          A4, margins <strong className="text-foreground">Minimum</strong>, enable{" "}
          <strong className="text-foreground">Background graphics</strong>.
        </p>

        <div className="print-preview-shell overflow-x-auto overflow-y-visible rounded-2xl shadow-2xl border border-border bg-muted/30 print:overflow-visible print:rounded-none print:border-0 print:shadow-none print:bg-white">
          <OfficialApplicationForm
            enrollment={enrollment}
            courseTitle={courseTitle}
            fillWarnings={fillWarnings}
          />
        </div>
      </div>
    </div>
  );
}
