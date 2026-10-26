import { useEffect, useRef, useState } from "react";
import { Check, Clock, LoaderCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { Invitation } from "@/mock/accounts";

// Menerima undangan mengubah akses, jadi prosesnya dibuat terlihat sebentar
const ACCEPT_MIN_MS = 600;

type InvitationCardProps = {
  invitation: Invitation;
  onAccept: (invitation: Invitation) => void;
  onDecline: (invitation: Invitation) => void;
};

function InvitationCard({ invitation, onAccept, onDecline }: InvitationCardProps) {
  const [isAccepting, setAccepting] = useState(false);
  const [isConfirmingDecline, setConfirmingDecline] = useState(false);
  const timerRef = useRef<number | null>(null);

  useEffect(
    () => () => {
      if (timerRef.current !== null) window.clearTimeout(timerRef.current);
    },
    [],
  );

  const handleAccept = () => {
    if (isAccepting) return;
    setAccepting(true);
    timerRef.current = window.setTimeout(() => onAccept(invitation), ACCEPT_MIN_MS);
  };

  return (
    <li className="flex flex-col gap-3 rounded-lg border border-hairline bg-canvas p-4">
      <div className="flex items-start gap-3">
        <span
          aria-hidden="true"
          className="flex size-9 shrink-0 items-center justify-center rounded-sm bg-ink text-body font-semibold text-paper"
        >
          {invitation.projectName.slice(0, 1).toUpperCase()}
        </span>
        <div className="flex min-w-0 flex-1 flex-col">
          <h3 className="truncate text-body font-semibold text-ink">{invitation.projectName}</h3>
          <p className="truncate font-mono text-caption text-mute">{invitation.siteUrl}</p>
        </div>
      </div>

      <p className="text-body text-charcoal">
        <span className="font-medium text-ink">{invitation.invitedBy}</span> mengundang Anda sebagai{" "}
        <strong className="font-semibold text-ink">Anggota</strong> {invitation.sentLabel}. Anggota bisa melihat semua
        data, tetapi tidak mengubah pengaturan.
      </p>

      <p className="flex items-center gap-1.5 text-caption text-mute">
        <Clock className="size-3.5" aria-hidden="true" />
        Berlaku {invitation.daysLeft} hari lagi
      </p>

      <div className="flex flex-wrap items-center gap-2">
        {isConfirmingDecline ? (
          <>
            <span className="text-body text-charcoal">Tolak undangan ini?</span>
            <Button variant="destructive" size="sm" onClick={() => onDecline(invitation)}>
              Ya, tolak
            </Button>
            <Button variant="ghost" size="sm" onClick={() => setConfirmingDecline(false)}>
              Batal
            </Button>
          </>
        ) : (
          <>
            <Button variant="primary" onClick={handleAccept} disabled={isAccepting} aria-busy={isAccepting}>
              {isAccepting ? <LoaderCircle className="animate-spin" aria-hidden="true" /> : <Check aria-hidden="true" />}
              {isAccepting ? "Menerima…" : "Terima undangan"}
            </Button>
            <Button variant="ghost" onClick={() => setConfirmingDecline(true)} disabled={isAccepting}>
              Tolak
            </Button>
          </>
        )}
      </div>
    </li>
  );
}

export { InvitationCard };
