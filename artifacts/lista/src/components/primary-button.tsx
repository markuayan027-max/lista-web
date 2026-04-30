import * as React from "react";
import { Button, ButtonProps } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface PrimaryButtonProps extends ButtonProps {}

export default function PrimaryButton({ className, ...props }: PrimaryButtonProps) {
  return (
    <Button
      variant="default"
      className={cn(
        "rounded-lg font-semibold transition-all duration-200 shadow-sm active:scale-[0.98]",
        className
      )}
      {...props}
    />
  );
}
