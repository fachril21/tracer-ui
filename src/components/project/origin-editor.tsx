import { useState } from "react";
import type { FormEvent } from "react";
import { Plus, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { TextField } from "@/components/ui/input";
import { parseOrigin } from "@/lib/origin";

type OriginEditorProps = {
  // Nama kelompok untuk pembaca layar, mis. "origin sesi"
  label: string;
  origins: string[];
  onChange: (next: string[]) => void;
  canEdit: boolean;
  placeholder?: string;
  emptyText: string;
};

// Daftar origin yang bisa ditambah dan dihapus. Hanya pemilik yang melihat kolom tambah.
function OriginEditor({ label, origins, onChange, canEdit, placeholder, emptyText }: OriginEditorProps) {
  const [draft, setDraft] = useState("");
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    const result = parseOrigin(draft, origins);
    if (!result.ok) {
      setError(result.error);
      return;
    }
    onChange([...origins, result.value]);
    setDraft("");
    setError(null);
  };

  return (
    <div className="flex flex-col gap-3">
      {origins.length === 0 ? (
        <p className="rounded-md border border-dashed border-border-control px-3 py-3 text-body text-mute">{emptyText}</p>
      ) : (
        <ul aria-label={label} className="flex flex-col divide-y divide-hairline rounded-md border border-hairline">
          {origins.map((origin) => (
            <li key={origin} className="flex items-center justify-between gap-3 px-3 py-2">
              <span className="min-w-0 truncate font-mono text-mono text-ink">{origin}</span>
              {canEdit ? (
                <Button
                  variant="ghost"
                  size="icon"
                  aria-label={`Hapus ${origin}`}
                  onClick={() => onChange(origins.filter((item) => item !== origin))}
                >
                  <X aria-hidden="true" />
                </Button>
              ) : null}
            </li>
          ))}
        </ul>
      )}

      {canEdit ? (
        <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-2 sm:flex-row sm:items-start">
          <div className="min-w-0 flex-1">
            <TextField
              label="Tambah origin"
              value={draft}
              placeholder={placeholder ?? "https://contoh.id"}
              error={error}
              hint="Skema, host, dan port harus cocok persis dengan website."
              onChange={(event) => {
                setDraft(event.target.value);
                if (error !== null) setError(null);
              }}
              spellCheck={false}
              autoComplete="off"
              inputMode="url"
            />
          </div>
          <Button type="submit" variant="secondary" className="sm:mt-[22px]">
            <Plus aria-hidden="true" />
            Tambah
          </Button>
        </form>
      ) : null}
    </div>
  );
}

export { OriginEditor };
