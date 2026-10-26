import { BROWSER_FAMILIES, COUNTRIES, PAGE_POOL, PAGE_SHARES, SOURCES } from "./dimensions";
import { createRandom, hashText, pickWeighted } from "./random";
import type { DashboardQuery, MockSession, SmartEventKind } from "./types";

const DEVICES: { browser: string; os: string; device: MockSession["device"] }[] = [
  { browser: "Chrome 128", os: "Android 14", device: "Mobile" },
  { browser: "Safari 17", os: "iOS 17", device: "Mobile" },
  { browser: "Chrome 129", os: "Windows 11", device: "Desktop" },
  { browser: "Edge 128", os: "Windows 10", device: "Desktop" },
  { browser: "Safari 17", os: "macOS 14", device: "Desktop" },
  { browser: "Safari 17", os: "iPadOS 17", device: "Tablet" },
  { browser: "Firefox 130", os: "Windows 11", device: "Desktop" },
  { browser: "Samsung Internet 25", os: "Android 13", device: "Mobile" },
];
const DEVICE_WEIGHTS = [34, 24, 14, 5, 8, 4, 4, 7] as const;

type SessionSeed = {
  minutesAgo: number;
  durationSeconds: number;
  deviceIndex: number;
  pageIndex: number;
  events: Record<SmartEventKind, number>;
  integrity: MockSession["integrity"];
  trace: MockSession["trace"];
};

// Lima sesi utama yang selalu muncul di atas, ditulis tangan supaya garis jejaknya punya cerita
const FEATURED_SEEDS: SessionSeed[] = [
  {
    minutesAgo: 14,
    durationSeconds: 412,
    deviceIndex: 0,
    pageIndex: 4,
    events: { rage_click: 6, dead_click: 3, js_error: 2 },
    integrity: "complete",
    trace: [
      { at: 0.04, kind: "page" },
      { at: 0.22, kind: "page" },
      { at: 0.41, kind: "page" },
      { at: 0.58, kind: "rage_click" },
      { at: 0.63, kind: "rage_click" },
      { at: 0.7, kind: "js_error" },
      { at: 0.86, kind: "dead_click" },
    ],
  },
  {
    minutesAgo: 47,
    durationSeconds: 186,
    deviceIndex: 1,
    pageIndex: 3,
    events: { rage_click: 4, dead_click: 5, js_error: 0 },
    integrity: "complete",
    trace: [
      { at: 0.06, kind: "page" },
      { at: 0.33, kind: "dead_click" },
      { at: 0.52, kind: "dead_click" },
      { at: 0.74, kind: "rage_click" },
    ],
  },
  {
    minutesAgo: 125,
    durationSeconds: 903,
    deviceIndex: 2,
    pageIndex: 2,
    events: { rage_click: 2, dead_click: 1, js_error: 5 },
    integrity: "has_gap",
    trace: [
      { at: 0.03, kind: "page" },
      { at: 0.19, kind: "js_error" },
      { at: 0.31, kind: "page" },
      { at: 0.46, kind: "js_error" },
      { at: 0.47, kind: "network_error" },
      { at: 0.8, kind: "js_error" },
    ],
  },
  {
    minutesAgo: 260,
    durationSeconds: 97,
    deviceIndex: 0,
    pageIndex: 5,
    events: { rage_click: 3, dead_click: 2, js_error: 1 },
    integrity: "complete",
    trace: [
      { at: 0.08, kind: "page" },
      { at: 0.5, kind: "rage_click" },
      { at: 0.55, kind: "rage_click" },
      { at: 0.91, kind: "js_error" },
    ],
  },
  {
    minutesAgo: 610,
    durationSeconds: 1288,
    deviceIndex: 4,
    pageIndex: 1,
    events: { rage_click: 1, dead_click: 4, js_error: 1 },
    integrity: "unknown",
    trace: [
      { at: 0.02, kind: "page" },
      { at: 0.28, kind: "page" },
      { at: 0.44, kind: "dead_click" },
      { at: 0.66, kind: "dead_click" },
      { at: 0.78, kind: "js_error" },
    ],
  },
];

const GENERATED_COUNT = 600;
const SPREAD_DAYS = 100;
const MINUTES_PER_DAY = 1440;

function problemScoreOf(events: Record<SmartEventKind, number>): number {
  return events.rage_click * 8 + events.dead_click * 4 + events.js_error * 12;
}

function buildTrace(
  events: Record<SmartEventKind, number>,
  random: () => number,
): MockSession["trace"] {
  const trace: MockSession["trace"] = [];
  const pageCount = 1 + Math.floor(random() * 4);
  for (let index = 0; index < pageCount; index += 1) {
    trace.push({ at: 0.03 + (index / pageCount) * 0.7 + random() * 0.05, kind: "page" });
  }
  const kinds: SmartEventKind[] = ["rage_click", "dead_click", "js_error"];
  for (const kind of kinds) {
    // Satu penanda per jenis cukup, jumlah sebenarnya ada di hitungan kejadian
    if (events[kind] > 0) trace.push({ at: 0.3 + random() * 0.65, kind });
  }
  return trace.sort((a, b) => a.at - b.at);
}

