// Hanya jalur di dalam aplikasi yang boleh jadi tujuan setelah masuk, supaya tautan tidak bisa mengarahkan ke situs lain
function safeNextPath(raw: string | null): string | null {
  if (raw === null) return null;
  if (!raw.startsWith("/") || raw.startsWith("//") || raw.includes("\\")) return null;
  if (raw === "/login" || raw.startsWith("/login/") || raw.startsWith("/login?")) return null;
  return raw;
}

type LoginUrlOptions = { next?: string; reason?: "berakhir" | "keluar" };

function buildLoginUrl({ next, reason }: LoginUrlOptions = {}): string {
  const params = new URLSearchParams();
  const safe = safeNextPath(next ?? null);
  if (safe !== null && safe !== "/") params.set("next", safe);
  if (reason !== undefined) params.set("alasan", reason);
  const query = params.toString();
  return query === "" ? "/login" : `/login?${query}`;
}

function formatClock(totalSeconds: number): string {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${String(seconds).padStart(2, "0")}`;
}

export { buildLoginUrl, formatClock, safeNextPath };
