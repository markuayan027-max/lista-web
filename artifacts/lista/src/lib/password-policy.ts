/** LISTA password rules (UI + client validation). Align with InsForge auth settings when changed. */

export const PASSWORD_MIN_LENGTH = 8;

/** Allowed special characters for passwords */
export const PASSWORD_SPECIAL_CHARS = "@$!%*?&";

export type PasswordRuleId =
  | "minLength"
  | "uppercase"
  | "lowercase"
  | "number"
  | "special";

export type PasswordRule = {
  id: PasswordRuleId;
  label: string;
  test: (password: string) => boolean;
};

const specialPattern = new RegExp(
  `[${PASSWORD_SPECIAL_CHARS.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}]`,
);

export const PASSWORD_RULES: readonly PasswordRule[] = [
  {
    id: "minLength",
    label: `Minimum ${PASSWORD_MIN_LENGTH} characters`,
    test: (p) => p.length >= PASSWORD_MIN_LENGTH,
  },
  {
    id: "uppercase",
    label: "At least 1 uppercase letter",
    test: (p) => /[A-Z]/.test(p),
  },
  {
    id: "lowercase",
    label: "At least 1 lowercase letter",
    test: (p) => /[a-z]/.test(p),
  },
  {
    id: "number",
    label: "At least 1 number",
    test: (p) => /\d/.test(p),
  },
  {
    id: "special",
    label: `At least 1 special character (${PASSWORD_SPECIAL_CHARS})`,
    test: (p) => specialPattern.test(p),
  },
] as const;

export type PasswordRuleResult = PasswordRule & { met: boolean };

export function getPasswordRuleResults(password: string): PasswordRuleResult[] {
  return PASSWORD_RULES.map((rule) => ({
    ...rule,
    met: rule.test(password),
  }));
}

export function isPasswordValid(password: string): boolean {
  return getPasswordRuleResults(password).every((r) => r.met);
}

export function getPasswordValidationError(password: string): string | null {
  const failed = getPasswordRuleResults(password).filter((r) => !r.met);
  if (failed.length === 0) return null;
  return `Password must meet all requirements (${failed[0].label.toLowerCase()}).`;
}
