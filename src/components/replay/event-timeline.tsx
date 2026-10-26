import { useEffect, useRef, useState } from "react";
import { Bug, FileText, Flame, MousePointerClick, WifiOff } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { Segmented } from "@/components/ui/segmented";
import { formatClock } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { Replay, ReplayEvent, ReplayEventKind } from "@/mock/replay";

const KIND_ICON: Record<ReplayEventKind, LucideIcon> = {
  page: FileText,
  rage_click: Flame,
  dead_click: MousePointerClick,
  js_error: Bug,
  network_error: WifiOff,
};

const NODE_CLASS: Record<ReplayEventKind, string> = {
  page: "bg-charcoal",
  rage_click: "bg-warning-solid",
  dead_click: "bg-warning-solid",
  js_error: "bg-danger-solid",
  network_error: "bg-danger-solid",
};

type TimelineFilter = "semua" | "masalah" | "halaman";

const FILTER_OPTIONS: { value: TimelineFilter; label: string }[] = [
  { value: "semua", label: "Semua" },
  { value: "masalah", label: "Bermasalah" },
  { value: "halaman", label: "Halaman" },
];

function matches(event: ReplayEvent, filter: TimelineFilter): boolean {
  if (filter === "semua") return true;
  return filter === "halaman" ? event.kind === "page" : event.kind !== "page";
}

// Mundur sedikit dari kejadian supaya penonton sempat melihat apa yang mendahuluinya
const LEAD_IN_MS = 2000;

type EventTimelineProps = {
  replay: Replay;
  timeMs: number;
  onSeek: (ms: number) => void;
};

function EventTimeline({ replay, timeMs, onSeek }: EventTimelineProps) {
  const [filter, setFilter] = useState<TimelineFilter>("semua");
  const listRef = useRef<HTMLOListElement>(null);

  const activeId =
    [...replay.events].reverse().find((event) => event.at * replay.durationMs <= timeMs)?.id ?? null;
  const visible = replay.events.filter((event) => matches(event, filter));

  // Daftar mengikuti pemutar, tetapi hanya menggulir isi daftar sendiri, bukan halaman
  useEffect(() => {
    const list = listRef.current;
    if (list === null || activeId === null) return;
    const row = list.querySelector<HTMLElement>(`[data-event-id="${activeId}"]`);
    if (row === null) return;
    const top = row.offsetTop - list.clientHeight / 2 + row.clientHeight / 2;
    list.scrollTo({ top: Math.max(top, 0), behavior: "auto" });
  }, [activeId]);

  return (
    <section aria-labelledby="timeline-heading" className="flex min-h-0 flex-col gap-3">
      <div className="flex items-baseline justify-between gap-3">
        <h2 id="timeline-heading" className="text-heading-md font-semibold text-ink">
          Linimasa kejadian
        </h2>
        <span className="font-mono text-caption tabular-nums text-mute">{`${visible.length} dari ${replay.events.length}`}</span>
      </div>
      <Segmented label="Saring kejadian" value={filter} options={FILTER_OPTIONS} onChange={setFilter} />

      {visible.length === 0 ? (
        <p className="rounded-lg border border-hairline bg-canvas p-4 text-body text-mute">
          Tidak ada kejadian pada kategori ini.
        </p>
      ) : (
        <ol
          ref={listRef}
          className="relative flex max-h-[28rem] flex-col overflow-y-auto rounded-lg border border-hairline bg-canvas"
        >
          {visible.map((event) => {
            const Icon = KIND_ICON[event.kind];
            const isActive = event.id === activeId;
            const isPast = event.at * replay.durationMs <= timeMs;
            return (
              <li key={event.id} data-event-id={event.id} className="border-b border-hairline last:border-b-0">
                <button
                  type="button"
                  aria-current={isActive ? "step" : undefined}
                  onClick={() => onSeek(event.at * replay.durationMs - LEAD_IN_MS)}
                  className={cn(
                    "grid w-full grid-cols-[3rem_1rem_minmax(0,1fr)] items-start gap-x-3 px-3 py-2.5 text-left transition-colors duration-[var(--motion-fast)] hover:bg-surface-hover",
                    isActive && "bg-primary-soft",
                    !isPast && "opacity-60",
                  )}
                >
                  <span className="pt-0.5 font-mono text-caption tabular-nums text-mute">
                    {formatClock(event.seconds)}
                  </span>
                  <span className={cn("mt-1 size-2.5 rounded-xs", NODE_CLASS[event.kind])} aria-hidden="true" />
                  <span className="flex min-w-0 flex-col gap-0.5">
                    <span className="flex items-center gap-1.5 text-body text-ink">
                      <Icon className="size-3.5 shrink-0 text-stone" aria-hidden="true" />
                      <span className="truncate">{event.title}</span>
                    </span>
                    <span className="truncate text-caption text-mute">{event.detail}</span>
                    <span className="truncate font-mono text-caption text-stone">{event.path}</span>
                  </span>
                </button>
              </li>
            );
          })}
        </ol>
      )}
    </section>
  );
}

export { EventTimeline };
