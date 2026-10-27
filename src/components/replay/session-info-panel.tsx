import { useMemo } from "react";
import type { ReactNode } from "react";
import { CircleCheck, Info, Radio } from "lucide-react";
import { Istilah } from "@/components/ui/istilah";
import { Panel } from "@/components/ui/panel";
import { StatusBadge } from "@/components/ui/status-badge";
import { formatCount, formatDateTime, formatDuration } from "@/lib/format";
import type { GlossaryKey } from "@/lib/glossary";
import { buildSessionInfo } from "@/mock/session-info";
import type { MockSession } from "@/mock/types";

type FieldProps = {
  label: string;
  term?: GlossaryKey;
  children: ReactNode;
  isMono?: boolean;
  isMuted?: boolean;
};

function Field({ label, term, children, isMono = false, isMuted = false }: FieldProps) {
  return (
    <div className="flex min-w-0 flex-col gap-0.5">
      <dt className="text-caption text-mute">{term === undefined ? label : <Istilah term={term}>{label}</Istilah>}</dt>
      <dd className={`break-words text-body ${isMuted ? "text-mute" : "text-ink"} ${isMono ? "font-mono text-mono" : ""}`}>
        {children}
      </dd>
    </div>
  );
}

function formatSize(kb: number): string {
  if (kb >= 1024) return `${(kb / 1024).toFixed(1).replace(".", ",")} MB`;
  return `${kb.toFixed(1).replace(".", ",")} KB`;
}

// Rincian teknis sesi: waktu, ukuran rekaman, perangkat, dan user agent
function SessionInfoPanel({ session }: { session: MockSession }) {
  const info = useMemo(() => buildSessionInfo(session, new Date()), [session]);

  return (
    <Panel title="Informasi sesi" meta={<Istilah term="zonaWaktu">Zona waktu: Asia/Jakarta</Istilah>}>
      <dl className="grid grid-cols-1 gap-x-8 gap-y-4 sm:grid-cols-2 lg:grid-cols-3">
        <Field label="Mulai">{formatDateTime(info.startedAt)}</Field>
        <Field label="Aktif terakhir" term="aktifTerakhir">{formatDateTime(info.lastActiveAt)}</Field>
        <Field label="Selesai" term="selesai" isMuted={info.endedAt === null}>
          {info.endedAt === null ? "Masih berlangsung" : formatDateTime(info.endedAt)}
        </Field>

        <Field label="Durasi">{formatDuration(info.durationSeconds)}</Field>
        <Field label="Jumlah chunk" term="chunk">{formatCount(info.chunkCount)}</Field>
        <Field label="Ukuran" term="ukuran">{formatSize(info.sizeKb)}</Field>

        <Field label="Halaman awal" term="halamanAwal" isMono>
          {session.entryPage}
        </Field>
        <Field label="Smart Events" term="smartEvents">{formatCount(info.smartEventTotal)}</Field>
        <Field label="Skor Masalah" term="skorMasalah">{formatCount(session.problemScore)}</Field>

        <div className="flex flex-col gap-1">
          <dt className="text-caption text-mute">Status</dt>
          <dd>
            {info.isLive ? (
              <StatusBadge kind="success" icon={Radio}>
                Berlangsung
              </StatusBadge>
            ) : (
              <StatusBadge kind="neutral" icon={CircleCheck}>
                Selesai
              </StatusBadge>
            )}
          </dd>
        </div>
      </dl>

      <dl className="grid grid-cols-1 gap-x-8 gap-y-4 sm:grid-cols-2 lg:grid-cols-3">
        <Field label="Browser">{session.browser}</Field>
        <Field label="OS">{session.os}</Field>
        <Field label="Tipe perangkat">{session.device}</Field>
      </dl>

      <dl>
        <Field label="User agent" term="userAgent" isMono>
          {info.userAgent}
        </Field>
      </dl>

      {info.isLive ? (
        <p role="note" className="flex items-start gap-2 rounded-md border border-hairline bg-surface-soft p-3 text-body text-charcoal">
          <Info className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
          Sesi masih berlangsung. Data dapat bertambah dan halaman ini tidak memperbarui otomatis. Muat ulang halaman
          untuk mengambil data terbaru.
        </p>
      ) : null}
    </Panel>
  );
}

export { SessionInfoPanel };
