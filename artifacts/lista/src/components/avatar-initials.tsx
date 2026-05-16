import { useState } from "react";
import { cn } from "@/lib/utils";

const PALETTE = [
  "bg-blue-100 text-blue-700",
  "bg-indigo-100 text-indigo-700",
  "bg-slate-100 text-slate-700",
  "bg-teal-100 text-teal-700",
  "bg-emerald-100 text-emerald-700",
  "bg-rose-100 text-rose-700",
  "bg-amber-100 text-amber-700",
];

interface AvatarInitialsProps {
  name: string;
  /** Optional image URL (e.g. base64 from localStorage). Shows image; falls back to initials on error. */
  src?: string | null;
  size?: "sm" | "md" | "lg";
  className?: string;
}

export default function AvatarInitials({ name, src, size = "md", className }: AvatarInitialsProps) {
  const [imgError, setImgError] = useState(false);

  const initials = name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  const hash = name.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const colorClass = PALETTE[hash % PALETTE.length];

  const sizeClasses = {
    sm: "h-8 w-8 text-xs",
    md: "h-10 w-10 text-sm",
    lg: "h-12 w-12 text-base",
  };

  if (src && !imgError) {
    return (
      <div
        className={cn(
          "flex items-center justify-center rounded-full overflow-hidden",
          sizeClasses[size],
          className
        )}
      >
        <img
          src={src}
          alt={name}
          className="w-full h-full object-cover"
          onError={() => setImgError(true)}
        />
      </div>
    );
  }

  return (
    <div
      className={cn(
        "flex items-center justify-center rounded-full font-semibold",
        sizeClasses[size],
        colorClass,
        className
      )}
    >
      {initials}
    </div>
  );
}
