import { RefreshCw } from "lucide-react";
import { useNavigate } from "react-router";
import { FilterBar } from "@/components/filters/filter-bar";
import { AttentionSessions } from "@/components/overview/attention-sessions";
import { BreakdownList, countRows } from "@/components/overview/breakdown-list";
import { DimensionPanel } from "@/components/overview/dimension-panel";
import { InstallationWaiting } from "@/components/overview/installation-waiting";
import {
  OverviewEmpty,
  OverviewError,
  OverviewNoMatch,
  OverviewSkeleton,
} from "@/components/overview/overview-states";
import { PopularPages } from "@/components/overview/popular-pages";
import { SessionsChart } from "@/components/overview/sessions-chart";
import { StatCard } from "@/components/overview/stat-card";
import { Button } from "@/components/ui/button";
import { Istilah } from "@/components/ui/istilah";
import { Panel } from "@/components/ui/panel";
import { useDashboardQuery } from "@/hooks/use-dashboard-query";
import type { DashboardQueryApi } from "@/hooks/use-dashboard-query";
import { useOverview } from "@/hooks/use-overview";
import { describePeriod, serializeQuery } from "@/lib/dashboard-query";
import { formatCount, formatRelative } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { OverviewData } from "@/mock/data";
import type { MockProject, OverviewMetricId } from "@/mock/types";
import { useActiveProject } from "@/state/use-active-project";

// Metrik yang punya daftar sesi di baliknya. Sisanya adalah rata-rata dan tidak bisa dibuka.
const DRILL_DOWN: Partial<Record<OverviewMetricId, { onlyProblems: boolean }>> = {
  sessions: { onlyProblems: false },
  problems: { onlyProblems: true },
  events: { onlyProblems: true },
};

function sessionsHref(projectId: string, api: DashboardQueryApi, overrides?: { onlyProblems?: boolean }): string {
  const params = serializeQuery({ ...api.query, onlyProblems: overrides?.onlyProblems ?? api.query.onlyProblems });
  const text = params.toString();
  return `/p/${projectId}/sessions${text === "" ? "" : `?${text}`}`;
}

type OverviewContentProps = {
  data: OverviewData;
  project: MockProject;
  api: DashboardQueryApi;
  now: Date;
};

function OverviewContent({ data, project, api, now }: OverviewContentProps) {
  const navigate = useNavigate();
  const { query } = api;
  const totalEvents = data.metrics.find((metric) => metric.id === "events")?.value ?? 0;
  const periodText = describePeriod(query.period);

  const openDay = (date: Date) => {
    const day = serializeQuery({
      ...query,
      period: { preset: "custom", from: date, to: date, days: 1 },
    });
    navigate(`/p/${project.id}/sessions?${day.toString()}`);
  };

  return (
    <div className="flex flex-col gap-4">
      <section
        aria-label="Ringkasan angka"
        className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-6"
      >
        {data.metrics.map((metric) => {
          const drill = DRILL_DOWN[metric.id];
          return (
            <StatCard
              key={metric.id}
              metric={metric}
              periodLabel="periode"
              href={drill === undefined ? undefined : sessionsHref(project.id, api, drill)}
            />
          );
        })}
      </section>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-12">
        <Panel title="Sesi harian" meta={periodText} className="xl:col-span-8">
          <SessionsChart series={data.series} previousSeries={data.previousSeries} onSelectDay={openDay} />
        </Panel>

        <div className="flex flex-col gap-4 xl:col-span-4">
          <Panel title="Smart events" term="smartEvents" meta={formatCount(totalEvents)}>
            <BreakdownList
              rows={countRows([
                { id: "dead_click", label: "Dead click", count: data.smartEventTotals.dead_click, tone: "warning", term: "deadClick" },
                { id: "rage_click", label: "Rage click", count: data.smartEventTotals.rage_click, tone: "warning", term: "rageClick" },
                { id: "js_error", label: "Error JS", count: data.smartEventTotals.js_error, tone: "danger", term: "errorJs" },
              ])}
              selectedId={query.filters.signal}
              selectLabel="Saring berdasarkan sinyal"
              onSelect={(id) => api.toggleFilter("signal", id)}
            />
          </Panel>
          <DimensionPanel filters={query.filters} onToggle={api.toggleFilter} />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-12">
        <Panel title="Sesi yang perlu dilihat" term="sesiPerluDilihat" meta={<Istilah term="skorMasalah">skor masalah tertinggi</Istilah>} className="xl:col-span-7">
          {data.topSessions.length === 0 ? (
            <p className="py-6 text-center text-body text-mute">
              Tidak ada sesi bermasalah pada rentang dan filter ini.
            </p>
          ) : (
            <AttentionSessions sessions={data.topSessions} projectId={project.id} now={now} />
          )}
        </Panel>
        <Panel title="Halaman populer" term="halamanPopuler" meta={periodText} className="xl:col-span-5">
          <PopularPages
            pages={data.popularPages}
            projectId={project.id}
            selectedPath={query.filters.page}
            onToggle={(path) => api.toggleFilter("page", path)}
          />
        </Panel>
      </div>
    </div>
  );
}

function OverviewPage() {
  const { project, installation } = useActiveProject();

  if (project === null) return null;
  return <OverviewBody key={project.id} project={project} installation={installation} />;
}

function OverviewBody({ project, installation }: { project: MockProject; installation: string }) {
  const api = useDashboardQuery();
  const overview = useOverview(project.id, api.query);
  const isLoading = overview.status === "loading";
  const lastSeen =
    overview.data === null ? null : formatRelative(overview.data.lastSeenAt, overview.now);

  return (
    <div className="flex flex-col gap-4">
      <header className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex flex-col gap-1">
          <h1 className="text-page-title font-semibold text-ink">Ikhtisar</h1>
          <p className="flex flex-wrap items-center gap-x-2 text-caption text-mute">
            <span className="font-mono">{project.siteUrl}</span>
            {lastSeen === null ? null : (
              <>
                <span aria-hidden="true">·</span>
                <span>Data terakhir diterima {lastSeen}</span>
              </>
            )}
            {installation === "waiting" && overview.status !== "loading" ? (
              <>
                <span aria-hidden="true">·</span>
                <span>Menunggu data pertama</span>
              </>
            ) : null}
          </p>
        </div>

        <Button
          variant="secondary"
          size="icon"
          onClick={overview.reload}
          disabled={isLoading}
          aria-label="Muat ulang data"
        >
          <RefreshCw className={cn(isLoading && "animate-spin")} aria-hidden="true" />
        </Button>
      </header>

      {installation === "waiting" ? null : (
        <FilterBar projectId={project.id} api={api} sessionsHref={sessionsHref(project.id, api)} canCompare />
      )}

      {overview.status === "loading" ? <OverviewSkeleton /> : null}
      {overview.status === "error" ? (
        <OverviewError message={overview.errorMessage} onRetry={overview.reload} />
      ) : null}
      {overview.status === "waiting" ? (
        <InstallationWaiting projectId={project.id} siteUrl={project.siteUrl} />
      ) : null}
      {overview.status === "empty" ? <OverviewEmpty onShowLonger={() => api.setPreset("90")} /> : null}
      {overview.status === "no-match" ? <OverviewNoMatch onClearFilters={api.clearFilters} /> : null}
      {overview.status === "ready" && overview.data !== null ? (
        <OverviewContent data={overview.data} project={project} api={api} now={overview.now} />
      ) : null}
    </div>
  );
}

export { OverviewPage };
