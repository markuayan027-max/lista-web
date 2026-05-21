import type { Enrollment } from "./institutional-data";

/** Lazy-load xlsx/docx so public and login routes avoid ~1MB+ office export deps. */
async function office() {
  return import("./export-office");
}

export async function exportTraineesToExcel(
  enrollments: Enrollment[],
  filename = "LISTA_Trainees",
): Promise<void> {
  const { exportTraineesToExcel: impl } = await office();
  impl(enrollments, filename);
}

export async function exportSingleTraineeToExcel(
  e: Enrollment,
  filename?: string,
): Promise<void> {
  const { exportSingleTraineeToExcel: impl } = await office();
  impl(e, filename);
}

export async function exportSingleTraineeToWord(e: Enrollment): Promise<void> {
  const { exportSingleTraineeToWord: impl } = await office();
  return impl(e);
}

export async function exportAllTraineesToWord(enrollments: Enrollment[]): Promise<void> {
  const { exportAllTraineesToWord: impl } = await office();
  return impl(enrollments);
}
