import type * as React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { ArrowUpRight, ArrowDownRight } from "lucide-react";
import AnimatedStatIcon, { type StatIconName } from "@/components/animated-stat-icon";

interface StatCardProps {
  label: string;
  value: React.ReactNode;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  icon?: StatIconName;
  iconClassName?: string;
  className?: string;
}

export default function StatCard({
  label,
  value,
  trend,
  icon,
  iconClassName,
  className,
}: StatCardProps) {
  return (
    <Card className={cn("overflow-hidden border-card-border shadow-sm", className)}>
      <CardContent className="p-6">
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-1 min-w-0">
            <p className="text-sm font-medium text-muted-foreground">{label}</p>
            <div className="flex items-baseline gap-2 flex-wrap">
              <h3 className="text-2xl font-bold tracking-tight">{value}</h3>
              {trend && (
                <span
                  className={cn(
                    "flex items-center text-xs font-medium",
                    trend.isPositive ? "text-emerald-600" : "text-rose-600"
                  )}
                >
                  {trend.isPositive ? (
                    <ArrowUpRight className="mr-0.5 h-3 w-3" />
                  ) : (
                    <ArrowDownRight className="mr-0.5 h-3 w-3" />
                  )}
                  {trend.value}%
                </span>
              )}
            </div>
          </div>
          {icon && (
            <AnimatedStatIcon
              name={icon}
              className={cn("text-primary mt-0.5", iconClassName)}
            />
          )}
        </div>
      </CardContent>
    </Card>
  );
}
