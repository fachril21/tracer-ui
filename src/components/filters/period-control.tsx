import { useState } from "react";
import type { FormEvent } from "react";
import { CalendarRange, GitCompareArrows } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Segmented } from "@/components/ui/segmented";
import {
  MAX_CUSTOM_DAYS,
  describePeriod,
  earliestDate,
  parseIsoDate,
  startOfDay,
  toIsoDate,
} from "@/lib/dashboard-query";
import { cn } from "@/lib/utils";
import type { DashboardQuery, PeriodPreset } from "@/mock/types";

const PRESET_OPTIONS: { value: PeriodPreset; label: string }[] = [
  { value: "7", label: "7 hari" },
  { value: "30", label: "30 hari" },
  { value: "90", label: "90 hari" },
];

const DATE_INPUT_CLASS =
  "h-8 rounded-md border border-border-control bg-canvas px-2 font-mono text-caption text-ink";

function validateRange(from: Date | null, to: Date | null, today: Date): string | null {
  if (from === null || to === null) return "Isi kedua tanggal.";
  if (from > to) return "Tanggal awal harus sebelum tanggal akhir.";
  if (to > today) return "Tanggal akhir tidak boleh di masa depan.";
  const days = Math.round((to.getTime() - from.getTime()) / 86400000) + 1;
  if (days > MAX_CUSTOM_DAYS) return `Rentang maksimal ${MAX_CUSTOM_DAYS} hari.`;
  if (from < earliestDate(today)) return "Data hanya tersedia 100 hari ke belakang.";
  return null;
}

type CustomRangeFormProps = {
  initialFrom: Date;
  initialTo: Date;
  onApply: (from: Date, to: Date) => void;
};

function CustomRangeForm({ initialFrom, initialTo, onApply }: CustomRangeFormProps) {
  const [fromText, setFromText] = useState(toIsoDate(initialFrom));
  const [toText, setToText] = useState(toIsoDate(initialTo));
  const today = startOfDay(new Date());
  const from = parseIsoDate(fromText);
  const to = parseIsoDate(toText);
  const problem = validateRange(from, to, today);

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    if (problem === null && from !== null && to !== null) onApply(from, to);
  };

  return (
    <form onSubmit={handleSubmit} className="flex w-64 flex-col gap-3">
      <div className="grid grid-cols-2 gap-2">
        <label className="flex flex-col gap-1 text-caption text-mute">
          Dari
          <input
            type="date"
            value={fromText}
            min={toIsoDate(earliestDate(today))}
            max={toIsoDate(today)}
            onChange={(event) => setFromText(event.target.value)}
            className={DATE_INPUT_CLASS}
          />
        </label>
        <label className="flex flex-col gap-1 text-caption text-mute">
          Sampai
          <input
            type="date"
            value={toText}
            min={toIsoDate(earliestDate(today))}
            max={toIsoDate(today)}
            onChange={(event) => setToText(event.target.value)}
            className={DATE_INPUT_CLASS}
          />
        </label>
      </div>
      <p role="status" className={cn("min-h-4 text-caption", problem === null ? "text-mute" : "text-danger-text")}>
        {problem ?? `Maksimal ${MAX_CUSTOM_DAYS} hari.`}
      </p>
      <Button type="submit" variant="primary" disabled={problem !== null}>
        Terapkan
      </Button>
    </form>
  );
}

type PeriodControlProps = {
  query: DashboardQuery;
  onPreset: (preset: Exclude<PeriodPreset, "custom">) => void;
  onCustom: (from: Date, to: Date) => void;
  // Tanpa ini tombol banding disembunyikan, misalnya di daftar sesi yang tidak punya pembanding
  onCompare?: (value: boolean) => void;
};

function PeriodControl({ query, onPreset, onCustom, onCompare }: PeriodControlProps) {
  const [isCustomOpen, setCustomOpen] = useState(false);
  const { period, compare } = query;
  const isCustom = period.preset === "custom";

  return (
    <div className="flex flex-wrap items-center gap-2">
      <Segmented
        label="Rentang waktu"
        value={period.preset}
        options={PRESET_OPTIONS}
        onChange={(value) => {
          if (value !== "custom") onPreset(value);
        }}
      />

      <Popover open={isCustomOpen} onOpenChange={setCustomOpen}>
        <PopoverTrigger asChild>
          <Button
            variant={isCustom ? "primary" : "secondary"}
            size="sm"
            className="rounded-full"
            aria-label={isCustom ? `Rentang kustom ${describePeriod(period)}` : "Pilih rentang kustom"}
          >
            <CalendarRange aria-hidden="true" />
            {isCustom ? describePeriod(period) : "Kustom"}
          </Button>
        </PopoverTrigger>
        <PopoverContent>
          <CustomRangeForm
            initialFrom={period.from}
            initialTo={period.to}
            onApply={(from, to) => {
              onCustom(from, to);
              setCustomOpen(false);
            }}
          />
        </PopoverContent>
      </Popover>

      {onCompare === undefined ? null : (
        <Button
          variant="secondary"
          size="sm"
          className={cn("rounded-full", compare && "border-primary bg-primary-soft text-primary-pressed")}
          aria-pressed={compare}
          onClick={() => onCompare(!compare)}
        >
          <GitCompareArrows aria-hidden="true" />
          Banding periode lalu
        </Button>
      )}
    </div>
  );
}

export { PeriodControl };
