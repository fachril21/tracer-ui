import { cn } from "@/lib/utils";

type TraceNode = { time: string; label: string; tone: "plain" | "warning" | "danger" | "primary" };

const NODES: TraceNode[] = [
  { time: "00:00", label: "sesi dimulai /", tone: "primary" },
  { time: "00:04", label: "gulir 38%", tone: "plain" },
  { time: "00:09", label: "klik .btn-checkout", tone: "plain" },
  { time: "00:11", label: "rage click ×5", tone: "warning" },
  { time: "00:12", label: "TypeError: cart is undefined", tone: "danger" },
  { time: "00:20", label: "pengunjung pergi", tone: "plain" },
];

const NODE_TONE: Record<TraceNode["tone"], string> = {
  plain: "bg-canvas border-border-control",
  primary: "bg-primary border-primary",
  warning: "bg-warning-bg border-warning-text",
  danger: "bg-danger-bg border-danger-text",
};

const STAGGER_MS = 220;

// Garis jejak yang muncul bertahap: satu sesi bermasalah dari awal sampai pengunjung pergi. Murni dekoratif.
function TraceStage() {
  return (
    <div aria-hidden="true" className="bg-stage-grid relative flex h-full flex-col justify-between p-10 xl:p-14">
      <p className="font-mono text-label uppercase tracking-[0.06em] text-stone">Jejak sesi · contoh</p>

      <ol className="relative ml-1 flex flex-col gap-7">
        <span className="absolute bottom-2 left-[5px] top-2 w-px bg-border-control" />
        {NODES.map((node, index) => (
          <li
            key={node.time}
            style={{ animationDelay: `${index * STAGGER_MS}ms` }}
            className="relative flex animate-[fade-in_var(--motion-panel)_var(--ease-out)_both] items-center gap-5"
          >
            <span className={cn("relative z-10 size-[11px] shrink-0 border", NODE_TONE[node.tone])} />
            <span className="font-mono text-caption text-stone">{node.time}</span>
            <span
              className={cn(
                "font-mono text-body",
                node.tone === "danger" ? "text-danger-text" : node.tone === "warning" ? "text-warning-text" : "text-charcoal",
              )}
            >
              {node.label}
            </span>
          </li>
        ))}
      </ol>

      <p className="max-w-xs text-heading-md font-semibold text-ink">
        Lihat apa yang sebenarnya dialami pengunjung, bukan hanya angkanya.
      </p>
    </div>
  );
}

export { TraceStage };
