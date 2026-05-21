import * as XLSX from "xlsx";
import {
  Document,
  Packer,
  Paragraph,
  TextRun,
  Table,
  TableRow,
  TableCell,
  WidthType,
  BorderStyle,
  AlignmentType,
  HeadingLevel,
  ImageRun,
  ShadingType,
} from "docx";
import { saveAs } from "file-saver";
import { format } from "date-fns";
import type { Enrollment } from "./institutional-data";

// ============================================================
// EXCEL EXPORT
// ============================================================

export function exportTraineesToExcel(enrollments: Enrollment[], filename = "LISTA_Trainees") {
  const rows = enrollments.map((e) => ({
    "Ref No": e.refNo,
    "Last Name": e.lastName,
    "First Name": e.firstName,
    "ULI (TESDA ID)": e.uli || "NEW",
    "Voucher No": e.voucherNo || "",
    "Classification": e.learnerClassification,
    "PSA No": e.psaNo || "",
    "Mother's Maiden": e.motherMaidenName,
    "Father's Name": e.fatherName,
    "Mother Tongue": e.motherTongue,
    "Date of Birth": e.dob,
    "Gender": e.gender,
    "Civil Status": e.civilStatus,
    "Email": e.traineeEmail,
    "Contact No.": e.contactNumber,
    "Home Address": e.homeAddress,
    "City": e.city,
    "Province": e.province,
    "Highest Education": e.education,
    "School Last Attended": e.schoolLastAttended || "",
    "Course Enrolled": e.courseSlug,
    "Preferred Schedule": e.preferredSchedule,
    "Enrollment Type": e.enrollmentType,
    "Scholarship": e.scholarshipApplication,
    "Employment Status": e.employmentStatus,
    "Heard From": e.heardFrom || "",
    "Status": e.status,
    "Date Applied": format(new Date(e.createdAt), "MMM dd, yyyy"),
  }));

  const ws = XLSX.utils.json_to_sheet(rows);

  // Column widths
  ws["!cols"] = [
    { wch: 18 }, { wch: 14 }, { wch: 16 }, { wch: 14 }, { wch: 10 },
    { wch: 12 }, { wch: 26 }, { wch: 16 }, { wch: 30 }, { wch: 16 },
    { wch: 18 }, { wch: 26 }, { wch: 34 }, { wch: 36 }, { wch: 30 },
    { wch: 22 }, { wch: 36 }, { wch: 28 }, { wch: 16 }, { wch: 12 }, { wch: 16 },
  ];

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Trainees");

  const buf = XLSX.write(wb, { bookType: "xlsx", type: "array" });
  saveAs(new Blob([buf], { type: "application/octet-stream" }), `${filename}_${format(new Date(), "yyyyMMdd")}.xlsx`);
}

export function exportSingleTraineeToExcel(e: Enrollment, filename?: string) {
  exportTraineesToExcel([e], filename || `${e.lastName}_${e.firstName}_Profile`);
}

// ============================================================
// WORD EXPORT — Single Trainee Admission Form
// ============================================================

function makeCell(text: string, bold = false, shaded = false): TableCell {
  return new TableCell({
    shading: shaded ? { type: ShadingType.SOLID, color: "1E40AF", fill: "1E40AF" } : undefined,
    children: [
      new Paragraph({
        children: [
          new TextRun({
            text,
            bold,
            color: shaded ? "FFFFFF" : "1F2937",
            size: 20,
          }),
        ],
        spacing: { before: 60, after: 60 },
      }),
    ],
    margins: { top: 80, bottom: 80, left: 120, right: 120 },
    borders: {
      top: { style: BorderStyle.SINGLE, size: 1, color: "CBD5E1" },
      bottom: { style: BorderStyle.SINGLE, size: 1, color: "CBD5E1" },
      left: { style: BorderStyle.SINGLE, size: 1, color: "CBD5E1" },
      right: { style: BorderStyle.SINGLE, size: 1, color: "CBD5E1" },
    },
  });
}

function labelValueRow(label: string, value: string): TableRow {
  return new TableRow({
    children: [
      makeCell(label, true),
      makeCell(value || "—"),
    ],
  });
}

