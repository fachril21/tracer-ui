import { findOption } from "./dimensions";
import { PAGE_SECTIONS, foldOf, sectionAt } from "./page-model";
import type { DeviceKind } from "./page-model";
import { createRandom, hashText } from "./random";

type ClickKind = "klik" | "rage" | "dead";

type ClickPoint = { x: number; y: number; kind: ClickKind };

type ClickElement = {
  id: string;
  label: string;
  selector: string;
  clicks: number;
  share: number;
  rage: number;
  dead: number;
  // Kotak elemen sebagai pecahan lebar dan tinggi halaman
  box: { x: number; y: number; w: number; h: number };
};

type MapQuality = {
  level: "baik" | "rendah";
  sessions: number;
  // Porsi klik yang berhasil dipetakan ke elemen
  mappedShare: number;
};

type ClickMapData = {
  points: ClickPoint[];
  elements: ClickElement[];
  totalClicks: number;
  rageTotal: number;
  deadTotal: number;
  quality: MapQuality;
};

type Hotspot = {
  id: string;
  label: string;
  selector: string;
  x: number;
  y: number;
  w: number;
  h: number;
  base: number;
  // Peluang sebuah klik di sini terdeteksi rage atau dead
  rage: number;
  dead: number;
};

const HOTSPOTS: Hotspot[] = [
  { id: "menu", label: "Menu navigasi", selector: "nav > a", x: 0.42, y: 0.035, w: 0.3, h: 0.025, base: 14, rage: 0.02, dead: 0.01 },
  { id: "cart", label: "Ikon keranjang", selector: "header .cart", x: 0.92, y: 0.035, w: 0.06, h: 0.025, base: 12, rage: 0.04, dead: 0.02 },
  { id: "search", label: "Kolom pencarian", selector: "input[name=q]", x: 0.68, y: 0.035, w: 0.14, h: 0.025, base: 8, rage: 0.01, dead: 0.03 },
  { id: "banner", label: "Banner promo", selector: ".hero .banner", x: 0.5, y: 0.12, w: 0.5, h: 0.06, base: 9, rage: 0.08, dead: 0.36 },
  { id: "cta", label: "Tombol “Beli sekarang”", selector: ".hero a.cta", x: 0.74, y: 0.18, w: 0.18, h: 0.03, base: 20, rage: 0.05, dead: 0.03 },
  { id: "card1", label: "Kartu produk 1", selector: ".grid .card:nth-child(1)", x: 0.17, y: 0.33, w: 0.27, h: 0.15, base: 13, rage: 0.02, dead: 0.04 },
  { id: "card2", label: "Kartu produk 2", selector: ".grid .card:nth-child(2)", x: 0.5, y: 0.33, w: 0.27, h: 0.15, base: 10, rage: 0.02, dead: 0.04 },
  { id: "card3", label: "Kartu produk 3", selector: ".grid .card:nth-child(3)", x: 0.83, y: 0.33, w: 0.27, h: 0.15, base: 8, rage: 0.02, dead: 0.04 },
  { id: "review", label: "Tab ulasan", selector: ".reviews [role=tab]", x: 0.3, y: 0.51, w: 0.28, h: 0.03, base: 4, rage: 0.03, dead: 0.2 },
  { id: "promo", label: "Tombol “Pakai kode”", selector: "form.coupon button", x: 0.74, y: 0.72, w: 0.2, h: 0.03, base: 7, rage: 0.24, dead: 0.12 },
  { id: "footer", label: "Tautan footer", selector: "footer a", x: 0.3, y: 0.9, w: 0.4, h: 0.04, base: 3, rage: 0.01, dead: 0.02 },
];

const CLICKS_PER_SESSION = 2.6;
const BASE_SESSIONS_PER_DAY = 52000 / 30;
const LOW_SAMPLE_SESSIONS = 1200;
const MAX_POINTS = 900;
const MIN_POINTS = 40;

function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

// Box-Muller: dua angka seragam jadi satu angka berdistribusi normal
function gaussian(random: () => number): number {
  const u = Math.max(random(), 1e-9);
  return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * random());
}

function sessionsFor(path: string, device: DeviceKind, days: number): number {
  const pageShare = (findOption("page", path)?.share ?? 5) / 100;
  const deviceShare = (findOption("device", device)?.share ?? 33) / 100;
  return Math.round(BASE_SESSIONS_PER_DAY * days * pageShare * deviceShare);
}

function qualityOf(sessions: number, random: () => number): MapQuality {
  return {
    level: sessions < LOW_SAMPLE_SESSIONS ? "rendah" : "baik",
    sessions,
    mappedShare: Math.round(88 + random() * 9),
  };
}

