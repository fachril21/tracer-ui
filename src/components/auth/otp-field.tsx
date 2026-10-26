import { useEffect, useId, useRef, useState } from "react";
import type { ChangeEvent, ClipboardEvent } from "react";
import { cn } from "@/lib/utils";

type OtpFieldProps = {
  length: number;
  label: string;
  value: string;
  onChange: (value: string) => void;
  // Dipanggil sekali saat digit terakhir terisi
  onComplete: (value: string) => void;
  isDisabled?: boolean;
  hasError?: boolean;
  describedBy?: string;
};

// Satu kolom input sungguhan (agar pengisian otomatis SMS dan tempel bekerja) di atas deretan kotak digit
function OtpField({ length, label, value, onChange, onComplete, isDisabled = false, hasError = false, describedBy }: OtpFieldProps) {
  const id = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const [isFocused, setFocused] = useState(false);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  // Setelah galat, kolom dikosongkan oleh pemanggil; kembalikan fokus supaya bisa langsung mengetik ulang
  useEffect(() => {
    if (!isDisabled && value === "") inputRef.current?.focus();
  }, [isDisabled, value]);

  const accept = (raw: string) => {
    const digits = raw.replace(/\D/g, "").slice(0, length);
    onChange(digits);
    if (digits.length === length) onComplete(digits);
  };

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => accept(event.target.value);

  const handlePaste = (event: ClipboardEvent<HTMLInputElement>) => {
    const text = event.clipboardData.getData("text");
    const match = text.match(/\d{6}/);
    event.preventDefault();
    accept(match === null ? text : match[0]);
  };

  const activeIndex = Math.min(value.length, length - 1);

  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className="text-caption font-medium text-charcoal">
        {label}
      </label>
      <div className="relative">
        <input
          ref={inputRef}
          id={id}
          value={value}
          onChange={handleChange}
          onPaste={handlePaste}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          disabled={isDisabled}
          inputMode="numeric"
          autoComplete="one-time-code"
          pattern="[0-9]*"
          maxLength={length}
          aria-invalid={hasError ? true : undefined}
          aria-describedby={describedBy}
          className="absolute inset-0 z-10 size-full cursor-text opacity-0"
        />
        <div aria-hidden="true" className="grid grid-cols-6 gap-2">
          {Array.from({ length }, (_, index) => {
            const digit = value[index];
            const isActive = isFocused && !isDisabled && index === activeIndex;
            return (
              <span
                key={index}
                className={cn(
                  "flex h-12 items-center justify-center rounded-md border bg-canvas font-mono text-heading-md font-semibold text-ink transition-colors duration-[var(--motion-fast)]",
                  hasError ? "border-danger-text" : isActive ? "border-primary ring-2 ring-primary/30" : "border-border-control",
                  isDisabled && "bg-surface-soft text-mute",
                )}
              >
                {digit ?? ""}
              </span>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export { OtpField };
