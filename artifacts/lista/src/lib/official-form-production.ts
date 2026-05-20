import type { Enrollment } from "@/lib/institutional-data";
import { computeAgeFromDob } from "@/lib/official-form-field-map";

export const OFFICIAL_FORM_TEMPLATE_MARKERS = {
  page1: 'id="pg1"',
  page2: 'id="pg2"',
  photoStyle: ".lista-form-photo",
  fillStyle: ".lista-fill",
} as const;

export type OfficialFormTemplateValidation = {
  ok: boolean;
  errors: string[];
};

/** Ensures BuildVu template is present and overlay CSS exists. */
export function validateOfficialFormTemplate(html: string): OfficialFormTemplateValidation {
  const errors: string[] = [];
  if (!html.trim()) errors.push("Template file is empty.");
  if (!html.includes(OFFICIAL_FORM_TEMPLATE_MARKERS.page1)) errors.push("Missing page 1 (#pg1).");
  if (!html.includes(OFFICIAL_FORM_TEMPLATE_MARKERS.page2)) errors.push("Missing page 2 (#pg2).");
  if (!html.includes(OFFICIAL_FORM_TEMPLATE_MARKERS.fillStyle)) {
    errors.push("Missing .lista-fill overlay styles.");
  }
  if (!html.includes(OFFICIAL_FORM_TEMPLATE_MARKERS.photoStyle)) {
    errors.push("Missing .lista-form-photo styles.");
  }
  return { ok: errors.length === 0, errors };
}

/** Fills derived fields used on the paper form (e.g. age from DOB). */
export function enrichEnrollmentForOfficialForm(
  enrollment: Partial<Enrollment>,
): Partial<Enrollment> {
  const next = { ...enrollment };
  if ((next.age === undefined || next.age === null) && next.dob) {
    const computed = computeAgeFromDob(next.dob);
    if (computed !== null) next.age = computed;
  }
  return next;
}
