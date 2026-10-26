import { useCallback, useMemo, useState } from "react";
import { buildFeedback } from "@/mock/feedback";
import type { FeedbackItem, FeedbackKind, FeedbackStatus } from "@/mock/feedback";

type WidgetPosition = "kanan" | "kiri";

type WidgetConfig = {
  isEnabled: boolean;
  position: WidgetPosition;
  // Tulisan pada tab di pinggir layar
  tabLabel: string;
  title: string;
  askEmail: boolean;
  kinds: FeedbackKind[];
};

const DEFAULT_WIDGET: WidgetConfig = {
  isEnabled: true,
  position: "kanan",
  tabLabel: "Masukan",
  title: "Ada yang ingin disampaikan?",
  askEmail: true,
  kinds: ["masalah", "saran", "pujian"],
};

type StoredItem = Omit<FeedbackItem, "createdAt"> & { createdAt: string };

type Stored = {
  statuses: Record<string, FeedbackStatus>;
  added: StoredItem[];
  widget: WidgetConfig;
};

function storageKey(projectId: string): string {
  return `tracer-uiux:feedback:${projectId}`;
}

function readStored(projectId: string): Stored {
  const empty: Stored = { statuses: {}, added: [], widget: DEFAULT_WIDGET };
  try {
    const raw = window.localStorage.getItem(storageKey(projectId));
    if (raw === null) return empty;
    const parsed: unknown = JSON.parse(raw);
    if (typeof parsed !== "object" || parsed === null) return empty;
    const value = parsed as Partial<Stored>;
    return {
      statuses: value.statuses ?? {},
      added: value.added ?? [],
      widget: { ...DEFAULT_WIDGET, ...value.widget },
    };
  } catch {
    // Penyimpanan bisa kosong atau diblokir, kembali ke data awal
    return empty;
  }
}

function writeStored(projectId: string, stored: Stored): void {
  try {
    window.localStorage.setItem(storageKey(projectId), JSON.stringify(stored));
  } catch {
    // Diabaikan: data demo hanya kenyamanan
  }
}

type NewFeedback = Pick<FeedbackItem, "kind" | "rating" | "message" | "email">;

// Masukan tiruan, status yang diubah, dan pengaturan widget disimpan di peramban
function useFeedback(projectId: string) {
  const [stored, setStored] = useState<Stored>(() => readStored(projectId));
  const now = useMemo(() => new Date(), []);

  const items = useMemo(() => {
    const seeded = buildFeedback(projectId, now).map((item) => ({
      ...item,
      status: stored.statuses[item.id] ?? item.status,
    }));
    const added = stored.added.map((item) => ({
      ...item,
      createdAt: new Date(item.createdAt),
      status: stored.statuses[item.id] ?? item.status,
    }));
    return [...added, ...seeded].sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }, [projectId, now, stored]);

  const commit = useCallback(
    (change: (current: Stored) => Stored) => {
      setStored((current) => {
        const next = change(current);
        writeStored(projectId, next);
        return next;
      });
    },
    [projectId],
  );

  const setStatus = useCallback(
    (id: string, status: FeedbackStatus) =>
      commit((current) => ({ ...current, statuses: { ...current.statuses, [id]: status } })),
    [commit],
  );

  const addFeedback = useCallback(
    (input: NewFeedback) => {
      const createdAt = new Date();
      const item: StoredItem = {
        ...input,
        id: `fb_uji${createdAt.getTime().toString(16)}`,
        createdAt: createdAt.toISOString(),
        page: "/",
        device: "Desktop",
        sessionId: null,
        status: "baru",
      };
      commit((current) => ({ ...current, added: [item, ...current.added] }));
    },
    [commit],
  );

  const setWidget = useCallback(
    (patch: Partial<WidgetConfig>) =>
      commit((current) => ({ ...current, widget: { ...current.widget, ...patch } })),
    [commit],
  );

  const resetAll = useCallback(() => commit(() => ({ statuses: {}, added: [], widget: DEFAULT_WIDGET })), [commit]);

  return { items, now, widget: stored.widget, setStatus, addFeedback, setWidget, resetAll };
}

export { DEFAULT_WIDGET, useFeedback };
export type { NewFeedback, WidgetConfig, WidgetPosition };
