import { DIMENSIONS, FILTER_KEYS, findOption } from "@/mock/dimensions";
import type { DashboardFilters, DashboardQuery, FilterKey, Period, PeriodPreset } from "@/mock/types";
import { formatShortDate } from "@/lib/format";

const MAX_CUSTOM_DAYS = 90;
// Seri tiruan tersedia 220 hari, sisakan ruang untuk periode pembanding
const EARLIEST_OFFSET_DAYS = 100;
const DAY_MS = 86400000;

const PRESET_DAYS: Record<Exclude<PeriodPreset, "custom">, number> = { "7": 7, "30": 30, "90": 90 };

function startOfDay(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

function addDays(date: Date, amount: number): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate() + amount);
}

function countDays(from: Date, to: Date): number {
  return Math.round((startOfDay(to).getTime() - startOfDay(from).getTime()) / DAY_MS) + 1;
}

function toIsoDate(date: Date): string {
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${date.getFullYear()}-${month}-${day}`;
}

function parseIsoDate(text: string | null): Date | null {
  if (text === null) return null;
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(text);
  if (match === null) return null;
  const date = new Date(Number(match[1]), Number(match[2]) - 1, Number(match[3]));
  return toIsoDate(date) === text ? date : null;
}

function presetPeriod(preset: Exclude<PeriodPreset, "custom">, today: Date): Period {
  const days = PRESET_DAYS[preset];
  return { preset, from: addDays(today, -(days - 1)), to: today, days };
}

function resolvePeriod(
  params: URLSearchParams,
  today: Date,
  fallback: Exclude<PeriodPreset, "custom"> = "7",
): Period {
  const from = parseIsoDate(params.get("from"));
  const to = parseIsoDate(params.get("to"));
  if (from !== null && to !== null) {
    const days = countDays(from, to);
    const isInBounds =
      days >= 1 && days <= MAX_CUSTOM_DAYS && to <= today && from >= addDays(today, -EARLIEST_OFFSET_DAYS);
    if (isInBounds) return { preset: "custom", from, to, days };
  }
  const range = params.get("range");
  if (range === "7" || range === "30" || range === "90") return presetPeriod(range, today);
  return presetPeriod(fallback, today);
}

function resolveFilters(params: URLSearchParams): DashboardFilters {
  const filters: DashboardFilters = {};
  for (const key of FILTER_KEYS) {
    const value = params.get(key);
    if (value !== null && findOption(key, value) !== undefined) filters[key] = value;
  }
  return filters;
}

function parseQuery(params: URLSearchParams, today: Date): DashboardQuery {
  return {
    filters: resolveFilters(params),
    period: resolvePeriod(params, today),
    compare: params.get("compare") !== "off",
    onlyProblems: params.get("problem") === "1",
  };
}

// Nilai bawaan tidak ditulis ke URL supaya tautan tetap pendek
function serializeQuery(query: DashboardQuery): URLSearchParams {
  const params = new URLSearchParams();
  for (const key of FILTER_KEYS) {
    const value = query.filters[key];
    if (value !== undefined) params.set(key, value);
  }
  if (query.period.preset === "custom") {
    params.set("from", toIsoDate(query.period.from));
    params.set("to", toIsoDate(query.period.to));
  } else if (query.period.preset !== "7") {
    params.set("range", query.period.preset);
  }
  if (!query.compare) params.set("compare", "off");
  if (query.onlyProblems) params.set("problem", "1");
  return params;
}

type ActiveFilter = { key: FilterKey; keyLabel: string; value: string; valueLabel: string };

function activeFilters(filters: DashboardFilters): ActiveFilter[] {
  return FILTER_KEYS.flatMap((key) => {
    const value = filters[key];
    if (value === undefined) return [];
    const option = findOption(key, value);
    return [{ key, keyLabel: DIMENSIONS[key].label, value, valueLabel: option?.label ?? value }];
  });
}

function describePeriod(period: Period): string {
  if (period.preset !== "custom") return `${period.days} hari terakhir`;
  if (period.days === 1) return formatShortDate(period.from);
  return `${formatShortDate(period.from)} – ${formatShortDate(period.to)}`;
}

function previousPeriod(period: Period): Period {
  const to = addDays(period.from, -1);
  return { preset: "custom", from: addDays(to, -(period.days - 1)), to, days: period.days };
}

function earliestDate(today: Date): Date {
  return addDays(today, -EARLIEST_OFFSET_DAYS);
}

export {
  MAX_CUSTOM_DAYS,
  activeFilters,
  addDays,
  describePeriod,
  earliestDate,
  parseIsoDate,
  parseQuery,
  presetPeriod,
  resolvePeriod,
  previousPeriod,
  serializeQuery,
  startOfDay,
  toIsoDate,
};
export type { ActiveFilter };
