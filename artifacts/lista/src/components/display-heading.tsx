import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

type DisplayHeadingProps = {
  as?: "h1" | "h2" | "h3";
  size?: "hero" | "section";
  children: ReactNode;
  emphasis?: ReactNode;
  className?: string;
};

export default function DisplayHeading({
  as: Tag = "h2",
  size = "section",
  children,
  emphasis,
  className,
}: DisplayHeadingProps) {
  return (
    <Tag
      className={cn(
        "display-heading",
        size === "hero" ? "display-heading--hero" : "display-heading--section",
        className,
      )}
    >
      {children}
      {emphasis != null ? <> <span className="text-emphasis">{emphasis}</span></> : null}
    </Tag>
  );
}
