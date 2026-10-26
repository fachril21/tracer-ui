import { CircleCheck, TriangleAlert } from "lucide-react";
import { Panel } from "@/components/ui/panel";
import { StatusBadge } from "@/components/ui/status-badge";
import { formatCount } from "@/lib/format";
import { MAGMA_GRADIENT } from "@/lib/magma";
import type { MapQuality } from "@/mock/maps";

// Strip satu baris di atas panggung: status kualitas sekilas, rinciannya ada di panel samping
function QualityStrip({ quality, summary }: { quality: MapQuality; summary: string }) {
  const isLow = quality.level === "rendah";
  return (
    <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5 rounded-lg border border-hairline bg-canvas px-4 py-2.5">
      {isLow ? (
        <StatusBadge kind="warning" icon={TriangleAlert}>
          Sampel kecil
        </StatusBadge>
      ) : (
        <StatusBadge kind="success" icon={CircleCheck}>
          Data memadai
        </StatusBadge>
      )}
      <p className="font-mono text-caption tabular-nums text-mute">{summary}</p>
    </div>
  );
}

function QualityPanel({ quality }: { quality: MapQuality }) {
  const isLow = quality.level === "rendah";
  return (
    <Panel title="Kualitas data">
      <dl className="grid grid-cols-2 gap-x-4 gap-y-3">
        <div className="flex flex-col gap-0.5">
          <dt className="font-mono text-label uppercase tracking-[0.06em] text-stone">Sesi</dt>
          <dd className="font-mono text-heading-md font-medium tabular-nums text-ink">
            {formatCount(quality.sessions)}
          </dd>
        </div>
        <div className="flex flex-col gap-0.5">
          <dt className="font-mono text-label uppercase tracking-[0.06em] text-stone">Terpetakan</dt>
          <dd className="font-mono text-heading-md font-medium tabular-nums text-ink">
            {`${quality.mappedShare}%`}
          </dd>
        </div>
      </dl>
      <p className="text-body text-mute">
        {isLow
          ? "Sesi di bawah 1.200 pada rentang ini. Pola di peta bisa berubah banyak saat data bertambah, jadi perluas rentang sebelum mengambil keputusan."
          : "Jumlah sesi cukup untuk membaca pola. Titik yang tidak terpetakan ke elemen berasal dari konten yang berubah atau sudah dihapus."}
      </p>
    </Panel>
  );
}

// Legenda gradasi: kiri sedikit, kanan banyak. Palet berurutan kecerahan, aman untuk buta warna.
function HeatLegend({ lowLabel, highLabel }: { lowLabel: string; highLabel: string }) {
  return (
    <div className="flex items-center gap-3 font-mono text-caption text-mute">
      <span>{lowLabel}</span>
      <div aria-hidden="true" className="h-2 w-40 rounded-xs border border-hairline" style={{ backgroundImage: MAGMA_GRADIENT }} />
      <span>{highLabel}</span>
    </div>
  );
}

export { HeatLegend, QualityPanel, QualityStrip };
