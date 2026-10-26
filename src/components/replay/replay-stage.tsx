import { useMemo } from "react";
import { Lock } from "lucide-react";
import { cn } from "@/lib/utils";
import { cursorAt } from "@/mock/replay";
import type { Replay, ReplayEvent } from "@/mock/replay";
import type { MockSession } from "@/mock/types";

const EFFECT_WINDOW_MS = 1100;

const ASPECT: Record<MockSession["device"], string> = {
  Desktop: "aspect-[16/10]",
  Tablet: "aspect-[4/3] max-w-[520px]",
  Mobile: "aspect-[9/17] max-w-[260px]",
};

// Kerangka halaman tiruan: balok-balok abu yang menandai letak elemen, bukan tampilan situs asli
function WireframePage({ path }: { path: string }) {
  const seed = path.length % 3;
  return (
    <div aria-hidden="true" className="absolute inset-0 text-border-control">
      <div className="absolute inset-x-0 top-0 flex h-[11%] items-center justify-between border-b border-current px-[4%]">
        <div className="h-2 w-[14%] rounded-xs bg-current" />
        <div className="flex items-center gap-[3%]">
          <div className="h-1.5 w-8 rounded-xs bg-current opacity-60" />
          <div className="h-1.5 w-8 rounded-xs bg-current opacity-60" />
          <div className="size-3 rounded-xs border border-current" />
        </div>
      </div>
      <div className="absolute inset-x-[4%] top-[15%] h-[14%] rounded-md border border-dashed border-current" />
      <div className="absolute left-[4%] top-[34%] h-1.5 w-[30%] rounded-xs bg-current opacity-80" />
      <div className="absolute left-[4%] top-[39%] h-1.5 w-[44%] rounded-xs bg-current opacity-50" />
      {[0, 1, 2].map((index) => (
        <div
          key={index}
          className="absolute top-[47%] h-[26%] w-[27%] rounded-md border border-current"
          style={{ left: `${4 + index * 31}%` }}
        >
          <div className="m-[8%] h-[45%] rounded-xs bg-current opacity-30" />
          <div className="mx-[8%] h-1 w-[55%] rounded-xs bg-current opacity-60" />
        </div>
      ))}
      <div
        className="absolute bottom-[7%] right-[8%] flex h-[9%] w-[22%] items-center justify-center rounded-md border border-current"
        style={{ opacity: seed === 0 ? 1 : 0.85 }}
      >
        <div className="h-1.5 w-[55%] rounded-xs bg-current" />
      </div>
    </div>
  );
}

function CursorArrow() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">
      <path
        d="M2 1.5 15 8.2l-5.6 1.6L7.6 15.5 2 1.5Z"
        className="fill-ink stroke-canvas"
        strokeWidth="1.2"
        strokeLinejoin="round"
      />
    </svg>
  );
}

// Efek kejadian dihitung dari umur kejadian terhadap waktu pemutar, jadi tetap benar saat digeser mundur
function EventEffect({ event, ageMs }: { event: ReplayEvent; ageMs: number }) {
  const ratio = ageMs / EFFECT_WINDOW_MS;
  const opacity = 1 - ratio;

  if (event.kind === "rage_click" || event.kind === "dead_click") {
    const rings = event.kind === "rage_click" ? 3 : 1;
    return (
      <div
        aria-hidden="true"
        className="pointer-events-none absolute"
        style={{ left: `${event.target.x}%`, top: `${event.target.y}%` }}
      >
        {Array.from({ length: rings }, (_, index) => (
          <span
            key={index}
            className={cn(
              "absolute left-0 top-0 size-8 rounded-xs border-2",
              event.kind === "rage_click" ? "border-warning-solid" : "border-dashed border-stone",
            )}
            style={{
              opacity: Math.max(opacity - index * 0.18, 0),
              transform: `translate(-50%, -50%) scale(${0.5 + ratio * (1.1 + index * 0.55)})`,
            }}
          />
        ))}
      </div>
    );
  }
  return null;
}

function ErrorToast({ event }: { event: ReplayEvent }) {
  return (
    <div
      role="presentation"
      className="absolute inset-x-[4%] bottom-[3%] rounded-md border border-danger-solid bg-danger-bg px-3 py-1.5 text-caption text-danger-text"
    >
      <span className="font-mono font-medium">{event.kind === "js_error" ? "Error JS" : "Jaringan"}</span>
      <span className="ml-2 truncate">{event.title}</span>
    </div>
  );
}

type ReplayStageProps = {
  session: MockSession;
  replay: Replay;
  timeMs: number;
  siteUrl: string;
};

function ReplayStage({ session, replay, timeMs, siteUrl }: ReplayStageProps) {
  const progress = timeMs / replay.durationMs;
  const isInGap = replay.gap !== null && progress >= replay.gap.from && progress < replay.gap.to;

  const pageEvents = useMemo(() => replay.events.filter((event) => event.kind === "page"), [replay]);
  const currentPath =
    [...pageEvents].reverse().find((event) => event.at <= progress)?.path ?? session.entryPage;
  const cursor = cursorAt(replay.cursor, progress);

  const recent = replay.events.filter((event) => {
    const age = timeMs - event.at * replay.durationMs;
    return age >= 0 && age < EFFECT_WINDOW_MS * 1.6;
  });
  const lastError = [...replay.events]
    .reverse()
    .find(
      (event) =>
        (event.kind === "js_error" || event.kind === "network_error") &&
        timeMs >= event.at * replay.durationMs &&
        timeMs - event.at * replay.durationMs < 2600,
    );

  return (
    <figure className="flex flex-col overflow-hidden rounded-lg border border-hairline bg-canvas">
      <figcaption className="flex items-center gap-2 border-b border-hairline bg-paper px-3 py-2">
        <Lock className="size-3.5 shrink-0 text-stone" aria-hidden="true" />
        <span className="truncate font-mono text-caption text-mute">{`${siteUrl}${currentPath === "/" ? "" : currentPath}`}</span>
        <span className="ml-auto shrink-0 font-mono text-label uppercase tracking-[0.06em] text-stone">
          {`${session.device} · ${session.browser}`}
        </span>
      </figcaption>

      <div className="bg-stage-grid flex justify-center p-3">
        <div
          role="img"
          aria-label={`Pemutar tiruan, halaman ${currentPath}, kursor di ${Math.round(cursor.x)}% lebar dan ${Math.round(cursor.y)}% tinggi`}
          className={cn(
            "relative w-full overflow-hidden rounded-md border border-border-control bg-canvas",
            ASPECT[session.device],
          )}
        >
          <WireframePage path={currentPath} />

          {recent.map((event) => (
            <EventEffect key={event.id} event={event} ageMs={timeMs - event.at * replay.durationMs} />
          ))}
          {lastError === undefined ? null : <ErrorToast event={lastError} />}

          <div
            aria-hidden="true"
            className="pointer-events-none absolute"
            style={{ left: `${cursor.x}%`, top: `${cursor.y}%` }}
          >
            <CursorArrow />
          </div>

          {isInGap ? (
            <div className="absolute inset-0 grid place-items-center bg-canvas/90">
              <p className="rounded-md border border-warning-solid bg-warning-bg px-3 py-2 text-body text-warning-text">
                Tidak ada rekaman pada bagian ini
              </p>
            </div>
          ) : null}
        </div>
      </div>
    </figure>
  );
}

export { ReplayStage };
