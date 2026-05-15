import React, { useState } from "react";
import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";
import { useAuth } from "@/context/auth-context";
import { motion, AnimatePresence } from "framer-motion";
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
}

export function ModernSidebar({ 
  menuItems, 
  roleName = "Administrator", 
  logoHref = "/" 
}: ModernSidebarProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [location, setLocation] = useLocation();
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
    setLocation("/");
  };

  return (
    <motion.div 
      initial={false}
      animate={{ 
        width: isCollapsed ? 80 : 260,
      }}
      transition={{ type: "spring", stiffness: 350, damping: 35 }}
      className="h-screen bg-white border-r border-gray-100 flex flex-col fixed md:relative z-50 font-sans select-none hidden md:flex"
    >
      {/* Header - Minimal Pinterest Style with Consistent Toggle Position */}
      <div className="h-20 flex items-center px-4 shrink-0 group/header">
        <div className={cn("flex items-center gap-3 flex-1 min-w-0", isCollapsed && "justify-center")}>
          <div className="relative h-10 w-10 shrink-0 flex items-center justify-center">
            {/* Logo - only visible when NOT hovering while collapsed, or always when expanded */}
            <motion.div 
              animate={{ 
                opacity: (isCollapsed) ? 1 : 1,
                scale: isCollapsed ? 0.9 : 1 
              }}
              className={cn(
                "h-10 w-10 flex items-center justify-center cursor-pointer transition-all duration-300",
                isCollapsed && "group-hover/header:invisible group-hover/header:opacity-0 group-hover/header:scale-75"
              )}
            >
              <img src="/logo.webp" alt="L" className="h-7 w-auto object-contain" />
            </motion.div>

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

          <AnimatePresence>
            {!isCollapsed && (
              <motion.span 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="font-bold text-gray-900 text-[18px] tracking-tight"
              >
                LISTA
              </motion.span>
            )}
          </AnimatePresence>
        </div>
        
        {!isCollapsed && (
          <button 
            onClick={() => setIsCollapsed(true)}
            className="p-2 text-gray-400 hover:text-gray-900 hover:bg-gray-100 rounded-full transition-all"
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
              badge="3" 
              href={location.includes('admin') ? '/admin/announcements' : '/trainee/announcements'}
              active={location.includes('announcements')}
              isCollapsed={isCollapsed} 
            />
          </div>

          {/* Horizontal Separator */}
          <div className={cn(
            "h-px bg-gray-100 transition-all duration-300",
            isCollapsed ? "mx-4" : "mx-4"
          )} />

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
              "w-full flex items-center gap-3 p-2 rounded-full hover:bg-gray-100 transition-all text-left group",
              isCollapsed && "justify-center px-0"
            )}>
              <Avatar className="h-9 w-9 border border-gray-100 shrink-0">
                <AvatarFallback className="bg-gray-50 text-gray-600 text-xs font-bold">
                  {user?.name?.[0] || 'U'}
                </AvatarFallback>
              </Avatar>
              <AnimatePresence>
                {!isCollapsed && (
                  <motion.div
                    key="user-info"
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -10 }}
                    className="flex-1 min-w-0"
                  >
                    <p className="text-sm font-semibold text-gray-900 truncate">{user?.name || 'User'}</p>
                    <p className="text-[11px] text-gray-500 font-medium truncate uppercase tracking-wider">{roleName}</p>
                  </motion.div>
                )}
              </AnimatePresence>
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
    </motion.div>
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
        "group flex items-center rounded-full transition-all duration-200 relative",
        active
          ? "bg-gray-900 text-white font-semibold"
          : "text-gray-600 hover:bg-gray-100 font-medium",
        isCollapsed ? "h-12 w-12 justify-center" : "h-11 px-4 gap-3"
      )}
    >
      <Icon className={cn(
        "shrink-0 transition-colors", 
        active ? "text-white" : "text-gray-600",
        "h-[20px] w-[22px]"
      )} />
      
      <AnimatePresence mode="wait" initial={false}>
        {!isCollapsed && (
          <motion.span 
            key="label"
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -10 }}
            transition={{ duration: 0.15 }}
            className="flex-1 truncate text-[14.5px]"
          >
            {label}
          </motion.span>
        )}
      </AnimatePresence>
      
      <AnimatePresence>
        {!isCollapsed && badge && (
          <motion.span 
            key="badge"
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.5 }}
            className={cn(
              "text-[10px] font-bold px-2 py-0.5 rounded-full",
              active ? "bg-white/20 text-white" : "bg-gray-100 text-gray-500"
            )}
          >
            {badge}
          </motion.span>
        )}
      </AnimatePresence>
    </div>
  );

  if (href) {
    return <Link href={href}>{content}</Link>;
  }

  return <div className="cursor-pointer">{content}</div>;
}
