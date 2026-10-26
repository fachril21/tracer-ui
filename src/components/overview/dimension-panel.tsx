import { useState } from "react";
import { BreakdownList } from "@/components/overview/breakdown-list";
import { Panel } from "@/components/ui/panel";
import { Segmented } from "@/components/ui/segmented";
import { DIMENSIONS } from "@/mock/dimensions";
import type { DashboardFilters, FilterKey } from "@/mock/types";

type DimensionTab = Exclude<FilterKey, "signal" | "page">;

const TABS: { value: DimensionTab; label: string }[] = [
  { value: "device", label: "Perangkat" },
  { value: "source", label: "Sumber" },
  { value: "browser", label: "Browser" },
  { value: "country", label: "Negara" },
];

type DimensionPanelProps = {
  filters: DashboardFilters;
  onToggle: (key: FilterKey, value: string) => void;
};

// Persentase menunjukkan porsi seluruh trafik. Klik satu baris untuk menyaring seluruh dashboard.
function DimensionPanel({ filters, onToggle }: DimensionPanelProps) {
  const [tab, setTab] = useState<DimensionTab>("device");
  const dimension = DIMENSIONS[tab];

  return (
    <Panel title="Dimensi trafik" meta="klik untuk menyaring">
      <div className="flex flex-col gap-3">
        <Segmented label="Dimensi" value={tab} options={TABS} onChange={setTab} />
        <BreakdownList
          rows={dimension.options.map((option) => ({
            id: option.value,
            label: option.label,
            value: `${option.share}%`,
            share: option.share,
            tone: "charcoal" as const,
          }))}
          selectedId={filters[tab]}
          selectLabel={`Saring berdasarkan ${dimension.label}`}
          onSelect={(value) => onToggle(tab, value)}
        />
      </div>
    </Panel>
  );
}

export { DimensionPanel };
