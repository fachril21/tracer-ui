import { PAGE_POOL } from "./dimensions";
import { createRandom, hashText } from "./random";
import type { MockSession } from "./types";

type ReplayEventKind = "page" | "rage_click" | "dead_click" | "js_error" | "network_error";

type ReplayEvent = {
  id: string;
  kind: ReplayEventKind;
  // Posisi di sepanjang sesi, 0 sampai 1
  at: number;
  seconds: number;
  title: string;
  detail: string;
  path: string;
  // Posisi kejadian di halaman tiruan, dalam persen lebar dan tinggi
  target: { x: number; y: number };
};

type CursorKey = { at: number; x: number; y: number };

type Replay = {
  durationMs: number;
  events: ReplayEvent[];
  cursor: CursorKey[];
  // Rentang tanpa rekaman (0 sampai 1), kosong bila sesi lengkap
  gap: { from: number; to: number } | null;
};

const TARGETS = [
  { name: "tombol “Bayar sekarang”", x: 74, y: 78 },
  { name: "banner promo", x: 50, y: 22 },
  { name: "kartu produk pertama", x: 24, y: 52 },
  { name: "ikon keranjang", x: 91, y: 6 },
  { name: "tab “Ongkos kirim”", x: 38, y: 40 },
] as const;

const ERRORS = [
  { title: "TypeError: Cannot read properties of undefined", detail: "reading 'price' di cart.js:218" },
  { title: "ReferenceError: couponState is not defined", detail: "di checkout.js:91" },
  { title: "Uncaught (in promise) RangeError", detail: "Maximum call stack size exceeded" },
] as const;

const GAP_WIDTH = 0.08;

function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

function pageTitle(path: string): string {
  return path === "/" ? "Beranda" : path;
}

function buildEvents(session: MockSession, random: () => number): ReplayEvent[] {
  const durationSeconds = Math.max(session.durationSeconds, 1);
  const entryIndex = PAGE_POOL.indexOf(session.entryPage as (typeof PAGE_POOL)[number]);
  let pageCursor = Math.max(entryIndex, 0);
  let currentPath: string = session.entryPage;
  let errorUsed = 0;
  let pageSeen = false;

  return session.trace.map((node, index) => {
    const at = clamp(node.at, 0, 0.99);
    const seconds = Math.round(at * durationSeconds);
    const target = TARGETS[Math.floor(random() * TARGETS.length)] ?? TARGETS[0];
    const base = { id: `${node.kind}-${index}`, kind: node.kind, at, seconds, target: { x: target.x, y: target.y } };

    if (node.kind === "page") {
      if (pageSeen) {
        pageCursor = (pageCursor + 1 + Math.floor(random() * 3)) % PAGE_POOL.length;
        currentPath = PAGE_POOL[pageCursor] ?? "/";
      }
      pageSeen = true;
      return {
        ...base,
        title: `Membuka ${pageTitle(currentPath)}`,
        detail: "Navigasi halaman",
        path: currentPath,
      };
    }
    if (node.kind === "rage_click") {
      return {
        ...base,
        title: `Rage click pada ${target.name}`,
        detail: `${3 + Math.floor(random() * 5)} klik dalam kurang dari 2 detik`,
        path: currentPath,
      };
    }
    if (node.kind === "dead_click") {
      return {
        ...base,
        title: `Dead click pada ${target.name}`,
        detail: "Klik tidak memicu perubahan apa pun di halaman",
        path: currentPath,
      };
    }
    if (node.kind === "js_error") {
      const error = ERRORS[errorUsed % ERRORS.length] ?? ERRORS[0];
      errorUsed += 1;
      return { ...base, title: error.title, detail: error.detail, path: currentPath };
    }
    return {
      ...base,
      title: "Permintaan jaringan gagal",
      detail: "POST /api/checkout/shipping, status 500",
      path: currentPath,
    };
  });
}

function buildCursor(events: ReplayEvent[], random: () => number): CursorKey[] {
  const keys: CursorKey[] = [{ at: 0, x: 50, y: 30 }];
  events.forEach((event, index) => {
    // Satu titik singgah acak sebelum tiap kejadian supaya gerakannya tidak lurus
    const previousAt = index === 0 ? 0 : (events[index - 1]?.at ?? 0);
    const midAt = previousAt + (event.at - previousAt) * 0.55;
    keys.push({ at: midAt, x: 15 + random() * 70, y: 20 + random() * 60 });
    keys.push({ at: event.at, x: event.target.x, y: event.target.y });
  });
  keys.push({ at: 1, x: 60 + random() * 30, y: 60 + random() * 30 });
  return keys.sort((a, b) => a.at - b.at);
}

function buildReplay(session: MockSession): Replay {
  const random = createRandom(hashText(`replay:${session.id}`));
  const events = buildEvents(session, random);
  const gap =
    session.integrity === "has_gap"
      ? (() => {
          const from = clamp(0.4 + random() * 0.3, 0, 1 - GAP_WIDTH);
          return { from, to: from + GAP_WIDTH };
        })()
      : null;
  return {
    durationMs: Math.max(session.durationSeconds, 1) * 1000,
    events,
    cursor: buildCursor(events, random),
    gap,
  };
}

function cursorAt(cursor: CursorKey[], progress: number): { x: number; y: number } {
  const first = cursor[0] ?? { at: 0, x: 50, y: 50 };
  if (progress <= first.at) return { x: first.x, y: first.y };
  for (let index = 1; index < cursor.length; index += 1) {
    const to = cursor[index]!;
    const from = cursor[index - 1]!;
    if (progress <= to.at) {
      const span = Math.max(to.at - from.at, 0.0001);
      const t = (progress - from.at) / span;
      // Percepatan halus di awal dan akhir tiap ruas, seperti tangan yang bergerak
      const eased = t * t * (3 - 2 * t);
      return { x: from.x + (to.x - from.x) * eased, y: from.y + (to.y - from.y) * eased };
    }
  }
  const last = cursor[cursor.length - 1] ?? first;
  return { x: last.x, y: last.y };
}

export { buildReplay, cursorAt };
export type { Replay, ReplayEvent, ReplayEventKind };
