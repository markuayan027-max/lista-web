const DEFAULT_IMAGE_WAIT_MS = 15_000;

function loadImage(img: HTMLImageElement, timeoutMs: number): Promise<void> {
  if (img.complete && img.naturalWidth > 0) return Promise.resolve();

  return new Promise((resolve, reject) => {
    const timer = window.setTimeout(() => {
      reject(new Error("Applicant photo did not finish loading. Try again or re-upload your profile photo."));
    }, timeoutMs);

    const done = () => {
      window.clearTimeout(timer);
      resolve();
    };
    const fail = () => {
      window.clearTimeout(timer);
      reject(new Error("Applicant photo failed to load. Check your connection or upload the photo again."));
    };

    img.addEventListener("load", done, { once: true });
    img.addEventListener("error", fail, { once: true });
  });
}

/** Wait until passport photos inside the printable form are decoded (critical for PDF export). */
export async function waitForPrintableFormImages(
  root: HTMLElement,
  timeoutMs = DEFAULT_IMAGE_WAIT_MS,
): Promise<void> {
  const images = Array.from(root.querySelectorAll<HTMLImageElement>("img.lista-form-photo"));
  if (images.length === 0) return;
  await Promise.all(images.map((img) => loadImage(img, timeoutMs)));
}

/** True when preview HTML is mounted and photos (if any) have loaded. */
export function isPrintableFormReady(root: HTMLElement | null): boolean {
  if (!root) return false;
  if (root.getAttribute("data-official-form-ready") !== "true") return false;
  if (!root.querySelector("#pg1") || !root.querySelector("#pg2")) return false;
  return true;
}
