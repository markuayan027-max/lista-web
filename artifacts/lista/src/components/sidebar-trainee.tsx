import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";
import { Home, ClipboardList, Calendar, Award, Bell, HelpCircle, GraduationCap } from "lucide-react";

const MENU_ITEMS = [
  { href: "/trainee", label: "Home", icon: Home },
  { href: "/trainee/application", label: "Application", icon: ClipboardList },
  { href: "/trainee/schedule", label: "Schedule", icon: Calendar },
  { href: "/trainee/certificate", label: "Certificate", icon: Award },
  { href: "/trainee/announcements", label: "Announcements", icon: Bell },
  { href: "/trainee/help", label: "Help & FAQ", icon: HelpCircle },
];

export default function SidebarTrainee() {
  const [location] = useLocation();

  return (
    <div className="flex flex-col h-full w-64 bg-white border-r border-card-border">
      <div className="p-6">
        <Link href="/" className="flex items-center gap-2 group">
          <div className="bg-primary text-primary-foreground p-1 rounded-lg">
            <GraduationCap className="h-6 w-6" />
          </div>
          <span className="text-xl font-bold tracking-tighter">LISTA</span>
        </Link>
      </div>

      <nav className="flex-1 px-4 space-y-1">
        {MENU_ITEMS.map((item) => {
          const isActive = location === item.href;
          return (
            <Link key={item.href} href={item.href}>
              <div
                className={cn(
                  "group flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 cursor-pointer relative overflow-hidden",
                  isActive
                    ? "bg-primary/5 text-primary"
                    : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
                )}
              >
                {isActive && (
                  <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-primary rounded-r-full" />
                )}
                <item.icon className={cn("h-5 w-5", isActive ? "text-primary" : "text-muted-foreground group-hover:text-foreground")} />
                {item.label}
              </div>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
