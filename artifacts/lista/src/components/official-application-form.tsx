import { useEffect, useState } from "react";
import type { Enrollment } from "@/lib/institutional-data";
import { fillOfficialApplicationFormHtml } from "@/lib/fill-official-application-form";

type OfficialApplicationFormProps = {
  enrollment: Enrollment;
  courseTitle: string;
  /** Passed from PrintModal — used for inline preview note only (banner lives in modal). */
  fillWarnings?: string[];
};

export default function OfficialApplicationForm({
  enrollment,
  courseTitle,
  fillWarnings = [],
}: OfficialApplicationFormProps) {
  const [html, setHtml] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch("/official-tesda-application-form.html");
        if (!res.ok) throw new Error("Official form template not found.");
        const template = await res.text();
        const filled = fillOfficialApplicationFormHtml(template, { enrollment, courseTitle });
        if (!cancelled) {
          setHtml(filled);
          setError(null);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Failed to load application form.");
          setHtml(null);
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [enrollment, courseTitle]);

  if (error) {
    return (
      <div
        className="p-8 text-center text-sm text-destructive bg-destructive/5 rounded-xl m-4"
        id="printable-form"
        role="alert"
      >
        {error}
      </div>
    );
  }

  if (!html) {
    return (
      <div className="p-12 text-center text-sm text-muted-foreground" id="printable-form" aria-busy="true">
        <p className="font-medium">Loading official application form…</p>
        {fillWarnings.length > 0 && (
          <p className="mt-2 text-xs text-amber-700 dark:text-amber-500">
            {fillWarnings.length} {fillWarnings.length === 1 ? "field needs" : "fields need"} attention before
            printing.
          </p>
        )}
      </div>
    );
  }

  return (
    <>
      {fillWarnings.length > 0 && (
        <p className="no-print px-4 pt-3 text-center text-[11px] text-muted-foreground">
          Preview may show blank cells for missing profile data.
        </p>
      )}
      <div
        id="printable-form"
        className="official-html-form-root mx-auto"
        dangerouslySetInnerHTML={{ __html: html }}
      />
    </>
  );
}

