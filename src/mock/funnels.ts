import { PAGE_POOL } from "./dimensions";
import { createRandom, hashText } from "./random";
import { buildSessionPool } from "./sessions";
import type { MockSession, SmartEventKind } from "./types";

type FunnelStep =
  | { id: string; kind: "page"; value: string }
  | { id: string; kind: "event"; value: SmartEventKind };

type Funnel = {
  id: string;
  name: string;
  steps: FunnelStep[];
};

type FunnelPeriod = 7 | 30 | 90;

type StepResult = {
  step: FunnelStep;
  count: number;
  // Persentase dari langkah pertama
  rateFromStart: number;
  // Persentase dari langkah sebelumnya
  rateFromPrevious: number;
  dropped: number;
};

type FunnelResult = {
  steps: StepResult[];
  // Indeks langkah dengan kehilangan terbesar, null bila funnel hanya satu langkah
  biggestDropIndex: number | null;
};

const EVENT_LABEL: Record<SmartEventKind, string> = {
  rage_click: "Rage click",
  dead_click: "Dead click",
  js_error: "Galat JavaScript",
};

const MIN_STEPS = 2;
const MAX_STEPS = 6;
const MINUTES_PER_DAY = 1440;
const DROPPED_SAMPLE = 5;

function stepLabel(step: FunnelStep): string {
  return step.kind === "page" ? step.value : EVENT_LABEL[step.value];
}

function seedFunnels(): Funnel[] {
  return [
    {
      id: "fn_checkout",
      name: "Dari produk sampai checkout",
      steps: [
        { id: "s1", kind: "page", value: "/produk/kopi-arabika-gayo" },
        { id: "s2", kind: "page", value: "/keranjang" },
        { id: "s3", kind: "page", value: "/checkout/pengiriman" },
        { id: "s4", kind: "page", value: "/akun/pesanan" },
      ],
    },
    {
      id: "fn_promo",
      name: "Kunjungan promo gajian",
      steps: [
        { id: "s1", kind: "page", value: "/promo/gajian" },
        { id: "s2", kind: "page", value: "/produk/paket-hemat-bulanan" },
        { id: "s3", kind: "page", value: "/keranjang" },
      ],
    },
  ];
}

// Sesi dalam rentang, dipakai sebagai populasi awal funnel
function poolInPeriod(projectId: string, days: FunnelPeriod, now: Date): MockSession[] {
  const start = now.getTime() - days * MINUTES_PER_DAY * 60000;
  return buildSessionPool(projectId, now).filter((session) => session.startedAt.getTime() >= start);
}

// Peluang lolos tiap langkah: stabil per funnel dan langkah, lebih rendah di ponsel
function passRate(funnelId: string, step: FunnelStep, index: number, device: MockSession["device"] | null): number {
  const random = createRandom(hashText(`${funnelId}:${step.id}:${step.value}:${index}`));
  const base = 0.42 + random() * 0.4;
  const modifier = device === "Mobile" ? 0.82 : device === "Desktop" ? 1.1 : 1;
  return Math.min(0.96, base * modifier);
}

function computeFunnel(
  projectId: string,
  funnel: Funnel,
  days: FunnelPeriod,
  now: Date,
  device: MockSession["device"] | null = null,
): FunnelResult {
  const pool = poolInPeriod(projectId, days, now).filter((session) => device === null || session.device === device);
  const first = funnel.steps[0];
  if (first === undefined) return { steps: [], biggestDropIndex: null };

  const startShare = first.kind === "page" ? 0.34 : 0.22;
  let current = Math.max(0, Math.round(pool.length * startShare));
  const steps: StepResult[] = [];
  const startCount = current;

  funnel.steps.forEach((step, index) => {
    if (index > 0) current = Math.floor(current * passRate(funnel.id, step, index, device));
    const previous = steps[index - 1]?.count ?? current;
    steps.push({
      step,
      count: current,
      rateFromStart: startCount === 0 ? 0 : (current / startCount) * 100,
      rateFromPrevious: previous === 0 ? 0 : (current / previous) * 100,
      dropped: index === 0 ? 0 : previous - current,
    });
  });

  let biggest: number | null = null;
  steps.forEach((result, index) => {
    if (index === 0 || result.dropped === 0) return;
    if (biggest === null || result.dropped > (steps[biggest]?.dropped ?? 0)) biggest = index;
  });
  return { steps, biggestDropIndex: biggest };
}

// Contoh sesi yang berhenti sebelum langkah tertentu, urut dari yang terbaru
function droppedSessions(
  projectId: string,
  funnel: Funnel,
  stepIndex: number,
  days: FunnelPeriod,
  now: Date,
): MockSession[] {
  const pool = poolInPeriod(projectId, days, now);
  const offset = hashText(`${funnel.id}:${funnel.steps[stepIndex]?.id ?? ""}`) % Math.max(1, pool.length);
  return Array.from({ length: Math.min(DROPPED_SAMPLE, pool.length) }, (_, index) => pool[(offset + index * 7) % pool.length]!)
    .filter((session, index, all) => all.findIndex((other) => other.id === session.id) === index)
    .sort((a, b) => b.startedAt.getTime() - a.startedAt.getTime());
}

export {
  EVENT_LABEL,
  MAX_STEPS,
  MIN_STEPS,
  PAGE_POOL,
  computeFunnel,
  droppedSessions,
  seedFunnels,
  stepLabel,
};
export type { Funnel, FunnelPeriod, FunnelResult, FunnelStep, StepResult };
