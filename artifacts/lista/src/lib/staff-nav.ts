import type { LucideIcon } from "lucide-react";
import { Bell, Calendar, LayoutDashboard, Search, Users } from "lucide-react";

export type StaffNavPlacement = "sidebar" | "account";

export type StaffNavItem = {
  href: string;
  label: string;
  icon: LucideIcon;
  placements: StaffNavPlacement[];
};

/** Single source of truth for staff portal navigation. */
export const STAFF_NAV_ITEMS: StaffNavItem[] = [
  {
    href: "/staff",
    label: "Overview",
    icon: LayoutDashboard,
    placements: ["sidebar", "account"],
  },
  {
    href: "/staff/enrollments",
    label: "Enrollments",
    icon: Users,
    placements: ["sidebar", "account"],
  },
  {
    href: "/staff/search",
    label: "Search",
    icon: Search,
    placements: ["sidebar"],
  },
  {
    href: "/staff/schedule",
    label: "Schedule",
    icon: Calendar,
    placements: ["sidebar"],
  },
  {
    href: "/staff/announcements",
    label: "Announcements",
    icon: Bell,
    placements: ["sidebar"],
  },
];

export function staffSidebarNavItems(): StaffNavItem[] {
  return STAFF_NAV_ITEMS.filter((item) => item.placements.includes("sidebar"));
}

export function staffAccountNavItems(): StaffNavItem[] {
  return STAFF_NAV_ITEMS.filter((item) => item.placements.includes("account"));
}
