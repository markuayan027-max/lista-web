import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

type SectionEyebrowProps = {
  children: ReactNode;
  index?: string;
  className?: string;
};

export default function SectionEyebrow({ children, index, className }: SectionEyebrowProps) {
  return (
    <div className={cn("section-eyebrow", className)}>
      {index ? (
        <span className="text-foreground/40" aria-hidden>
          {index}
        </span>
      ) : null}
      <span>{children}</span>
    </div>
  );
}
