import { useState } from "react";
import type { FormEvent } from "react";
import { Bookmark, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { MAX_SEGMENTS, useSavedSegments } from "@/state/use-saved-segments";

type SegmentsMenuProps = {
  projectId: string;
  // Query string filter dan rentang yang sedang aktif
  currentQuery: string;
  onApply: (query: string) => void;
};

function SegmentsMenu({ projectId, currentQuery, onApply }: SegmentsMenuProps) {
  const { segments, save, remove, isFull } = useSavedSegments(projectId);
  const [isOpen, setOpen] = useState(false);
  const [name, setName] = useState("");
  const trimmed = name.trim();
  const isDuplicate = segments.some((segment) => segment.name.toLowerCase() === trimmed.toLowerCase());
  const canSave = trimmed.length > 0 && !isDuplicate && !isFull;

  const handleSave = (event: FormEvent) => {
    event.preventDefault();
    if (!canSave) return;
    save(trimmed, currentQuery);
    setName("");
  };

  const hint = isFull
    ? `Sudah ${MAX_SEGMENTS} segmen. Hapus satu untuk menyimpan yang baru.`
    : isDuplicate
      ? "Nama segmen sudah dipakai."
      : "Simpan filter dan rentang yang sedang aktif.";

  return (
    <Popover open={isOpen} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="secondary" size="sm" className="rounded-full">
          <Bookmark aria-hidden="true" />
          Segmen
          {segments.length === 0 ? null : (
            <span className="font-mono tabular-nums text-mute">{segments.length}</span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-72">
        <div className="flex flex-col gap-3">
          <p className="font-mono text-label uppercase tracking-[0.06em] text-stone">Segmen tersimpan</p>

          {segments.length === 0 ? (
            <p className="text-body text-mute">Belum ada segmen. Atur filter, lalu simpan di bawah.</p>
          ) : (
            <ul className="flex flex-col">
              {segments.map((segment) => (
                <li key={segment.id} className="flex items-center gap-1">
                  <button
                    type="button"
                    className="min-h-8 flex-1 truncate rounded-md px-2 text-left text-body text-ink transition-colors duration-[var(--motion-fast)] hover:bg-surface-hover"
                    onClick={() => {
                      onApply(segment.query);
                      setOpen(false);
                    }}
                  >
                    {segment.name}
                  </button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="size-8"
                    aria-label={`Hapus segmen ${segment.name}`}
                    onClick={() => remove(segment.id)}
                  >
                    <Trash2 />
                  </Button>
                </li>
              ))}
            </ul>
          )}

          <form onSubmit={handleSave} className="flex flex-col gap-2 border-t border-hairline pt-3">
            <label className="flex flex-col gap-1 text-caption text-mute">
              Nama segmen
              <input
                value={name}
                maxLength={40}
                onChange={(event) => setName(event.target.value)}
                placeholder="Contoh: Mobile bermasalah"
                className="h-8 rounded-md border border-border-control bg-canvas px-2 text-body text-ink placeholder:text-stone"
              />
            </label>
            <p className="text-caption text-mute">{hint}</p>
            <Button type="submit" variant="primary" disabled={!canSave}>
              Simpan segmen
            </Button>
          </form>
        </div>
      </PopoverContent>
    </Popover>
  );
}

export { SegmentsMenu };
