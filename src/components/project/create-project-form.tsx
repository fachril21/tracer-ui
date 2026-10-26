import { useEffect, useRef, useState } from "react";
import type { FormEvent } from "react";
import { LoaderCircle, Plus } from "lucide-react";
import { AuthNotice } from "@/components/auth/auth-notice";
import { Button } from "@/components/ui/button";
import { TextField } from "@/components/ui/input";
import { PROJECT_LIMIT } from "@/mock/accounts";
import type { MockProject } from "@/mock/types";
import { useAuth } from "@/state/auth-context";

// Aksi jarang dan penting: prosesnya dibuat terlihat, bukan instan
const CREATE_MIN_MS = 1200;

type FieldErrors = { name: string | null; site: string | null };

// Alamat boleh diketik tanpa skema ("kopisenja.id"); yang disimpan origin baku
function toOrigin(input: string): string | null {
  const text = input.trim();
  if (text === "") return null;
  const withScheme = /^https?:\/\//i.test(text) ? text : `https://${text}`;
  try {
    const url = new URL(withScheme);
    if (!url.hostname.includes(".") && url.hostname !== "localhost") return null;
    return url.origin;
  } catch {
    return null;
  }
}

type CreateProjectFormProps = {
  onCreated: (project: MockProject) => void;
  onCancel?: () => void;
  onBusyChange?: (isBusy: boolean) => void;
  submitLabel?: string;
};

function CreateProjectForm({ onCreated, onCancel, onBusyChange, submitLabel = "Buat project" }: CreateProjectFormProps) {
  const { projects, canCreateProject, createProject } = useAuth();
  const [name, setName] = useState("");
  const [site, setSite] = useState("");
  const [errors, setErrors] = useState<FieldErrors>({ name: null, site: null });
  const [isBusy, setBusy] = useState(false);
  const timerRef = useRef<number | null>(null);

  useEffect(
    () => () => {
      if (timerRef.current !== null) window.clearTimeout(timerRef.current);
    },
    [],
  );

  if (!canCreateProject) {
    return (
      <div className="flex flex-col gap-3">
        <AuthNotice tone="warning">
          Anda sudah memakai {PROJECT_LIMIT} project, batas maksimum akun ini. Hapus project yang tidak dipakai atau
          minta admin menaikkan batas.
        </AuthNotice>
        {onCancel === undefined ? null : (
          <div className="flex justify-end">
            <Button variant="secondary" onClick={onCancel}>
              Tutup
            </Button>
          </div>
        )}
      </div>
    );
  }

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    if (isBusy) return;
    const trimmed = name.trim();
    const origin = toOrigin(site);
    const next: FieldErrors = {
      name:
        trimmed === ""
          ? "Isi nama project."
          : projects.some((item) => item.name.toLowerCase() === trimmed.toLowerCase())
            ? "Nama ini sudah dipakai project lain Anda."
            : null,
      site: site.trim() === "" ? "Isi alamat website." : origin === null ? "Alamat belum valid, contoh: kopisenja.id." : null,
    };
    setErrors(next);
    if (next.name !== null || next.site !== null || origin === null) return;

    setBusy(true);
    onBusyChange?.(true);
    timerRef.current = window.setTimeout(() => {
      const project = createProject({ name: trimmed, origin });
      onBusyChange?.(false);
      onCreated(project);
    }, CREATE_MIN_MS);
  };

  return (
    <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4">
      <TextField
        label="Nama project"
        value={name}
        autoFocus
        autoComplete="off"
        placeholder="Toko Kopi Senja"
        error={errors.name}
        hint={errors.name === null ? "Tampil di pemilih project dan judul halaman." : undefined}
        disabled={isBusy}
        onChange={(event) => {
          setName(event.target.value);
          if (errors.name !== null) setErrors({ ...errors, name: null });
        }}
      />
      <TextField
        label="Alamat website"
        value={site}
        autoComplete="off"
        inputMode="url"
        spellCheck={false}
        placeholder="kopisenja.id"
        error={errors.site}
        hint={errors.site === null ? "Hanya domain yang boleh mengirim rekaman. Bisa ditambah nanti di Pengaturan." : undefined}
        disabled={isBusy}
        onChange={(event) => {
          setSite(event.target.value);
          if (errors.site !== null) setErrors({ ...errors, site: null });
        }}
      />

      <div role="status" aria-live="polite" className="min-h-5">
        {isBusy ? (
          <div className="flex flex-col gap-2">
            <p className="text-caption text-mute">Menyiapkan project dan kunci pemasangan…</p>
            <div className="h-1 overflow-hidden rounded-xs bg-surface-active">
              <div className="animate-skeleton h-full w-1/3 rounded-xs bg-primary" />
            </div>
          </div>
        ) : null}
      </div>

      <div className="flex justify-end gap-2">
        {onCancel === undefined ? null : (
          <Button variant="secondary" onClick={onCancel} disabled={isBusy}>
            Batal
          </Button>
        )}
        <Button type="submit" variant="primary" disabled={isBusy} aria-busy={isBusy}>
          {isBusy ? <LoaderCircle className="animate-spin" aria-hidden="true" /> : <Plus aria-hidden="true" />}
          {isBusy ? "Membuat project…" : submitLabel}
        </Button>
      </div>
    </form>
  );
}

export { CreateProjectForm };
