import { motion } from "framer-motion";
import { ShieldCheck, CheckCircle2, Circle } from "lucide-react";
import { cn } from "@/lib/utils";
import type { ProfileIntegrityBreakdown } from "@/lib/profile-utils";

function IntegrityRing({ value, size = 88 }: { value: number; size?: number }) {
  const stroke = 6;
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (value / 100) * circumference;
  const tone =
    value >= 100
      ? "text-emerald-500"
      : value >= 60
        ? "text-primary"
        : value >= 30
          ? "text-amber-500"
          : "text-muted-foreground";

  return (
    <motion.div
      className="relative shrink-0"
      initial={{ opacity: 0, scale: 0.92 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.35, ease: "easeOut" }}
    >
      <svg width={size} height={size} className={cn("-rotate-90", tone)} aria-hidden>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth={stroke}
          className="text-muted/40"
        />
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 0.9, ease: "easeOut" }}
        />
      </svg>
      <motion.div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-xl font-bold tabular-nums text-foreground leading-none">{value}%</span>
        <span className="text-[9px] font-semibold uppercase tracking-wider text-muted-foreground mt-0.5">
          Complete
        </span>
      </motion.div>
    </motion.div>
  );
}

function MiniBar({ label, value }: { label: string; value: number }) {
  return (
    <div className="space-y-1">
      <div className="flex justify-between text-[10px] font-medium text-muted-foreground">
        <span>{label}</span>
        <span className="tabular-nums text-foreground">{value}%</span>
      </div>
      <div className="h-1.5 w-full rounded-full bg-muted overflow-hidden">
        <motion.div
          className="h-full rounded-full bg-primary/90"
          initial={{ width: 0 }}
          animate={{ width: `${value}%` }}
          transition={{ duration: 0.7, ease: "easeOut" }}
        />
      </div>
    </div>
  );
}

export default function TraineeProfileIntegrityCard({
  breakdown,
  onContinueRegistration,
}: {
  breakdown: ProfileIntegrityBreakdown;
  onContinueRegistration?: () => void;
}) {
  const { overall, tesda, registration, steps, missingTesdaLabels } = breakdown;

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-card rounded-2xl border border-border p-4 sm:p-5 space-y-4 shadow-sm"
    >
      <div className="flex items-start gap-4">
        <IntegrityRing value={overall} />
        <motion.div className="flex-1 min-w-0 space-y-1 pt-1">
          <div className="flex items-center gap-2">
            <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
              Profile integrity
            </p>
            <ShieldCheck
              className={cn(
                "h-4 w-4 shrink-0",
                overall >= 100 ? "text-emerald-500" : "text-muted-foreground/60",
              )}
            />
          </div>
          <p className="text-sm text-muted-foreground leading-snug">
            {overall >= 100
              ? "Your learner profile is complete for TESDA processing."
              : "Finish registration steps and TESDA fields to unlock priority review."}
          </p>
        </motion.div>
      </div>

      <div className="grid gap-2.5">
        <MiniBar label="Registration wizard" value={registration} />
        <MiniBar label="TESDA required fields" value={tesda} />
      </div>

      <ul className="space-y-1.5" aria-label="Registration steps">
        {steps.map((s) => (
          <li key={s.step} className="flex items-center gap-2 text-xs">
            {s.done ? (
              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500 shrink-0" aria-hidden />
            ) : (
              <Circle className="h-3.5 w-3.5 text-muted-foreground/50 shrink-0" aria-hidden />
            )}
            <span className={cn(s.done ? "text-foreground font-medium" : "text-muted-foreground")}>
              Step {s.step}: {s.label}
            </span>
          </li>
        ))}
      </ul>

      {missingTesdaLabels.length > 0 && overall < 100 && (
        <p className="text-[11px] text-muted-foreground border-t border-border/60 pt-3">
          Still needed: {missingTesdaLabels.join(", ")}
          {onContinueRegistration && (
            <>
              {" "}
              <button
                type="button"
                onClick={onContinueRegistration}
                className="text-primary font-semibold hover:underline"
              >
                Continue registration
              </button>
            </>
          )}
        </p>
      )}
    </motion.div>
  );
}
