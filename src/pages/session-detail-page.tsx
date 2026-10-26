import { useEffect, useMemo, useState } from "react";
import { ArrowLeft, CircleHelp, SearchX, TriangleAlert } from "lucide-react";
import { Link, useParams, useSearchParams } from "react-router";
import { AskButton } from "@/components/assistant/ask-button";
import { EventTimeline } from "@/components/replay/event-timeline";
import { ReplayControls } from "@/components/replay/replay-controls";
import { ReplayStage } from "@/components/replay/replay-stage";
import { SessionInfoPanel } from "@/components/replay/session-info-panel";
import { buttonVariants } from "@/components/ui/button";
import { StatusBadge } from "@/components/ui/status-badge";
import { usePlayback } from "@/hooks/use-playback";
import { formatClock, formatDateTime } from "@/lib/format";
import { cn } from "@/lib/utils";
import { buildReplay } from "@/mock/replay";
import { findSession } from "@/mock/sessions";
import type { MockProject, MockSession } from "@/mock/types";
import { useActiveProject } from "@/state/use-active-project";

function MetaItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-0.5">
      <dt className="font-mono text-label uppercase tracking-[0.06em] text-stone">{label}</dt>
      <dd className="truncate text-body text-ink">{value}</dd>
    </div>
  );
}

function SessionNotFound({ projectId }: { projectId: string }) {
  return (
    <section
      aria-label="Sesi tidak ditemukan"
      className="flex flex-col items-center gap-2 rounded-lg border border-hairline bg-canvas px-6 py-14 text-center"
    >
      <SearchX className="size-5 text-stone" aria-hidden="true" />
      <p className="text-heading-sm font-semibold text-ink">Sesi tidak ditemukan</p>
      <p className="max-w-sm text-body text-mute">
        Sesi ini tidak ada atau sudah melewati masa simpan rekaman.
      </p>
      <Link to={`/p/${projectId}/sessions`} className={cn(buttonVariants({ variant: "secondary" }), "mt-2")}>
        Kembali ke Histori Sesi
      </Link>
    </section>
  );
}

function IntegrityNote({ session, gapAt }: { session: MockSession; gapAt: number | null }) {
  if (session.integrity === "has_gap") {
    return (
      <p
        role="note"
        className="flex items-start gap-2 rounded-lg border border-hairline bg-warning-bg p-3 text-body text-warning-text"
      >
        <TriangleAlert className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
        {`Rekaman sesi ini punya celah${gapAt === null ? "" : ` sekitar menit ${formatClock(gapAt)}`}. Bagian itu tidak bisa diputar.`}
      </p>
    );
  }
  if (session.integrity === "unknown") {
    return (
      <p
        role="note"
        className="flex items-start gap-2 rounded-lg border border-hairline bg-surface-soft p-3 text-body text-charcoal"
      >
        <CircleHelp className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
        Kelengkapan rekaman belum bisa dipastikan. Sesi ini mungkin terputus sebelum selesai dikirim.
      </p>
    );
  }
  return null;
}

function SessionPlayer({ project, session }: { project: MockProject; session: MockSession }) {
  const replay = useMemo(() => buildReplay(session), [session]);
  const playback = usePlayback(replay.durationMs);
  const [params] = useSearchParams();
  const seekSeconds = Number(params.get("t"));
  const { seek } = playback;
  const durationSeconds = session.durationSeconds;
  const durationMs = replay.durationMs;

  // Tautan dari asisten membawa detik di sesi asli, dipetakan ke panjang rekaman tiruan
  useEffect(() => {
    if (Number.isFinite(seekSeconds) && seekSeconds > 0 && durationSeconds > 0) {
      seek((seekSeconds / durationSeconds) * durationMs);
    }
  }, [seekSeconds, durationSeconds, durationMs, seek]);

  const gapAtSeconds = replay.gap === null ? null : (replay.gap.from * replay.durationMs) / 1000;

  return (
    <div className="flex flex-col gap-4">
      <header className="flex flex-col gap-3">
        <Link
          to={`/p/${project.id}/sessions`}
          className="-my-1.5 inline-flex min-h-7 w-fit items-center gap-1.5 py-1.5 text-caption pointer-coarse:min-h-10 text-mute transition-colors duration-[var(--motion-fast)] hover:text-ink"
        >
          <ArrowLeft className="size-3.5" aria-hidden="true" />
          Histori Sesi
        </Link>
        <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
          <h1 className="font-mono text-page-title font-medium text-ink">{session.id}</h1>
          {session.problemScore > 0 ? (
            <StatusBadge kind="warning" icon={TriangleAlert}>
              {`Skor masalah ${session.problemScore}`}
            </StatusBadge>
          ) : null}
          <span className="ml-auto">
            <AskButton request={{ kind: "session", sessionId: session.id }} label={`Ringkas sesi ${session.id}`}>
              Ringkas sesi ini
            </AskButton>
          </span>
        </div>
        <dl className="grid grid-cols-2 gap-x-6 gap-y-3 sm:grid-cols-3 xl:grid-cols-6">
          <MetaItem label="Mulai" value={formatDateTime(session.startedAt)} />
          <MetaItem label="Durasi" value={formatClock(session.durationSeconds)} />
          <MetaItem label="Perangkat" value={`${session.device} · ${session.os}`} />
          <MetaItem label="Browser" value={session.browser} />
          <MetaItem label="Sumber" value={session.source} />
          <MetaItem label="Negara" value={session.country} />
        </dl>
      </header>

      <IntegrityNote session={session} gapAt={gapAtSeconds} />

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[minmax(0,1fr)_22rem] lg:items-start">
        <div className="flex flex-col gap-3 lg:sticky lg:top-0">
          <ReplayStage session={session} replay={replay} timeMs={playback.timeMs} siteUrl={project.siteUrl} />
          <ReplayControls replay={replay} playback={playback} />
        </div>
        <EventTimeline replay={replay} timeMs={playback.timeMs} onSeek={playback.seek} />
      </div>

      <SessionInfoPanel session={session} />
    </div>
  );
}

function SessionDetailPage() {
  const { project } = useActiveProject();
  const { sessionId } = useParams();
  const [now] = useState(() => new Date());

  const session = useMemo(
    () => (project === null || sessionId === undefined ? null : findSession(project.id, sessionId, now)),
    [project, sessionId, now],
  );

  if (project === null) return null;
  if (session === null) return <SessionNotFound projectId={project.id} />;
  return <SessionPlayer key={session.id} project={project} session={session} />;
}

export { SessionDetailPage };
