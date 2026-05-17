import React, { useState } from "react";
import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";
import { useAuth } from "@/context/auth-context";
import {
  Search,
  Bell,
  BarChart3,
  Users,
  Calendar,
  Award,
  FileUp,
  Settings,
  ClipboardList,
  Settings2,
  PanelLeftClose,
  PanelLeftOpen,
  ChevronUp,
  LogOut,
  ChevronRight,
  Inbox,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAnnouncements } from "@/hooks/use-lista-data";
import { announcementCountForRole } from "@/lib/analytics-utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface SidebarItemType {
  href: string;
  label: string;
  icon: any;
  badge?: string;
}

interface ModernSidebarProps {
  menuItems: SidebarItemType[];
  roleName?: string;
  logoHref?: string;
  announcementRole?: "admin" | "staff" | "trainee";
}

export function ModernSidebar({ 
  menuItems, 
  roleName = "Administrator", 
  logoHref = "/",
  announcementRole,
}: ModernSidebarProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [location, setLocation] = useLocation();
  const { user, logout } = useAuth();
  const { data: announcements = [] } = useAnnouncements();

  const notifyRole: "admin" | "staff" | "trainee" =
    announcementRole ??
    (location.includes("/admin") ? "admin" : location.includes("/staff") ? "staff" : "trainee");
  const announcementCount = announcementCountForRole(announcements, notifyRole);
  const announcementsHref =
    notifyRole === "admin"
      ? "/admin/announcements"
      : notifyRole === "staff"
        ? "/staff/announcements"
        : "/trainee/announcements";

  const handleLogout = () => {
    logout();
    setLocation("/");
  };

  return (
    <div 
      className={cn(
        "h-screen bg-white border-r border-gray-100 flex flex-col fixed md:relative z-50 font-sans select-none hidden md:flex transition-all duration-300 ease-in-out",
        isCollapsed ? "w-[80px]" : "w-[260px]"
      )}
    >
      {/* Header - Minimal Pinterest Style with Consistent Toggle Position */}
      <div className="h-20 flex items-center px-4 shrink-0 group/header overflow-hidden">
        <div className={cn("flex items-center flex-1 min-w-0 transition-all duration-300", isCollapsed ? "justify-center" : "gap-3")}>
          <div className="relative h-10 w-10 shrink-0 flex items-center justify-center">
            {/* Logo - only visible when NOT hovering while collapsed, or always when expanded */}
            <div 
              className={cn(
                "h-10 w-10 flex items-center justify-center cursor-pointer transition-all duration-300",
                isCollapsed && "scale-90 group-hover/header:opacity-0 group-hover/header:scale-75"
              )}
            >
              <img src="/logo.webp" alt="L" className="h-7 w-auto object-contain" />
            </div>

            {/* Expand Button - shows on hover when collapsed */}
            {isCollapsed && (
              <button 
                onClick={() => setIsCollapsed(false)}
                className="absolute inset-0 flex items-center justify-center text-gray-900 opacity-0 group-hover/header:opacity-100 scale-75 group-hover/header:scale-110 transition-all duration-300 z-10 hover:bg-gray-100 rounded-full"
                title="Expand Sidebar"
              >
                <PanelLeftOpen className="h-5 w-5" />
              </button>
            )}
          </div>

          <span 
            className={cn(
              "font-bold text-gray-900 text-[18px] tracking-tight whitespace-nowrap overflow-hidden transition-all duration-300",
              isCollapsed ? "w-0 min-w-0 opacity-0" : "max-w-[100px] opacity-100"
            )}
          >
            LISTA
          </span>
        </div>
        
        <button 
          onClick={() => setIsCollapsed(true)}
          className={cn(
            "p-2 text-gray-400 hover:text-gray-900 hover:bg-gray-100 rounded-full transition-all duration-300 shrink-0",
            isCollapsed ? "w-0 opacity-0 p-0 overflow-hidden" : "w-9 opacity-100"
          )}
          title="Collapse Sidebar"
        >
          <PanelLeftClose className="h-5 w-5" />
        </button>
      </div>

      <div className="flex-1 flex flex-col py-4 overflow-y-auto no-scrollbar">
        <div className="flex flex-col gap-2 px-3">
          {/* Top Actions */}
          <div className="flex flex-col gap-2">
            <SidebarItem 
              icon={Bell} 
              label="Notifications" 
              badge={announcementCount > 0 ? String(announcementCount) : undefined}
              href={announcementsHref}
              active={location.includes('announcements')}
              isCollapsed={isCollapsed} 
            />
          </div>

          {/* Horizontal Separator */}
          <div className="h-px bg-gray-100 transition-all duration-300 mx-4" />

          {/* Navigation Menu */}

          {menuItems.map((item) => (
            <SidebarItem 
              key={item.href}
              href={item.href}
              icon={item.icon} 
              label={item.label} 
              badge={item.badge}
              active={location === item.href}
              isCollapsed={isCollapsed}
            />
          ))}
        </div>
      </div>

      {/* Footer / Settings & Profile */}
      <div className="mt-auto p-4 flex flex-col gap-2">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className={cn(
              "w-full flex items-center p-2 rounded-full hover:bg-gray-100 transition-all duration-300 text-left group overflow-hidden",
              isCollapsed ? "justify-center px-0" : "gap-3"
            )}>
              <Avatar className="h-9 w-9 border border-gray-100 shrink-0 transition-all duration-300">
                <AvatarFallback className="bg-gray-50 text-gray-600 text-xs font-bold">
                  {user?.name?.[0] || 'U'}
                </AvatarFallback>
              </Avatar>
              <div
                className={cn(
                  "flex-1 min-w-0 transition-all duration-300 overflow-hidden whitespace-nowrap",
                  isCollapsed ? "w-0 min-w-0 opacity-0" : "max-w-[150px] opacity-100"
                )}
              >
                <p className="text-sm font-semibold text-gray-900 truncate">{user?.name || 'User'}</p>
                <p className="text-[11px] text-gray-500 font-medium truncate uppercase tracking-wider">{roleName}</p>
              </div>
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align={isCollapsed ? "center" : "end"} side={isCollapsed ? "right" : "top"} className="w-56 mb-2 rounded-2xl p-1.5 shadow-xl border-gray-100">
            <DropdownMenuItem onClick={() => setLocation(location.includes('admin') ? '/admin/settings' : '/trainee/profile')} className="rounded-xl py-2.5">
              <Settings2 className="mr-2 h-4 w-4" />
              Settings
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleLogout} className="text-red-500 rounded-xl py-2.5">
              <LogOut className="mr-2 h-4 w-4" />
              Sign out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}

