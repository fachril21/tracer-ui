import { Panel } from "@/components/ui/panel";
import { cn } from "@/lib/utils";
import { PAGE_POOL } from "@/mock/dimensions";
import type { LiveVisitor } from "@/mock/live";

const MAX_NODES = 18;

type PageSpreadProps = {
  visitors: LiveVisitor[];
};

// Peta halaman: satu simpul persegi per pengunjung di tiap halaman. Simpul kuning menandai pengunjung bersinyal masalah.
function PageSpread({ visitors }: PageSpreadProps) {
  const active = visitors.filter((visitor) => visitor.leavingAt === null);
  const rows = PAGE_POOL.map((path) => ({ path, here: active.filter((visitor) => visitor.path === path) }));
  const busiest = Math.max(...rows.map((row) => row.here.length), 0);

  return (
    <Panel title="Sebaran halaman" meta={`${active.length} aktif`}>
      <ul className="flex flex-col gap-3">
        {rows.map(({ path, here }) => {
          const shown = here.slice(0, MAX_NODES);
          const extra = here.length - shown.length;
          return (
            <li key={path} className="flex flex-col gap-1.5">
              <div className="flex items-baseline justify-between gap-3">
                <span className={cn("truncate font-mono text-mono", here.length === 0 ? "text-stone" : "text-ink")}>
                  {path}
                </span>
                <span
                  className={cn(
                    "font-mono text-caption tabular-nums",
                    here.length > 0 && here.length === busiest ? "font-medium text-ink" : "text-mute",
                  )}
                >
                  {here.length}
                </span>
              </div>
              <div
                role="img"
                aria-label={`${here.length} pengunjung di ${path}`}
                className="flex min-h-2 flex-wrap gap-1 border-l border-border-control pl-1.5"
              >
                {shown.map((visitor) => (
                  <span
                    key={visitor.id}
                    className={cn(
                      "size-2 rounded-xs transition-colors duration-[var(--motion-base)]",
                      visitor.signal === null ? "bg-primary" : "bg-warning-solid",
                    )}
                  />
                ))}
                {extra > 0 ? <span className="font-mono text-label leading-2 text-mute">{`+${extra}`}</span> : null}
              </div>
            </li>
          );
        })}
      </ul>
    </Panel>
  );
}

export { PageSpread };
