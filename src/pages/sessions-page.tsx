import { useMemo, useState } from "react";
import { TriangleAlert } from "lucide-react";
import { FilterBar } from "@/components/filters/filter-bar";
import { AttentionSessions } from "@/components/overview/attention-sessions";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { Segmented } from "@/components/ui/segmented";
import type { SegmentedOption } from "@/components/ui/segmented";
import { useDashboardQuery } from "@/hooks/use-dashboard-query";
import { describePeriod } from "@/lib/dashboard-query";
import { formatCount } from "@/lib/format";
import { cn } from "@/lib/utils";
import { buildSessionPool, filterSessions } from "@/mock/sessions";
import { useActiveProject } from "@/state/use-active-project";

type SortMode = "terbaru" | "skor";

const SORT_OPTIONS: SegmentedOption<SortMode>[] = [
  { value: "terbaru", label: "Terbaru" },
  { value: "skor", label: "Skor masalah", term: "skorMasalah" },
];

const PAGE_SIZE = 12;

function SessionsPage() {
  const { project } = useActiveProject();
  if (project === null) return null;
  return <SessionsBody key={project.id} projectId={project.id} />;
}

function SessionsBody({ projectId }: { projectId: string }) {
  const api = useDashboardQuery();
  const { query, hasFilters } = api;
  const [sort, setSort] = useState<SortMode>("terbaru");
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const [now] = useState(() => new Date());

  const matches = useMemo(() => {
    const filtered = filterSessions(buildSessionPool(projectId, now), query);
    return sort === "skor" ? [...filtered].sort((a, b) => b.problemScore - a.problemScore) : filtered;
  }, [projectId, now, query, sort]);

  const shown = matches.slice(0, visibleCount);
  const hasNarrowing = hasFilters || query.onlyProblems;

  return (
    <div className="flex flex-col gap-4">
      <header className="flex flex-col gap-1">
        <h1 className="text-page-title font-semibold text-ink">Histori Sesi</h1>
        <p className="text-caption text-mute">
          <span className="font-mono tabular-nums">{formatCount(matches.length)}</span>
          {` sesi cocok · ${describePeriod(query.period)}`}
        </p>
        <p className="text-caption text-stone">
          Data demo: daftar ini memuat sampel sesi tiruan, jumlahnya tidak sama dengan angka di Ikhtisar.
        </p>
      </header>

      <FilterBar projectId={projectId} api={api} />

      <div className="flex flex-wrap items-center gap-2">
        <Button
          variant="secondary"
          size="sm"
          className={cn("rounded-full", query.onlyProblems && "border-primary bg-primary-soft text-primary-pressed")}
          aria-pressed={query.onlyProblems}
          onClick={() => api.setOnlyProblems(!query.onlyProblems)}
        >
          <TriangleAlert aria-hidden="true" />
          Hanya sesi bermasalah
        </Button>
        <Segmented label="Urutkan" value={sort} options={SORT_OPTIONS} onChange={setSort} />
      </div>

      {matches.length === 0 ? (
        <section aria-label="Tidak ada sesi" className="rounded-lg border border-hairline bg-canvas">
          <EmptyState
            title="Tidak ada sesi yang cocok"
            description={
              hasNarrowing
                ? "Tidak ada sesi dengan kombinasi filter dan rentang ini. Hapus satu filter atau perluas rentang."
                : "Belum ada sesi pada rentang ini."
            }
            action={
              hasNarrowing ? (
                <Button
                  variant="secondary"
                  onClick={() => {
                    api.clearFilters();
                    api.setOnlyProblems(false);
                  }}
                >
                  Hapus semua filter
                </Button>
              ) : (
                <Button variant="secondary" onClick={() => api.setPreset("90")}>
                  Lihat 90 hari
                </Button>
              )
            }
          />
        </section>
      ) : (
        <section aria-label="Daftar sesi" className="rounded-lg border border-hairline bg-canvas p-3">
          <AttentionSessions sessions={shown} projectId={projectId} now={now} />
          <div className="flex items-center justify-between gap-3 px-3 pt-3">
            <p className="font-mono text-caption tabular-nums text-mute">
              {`${formatCount(shown.length)} dari ${formatCount(matches.length)}`}
            </p>
            {shown.length < matches.length ? (
              <Button variant="secondary" size="sm" onClick={() => setVisibleCount((count) => count + PAGE_SIZE)}>
                Muat lebih banyak
              </Button>
            ) : null}
          </div>
        </section>
      )}
    </div>
  );
}

export { SessionsPage };
