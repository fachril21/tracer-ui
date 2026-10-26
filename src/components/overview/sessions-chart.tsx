import { useMemo, useState } from "react";
import type { KeyboardEvent, PointerEvent } from "react";
import { formatCount, formatPercent, formatShortDate } from "@/lib/format";
import type { DailyPoint } from "@/mock/types";

// Hari dengan porsi sesi bermasalah di atas ambang ini diberi penanda
const SPIKE_RATE = 0.1;
const Y_TICKS = 4;

function niceMax(value: number): number {
  const step = Math.pow(10, Math.floor(Math.log10(Math.max(value, 1))));
  return Math.ceil(value / step) * step;
}

type ChartPoint = DailyPoint & { x: number; y: number; previous: DailyPoint | null };

type SessionsChartProps = {
  series: DailyPoint[];
  // Sejajar indeks dengan series, kosong bila pembanding mati
  previousSeries: DailyPoint[];
  // Bila diberikan, klik atau Enter pada satu hari membuka sesi hari itu
  onSelectDay?: (date: Date) => void;
};

function SessionsChart({ series, previousSeries, onSelectDay }: SessionsChartProps) {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  const { points, max, linePath, areaPath, previousPath } = useMemo(() => {
    const peak = niceMax(
      Math.max(1, ...series.map((point) => point.sessions), ...previousSeries.map((point) => point.sessions)),
    );
    const last = Math.max(series.length - 1, 1);
    const mapped: ChartPoint[] = series.map((point, index) => ({
      ...point,
      x: (index / last) * 100,
      y: 100 - (point.sessions / peak) * 100,
      previous: previousSeries[index] ?? null,
    }));
    const line = mapped.map((point, index) => `${index === 0 ? "M" : "L"}${point.x},${point.y}`).join(" ");
    const previousLine = mapped
      .filter((point) => point.previous !== null)
      .map((point, index) => `${index === 0 ? "M" : "L"}${point.x},${100 - ((point.previous?.sessions ?? 0) / peak) * 100}`)
      .join(" ");
    return {
      points: mapped,
      max: peak,
      linePath: line,
      areaPath: `${line} L100,100 L0,100 Z`,
      previousPath: previousLine,
    };
  }, [series, previousSeries]);

  const total = series.reduce((sum, point) => sum + point.sessions, 0);
  const peakPoint = points.reduce((best, point) => (point.sessions > best.sessions ? point : best), points[0]!);
  const hasPrevious = previousPath !== "";
  const spikeCount = points.filter((point) => point.isSpike).length;
  const active = activeIndex === null ? null : (points[activeIndex] ?? null);

  const labelStep = Math.max(1, Math.ceil(points.length / 6));
  // Label reguler yang terlalu dekat dengan label terakhir dibuang supaya tidak bertumpuk
  const xLabels = points.filter(
    (_, index) =>
      index === points.length - 1 ||
      (index % labelStep === 0 && points.length - 1 - index >= Math.ceil(labelStep / 2)),
  );

  const handlePointer = (event: PointerEvent<HTMLDivElement>) => {
    const rect = event.currentTarget.getBoundingClientRect();
    const ratio = (event.clientX - rect.left) / rect.width;
    const index = Math.round(Math.min(Math.max(ratio, 0), 1) * (points.length - 1));
    setActiveIndex(index);
  };

  const handleKey = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key === "Enter" && active !== null && onSelectDay !== undefined) {
      event.preventDefault();
      onSelectDay(active.date);
      return;
    }
    if (event.key !== "ArrowLeft" && event.key !== "ArrowRight") return;
    event.preventDefault();
    const delta = event.key === "ArrowRight" ? 1 : -1;
    setActiveIndex((current) => {
      const from = current ?? points.length - 1;
      return Math.min(Math.max(from + delta, 0), points.length - 1);
    });
  };

  return (
    <div className="flex flex-col gap-3">
      <p className="sr-only">
        {`Sesi harian ${points.length} hari terakhir, total ${formatCount(total)}. Tertinggi ${formatCount(peakPoint.sessions)} pada ${formatShortDate(peakPoint.date)}. ${spikeCount} hari dengan lonjakan sesi bermasalah. Gunakan panah kiri dan kanan untuk membaca tiap hari.${onSelectDay === undefined ? "" : " Tekan Enter untuk membuka sesi hari itu."}`}
      </p>

      <div className="grid grid-cols-[3rem_1fr] gap-x-2">
        <div aria-hidden="true" className="relative h-56">
          {Array.from({ length: Y_TICKS + 1 }, (_, index) => {
            const share = index / Y_TICKS;
            return (
              <span
                key={share}
                className="absolute right-0 -translate-y-1/2 font-mono text-caption tabular-nums text-mute"
                style={{ top: `${(1 - share) * 100}%` }}
              >
                {formatCount(Math.round(max * share))}
              </span>
            );
          })}
        </div>

        <div
          role="group"
          tabIndex={0}
          aria-label="Grafik sesi harian"
          className={`relative h-56 rounded-sm ${onSelectDay === undefined ? "cursor-crosshair" : "cursor-pointer"}`}
          onClick={() => {
            if (active !== null && onSelectDay !== undefined) onSelectDay(active.date);
          }}
          onPointerMove={handlePointer}
          onPointerLeave={() => setActiveIndex(null)}
          onKeyDown={handleKey}
          onFocus={() => setActiveIndex((current) => current ?? points.length - 1)}
          onBlur={() => setActiveIndex(null)}
        >
          {Array.from({ length: Y_TICKS + 1 }, (_, index) => (
            <div
              key={index}
              aria-hidden="true"
              className="absolute inset-x-0 h-px bg-hairline"
              style={{ top: `${(index / Y_TICKS) * 100}%` }}
            />
          ))}

          <svg
            viewBox="0 0 100 100"
            preserveAspectRatio="none"
            className="absolute inset-0 size-full overflow-visible"
            aria-hidden="true"
          >
            <path d={areaPath} fill="var(--primary)" fillOpacity="0.1" />
            {hasPrevious ? (
              <path
                d={previousPath}
                fill="none"
                stroke="var(--stone)"
                strokeWidth="1.5"
                strokeDasharray="4 3"
                vectorEffect="non-scaling-stroke"
                strokeLinejoin="round"
              />
            ) : null}
            <path
              d={linePath}
              fill="none"
              stroke="var(--primary)"
              strokeWidth="2"
              vectorEffect="non-scaling-stroke"
              strokeLinejoin="round"
            />
          </svg>

          {points
            .filter((point) => point.isSpike)
            .map((point) => (
              <span
                key={point.date.toISOString()}
                aria-hidden="true"
                className="absolute size-2 -translate-x-1/2 -translate-y-1/2 rounded-xs bg-danger-solid ring-2 ring-canvas"
                style={{ left: `${point.x}%`, top: `${point.y}%` }}
              />
            ))}

          {active === null ? null : (
            <>
              <div
                aria-hidden="true"
                className="absolute inset-y-0 w-px bg-ink opacity-30"
                style={{ left: `${active.x}%` }}
              />
              <span
                aria-hidden="true"
                className="absolute size-2.5 -translate-x-1/2 -translate-y-1/2 rounded-xs border-2 border-primary bg-canvas"
                style={{ left: `${active.x}%`, top: `${active.y}%` }}
              />
              <div
                role="status"
                className="pointer-events-none absolute top-2 z-10 w-44 rounded-lg border border-hairline bg-canvas p-3 shadow-overlay"
                style={{
                  left: `${active.x}%`,
                  transform: active.x > 60 ? "translateX(calc(-100% - 12px))" : "translateX(12px)",
                }}
              >
                <p className="font-mono text-caption text-mute">{formatShortDate(active.date)}</p>
                <p className="font-mono text-heading-md font-medium tabular-nums text-ink">
                  {formatCount(active.sessions)} sesi
                </p>
                <p className="text-caption text-mute">
                  {`${formatCount(active.problemSessions)} bermasalah (${formatPercent(active.sessions === 0 ? 0 : (active.problemSessions / active.sessions) * 100)})`}
                </p>
                {active.previous === null ? null : (
                  <p className="font-mono text-caption tabular-nums text-mute">
                    {`Lalu: ${formatCount(active.previous.sessions)} (${formatShortDate(active.previous.date)})`}
                  </p>
                )}
                {onSelectDay === undefined ? null : (
                  <p className="mt-1 text-caption text-primary">Klik untuk lihat sesi hari ini</p>
                )}
              </div>
            </>
          )}
        </div>

        <span aria-hidden="true" />
        <div aria-hidden="true" className="relative mt-2 h-4">
          {xLabels.map((point) => (
            <span
              key={point.date.toISOString()}
              className="absolute -translate-x-1/2 font-mono text-caption text-mute first:translate-x-0 last:-translate-x-full"
              style={{ left: `${point.x}%` }}
            >
              {formatShortDate(point.date)}
            </span>
          ))}
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-caption text-mute">
        <p className="flex items-center gap-2">
          <span aria-hidden="true" className="size-2 rounded-xs bg-danger-solid" />
          {spikeCount === 0
            ? "Tidak ada hari dengan lonjakan sesi bermasalah."
            : `${spikeCount} hari dengan lonjakan sesi bermasalah (di atas ${formatPercent(SPIKE_RATE * 100)} dari total sesi hari itu).`}
        </p>
        {hasPrevious ? (
          <p className="flex items-center gap-2">
            <span aria-hidden="true" className="h-0 w-4 border-t-[1.5px] border-dashed border-stone" />
            Periode lalu
          </p>
        ) : null}
      </div>
    </div>
  );
}

export { SessionsChart };
