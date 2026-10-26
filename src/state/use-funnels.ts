import { useCallback, useState } from "react";
import { seedFunnels } from "@/mock/funnels";
import type { Funnel } from "@/mock/funnels";

function storageKey(projectId: string): string {
  return `tracer-uiux:funnels:${projectId}`;
}

function readFunnels(projectId: string): Funnel[] {
  try {
    const raw = window.localStorage.getItem(storageKey(projectId));
    if (raw === null) return seedFunnels();
    const parsed: unknown = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as Funnel[]) : seedFunnels();
  } catch {
    // Penyimpanan bisa kosong atau diblokir, kembali ke funnel awal
    return seedFunnels();
  }
}

function writeFunnels(projectId: string, funnels: Funnel[]): void {
  try {
    window.localStorage.setItem(storageKey(projectId), JSON.stringify(funnels));
  } catch {
    // Diabaikan: data demo hanya kenyamanan
  }
}

// Funnel tiruan disimpan di peramban per project
function useFunnels(projectId: string) {
  const [funnels, setFunnels] = useState<Funnel[]>(() => readFunnels(projectId));

  const commit = useCallback(
    (change: (current: Funnel[]) => Funnel[]) => {
      setFunnels((current) => {
        const next = change(current);
        writeFunnels(projectId, next);
        return next;
      });
    },
    [projectId],
  );

  const save = useCallback(
    (funnel: Funnel) =>
      commit((current) =>
        current.some((item) => item.id === funnel.id)
          ? current.map((item) => (item.id === funnel.id ? funnel : item))
          : [...current, funnel],
      ),
    [commit],
  );

  const remove = useCallback((id: string) => commit((current) => current.filter((item) => item.id !== id)), [commit]);

  return { funnels, save, remove };
}

export { useFunnels };
