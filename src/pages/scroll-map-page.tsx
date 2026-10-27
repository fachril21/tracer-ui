import { useMemo } from "react";
import { MapStage } from "@/components/maps/map-stage";
import { HeatLegend, QualityPanel, QualityStrip } from "@/components/maps/map-parts";
import { MapToolbar } from "@/components/maps/map-toolbar";
import { Istilah } from "@/components/ui/istilah";
import { Panel } from "@/components/ui/panel";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { GLOSSARY } from "@/lib/glossary";
import type { GlossaryKey } from "@/lib/glossary";
import { useDashboardQuery } from "@/hooks/use-dashboard-query";
import { formatCount } from "@/lib/format";
import { isLightMagma, magmaCss } from "@/lib/magma";
import { BAND_COUNT, buildScrollMap } from "@/mock/maps";
import type { ScrollBand, ScrollMapData } from "@/mock/maps";
import { isDeviceKind } from "@/mock/page-model";
import { useActiveProject } from "@/state/use-active-project";

const RULER_TICKS = [0, 25, 50, 75, 100] as const;

function BandOverlay({ band }: { band: ScrollBand }) {
  const t = band.reach / 100;
  return (
    <div
      aria-hidden="true"
      className="absolute inset-x-0 flex items-center pl-2 font-mono text-caption tabular-nums"
      style={{
        top: `${band.from * 100}%`,
        height: `${(100 / BAND_COUNT)}%`,
        backgroundColor: magmaCss(t),
        opacity: 0.82,
        color: isLightMagma(t) ? "#0b0b0d" : "#ffffff",
        borderBottom: "1px solid rgb(255 255 255 / 0.25)",
      }}
    >
      {`${Math.round(band.reach)}%`}
    </div>
  );
}

function StatTile({ label, term, value, hint }: { label: string; term: GlossaryKey; value: string; hint: string }) {
  return (
    <div className="flex flex-col gap-0.5">
      <dt className="font-mono text-label uppercase tracking-[0.06em] text-stone">
        <Istilah term={term}>{label}</Istilah>
      </dt>
      <dd className="font-mono text-heading-md font-medium tabular-nums text-ink">{value}</dd>
      <dd className="text-caption text-mute">{hint}</dd>
    </div>
  );
}

function DepthMarkers({ data }: { data: ScrollMapData }) {
  return (
    <>
      <div
        className="pointer-events-none absolute inset-x-0 border-t-2 border-dashed border-ink"
        style={{ top: `${data.fold * 100}%` }}
      >
        <Tooltip>
          <TooltipTrigger asChild>
            <button
              type="button"
              className="pointer-events-auto absolute right-8 -top-5 cursor-help whitespace-nowrap rounded-xs bg-ink px-1.5 py-0.5 font-mono text-label text-paper"
            >
              Layar pertama
            </button>
          </TooltipTrigger>
          <TooltipContent className="max-w-64 px-2.5 py-1.5 leading-snug">{GLOSSARY.layarPertama}</TooltipContent>
        </Tooltip>
      </div>
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 border-t-2 border-primary"
        style={{ top: `${data.avgDepth}%` }}
      >
        <span className="absolute right-8 top-0.5 whitespace-nowrap rounded-xs bg-primary px-1.5 py-0.5 font-mono text-label text-on-primary">
          {`Rata-rata ${data.avgDepth}%`}
        </span>
      </div>
      {RULER_TICKS.map((tick) => (
        <span
          key={tick}
          aria-hidden="true"
          className="pointer-events-none absolute right-1 -translate-y-1/2 rounded-xs bg-canvas/90 px-1 font-mono text-label tabular-nums text-ink first:translate-y-0 last:-translate-y-full"
          style={{ top: `${tick}%` }}
        >
          {`${tick}%`}
        </span>
      ))}
    </>
  );
}

function ScrollMapPage() {
  const { project } = useActiveProject();
  if (project === null) return null;
  return <ScrollMapBody key={project.id} projectId={project.id} />;
}