function buildClickMap(projectId: string, path: string, device: DeviceKind, days: number): ClickMapData {
  const random = createRandom(hashText(`peta-klik:${projectId}:${path}:${device}`));
  const sessions = sessionsFor(path, device, days);
  const totalClicks = Math.round(sessions * CLICKS_PER_SESSION);

  const weighted = HOTSPOTS.map((hotspot) => ({ hotspot, strength: hotspot.base * (0.7 + random() * 0.6) }));
  const strengthSum = weighted.reduce((sum, item) => sum + item.strength, 0);
  const pointBudget = clamp(Math.round(totalClicks / 6), MIN_POINTS, MAX_POINTS);

  const points: ClickPoint[] = [];
  const elements: ClickElement[] = weighted.map(({ hotspot, strength }) => {
    const share = strength / strengthSum;
    const clicks = Math.round(totalClicks * share);
    const count = Math.max(1, Math.round(pointBudget * share));
    for (let index = 0; index < count; index += 1) {
      const roll = random();
      const kind: ClickKind = roll < hotspot.rage ? "rage" : roll < hotspot.rage + hotspot.dead ? "dead" : "klik";
      points.push({
        x: clamp(hotspot.x + gaussian(random) * hotspot.w * 0.2, 0.01, 0.99),
        y: clamp(hotspot.y + gaussian(random) * hotspot.h * 0.3, 0.005, 0.995),
        kind,
      });
    }
    return {
      id: hotspot.id,
      label: hotspot.label,
      selector: hotspot.selector,
      clicks,
      share: Math.round(share * 1000) / 10,
      rage: Math.round(clicks * hotspot.rage),
      dead: Math.round(clicks * hotspot.dead),
      box: {
        x: hotspot.x - hotspot.w / 2,
        y: hotspot.y - hotspot.h / 2,
        w: hotspot.w,
        h: hotspot.h,
      },
    };
  });

  elements.sort((a, b) => b.clicks - a.clicks);
  return {
    points,
    elements,
    totalClicks,
    rageTotal: elements.reduce((sum, element) => sum + element.rage, 0),
    deadTotal: elements.reduce((sum, element) => sum + element.dead, 0),
    quality: qualityOf(sessions, random),
  };
}

const BAND_COUNT = 20;

type ScrollBand = {
  index: number;
  // Rentang kedalaman pita sebagai pecahan tinggi halaman
  from: number;
  to: number;
  // Persen sesi yang mencapai pita ini
  reach: number;
  // Rata-rata detik yang dihabiskan di pita ini
  dwell: number;
};

type SectionAttention = { id: string; label: string; share: number; reach: number };

type ScrollMapData = {
  bands: ScrollBand[];
  avgDepth: number;
  reach50: number;
  reachEnd: number;
  fold: number;
  topSections: SectionAttention[];
  quality: MapQuality;
};

const DEVICE_RETENTION: Record<DeviceKind, number> = { Desktop: 0.972, Tablet: 0.962, Mobile: 0.945 };

function buildScrollMap(projectId: string, path: string, device: DeviceKind, days: number): ScrollMapData {
  const random = createRandom(hashText(`peta-gulir:${projectId}:${path}:${device}`));
  const sessions = sessionsFor(path, device, days);
  const retention = DEVICE_RETENTION[device];

  const bands: ScrollBand[] = [];
  let reach = 100;
  for (let index = 0; index < BAND_COUNT; index += 1) {
    const from = index / BAND_COUNT;
    const to = (index + 1) / BAND_COUNT;
    // Sebagian pembaca pergi tepat di batas bagian, jadi jatuhnya lebih curam di sana
    const isSectionEdge = PAGE_SECTIONS.some((section) => Math.abs(section.from - from) < 0.001 && section.from > 0);
    const drop = (1 - retention) * (0.6 + random() * 0.8) * (isSectionEdge ? 1.8 : 1);
    if (index > 0) reach = Math.max(reach * (1 - drop), 4);
    bands.push({
      index,
      from,
      to,
      reach: Math.round(reach * 10) / 10,
      dwell: Math.round((2 + random() * 9) * (reach / 100) * 10) / 10,
    });
  }

  const avgDepth = Math.round(bands.reduce((sum, band) => sum + band.reach, 0) / BAND_COUNT);
  const attention = PAGE_SECTIONS.map((section) => {
    const inside = bands.filter((band) => sectionAt((band.from + band.to) / 2).id === section.id);
    const total = inside.reduce((sum, band) => sum + band.dwell, 0);
    const reachAvg = inside.length === 0 ? 0 : inside.reduce((sum, band) => sum + band.reach, 0) / inside.length;
    return { id: section.id, label: section.label, total, reach: Math.round(reachAvg) };
  });
  const attentionSum = Math.max(
    attention.reduce((sum, item) => sum + item.total, 0),
    1,
  );
  const topSections = attention
    .map((item) => ({
      id: item.id,
      label: item.label,
      share: Math.round((item.total / attentionSum) * 100),
      reach: item.reach,
    }))
    .sort((a, b) => b.share - a.share)
    .slice(0, 3);

  return {
    bands,
    avgDepth,
    reach50: Math.round(bands[BAND_COUNT / 2]?.reach ?? 0),
    reachEnd: Math.round(bands[BAND_COUNT - 1]?.reach ?? 0),
    fold: foldOf(device),
    topSections,
    quality: qualityOf(sessions, random),
  };
}

export { BAND_COUNT, buildClickMap, buildScrollMap };
export type { ClickElement, ClickKind, ClickMapData, ClickPoint, MapQuality, ScrollBand, ScrollMapData, SectionAttention };
