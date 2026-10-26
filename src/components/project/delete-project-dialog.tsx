import { useEffect, useRef, useState } from "react";
import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import { TextField } from "@/components/ui/input";

// Aksi kritis dan jarang: prosesnya dibuat terlihat, bukan instan
const DELETE_MIN_MS = 1800;

type DeleteProjectDialogProps = {
  projectName: string;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onDeleted: () => void;
};

function DeleteProjectDialog({ projectName, isOpen, onOpenChange, onDeleted }: DeleteProjectDialogProps) {
  const [typed, setTyped] = useState("");
  const [isDeleting, setDeleting] = useState(false);
  const timerRef = useRef<number | null>(null);

  useEffect(
    () => () => {
      if (timerRef.current !== null) window.clearTimeout(timerRef.current);
    },
    [],
  );

  const isMatch = typed.trim() === projectName;

  const handleDelete = () => {
    if (!isMatch || isDeleting) return;
    setDeleting(true);
    timerRef.current = window.setTimeout(() => {
      setDeleting(false);
      setTyped("");
      onDeleted();
    }, DELETE_MIN_MS);
  };

  const handleOpenChange = (open: boolean) => {
    // Dialog tidak boleh ditutup di tengah proses
    if (isDeleting) return;
    if (!open) setTyped("");
    onOpenChange(open);
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogContent>
        <div className="flex flex-col gap-2">
          <DialogTitle className="text-heading-md font-semibold text-ink">Hapus project ini?</DialogTitle>
          <DialogDescription className="text-body text-mute">
            Semua sesi, rekaman, dan peta milik <strong className="font-semibold text-ink">{projectName}</strong> akan
            dihapus permanen dan tidak bisa dikembalikan.
          </DialogDescription>
        </div>

        <TextField
          label={`Ketik "${projectName}" untuk melanjutkan`}
          value={typed}
          onChange={(event) => setTyped(event.target.value)}
          disabled={isDeleting}
          autoComplete="off"
          spellCheck={false}
        />

        <div role="status" aria-live="polite" className="min-h-5">
          {isDeleting ? (
            <div className="flex flex-col gap-2">
              <p className="text-caption text-mute">Menghapus sesi dan rekaman…</p>
              <div className="h-1 overflow-hidden rounded-xs bg-surface-active">
                <div className="animate-skeleton h-full w-1/3 rounded-xs bg-danger-solid" />
              </div>
            </div>
          ) : null}
        </div>

        <div className="flex justify-end gap-2">
          <DialogClose asChild>
            <Button variant="secondary" disabled={isDeleting}>
              Batal
            </Button>
          </DialogClose>
          <Button variant="destructive" onClick={handleDelete} disabled={!isMatch || isDeleting} aria-busy={isDeleting}>
            <Trash2 aria-hidden="true" />
            {isDeleting ? "Menghapus…" : "Hapus permanen"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export { DeleteProjectDialog };
