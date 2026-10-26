import { cn } from "@/lib/utils";
import type { MockSession } from "@/mock/types";

type TraceKind = MockSession["trace"][number]["kind"];

const NODE_CLASS: Record<TraceKind, string> = {
  page: "bg-charcoal",
  rage_click: "bg-warning-solid",
  dead_click: "bg-warning-solid",
  js_error: "bg-danger-solid",
  network_error: "bg-danger-solid",
};

// Garis jejak: simpul persegi menandai kejadian di sepanjang sesi. Dekoratif, angkanya ada di teks.
function TraceLine({ trace, className }: { trace: MockSession["trace"]; className?: string }) {
  return (
    <div aria-hidden="true" className={cn("relative h-4 px-1", className)}>
      <div className="absolute inset-x-1 top-1/2 h-px bg-border-control opacity-60" />
      <div className="relative h-full">
        {trace.map((node) => (
          <span
            key={`${node.kind}-${node.at}`}
            className={cn(
              "absolute top-1/2 size-1.5 -translate-x-1/2 -translate-y-1/2 rounded-xs",
              NODE_CLASS[node.kind],
            )}
            style={{ left: `${node.at * 100}%` }}
          />
        ))}
      </div>
    </div>
  );
}

export { TraceLine };
