import { Bug, CircleHelp, Flame, Monitor, MousePointerClick, Smartphone, Tablet, TriangleAlert } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { Link } from "react-router";
import { TraceLine } from "@/components/overview/trace-line";
import { StatusBadge } from "@/components/ui/status-badge";
import { formatCount, formatDuration, formatRelative } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { MockSession, SmartEventKind } from "@/mock/types";
import { useDemo } from "@/state/demo-context";

const DEVICE_ICON: Record<MockSession["device"], LucideIcon> = {
  Mobile: Smartphone,
  Desktop: Monitor,
  Tablet,
};

const EVENT_META: { kind: SmartEventKind; label: string; icon: LucideIcon }[] = [
  { kind: "rage_click", label: "Rage click", icon: Flame },
  { kind: "dead_click", label: "Dead click", icon: MousePointerClick },
  { kind: "js_error", label: "Error JS", icon: Bug },
];

function EventCounts({ session }: { session: MockSession }) {
  return (
    <ul className="flex items-center gap-3">
      {EVENT_META.map(({ kind, label, icon: Icon }) => {
        const count = session.smartEvents[kind];
        return (
          <li
            key={kind}
            aria-label={`${label}: ${formatCount(count)}`}
            className={cn(
              "flex items-center gap-1 font-mono text-caption tabular-nums",
              count === 0
                ? "text-stone"
                : kind === "js_error"
                  ? "text-danger-text"
                  : "text-warning-text",
            )}
          >
            <Icon className="size-3.5" aria-hidden="true" />
            {formatCount(count)}
          </li>
        );
      })}
    </ul>
  );
}

function SessionRow({ session, href, now }: { session: MockSession; href: string; now: Date }) {
  const { density } = useDemo();
  const DeviceIcon = DEVICE_ICON[session.device];

  return (
    <li>
      <Link
        to={href}
        className={cn(
          "grid grid-cols-[minmax(0,1fr)_auto] items-center gap-x-4 gap-y-2 rounded-md px-3 transition-colors duration-[var(--motion-fast)] hover:bg-surface-hover md:grid-cols-[minmax(0,1.3fr)_minmax(0,1fr)_auto]",
          density === "padat" ? "py-2" : "py-3.5",
        )}
      >
        <span className="flex min-w-0 items-center gap-3">
          <DeviceIcon className="size-4 shrink-0 text-stone" aria-label={session.device} />
          <span className="flex min-w-0 flex-col">
            <span className="truncate font-mono text-mono text-ink">{session.entryPage}</span>
            <span className="truncate text-caption text-mute">
              {`${session.browser} · ${session.os} · ${formatDuration(session.durationSeconds)} · ${formatRelative(session.startedAt, now)}`}
            </span>
          </span>
        </span>

        <span className="order-last col-span-2 md:order-none md:col-span-1">
          <TraceLine trace={session.trace} />
        </span>

        <span className="flex items-center gap-4">
          {session.integrity === "has_gap" ? (
            <StatusBadge kind="warning" icon={TriangleAlert} className="hidden xl:inline-flex">
              Ada celah
            </StatusBadge>
          ) : session.integrity === "unknown" ? (
            <StatusBadge kind="neutral" icon={CircleHelp} className="hidden xl:inline-flex">
              Tidak diketahui
            </StatusBadge>
          ) : null}
          <EventCounts session={session} />
          <span className="w-10 text-right" aria-label={`Skor masalah ${session.problemScore}`}>
            <span className="font-mono text-heading-sm font-medium tabular-nums text-ink">
              {session.problemScore}
            </span>
          </span>
        </span>
      </Link>
    </li>
  );
}

type AttentionSessionsProps = {
  sessions: MockSession[];
  projectId: string;
  now: Date;
};

function AttentionSessions({ sessions, projectId, now }: AttentionSessionsProps) {
  return (
    <div className="flex flex-col gap-1">
      <div
        aria-hidden="true"
        className="hidden grid-cols-[minmax(0,1.3fr)_minmax(0,1fr)_auto] gap-x-4 px-3 pb-1 font-mono text-label uppercase tracking-[0.06em] text-stone md:grid"
      >
        <span>Halaman awal</span>
        <span>Jejak sesi</span>
        <span className="flex items-center gap-4">
          <span className="xl:w-[88px]" />
          <span className="w-[108px]">Kejadian</span>
          <span className="w-10 text-right">Skor</span>
        </span>
      </div>
      <ul className="flex flex-col divide-y divide-hairline">
        {sessions.map((session) => (
          <SessionRow key={session.id} session={session} href={`/p/${projectId}/sessions/${session.id}`} now={now} />
        ))}
      </ul>
    </div>
  );
}

export { AttentionSessions };
