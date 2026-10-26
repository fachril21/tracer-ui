import { useState } from "react";
import type { FormEvent } from "react";
import { Clock, UserPlus, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { TextField } from "@/components/ui/input";
import { StatusBadge } from "@/components/ui/status-badge";
import type { Member } from "@/state/use-project-config";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
// Domain contoh untuk mensimulasikan email yang belum ada di allowlist
const NOT_ALLOWED_DOMAIN = "@luar.id";

type MembersEditorProps = {
  members: Member[];
  onChange: (next: Member[]) => void;
  canEdit: boolean;
};

function MembersEditor({ members, onChange, canEdit }: MembersEditorProps) {
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [resentIds, setResentIds] = useState<string[]>([]);

  const handleInvite = (event: FormEvent) => {
    event.preventDefault();
    const value = email.trim().toLowerCase();
    if (!EMAIL_PATTERN.test(value)) {
      setError("Isi alamat email yang valid, misalnya nama@perusahaan.id.");
      return;
    }
    if (members.some((member) => member.email === value)) {
      setError("Email ini sudah menjadi anggota atau sudah diundang.");
      return;
    }
    if (value.endsWith(NOT_ALLOWED_DOMAIN)) {
      setError("Email ini belum ada di allowlist Tracer. Minta admin menambahkannya, lalu undang lagi.");
      return;
    }
    const name = value.split("@")[0] ?? value;
    onChange([...members, { id: `m-${value}`, name, email: value, role: "anggota", isPending: true }]);
    setEmail("");
    setError(null);
  };

  return (
    <div className="flex flex-col gap-3">
      <ul aria-label="Anggota project" className="flex flex-col divide-y divide-hairline rounded-md border border-hairline">
        {members.map((member) => (
          <li key={member.id} className="flex flex-wrap items-center justify-between gap-x-3 gap-y-2 px-3 py-2.5">
            <div className="flex min-w-0 flex-col">
              <span className="truncate text-body font-medium text-ink">{member.name}</span>
              <span className="truncate font-mono text-caption text-mute">{member.email}</span>
            </div>
            <div className="flex shrink-0 flex-wrap items-center gap-2">
              {member.isPending ? (
                <StatusBadge kind="warning" icon={Clock}>
                  Menunggu diterima
                </StatusBadge>
              ) : null}
              <span className="font-mono text-label uppercase tracking-[0.06em] text-stone">{member.role}</span>
              {canEdit && member.isPending ? (
                <>
                  <Button
                    variant="ghost"
                    size="sm"
                    disabled={resentIds.includes(member.id)}
                    onClick={() => setResentIds([...resentIds, member.id])}
                  >
                    {resentIds.includes(member.id) ? "Terkirim ulang" : "Kirim ulang"}
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onChange(members.filter((item) => item.id !== member.id))}
                  >
                    Batalkan
                  </Button>
                </>
              ) : canEdit && member.role !== "pemilik" ? (
                <Button
                  variant="ghost"
                  size="icon"
                  aria-label={`Keluarkan ${member.email}`}
                  onClick={() => onChange(members.filter((item) => item.id !== member.id))}
                >
                  <X aria-hidden="true" />
                </Button>
              ) : null}
            </div>
          </li>
        ))}
      </ul>

      {canEdit ? (
        <form onSubmit={handleInvite} noValidate className="flex flex-col gap-2 sm:flex-row sm:items-start">
          <div className="min-w-0 flex-1">
            <TextField
              label="Undang anggota"
              type="email"
              value={email}
              placeholder="nama@perusahaan.id"
              error={error}
              hint="Undangan berlaku 7 hari. Anggota bisa melihat semua data, tetapi tidak mengubah pengaturan."
              autoComplete="off"
              onChange={(event) => {
                setEmail(event.target.value);
                if (error !== null) setError(null);
              }}
            />
          </div>
          <Button type="submit" variant="secondary" className="sm:mt-[22px]">
            <UserPlus aria-hidden="true" />
            Undang
          </Button>
        </form>
      ) : null}
    </div>
  );
}

export { MembersEditor };
