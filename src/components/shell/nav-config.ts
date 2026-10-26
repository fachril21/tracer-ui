import {
  FolderOpen,
  Funnel,
  History,
  LayoutDashboard,
  MailCheck,
  MessageSquareText,
  MousePointerClick,
  Plug,
  Radio,
  ScrollText,
  Settings,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

type NavItem = {
  id: string;
  label: string;
  icon: LucideIcon;
  // Dipasang di belakang /p/:projectId, string kosong = beranda project
  path: string;
  // Hanya penanda khusus: titik status pemasangan
  indicator?: "installation" | "live";
};

type NavGroup = {
  id: string;
  label: string | null;
  items: NavItem[];
};

const PROJECT_GROUPS: NavGroup[] = [
  {
    id: "ringkasan",
    label: null,
    items: [{ id: "ikhtisar", label: "Ikhtisar", icon: LayoutDashboard, path: "" }],
  },
  {
    id: "rekaman",
    label: "Rekaman",
    items: [
      { id: "sesi", label: "Histori Sesi", icon: History, path: "/sessions" },
      { id: "live", label: "Live Users", icon: Radio, path: "/live", indicator: "live" },
    ],
  },
  {
    id: "analitik",
    label: "Analitik",
    items: [
      { id: "peta-klik", label: "Peta Klik", icon: MousePointerClick, path: "/click-map" },
      { id: "peta-gulir", label: "Peta Gulir", icon: ScrollText, path: "/scroll-map" },
      { id: "funnel", label: "Funnel", icon: Funnel, path: "/funnel" },
    ],
  },
  {
    id: "masukan",
    label: "Masukan",
    items: [{ id: "feedback", label: "Feedback", icon: MessageSquareText, path: "/feedback" }],
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
