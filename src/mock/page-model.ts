type DeviceKind = "Desktop" | "Tablet" | "Mobile";

type DeviceLayout = {
  // Lebar maksimum panggung dalam piksel
  maxWidth: number;
  // Tinggi seluruh halaman dibanding lebarnya
  heightRatio: number;
  // Tinggi layar pertama dibanding lebarnya
  viewportRatio: number;
};

const DEVICE_LAYOUT: Record<DeviceKind, DeviceLayout> = {
  Desktop: { maxWidth: 960, heightRatio: 1.7, viewportRatio: 0.625 },
  Tablet: { maxWidth: 560, heightRatio: 2.4, viewportRatio: 1.33 },
  Mobile: { maxWidth: 340, heightRatio: 3.6, viewportRatio: 1.9 },
};

type PageSection = {
  id: string;
  label: string;
  // Rentang vertikal sebagai pecahan tinggi halaman
  from: number;
  to: number;
};

// Satu susunan halaman dipakai semua path supaya peta klik dan peta gulir bisa saling menunjuk bagian yang sama
const PAGE_SECTIONS: PageSection[] = [
  { id: "nav", label: "Navigasi", from: 0, to: 0.07 },
  { id: "hero", label: "Banner dan judul", from: 0.07, to: 0.21 },
  { id: "produk", label: "Galeri produk", from: 0.21, to: 0.46 },
  { id: "ulasan", label: "Ulasan pelanggan", from: 0.46, to: 0.62 },
  { id: "promo", label: "Promo dan ajakan", from: 0.62, to: 0.8 },
  { id: "footer", label: "Footer", from: 0.8, to: 1 },
];

function isDeviceKind(value: string | undefined): value is DeviceKind {
  return value === "Desktop" || value === "Tablet" || value === "Mobile";
}

function foldOf(device: DeviceKind): number {
  const layout = DEVICE_LAYOUT[device];
  return Math.min(layout.viewportRatio / layout.heightRatio, 1);
}

function sectionAt(y: number): PageSection {
  return PAGE_SECTIONS.find((section) => y >= section.from && y < section.to) ?? PAGE_SECTIONS[PAGE_SECTIONS.length - 1]!;
}

export { DEVICE_LAYOUT, PAGE_SECTIONS, foldOf, isDeviceKind, sectionAt };
export type { DeviceKind, DeviceLayout, PageSection };
