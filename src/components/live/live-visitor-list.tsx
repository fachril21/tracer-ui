import { Bug, Flame, Monitor, MousePointerClick, Play, Smartphone, Tablet } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { StatusBadge } from "@/components/ui/status-badge";
import type { StatusKind } from "@/components/ui/status-badge";
import { formatDuration } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { LiveVisitor } from "@/mock/live";
import type { MockSession, SmartEventKind } from "@/mock/types";
import { useDemo } from "@/state/demo-context";

const DEVICE_ICON: Record<MockSession["device"], LucideIcon> = {
  Mobile: Smartphone,
  Desktop: Monitor,
  Tablet,
};

const SIGNAL_META: Record<SmartEventKind, { label: string; icon: LucideIcon; kind: StatusKind }> = {
  rage_click: { label: "Rage click", icon: Flame, kind: "warning" },
  dead_click: { label: "Dead click", icon: MousePointerClick, kind: "warning" },
  js_error: { label: "Error JS", icon: Bug, kind: "danger" },
};

// Pengunjung yang baru masuk disorot sebentar supaya terlihat dari sudut mata
const NEW_WINDOW_MS = 3500;

type LiveVisitorListProps = {
  visitors: LiveVisitor[];
  now: number;
  onWatch: (visitor: LiveVisitor) => void;
};

function LiveVisitorList({ visitors, now, onWatch }: LiveVisitorListProps) {
  const { density } = useDemo();
  return (
    <ul className="flex flex-col divide-y divide-hairline">
      {visitors.map((visitor) => {
        const DeviceIcon = DEVICE_ICON[visitor.device];
        const isLeaving = visitor.leavingAt !== null;
        const isNew = !isLeaving && now - visitor.startedAt < NEW_WINDOW_MS;
        const signal = visitor.signal === null ? null : SIGNAL_META[visitor.signal];
        const seconds = Math.max(0, Math.round(((visitor.leavingAt ?? now) - visitor.startedAt) / 1000));
        return (
          <li key={visitor.id} className={cn("transition-opacity duration-[var(--motion-panel)]", isLeaving && "opacity-40")}>
            <button
              type="button"
              disabled={isLeaving}
              onClick={() => onWatch(visitor)}
              aria-label={`Tonton langsung ${visitor.id}, di halaman ${visitor.path}`}
              className={cn(
                "group grid w-full grid-cols-[minmax(0,1fr)_auto] items-center gap-x-4 gap-y-1 rounded-md px-3 text-left transition-colors duration-[var(--motion-fast)] hover:bg-surface-hover disabled:pointer-events-none",
                density === "padat" ? "py-2" : "py-3.5",
                isNew && "animate-[fade-in_var(--motion-panel)_var(--ease-out)] bg-primary-soft",
              )}
            >
              <span className="flex min-w-0 items-center gap-3">
                <DeviceIcon className="size-4 shrink-0 text-stone" aria-label={visitor.device} />
                <span className="flex min-w-0 flex-col">
                  <span className="truncate font-mono text-mono text-ink">{visitor.path}</span>
                  <span className="truncate text-caption text-mute">
                    {`${visitor.browser} · ${visitor.os} · ${visitor.source} · ${visitor.pageCount} halaman`}
                  </span>
                </span>
              </span>
              <span className="flex items-center gap-3">
                {signal === null ? null : (
                  <StatusBadge kind={signal.kind} icon={signal.icon} className="hidden sm:inline-flex">
                    {signal.label}
                  </StatusBadge>
                )}
                {isLeaving ? (
                  <span className="font-mono text-caption text-mute">Pergi</span>
                ) : (
                  <span className="w-14 text-right font-mono text-caption tabular-nums text-mute">
                    {formatDuration(seconds)}
                  </span>
                )}
                <span className="flex w-16 items-center justify-end gap-1 text-caption font-medium text-primary-pressed opacity-0 transition-opacity duration-[var(--motion-fast)] group-hover:opacity-100 group-focus-visible:opacity-100 pointer-coarse:opacity-100">
                  <Play className="size-3.5" aria-hidden="true" />
                  Tonton
                </span>
              </span>
              {signal === null ? null : (
                <StatusBadge kind={signal.kind} icon={signal.icon} className="w-fit sm:hidden">
                  {signal.label}
                </StatusBadge>
              )}
            </button>
          </li>
        );
      })}
    </ul>
  );
}

export { LiveVisitorList };
