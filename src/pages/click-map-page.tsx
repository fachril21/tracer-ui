import { useMemo, useState } from "react";
import { HeatCanvas } from "@/components/maps/heat-canvas";
import { MapStage } from "@/components/maps/map-stage";
import { HeatLegend, QualityPanel, QualityStrip } from "@/components/maps/map-parts";
import { MapToolbar } from "@/components/maps/map-toolbar";
import { Panel } from "@/components/ui/panel";
import { Segmented } from "@/components/ui/segmented";
import { useDashboardQuery } from "@/hooks/use-dashboard-query";
import { formatCount } from "@/lib/format";
import { cn } from "@/lib/utils";
import { buildClickMap } from "@/mock/maps";
import type { ClickElement, ClickKind } from "@/mock/maps";
import { isDeviceKind } from "@/mock/page-model";
import { useActiveProject } from "@/state/use-active-project";

type Layer = "semua" | ClickKind;

const LAYER_OPTIONS: { value: Layer; label: string }[] = [
  { value: "semua", label: "Semua klik" },
  { value: "rage", label: "Rage click" },
  { value: "dead", label: "Dead click" },
];

const ELEMENT_LIMIT = 8;

function ElementRow({
  rank,
  element,
  maxClicks,
  isPinned,
  onPin,
  onHover,
}: {
  rank: number;
  element: ClickElement;
  maxClicks: number;
  isPinned: boolean;
  onPin: () => void;
  onHover: (id: string | null) => void;
}) {
  return (
    <li>
      <button
        type="button"
        aria-pressed={isPinned}
        onClick={onPin}
        onMouseEnter={() => onHover(element.id)}
        onMouseLeave={() => onHover(null)}
        onFocus={() => onHover(element.id)}
        onBlur={() => onHover(null)}
        className={cn(
          "flex w-full flex-col gap-1.5 rounded-md px-2 py-2 text-left transition-colors duration-[var(--motion-fast)] hover:bg-surface-hover",
          isPinned && "bg-primary-soft",
        )}
      >
        <span className="flex items-baseline gap-2">
          <span className="w-4 font-mono text-caption tabular-nums text-mute">{rank}</span>
          <span className="min-w-0 flex-1 truncate text-body text-ink">{element.label}</span>
          <span className="font-mono text-caption tabular-nums text-ink">{formatCount(element.clicks)}</span>
        </span>
        <span className="flex items-center gap-2 pl-6">
          <span className="h-1.5 flex-1 overflow-hidden rounded-xs bg-surface-active" role="presentation">
            <span
              className="block h-full rounded-xs bg-charcoal"
              style={{ width: `${(element.clicks / maxClicks) * 100}%` }}
            />
          </span>
          <span className="w-10 text-right font-mono text-caption tabular-nums text-mute">{`${element.share}%`}</span>
        </span>
        <span className="flex flex-wrap items-center gap-x-3 pl-6 font-mono text-caption text-mute">
          <span className="truncate">{element.selector}</span>
          {element.rage > 0 ? <span className="text-warning-text">{`${formatCount(element.rage)} rage`}</span> : null}
          {element.dead > 0 ? <span className="text-warning-text">{`${formatCount(element.dead)} dead`}</span> : null}
        </span>
      </button>
    </li>
  );
}

function ClickMapPage() {
  const { project } = useActiveProject();
  if (project === null) return null;
  return <ClickMapBody key={project.id} projectId={project.id} />;
}

function ClickMapBody({ projectId }: { projectId: string }) {
  const api = useDashboardQuery();
  const [layer, setLayer] = useState<Layer>("semua");
  const [pinnedId, setPinnedId] = useState<string | null>(null);
  const [hoverId, setHoverId] = useState<string | null>(null);

  const path = api.query.filters.page ?? "/";
  const device = isDeviceKind(api.query.filters.device) ? api.query.filters.device : "Desktop";
  const days = api.query.period.days;

  const data = useMemo(() => buildClickMap(projectId, path, device, days), [projectId, path, device, days]);
  const points = useMemo(
    () => (layer === "semua" ? data.points : data.points.filter((point) => point.kind === layer)),
    [data.points, layer],
  );
  const highlightId = hoverId ?? pinnedId;
  const highlighted = data.elements.find((element) => element.id === highlightId) ?? null;
  const topElements = data.elements.slice(0, ELEMENT_LIMIT);
  const maxClicks = Math.max(topElements[0]?.clicks ?? 1, 1);
  const isSubset = layer !== "semua";

  return (
    <div className="flex flex-col gap-4">
      <header className="flex flex-col gap-1">
        <h1 className="text-page-title font-semibold text-ink">Peta Klik</h1>
        <p className="text-caption text-mute">Titik terang menandai tempat pengunjung paling sering mengklik.</p>
      </header>

      <MapToolbar api={api} path={path} device={device} />

      <QualityStrip
        quality={data.quality}
        summary={`${formatCount(data.quality.sessions)} sesi · ${formatCount(data.totalClicks)} klik · ${formatCount(data.rageTotal)} rage · ${formatCount(data.deadTotal)} dead`}
      />

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[minmax(0,1fr)_22rem] lg:items-start">
        <div className="flex flex-col gap-3">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <Segmented label="Lapisan" value={layer} options={LAYER_OPTIONS} onChange={setLayer} />
            <HeatLegend lowLabel="Sedikit" highLabel="Banyak" />
          </div>

          <MapStage
            device={device}
            label={`Peta klik halaman ${path} di ${device}. Elemen paling banyak diklik: ${topElements
              .slice(0, 3)
              .map((element) => element.label)
              .join(", ")}.`}
          >
            <HeatCanvas
              points={points}
              radiusRatio={isSubset ? 0.03 : 0.045}
              pointAlpha={isSubset ? 0.5 : 0.18}
            />
            {highlighted === null ? null : (
              <div
                aria-hidden="true"
                className="pointer-events-none absolute rounded-xs border-2 border-primary bg-primary/10"
                style={{
                  left: `${highlighted.box.x * 100}%`,
                  top: `${highlighted.box.y * 100}%`,
                  width: `${highlighted.box.w * 100}%`,
                  height: `${highlighted.box.h * 100}%`,
                }}
              >
                <span className="absolute -top-5 left-0 whitespace-nowrap rounded-xs bg-primary px-1.5 py-0.5 font-mono text-label text-on-primary">
                  {highlighted.label}
                </span>
              </div>
            )}
          </MapStage>
          {points.length === 0 ? (
            <p className="text-caption text-mute">Tidak ada titik untuk lapisan ini pada halaman dan rentang yang dipilih.</p>
          ) : null}
        </div>

        <div className="flex flex-col gap-4">
          <QualityPanel quality={data.quality} />
          <Panel title="Elemen paling banyak diklik" meta={`${topElements.length} teratas`}>
            <ol aria-label="Elemen paling banyak diklik" className="-mx-2 flex flex-col">
              {topElements.map((element, index) => (
                <ElementRow
                  key={element.id}
                  rank={index + 1}
                  element={element}
                  maxClicks={maxClicks}
                  isPinned={pinnedId === element.id}
                  onPin={() => setPinnedId((current) => (current === element.id ? null : element.id))}
                  onHover={setHoverId}
                />
              ))}
            </ol>
          </Panel>
        </div>
      </div>
    </div>
  );
}

export { ClickMapPage };
