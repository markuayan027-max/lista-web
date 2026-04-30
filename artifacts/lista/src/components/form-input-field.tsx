import * as React from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

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
  ...props
}: FormInputFieldProps) {
  const inputId = id || label.toLowerCase().replace(/\s+/g, "-");

  return (
    <div className={cn("grid w-full items-center gap-1.5", className)}>
      <Label htmlFor={inputId} className="text-sm font-semibold tracking-tight">
        {label}
      </Label>
      <Input
        id={inputId}
        className={cn(
          "bg-white border-card-border focus:border-primary transition-all duration-200",
          error && "border-destructive focus-visible:ring-destructive"
        )}
        {...props}
      />
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
