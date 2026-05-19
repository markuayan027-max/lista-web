import React, { useState } from "react";
import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";
import SiteLogo from "@/components/site-logo";
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
  secondaryMenuItems?: SidebarItemType[];
  roleName?: string;
  logoHref?: string;
  announcementRole?: "admin" | "staff" | "trainee";
  /** Drawer = mobile sheet; always expanded, no collapse chrome. */
  variant?: "desktop" | "drawer";
  profileHref?: string;
  onNavigate?: () => void;
}

export function ModernSidebar({ 
  menuItems,
  secondaryMenuItems,
  roleName = "Administrator", 
  logoHref = "/",
  announcementRole,
  variant = "desktop",
  profileHref,
  onNavigate,
}: ModernSidebarProps) {
  const isDrawer = variant === "drawer";
  const [isCollapsed, setIsCollapsed] = useState(false);
  const collapsed = isDrawer ? false : isCollapsed;
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

  const handleLogout = async () => {
    await logout();
    setLocation("/");
    onNavigate?.();
  };

  const settingsHref =
    profileHref ??
    (location.includes("admin") ? "/admin/settings" : "/trainee/profile");

  const navigateTo = (href: string) => {
    setLocation(href);
    onNavigate?.();
  };

  return (
    <div
      className={cn(
        "h-screen bg-sidebar border-r border-sidebar-border flex flex-col font-sans select-none transition-all duration-300 ease-in-out z-50",
        isDrawer
          ? "relative w-full h-full flex"
          : "fixed md:relative hidden md:flex",
        !isDrawer && (collapsed ? "w-[80px]" : "w-[260px]")
      )}
    >
      {/* Header - Minimal Pinterest Style with Consistent Toggle Position */}
      <div className="h-20 flex items-center px-4 shrink-0 group/header overflow-hidden">
        <div className={cn("flex items-center flex-1 min-w-0 transition-all duration-300", collapsed ? "justify-center" : "gap-3")}>
          <div className="relative h-10 w-10 shrink-0 flex items-center justify-center">
            {/* Logo - only visible when NOT hovering while collapsed, or always when expanded */}
            <div 
              className={cn(
                "h-10 w-10 flex items-center justify-center cursor-pointer transition-all duration-300",
                collapsed && !isDrawer && "scale-90 group-hover/header:opacity-0 group-hover/header:scale-75"
              )}
            >
              <Link href={logoHref}>
                <SiteLogo alt="LISTA" className="h-7 w-auto object-contain" />
              </Link>
            </div>

            {/* Expand Button - shows on hover when collapsed */}
            {!isDrawer && isCollapsed && (
              <button 
                onClick={() => setIsCollapsed(false)}
                className="absolute inset-0 flex items-center justify-center text-foreground opacity-0 group-hover/header:opacity-100 scale-75 group-hover/header:scale-110 transition-all duration-300 z-10 hover:bg-sidebar-accent rounded-full"
                title="Expand Sidebar"
              >
                <PanelLeftOpen className="h-5 w-5" />
              </button>
            )}
          </div>

          <span 
            className={cn(
              "font-bold text-sidebar-foreground text-[18px] tracking-tight whitespace-nowrap overflow-hidden transition-all duration-300",
              collapsed ? "w-0 min-w-0 opacity-0" : "max-w-[100px] opacity-100"
            )}
          >
            LISTA
          </span>
        </div>
        
        {!isDrawer && (
        <button 
          onClick={() => setIsCollapsed(true)}
          className={cn(
            "p-2 text-muted-foreground hover:text-foreground hover:bg-sidebar-accent rounded-full transition-all duration-300 shrink-0",
            collapsed ? "w-0 opacity-0 p-0 overflow-hidden" : "w-9 opacity-100"
          )}
          title="Collapse Sidebar"
        >
          <PanelLeftClose className="h-5 w-5" />
        </button>
        )}
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
              isCollapsed={collapsed}
              onNavigate={onNavigate}
            />
          </div>

          {/* Horizontal Separator */}
          <div className="h-px bg-sidebar-border transition-all duration-300 mx-4" />

          {/* Navigation Menu */}

          {menuItems.map((item) => (
            <SidebarItem 
              key={item.href}
              href={item.href}
              icon={item.icon} 
              label={item.label} 
              badge={item.badge}
              active={location === item.href}
              isCollapsed={collapsed}
              onNavigate={onNavigate}
            />
          ))}

          {secondaryMenuItems && secondaryMenuItems.length > 0 && (
            <>
              <div className="h-px bg-sidebar-border transition-all duration-300 mx-4 my-1" />
              {secondaryMenuItems.map((item) => (
                <SidebarItem
                  key={item.href}
                  href={item.href}
                  icon={item.icon}
                  label={item.label}
                  active={location === item.href}
                  isCollapsed={collapsed}
                  onNavigate={onNavigate}
                />
              ))}
            </>
          )}
        </div>
      </div>

      {/* Footer / Settings & Profile */}
      <div className="mt-auto p-4 flex flex-col gap-2">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className={cn(
              "w-full flex items-center p-2 rounded-full hover:bg-sidebar-border transition-all duration-300 text-left group overflow-hidden",
              collapsed ? "justify-center px-0" : "gap-3"
            )}>
              <Avatar className="h-9 w-9 border border-sidebar-border shrink-0 transition-all duration-300">
                <AvatarFallback className="bg-muted text-muted-foreground text-xs font-bold">
                  {user?.name?.[0] || 'U'}
                </AvatarFallback>
              </Avatar>
              <div
                className={cn(
                  "flex-1 min-w-0 transition-all duration-300 overflow-hidden whitespace-nowrap",
                  collapsed ? "w-0 min-w-0 opacity-0" : "max-w-[150px] opacity-100"
                )}
              >
                <p className="text-sm font-semibold text-sidebar-foreground truncate">{user?.name || 'User'}</p>
                <p className="text-[11px] text-muted-foreground font-medium truncate uppercase tracking-wider">{roleName}</p>
              </div>
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align={collapsed ? "center" : "end"} side={collapsed ? "right" : "top"} className="w-56 mb-2 rounded-2xl p-1.5 shadow-xl border-sidebar-border">
            {secondaryMenuItems?.length ? (
              secondaryMenuItems.map((item) => (
                <DropdownMenuItem
                  key={item.href}
                  onClick={() => navigateTo(item.href)}
                  className="rounded-xl py-2.5"
                >
                  <item.icon className="mr-2 h-4 w-4" />
                  {item.label}
                </DropdownMenuItem>
              ))
            ) : (
              <DropdownMenuItem onClick={() => navigateTo(settingsHref)} className="rounded-xl py-2.5">
                <Settings2 className="mr-2 h-4 w-4" />
                Settings
              </DropdownMenuItem>
            )}
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleLogout} className="text-destructive rounded-xl py-2.5">
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
  isCollapsed,
  onNavigate,
}: { 
  icon: any; 
  label: string; 
  badge?: string;
  active?: boolean;
  href?: string;
  isCollapsed: boolean;
  onNavigate?: () => void;
}) {
  const content = (
    <div
      className={cn(
        "group flex items-center rounded-full transition-all duration-300 relative overflow-hidden",
        active
          ? "bg-sidebar-primary text-sidebar-primary-foreground font-semibold"
          : "text-muted-foreground hover:bg-sidebar-accent font-medium",
        isCollapsed ? "h-12 w-12 justify-center mx-auto" : "h-11 px-4 gap-3"
      )}
    >
      <Icon className={cn(
        "shrink-0 transition-colors duration-300", 
        active ? "text-sidebar-primary-foreground" : "text-muted-foreground",
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
              active ? "bg-sidebar-primary-foreground/20 text-sidebar-primary-foreground" : "bg-muted text-muted-foreground"
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
