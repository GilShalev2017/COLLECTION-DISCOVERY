import {
  LayoutDashboard,
  Download,
  BookOpen,
  Settings,
  Users,
  type LucideIcon,
} from "lucide-react";
import type { Page } from "../types";

export interface NavItem {
  id: Page;
  icon: LucideIcon; 
  label: string;
}

export const NAV: NavItem[] = [
  { id: "dashboard", icon: LayoutDashboard, label: "Dashboard" },
  { id: "import", icon: Download, label: "Import Collection" },
  { id: "browse", icon: BookOpen, label: "Browse" },
  { id: "users", icon: Users, label: "Users" },
  { id: "settings", icon: Settings, label: "Settings" },
];
