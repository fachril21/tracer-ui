import { useState } from "react";
import { ArrowLeft, Info } from "lucide-react";
import { Link } from "react-router";
import { FeedbackWidget } from "@/components/feedback/feedback-widget";
import { WireframePage } from "@/components/replay/replay-stage";
import { buttonVariants } from "@/components/ui/button";
import { CodeBlock } from "@/components/ui/code-block";
import { TextField } from "@/components/ui/input";
import { Istilah } from "@/components/ui/istilah";
import { Panel } from "@/components/ui/panel";
import { Segmented } from "@/components/ui/segmented";
import { SwitchField } from "@/components/ui/switch";
import { cn } from "@/lib/utils";
import { KIND_LABEL } from "@/mock/feedback";
import type { FeedbackKind } from "@/mock/feedback";
import { useDemo } from "@/state/demo-context";
import { useActiveProject } from "@/state/use-active-project";
import { useFeedback } from "@/state/use-feedback";
import type { WidgetPosition } from "@/state/use-feedback";

const KINDS: FeedbackKind[] = ["masalah", "saran", "pujian"];
const POSITION_OPTIONS: { value: WidgetPosition; label: string }[] = [
  { value: "kanan", label: "Kanan" },
  { value: "kiri", label: "Kiri" },
];

function FeedbackWidgetPage() {
  const { project } = useActiveProject();
  const { role } = useDemo();
  const { widget, setWidget, addFeedback } = useFeedback(project?.id ?? "");
  const [sentCount, setSentCount] = useState(0);

  if (project === null) return null;

  const canEdit = role === "pemilik";
  const snippet = `<script src="https://cdn.tracer.example/widget.js"\n  data-project="${project.id}" defer></script>`;

  const toggleKind = (kind: FeedbackKind, isOn: boolean) => {
    const next = isOn ? [...widget.kinds, kind] : widget.kinds.filter((item) => item !== kind);
    setWidget({ kinds: KINDS.filter((item) => next.includes(item)) });
  };

  return (
    <div className="flex flex-col gap-4">
      <header className="flex flex-col gap-2">
        <Link
          to={`/p/${project.id}/feedback`}
          className="inline-flex w-fit items-center gap-1.5 text-caption font-medium text-mute hover:text-ink"
        >
          <ArrowLeft className="size-3.5" aria-hidden="true" />
          Kembali ke Feedback
        </Link>
        <h1 className="text-page-title font-semibold text-ink">
          <Istilah term="widget">Widget masukan</Istilah>
        </h1>
        <p className="max-w-prose text-body text-mute">
          Tab kecil di pinggir layar website Anda. Pengunjung membukanya untuk menulis masukan tanpa meninggalkan halaman.
        </p>
      </header>

      {canEdit ? null : (
        <p role="note" className="flex items-start gap-2 rounded-lg border border-hairline bg-warning-bg p-3 text-body text-warning-text">
          <Info className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
          Hanya pemilik project yang dapat mengubah widget. Pratinjau tetap bisa dicoba.
        </p>
      )}

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-[22rem_minmax(0,1fr)] xl:items-start">
        <div className="flex flex-col gap-4">
          <Panel title="Tampilan">
            <div className="flex flex-col gap-4">
              <SwitchField
                label="Tampilkan widget"
                hint="Matikan untuk menyembunyikan tab di website."
                checked={widget.isEnabled}
                disabled={!canEdit}
                onCheckedChange={(isEnabled) => setWidget({ isEnabled })}
              />
              <div className="flex flex-col gap-1.5">
                <span id="posisi-widget" className="text-caption font-medium text-charcoal">
                  Posisi tab
                </span>
                <Segmented
                  label="Posisi tab"
                  value={widget.position}
                  options={POSITION_OPTIONS}
                  onChange={(position) => (canEdit ? setWidget({ position }) : undefined)}
                />
              </div>
              <TextField
                label="Tulisan pada tab"
                value={widget.tabLabel}
                maxLength={16}
                disabled={!canEdit}
                onChange={(event) => setWidget({ tabLabel: event.target.value })}
              />
              <TextField
                label="Judul panel"
                value={widget.title}
                maxLength={48}
                disabled={!canEdit}
                onChange={(event) => setWidget({ title: event.target.value })}
              />
            </div>
          </Panel>

          <Panel title="Isian">
            <div className="flex flex-col gap-4">
              {KINDS.map((kind) => (
                <SwitchField
                  key={kind}
                  label={`Jenis: ${KIND_LABEL[kind]}`}
                  checked={widget.kinds.includes(kind)}
                  disabled={!canEdit || (widget.kinds.length === 1 && widget.kinds.includes(kind))}
                  onCheckedChange={(isOn) => toggleKind(kind, isOn)}
                />
              ))}
              <SwitchField
                label="Tanya email"
                hint="Kolom opsional, supaya tim bisa membalas."
                checked={widget.askEmail}
                disabled={!canEdit}
                onCheckedChange={(askEmail) => setWidget({ askEmail })}
              />
            </div>
          </Panel>

          <Panel title="Pasang di website">
            <p className="text-body text-mute">Tempel setelah skrip Tracer yang sudah terpasang.</p>
            <CodeBlock label="kode widget" text={snippet} />
          </Panel>
        </div>

        <Panel title="Pratinjau" meta={project.siteUrl}>
          <div className="relative h-[34rem] w-full overflow-hidden rounded-md border border-hairline bg-paper">
            <WireframePage path="/" />
            <FeedbackWidget
              key={widget.kinds.join("-")}
              config={widget}
              onSubmit={(input) => {
                addFeedback(input);
                setSentCount((count) => count + 1);
              }}
            />
            {widget.isEnabled ? null : (
              <p className="absolute inset-x-0 bottom-3 text-center text-caption text-mute">
                Widget dimatikan, pengunjung tidak melihat tab ini.
              </p>
            )}
          </div>
          <p role="status" className="flex flex-wrap items-center gap-x-2 gap-y-1 text-caption text-mute">
            {sentCount === 0
              ? "Coba kirim masukan dari pratinjau ini, hasilnya masuk ke daftar Feedback."
              : `${sentCount} masukan percobaan terkirim.`}
            {sentCount === 0 ? null : (
              <Link to={`/p/${project.id}/feedback`} className={cn(buttonVariants({ variant: "ghost", size: "sm" }))}>
                Lihat di daftar
              </Link>
            )}
          </p>
        </Panel>
      </div>
    </div>
  );
}

export { FeedbackWidgetPage };
