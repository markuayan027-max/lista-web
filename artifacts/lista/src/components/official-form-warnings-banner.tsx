import { AlertTriangle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";

type OfficialFormWarningsBannerProps = {
  warnings: string[];
  onContinueAnyway: () => void;
  profileHref?: string;
};

export function OfficialFormWarningsBanner({
  warnings,
  onContinueAnyway,
  profileHref = "/trainee/profile",
}: OfficialFormWarningsBannerProps) {
  if (warnings.length === 0) return null;

  return (
    <Alert
      className="no-print mb-4 border-amber-600/50 bg-amber-50 text-amber-950 shadow-sm dark:border-amber-500/50 dark:bg-amber-950/40 dark:text-amber-50"
      aria-live="polite"
    >
      <AlertTriangle className="h-4 w-4 text-amber-700 dark:text-amber-400" aria-hidden />
      <AlertTitle className="font-bold text-amber-950 dark:text-amber-50">
        Some details are missing on your form
      </AlertTitle>
      <AlertDescription className="space-y-4 text-sm text-amber-950/95 dark:text-amber-50/95">
        <p className="leading-relaxed">
          The official TESDA form may print with blank fields until you complete your profile.
          Fix these items for the most accurate copy:
        </p>
        <ul
          className="list-disc space-y-1 pl-5 font-medium text-amber-950 dark:text-amber-50"
          aria-label="Missing form fields"
        >
          {warnings.map((warning) => (
            <li key={warning}>{warning}</li>
          ))}
        </ul>
        <div className="flex flex-col sm:flex-row flex-wrap gap-2 pt-1">
          <Button asChild variant="default" size="sm" className="rounded-xl font-semibold">
            <Link href={profileHref}>Update my profile</Link>
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="rounded-xl border-amber-800 bg-white font-semibold text-amber-950 hover:bg-amber-100 dark:border-amber-400 dark:bg-amber-950 dark:text-amber-50 dark:hover:bg-amber-900"
            onClick={onContinueAnyway}
          >
            Continue anyway
          </Button>
        </div>
      </AlertDescription>
    </Alert>
  );
}
