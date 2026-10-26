import { History, LayoutDashboard, MailCheck, MousePointerClick, Plug, ScrollText, Settings, FolderOpen } from "lucide-react";
import type { LucideIcon } from "lucide-react";

type NavItem = {
  id: string;
  label: string;
  icon: LucideIcon;
  // Dipasang di belakang /p/:projectId, string kosong = beranda project
  path: string;
  // Hanya penanda khusus: titik status pemasangan
  indicator?: "installation";
};

type NavGroup = {
  id: string;
  label: string | null;
  items: NavItem[];
};

// Item untuk fitur yang belum dibangun (Live Users, Funnel, Feedback) sengaja tidak ada
const PROJECT_GROUPS: NavGroup[] = [
  {
    id: "ringkasan",
    label: null,
    items: [{ id: "ikhtisar", label: "Ikhtisar", icon: LayoutDashboard, path: "" }],
  },
  {
    id: "rekaman",
    label: "Rekaman",
    items: [{ id: "sesi", label: "Histori Sesi", icon: History, path: "/sessions" }],
  },
  {
    id: "analitik",
    label: "Analitik",
    items: [
      { id: "peta-klik", label: "Peta Klik", icon: MousePointerClick, path: "/click-map" },
      { id: "peta-gulir", label: "Peta Gulir", icon: ScrollText, path: "/scroll-map" },
    ],
  },
];

const PROJECT_FOOTER_ITEMS: NavItem[] = [
  { id: "pemasangan", label: "Pemasangan", icon: Plug, path: "/installation", indicator: "installation" },
  { id: "pengaturan", label: "Pengaturan Project", icon: Settings, path: "/settings" },
];

const ADMIN_ITEMS: { id: string; label: string; icon: LucideIcon; to: string }[] = [
  { id: "semua-project", label: "Semua project", icon: FolderOpen, to: "/admin/projects" },
  { id: "allowlist", label: "Allowlist Email", icon: MailCheck, to: "/allowlist" },
];

export { ADMIN_ITEMS, PROJECT_FOOTER_ITEMS, PROJECT_GROUPS };
export type { NavGroup, NavItem };
