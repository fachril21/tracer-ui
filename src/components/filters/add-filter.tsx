import { useState } from "react";
import { ArrowLeft, ChevronRight, ListFilter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { DIMENSIONS, FILTER_KEYS } from "@/mock/dimensions";
import type { DashboardFilters, FilterKey } from "@/mock/types";
import { cn } from "@/lib/utils";

const ROW_CLASS =
  "flex min-h-8 w-full items-center justify-between gap-3 rounded-md px-2 py-1.5 text-left text-body text-ink transition-colors duration-[var(--motion-fast)] hover:bg-surface-hover";

type AddFilterProps = {
  filters: DashboardFilters;
  onSelect: (key: FilterKey, value: string) => void;
};

// Dua langkah dalam satu popover: pilih dimensi, lalu pilih nilainya
function AddFilter({ filters, onSelect }: AddFilterProps) {
  const [isOpen, setOpen] = useState(false);
  const [pendingKey, setPendingKey] = useState<FilterKey | null>(null);

  const handleOpenChange = (next: boolean) => {
    setOpen(next);
    if (!next) setPendingKey(null);
  };

  const dimension = pendingKey === null ? null : DIMENSIONS[pendingKey];

  return (
    <Popover open={isOpen} onOpenChange={handleOpenChange}>
      <PopoverTrigger asChild>
        <Button variant="secondary" size="sm" className="rounded-full">
          <ListFilter aria-hidden="true" />
          Tambah filter
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-60 p-1">
        {pendingKey === null || dimension === null ? (
          <ul aria-label="Dimensi filter" className="flex flex-col">
            {FILTER_KEYS.map((key) => (
              <li key={key}>
                <button type="button" className={ROW_CLASS} onClick={() => setPendingKey(key)}>
                  <span>{DIMENSIONS[key].label}</span>
                  <span className="flex items-center gap-1 text-caption text-mute">
                    {filters[key] === undefined ? null : "aktif"}
                    <ChevronRight className="size-4" aria-hidden="true" />
                  </span>
                </button>
              </li>
            ))}
          </ul>
        ) : (
          <div className="flex flex-col">
            <button
              type="button"
              className={cn(ROW_CLASS, "justify-start font-semibold")}
              onClick={() => setPendingKey(null)}
            >
              <ArrowLeft className="size-4" aria-hidden="true" />
              {dimension.label}
            </button>
            <ul aria-label={`Nilai ${dimension.label}`} className="flex max-h-64 flex-col overflow-y-auto">
              {dimension.options.map((option) => (
                <li key={option.value}>
                  <button
                    type="button"
                    aria-pressed={filters[pendingKey] === option.value}
                    className={cn(ROW_CLASS, filters[pendingKey] === option.value && "bg-primary-soft")}
                    onClick={() => {
                      onSelect(pendingKey, option.value);
                      handleOpenChange(false);
                    }}
                  >
                    <span className="truncate font-mono text-mono">{option.label}</span>
                    <span className="font-mono text-caption tabular-nums text-mute">{`${option.share}%`}</span>
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}
      </PopoverContent>
    </Popover>
  );
}

export { AddFilter };
