import type { DashboardFilters, FilterKey } from "./types";

type DimensionOption = {
  value: string;
  label: string;
  // Porsi dari seluruh sesi, dalam persen
  share: number;
};

type Dimension = {
  label: string;
  options: DimensionOption[];
};

const PAGE_POOL = [
  "/",
  "/produk/kopi-arabika-gayo",
  "/produk/paket-hemat-bulanan",
  "/keranjang",
  "/checkout/pengiriman",
  "/promo/gajian",
  "/blog/cara-seduh-v60",
  "/akun/pesanan",
] as const;

const PAGE_SHARES = [30, 17, 13, 11, 9, 8, 7, 5] as const;

const SOURCES = ["Pencarian organik", "Langsung", "Media sosial", "Rujukan", "Email"] as const;
const SOURCE_SHARES = [38, 24, 21, 9, 8] as const;

const COUNTRIES = ["Indonesia", "Malaysia", "Singapura", "Lainnya"] as const;
const COUNTRY_SHARES = [91, 3, 3, 3] as const;

const BROWSER_FAMILIES = ["Chrome", "Safari", "Edge", "Firefox", "Lainnya"] as const;
const BROWSER_SHARES = [58, 27, 7, 4, 4] as const;

function toOptions(values: readonly string[], shares: readonly number[]): DimensionOption[] {
  return values.map((value, index) => ({ value, label: value, share: shares[index] ?? 0 }));
}

const DIMENSIONS: Record<FilterKey, Dimension> = {
  device: {
    label: "Perangkat",
    options: toOptions(["Mobile", "Desktop", "Tablet"], [63, 33, 4]),
  },
  source: { label: "Sumber", options: toOptions(SOURCES, SOURCE_SHARES) },
  signal: {
    label: "Sinyal",
    options: [
      { value: "dead_click", label: "Dead click", share: 46 },
      { value: "rage_click", label: "Rage click", share: 34 },
      { value: "js_error", label: "Error JS", share: 20 },
    ],
  },
  page: { label: "Halaman", options: toOptions(PAGE_POOL, PAGE_SHARES) },
  browser: { label: "Browser", options: toOptions(BROWSER_FAMILIES, BROWSER_SHARES) },
  country: { label: "Negara", options: toOptions(COUNTRIES, COUNTRY_SHARES) },
};

const FILTER_KEYS: FilterKey[] = ["device", "source", "signal", "page", "browser", "country"];

function findOption(key: FilterKey, value: string): DimensionOption | undefined {
  return DIMENSIONS[key].options.find((option) => option.value === value);
}

// Profil tiap perangkat: mengubah durasi, kedalaman gulir, dan kecenderungan bermasalah
const DEVICE_PROFILE: Record<string, { duration: number; scroll: number; problem: number }> = {
  Mobile: { duration: -22, scroll: -6, problem: 1.15 },
  Desktop: { duration: 48, scroll: 9, problem: 0.7 },
  Tablet: { duration: 10, scroll: 2, problem: 0.9 },
};

type FilterWeights = {
  // Pengali jumlah sesi dari semua filter selain sinyal
  factor: number;
  // Porsi sesi yang memuat sinyal terpilih, null bila tanpa filter sinyal
  signalShare: number | null;
  problemBias: number;
  durationShift: number;
  scrollShift: number;
};

function filterWeights(filters: DashboardFilters): FilterWeights {
  let factor = 1;
  for (const key of FILTER_KEYS) {
    const value = filters[key];
    if (value === undefined || key === "signal") continue;
    factor *= (findOption(key, value)?.share ?? 100) / 100;
  }
  const signalValue = filters.signal;
  const signalShare = signalValue === undefined ? null : (findOption("signal", signalValue)?.share ?? 0) / 100;
  const profile = filters.device === undefined ? undefined : DEVICE_PROFILE[filters.device];
  return {
    factor,
    signalShare,
    problemBias: profile?.problem ?? 1,
    durationShift: profile?.duration ?? 0,
    scrollShift: profile?.scroll ?? 0,
  };
}

export { DIMENSIONS, FILTER_KEYS, PAGE_POOL, PAGE_SHARES, SOURCES, COUNTRIES, BROWSER_FAMILIES, filterWeights, findOption };
export type { Dimension, DimensionOption };
