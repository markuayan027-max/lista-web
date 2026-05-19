/** Paper presets for TESDA application + admission slip (exactly 2 pages). */
export type PrintPaperSize = "a4" | "long";

export type PrintPaperSpec = {
  id: PrintPaperSize;
  label: string;
  subtitle: string;
  /** CSS @page size */
  pageSize: string;
  widthIn: number;
  heightIn: number;
  /** Inner padding inside each printed page */
  paddingIn: number;
  /** Typography scale (no CSS transform — avoids overlap) */
  uiScale: number;
  /** Square letter-box size for name / reference grids */
  gridBoxIn: number;
  /** @page margin — keeps content inside browser printable area */
  pageMarginIn: number;
};

export const PRINT_PAPER_SPECS: Record<PrintPaperSize, PrintPaperSpec> = {
  a4: {
    id: "a4",
    label: "A4",
    subtitle: "210 × 297 mm",
    pageSize: "A4 portrait",
    widthIn: 8.27,
    heightIn: 11.69,
    paddingIn: 0.12,
    uiScale: 1,
    gridBoxIn: 0.17,
    pageMarginIn: 0.2,
  },
  long: {
    id: "long",
    label: "Long",
    subtitle: "8.5 × 13 in (Folio)",
    pageSize: "8.5in 13in",
    widthIn: 8.5,
    heightIn: 13,
    paddingIn: 0.15,
    uiScale: 1,
    gridBoxIn: 0.19,
    pageMarginIn: 0.2,
  },
};

/** Reference scans are A4 proportion (1235×1749 px ≈ 210×297 mm). */
export const DEFAULT_PRINT_PAPER: PrintPaperSize = "a4";

export function printPaperSpec(size: PrintPaperSize): PrintPaperSpec {
  return PRINT_PAPER_SPECS[size];
}
