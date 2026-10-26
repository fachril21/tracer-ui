import { useEffect, useRef, useState } from "react";
import { TriangleAlert } from "lucide-react";
import { Link } from "react-router";
import { Button, buttonVariants } from "@/components/ui/button";
import { CodeBlock } from "@/components/ui/code-block";
import { Panel } from "@/components/ui/panel";
import { cn } from "@/lib/utils";

// Aksi yang jarang dan penting diberi jeda minimum supaya prosesnya terlihat
const CHECK_MIN_MS = 1200;

type CheckState = "idle" | "checking" | "not-found";

const STEPS = [
  "Salin snippet dan tempel sebelum penutup body di setiap halaman.",
  "Daftarkan origin website agar boleh memulai sesi.",
  "Periksa pemasangan setelah halaman website dimuat ulang.",
] as const;

function InstallationWaiting({ projectId, siteUrl }: { projectId: string; siteUrl: string }) {
  const [check, setCheck] = useState<CheckState>("idle");
  const timerRef = useRef<number | null>(null);

  useEffect(
    () => () => {
      if (timerRef.current !== null) window.clearTimeout(timerRef.current);
    },
    [],
  );

  const handleCheck = () => {
    if (check === "checking") return;
    setCheck("checking");
    timerRef.current = window.setTimeout(() => setCheck("not-found"), CHECK_MIN_MS);
  };

  const snippet = `<script async src="https://tracer.example/sdk/v1/tracer.js" data-project-key="pk_demo_8f3a21c9"></script>`;

  return (
    <Panel title="Pasang Tracer di website Anda" meta={siteUrl}>
      <p className="max-w-prose text-body text-mute">
        Belum ada sesi yang masuk. Ikhtisar akan terisi begitu website mulai mengirim data.
      </p>

      <ol className="flex flex-col gap-3">
        {STEPS.map((step, index) => (
          <li key={step} className="flex items-start gap-3">
            <span
              aria-hidden="true"
              className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-xs border border-border-control font-mono text-caption text-charcoal"
            >
              {index + 1}
            </span>
            <span className="text-body text-charcoal">{step}</span>
          </li>
        ))}
      </ol>

      <CodeBlock label="snippet pemasangan" text={snippet} />

      <div className="flex flex-wrap items-center gap-3">
        <Button variant="primary" onClick={handleCheck} disabled={check === "checking"} aria-busy={check === "checking"}>
          {check === "checking" ? "Memeriksa pemasangan…" : "Periksa pemasangan"}
        </Button>
        <Link to={`/p/${projectId}/installation`} className={cn(buttonVariants({ variant: "secondary" }))}>
          Buka panduan lengkap
        </Link>
      </div>

      <div role="status" aria-live="polite" className="min-h-5">
        {check === "checking" ? (
          <div className="flex flex-col gap-2">
            <p className="text-caption text-mute">Menghubungi server dan mencari sesi dari {siteUrl}…</p>
            <div className="h-1 overflow-hidden rounded-xs bg-surface-active">
              <div className="animate-skeleton h-full w-1/3 rounded-xs bg-primary" />
            </div>
          </div>
        ) : null}
        {check === "not-found" ? (
          <p className="flex items-start gap-2 text-body text-warning-text">
            <TriangleAlert className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
            Belum ada sesi dari website Anda. Pastikan snippet terpasang dan origin cocok persis (skema, host, dan
            port).
          </p>
        ) : null}
      </div>
    </Panel>
  );
}

export { InstallationWaiting };
