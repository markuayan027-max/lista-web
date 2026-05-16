import * as React from "react";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { Eye, EyeOff } from "lucide-react";

interface FormInputFieldProps extends React.ComponentPropsWithoutRef<typeof Input> {
  label: string;
  error?: string;
  hint?: string;
}

export default function FormInputField({
  label,
  error,
  hint,
  id,
  className,
  type,
  ...props
}: FormInputFieldProps) {
  const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, "-") : Math.random().toString(36).substring(7));
  const [showPassword, setShowPassword] = useState(false);
  const isPassword = type === "password";

  const handleTogglePassword = (e: React.MouseEvent | React.KeyboardEvent) => {
    if (e.type === "keydown") {
      const keyEvent = e as React.KeyboardEvent;
      if (keyEvent.key !== "Enter" && keyEvent.key !== " ") {
        return;
      }
      keyEvent.preventDefault();
    }
    setShowPassword((prev) => !prev);
  };

  return (
    <div className={cn("grid w-full items-center gap-1.5", className)}>
      {label && (
        <Label htmlFor={inputId} className="text-sm font-semibold tracking-tight">
          {label}
        </Label>
      )}
      <div className="relative">
        <Input
          id={inputId}
          type={isPassword ? (showPassword ? "text" : "password") : type}
          className={cn(
            "bg-white border-card-border focus:border-primary transition-all duration-200",
            isPassword && "pr-10",
            error && "border-destructive focus-visible:ring-destructive"
          )}
          {...props}
        />
        {isPassword && (
          <div
            role="button"
            tabIndex={0}
            aria-label={showPassword ? "Hide password" : "Show password"}
            aria-pressed={showPassword}
            onClick={handleTogglePassword}
            onKeyDown={handleTogglePassword}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground cursor-pointer rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            {showPassword ? (
              <EyeOff className="h-5 w-5" aria-hidden="true" />
            ) : (
              <Eye className="h-5 w-5" aria-hidden="true" />
            )}
          </div>
        )}
      </div>
      {hint && !error && (
        <p className="text-[11px] text-muted-foreground font-medium px-1">
          {hint}
        </p>
      )}
      {error && (
        <p className="text-[11px] font-bold text-destructive px-1">
          {error}
        </p>
      )}
    </div>
  );
}
