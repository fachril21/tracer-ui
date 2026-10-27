import { useMemo, useState } from "react";
import { Settings2 } from "lucide-react";
import { Link, useSearchParams } from "react-router";
import { AskButton } from "@/components/assistant/ask-button";
import { FeedbackDetail, Stars } from "@/components/feedback/feedback-detail";
import { Button, buttonVariants } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { TextField } from "@/components/ui/input";
import { Panel } from "@/components/ui/panel";
import { Segmented } from "@/components/ui/segmented";
import type { SegmentedOption } from "@/components/ui/segmented";
import { Sheet, SheetContent, SheetDescription, SheetTitle } from "@/components/ui/sheet";
import { useMediaQuery } from "@/hooks/use-media-query";
import { formatCount, formatRelative } from "@/lib/format";
import { cn } from "@/lib/utils";
import { KIND_LABEL, STATUS_LABEL, summarizeFeedback } from "@/mock/feedback";
import type { FeedbackItem, FeedbackKind, FeedbackStatus } from "@/mock/feedback";
import { useActiveProject } from "@/state/use-active-project";
import { useFeedback } from "@/state/use-feedback";

type StatusFilter = "semua" | FeedbackStatus;
type KindFilter = "semua" | FeedbackKind;

const STATUS_OPTIONS: SegmentedOption<StatusFilter>[] = [
  { value: "semua", label: "Semua" },
  { value: "baru", label: STATUS_LABEL.baru, term: "statusMasukan" },
  { value: "dibaca", label: STATUS_LABEL.dibaca, term: "statusMasukan" },
  { value: "selesai", label: STATUS_LABEL.selesai, term: "statusMasukan" },
];

const KIND_OPTIONS: SegmentedOption<KindFilter>[] = [
  { value: "semua", label: "Semua jenis" },
  { value: "masalah", label: KIND_LABEL.masalah, term: "jenisMasukan" },
  { value: "saran", label: KIND_LABEL.saran, term: "jenisMasukan" },
  { value: "pujian", label: KIND_LABEL.pujian, term: "jenisMasukan" },
];

function RatingSummary({ items }: { items: readonly FeedbackItem[] }) {
  const summary = summarizeFeedback(items);
  const peak = Math.max(1, ...summary.distribution);
  return (
    <Panel title="Ringkasan nilai" term="ringkasanNilai" meta={`${formatCount(summary.total)} masukan`}>
      <div className="flex flex-wrap items-center gap-x-8 gap-y-4">
        <div className="flex flex-col gap-1">
          <p className="font-mono text-heading-lg tabular-nums text-ink">{summary.average.toFixed(1).replace(".", ",")}</p>
          <Stars rating={Math.round(summary.average)} />
        </div>
        <ul aria-label="Sebaran nilai" className="flex min-w-48 flex-1 flex-col gap-1">
          {[5, 4, 3, 2, 1].map((value) => {
            const count = summary.distribution[value - 1] ?? 0;
            return (
              <li key={value} className="flex items-center gap-2 text-caption">
                <span className="w-16 shrink-0 whitespace-nowrap font-mono tabular-nums text-mute">{value} dari 5</span>
                <span className="h-2 flex-1 bg-surface-soft" aria-hidden="true">
                  <span className="block h-full bg-primary" style={{ width: `${(count / peak) * 100}%` }} />
                </span>
                <span className="w-6 text-right font-mono tabular-nums text-charcoal">{count}</span>
              </li>
            );
          })}
        </ul>
      </div>
    </Panel>
  );
}

type RowProps = { item: FeedbackItem; now: Date; isSelected: boolean; onSelect: () => void };

function FeedbackRow({ item, now, isSelected, onSelect }: RowProps) {
  return (
    <li>
      <button
        type="button"
        onClick={onSelect}
        aria-current={isSelected ? "true" : undefined}
        className={cn(
          "flex w-full flex-col gap-1 border-b border-hairline px-3 py-2.5 text-left transition-colors duration-[var(--motion-fast)] hover:bg-surface-hover",
          isSelected && "bg-primary-soft",
        )}
      >
        <span className="flex items-center gap-2 text-caption text-mute">
          <Stars rating={item.rating} />
          <span className="font-medium text-charcoal">{KIND_LABEL[item.kind]}</span>
          {item.status === "baru" ? <span className="size-1.5 bg-primary" role="img" aria-label="Belum dibaca" /> : null}
          <span className="ml-auto font-mono tabular-nums">{formatRelative(item.createdAt, now)}</span>
        </span>
        <span className="line-clamp-2 text-body text-ink">{item.message}</span>
      </button>
    </li>
  );
}

