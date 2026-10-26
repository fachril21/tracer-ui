import { ArrowDown, ArrowRight, ArrowUp, Minus } from "lucide-react";
import { Link } from "react-router";
import { formatCount, formatDuration, formatPercent } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { OverviewMetric } from "@/mock/types";

function formatValue(metric: OverviewMetric): string {
  if (metric.unit === "durasi") return formatDuration(metric.value);
  if (metric.unit === "persen") return formatPercent(metric.value);
  return formatCount(metric.value);
}

type Tone = "good" | "bad" | "neutral";

// Warna delta hanya dipakai bila baik atau buruknya jelas, sisanya netral
function toneOf(delta: number, metric: OverviewMetric): Tone {
  if (delta === 0 || metric.goodDirection === "neutral") return "neutral";
  const isUp = delta > 0;
  return (isUp && metric.goodDirection === "up") || (!isUp && metric.goodDirection === "down")
    ? "good"
    : "bad";
}

const TONE_CLASS: Record<Tone, string> = {
  good: "text-success-text",
  bad: "text-danger-text",
  neutral: "text-mute",
};

function Delta({ metric, periodLabel }: { metric: OverviewMetric; periodLabel: string }) {
  const delta = metric.deltaPercent;
  if (delta === null) {
    return <p className="text-caption text-mute">Tanpa pembanding</p>;
  }
  const tone = toneOf(delta, metric);
  const magnitude = formatPercent(Math.abs(delta));
  const Icon = delta === 0 ? Minus : delta > 0 ? ArrowUp : ArrowDown;
  const spoken = delta === 0 ? "tidak berubah" : `${delta > 0 ? "naik" : "turun"} ${magnitude}`;

  return (
    <p className={cn("flex items-center gap-1 text-caption", TONE_CLASS[tone])}>
      <Icon className="size-3.5 shrink-0" aria-hidden="true" />
      <span aria-hidden="true" className="font-mono tabular-nums">
        {magnitude}
      </span>
      <span className="sr-only">{`${spoken} dibanding ${periodLabel} sebelumnya`}</span>
      <span aria-hidden="true" className="text-mute">
        vs {periodLabel} lalu
      </span>
    </p>
  );
}

type StatCardProps = {
  metric: OverviewMetric;
  periodLabel: string;
  // Bila diberikan, kartu menjadi tautan ke daftar sesi yang mendasari angka ini
  href?: string;
};

function StatCard({ metric, periodLabel, href }: StatCardProps) {
  const content = (
    <>
      <span className="flex items-center justify-between gap-2 text-caption text-mute">
        {metric.label}
        {href === undefined ? null : (
          <ArrowRight
            className="size-3.5 -translate-x-1 text-stone opacity-0 transition-[opacity,transform] duration-[var(--motion-fast)] group-hover:translate-x-0 group-hover:opacity-100 group-focus-visible:translate-x-0 group-focus-visible:opacity-100"
            aria-hidden="true"
          />
        )}
      </span>
      <span className="font-mono text-stat font-medium tabular-nums text-ink">{formatValue(metric)}</span>
      <Delta metric={metric} periodLabel={periodLabel} />
    </>
  );
  const base = "flex flex-col gap-2 rounded-lg border border-hairline bg-canvas p-5";

  if (href === undefined) return <div className={base}>{content}</div>;
  return (
    <Link
      to={href}
      aria-label={`${metric.label}: ${formatValue(metric)}. Buka sesi yang mendasarinya`}
      className={cn(
        base,
        "group transition-colors duration-[var(--motion-fast)] hover:border-border-control hover:bg-surface-hover",
      )}
    >
      {content}
    </Link>
  );
}

export { StatCard };
