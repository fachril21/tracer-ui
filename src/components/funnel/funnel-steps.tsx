import { useState } from "react";
import { ChevronDown, TriangleAlert } from "lucide-react";
import { Link } from "react-router";
import { Istilah } from "@/components/ui/istilah";
import { StatusBadge } from "@/components/ui/status-badge";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { GLOSSARY } from "@/lib/glossary";
import { formatCount, formatDuration, formatPercent, formatRelative } from "@/lib/format";
import { cn } from "@/lib/utils";
import { droppedSessions, stepLabel } from "@/mock/funnels";
import type { Funnel, FunnelPeriod, FunnelResult } from "@/mock/funnels";

type SeriesBar = { name: string; result: FunnelResult };

type FunnelStepsProps = {
  projectId: string;
  funnel: Funnel;
  days: FunnelPeriod;
  now: Date;
  // Satu seri untuk tampilan biasa, dua untuk perbandingan perangkat
  series: SeriesBar[];
};

function DroppedList({ projectId, funnel, stepIndex, days, now }: Omit<FunnelStepsProps, "series"> & { stepIndex: number }) {
  const sessions = droppedSessions(projectId, funnel, stepIndex, days, now);
  return (
    <ul aria-label="Contoh sesi yang berhenti" className="flex flex-col border-t border-hairline">
      {sessions.map((session) => (
        <li key={session.id}>
          <Link
            to={`/p/${projectId}/sessions/${session.id}`}
            className="flex flex-wrap items-center gap-x-4 gap-y-0.5 px-3 py-2 text-caption hover:bg-surface-hover"
          >
            <span className="font-mono text-ink">{session.id}</span>
            <span className="text-mute">{session.device}</span>
            <span className="font-mono tabular-nums text-mute">{formatDuration(session.durationSeconds)}</span>
            <span className="ml-auto text-mute">{formatRelative(session.startedAt, now)}</span>
          </Link>
        </li>
      ))}
    </ul>
  );
}

function FunnelSteps({ projectId, funnel, days, now, series }: FunnelStepsProps) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const primary = series[0]?.result;
  if (primary === undefined) return null;

  return (
    <>
    <div className="flex justify-end gap-3 px-3 pb-1 text-caption text-mute">
      <span className="w-14 text-right">Sesi</span>
      <Istilah term="persenFunnel" className="w-14 text-right">
        % awal
      </Istilah>
    </div>
    <ol className="flex flex-col">
      {primary.steps.map((first, index) => {
        const isBiggest = primary.biggestDropIndex === index;
        const isOpen = openIndex === index;
        return (
          <li key={first.step.id} className="border-b border-hairline last:border-b-0">
            <div className="flex flex-col gap-2 px-3 py-3">
              <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                <span
                  aria-hidden="true"
                  className="flex size-5 shrink-0 items-center justify-center bg-ink font-mono text-caption text-paper"
                >
                  {index + 1}
                </span>
                <span className={cn("min-w-0 truncate text-body text-ink", first.step.kind === "page" && "font-mono")}>
                  {stepLabel(first.step)}
                </span>
                {first.step.kind === "event" ? (
                  <Istilah term="langkah" className="text-caption text-mute">
                    kejadian cerdas
                  </Istilah>
                ) : null}
                {isBiggest ? (
                  <Istilah term="penurunanTerbesar">
                    <StatusBadge kind="warning" icon={TriangleAlert}>
                      Penurunan terbesar
                    </StatusBadge>
                  </Istilah>
                ) : null}
              </div>

              {series.map((item) => {
                const result = item.result.steps[index];
                if (result === undefined) return null;
                return (
                  <div key={item.name} className="flex items-center gap-3">
                    {series.length > 1 ? (
                      <span className="w-16 shrink-0 text-caption text-mute">{item.name}</span>
                    ) : null}
                    <span className="h-3 flex-1 bg-surface-soft" aria-hidden="true">
                      <span
                        className={cn("block h-full", isBiggest ? "bg-warning-solid" : "bg-primary")}
                        style={{ width: `${Math.max(result.rateFromStart, result.count > 0 ? 1 : 0)}%` }}
                      />
                    </span>
                    <span className="w-14 shrink-0 text-right font-mono text-caption tabular-nums text-ink">
                      {formatCount(result.count)}
                    </span>
                    <span className="w-14 shrink-0 text-right font-mono text-caption tabular-nums text-mute">
                      {formatPercent(Math.round(result.rateFromStart * 10) / 10)}
                    </span>
                  </div>
                );
              })}

              {index > 0 && series.length === 1 ? (
                <Tooltip>
                  <TooltipTrigger asChild>
                <button
                  type="button"
                  onClick={() => setOpenIndex(isOpen ? null : index)}
                  aria-expanded={isOpen}
                  className="flex w-fit items-center gap-1 text-caption font-medium text-charcoal hover:text-ink"
                >
                  <ChevronDown
                    className={cn("size-3.5 transition-transform duration-[var(--motion-fast)]", isOpen && "rotate-180")}
                    aria-hidden="true"
                  />
                  <span className="font-mono tabular-nums">{formatCount(first.dropped)}</span> berhenti sebelum langkah ini
                </button>
                  </TooltipTrigger>
                  <TooltipContent className="max-w-64 px-2.5 py-1.5 leading-snug">{GLOSSARY.berhentiSebelum}</TooltipContent>
                </Tooltip>
              ) : null}
            </div>
            {isOpen ? (
              <DroppedList projectId={projectId} funnel={funnel} stepIndex={index} days={days} now={now} />
            ) : null}
          </li>
        );
      })}
    </ol>
    </>
  );
}

export { FunnelSteps };
export type { SeriesBar };
