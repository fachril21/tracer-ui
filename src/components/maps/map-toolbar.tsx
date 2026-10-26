import { Segmented } from "@/components/ui/segmented";
import type { DashboardQueryApi } from "@/hooks/use-dashboard-query";
import { DIMENSIONS } from "@/mock/dimensions";
import type { DeviceKind } from "@/mock/page-model";
import type { PeriodPreset } from "@/mock/types";

const DEVICE_OPTIONS: { value: DeviceKind; label: string }[] = [
  { value: "Desktop", label: "Desktop" },
  { value: "Tablet", label: "Tablet" },
  { value: "Mobile", label: "Mobile" },
];

const PERIOD_OPTIONS: { value: PeriodPreset; label: string }[] = [
  { value: "7", label: "7 hari" },
  { value: "30", label: "30 hari" },
  { value: "90", label: "90 hari" },
];

type MapToolbarProps = {
  api: DashboardQueryApi;
  path: string;
  device: DeviceKind;
};

// Satu baris saja: halaman, perangkat, dan rentang. Panggung peta yang jadi pusat perhatian.
function MapToolbar({ api, path, device }: MapToolbarProps) {
  return (
    <section aria-label="Pengaturan peta" className="flex flex-wrap items-end gap-x-5 gap-y-3">
      <label className="flex min-w-56 flex-col gap-1 text-caption text-mute">
        Halaman
        <select
          value={path}
          onChange={(event) => api.setFilter("page", event.target.value)}
          className="h-[34px] rounded-md border border-border-control bg-canvas px-2 font-mono text-mono text-ink"
        >
          {DIMENSIONS.page.options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </label>
      <Segmented label="Perangkat" value={device} options={DEVICE_OPTIONS} onChange={(value) => api.setFilter("device", value)} />
      <Segmented
        label="Rentang waktu"
        value={api.query.period.preset}
        options={PERIOD_OPTIONS}
        onChange={(value) => {
          if (value !== "custom") api.setPreset(value);
        }}
      />
    </section>
  );
}

export { MapToolbar };
