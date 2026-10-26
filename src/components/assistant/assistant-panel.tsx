import { useEffect, useRef, useState } from "react";
import type { FormEvent } from "react";
import { ArrowUpRight, LoaderCircle, RotateCcw, Send, Sparkles, Trash2, TriangleAlert, X } from "lucide-react";
import { Link } from "react-router";
import { Button, buttonVariants } from "@/components/ui/button";
import { Sheet, SheetClose, SheetContent, SheetDescription, SheetTitle } from "@/components/ui/sheet";
import { useMediaQuery } from "@/hooks/use-media-query";
import { cn } from "@/lib/utils";
import { SUGGESTIONS } from "@/mock/assistant";
import { DAILY_LIMIT, useAssistant } from "@/state/assistant-context";
import type { AssistantTurn } from "@/state/assistant-context";
import { useDemo } from "@/state/demo-context";

const STREAM_TICK_MS = 24;
const STREAM_CHARS_PER_TICK = 3;
const INPUT_LIMIT = 200;

// Teks tampil bertahap seperti diketik, kecuali pengguna meminta gerak dikurangi
function useStreamedLength(total: number, isEnabled: boolean): number {
  const [shown, setShown] = useState(isEnabled ? 0 : total);
  useEffect(() => {
    if (!isEnabled) return;
    const timer = window.setInterval(() => {
      setShown((current) => {
        const next = Math.min(total, current + STREAM_CHARS_PER_TICK);
        if (next >= total) window.clearInterval(timer);
        return next;
      });
    }, STREAM_TICK_MS);
    return () => window.clearInterval(timer);
  }, [total, isEnabled]);
  return isEnabled ? shown : total;
}

function AnswerBody({ turn, shouldStream }: { turn: AssistantTurn; shouldStream: boolean }) {
  const answer = turn.answer;
  const paragraphs = answer?.paragraphs ?? [];
  const joined = paragraphs.join("\n");
  const shown = useStreamedLength(joined.length, shouldStream);
  if (answer === null) return null;

  const isDone = shown >= joined.length;
  let remaining = shown;
  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-col gap-2 text-body text-ink">
        {paragraphs.map((paragraph, index) => {
          const slice = paragraph.slice(0, Math.max(0, remaining));
          remaining -= paragraph.length + 1;
          return slice === "" ? null : <p key={index}>{slice}</p>;
        })}
      </div>
      {isDone ? (
        <>
          {answer.sources.length === 0 ? null : (
            <ul aria-label="Sumber" className="flex flex-col gap-1">
              {answer.sources.map((source) => (
                <li key={source.to}>
                  <Link
                    to={source.to}
                    className="inline-flex items-center gap-1 text-caption font-medium text-primary hover:underline"
                  >
                    <ArrowUpRight className="size-3.5" aria-hidden="true" />
                    {source.label}
                  </Link>
                </li>
              ))}
            </ul>
          )}
          {answer.action === null ? null : (
            <Link to={answer.action.to} className={cn(buttonVariants({ variant: "secondary", size: "sm" }), "w-fit")}>
              {answer.action.label}
            </Link>
          )}
          <p className="text-caption text-mute">Ringkasan otomatis. Periksa sumbernya sebelum mengambil keputusan.</p>
        </>
      ) : null}
    </div>
  );
}

function TurnView({ turn, canStream, onRetry }: { turn: AssistantTurn; canStream: boolean; onRetry: () => void }) {
  // Hanya jawaban yang tiba saat panel terbuka yang diketik bertahap
  const startedLoading = useRef(turn.status === "memuat");
  return (
    <li className="flex flex-col gap-2 border-b border-hairline pb-4 last:border-b-0">
      <p className="text-caption font-medium text-charcoal">{turn.label}</p>
      {turn.status === "memuat" ? (
        <p className="flex items-center gap-2 text-body text-mute" aria-busy="true">
          <LoaderCircle className="size-4 animate-spin" aria-hidden="true" />
          Membaca data project…
        </p>
      ) : null}
      {turn.status === "selesai" ? <AnswerBody turn={turn} shouldStream={startedLoading.current && canStream} /> : null}
      {turn.status === "galat" ? (
        <div role="alert" className="flex flex-col gap-2">
          <p className="flex items-start gap-2 text-body text-danger-text">
            <TriangleAlert className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
            Asisten tidak dapat menjawab sekarang. Data Anda tidak berubah.
          </p>
          <Button size="sm" className="w-fit" onClick={onRetry}>
            <RotateCcw aria-hidden="true" />
            Coba lagi
          </Button>
        </div>
      ) : null}
      {turn.status === "batas" ? (
        <p role="status" className="flex items-start gap-2 text-body text-warning-text">
          <TriangleAlert className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
          Batas {DAILY_LIMIT} pertanyaan hari ini sudah tercapai. Kuota kembali besok pukul 00.00.
        </p>
      ) : null}
    </li>
  );
}

