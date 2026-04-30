import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";
import { Home, ClipboardList, Calendar, Award, Bell, HelpCircle } from "lucide-react";

const MENU_ITEMS = [
  { href: "/trainee", label: "Home", icon: Home },
  { href: "/trainee/application", label: "Application", icon: ClipboardList },
  { href: "/trainee/schedule", label: "Schedule", icon: Calendar },
  { href: "/trainee/certificate", label: "Certificate", icon: Award },
  { href: "/trainee/announcements", label: "Announcements", icon: Bell },
  { href: "/trainee/help", label: "Help & FAQ", icon: HelpCircle },
];

export default function BottomNavTrainee() {
  const [location] = useLocation();

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-card-border md:hidden">
      <div className="flex items-center justify-around h-16">
        {MENU_ITEMS.map((item) => {
          const isActive = location === item.href;
          return (
            <Link key={item.href} href={item.href}>
              <div className={cn(
                "flex flex-col items-center justify-center gap-1 w-full h-full px-2 transition-colors",
                isActive ? "text-primary" : "text-muted-foreground"
              )}>
                <item.icon className={cn("h-5 w-5", isActive && "stroke-[2.5px]")} />
                <span className={cn("text-[10px] font-bold uppercase tracking-tight", isActive ? "text-primary" : "text-muted-foreground")}>
                  {item.label.split(" ")[0]}
                </span>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
