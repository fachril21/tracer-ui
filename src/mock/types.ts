type ProjectRole = "pemilik" | "anggota" | "admin";

type InstallationStatus = "waiting" | "detected";

type MockProject = {
  id: string;
  name: string;
  siteUrl: string;
  installation: InstallationStatus;
};

type DailyPoint = {
  date: Date;
  sessions: number;
  problemSessions: number;
  // Hari dengan lonjakan sesi bermasalah, dihitung sebelum filter diterapkan
  isSpike: boolean;
};

type SmartEventKind = "rage_click" | "dead_click" | "js_error";

type SessionIntegrity = "complete" | "has_gap" | "unknown";

type MockSession = {
  id: string;
  startedAt: Date;
  durationSeconds: number;
  browser: string;
  os: string;
  device: "Desktop" | "Mobile" | "Tablet";
  source: string;
  country: string;
  entryPage: string;
  problemScore: number;
  smartEvents: Record<SmartEventKind, number>;
  integrity: SessionIntegrity;
  // Posisi kejadian di sepanjang sesi (0 sampai 1), dipakai garis jejak
  trace: { at: number; kind: "page" | SmartEventKind | "network_error" }[];
};

type PopularPage = {
  path: string;
  sessions: number;
  clickShare: number;
  avgScrollDepth: number;
};

// Dimensi yang bisa dipakai menyaring dashboard dan daftar sesi
type FilterKey = "device" | "source" | "signal" | "page" | "browser" | "country";

type DashboardFilters = Partial<Record<FilterKey, string>>;

type PeriodPreset = "7" | "30" | "90" | "custom";

type Period = {
  preset: PeriodPreset;
  // Hari pertama dan terakhir, keduanya termasuk
  from: Date;
  to: Date;
  days: number;
};

type DashboardQuery = {
  filters: DashboardFilters;
  period: Period;
  compare: boolean;
  onlyProblems: boolean;
};

type OverviewMetricId = "sessions" | "problems" | "events" | "duration" | "scroll" | "active";

type OverviewMetric = {
  id: OverviewMetricId;
  label: string;
  value: number;
  unit: "angka" | "durasi" | "persen";
  // Persentase perubahan terhadap periode sebelumnya, null bila pembanding mati
  deltaPercent: number | null;
  // Naik dianggap baik, turun dianggap baik, atau netral
  goodDirection: "up" | "down" | "neutral";
};

export type {
  DailyPoint,
  DashboardFilters,
  DashboardQuery,
  FilterKey,
  InstallationStatus,
  MockProject,
  MockSession,
  OverviewMetric,
  OverviewMetricId,
  PopularPage,
  Period,
  PeriodPreset,
  ProjectRole,
  SessionIntegrity,
  SmartEventKind,
};