function AssistantPanel() {
  const { isOpen, setOpen, turns, ask, retry, clear, usedToday } = useAssistant();
  const { aiScenario, motion } = useDemo();
  const prefersReduced = useMediaQuery("(prefers-reduced-motion: reduce)");
  const [draft, setDraft] = useState("");
  const endRef = useRef<HTMLDivElement>(null);

  const canStream = motion === "full" || (motion === "system" && !prefersReduced);
  const isLimited = aiScenario === "batas" || usedToday >= DAILY_LIMIT;
  const isBusy = turns.some((turn) => turn.status === "memuat");

  useEffect(() => {
    endRef.current?.scrollIntoView({ block: "end" });
  }, [turns]);

  const submit = (event: FormEvent) => {
    event.preventDefault();
    const text = draft.trim();
    if (text === "" || isBusy) return;
    ask({ kind: "free", text }, text);
    setDraft("");
  };

  return (
    <Sheet open={isOpen} onOpenChange={setOpen} modal={false}>
      <SheetContent
        side="right"
        showOverlay={false}
        onInteractOutside={(event) => event.preventDefault()}
        className="w-[400px] max-w-full"
      >
        <header className="flex items-start justify-between gap-3 border-b border-hairline px-4 py-3">
          <div className="flex flex-col gap-0.5">
            <SheetTitle className="flex items-center gap-2 text-heading-sm font-semibold text-ink">
              <Sparkles className="size-4 text-primary" aria-hidden="true" />
              Asisten Tracer
            </SheetTitle>
            <SheetDescription className="text-caption text-mute">
              Menjawab dari data project ini. Tidak mengubah apa pun tanpa klik Anda.
            </SheetDescription>
          </div>
          <div className="flex items-center">
            {turns.length === 0 ? null : (
              <Button variant="ghost" size="icon" aria-label="Hapus percakapan" onClick={clear}>
                <Trash2 aria-hidden="true" />
              </Button>
            )}
            <SheetClose asChild>
              <Button variant="ghost" size="icon" aria-label="Tutup asisten">
                <X aria-hidden="true" />
              </Button>
            </SheetClose>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto px-4 py-4">
          {turns.length === 0 ? (
            <div className="flex flex-col gap-3">
              <p className="text-body text-charcoal">Pilih pertanyaan atau tulis sendiri.</p>
              <ul className="flex flex-col gap-2">
                {SUGGESTIONS.map((suggestion) => (
                  <li key={suggestion.text}>
                    <Button
                      className="h-auto w-full justify-start whitespace-normal py-2 text-left font-medium"
                      disabled={isLimited}
                      onClick={() => ask({ kind: "free", text: suggestion.text }, suggestion.label)}
                    >
                      {suggestion.label}
                    </Button>
                  </li>
                ))}
              </ul>
            </div>
          ) : (
            <ol role="log" aria-live="polite" className="flex flex-col gap-4">
              {turns.map((turn) => (
                <TurnView key={turn.id} turn={turn} canStream={canStream} onRetry={() => retry(turn.id)} />
              ))}
            </ol>
          )}
          <div ref={endRef} />
        </div>

        <form onSubmit={submit} className="flex flex-col gap-2 border-t border-hairline px-4 py-3">
          <label htmlFor="pertanyaan-asisten" className="sr-only">
            Pertanyaan untuk asisten
          </label>
          <div className="flex gap-2">
            <input
              id="pertanyaan-asisten"
              value={draft}
              maxLength={INPUT_LIMIT}
              disabled={isLimited}
              placeholder={isLimited ? "Batas harian tercapai" : "Tanya soal sesi, funnel, atau masukan"}
              onChange={(event) => setDraft(event.target.value)}
              className="h-[34px] min-w-0 flex-1 rounded-md border border-border-control bg-canvas px-3 text-body text-ink placeholder:text-stone disabled:bg-surface-soft pointer-coarse:h-11"
            />
            <Button type="submit" variant="primary" size="icon" aria-label="Kirim pertanyaan" disabled={isLimited || isBusy || draft.trim() === ""}>
              <Send aria-hidden="true" />
            </Button>
          </div>
          <p className="font-mono text-caption tabular-nums text-mute">
            {isLimited ? DAILY_LIMIT : usedToday} dari {DAILY_LIMIT} pertanyaan hari ini
          </p>
        </form>
      </SheetContent>
    </Sheet>
  );
}

export { AssistantPanel };
