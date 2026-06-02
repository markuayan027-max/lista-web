import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { useSafeMotion } from "@/hooks/use-safe-motion";

export type StatIconName = "book" | "users" | "clock" | "award" | "calendar" | "document";

type PathDef = { d: string; strokeLinecap?: "round" | "square" | "butt" };
type CircleDef = { cx: number; cy: number; r: number };

const ICON_DEFS: Record<
  StatIconName,
  { paths: PathDef[]; circles?: CircleDef[] }
> = {
  book: {
    paths: [
      { d: "M5 5.5A2.5 2.5 0 0 1 7.5 3H19v18H7.5A2.5 2.5 0 0 1 5 18.5V5.5z" },
      { d: "M5 5.5V18.5A2.5 2.5 0 0 0 7.5 21H19" },
      { d: "M9 7.5h6M9 11h6M9 14.5h4" },
    ],
  },
  users: {
    paths: [
      { d: "M16 19v-1.5a3.5 3.5 0 0 0-3.5-3.5h-1A3.5 3.5 0 0 0 8 17.5V19" },
      { d: "M12 11.5a3 3 0 1 0 0-6 3 3 0 0 0 0 6z" },
      { d: "M19 19v-1a2.5 2.5 0 0 0-2-2.45" },
      { d: "M5 19v-1a2.5 2.5 0 0 1 2-2.45" },
      { d: "M17.5 11a2.5 2.5 0 1 0-.01-4.99" },
      { d: "M6.5 11a2.5 2.5 0 1 1-.01-4.99" },
    ],
  },
  clock: {
    circles: [{ cx: 12, cy: 12, r: 8.5 }],
    paths: [
      { d: "M12 8v4.5l2.75 2.75", strokeLinecap: "round" },
      { d: "M12 3.5V2M12 22v-1.5M20.5 12H22M2 12h1.5" },
    ],
  },
  award: {
    paths: [
      { d: "M8 4h8l1.5 4.5L12 11 6.5 8.5 8 4z" },
      { d: "M6.5 8.5L5 14l3.5 1.5L12 22l3.5-6.5L19 14l-1.5-5.5" },
      { d: "M12 11v3" },
    ],
  },
  calendar: {
    paths: [
      { d: "M5 6h14v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6z" },
      { d: "M16 3v3M8 3v3M5 10h14" },
      { d: "M9 14h2M13 14h2M9 17.5h2" },
    ],
  },
  document: {
    paths: [
      { d: "M8 3h6l4 4v14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2z" },
      { d: "M14 3v4h4" },
      { d: "M9 13h6M9 16.5h4" },
    ],
  },
};

interface AnimatedStatIconProps {
  name: StatIconName;
  className?: string;
  size?: number;
}

export default function AnimatedStatIcon({
  name,
  className,
  size = 28,
}: AnimatedStatIconProps) {
  const { enabled } = useSafeMotion();
  const def = ICON_DEFS[name];

  return (
    <motion.span
      className={cn("inline-flex shrink-0 items-center justify-center", className)}
      whileHover={enabled ? { scale: 1.05 } : undefined}
      transition={{ type: "spring", stiffness: 420, damping: 22 }}
      aria-hidden
    >
      <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="overflow-visible"
      >
        {def.circles?.map((circle, i) => (
          <motion.circle
            key={`c-${i}`}
            cx={circle.cx}
            cy={circle.cy}
            r={circle.r}
            stroke="currentColor"
            strokeWidth={1.25}
            initial={enabled ? { pathLength: 0, opacity: 0 } : false}
            animate={{ pathLength: 1, opacity: 1 }}
            transition={
              enabled
                ? { pathLength: { delay: i * 0.08, duration: 0.55, ease: "easeInOut" }, opacity: { duration: 0.15 } }
                : { duration: 0 }
            }
          />
        ))}
        {def.paths.map((path, i) => (
          <motion.path
            key={`p-${i}`}
            d={path.d}
            stroke="currentColor"
            strokeWidth={1.25}
            strokeLinecap={path.strokeLinecap ?? "round"}
            strokeLinejoin="round"
            initial={enabled ? { pathLength: 0, opacity: 0 } : false}
            animate={{ pathLength: 1, opacity: 1 }}
            transition={
              enabled
                ? {
                    pathLength: {
                      delay: (def.circles?.length ?? 0) * 0.08 + i * 0.1,
                      duration: 0.6,
                      ease: "easeInOut",
                    },
                    opacity: { duration: 0.15 },
                  }
                : { duration: 0 }
            }
          />
        ))}
      </svg>
    </motion.span>
  );
}
