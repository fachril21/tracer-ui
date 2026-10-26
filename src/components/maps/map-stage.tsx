import type { ReactNode } from "react";
import { DEVICE_LAYOUT, PAGE_SECTIONS } from "@/mock/page-model";
import type { DeviceKind } from "@/mock/page-model";

const BLOCK = "absolute rounded-xs bg-current";

// Kerangka seluruh halaman dalam satu panjang. Posisi balok sejajar dengan data tiruan peta klik.
function TallWireframe() {
  return (
    <div aria-hidden="true" className="absolute inset-0 text-border-control">
      {/* Navigasi */}
      <div className={`${BLOCK} left-[4%] top-[1.6%] h-[1.8%] w-[12%]`} />
      <div className={`${BLOCK} left-[30%] top-[2.7%] h-[0.6%] w-[8%] opacity-60`} />
      <div className={`${BLOCK} left-[41%] top-[2.7%] h-[0.6%] w-[8%] opacity-60`} />
      <div className={`${BLOCK} left-[52%] top-[2.7%] h-[0.6%] w-[8%] opacity-60`} />
      <div className="absolute left-[61%] top-[2.2%] h-[2.5%] w-[14%] rounded-xs border border-current" />
      <div className="absolute left-[89%] top-[2.2%] h-[2.5%] w-[6%] rounded-xs border border-current" />
      <div className="absolute inset-x-0 top-[7%] border-t border-current" />

      {/* Banner dan ajakan */}
      <div className="absolute inset-x-[4%] top-[9%] h-[6%] rounded-md border border-dashed border-current" />
      <div className={`${BLOCK} left-[4%] top-[16.5%] h-[0.8%] w-[34%]`} />
      <div className={`${BLOCK} left-[4%] top-[18.3%] h-[0.7%] w-[48%] opacity-50`} />
      <div className="absolute left-[65%] top-[16.5%] h-[3%] w-[18%] rounded-md border-2 border-current" />

      {/* Galeri produk */}
      <div className={`${BLOCK} left-[4%] top-[23%] h-[0.8%] w-[22%]`} />
      {[0, 1, 2].map((index) => (
        <div
          key={index}
          className="absolute top-[25.5%] h-[15%] w-[27%] rounded-md border border-current"
          style={{ left: `${3.5 + index * 33}%` }}
        >
          <div className="m-[7%] h-[58%] rounded-xs bg-current opacity-30" />
          <div className="mx-[7%] h-[4%] w-[60%] rounded-xs bg-current opacity-60" />
        </div>
      ))}

      {/* Ulasan */}
      <div className="absolute left-[4%] top-[49.5%] h-[3%] w-[28%] rounded-md border border-current" />
      <div className="absolute left-[34%] top-[49.5%] h-[3%] w-[22%] rounded-md border border-current opacity-60" />
      {[0, 1, 2].map((index) => (
        <div key={index} className={`${BLOCK} left-[4%] h-[0.7%] opacity-40`} style={{ top: `${55 + index * 2.4}%`, width: `${70 - index * 12}%` }} />
      ))}

      {/* Promo */}
      <div className="absolute left-[44%] top-[70.5%] h-[3%] w-[20%] rounded-md border border-current" />
      <div className="absolute left-[64%] top-[70.5%] h-[3%] w-[20%] rounded-md border-2 border-current" />
      <div className={`${BLOCK} left-[4%] top-[66%] h-[0.8%] w-[26%]`} />

      {/* Footer */}
      <div className="absolute inset-x-0 top-[80%] border-t border-current" />
      {[0, 1, 2].map((column) => (
        <div key={column} className="absolute top-[85%]" style={{ left: `${6 + column * 30}%`, width: "22%" }}>
          {[0, 1, 2, 3].map((row) => (
            <div key={row} className="mb-[8%] h-[0.5vw] min-h-1 rounded-xs bg-current opacity-40" style={{ height: 4, width: `${90 - row * 14}%` }} />
          ))}
        </div>
      ))}
    </div>
  );
}

function SectionLabels() {
  return (
    <>
      {PAGE_SECTIONS.map((section) => (
        <div
          key={section.id}
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 border-t border-dashed border-border-control/70"
          style={{ top: `${section.from * 100}%` }}
        >
          {section.from === 0 ? null : (
            <span className="absolute left-1/2 top-0.5 -translate-x-1/2 whitespace-nowrap rounded-xs bg-canvas/90 px-1 font-mono text-label uppercase tracking-[0.06em] text-stone">
              {section.label}
            </span>
          )}
        </div>
      ))}
    </>
  );
}

type MapStageProps = {
  device: DeviceKind;
  label: string;
  children?: ReactNode;
};

function MapStage({ device, label, children }: MapStageProps) {
  const layout = DEVICE_LAYOUT[device];
  return (
    <div className="bg-stage-grid flex justify-center rounded-lg border border-hairline p-3">
      <div
        role="img"
        aria-label={label}
        className="relative w-full overflow-hidden rounded-md border border-border-control bg-canvas"
        style={{ maxWidth: layout.maxWidth, aspectRatio: `1 / ${layout.heightRatio}` }}
      >
        <TallWireframe />
        {children}
        <SectionLabels />
      </div>
    </div>
  );
}

export { MapStage };
