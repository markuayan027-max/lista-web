import { Check, Circle, X } from "lucide-react";
import { getPasswordRuleResults, isPasswordValid } from "@/lib/password-policy";
import { cn } from "@/lib/utils";

type PasswordRequirementsProps = {
  password: string;
  id?: string;
  className?: string;
};

/**
 * Accessible checklist of password rules — neutral before typing, green/red as user types.
 */
export default function PasswordRequirements({
  password,
  id = "password-requirements",
  className,
}: PasswordRequirementsProps) {
  const results = getPasswordRuleResults(password);
  const hasInput = password.length > 0;
  const allMet = isPasswordValid(password);

  return (
    <div
      id={id}
      role="group"
      aria-label="Password requirements"
      className={cn(
        "rounded-xl border border-border/50 bg-muted/25 px-3.5 py-3",
        className,
      )}
    >
      <p className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
        Password requirements
      </p>
      <ul className="space-y-1.5" aria-live="polite" aria-atomic="false">
        {results.map((rule) => {
          const met = hasInput && rule.met;
          const unmet = hasInput && !rule.met;

          return (
            <li key={rule.id} className="flex items-start gap-2">
              <span className="mt-0.5 shrink-0" aria-hidden>
                {!hasInput ? (
                  <Circle className="h-3.5 w-3.5 text-muted-foreground/45" strokeWidth={2} />
                ) : met ? (
                  <Check className="h-3.5 w-3.5 text-emerald-600" strokeWidth={2.5} />
                ) : (
                  <X className="h-3.5 w-3.5 text-destructive/85" strokeWidth={2.5} />
                )}
              </span>
              <span
                className={cn(
                  "text-xs leading-snug",
                  !hasInput && "text-muted-foreground",
                  met && "font-medium text-emerald-800 dark:text-emerald-600",
                  unmet && "text-foreground",
                )}
              >
                {rule.label}
                {met ? (
                  <span className="sr-only"> — met</span>
                ) : hasInput ? (
                  <span className="sr-only"> — not met</span>
                ) : null}
              </span>
            </li>
          );
        })}
      </ul>
      {hasInput && allMet ? (
        <p className="mt-2.5 text-[11px] font-semibold text-emerald-700 dark:text-emerald-500">
          All requirements met
        </p>
      ) : null}
    </div>
  );
}
