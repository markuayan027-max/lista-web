/** Client-side PDF export for the official 2-page application form. */
export async function downloadApplicationFormPdf(filename: string): Promise<void> {
  const element = document.getElementById("printable-form");
  if (!element) {
    throw new Error("Printable form is not ready.");
  }

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
