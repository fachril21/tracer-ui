import { PAGE_POOL, PAGE_SHARES } from "./dimensions";
import { createRandom, hashText, pickWeighted } from "./random";
import { buildSessionPool } from "./sessions";
import type { MockSession } from "./types";

type FeedbackKind = "masalah" | "saran" | "pujian";
type FeedbackStatus = "baru" | "dibaca" | "selesai";

type FeedbackItem = {
  id: string;
  createdAt: Date;
  kind: FeedbackKind;
  // 1 sampai 5
  rating: number;
  message: string;
  email: string | null;
  page: string;
  device: MockSession["device"];
  // Sesi rekaman yang menyertai masukan, tidak selalu ada
  sessionId: string | null;
  status: FeedbackStatus;
};

const KIND_LABEL: Record<FeedbackKind, string> = {
  masalah: "Masalah",
  saran: "Saran",
  pujian: "Pujian",
};

const STATUS_LABEL: Record<FeedbackStatus, string> = {
  baru: "Baru",
  dibaca: "Dibaca",
  selesai: "Selesai",
};

const MESSAGES: Record<FeedbackKind, readonly string[]> = {
  masalah: [
    "Tombol bayar tidak merespons setelah saya isi alamat. Sudah klik lima kali, tetap diam.",
    "Halamannya macet waktu memilih metode pengiriman, harus muat ulang dari awal.",
    "Kode voucher ditolak padahal belum kedaluwarsa.",
    "Foto produk tidak muncul di HP saya, hanya kotak abu-abu.",
    "Setelah login, saya dikembalikan ke beranda dan keranjang jadi kosong.",
    "Formulir pendaftaran bilang nomor telepon salah, padahal formatnya sudah benar.",
    "Pencarian tidak menemukan apa-apa untuk kata yang jelas ada di katalog.",
    "Halaman lambat sekali dibuka lewat data seluler.",
    "Tombol kembali membawa saya keluar dari website, bukan ke halaman sebelumnya.",
    "Teks terpotong di layar kecil, saya tidak bisa membaca syaratnya.",
  ],
  saran: [
    "Tolong tambahkan pilihan bayar lewat e-wallet, sekarang hanya transfer bank.",
    "Akan lebih mudah kalau ada filter harga di daftar produk.",
    "Bisa ada fitur simpan keranjang supaya tidak hilang saat saya tutup tab?",
    "Mohon tampilkan estimasi ongkir sebelum saya mengisi semua data.",
    "Tambahkan mode gelap, mata saya cepat lelah malam hari.",
    "Sebaiknya ada nomor pelacakan yang bisa disalin dengan satu klik.",
    "Ukuran huruf di halaman detail terlalu kecil untuk orang tua saya.",
    "Beri tahu saya lewat email kalau stok yang saya incar sudah tersedia.",
  ],
  pujian: [
    "Prosesnya cepat, pesanan saya sampai besok paginya. Terima kasih!",
    "Tampilannya rapi dan mudah dipahami, tidak bingung mencari menu.",
    "Layanan pelanggannya ramah dan membalas dalam hitungan menit.",
    "Akhirnya website yang enak dipakai di HP.",
    "Checkout paling mulus yang pernah saya coba.",
    "Deskripsi produknya jelas, sesuai dengan barang yang datang.",
  ],
};

const KIND_WEIGHTS = [46, 30, 24] as const;
const KINDS: readonly FeedbackKind[] = ["masalah", "saran", "pujian"];
const ITEM_COUNT = 42;
const SPREAD_DAYS = 28;
const MINUTES_PER_DAY = 1440;
const EMAIL_CHANCE = 0.35;
const SESSION_CHANCE = 0.55;

function ratingFor(kind: FeedbackKind, random: () => number): number {
  if (kind === "pujian") return random() < 0.7 ? 5 : 4;
  if (kind === "saran") return pickWeighted([2, 3, 4, 5], [10, 35, 40, 15], random);
  return pickWeighted([1, 2, 3], [45, 40, 15], random);
}

function statusFor(createdAt: Date, now: Date, random: () => number): FeedbackStatus {
  const ageDays = (now.getTime() - createdAt.getTime()) / (MINUTES_PER_DAY * 60000);
  if (ageDays < 2) return random() < 0.8 ? "baru" : "dibaca";
  if (ageDays < 10) return pickWeighted(["baru", "dibaca", "selesai"] as const, [20, 45, 35], random);
  return pickWeighted(["baru", "dibaca", "selesai"] as const, [5, 25, 70], random);
}

// Masukan tiruan yang sama di setiap muat, diurutkan dari yang terbaru
function buildFeedback(projectId: string, now: Date): FeedbackItem[] {
  const random = createRandom(hashText(`masukan:${projectId}`));
  const sessions = buildSessionPool(projectId, now).filter(
    (session) => now.getTime() - session.startedAt.getTime() < SPREAD_DAYS * MINUTES_PER_DAY * 60000,
  );
  const items = Array.from({ length: ITEM_COUNT }, (_, index): FeedbackItem => {
    const kind = pickWeighted(KINDS, KIND_WEIGHTS, random);
    const pool = MESSAGES[kind];
    const minutesAgo = 20 + random() * random() * SPREAD_DAYS * MINUTES_PER_DAY;
    const createdAt = new Date(now.getTime() - minutesAgo * 60000);
    const linked =
      random() < SESSION_CHANCE && sessions.length > 0
        ? sessions[Math.floor(random() * sessions.length)]
        : undefined;
    return {
      id: `fb_${hashText(`${projectId}:fb:${index}`).toString(16).padStart(8, "0").slice(0, 8)}`,
      createdAt,
      kind,
      rating: ratingFor(kind, random),
      message: pool[Math.floor(random() * pool.length)] ?? pool[0]!,
      email: random() < EMAIL_CHANCE ? `pengunjung${Math.floor(random() * 90) + 10}@surel.id` : null,
      page: linked?.entryPage ?? pickWeighted(PAGE_POOL, PAGE_SHARES, random),
      device: linked?.device ?? pickWeighted(["Mobile", "Desktop", "Tablet"] as const, [60, 34, 6], random),
      sessionId: linked?.id ?? null,
      status: statusFor(createdAt, now, random),
    };
  });
  return items.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
}

type FeedbackSummary = {
  total: number;
  average: number;
  // Indeks 0 untuk bintang 1, sampai indeks 4 untuk bintang 5
  distribution: number[];
  unread: number;
};

function summarizeFeedback(items: readonly FeedbackItem[]): FeedbackSummary {
  const distribution = [0, 0, 0, 0, 0];
  let sum = 0;
  for (const item of items) {
    distribution[item.rating - 1] = (distribution[item.rating - 1] ?? 0) + 1;
    sum += item.rating;
  }
  return {
    total: items.length,
    average: items.length === 0 ? 0 : sum / items.length,
    distribution,
    unread: items.filter((item) => item.status === "baru").length,
  };
}

export { KIND_LABEL, STATUS_LABEL, buildFeedback, summarizeFeedback };
export type { FeedbackItem, FeedbackKind, FeedbackStatus, FeedbackSummary };
