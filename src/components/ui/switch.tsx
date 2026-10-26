import { Switch as SwitchPrimitive } from "radix-ui";
import { useId } from "react";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

type SwitchFieldProps = {
  label: string;
  hint?: ReactNode;
  checked: boolean;
  disabled?: boolean;
  onCheckedChange: (checked: boolean) => void;
};

// Sakelar berlabel: label dan petunjuk selalu terlihat, bukan hanya tooltip
function SwitchField({ label, hint, checked, disabled = false, onCheckedChange }: SwitchFieldProps) {
  const id = useId();
  return (
    <div className="flex items-start justify-between gap-4">
      <div className="flex min-w-0 flex-col gap-0.5">
        <label htmlFor={id} className="text-body font-medium text-ink">
          {label}
        </label>
        {hint === undefined ? null : <p className="text-caption text-mute">{hint}</p>}
      </div>
      <SwitchPrimitive.Root
        id={id}
        checked={checked}
        disabled={disabled}
        onCheckedChange={onCheckedChange}
        className={cn(
          "relative mt-0.5 h-5 w-9 shrink-0 rounded-sm border border-border-control bg-surface-active transition-colors duration-[var(--motion-fast)] disabled:opacity-50 pointer-coarse:h-6 pointer-coarse:w-11",
          "data-[state=checked]:border-primary data-[state=checked]:bg-primary",
        )}
      >
        <SwitchPrimitive.Thumb
          className={cn(
            "block size-3.5 translate-x-0.5 rounded-xs bg-ink transition-transform duration-[var(--motion-fast)] pointer-coarse:size-4.5",
            "data-[state=checked]:translate-x-[18px] data-[state=checked]:bg-on-primary pointer-coarse:data-[state=checked]:translate-x-[22px]",
          )}
        />
      </SwitchPrimitive.Root>
    </div>
  );
}

export { SwitchField };
