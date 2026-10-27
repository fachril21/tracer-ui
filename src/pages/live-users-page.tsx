import { useMemo, useState } from "react";
import { Pause, Play, TriangleAlert, WifiOff } from "lucide-react";
import { Link } from "react-router";
import { LiveIndicator } from "@/components/live/live-indicator";
import { LiveVisitorList } from "@/components/live/live-visitor-list";
import { LiveWatchSheet } from "@/components/live/live-watch-sheet";
import { PageSpread } from "@/components/live/page-spread";
import { Button, buttonVariants } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { Istilah } from "@/components/ui/istilah";
import { Segmented } from "@/components/ui/segmented";
import type { SegmentedOption } from "@/components/ui/segmented";
import { formatCount } from "@/lib/format";
import { cn } from "@/lib/utils";
import { useLive } from "@/state/live-context";
import { useActiveProject } from "@/state/use-active-project";

type Scope = "semua" | "bermasalah";

const SCOPE_OPTIONS: SegmentedOption<Scope>[] = [
  { value: "semua", label: "Semua" },
  { value: "bermasalah", label: "Bersinyal masalah", term: "bersinyalMasalah" },
];

function Notice({ children }: { children: string }) {
  return (
    <p
      role="status"
      className="flex items-start gap-2 rounded-lg border border-hairline bg-warning-bg p-3 text-body text-warning-text"
    >
      <WifiOff className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
      {children}
    </p>
  );
}

function LiveUsersPage() {
  const { project, installation } = useActiveProject();
  const live = useLive();
  const [scope, setScope] = useState<Scope>("semua");
  const [watchedId, setWatchedId] = useState<string | null>(null);

  const active = useMemo(() => live.visitors.filter((visitor) => visitor.leavingAt === null), [live.visitors]);
  const shown = useMemo(
    () => (scope === "semua" ? live.visitors : live.visitors.filter((visitor) => visitor.signal !== null || visitor.leavingAt !== null)),
    [live.visitors, scope],
  );
  const byDevice = useMemo(
    () =>
      (["Mobile", "Desktop", "Tablet"] as const)
        .map((device) => ({ device, count: active.filter((visitor) => visitor.device === device).length }))
        .filter((item) => item.count > 0),
    [active],
  );
  const watched = live.visitors.find((visitor) => visitor.id === watchedId) ?? null;

  if (project === null) return null;

  const agoSeconds = Math.max(0, Math.round((live.now - live.updatedAt) / 1000));

  return (
    <div className="flex flex-col gap-4">
      <header className="flex flex-col gap-1.5">
        <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
          <h1 className="text-page-title font-semibold text-ink">Live Users</h1>
          {installation === "detected" ? (
            <Istilah term="statusLive">
              <LiveIndicator connection={live.connection} isPaused={live.isPaused} />
            </Istilah>
          ) : null}
        </div>
        {installation === "detected" ? (
          <p className="text-caption text-mute">
            <span className="font-mono tabular-nums">{formatCount(live.activeCount)}</span>
            {" "}
            <Istilah term="pengunjungAktif">pengunjung aktif</Istilah>
            {byDevice.length === 0 ? null : (
              <span className="font-mono tabular-nums">
                {` · ${byDevice.map((item) => `${item.device} ${item.count}`).join(" · ")}`}
              </span>
            )}
            {live.connection === "terhubung" && !live.isPaused ? ` · diperbarui ${agoSeconds} d lalu` : null}
          </p>
        ) : null}
      </header>

      {installation !== "detected" ? (
        <section aria-label="Menunggu pemasangan" className="rounded-lg border border-hairline bg-canvas">
          <EmptyState
            title="Live Users aktif setelah pemasangan terdeteksi"
            description="Pasang skrip Tracer di website Anda. Begitu pengunjung pertama datang, mereka muncul di sini."
            action={
              <Link to={`/p/${project.id}/installation`} className={cn(buttonVariants({ variant: "secondary" }))}>
                Buka halaman Pemasangan
              </Link>
            }
          />
        </section>
      ) : (
        <>
          {live.connection === "terputus" ? (
            <Notice>{`Pembaruan langsung terputus. Menampilkan data terakhir (${agoSeconds} d lalu) dan mencoba menyambung lagi.`}</Notice>
          ) : null}

          <div className="flex flex-wrap items-center gap-2">
            <Segmented label="Tampilkan pengunjung" value={scope} options={SCOPE_OPTIONS} onChange={setScope} />
            <Button
              variant="secondary"
              size="sm"
              className="ml-auto"
              aria-pressed={live.isPaused}
              disabled={live.connection === "terputus"}
              onClick={() => live.setPaused(!live.isPaused)}
            >
              {live.isPaused ? <Play aria-hidden="true" /> : <Pause aria-hidden="true" />}
              {live.isPaused ? "Lanjutkan pembaruan" : "Jeda pembaruan"}
            </Button>
          </div>

          <div className="grid grid-cols-1 gap-4 xl:grid-cols-[minmax(0,1fr)_22rem] xl:items-start">
            {shown.length === 0 ? (
              <section aria-label="Tidak ada pengunjung" className="rounded-lg border border-hairline bg-canvas">
                <EmptyState
                  title={scope === "bermasalah" ? "Tidak ada pengunjung bermasalah" : "Belum ada pengunjung aktif"}
                  description={
                    scope === "bermasalah"
                      ? "Semua pengunjung yang sedang aktif berjalan lancar saat ini."
                      : "Tidak ada yang sedang membuka website Anda. Pengunjung baru muncul di sini begitu mereka datang."
                  }
                  action={
                    scope === "bermasalah" ? (
                      <Button variant="secondary" onClick={() => setScope("semua")}>
                        <TriangleAlert aria-hidden="true" />
                        Tampilkan semua
                      </Button>
                    ) : undefined
                  }
                />
              </section>
            ) : (
              <section aria-label="Pengunjung aktif" className="rounded-lg border border-hairline bg-canvas p-3">
                <LiveVisitorList visitors={shown} now={live.now} onWatch={(visitor) => setWatchedId(visitor.id)} />
              </section>
            )}
            <PageSpread visitors={live.visitors} />
          </div>
        </>
      )}

      <LiveWatchSheet visitor={watched} isOpen={watchedId !== null} siteUrl={project.siteUrl} onClose={() => setWatchedId(null)} />
    </div>
  );
}

export { LiveUsersPage };
