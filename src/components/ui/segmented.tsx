import { ToggleGroup } from "radix-ui";
import { cn } from "@/lib/utils";

type SegmentedOption<T extends string> = {
  value: T;
  label: string;
};

type SegmentedProps<T extends string> = {
  label: string;
  value: T;
  options: SegmentedOption<T>[];
  onChange: (value: T) => void;
  className?: string;
};

// Pilihan satu-dari-banyak berbentuk chip. Memilih ulang item aktif tidak mengosongkan nilai.
function Segmented<T extends string>({ label, value, options, onChange, className }: SegmentedProps<T>) {
  return (
    <ToggleGroup.Root
      type="single"
      value={value}
      aria-label={label}
      onValueChange={(next) => {
        const match = options.find((option) => option.value === next);
        if (match !== undefined) onChange(match.value);
      }}
      className={cn("inline-flex flex-wrap gap-1", className)}
    >
      {options.map((option) => (
        <ToggleGroup.Item
          key={option.value}
          value={option.value}
          className={cn(
            "h-7 rounded-full px-3 text-caption font-medium pointer-coarse:h-10 transition-colors duration-[var(--motion-fast)]",
            "bg-surface-soft text-charcoal hover:bg-surface-hover",
            "data-[state=on]:bg-primary-soft data-[state=on]:text-primary-pressed",
          )}
        >
          {option.label}
        </ToggleGroup.Item>
      ))}
    </ToggleGroup.Root>
  );
}

export { Segmented };
export type { SegmentedOption };
