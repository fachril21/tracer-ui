import type { KeyboardEvent } from "react";
import { Pause, Play, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Segmented } from "@/components/ui/segmented";
import { SPEEDS } from "@/hooks/use-playback";
import type { Playback, PlaybackSpeed } from "@/hooks/use-playback";
import { formatClock } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { Replay, ReplayEventKind } from "@/mock/replay";

const MARKER_CLASS: Record<ReplayEventKind, string> = {
  page: "bg-charcoal",
  rage_click: "bg-warning-solid",
  dead_click: "bg-warning-solid",
  js_error: "bg-danger-solid",
  network_error: "bg-danger-solid",
};

const SPEED_OPTIONS = SPEEDS.map((speed) => ({ value: `${speed}`, label: `${speed}x` }));
const SKIP_SECONDS = 5;

type ReplayControlsProps = {
  replay: Replay;
  playback: Playback;
};

function ReplayControls({ replay, playback }: ReplayControlsProps) {
  const { timeMs, isPlaying, speed, toggle, seek, setSpeed } = playback;
  const isEnded = timeMs >= replay.durationMs;
  const progress = (timeMs / replay.durationMs) * 100;

  const handleKey = (event: KeyboardEvent<HTMLDivElement>) => {
    // Input range sudah menangani panah sendiri, jadi hanya spasi dan huruf k yang diambil di sini
    if (event.target instanceof HTMLInputElement && event.key !== " ") return;
    if (event.key === " " || event.key.toLowerCase() === "k") {
      event.preventDefault();
      toggle();
    }
  };

  return (
    <div
      role="group"
      aria-label="Kontrol pemutar"
      onKeyDown={handleKey}
      className="flex flex-col gap-3 rounded-lg border border-hairline bg-canvas p-3"
    >
      <div className="relative h-6">
        <div className="absolute inset-x-0 top-1/2 h-1.5 -translate-y-1/2 overflow-hidden rounded-xs bg-surface-active">
          <div className="h-full bg-primary" style={{ width: `${progress}%` }} />
          {replay.gap === null ? null : (
            <div
              aria-hidden="true"
              className="absolute inset-y-0 bg-[repeating-linear-gradient(135deg,var(--warning-solid)_0_2px,transparent_2px_5px)] opacity-70"
              style={{
                left: `${replay.gap.from * 100}%`,
                width: `${(replay.gap.to - replay.gap.from) * 100}%`,
              }}
            />
          )}
        </div>

        {replay.events.map((event) => (
          <span
            key={event.id}
            aria-hidden="true"
            className={cn(
              "pointer-events-none absolute top-1/2 size-2 -translate-x-1/2 -translate-y-1/2 rounded-xs ring-2 ring-canvas",
              MARKER_CLASS[event.kind],
            )}
            style={{ left: `${event.at * 100}%` }}
          />
        ))}

        <input
          type="range"
          aria-label="Posisi pemutaran"
          aria-valuetext={`${formatClock(timeMs / 1000)} dari ${formatClock(replay.durationMs / 1000)}`}
          min={0}
          max={replay.durationMs}
          step={100}
          value={timeMs}
          onChange={(event) => seek(Number(event.target.value))}
          className={cn(
            "absolute inset-0 m-0 h-full w-full cursor-pointer appearance-none bg-transparent",
            "[&::-webkit-slider-runnable-track]:bg-transparent [&::-moz-range-track]:bg-transparent",
            "[&::-webkit-slider-thumb]:size-3.5 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-xs [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-primary [&::-webkit-slider-thumb]:bg-canvas",
            "[&::-moz-range-thumb]:size-3.5 [&::-moz-range-thumb]:rounded-xs [&::-moz-range-thumb]:border-2 [&::-moz-range-thumb]:border-primary [&::-moz-range-thumb]:bg-canvas",
          )}
        />
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <Button
          variant="primary"
          size="icon"
          onClick={toggle}
          aria-label={isEnded ? "Putar ulang" : isPlaying ? "Jeda" : "Putar"}
        >
          {isEnded ? <RotateCcw /> : isPlaying ? <Pause /> : <Play />}
        </Button>
        <p className="font-mono text-caption tabular-nums text-ink">
          {formatClock(timeMs / 1000)}
          <span className="text-mute">{` / ${formatClock(replay.durationMs / 1000)}`}</span>
        </p>
        <div className="ml-auto flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => seek(timeMs - SKIP_SECONDS * 1000)}
            aria-label={`Mundur ${SKIP_SECONDS} detik`}
          >
            −{SKIP_SECONDS} d
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => seek(timeMs + SKIP_SECONDS * 1000)}
            aria-label={`Maju ${SKIP_SECONDS} detik`}
          >
            +{SKIP_SECONDS} d
          </Button>
          <Segmented
            label="Kecepatan"
            value={`${speed}`}
            options={SPEED_OPTIONS}
            onChange={(value) => setSpeed(Number(value) as PlaybackSpeed)}
          />
        </div>
      </div>
      <p className="text-caption text-stone">Spasi untuk putar atau jeda. Tiruan: bukan rekaman halaman asli.</p>
    </div>
  );
}

export { ReplayControls };
