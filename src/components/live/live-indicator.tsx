import { cn } from "@/lib/utils";
import type { LiveConnection } from "@/state/live-context";

type LiveIndicatorProps = {
  connection: LiveConnection;
  isPaused: boolean;
  className?: string;
};

// Penanda keadaan siaran: titik berdenyut hanya saat benar-benar menerima pembaruan
function LiveIndicator({ connection, isPaused, className }: LiveIndicatorProps) {
  const state = connection === "terputus" ? "terputus" : isPaused ? "dijeda" : "live";
  const label = state === "live" ? "LIVE" : state === "dijeda" ? "DIJEDA" : "TERPUTUS";
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-xs border px-1.5 py-0.5 font-mono text-label tracking-[0.06em]",
        state === "live" && "border-danger-text/40 bg-danger-bg text-danger-text",
        state === "dijeda" && "border-hairline bg-surface-soft text-charcoal",
        state === "terputus" && "border-warning-text/40 bg-warning-bg text-warning-text",
        className,
      )}
    >
      <span
        aria-hidden="true"
        className={cn(
          "size-1.5 rounded-xs",
          state === "live" && "animate-pulse-dot bg-danger-solid",
          state === "dijeda" && "bg-stone",
          state === "terputus" && "bg-warning-solid",
        )}
      />
      {label}
    </span>
  );
}

export { LiveIndicator };
