import { useCallback, useState } from "react";

type SavedSegment = {
  id: string;
  name: string;
  // Query string filter dan rentang, tanpa tanda tanya
  query: string;
};

const MAX_SEGMENTS = 12;

function storageKey(projectId: string): string {
  return `tracer-uiux:segments:${projectId}`;
}

function isSegment(value: unknown): value is SavedSegment {
  if (typeof value !== "object" || value === null) return false;
  const candidate = value as Record<string, unknown>;
  return (
    typeof candidate.id === "string" && typeof candidate.name === "string" && typeof candidate.query === "string"
  );
}

function readSegments(projectId: string): SavedSegment[] {
  try {
    const raw = window.localStorage.getItem(storageKey(projectId));
    if (raw === null) return [];
    const parsed: unknown = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.filter(isSegment) : [];
  } catch {
    // Penyimpanan bisa kosong atau diblokir, daftar segmen mulai kosong
    return [];
  }
}

function writeSegments(projectId: string, segments: SavedSegment[]): void {
  try {
    window.localStorage.setItem(storageKey(projectId), JSON.stringify(segments));
  } catch {
    // Diabaikan: segmen hanya kenyamanan demo
  }
}

// Segmen disimpan per project di peramban saja, karena demo ini tidak punya backend
function useSavedSegments(projectId: string) {
  const [segments, setSegments] = useState<SavedSegment[]>(() => readSegments(projectId));

  const save = useCallback(
    (name: string, query: string) => {
      const entry: SavedSegment = { id: `seg_${Date.now().toString(36)}`, name: name.trim(), query };
      setSegments((current) => {
        const next = [entry, ...current].slice(0, MAX_SEGMENTS);
        writeSegments(projectId, next);
        return next;
      });
    },
    [projectId],
  );

  const remove = useCallback(
    (id: string) => {
      setSegments((current) => {
        const next = current.filter((segment) => segment.id !== id);
        writeSegments(projectId, next);
        return next;
      });
    },
    [projectId],
  );

  return { segments, save, remove, isFull: segments.length >= MAX_SEGMENTS };
}

export { MAX_SEGMENTS, useSavedSegments };
export type { SavedSegment };
