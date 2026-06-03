import {
  DEFAULT_PRINT_PAPER,
  printPaperSpec,
  type PrintPaperSize,
} from "@/lib/print-paper";

const STYLE_ID = "lista-print-paper-styles";
const FORM_PAGE_W_PX = 905;
const FORM_PAGE_H_PX = 1282;

/** Apply paper preset to the document (print @page + on-screen form scale). */
export function applyPrintPaper(size: PrintPaperSize = DEFAULT_PRINT_PAPER): void {
  const spec = printPaperSpec(size);
  document.documentElement.setAttribute("data-print-paper", size);

  const scale =
    Math.min(
      (spec.widthIn * 96 - spec.paddingIn * 96 * 2) / FORM_PAGE_W_PX,
      (spec.heightIn * 96 - spec.paddingIn * 96 * 2) / FORM_PAGE_H_PX,
    ) * spec.uiScale;

  let style = document.getElementById(STYLE_ID) as HTMLStyleElement | null;
  if (!style) {
    style = document.createElement("style");
    style.id = STYLE_ID;
    document.head.appendChild(style);
  }

  style.textContent = `
    @media print {
      @page {
        size: ${spec.pageSize};
        margin: ${spec.pageMarginIn}in;
      }
    }
    html[data-print-paper="${size}"] .official-html-form-root .page-container {
      transform: scale(${scale});
      transform-origin: top center;
    }
    @media print {
      html[data-print-paper="${size}"] .official-html-form-root .page-container {
        transform: scale(${scale});
        transform-origin: top center;
      }
    }
  `;
}

export function clearPrintPaper(): void {
  document.documentElement.removeAttribute("data-print-paper");
  document.getElementById(STYLE_ID)?.remove();
}
