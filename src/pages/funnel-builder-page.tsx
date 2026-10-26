import { useState } from "react";
import type { FormEvent } from "react";
import { ArrowDown, ArrowLeft, ArrowUp, Plus, X } from "lucide-react";
import { Link, Navigate, useNavigate, useParams } from "react-router";
import { Button } from "@/components/ui/button";
import { TextField } from "@/components/ui/input";
import { Panel } from "@/components/ui/panel";
import { EVENT_LABEL, MAX_STEPS, MIN_STEPS, PAGE_POOL } from "@/mock/funnels";
import type { Funnel, FunnelStep } from "@/mock/funnels";
import type { SmartEventKind } from "@/mock/types";
import { useActiveProject } from "@/state/use-active-project";
import { useFunnels } from "@/state/use-funnels";

const SELECT_CLASS =
  "h-[34px] min-w-0 rounded-md border border-border-control bg-canvas px-2 text-body text-ink pointer-coarse:h-11";
const EVENT_KINDS = Object.keys(EVENT_LABEL) as SmartEventKind[];
const NAME_LIMIT = 60;

function newStepId(steps: readonly FunnelStep[]): string {
  const used = steps.map((step) => Number(step.id.replace("s", "")) || 0);
  return `s${Math.max(0, ...used) + 1}`;
}

function blankStep(steps: readonly FunnelStep[]): FunnelStep {
  return { id: newStepId(steps), kind: "page", value: PAGE_POOL[0] };
}

type StepRowProps = {
  step: FunnelStep;
  index: number;
  total: number;
  onChange: (step: FunnelStep) => void;
  onMove: (direction: -1 | 1) => void;
  onRemove: () => void;
};

function StepRow({ step, index, total, onChange, onMove, onRemove }: StepRowProps) {
  const position = `Langkah ${index + 1}`;
  return (
    <li className="flex flex-wrap items-center gap-2">
      <span aria-hidden="true" className="flex size-5 shrink-0 items-center justify-center bg-ink font-mono text-caption text-paper">
        {index + 1}
      </span>
      <select
        aria-label={`${position}: jenis`}
        value={step.kind}
        className={SELECT_CLASS}
        onChange={(event) =>
          onChange(
            event.target.value === "page"
              ? { id: step.id, kind: "page", value: PAGE_POOL[0] }
              : { id: step.id, kind: "event", value: EVENT_KINDS[0] ?? "rage_click" },
          )
        }
      >
        <option value="page">Halaman</option>
        <option value="event">Kejadian cerdas</option>
      </select>
      {step.kind === "page" ? (
        <select
          aria-label={`${position}: halaman`}
          value={step.value}
          className={`${SELECT_CLASS} flex-1 basis-48 font-mono`}
          onChange={(event) => onChange({ id: step.id, kind: "page", value: event.target.value })}
        >
          {PAGE_POOL.map((path) => (
            <option key={path} value={path}>
              {path}
            </option>
          ))}
        </select>
      ) : (
        <select
          aria-label={`${position}: kejadian`}
          value={step.value}
          className={`${SELECT_CLASS} flex-1 basis-48`}
          onChange={(event) => onChange({ id: step.id, kind: "event", value: event.target.value as SmartEventKind })}
        >
          {EVENT_KINDS.map((kind) => (
            <option key={kind} value={kind}>
              {EVENT_LABEL[kind]}
            </option>
          ))}
        </select>
      )}
      <span className="flex items-center">
        <Button variant="ghost" size="icon" aria-label={`Naikkan ${position}`} disabled={index === 0} onClick={() => onMove(-1)}>
          <ArrowUp aria-hidden="true" />
        </Button>
        <Button variant="ghost" size="icon" aria-label={`Turunkan ${position}`} disabled={index === total - 1} onClick={() => onMove(1)}>
          <ArrowDown aria-hidden="true" />
        </Button>
        <Button variant="ghost" size="icon" aria-label={`Hapus ${position}`} disabled={total <= MIN_STEPS} onClick={onRemove}>
          <X aria-hidden="true" />
        </Button>
      </span>
    </li>
  );
}

