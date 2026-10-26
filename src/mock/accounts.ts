import type { ProjectRole } from "@/mock/types";

// Akun demo ditentukan dari awalan email, supaya tiap keadaan awal bisa dicoba tanpa pengaturan lain
type AccountKind = "standar" | "admin" | "baru" | "diundang";

type Account = {
  email: string;
  kind: AccountKind;
  role: ProjectRole;
  name: string;
};

type Invitation = {
  id: string;
  projectId: string;
  projectName: string;
  siteUrl: string;
  invitedBy: string;
  sentLabel: string;
  daysLeft: number;
};

type SampleAccount = { email: string; label: string };

// Kode yang diterima di skenario "berhasil"
const DEMO_CODE = "123456";
const CODE_LENGTH = 6;
// Batas project per pengguna (admin tanpa batas)
const PROJECT_LIMIT = 4;

const SAMPLE_ACCOUNTS: SampleAccount[] = [
  { email: "nadia.putri@kopisenja.id", label: "Pemilik dengan project" },
  { email: "baru@contoh.id", label: "Pengguna baru" },
  { email: "diundang@contoh.id", label: "Pengguna baru dengan undangan" },
  { email: "admin@tracer.example", label: "Admin" },
];

function titleCase(word: string): string {
  return word.length === 0 ? word : `${word.slice(0, 1).toUpperCase()}${word.slice(1)}`;
}

function accountFor(rawEmail: string): Account {
  const email = rawEmail.trim().toLowerCase();
  const local = email.split("@")[0] ?? email;
  const kind: AccountKind = local.startsWith("admin")
    ? "admin"
    : local.startsWith("baru")
      ? "baru"
      : local.startsWith("diundang")
        ? "diundang"
        : "standar";
  const name = local
    .split(/[._-]/)
    .filter((part) => part !== "")
    .map(titleCase)
    .join(" ");
  return { email, kind, role: kind === "admin" ? "admin" : "pemilik", name: name === "" ? email : name };
}

// Project bawaan yang sudah bisa dibuka sejak masuk pertama kali
function seededProjectIds(kind: AccountKind, allIds: string[]): string[] {
  return kind === "baru" || kind === "diundang" ? [] : allIds;
}

function seededInvitations(kind: AccountKind): Invitation[] {
  if (kind !== "diundang") return [];
  return [
    {
      id: "inv-kopi-senja",
      projectId: "kopi-senja",
      projectName: "Kopi Senja",
      siteUrl: "kopisenja.id",
      invitedBy: "Raka Pratama",
      sentLabel: "2 hari lalu",
      daysLeft: 5,
    },
    {
      id: "inv-karir-nusa",
      projectId: "karir-nusa",
      projectName: "Portal Karir Nusa",
      siteUrl: "karir.nusa.co.id",
      invitedBy: "Dewi Lestari",
      sentLabel: "kemarin",
      daysLeft: 6,
    },
  ];
}

export { CODE_LENGTH, DEMO_CODE, PROJECT_LIMIT, SAMPLE_ACCOUNTS, accountFor, seededInvitations, seededProjectIds };
export type { Account, AccountKind, Invitation };
