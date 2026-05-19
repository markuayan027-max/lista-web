import type { LucideIcon } from "lucide-react";
import {
  Award,
  BookOpen,
  Calendar,
  ClipboardList,
  HelpCircle,
  Home,
  Settings,
} from "lucide-react";

export type TraineeNavPlacement = "sidebar" | "bottom" | "preferences";

export type TraineeNavItem = {
  href: string;
  label: string;
  shortLabel: string;
  icon: LucideIcon;
  placements: TraineeNavPlacement[];
};

/** Single source of truth for trainee portal navigation. */
export const TRAINEE_NAV_ITEMS: TraineeNavItem[] = [
  {
    href: "/trainee",
    label: "Dashboard",
    shortLabel: "Home",
    icon: Home,
    placements: ["sidebar", "bottom"],
  },
  {
    href: "/trainee/application",
    label: "Courses",
    shortLabel: "Courses",
    icon: BookOpen,
    placements: ["sidebar", "bottom"],
  },
  {
    href: "/trainee/tracking",
    label: "My Applications",
    shortLabel: "Track",
    icon: ClipboardList,
    placements: ["sidebar", "bottom"],
  },
  {
    href: "/trainee/schedule",
    label: "Schedule",
    shortLabel: "Schedule",
    icon: Calendar,
    placements: ["sidebar", "bottom"],
  },
  {
    href: "/trainee/certificate",
    label: "Certificates",
    shortLabel: "Certs",
    icon: Award,
    placements: ["sidebar", "bottom"],
  },
  {
    href: "/trainee/profile",
    label: "Preferences",
    shortLabel: "Profile",
    icon: Settings,
    placements: ["preferences"],
  },
  {
    href: "/trainee/help",
    label: "Help",
    shortLabel: "Help",
    icon: HelpCircle,
    placements: ["preferences"],
  },
];

export function traineeSidebarNavItems(): TraineeNavItem[] {
  return TRAINEE_NAV_ITEMS.filter((item) => item.placements.includes("sidebar"));
}

export function traineeBottomNavItems(): TraineeNavItem[] {
  return TRAINEE_NAV_ITEMS.filter((item) => item.placements.includes("bottom"));
}

export function traineePreferencesNavItems(): TraineeNavItem[] {
  return TRAINEE_NAV_ITEMS.filter((item) => item.placements.includes("preferences"));
}

/** Shape expected by `ModernSidebar` menuItems prop. */
export function traineeModernSidebarMenu() {
  return traineeSidebarNavItems().map(({ href, label, icon }) => ({
    href,
    label,
    icon,
  }));
}

/** Preferences block (Profile, Help) — sidebar footer + account dropdown. */
export function traineeSecondarySidebarMenu() {
  return traineePreferencesNavItems().map(({ href, label, icon }) => ({
    href,
    label,
    icon,
  }));
}