function BuilderForm({ projectId, initial }: { projectId: string; initial: Funnel | null }) {
  const { save } = useFunnels(projectId);
  const navigate = useNavigate();
  const [name, setName] = useState(initial?.name ?? "");
  const [steps, setSteps] = useState<FunnelStep[]>(
    initial?.steps ?? [
      { id: "s1", kind: "page", value: PAGE_POOL[1] },
      { id: "s2", kind: "page", value: PAGE_POOL[3] },
    ],
  );
  const [error, setError] = useState<string | null>(null);

  const replaceStep = (index: number, next: FunnelStep) =>
    setSteps((current) => current.map((step, at) => (at === index ? next : step)));

  const moveStep = (index: number, direction: -1 | 1) =>
    setSteps((current) => {
      const target = index + direction;
      if (target < 0 || target >= current.length) return current;
      const next = [...current];
      [next[index], next[target]] = [next[target]!, next[index]!];
      return next;
    });

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    if (name.trim() === "") return setError("Beri nama funnel supaya mudah dikenali.");
    setError(null);
    const id = initial?.id ?? `fn_${Date.now().toString(36)}`;
    save({ id, name: name.trim(), steps });
    navigate(`/p/${projectId}/funnel/${id}`);
  };

  return (
    <form onSubmit={handleSubmit} noValidate className="flex max-w-3xl flex-col gap-4">
      <Panel title="Nama">
        <TextField
          label="Nama funnel"
          value={name}
          maxLength={NAME_LIMIT}
          error={error}
          hint="Contoh: Dari produk sampai checkout"
          onChange={(event) => setName(event.target.value)}
        />
      </Panel>

      <Panel title="Langkah" meta={`${steps.length} dari ${MAX_STEPS}`}>
        <p className="text-body text-mute">
          Pengunjung dihitung berhasil di sebuah langkah bila sesinya melewati langkah itu setelah langkah sebelumnya.
        </p>
        <ol className="flex flex-col gap-2">
          {steps.map((step, index) => (
            <StepRow
              key={step.id}
              step={step}
              index={index}
              total={steps.length}
              onChange={(next) => replaceStep(index, next)}
              onMove={(direction) => moveStep(index, direction)}
              onRemove={() => setSteps((current) => current.filter((_, at) => at !== index))}
            />
          ))}
        </ol>
        <Button
          className="w-fit"
          disabled={steps.length >= MAX_STEPS}
          onClick={() => setSteps((current) => [...current, blankStep(current)])}
        >
          <Plus aria-hidden="true" />
          Tambah langkah
        </Button>
      </Panel>

      <div className="flex flex-wrap gap-2">
        <Button type="submit" variant="primary">
          {initial === null ? "Buat funnel" : "Simpan perubahan"}
        </Button>
        <Button variant="ghost" onClick={() => navigate(-1)}>
          Batal
        </Button>
      </div>
    </form>
  );
}

function FunnelBuilderPage() {
  const { funnelId } = useParams();
  const { project } = useActiveProject();
  const { funnels } = useFunnels(project?.id ?? "");

  if (project === null) return null;
  const initial = funnelId === undefined ? null : (funnels.find((item) => item.id === funnelId) ?? null);
  if (funnelId !== undefined && initial === null) return <Navigate to={`/p/${project.id}/funnel`} replace />;

  return (
    <div className="flex flex-col gap-4">
      <header className="flex flex-col gap-2">
        <Link
          to={`/p/${project.id}/funnel`}
          className="inline-flex w-fit items-center gap-1.5 text-caption font-medium text-mute hover:text-ink"
        >
          <ArrowLeft className="size-3.5" aria-hidden="true" />
          Semua funnel
        </Link>
        <h1 className="text-page-title font-semibold text-ink">{initial === null ? "Funnel baru" : "Ubah funnel"}</h1>
      </header>
      <BuilderForm key={initial?.id ?? "baru"} projectId={project.id} initial={initial} />
    </div>
  );
}

export { FunnelBuilderPage };
