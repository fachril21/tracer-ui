import { useEffect, useMemo, useRef, useState } from "react";
import { Pause, Play, SkipForward, UserX, X } from "lucide-react";
import { LiveIndicator } from "@/components/live/live-indicator";
import { EventTimeline } from "@/components/replay/event-timeline";
import { ReplayStage } from "@/components/replay/replay-stage";
import { Button } from "@/components/ui/button";
import { Sheet, SheetClose, SheetContent, SheetDescription, SheetTitle } from "@/components/ui/sheet";
import { formatDuration } from "@/lib/format";
import { WATCH_SECONDS, visitorToSession } from "@/mock/live";
import type { LiveVisitor } from "@/mock/live";
import { buildReplay } from "@/mock/replay";

const CLOCK_MS = 100;

type LiveWatchSheetProps = {
  visitor: LiveVisitor | null;
  isOpen: boolean;
  siteUrl: string;
  onClose: () => void;
};

// Posisi siaran = waktu nyata sejak pengunjung masuk. Dibekukan saat dijeda, kembali ke "sekarang" saat dilanjutkan.
function useLiveTime(startedAt: number, isFrozen: boolean): number {
  const [tick, setTick] = useState(() => Date.now());
  useEffect(() => {
    if (isFrozen) return;
    setTick(Date.now());
    const timer = window.setInterval(() => setTick(Date.now()), CLOCK_MS);
    return () => window.clearInterval(timer);
  }, [isFrozen]);
  return (tick - startedAt) % (WATCH_SECONDS * 1000);
}

function WatchBody({ visitor, siteUrl, isGone }: { visitor: LiveVisitor; siteUrl: string; isGone: boolean }) {
  const [isPaused, setPaused] = useState(false);
  const session = useMemo(
    () => visitorToSession(visitor),
    // Halaman yang berpindah tidak boleh membuat ulang rekaman tiruan di tengah tontonan
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [visitor.id, visitor.signal],
  );
  const replay = useMemo(() => buildReplay(session), [session]);
  const timeMs = useLiveTime(visitor.startedAt, isPaused || isGone);
  const seen = useMemo(
    () => ({ ...replay, events: replay.events.filter((event) => event.at * replay.durationMs <= timeMs) }),
    [replay, timeMs],
  );

  return (
    <div className="flex flex-1 flex-col gap-4 overflow-y-auto p-4">
      {isGone ? (
        <p
          role="status"
          className="flex items-start gap-2 rounded-lg border border-hairline bg-surface-soft p-3 text-body text-charcoal"
        >
          <UserX className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
          Pengunjung ini sudah pergi. Rekamannya muncul di Histori Sesi setelah selesai diproses.
        </p>
      ) : null}

      <ReplayStage session={session} replay={replay} timeMs={timeMs} siteUrl={siteUrl} />

      <div className="flex flex-wrap items-center gap-2">
        <Button variant="secondary" onClick={() => setPaused(!isPaused)} disabled={isGone} aria-pressed={isPaused}>
          {isPaused ? <Play aria-hidden="true" /> : <Pause aria-hidden="true" />}
          {isPaused ? "Lanjutkan" : "Jeda"}
        </Button>
        <Button variant="secondary" onClick={() => setPaused(false)} disabled={isGone || !isPaused}>
          <SkipForward aria-hidden="true" />
          Lompat ke sekarang
        </Button>
        <span className="ml-auto font-mono text-caption tabular-nums text-mute">
          {`Di sesi ${formatDuration(Math.round(timeMs / 1000))}`}
        </span>
      </div>

      <EventTimeline replay={seen} timeMs={timeMs} onSeek={() => undefined} />
    </div>
  );
}

function LiveWatchSheet({ visitor, isOpen, siteUrl, onClose }: LiveWatchSheetProps) {
  // Simpan pengunjung terakhir yang terlihat supaya sheet tetap berisi saat dia pergi
  const lastRef = useRef<LiveVisitor | null>(null);
  if (visitor !== null) lastRef.current = visitor;
  const shown = visitor ?? lastRef.current;
  const isGone = shown !== null && (visitor === null || shown.leavingAt !== null);

  return (
    <Sheet open={isOpen && shown !== null} onOpenChange={(open) => (open ? undefined : onClose())}>
      <SheetContent side="right" className="w-[min(40rem,100vw)]" aria-describedby="live-watch-desc">
        <header className="flex items-start justify-between gap-3 border-b border-hairline p-4">
          <div className="flex min-w-0 flex-col gap-1.5">
            <SheetTitle className="flex flex-wrap items-center gap-2 text-heading-md font-semibold text-ink">
              Tonton langsung
              <LiveIndicator connection="terhubung" isPaused={isGone} />
            </SheetTitle>
            <SheetDescription id="live-watch-desc" className="truncate font-mono text-caption text-mute">
              {shown === null ? "" : `${shown.id} · ${shown.device} · ${shown.browser}`}
            </SheetDescription>
          </div>
          <SheetClose asChild>
            <Button variant="ghost" size="icon" aria-label="Tutup tontonan">
              <X />
            </Button>
          </SheetClose>
        </header>
        {shown === null ? null : <WatchBody key={shown.id} visitor={shown} siteUrl={siteUrl} isGone={isGone} />}
      </SheetContent>
    </Sheet>
  );
}

export { LiveWatchSheet };
