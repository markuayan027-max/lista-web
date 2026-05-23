import * as React from "react";
import { Button, ButtonProps } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { cva, type VariantProps } from "class-variance-authority";

const primaryButtonVariants = cva(
  "rounded-lg font-semibold transition-all duration-200 shadow-sm active:scale-[0.98]",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary/90 border border-primary-border",
        brand:
          "bg-brand text-brand-foreground hover:opacity-90 border border-transparent shadow-md shadow-slate-900/10",
        outline:
          "border border-border bg-background text-foreground hover:bg-muted shadow-none",
        ghost: "border border-slate-300 bg-transparent text-foreground hover:bg-muted shadow-none",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);

export interface PrimaryButtonProps
  extends Omit<ButtonProps, "variant">,
    VariantProps<typeof primaryButtonVariants> {}

export default function PrimaryButton({
  className,
  variant = "default",
  ...props
}: PrimaryButtonProps) {
  return (
    <Button
      variant="ghost"
      className={cn(primaryButtonVariants({ variant }), className)}
      {...props}
    />
  );
}
