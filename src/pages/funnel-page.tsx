import { useMemo } from "react";
import { ArrowRight, Plus } from "lucide-react";
import { Link } from "react-router";
import { buttonVariants } from "@/components/ui/button";
import { Istilah } from "@/components/ui/istilah";
import { EmptyState } from "@/components/ui/empty-state";
import { formatCount, formatPercent } from "@/lib/format";
import { cn } from "@/lib/utils";
import { computeFunnel, stepLabel } from "@/mock/funnels";
import { useActiveProject } from "@/state/use-active-project";
import { useFunnels } from "@/state/use-funnels";

const LIST_DAYS = 30;

function FunnelPage() {
  const { project } = useActiveProject();
  const { funnels } = useFunnels(project?.id ?? "");
  const now = useMemo(() => new Date(), []);

  if (project === null) return null;

  const createLink = (
    <Link to={`/p/${project.id}/funnel/new`} className={cn(buttonVariants({ variant: "primary" }))}>
      <Plus aria-hidden="true" />
      Buat funnel
    </Link>
  );

  return (
    <div className="flex flex-col gap-4">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-col gap-1">
          <h1 className="text-page-title font-semibold text-ink">
            <Istilah term="funnel">Funnel</Istilah>
          </h1>
          <p className="text-caption text-mute">Lihat di langkah mana pengunjung berhenti. Data {LIST_DAYS} hari terakhir.</p>
        </div>
        {funnels.length === 0 ? null : createLink}
      </header>

      {funnels.length === 0 ? (
        <section aria-label="Belum ada funnel" className="rounded-lg border border-hairline bg-canvas">
          <EmptyState
            title="Belum ada funnel"
            description="Susun urutan halaman atau kejadian, misalnya produk, keranjang, lalu checkout. Tracer menghitung berapa pengunjung yang sampai di tiap langkah."
            action={createLink}
          />
        </section>
      ) : (
        <ul aria-label="Daftar funnel" className="rounded-lg border border-hairline bg-canvas">
          {funnels.map((funnel) => {
            const result = computeFunnel(project.id, funnel, LIST_DAYS, now);
            const last = result.steps[result.steps.length - 1];
            return (
              <li key={funnel.id} className="border-b border-hairline last:border-b-0">
                <Link
                  to={`/p/${project.id}/funnel/${funnel.id}`}
                  className="flex flex-wrap items-center gap-x-6 gap-y-2 px-4 py-3 hover:bg-surface-hover"
                >
                  <span className="flex min-w-0 flex-1 basis-64 flex-col gap-1">
                    <span className="text-body font-semibold text-ink">{funnel.name}</span>
                    <span className="truncate font-mono text-caption text-mute">
                      {funnel.steps.map(stepLabel).join(" → ")}
                    </span>
                  </span>
                  <span className="flex flex-col items-end">
                    <span className="font-mono text-heading-sm tabular-nums text-ink">
                      {formatPercent(Math.round((last?.rateFromStart ?? 0) * 10) / 10)}
                    </span>
                    <span className="text-caption text-mute">
                      sampai langkah akhir ({formatCount(last?.count ?? 0)} sesi)
                    </span>
                  </span>
                  <ArrowRight className="size-4 text-mute" aria-hidden="true" />
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

export { FunnelPage };
