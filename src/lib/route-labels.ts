// Nama bagian project untuk jejak navigasi dan judul dokumen
const SECTION_LABELS: Record<string, string> = {
  sessions: "Histori Sesi",
  "click-map": "Peta Klik",
  "scroll-map": "Peta Gulir",
  live: "Live Users",
  funnel: "Funnel",
  feedback: "Feedback",
  installation: "Pemasangan",
  settings: "Pengaturan Project",
};

const ADMIN_LABELS: Record<string, string> = {
  "/admin/projects": "Semua project",
  "/allowlist": "Allowlist Email",
  "/undangan": "Undangan project",
  "/login": "Masuk",
};

const APP_NAME = "Tracer";

// Judul dokumen: halaman dulu, lalu project, lalu nama aplikasi
function buildDocumentTitle(pathname: string, projectName: string | null): string {
  const adminLabel = Object.entries(ADMIN_LABELS).find(([prefix]) => pathname.startsWith(prefix))?.[1];
  if (adminLabel !== undefined) return `${adminLabel} · ${APP_NAME}`;
  if (projectName === null) return APP_NAME;

  const segments = pathname.split("/").filter((segment) => segment !== "");
  const section = segments[2];
  const page = section === undefined ? "Ikhtisar" : (SECTION_LABELS[section] ?? section);
  const detail = section === "sessions" && segments[3] !== undefined ? ` ${segments[3]}` : "";
  return `${page}${detail} · ${projectName} · ${APP_NAME}`;
}

export { SECTION_LABELS, buildDocumentTitle };