function FeedbackPage() {
  const { project } = useActiveProject();
  const { items, now, setStatus } = useFeedback(project?.id ?? "");
  const [params, setParams] = useSearchParams();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const isWide = useMediaQuery("(min-width: 1280px)");

  const status = (params.get("status") ?? "semua") as StatusFilter;
  const kind = (params.get("jenis") ?? "semua") as KindFilter;
  const query = params.get("q") ?? "";

  const setParam = (key: string, value: string) => {
    const next = new URLSearchParams(params);
    if (value === "" || value === "semua") next.delete(key);
    else next.set(key, value);
    setParams(next, { replace: true });
  };

  const shown = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return items.filter(
      (item) =>
        (status === "semua" || item.status === status) &&
        (kind === "semua" || item.kind === kind) &&
        (needle === "" || item.message.toLowerCase().includes(needle)),
    );
  }, [items, status, kind, query]);

  if (project === null) return null;

  // Di layar lebar, masukan pertama otomatis terbuka agar panel kanan tidak kosong
  const selected = shown.find((item) => item.id === selectedId) ?? (isWide ? (shown[0] ?? null) : null);
  const hasFilter = status !== "semua" || kind !== "semua" || query !== "";

  const clearFilters = () => setParams(new URLSearchParams(), { replace: true });

  return (
    <div className="flex flex-col gap-4">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-col gap-1">
          <h1 className="text-page-title font-semibold text-ink">Feedback</h1>
          <p className="text-caption text-mute">Masukan dari pengunjung lewat widget di website Anda.</p>
        </div>
        <div className="flex flex-wrap gap-2">
        <AskButton request={{ kind: "feedback" }} label="Rangkum masukan pengunjung">
          Rangkum masukan
        </AskButton>
        <Link to={`/p/${project.id}/feedback/widget`} className={cn(buttonVariants({ variant: "secondary" }))}>
          <Settings2 aria-hidden="true" />
          Pengaturan widget
        </Link>
        </div>
      </header>

      <RatingSummary items={items} />

      <div className="flex flex-wrap items-end gap-3">
        <Segmented label="Status" value={status} options={STATUS_OPTIONS} onChange={(v) => setParam("status", v)} />
        <Segmented label="Jenis" value={kind} options={KIND_OPTIONS} onChange={(v) => setParam("jenis", v)} />
        <div className="ml-auto w-full sm:w-64">
          <TextField
            label="Cari masukan"
            type="search"
            value={query}
            onChange={(event) => setParam("q", event.target.value)}
          />
        </div>
      </div>

      {shown.length === 0 ? (
        <section aria-label="Tidak ada masukan" className="rounded-lg border border-hairline bg-canvas">
          <EmptyState
            title={hasFilter ? "Tidak ada masukan yang cocok" : "Belum ada masukan"}
            description={
              hasFilter
                ? "Ubah atau hapus filter untuk melihat masukan lainnya."
                : "Masukan dari widget akan muncul di sini begitu pengunjung mengirimnya."
            }
            action={hasFilter ? <Button onClick={clearFilters}>Hapus filter</Button> : undefined}
          />
        </section>
      ) : (
        <div className="grid grid-cols-1 gap-4 xl:grid-cols-[minmax(0,1fr)_26rem] xl:items-start">
          <section aria-label="Daftar masukan" className="rounded-lg border border-hairline bg-canvas">
            <ul>
              {shown.map((item) => (
                <FeedbackRow
                  key={item.id}
                  item={item}
                  now={now}
                  isSelected={selected?.id === item.id}
                  onSelect={() => {
                    setSelectedId(item.id);
                    if (item.status === "baru" && isWide) setStatus(item.id, "dibaca");
                  }}
                />
              ))}
            </ul>
          </section>

          {isWide ? (
            <section aria-label="Masukan terpilih" className="sticky top-0 rounded-lg border border-hairline bg-canvas p-5">
              {selected === null ? null : (
                <FeedbackDetail item={selected} projectId={project.id} onStatus={setStatus} />
              )}
            </section>
          ) : null}
        </div>
      )}

      {isWide ? null : (
        <Sheet open={selected !== null} onOpenChange={(open) => (open ? undefined : setSelectedId(null))}>
          <SheetContent side="right" className="w-[420px] max-w-[92vw] gap-4 p-5">
            <SheetTitle className="text-heading-md font-semibold text-ink">Detail masukan</SheetTitle>
            <SheetDescription className="sr-only">Isi masukan, informasi pengirim, dan tindakan.</SheetDescription>
            {selected === null ? null : (
              <FeedbackDetail item={selected} projectId={project.id} onStatus={setStatus} />
            )}
          </SheetContent>
        </Sheet>
      )}
    </div>
  );
}

export { FeedbackPage };
