const integerFormatter = new Intl.NumberFormat("id-ID");
const percentFormatter = new Intl.NumberFormat("id-ID", { maximumFractionDigits: 1 });

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Agu", "Sep", "Okt", "Nov", "Des"] as const;

function formatCount(value: number): string {
  if (!Number.isFinite(value)) return "0";
  return integerFormatter.format(value);
}

function formatPercent(value: number): string {
  if (!Number.isFinite(value)) return "0%";
  return `${percentFormatter.format(value)}%`;
}

// Durasi ringkas: 1 j 04 m, 4 m 12 d, 38 d
function formatDuration(seconds: number): string {
  if (!Number.isFinite(seconds) || seconds <= 0) return "0 d";
  const total = Math.round(seconds);
  const hours = Math.floor(total / 3600);
  const minutes = Math.floor((total % 3600) / 60);
  const rest = total % 60;
  if (hours > 0) return `${hours} j ${String(minutes).padStart(2, "0")} m`;
  if (minutes > 0) return `${minutes} m ${String(rest).padStart(2, "0")} d`;
  return `${rest} d`;
}

// Jam pemutar: 02:15, atau 1:04:12 bila lebih dari satu jam
function formatClock(totalSeconds: number): string {
  const total = Math.max(0, Math.floor(totalSeconds));
  const hours = Math.floor(total / 3600);
  const minutes = Math.floor((total % 3600) / 60);
  const seconds = String(total % 60).padStart(2, "0");
  if (hours > 0) return `${hours}:${String(minutes).padStart(2, "0")}:${seconds}`;
  return `${String(minutes).padStart(2, "0")}:${seconds}`;
}

// Tanggal tanpa nol di depan, bulan tiga huruf: 9 Okt
function formatShortDate(date: Date): string {
  return `${date.getDate()} ${MONTHS[date.getMonth()]}`;
}

// 9 Okt 2026, 07.27
function formatDateTime(date: Date): string {
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");
  return `${formatShortDate(date)} ${date.getFullYear()}, ${hours}.${minutes}`;
}

// Waktu relatif untuk daftar: "12 mnt lalu", "3 j lalu", "kemarin"
function formatRelative(date: Date, now: Date): string {
  const diffMinutes = Math.max(0, Math.round((now.getTime() - date.getTime()) / 60000));
  if (diffMinutes < 1) return "baru saja";
  if (diffMinutes < 60) return `${diffMinutes} mnt lalu`;
  const diffHours = Math.round(diffMinutes / 60);
  if (diffHours < 24) return `${diffHours} j lalu`;
  const diffDays = Math.round(diffHours / 24);
  if (diffDays === 1) return "kemarin";
  return `${diffDays} hari lalu`;
}

export {
  formatClock,
  formatCount,
  formatDateTime,
  formatDuration,
  formatPercent,
  formatRelative,
  formatShortDate,
};
