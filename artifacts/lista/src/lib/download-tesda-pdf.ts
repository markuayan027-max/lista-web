import { isPrintableFormReady, waitForPrintableFormImages } from "@/lib/official-form-print-ready";

/** Client-side PDF export for the official 2-page application form. */
export async function downloadApplicationFormPdf(filename: string): Promise<void> {
  const element = document.getElementById("printable-form");
  if (!element || !isPrintableFormReady(element)) {
    throw new Error("Form is still loading. Wait a moment, then try Download PDF again.");
  }

  await waitForPrintableFormImages(element);

  const html2pdf = (await import("html2pdf.js")).default;

  await html2pdf()
    .set({
      margin: 0.25,
      filename,
      image: { type: "jpeg", quality: 0.98 },
      html2canvas: {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: "#ffffff",
      },
      jsPDF: {
        unit: "in",
        format: "a4",
        orientation: "portrait",
      },
      pagebreak: { mode: ["css", "legacy"], before: ".page-container:nth-of-type(2)" },
    } as Record<string, unknown>)
    .from(element)
    .save();
}
