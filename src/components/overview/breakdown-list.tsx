import { formatCount } from "@/lib/format";
import { cn } from "@/lib/utils";

type BreakdownTone = "primary" | "warning" | "danger" | "charcoal";

const BAR_CLASS: Record<BreakdownTone, string> = {
  primary: "bg-primary",
  warning: "bg-warning-solid",
  danger: "bg-danger-solid",
  charcoal: "bg-charcoal",
};

type BreakdownRow = {
  // Nilai yang dikirim ke onSelect, bisa berbeda dari label
  id: string;
  label: string;
  // Nilai tampil, bisa berupa jumlah atau persen
  value: string;
  // Lebar batang 0 sampai 100
  share: number;
  tone: BreakdownTone;
};

type BreakdownListProps = {
  rows: BreakdownRow[];
  // Bila diberikan, tiap baris menjadi tombol penyaring
  onSelect?: (id: string) => void;
  selectedId?: string;
  // Dipakai untuk menyebut aksi pada pembaca layar: "Saring berdasarkan Perangkat"
  selectLabel?: string;
};

function RowBody({ row }: { row: BreakdownRow }) {
  return (
    <>
      <span className="flex items-baseline justify-between gap-3 text-body">
        <span className="truncate text-charcoal">{row.label}</span>
        <span className="font-mono text-caption tabular-nums text-ink">{row.value}</span>
      </span>
      <span role="presentation" className="block h-1.5 overflow-hidden rounded-xs bg-surface-active">
        <span
          className={cn("block h-full rounded-xs", BAR_CLASS[row.tone])}
          style={{ width: `${row.share}%` }}
        />
      </span>
    </>
  );
}

function BreakdownList({ rows, onSelect, selectedId, selectLabel }: BreakdownListProps) {
  const hasSelection = selectedId !== undefined;
  return (
    <ul className="flex flex-col gap-1">
      {rows.map((row) => {
        const isSelected = row.id === selectedId;
        const isDimmed = hasSelection && !isSelected;
        return (
          <li key={row.id}>
            {onSelect === undefined ? (
              <div className="flex flex-col gap-1.5 px-2 py-1">
                <RowBody row={row} />
              </div>
            ) : (
              <button
                type="button"
                aria-pressed={isSelected}
                aria-label={`${selectLabel ?? "Saring"}: ${row.label}, ${row.value}`}
                onClick={() => onSelect(row.id)}
                className={cn(
                  "flex w-full flex-col gap-1.5 rounded-md px-2 py-1 text-left transition-[background-color,opacity] duration-[var(--motion-fast)] hover:bg-surface-hover",
                  isSelected && "bg-primary-soft",
                  isDimmed && "opacity-55 hover:opacity-100",
                )}
              >
                <RowBody row={row} />
              </button>
            )}
          </li>
        );
      })}
    </ul>
  );
}

function countRows(items: { id: string; label: string; count: number; tone: BreakdownTone }[]): BreakdownRow[] {
  const total = Math.max(
    items.reduce((sum, item) => sum + item.count, 0),
    1,
  );
  return items.map((item) => ({
    id: item.id,
    label: item.label,
    value: formatCount(item.count),
    share: (item.count / total) * 100,
    tone: item.tone,
  }));
}

export { BreakdownList, countRows };
export type { BreakdownRow };
