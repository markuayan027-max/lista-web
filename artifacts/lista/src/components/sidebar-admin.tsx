import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";
import { BarChart3, Users, Bell, Calendar, Award, FileUp, Settings, GraduationCap, ChevronLeft, ChevronRight, ClipboardList } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";

const MENU_ITEMS = [
  { href: "/admin", label: "Analytics", icon: BarChart3 },
  { href: "/admin/enrollments", label: "Enrollments", icon: ClipboardList },
  { href: "/admin/users", label: "Users", icon: Users },
  { href: "/admin/announcements", label: "Announcements", icon: Bell },
  { href: "/admin/schedule", label: "Schedule", icon: Calendar },
  { href: "/admin/certificates", label: "Certificates", icon: Award },
  { href: "/admin/export", label: "Export", icon: FileUp },
  { href: "/admin/settings", label: "Settings", icon: Settings },
];

export default function SidebarAdmin() {
  const [location] = useLocation();
  const [isCollapsed, setIsCollapsed] = useState(false);

  return (
    <div
      className={cn(
        "relative flex flex-col h-full bg-white border-r border-card-border transition-all duration-300",
        isCollapsed ? "w-20" : "w-64"
      )}
    >
      <div className={cn("p-6 flex items-center gap-3", isCollapsed && "justify-center px-0")}>
        <div className="shrink-0">
          <img src="/logo.webp" alt="LISTA Logo" className="h-12 w-auto object-contain" />
        </div>
        {!isCollapsed && <span className="text-xl font-bold tracking-tighter">LISTA</span>}
      </div>

      <nav className="flex-1 px-4 space-y-1 overflow-y-auto">
        {MENU_ITEMS.map((item) => {
          const isActive = location === item.href;
          return (
            <Link key={item.href} href={item.href}>
              <div
                className={cn(
                  "group flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 cursor-pointer relative",
                  isActive
                    ? "bg-primary/5 text-primary"
                    : "text-muted-foreground hover:bg-muted/50 hover:text-foreground",
                  isCollapsed && "justify-center"
                )}
                title={isCollapsed ? item.label : ""}
              >
                {isActive && !isCollapsed && (
                  <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-primary rounded-r-full" />
                )}
                <item.icon className={cn("h-5 w-5 shrink-0", isActive ? "text-primary" : "text-muted-foreground group-hover:text-foreground")} />
                {!isCollapsed && <span>{item.label}</span>}
              </div>
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-card-border">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="w-full flex items-center justify-center hover:bg-muted/50 rounded-xl"
        >
          {isCollapsed ? <ChevronRight className="h-5 w-5" /> : <ChevronLeft className="h-5 w-5" />}
        </Button>
      </div>
    </div>
  );
}