export async function exportSingleTraineeToWord(e: Enrollment): Promise<void> {
  const printDate = format(new Date(), "MMMM dd, yyyy 'at' hh:mm a");

  const doc = new Document({
    sections: [
      {
        properties: {
          page: {
            size: {
              width: 12240, // 8.5 inches (Long/Folio)
              height: 18720, // 13 inches (Long/Folio)
            },
            margin: {
              top: 1440, // 1 inch
              bottom: 1440,
              left: 1440,
              right: 1440,
            },
          },
        },
        children: [
          // Header / Title Block
          new Paragraph({
            children: [
              new TextRun({
                text: "LORENZ INTERNATIONAL SKILLS TRAINING ACADEMY, INC.",
                bold: true,
                size: 28,
                color: "1E40AF",
              }),
            ],
            alignment: AlignmentType.CENTER,
            spacing: { after: 80 },
          }),
          new Paragraph({
            children: [
              new TextRun({
                text: "FJY Bldg., National Highway, Brgy. 24-A, Gingoog City, Misamis Oriental 9014",
                size: 18,
                color: "6B7280",
              }),
            ],
            alignment: AlignmentType.CENTER,
            spacing: { after: 40 },
          }),
          new Paragraph({
            children: [
              new TextRun({
                text: "Tel: 09051095284  |  admin@lorenzinternational.org",
                size: 18,
                color: "6B7280",
              }),
            ],
            alignment: AlignmentType.CENTER,
            spacing: { after: 240 },
          }),

          new Paragraph({
            text: "TESDA LEARNER ADMISSION SLIP",
            heading: HeadingLevel.HEADING_1,
            alignment: AlignmentType.CENTER,
            spacing: { before: 120, after: 80 },
          }),

          new Paragraph({
            children: [
              new TextRun({ text: `ULI: `, bold: true, size: 20 }),
              new TextRun({ text: e.uli || "FOR REGISTRATION", size: 20, color: "1E40AF" }),
              new TextRun({ text: `     Voucher: `, bold: true, size: 20 }),
              new TextRun({ text: e.voucherNo || "N/A", size: 20, color: "1E40AF" }),
            ],
            alignment: AlignmentType.CENTER,
            spacing: { after: 320 },
          }),
          // Personal Information
          new Paragraph({
            children: [new TextRun({ text: "I. PERSONAL INFORMATION", bold: true, size: 22, color: "1E40AF" })],
            spacing: { before: 200, after: 120 },
          }),

          new Table({
            width: { size: 100, type: WidthType.PERCENTAGE },
            rows: [
              labelValueRow("Full Name", `${e.firstName} ${e.lastName}`.toUpperCase()),
              labelValueRow("ULI (Unique Learner Identifier)", e.uli || "NEW LEARNER"),
              labelValueRow("Classification", e.learnerClassification),
              labelValueRow("Date of Birth", e.dob ? format(new Date(e.dob), "MMMM dd, yyyy") : ""),
              labelValueRow("Gender", e.gender),
              labelValueRow("Civil Status", e.civilStatus),
              labelValueRow("Email Address", e.traineeEmail),
              labelValueRow("Contact Number", e.contactNumber),
            ],
          }),

          // Family Information
          new Paragraph({
            children: [new TextRun({ text: "II. FAMILY & IDENTITY", bold: true, size: 22, color: "1E40AF" })],
            spacing: { before: 240, after: 120 },
          }),

          new Table({
            width: { size: 100, type: WidthType.PERCENTAGE },
            rows: [
              labelValueRow("Father's Full Name", e.fatherName),
              labelValueRow("Mother's Maiden Name", e.motherMaidenName),
              labelValueRow("Mother Tongue", e.motherTongue),
              labelValueRow("Indigenous People (IP)", e.isIP ? "Yes" : "No"),
            ],
          }),

          // Address Information
          new Paragraph({
            children: [new TextRun({ text: "III. ADDRESS", bold: true, size: 22, color: "1E40AF" })],
            spacing: { before: 240, after: 120 },
          }),

          new Table({
            width: { size: 100, type: WidthType.PERCENTAGE },
            rows: [
              labelValueRow("Home Address", e.homeAddress),
              labelValueRow("City / Municipality", e.city),
              labelValueRow("Province", e.province),
            ],
          }),

          // Educational Background
          new Paragraph({
            children: [new TextRun({ text: "IV. EDUCATIONAL BACKGROUND", bold: true, size: 22, color: "1E40AF" })],
            spacing: { before: 240, after: 120 },
          }),

          new Table({
            width: { size: 100, type: WidthType.PERCENTAGE },
            rows: [
              labelValueRow("Highest Educational Attainment", e.education),
              labelValueRow("School Last Attended", e.schoolLastAttended || ""),
              labelValueRow("Employment Status", e.employmentStatus),
            ],
          }),

          // Course & Enrollment Details
          new Paragraph({
            children: [new TextRun({ text: "V. ENROLLMENT DETAILS", bold: true, size: 22, color: "1E40AF" })],
            spacing: { before: 240, after: 120 },
          }),

          new Table({
            width: { size: 100, type: WidthType.PERCENTAGE },
            rows: [
              labelValueRow("Course Applied", e.courseSlug.replace(/-/g, " ").toUpperCase()),
              labelValueRow("Enrollment Type", e.enrollmentType),
              labelValueRow("Preferred Schedule", e.preferredSchedule),
              labelValueRow("Scholarship Application", e.scholarshipApplication),
              labelValueRow("Heard From", e.heardFrom || ""),
              labelValueRow("Date Applied", format(new Date(e.createdAt), "MMMM dd, yyyy")),
            ],
          }),

          // Notes
          ...(e.notes
            ? [
                new Paragraph({
                  children: [new TextRun({ text: "V. ADDITIONAL NOTES", bold: true, size: 22, color: "1E40AF" })],
                  spacing: { before: 240, after: 120 },
                }),
                new Paragraph({
                  children: [new TextRun({ text: e.notes, size: 20, italics: true, color: "4B5563" })],
                  spacing: { after: 240 },
                }),
              ]
            : []),

          // Signature block
          new Paragraph({ spacing: { before: 480 }, children: [] }),

          new Table({
            width: { size: 100, type: WidthType.PERCENTAGE },
            rows: [
              new TableRow({
                children: [
                  new TableCell({
                    children: [
                      new Paragraph({
                        children: [new TextRun({ text: "________________________", size: 20 })],
                        alignment: AlignmentType.CENTER,
                      }),
                      new Paragraph({
                        children: [new TextRun({ text: "Trainee's Signature", size: 18, color: "6B7280" })],
                        alignment: AlignmentType.CENTER,
                      }),
                    ],
                    borders: {
                      top: { style: BorderStyle.NONE },
                      bottom: { style: BorderStyle.NONE },
                      left: { style: BorderStyle.NONE },
                      right: { style: BorderStyle.NONE },
                    },
                  }),
                  new TableCell({
                    children: [
                      new Paragraph({
                        children: [new TextRun({ text: "________________________", size: 20 })],
                        alignment: AlignmentType.CENTER,
                      }),
                      new Paragraph({
                        children: [new TextRun({ text: "Registrar / MIS Manager", size: 18, color: "6B7280" })],
                        alignment: AlignmentType.CENTER,
                      }),
                    ],
                    borders: {
                      top: { style: BorderStyle.NONE },
                      bottom: { style: BorderStyle.NONE },
                      left: { style: BorderStyle.NONE },
                      right: { style: BorderStyle.NONE },
                    },
                  }),
                ],
              }),
            ],
          }),

          // Footer note
          new Paragraph({
            children: [
              new TextRun({
                text: `I hereby certify that the information provided is true and correct, and I consent to the processing of my data for TESDA T2MIS registration in accordance with the Data Privacy Act of 2012.`,
                size: 14,
                color: "6B7280",
                italics: true,
              }),
            ],
            alignment: AlignmentType.CENTER,
            spacing: { before: 240 },
          }),
          new Paragraph({
            children: [
              new TextRun({
                text: `Document generated on ${printDate} | LISTA Information Management System`,
                size: 16,
                color: "9CA3AF",
                italics: true,
              }),
            ],
            alignment: AlignmentType.CENTER,
            spacing: { before: 80 },
          }),
        ],
      },
    ],
  });

  const blob = await Packer.toBlob(doc);
  saveAs(blob, `${e.refNo}_AdmissionForm_${format(new Date(), "yyyyMMdd")}.docx`);
}

