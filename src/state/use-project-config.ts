import { useCallback, useState } from "react";

type MemberRole = "pemilik" | "anggota";

type Member = {
  id: string;
  name: string;
  email: string;
  role: MemberRole;
  // Undangan yang belum diterima
  isPending: boolean;
};

type ProjectConfig = {
  name: string;
  // Origin yang boleh memulai sesi
  origins: string[];
  // Origin yang boleh memuat gambar saat rekaman diputar
  imageOrigins: string[];
  members: Member[];
};

const NAMES: Record<string, string> = {
  "kopi-senja": "Kopi Senja",
  "karir-nusa": "Portal Karir Nusa",
  "klinik-sehat": "Klinik Sehat Bersama",
};

const SITES: Record<string, string> = {
  "kopi-senja": "kopisenja.id",
  "karir-nusa": "karir.nusa.co.id",
  "klinik-sehat": "kliniksehat.example",
};

function seedConfig(projectId: string): ProjectConfig {
  const site = SITES[projectId] ?? "contoh.id";
  return {
    name: NAMES[projectId] ?? projectId,
    origins: projectId === "klinik-sehat" ? [] : [`https://${site}`, `https://www.${site}`],
    imageOrigins: projectId === "klinik-sehat" ? [] : [`https://cdn.${site}`],
    members: [
      { id: "m1", name: "Raka Pratama", email: "raka@contoh.id", role: "pemilik", isPending: false },
      { id: "m2", name: "Dewi Lestari", email: "dewi@contoh.id", role: "anggota", isPending: false },
    ],
  };
}

function storageKey(projectId: string): string {
  return `tracer-uiux:config:${projectId}`;
}

function readConfig(projectId: string): ProjectConfig {
  try {
    const raw = window.localStorage.getItem(storageKey(projectId));
    if (raw === null) return seedConfig(projectId);
    const parsed: unknown = JSON.parse(raw);
    if (typeof parsed !== "object" || parsed === null) return seedConfig(projectId);
    return { ...seedConfig(projectId), ...(parsed as Partial<ProjectConfig>) };
  } catch {
    // Penyimpanan bisa kosong atau diblokir, konfigurasi kembali ke isian awal
    return seedConfig(projectId);
  }
}

function writeConfig(projectId: string, config: ProjectConfig): void {
  try {
    window.localStorage.setItem(storageKey(projectId), JSON.stringify(config));
  } catch {
    // Diabaikan: konfigurasi demo hanya kenyamanan
  }
}

// Konfigurasi project tiruan disimpan di peramban supaya perubahan tidak hilang saat pindah halaman
function useProjectConfig(projectId: string) {
  const [config, setConfig] = useState<ProjectConfig>(() => readConfig(projectId));

  const update = useCallback(
    (patch: Partial<ProjectConfig>) => {
      setConfig((current) => {
        const next = { ...current, ...patch };
        writeConfig(projectId, next);
        return next;
      });
    },
    [projectId],
  );

  const reset = useCallback(() => {
    const seed = seedConfig(projectId);
    writeConfig(projectId, seed);
    setConfig(seed);
  }, [projectId]);

  return { config, update, reset };
}

// Dipakai saat project baru dibuat, supaya halaman Pengaturan langsung berisi data yang diisi pembuatnya
function saveProjectConfig(projectId: string, config: ProjectConfig): void {
  writeConfig(projectId, config);
}

export { saveProjectConfig, useProjectConfig };
export type { Member, MemberRole, ProjectConfig };
