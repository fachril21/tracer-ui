import { useMemo, useState } from "react";
import { ArrowLeft, Pencil, Trash2 } from "lucide-react";
import { Link, Navigate, useNavigate, useParams, useSearchParams } from "react-router";
import { AskButton } from "@/components/assistant/ask-button";
import { FunnelSteps } from "@/components/funnel/funnel-steps";
import type { SeriesBar } from "@/components/funnel/funnel-steps";
import { Button, buttonVariants } from "@/components/ui/button";
import { Panel } from "@/components/ui/panel";
import { Segmented } from "@/components/ui/segmented";
import { useDemo } from "@/state/demo-context";
import { cn } from "@/lib/utils";
import { computeFunnel } from "@/mock/funnels";
import type { FunnelPeriod } from "@/mock/funnels";
import { useActiveProject } from "@/state/use-active-project";
import { useFunnels } from "@/state/use-funnels";

type Compare = "semua" | "perangkat";

const PERIODS: { value: string; label: string }[] = [
  { value: "7", label: "7 hari" },
  { value: "30", label: "30 hari" },
  { value: "90", label: "90 hari" },
];

const COMPARE_OPTIONS: { value: Compare; label: string }[] = [
  { value: "semua", label: "Semua perangkat" },
  { value: "perangkat", label: "Bandingkan ponsel dan desktop" },
];

function parsePeriod(raw: string | null): FunnelPeriod {
  return raw === "7" ? 7 : raw === "90" ? 90 : 30;
}

function FunnelResultPage() {
  const { funnelId } = useParams();
  const { project } = useActiveProject();
  const { role } = useDemo();
  const { funnels, remove } = useFunnels(project?.id ?? "");
  const [params, setParams] = useSearchParams();
  const navigate = useNavigate();
  const [isConfirming, setConfirming] = useState(false);
  const now = useMemo(() => new Date(), []);

  const funnel = funnels.find((item) => item.id === funnelId);
  const days = parsePeriod(params.get("hari"));
  const compare: Compare = params.get("bandingkan") === "perangkat" ? "perangkat" : "semua";

  const series = useMemo<SeriesBar[]>(() => {
    if (project === null || funnel === undefined) return [];
    if (compare === "perangkat") {
      return [
        { name: "Ponsel", result: computeFunnel(project.id, funnel, days, now, "Mobile") },
        { name: "Desktop", result: computeFunnel(project.id, funnel, days, now, "Desktop") },
      ];
    }
    return [{ name: "Semua", result: computeFunnel(project.id, funnel, days, now) }];
  }, [project, funnel, days, compare, now]);

  if (project === null) return null;
  if (funnel === undefined) return <Navigate to={`/p/${project.id}/funnel`} replace />;

  const setParam = (key: string, value: string, fallback: string) => {
    const next = new URLSearchParams(params);
    if (value === fallback) next.delete(key);
    else next.set(key, value);
    setParams(next, { replace: true });
  };

  const canEdit = role === "pemilik";
  const base = `/p/${project.id}/funnel`;

  return (
    <div className="flex flex-col gap-4">
      <header className="flex flex-col gap-2">
        <Link to={base} className="inline-flex w-fit items-center gap-1.5 text-caption font-medium text-mute hover:text-ink">
          <ArrowLeft className="size-3.5" aria-hidden="true" />
          Semua funnel
        </Link>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h1 className="text-page-title font-semibold text-ink">{funnel.name}</h1>
          <div className="flex flex-wrap items-center gap-2">
            <AskButton request={{ kind: "funnel", funnel }} label={`Jelaskan penurunan di “${funnel.name}”`}>
              Jelaskan penurunan
            </AskButton>
          {canEdit ? (
            <>
              {isConfirming ? (
                <>
                  <span className="text-body text-charcoal">Hapus funnel ini?</span>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => {
                      remove(funnel.id);
                      navigate(base, { replace: true });
                    }}
                  >
                    Ya, hapus
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => setConfirming(false)}>
                    Batal
                  </Button>
                </>
              ) : (
                <>
                  <Link to={`${base}/${funnel.id}/edit`} className={cn(buttonVariants({ variant: "secondary" }))}>
                    <Pencil aria-hidden="true" />
                    Ubah
                  </Link>
                  <Button variant="ghost" onClick={() => setConfirming(true)}>
                    <Trash2 aria-hidden="true" />
                    Hapus
                  </Button>
                </>
              )}
            </>
          ) : null}
          </div>
        </div>
      </header>

      <div className="flex flex-wrap items-center gap-3">
        <Segmented
          label="Rentang waktu"
          value={String(days)}
          options={PERIODS}
          onChange={(value) => setParam("hari", value, "30")}
        />
        <Segmented
          label="Perangkat"
          value={compare}
          options={COMPARE_OPTIONS}
          onChange={(value) => setParam("bandingkan", value, "semua")}
        />
      </div>

      <Panel title="Langkah" meta={`${days} hari terakhir`}>
        {series[0]?.result.steps[0]?.count === 0 ? (
          <p className="text-body text-mute">Belum ada sesi yang masuk di langkah pertama pada rentang ini.</p>
        ) : (
          <FunnelSteps projectId={project.id} funnel={funnel} days={days} now={now} series={series} />
        )}
      </Panel>
    </div>
  );
}

export { FunnelResultPage };
