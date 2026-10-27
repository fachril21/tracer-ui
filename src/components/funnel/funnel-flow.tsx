import { formatCount, formatPercent } from "@/lib/format";
import { stepLabel } from "@/mock/funnels";
import type { FunnelResult } from "@/mock/funnels";
import { cn } from "@/lib/utils";

type FlowSeries = { name: string; result: FunnelResult };

const VIEW_W = 1000;
const VIEW_H = 200;
const MID = VIEW_H / 2;
const MAX_HALF = 62;
const MIN_HALF = 2;
const INSET = 8; // persen sisi kiri dan kanan agar pil di tepi tidak terpotong

function xAt(index: number, total: number): number {
  const span = 100 - INSET * 2;
  return total <= 1 ? 50 : INSET + (index / (total - 1)) * span;
}

function halfAt(rate: number, count: number): number {
  return Math.max(count > 0 ? MIN_HALF : 0, (rate / 100) * MAX_HALF);
}

// Satu segmen pita antara dua langkah, ujungnya melengkung mulus (kontrol horizontal di titik tengah)
function segmentPath(x0: number, h0: number, x1: number, h1: number, scale: number): string {
  const a = (x0 / 100) * VIEW_W;
  const b = (x1 / 100) * VIEW_W;
  const mx = (a + b) / 2;
  const t0 = MID - h0 * scale;
  const t1 = MID - h1 * scale;
  const b0 = MID + h0 * scale;
  const b1 = MID + h1 * scale;
  return `M${a},${t0} C${mx},${t0} ${mx},${t1} ${b},${t1} L${b},${b1} C${mx},${b1} ${mx},${b0} ${a},${b0} Z`;
}

const SERIES_FILL = ["fill-primary", "fill-charcoal"] as const;

type FunnelFlowProps = { series: FlowSeries[] };

// Pita alir: lebar mengikuti jumlah sesi di tiap langkah, pil di atas dan bawah garis pembagi
function FunnelFlow({ series }: FunnelFlowProps) {
  const primary = series[0]?.result;
  if (primary === undefined || primary.steps.length < 2) return null;
  const total = primary.steps.length;
  const isCompare = series.length > 1;

  const summary = primary.steps
    .map((step) => `${stepLabel(step.step)} ${formatCount(step.count)} sesi`)
    .join(", ");

  return (
    <figure className="m-0 flex flex-col gap-2">
      <div className="relative h-52 sm:h-60">
        <svg
          viewBox={`0 0 ${VIEW_W} ${VIEW_H}`}
          preserveAspectRatio="none"
          role="img"
          aria-label={`Alur funnel: ${summary}`}
          className="absolute inset-0 size-full animate-[funnel-reveal_var(--motion-deliberate)_var(--ease-out)_both] overflow-visible"
        >
          <line x1="0" x2={VIEW_W} y1={MID} y2={MID} className="stroke-hairline" strokeDasharray="2 6" vectorEffect="non-scaling-stroke" />
          {series.map((item, seriesIndex) =>
            item.result.steps.slice(1).map((step, i) => {
              const prev = item.result.steps[i];
              if (prev === undefined) return null;
              const isBiggest = !isCompare && item.result.biggestDropIndex === i + 1;
              const x0 = xAt(i, total);
              const x1 = xAt(i + 1, total);
              const h0 = halfAt(prev.rateFromStart, prev.count);
              const h1 = halfAt(step.rateFromStart, step.count);
              const fill = isBiggest ? "fill-warning-solid" : (SERIES_FILL[seriesIndex] ?? "fill-primary");
              return (
                <g key={`${item.name}-${step.step.id}`}>
                  <path d={segmentPath(x0, h0, x1, h1, 1)} className={fill} fillOpacity={isCompare ? 0.4 : 0.28} />
                  <path d={segmentPath(x0, h0, x1, h1, 0.62)} className={fill} fillOpacity={isCompare ? 0.5 : 0.5} />
                  <path d={segmentPath(x0, h0, x1, h1, 0.26)} className={fill} fillOpacity={0.9} />
                </g>
              );
            }),
          )}
        </svg>

        {primary.steps.map((step, index) => {
          const left = `${xAt(index, total)}%`;
          const isBiggest = primary.biggestDropIndex === index;
          return (
            <div key={step.step.id} aria-hidden="true">
              <span className="absolute inset-y-0 w-px bg-border-control" style={{ left }} />
              <span
                className="absolute top-0 -translate-x-1/2 border border-hairline bg-canvas px-1.5 py-0.5 font-mono text-caption tabular-nums text-ink"
                style={{ left }}
              >
                {formatCount(step.count)}
              </span>
              <span
                className={cn(
                  "absolute bottom-0 -translate-x-1/2 border px-1.5 py-0.5 font-mono text-caption tabular-nums",
                  isBiggest ? "border-warning-solid bg-warning-bg text-warning-text" : "border-hairline bg-canvas text-mute",
                )}
                style={{ left }}
              >
                {formatPercent(Math.round(step.rateFromStart * 10) / 10)}
              </span>
            </div>
          );
        })}
      </div>

      {isCompare ? (
        <figcaption className="flex flex-wrap gap-x-4 gap-y-1 text-caption text-mute">
          {series.map((item, index) => (
            <span key={item.name} className="inline-flex items-center gap-1.5">
              <span aria-hidden="true" className={cn("size-2.5", index === 0 ? "bg-primary" : "bg-charcoal")} />
              {item.name}
            </span>
          ))}
          <span>Angka di atas pita untuk {series[0]?.name}.</span>
        </figcaption>
      ) : null}
    </figure>
  );
}

export { FunnelFlow };
export type { FlowSeries };