function randomEvents(random: () => number): Record<SmartEventKind, number> {
  if (random() < 0.4) return { rage_click: 0, dead_click: 0, js_error: 0 };
  const pick = (chance: number, max: number) => (random() < chance ? 1 + Math.floor(random() * max) : 0);
  const events = { rage_click: pick(0.35, 5), dead_click: pick(0.5, 5), js_error: pick(0.25, 4) };
  const hasAny = events.rage_click + events.dead_click + events.js_error > 0;
  return hasAny ? events : { ...events, dead_click: 1 };
}

function sessionId(projectId: string, index: number): string {
  return `ses_${hashText(`${projectId}:${index}`).toString(16).padStart(8, "0").slice(0, 8)}`;
}

function featuredSessions(now: Date, projectId: string): MockSession[] {
  return FEATURED_SEEDS.map((seed, index) => {
    const device = DEVICES[seed.deviceIndex] ?? DEVICES[0]!;
    return {
      id: sessionId(projectId, index),
      startedAt: new Date(now.getTime() - seed.minutesAgo * 60000),
      durationSeconds: seed.durationSeconds,
      browser: device.browser,
      os: device.os,
      device: device.device,
      source: SOURCES[index % SOURCES.length] ?? SOURCES[0],
      country: COUNTRIES[0],
      entryPage: PAGE_POOL[seed.pageIndex] ?? "/",
      problemScore: problemScoreOf(seed.events),
      smartEvents: seed.events,
      integrity: seed.integrity,
      trace: seed.trace,
    };
  });
}

function generatedSessions(now: Date, projectId: string): MockSession[] {
  const random = createRandom(hashText(`sesi:${projectId}`));
  return Array.from({ length: GENERATED_COUNT }, (_, offset) => {
    const index = FEATURED_SEEDS.length + offset;
    const device = pickWeighted(DEVICES, DEVICE_WEIGHTS, random);
    const events = randomEvents(random);
    const minutesAgo = 700 + random() * SPREAD_DAYS * MINUTES_PER_DAY;
    return {
      id: sessionId(projectId, index),
      startedAt: new Date(now.getTime() - minutesAgo * 60000),
      durationSeconds: Math.round(25 + random() * random() * 1500),
      browser: device.browser,
      os: device.os,
      device: device.device,
      source: pickWeighted(SOURCES, [38, 24, 21, 9, 8], random),
      country: pickWeighted(COUNTRIES, [91, 3, 3, 3], random),
      entryPage: pickWeighted(PAGE_POOL, PAGE_SHARES, random),
      problemScore: problemScoreOf(events),
      smartEvents: events,
      integrity: pickWeighted(["complete", "has_gap", "unknown"] as const, [86, 9, 5], random),
      trace: buildTrace(events, random),
    };
  });
}

function buildSessionPool(projectId: string, now: Date): MockSession[] {
  return [...featuredSessions(now, projectId), ...generatedSessions(now, projectId)].sort(
    (a, b) => b.startedAt.getTime() - a.startedAt.getTime(),
  );
}

function browserFamily(browser: string): string {
  const family = browser.split(" ")[0] ?? browser;
  return (BROWSER_FAMILIES as readonly string[]).includes(family) ? family : "Lainnya";
}

function filterSessions(pool: MockSession[], query: DashboardQuery): MockSession[] {
  const { filters, period, onlyProblems } = query;
  const start = period.from.getTime();
  const end = new Date(period.to.getFullYear(), period.to.getMonth(), period.to.getDate() + 1).getTime();
  return pool.filter((session) => {
    const time = session.startedAt.getTime();
    if (time < start || time >= end) return false;
    if (onlyProblems && session.problemScore === 0) return false;
    if (filters.device !== undefined && session.device !== filters.device) return false;
    if (filters.source !== undefined && session.source !== filters.source) return false;
    if (filters.country !== undefined && session.country !== filters.country) return false;
    if (filters.page !== undefined && session.entryPage !== filters.page) return false;
    if (filters.browser !== undefined && browserFamily(session.browser) !== filters.browser) return false;
    if (filters.signal !== undefined && session.smartEvents[filters.signal as SmartEventKind] === 0) return false;
    return true;
  });
}

function findSession(projectId: string, sessionId: string, now: Date): MockSession | null {
  return buildSessionPool(projectId, now).find((session) => session.id === sessionId) ?? null;
}

export { buildSessionPool, filterSessions, findSession };