// ============================================================
// Batch Word Export — all trainees as one doc
// ============================================================
export async function exportAllTraineesToWord(enrollments: Enrollment[]): Promise<void> {
  const sections = enrollments.map((e) => ({
    children: [
      new Paragraph({
        children: [new TextRun({ text: `${e.lastName}, ${e.firstName}`, bold: true, size: 26 })],
        heading: HeadingLevel.HEADING_2,
        spacing: { before: 200, after: 80 },
      }),
      new Paragraph({
        children: [
          new TextRun({ text: `Ref: ${e.refNo}  |  Course: ${e.courseSlug}  |  Status: ${e.status.toUpperCase()}`, size: 18 }),
        ],
        spacing: { after: 120 },
      }),
      new Table({
        width: { size: 100, type: WidthType.PERCENTAGE },
        rows: [
          labelValueRow("Email", e.traineeEmail),
          labelValueRow("Contact", e.contactNumber),
          labelValueRow("Address", `${e.homeAddress}, ${e.city}, ${e.province}`),
          labelValueRow("DOB", e.dob),
          labelValueRow("Gender", e.gender),
          labelValueRow("Civil Status", e.civilStatus),
          labelValueRow("Education", e.education),
          labelValueRow("Employment", e.employmentStatus),
          labelValueRow("Schedule", e.preferredSchedule),
          labelValueRow("Scholarship", e.scholarshipApplication),
          labelValueRow("Enrolled", format(new Date(e.createdAt), "MMM dd, yyyy")),
        ],
      }),
      new Paragraph({ spacing: { before: 360, after: 0 }, children: [new TextRun({ text: "", break: 1 })] }),
    ],
  }));

  const doc = new Document({ sections });
  const blob = await Packer.toBlob(doc);
  saveAs(blob, `LISTA_AllTrainees_${format(new Date(), "yyyyMMdd")}.docx`);
}
