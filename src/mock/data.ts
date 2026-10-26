import { addDays, previousPeriod, startOfDay } from "@/lib/dashboard-query";
import { PAGE_POOL, PAGE_SHARES, filterWeights } from "./dimensions";
import { createRandom, hashText } from "./random";
import { buildSessionPool, filterSessions } from "./sessions";
import type {
  DailyPoint,
  DashboardQuery,
  MockProject,
  MockSession,
  OverviewMetric,
  PopularPage,
  SmartEventKind,
} from "./types";

const PROJECTS: MockProject[] = [
  { id: "kopi-senja", name: "Kopi Senja", siteUrl: "kopisenja.id", installation: "detected" },
  { id: "karir-nusa", name: "Portal Karir Nusa", siteUrl: "karir.nusa.co.id", installation: "detected" },
  { id: "klinik-sehat", name: "Klinik Sehat Bersama", siteUrl: "kliniksehat.example", installation: "waiting" },
];

const SERIES_DAYS = 220;
const WEEKDAY_FACTOR = [0.72, 1.0, 1.08, 1.1, 1.04, 0.96, 0.78] as const;
const SPIKE_RATE = 0.1;
const SPIKE_OFFSET_DAYS = 9;
const EVENTS_PER_PROBLEM = 3.4;
const SIGNAL_SESSION_FACTOR = 1.6;
// Di bawah ambang ini sesi dianggap tidak ada, supaya kombinasi filter yang sempit menghasilkan keadaan kosong
const MIN_VISIBLE_SESSIONS = 5;

function buildDailySeries(projectId: string, today: Date): DailyPoint[] {
  const random = createRandom(hashText(`seri:${projectId}`));
  const base = 1800 + (hashText(projectId) % 1800);
  const points: DailyPoint[] = [];
  for (let offset = SERIES_DAYS - 1; offset >= 0; offset -= 1) {
    const date = startOfDay(addDays(today, -offset));
    const trend = 1 + ((SERIES_DAYS - offset) / SERIES_DAYS) * 0.22;
    const noise = 0.9 + random() * 0.2;
    const weekday = WEEKDAY_FACTOR[date.getDay()] ?? 1;
    const sessions = Math.round(base * trend * weekday * noise);
    // Satu lonjakan masalah supaya grafik punya cerita
    const spike = offset === SPIKE_OFFSET_DAYS ? 2.4 : 1;
    const problemRate = (0.055 + random() * 0.03) * spike;
    const problemSessions = Math.round(sessions * problemRate);
    points.push({ date, sessions, problemSessions, isSpike: problemSessions / sessions > SPIKE_RATE });
  }
  return points;
}

function buildPopularPages(factor: number, pageFilter: string | undefined, projectId: string): PopularPage[] {
  const random = createRandom(hashText(`halaman:${projectId}`));
  const rows = PAGE_POOL.map((path, index) => ({
    path,
    share: PAGE_SHARES[index] ?? 0,
    jitter: 0.92 + random() * 0.16,
    clickJitter: 0.9 + random() * 0.2,
    scroll: Math.round(38 + random() * 46),
  }));
  const visible = pageFilter === undefined ? rows.slice(0, 5) : rows.filter((row) => row.path === pageFilter);
  return visible.map((row) => ({
    path: row.path,
    // Filter halaman sudah ikut dalam faktor, jadi porsi halaman tidak dihitung dua kali
    sessions: Math.round(
      (pageFilter === undefined ? (row.share / 100) * factor : factor) * 52000 * row.jitter,
    ),
    clickShare: Math.round(row.share * row.clickJitter),
    avgScrollDepth: row.scroll,
  }));
}

function sum(points: DailyPoint[], pick: (point: DailyPoint) => number): number {
  return points.reduce((total, point) => total + pick(point), 0);
}

function deltaOf(current: number, previous: number): number {
  if (previous <= 0) return 0;
  return Math.round(((current - previous) / previous) * 1000) / 10;
}

function between(points: DailyPoint[], from: Date, to: Date): DailyPoint[] {
  const start = from.getTime();
  const end = to.getTime();
  return points.filter((point) => point.date.getTime() >= start && point.date.getTime() <= end);
}

type OverviewData = {
  metrics: OverviewMetric[];
  series: DailyPoint[];
  // Kosong bila pembanding mati, selain itu sejajar indeks dengan series
  previousSeries: DailyPoint[];
  topSessions: MockSession[];
  popularPages: PopularPage[];
  smartEventTotals: Record<SmartEventKind, number>;
  lastSeenAt: Date;
};

