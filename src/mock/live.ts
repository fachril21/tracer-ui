import { PAGE_POOL, PAGE_SHARES, SOURCES } from "./dimensions";
import { createRandom, hashText, pickWeighted } from "./random";
import type { MockSession, SmartEventKind } from "./types";
import type { LiveScenario } from "@/state/demo-context";

type LiveVisitor = {
  id: string;
  startedAt: number;
  device: MockSession["device"];
  browser: string;
  os: string;
  source: string;
  country: string;
  path: string;
  pageCount: number;
  signal: SmartEventKind | null;
  // Waktu (ms) pengunjung ditandai pergi; barisnya memudar lalu dihapus
  leavingAt: number | null;
};

const DEVICE_PROFILES = [
  { device: "Mobile", browser: "Chrome 134", os: "Android 14" },
  { device: "Mobile", browser: "Safari 18", os: "iOS 18" },
  { device: "Mobile", browser: "Chrome 133", os: "Android 13" },
  { device: "Desktop", browser: "Chrome 134", os: "Windows 11" },
  { device: "Desktop", browser: "Safari 18", os: "macOS 15" },
  { device: "Desktop", browser: "Edge 134", os: "Windows 11" },
  { device: "Tablet", browser: "Safari 18", os: "iPadOS 18" },
] as const;
const DEVICE_WEIGHTS = [30, 24, 9, 18, 8, 7, 4] as const;
const SIGNALS: SmartEventKind[] = ["rage_click", "dead_click", "js_error"];

const INITIAL_COUNT: Record<LiveScenario, number> = { ramai: 36, sepi: 5, kosong: 0, terputus: 14 };
const TICK_MS = 3000;
// Lama baris pengunjung yang pergi tetap terlihat sebelum dihapus
const LEAVE_FADE_MS = 1200;
const MAX_SESSION_SECONDS = 600;

function randomVisitor(random: () => number, projectId: string, serial: number, startedAt: number): LiveVisitor {
  const profile = pickWeighted(DEVICE_PROFILES, DEVICE_WEIGHTS, random);
  return {
    id: `lv_${hashText(`${projectId}:live:${serial}`).toString(16).padStart(8, "0").slice(0, 8)}`,
    startedAt,
    device: profile.device,
    browser: profile.browser,
    os: profile.os,
    source: pickWeighted(SOURCES, [38, 24, 21, 9, 8], random),
    country: pickWeighted(["Indonesia", "Malaysia", "Singapura"] as const, [93, 4, 3], random),
    path: pickWeighted(PAGE_POOL, PAGE_SHARES, random),
    pageCount: 1,
    signal: random() < 0.1 ? (SIGNALS[Math.floor(random() * SIGNALS.length)] ?? null) : null,
    leavingAt: null,
  };
}

function initialVisitors(projectId: string, scenario: LiveScenario, now: number): LiveVisitor[] {
  const random = createRandom(hashText(`live:${projectId}:${scenario}`));
  return Array.from({ length: INITIAL_COUNT[scenario] }, (_, index) => {
    const startedAt = now - Math.round(random() * random() * MAX_SESSION_SECONDS * 1000) - 4000;
    const visitor = randomVisitor(random, projectId, index, startedAt);
    return { ...visitor, pageCount: 1 + Math.floor(random() * 4) };
  }).sort((a, b) => b.startedAt - a.startedAt);
}

// Satu denyut pembaruan: sebagian pergi, sebagian masuk, sebagian pindah halaman. Tidak mengubah daftar lama.
function advanceVisitors(
  current: LiveVisitor[],
  projectId: string,
  scenario: LiveScenario,
  now: number,
  serial: number,
): { visitors: LiveVisitor[]; serial: number } {
  const random = createRandom(hashText(`tick:${projectId}:${serial}`));
  const isBusy = scenario === "ramai";
  const leaveChance = isBusy ? 0.06 : 0.1;
  const stillHere = current.filter((visitor) => visitor.leavingAt === null || now - visitor.leavingAt < LEAVE_FADE_MS);
  const activeCount = stillHere.filter((visitor) => visitor.leavingAt === null).length;

  let nextSerial = serial + 1;
  const updated = stillHere.map((visitor) => {
    if (visitor.leavingAt !== null) return visitor;
    const age = (now - visitor.startedAt) / 1000;
    if (activeCount > 2 && (random() < leaveChance || age > MAX_SESSION_SECONDS)) {
      return { ...visitor, leavingAt: now };
    }
    if (random() < 0.14) {
      const path = pickWeighted(PAGE_POOL, PAGE_SHARES, random);
      const signal = visitor.signal ?? (random() < 0.08 ? (SIGNALS[Math.floor(random() * SIGNALS.length)] ?? null) : null);
      return { ...visitor, path, pageCount: visitor.pageCount + 1, signal };
    }
    return visitor;
  });

  const joinCount = isBusy ? Math.floor(random() * 4) : random() < 0.35 ? 1 : 0;
  const joined = Array.from({ length: joinCount }, () => {
    nextSerial += 1;
    return randomVisitor(random, projectId, nextSerial + 1000, now);
  });
  return { visitors: [...joined, ...updated].sort((a, b) => b.startedAt - a.startedAt), serial: nextSerial };
}

// Lama rekaman tiruan yang diulang selama pengunjung masih ada, supaya tontonan langsung selalu punya kejadian
const WATCH_SECONDS = 240;

// Sesi tiruan untuk pemutar: kejadiannya diturunkan dari sinyal pengunjung, bukan rekaman nyata
function visitorToSession(visitor: LiveVisitor): MockSession {
  const events = {
    rage_click: visitor.signal === "rage_click" ? 3 : 0,
    dead_click: visitor.signal === "dead_click" ? 2 : 0,
    js_error: visitor.signal === "js_error" ? 1 : 0,
  };
  const trace: MockSession["trace"] = [
    { at: 0.02, kind: "page" },
    { at: 0.3, kind: "page" },
    ...(visitor.signal === null ? [] : [{ at: 0.45, kind: visitor.signal }]),
    { at: 0.62, kind: "page" },
  ];
  return {
    id: visitor.id,
    startedAt: new Date(visitor.startedAt),
    durationSeconds: WATCH_SECONDS,
    browser: visitor.browser,
    os: visitor.os,
    device: visitor.device,
    source: visitor.source,
    country: visitor.country,
    entryPage: visitor.path,
    problemScore: events.rage_click * 8 + events.dead_click * 4 + events.js_error * 12,
    smartEvents: events,
    integrity: "complete",
    trace,
  };
}

export { LEAVE_FADE_MS, TICK_MS, WATCH_SECONDS, advanceVisitors, initialVisitors, visitorToSession };
export type { LiveVisitor };
