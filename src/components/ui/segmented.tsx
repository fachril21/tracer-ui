import { ToggleGroup } from "radix-ui";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { GLOSSARY } from "@/lib/glossary";
import type { GlossaryKey } from "@/lib/glossary";
import { cn } from "@/lib/utils";

type SegmentedOption<T extends string> = {
  value: T;
  label: string;
  // Penjelasan istilah, tampil saat hover atau fokus
  term?: GlossaryKey;
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
      {options.map((option) => {
        const item = (
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
        );
        if (option.term === undefined) return item;
        return (
          <Tooltip key={option.value}>
            <TooltipTrigger asChild>{item}</TooltipTrigger>
            <TooltipContent className="max-w-64 px-2.5 py-1.5 leading-snug">{GLOSSARY[option.term]}</TooltipContent>
          </Tooltip>
        );
      })}
    </ToggleGroup.Root>
  );
}

export { Segmented };
export type { SegmentedOption };
