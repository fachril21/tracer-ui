import { useId, useState } from "react";
import type { FormEvent } from "react";
import { Check, MessageSquareText, Star, X } from "lucide-react";
import { ToggleGroup } from "radix-ui";
import { Button } from "@/components/ui/button";
import { KIND_LABEL } from "@/mock/feedback";
import type { FeedbackKind } from "@/mock/feedback";
import type { NewFeedback, WidgetConfig } from "@/state/use-feedback";
import { cn } from "@/lib/utils";

const RATINGS = [1, 2, 3, 4, 5] as const;
const MESSAGE_LIMIT = 500;

type FeedbackWidgetProps = {
  config: WidgetConfig;
  onSubmit: (input: NewFeedback) => void;
  // Panel mulai terbuka, dipakai pratinjau agar langsung terlihat
  isInitiallyOpen?: boolean;
};

// Widget yang tampil di website pelanggan: tab kecil di pinggir layar, membuka panel masukan
function FeedbackWidget({ config, onSubmit, isInitiallyOpen = false }: FeedbackWidgetProps) {
  const fieldId = useId();
  const [isOpen, setOpen] = useState(isInitiallyOpen);
  const [isSent, setSent] = useState(false);
  const [kind, setKind] = useState<FeedbackKind>(config.kinds[0] ?? "masalah");
  const [rating, setRating] = useState(0);
  const [message, setMessage] = useState("");
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);

  const side = config.position === "kanan" ? "right-0" : "left-0";
  const kinds = config.kinds.length === 0 ? (["saran"] as FeedbackKind[]) : config.kinds;

  const close = () => {
    setOpen(false);
    // Setelah terkirim, buka lagi sebagai formulir kosong
    if (isSent) {
      setSent(false);
      setRating(0);
      setMessage("");
      setEmail("");
    }
  };

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    if (rating === 0) return setError("Pilih nilai dari 1 sampai 5.");
    if (message.trim().length < 3) return setError("Tuliskan sedikit masukan Anda.");
    setError(null);
    onSubmit({ kind, rating, message: message.trim(), email: email.trim() === "" ? null : email.trim() });
    setSent(true);
  };

  if (!config.isEnabled) return null;

  return (
    <>
      {isOpen ? null : (
        <button
          type="button"
          onClick={() => setOpen(true)}
          aria-haspopup="dialog"
          className={cn(
            "absolute top-1/2 z-10 flex -translate-y-1/2 items-center gap-1.5 bg-primary px-2 py-3 text-caption font-medium text-on-primary transition-[padding] duration-[var(--motion-fast)] hover:px-3 focus-visible:px-3",
            side,
            config.position === "kanan" ? "rounded-l-sm" : "rounded-r-sm",
          )}
          style={{ writingMode: "vertical-rl" }}
        >
          <MessageSquareText className="size-3.5 rotate-90" aria-hidden="true" />
          {config.tabLabel}
        </button>
      )}

      {isOpen ? (
        <div
          role="dialog"
          aria-label="Kirim masukan"
          className={cn(
            "absolute bottom-3 z-20 flex w-[min(20rem,calc(100%-1.5rem))] flex-col gap-3 rounded-lg border border-hairline bg-canvas p-4 shadow-overlay animate-[pop-in_var(--motion-base)_var(--ease-out)]",
            config.position === "kanan" ? "right-3" : "left-3",
          )}
        >
          <header className="flex items-start justify-between gap-2">
            <p className="text-body font-semibold text-ink">{isSent ? "Terima kasih" : config.title}</p>
            <button
              type="button"
              onClick={close}
              aria-label="Tutup panel masukan"
              className="-mr-1 -mt-1 flex size-7 items-center justify-center rounded-md text-mute hover:bg-surface-hover hover:text-ink pointer-coarse:size-10"
            >
              <X className="size-4" aria-hidden="true" />
            </button>
          </header>

          {isSent ? (
            <div role="status" className="flex flex-col gap-3">
              <p className="flex items-start gap-2 text-body text-charcoal">
                <Check className="mt-0.5 size-4 shrink-0 text-success-text" aria-hidden="true" />
                Masukan Anda sudah kami terima. Tim akan membacanya.
              </p>
              <Button variant="secondary" size="sm" onClick={close}>
                Tutup
              </Button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-3">
              {kinds.length > 1 ? (
                <ToggleGroup.Root
                  type="single"
                  value={kind}
                  aria-label="Jenis masukan"
                  onValueChange={(next) => {
                    const match = kinds.find((item) => item === next);
                    if (match !== undefined) setKind(match);
                  }}
                  className="grid gap-1"
                  style={{ gridTemplateColumns: `repeat(${kinds.length}, minmax(0, 1fr))` }}
                >
                  {kinds.map((item) => (
                    <ToggleGroup.Item
                      key={item}
                      value={item}
                      className="h-8 rounded-sm bg-surface-soft text-caption font-medium text-charcoal transition-colors duration-[var(--motion-fast)] hover:bg-surface-hover data-[state=on]:bg-primary-soft data-[state=on]:text-primary-pressed pointer-coarse:h-10"
                    >
                      {KIND_LABEL[item]}
                    </ToggleGroup.Item>
                  ))}
                </ToggleGroup.Root>
              ) : null}

              <div className="flex flex-col gap-1.5">
                <span id={`${fieldId}-nilai`} className="text-caption font-medium text-charcoal">
                  Seberapa puas Anda?
                </span>
                <ToggleGroup.Root
                  type="single"
                  value={rating === 0 ? "" : String(rating)}
                  aria-labelledby={`${fieldId}-nilai`}
                  onValueChange={(next) => setRating(next === "" ? rating : Number(next))}
                  className="flex gap-1"
                >
                  {RATINGS.map((value) => (
                    <ToggleGroup.Item
                      key={value}
                      value={String(value)}
                      aria-label={`${value} dari 5`}
                      className="flex size-9 items-center justify-center rounded-sm text-stone hover:bg-surface-hover pointer-coarse:size-11"
                    >
                      <Star
                        className={cn("size-5", value <= rating ? "fill-warning-text text-warning-text" : "text-border-control")}
                        aria-hidden="true"
                      />
                    </ToggleGroup.Item>
                  ))}
                </ToggleGroup.Root>
              </div>

              <div className="flex flex-col gap-1.5">
                <label htmlFor={`${fieldId}-pesan`} className="text-caption font-medium text-charcoal">
                  Ceritakan
                </label>
                <textarea
                  id={`${fieldId}-pesan`}
                  value={message}
                  maxLength={MESSAGE_LIMIT}
                  rows={3}
                  onChange={(event) => setMessage(event.target.value)}
                  className="w-full resize-none rounded-md border border-border-control bg-canvas px-3 py-2 text-body text-ink placeholder:text-stone"
                />
                <p className="text-right font-mono text-caption tabular-nums text-mute">
                  {message.length}/{MESSAGE_LIMIT}
                </p>
              </div>

              {config.askEmail ? (
                <div className="flex flex-col gap-1.5">
                  <label htmlFor={`${fieldId}-surel`} className="text-caption font-medium text-charcoal">
                    Email (opsional)
                  </label>
                  <input
                    id={`${fieldId}-surel`}
                    type="email"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    className="h-[34px] w-full rounded-md border border-border-control bg-canvas px-3 text-body text-ink"
                  />
                </div>
              ) : null}

              {error === null ? null : (
                <p role="alert" className="text-caption text-danger-text">
                  {error}
                </p>
              )}
              <Button type="submit" variant="primary">Kirim masukan</Button>
            </form>
          )}
        </div>
      ) : null}
    </>
  );
}

export { FeedbackWidget };
