import { ArrowRight, X } from "lucide-react";
import { Link } from "react-router";
import { AddFilter } from "@/components/filters/add-filter";
import { PeriodControl } from "@/components/filters/period-control";
import { SegmentsMenu } from "@/components/filters/segments-menu";
import { Button, buttonVariants } from "@/components/ui/button";
import type { DashboardQueryApi } from "@/hooks/use-dashboard-query";
import { activeFilters } from "@/lib/dashboard-query";
import { cn } from "@/lib/utils";

type FilterBarProps = {
  projectId: string;
  api: DashboardQueryApi;
  // Tautan ke daftar sesi dengan filter yang sama, hanya ditampilkan bila diberikan
  sessionsHref?: string;
  // Pembanding periode hanya bermakna di Ikhtisar
  canCompare?: boolean;
};

function FilterChip({
  keyLabel,
  valueLabel,
  onRemove,
}: {
  keyLabel: string;
  valueLabel: string;
  onRemove: () => void;
}) {
  return (
    <li className="inline-flex h-7 animate-[pop-in_var(--motion-base)_var(--ease-out)] items-center gap-1.5 rounded-full bg-primary-soft pl-3 pr-1 text-caption text-primary-pressed">
      <span className="text-mute">{keyLabel}</span>
      <span className="font-mono font-medium">{valueLabel}</span>
      <button
        type="button"
        aria-label={`Hapus filter ${keyLabel}: ${valueLabel}`}
        onClick={onRemove}
        className="grid size-5 place-items-center rounded-full transition-colors duration-[var(--motion-fast)] hover:bg-primary/15"
      >
        <X className="size-3.5" aria-hidden="true" />
      </button>
    </li>
  );
}

function FilterBar({ projectId, api, sessionsHref, canCompare = false }: FilterBarProps) {
  const { query, hasFilters } = api;
  const chips = activeFilters(query.filters);

  return (
    <section aria-label="Filter dan rentang" className="flex flex-col gap-3">
      <PeriodControl
        query={query}
        onPreset={api.setPreset}
        onCustom={api.setCustomPeriod}
        onCompare={canCompare ? api.setCompare : undefined}
      />

      <div className="flex flex-wrap items-center gap-2">
        <AddFilter filters={query.filters} onSelect={api.setFilter} />
        <SegmentsMenu projectId={projectId} currentQuery={api.queryString} onApply={api.applyQueryString} />

        {chips.length === 0 ? (
          <p className="text-caption text-mute">Belum ada filter. Klik baris di panel mana pun untuk menyaring.</p>
        ) : (
          <>
            <ul aria-label="Filter aktif" className="flex flex-wrap items-center gap-2">
              {chips.map((chip) => (
                <FilterChip
                  key={chip.key}
                  keyLabel={chip.keyLabel}
                  valueLabel={chip.valueLabel}
                  onRemove={() => api.setFilter(chip.key, null)}
                />
              ))}
            </ul>
            <Button variant="ghost" size="sm" onClick={api.clearFilters}>
              Hapus semua
            </Button>
          </>
        )}

        {sessionsHref === undefined ? null : (
          <Link
            to={sessionsHref}
            className={cn(buttonVariants({ variant: "ghost", size: "sm" }), "ml-auto text-primary")}
          >
            {hasFilters ? "Lihat sesi yang cocok" : "Lihat semua sesi"}
            <ArrowRight aria-hidden="true" />
          </Link>
        )}
      </div>
    </section>
  );
}

export { FilterBar };