function SidebarItem({ 
  icon: Icon, 
  label, 
  badge, 
  active,
  href,
  isCollapsed
}: { 
  icon: any; 
  label: string; 
  badge?: string;
  active?: boolean;
  href?: string;
  isCollapsed: boolean;
}) {
  const content = (
    <div
      className={cn(
        "group flex items-center rounded-full transition-all duration-300 relative overflow-hidden",
        active
          ? "bg-gray-900 text-white font-semibold"
          : "text-gray-600 hover:bg-gray-100 font-medium",
        isCollapsed ? "h-12 w-12 justify-center mx-auto" : "h-11 px-4 gap-3"
      )}
    >
      <Icon className={cn(
        "shrink-0 transition-colors duration-300", 
        active ? "text-white" : "text-gray-600",
        "h-[20px] w-[22px]"
      )} />
      
      <div 
        className={cn(
          "flex items-center justify-between transition-all duration-300 overflow-hidden whitespace-nowrap",
          isCollapsed ? "w-0 min-w-0 opacity-0" : "max-w-[200px] opacity-100 flex-1"
        )}
      >
        <span className="truncate text-[14.5px]">
          {label}
        </span>
        
        {badge && (
          <span 
            className={cn(
              "text-[10px] font-bold px-2 py-0.5 rounded-full ml-2 shrink-0 transition-colors duration-300",
              active ? "bg-white/20 text-white" : "bg-gray-100 text-gray-500"
            )}
          >
            {badge}
          </span>
        )}
      </div>
    </div>
  );

  if (href) {
    return <Link href={href}>{content}</Link>;
  }

  return <div className="cursor-pointer">{content}</div>;
}
