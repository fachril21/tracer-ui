import { createRandom, hashText } from "@/mock/random";
import type { MockSession, SmartEventKind } from "@/mock/types";

// Sesi dianggap masih berlangsung jika aktivitas terakhirnya baru saja terjadi
const LIVE_WINDOW_MS = 5 * 60 * 1000;
const SECONDS_PER_CHUNK = 3;

type SessionInfo = {
  startedAt: Date;
  lastActiveAt: Date;
  // Null selama sesi masih berlangsung
  endedAt: Date | null;
  isLive: boolean;
  durationSeconds: number;
  chunkCount: number;
  sizeKb: number;
  smartEventTotal: number;
  userAgent: string;
};

// Versi diambil dari nama, mis. "Chrome 128" menjadi "128"
function versionOf(label: string): string {
  return label.match(/\d+/)?.[0] ?? "120";
}

function userAgentFor(session: MockSession): string {
  const major = versionOf(session.browser);
  const osVersion = versionOf(session.os);
  const webkit = "AppleWebKit/537.36 (KHTML, like Gecko)";
  if (session.os.startsWith("Android")) {
    const mobile = session.device === "Mobile" ? " Mobile" : "";
    return `Mozilla/5.0 (Linux; Android ${osVersion}; K) ${webkit} Chrome/${major}.0.0.0${mobile} Safari/537.36`;
  }
  if (session.os.startsWith("iOS") || session.os.startsWith("iPadOS")) {
    const model = session.os.startsWith("iPadOS") ? "iPad; CPU OS" : "iPhone; CPU iPhone OS";
    return `Mozilla/5.0 (${model} ${osVersion}_4 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/${osVersion}.4 Mobile/15E148 Safari/604.1`;
  }
  const platform = session.os.startsWith("macOS") ? "Macintosh; Intel Mac OS X 10_15_7" : "Windows NT 10.0; Win64; x64";
  if (session.browser.startsWith("Firefox")) {
    return `Mozilla/5.0 (${platform}; rv:${major}.0) Gecko/20100101 Firefox/${major}.0`;
  }
  if (session.browser.startsWith("Safari")) {
    return `Mozilla/5.0 (${platform}) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/${major}.4 Safari/605.1.15`;
  }
  const tail = session.browser.startsWith("Edge") ? ` Edg/${major}.0.0.0` : "";
  return `Mozilla/5.0 (${platform}) ${webkit} Chrome/${major}.0.0.0 Safari/537.36${tail}`;
}

function buildSessionInfo(session: MockSession, now: Date): SessionInfo {
  const random = createRandom(hashText(`info:${session.id}`));
  const endTime = session.startedAt.getTime() + session.durationSeconds * 1000;
  const isLive = now.getTime() - endTime < LIVE_WINDOW_MS && endTime <= now.getTime() + LIVE_WINDOW_MS;
  const lastActiveAt = new Date(endTime);
  const chunkCount = Math.max(1, Math.ceil(session.durationSeconds / SECONDS_PER_CHUNK));
  // Rata-rata 5 sampai 9 KB per potongan rekaman
  const sizeKb = Math.round(chunkCount * (5 + random() * 4) * 10) / 10;
  const smartEventTotal = (Object.keys(session.smartEvents) as SmartEventKind[]).reduce(
    (sum, kind) => sum + session.smartEvents[kind],
    0,
  );

  return {
    startedAt: session.startedAt,
    lastActiveAt,
    endedAt: isLive ? null : lastActiveAt,
    isLive,
    durationSeconds: session.durationSeconds,
    chunkCount,
    sizeKb,
    smartEventTotal,
    userAgent: userAgentFor(session),
  };
}

export { buildSessionInfo };
export type { SessionInfo };