function ScrollMapBody({ projectId }: { projectId: string }) {
  const api = useDashboardQuery();
  const path = api.query.filters.page ?? "/";
  const device = isDeviceKind(api.query.filters.device) ? api.query.filters.device : "Desktop";
  const days = api.query.period.days;
  const data = useMemo(() => buildScrollMap(projectId, path, device, days), [projectId, path, device, days]);
  const maxShare = Math.max(data.topSections[0]?.share ?? 1, 1);

  return (
    <div className="flex flex-col gap-4">
      <header className="flex flex-col gap-1">
        <h1 className="text-page-title font-semibold text-ink">Peta Gulir</h1>
        <p className="text-caption text-mute">
          Tiap pita menunjukkan persen sesi yang menggulir sampai kedalaman itu.
        </p>
      </header>

      <MapToolbar api={api} path={path} device={device} />

      <QualityStrip
        quality={data.quality}
        summary={`${formatCount(data.quality.sessions)} sesi · rata-rata sampai ${data.avgDepth}% · ${data.reachEnd}% sampai akhir`}
      />

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[minmax(0,1fr)_22rem] lg:items-start">
        <div className="flex flex-col gap-3">
          <div className="flex justify-end">
            <HeatLegend lowLabel="Sedikit yang sampai" highLabel="Banyak" />
          </div>
          <MapStage
            device={device}
            label={`Peta gulir halaman ${path} di ${device}. Rata-rata pengunjung sampai ${data.avgDepth}% halaman, ${data.reach50}% sampai setengah halaman, ${data.reachEnd}% sampai akhir.`}
          >
            {data.bands.map((band) => (
              <BandOverlay key={band.index} band={band} />
            ))}
            <DepthMarkers data={data} />
          </MapStage>

          <table className="sr-only">
            <caption>Persen sesi yang mencapai tiap pita kedalaman halaman</caption>
            <thead>
              <tr>
                <th scope="col">Kedalaman</th>
                <th scope="col">Sesi yang mencapai</th>
              </tr>
            </thead>
            <tbody>
              {data.bands.map((band) => (
                <tr key={band.index}>
                  <td>{`${Math.round(band.from * 100)} sampai ${Math.round(band.to * 100)} persen`}</td>
                  <td>{`${Math.round(band.reach)} persen`}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="flex flex-col gap-4">
          <QualityPanel quality={data.quality} />
          <Panel title="Ringkasan kedalaman">
            <dl className="grid grid-cols-1 gap-4">
              <StatTile label="Rata-rata kedalaman" term="rataKedalaman" value={`${data.avgDepth}%`} hint="Seberapa jauh pengunjung rata-rata menggulir" />
              <StatTile label="Sampai setengah" term="sampaiSetengah" value={`${data.reach50}%`} hint="Sesi yang mencapai 50% halaman" />
              <StatTile label="Sampai akhir" term="sampaiAkhir" value={`${data.reachEnd}%`} hint="Sesi yang mencapai pita terakhir" />
            </dl>
          </Panel>
          <Panel title="Bagian paling sering dilihat" term="bagianDilihat" meta="porsi waktu">
            <ol className="flex flex-col gap-3">
              {data.topSections.map((section, index) => (
                <li key={section.id} className="flex flex-col gap-1.5">
                  <span className="flex items-baseline gap-2">
                    <span className="w-4 font-mono text-caption tabular-nums text-mute">{index + 1}</span>
                    <span className="min-w-0 flex-1 truncate text-body text-ink">{section.label}</span>
                    <span className="font-mono text-caption tabular-nums text-ink">{`${section.share}%`}</span>
                  </span>
                  <span className="flex items-center gap-2 pl-6">
                    <span className="h-1.5 flex-1 overflow-hidden rounded-xs bg-surface-active" role="presentation">
                      <span className="block h-full rounded-xs bg-primary" style={{ width: `${(section.share / maxShare) * 100}%` }} />
                    </span>
                    <span className="w-24 text-right font-mono text-caption text-mute">{`${section.reach}% sampai`}</span>
                  </span>
                </li>
              ))}
            </ol>
          </Panel>
        </div>
      </div>
    </div>
  );
}

export { ScrollMapPage };
