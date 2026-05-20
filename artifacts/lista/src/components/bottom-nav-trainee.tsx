import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";
import { traineeBottomNavItems } from "@/lib/trainee-nav";

export default function BottomNavTrainee() {
  const [location] = useLocation();
  const items = traineeBottomNavItems();

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-card border-t border-border md:hidden pb-safe-nav">
      <div className="flex items-center justify-around h-16">
        {items.map((item) => {
          const isActive = location === item.href;
          return (
            <Link key={item.href} href={item.href}>
              <div className={cn(
                "flex flex-col items-center justify-center gap-1 min-w-[3.5rem] h-full px-2 py-1 transition-colors touch-target",
                isActive ? "text-primary" : "text-muted-foreground"
              )}>
                <item.icon className={cn("h-5 w-5", isActive && "stroke-[2.5px]")} />
                <span className={cn("text-[10px] font-bold uppercase tracking-tight", isActive ? "text-primary" : "text-muted-foreground")}>
                  {item.shortLabel}
                </span>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