function buildOverview(projectId: string, query: DashboardQuery, now: Date): OverviewData {
  const { filters, period, compare } = query;
  const weights = filterWeights(filters);
  const all = buildDailySeries(projectId, startOfDay(now));

  const scale = (point: DailyPoint): DailyPoint => {
    const base = Math.round(point.sessions * weights.factor);
    const problems = Math.min(base, Math.round(point.problemSessions * weights.factor * weights.problemBias));
    if (weights.signalShare === null) {
      return { ...point, sessions: base, problemSessions: problems };
    }
    const withSignal = Math.round(problems * weights.signalShare * SIGNAL_SESSION_FACTOR);
    return { ...point, sessions: withSignal, problemSessions: withSignal };
  };

  const series = between(all, period.from, period.to).map(scale);
  const previous = compare ? between(all, previousPeriod(period).from, previousPeriod(period).to).map(scale) : [];

  const sessions = sum(series, (point) => point.sessions);
  const problems = sum(series, (point) => point.problemSessions);
  // Dengan filter sinyal, hanya jenis kejadian itu yang dihitung
  const activeSignal = filters.signal as SmartEventKind | undefined;
  const signalSplit = { rage_click: 0.34, dead_click: 0.46, js_error: 0.2 } as const;
  const eventShare = activeSignal === undefined ? 1 : signalSplit[activeSignal];
  const smartEventTotals: Record<SmartEventKind, number> = { rage_click: 0, dead_click: 0, js_error: 0 };
  const events = Math.round(problems * EVENTS_PER_PROBLEM * eventShare);
  for (const kind of Object.keys(signalSplit) as SmartEventKind[]) {
    if (activeSignal === undefined) smartEventTotals[kind] = Math.round(events * signalSplit[kind]);
    else if (kind === activeSignal) smartEventTotals[kind] = events;
  }
  const avgDuration = Math.max(20, 168 + (hashText(projectId) % 40) + weights.durationShift);
  const avgScroll = Math.min(95, 52 + (hashText(`gulir:${projectId}`) % 12) + weights.scrollShift);
  const activeTime = Math.round(avgDuration * 0.62);

  const compared = (current: number, before: number): number | null =>
    compare ? deltaOf(current, before) : null;
  const previousSessions = sum(previous, (point) => point.sessions);
  const previousProblems = sum(previous, (point) => point.problemSessions);

  const metrics: OverviewMetric[] = [
    {
      id: "sessions",
      label: "Sesi",
      value: sessions,
      unit: "angka",
      deltaPercent: compared(sessions, previousSessions),
      goodDirection: "up",
    },
    {
      id: "problems",
      label: "Sesi bermasalah",
      value: problems,
      unit: "angka",
      deltaPercent: compared(problems, previousProblems),
      goodDirection: "down",
    },
    {
      id: "events",
      label: "Smart events",
      value: events,
      unit: "angka",
      deltaPercent: compared(events, Math.round(previousProblems * EVENTS_PER_PROBLEM * eventShare)),
      goodDirection: "down",
    },
    {
      id: "duration",
      label: "Rata-rata durasi",
      value: avgDuration,
      unit: "durasi",
      deltaPercent: compared(avgDuration, avgDuration * 0.94),
      goodDirection: "neutral",
    },
    {
      id: "scroll",
      label: "Kedalaman gulir",
      value: avgScroll,
      unit: "persen",
      deltaPercent: compared(avgScroll, avgScroll * 0.97),
      goodDirection: "up",
    },
    {
      id: "active",
      label: "Waktu aktif",
      value: activeTime,
      unit: "durasi",
      deltaPercent: compared(activeTime, activeTime * 1.02),
      goodDirection: "up",
    },
  ];

  const topSessions = filterSessions(buildSessionPool(projectId, now), query)
    .filter((session) => session.problemScore > 0)
    .sort((a, b) => b.problemScore - a.problemScore)
    .slice(0, 5);

  return {
    metrics,
    series,
    previousSeries: previous,
    topSessions,
    popularPages: buildPopularPages(weights.factor, filters.page, projectId),
    smartEventTotals,
    lastSeenAt: new Date(now.getTime() - 3 * 60000),
  };
}

export { MIN_VISIBLE_SESSIONS, PROJECTS, buildOverview };
export type { OverviewData };
