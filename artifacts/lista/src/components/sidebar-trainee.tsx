import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";
import {
  Home, ClipboardList, Calendar, Award, Bell, HelpCircle,
  Search, Settings, ChevronsUpDown, Sidebar as SidebarIcon
} from "lucide-react";
import { useEffect, useState } from "react";
import { useAuth } from "@/context/auth-context";
import AvatarInitials from "@/components/avatar-initials";
import { loadProfilePic } from "@/lib/profile-utils";
import { useAnnouncements } from "@/hooks/use-lista-data";
import { announcementCountForRole } from "@/lib/analytics-utils";

const MAIN_MENU = [
  { href: "/trainee", label: "Dashboard", icon: Home },
  { href: "/trainee/application", label: "My Application", icon: ClipboardList },
  { href: "/trainee/schedule", label: "Schedule", icon: Calendar },
  { href: "/trainee/certificate", label: "Certificates", icon: Award },
];

const PREFERENCES_MENU = [
  { href: "/trainee/profile", label: "Preferences", icon: Settings },
  { href: "/trainee/help", label: "Help", icon: HelpCircle },
];

export default function SidebarTrainee() {
  const [location] = useLocation();
  const { user } = useAuth();
  const [profilePic, setProfilePic] = useState<string | null>(null);

  useEffect(() => {
    setProfilePic(loadProfilePic());
    // Re-sync when the page gains focus (e.g. user uploaded on another tab)
    const onFocus = () => setProfilePic(loadProfilePic());
    window.addEventListener("focus", onFocus);
    return () => window.removeEventListener("focus", onFocus);
  }, []);

  return (
    <div className="flex flex-col h-full w-[260px] bg-[#F7F7F9] border-r border-zinc-200/60 font-sans">
      {/* Header */}
      <div className="h-16 px-4 flex items-center justify-between shrink-0">
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="shrink-0">
            <img src="/logo.webp" alt="LISTA Logo" className="h-7 w-auto object-contain drop-shadow-sm" />
          </div>
          <span className="text-[15px] font-bold text-zinc-900 tracking-tight">LISTA Portal</span>
        </Link>
        <button className="text-zinc-400 hover:text-zinc-600 transition-colors bg-white border border-zinc-200 shadow-sm p-1 rounded-md hidden md:flex">
          <SidebarIcon className="h-3.5 w-3.5" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto px-3 py-2 no-scrollbar flex flex-col gap-6">
        {/* Top Actions */}
        <div className="space-y-0.5">
          <button className="w-full flex items-center gap-3 px-3 py-2 text-sm text-zinc-600 hover:bg-zinc-200/50 hover:text-zinc-900 rounded-lg transition-colors">
            <Search className="h-4 w-4 text-zinc-400" />
            <span>Quick search</span>
          </button>
          
          <Link href="/trainee/announcements">
            <div className={cn(
              "w-full flex items-center justify-between px-3 py-2 text-sm rounded-lg transition-colors cursor-pointer",
              location === "/trainee/announcements" ? "bg-white shadow-sm border border-zinc-200/60 text-zinc-900 font-medium" : "text-zinc-600 hover:bg-zinc-200/50 hover:text-zinc-900"
            )}>
              <div className="flex items-center gap-3">
                <Bell className={cn("h-4 w-4", location === "/trainee/announcements" ? "text-indigo-600" : "text-zinc-400")} />
                <span>Notifications</span>
              </div>
              {announcementCount > 0 && (
                <span className="text-[10px] font-medium bg-zinc-200/70 text-zinc-600 px-1.5 py-0.5 rounded-md">
                  {announcementCount}
                </span>
              )}
            </div>
          </Link>
        </div>

        {/* Main Menu */}
        <div>
          <div className="px-3 mb-2">
            <h3 className="text-xs font-medium text-zinc-500">Menu</h3>
          </div>
          <div className="space-y-0.5">
            {MAIN_MENU.map((item) => {
              const isActive = location === item.href;
              return (
                <Link key={item.href} href={item.href}>
                  <div
                    className={cn(
                      "group flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-all duration-200 cursor-pointer",
                      isActive
                        ? "bg-white shadow-[0_1px_3px_rgba(0,0,0,0.05)] border border-zinc-200/60 text-zinc-900 font-medium"
                        : "text-zinc-600 hover:bg-zinc-200/50 hover:text-zinc-900"
                    )}
                  >
                    <item.icon className={cn("h-4 w-4", isActive ? "text-indigo-600" : "text-zinc-400 group-hover:text-zinc-600")} />
                    {item.label}
                  </div>
                </Link>
              );
            })}
          </div>
        </div>

        {/* Preferences */}
        <div className="mt-auto pt-4 border-t border-zinc-200/60">
          <div className="space-y-0.5">
            {PREFERENCES_MENU.map((item) => {
              const isActive = location === item.href;
              return (
                <Link key={item.label} href={item.href}>
                  <div
                    className={cn(
                      "group flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-all duration-200 cursor-pointer",
                      isActive
                        ? "bg-white shadow-[0_1px_3px_rgba(0,0,0,0.05)] border border-zinc-200/60 text-zinc-900 font-medium"
                        : "text-zinc-600 hover:bg-zinc-200/50 hover:text-zinc-900"
                    )}
                  >
                    <item.icon className={cn("h-4 w-4", isActive ? "text-indigo-600" : "text-zinc-400 group-hover:text-zinc-600")} />
                    {item.label}
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </div>

      {/* User Profile Footer */}
      <div className="p-3 border-t border-zinc-200/60 shrink-0 bg-[#F7F7F9]">
        <button className="w-full flex items-center gap-3 p-2 hover:bg-zinc-200/50 rounded-lg transition-colors text-left group">
          <AvatarInitials name={user?.name || "Trainee"} src={profilePic} size="sm" className="shadow-sm border border-zinc-200/50" />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-zinc-900 truncate">{user?.name || "Trainee User"}</p>
            <p className="text-[11px] text-zinc-500 truncate">Free account</p>
          </div>
          <ChevronsUpDown className="h-4 w-4 text-zinc-400 group-hover:text-zinc-600 shrink-0" />
        </button>
      </div>
    </div>
  );
}
