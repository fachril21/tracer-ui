import { useEffect, useRef, useState } from "react";
import type { ReactNode } from "react";
import { CheckCircle2, Clock, TriangleAlert } from "lucide-react";
import { OriginEditor } from "@/components/project/origin-editor";
import { Button } from "@/components/ui/button";
import { CodeBlock } from "@/components/ui/code-block";
import { Segmented } from "@/components/ui/segmented";
import { StatusBadge } from "@/components/ui/status-badge";
import { useDemo } from "@/state/demo-context";
import { useActiveProject } from "@/state/use-active-project";
import { useProjectConfig } from "@/state/use-project-config";
import { cn } from "@/lib/utils";

// Aksi yang jarang dan penting diberi jeda minimum supaya prosesnya terlihat
const CHECK_MIN_MS = 1200;

type Framework = "html" | "react" | "vue" | "tag-manager";
type CheckState = "idle" | "checking" | "found" | "not-found" | "no-origin";

const FRAMEWORK_OPTIONS: { value: Framework; label: string }[] = [
  { value: "html", label: "HTML biasa" },
  { value: "react", label: "React / Next.js" },
  { value: "vue", label: "Vue / Nuxt" },
  { value: "tag-manager", label: "Tag Manager" },
];

const FRAMEWORK_HINT: Record<Framework, string> = {
  html: "Tempel sebelum penutup </body> di setiap halaman, atau di templat utama.",
  react: "Taruh di komponen akar yang dimuat sekali, misalnya layout utama. Skrip hanya dimuat di peramban.",
  vue: "Taruh di app.vue atau plugin sisi klien supaya hanya jalan di peramban.",
  "tag-manager": "Buat tag HTML Kustom dengan pemicu All Pages, lalu tempel snippet di bawah.",
};

function snippetFor(framework: Framework, projectKey: string): string {
  const src = "https://tracer.example/sdk/v1/tracer.js";
  switch (framework) {
    case "html":
    case "tag-manager":
      return `<script async src="${src}" data-project-key="${projectKey}"></script>`;
    case "react":
      return `import { useEffect } from "react";\n\nexport function TracerScript() {\n  useEffect(() => {\n    const script = document.createElement("script");\n    script.async = true;\n    script.src = "${src}";\n    script.dataset.projectKey = "${projectKey}";\n    document.body.appendChild(script);\n    return () => script.remove();\n  }, []);\n  return null;\n}`;
    case "vue":
      return `import { onMounted } from "vue";\n\nonMounted(() => {\n  const script = document.createElement("script");\n  script.async = true;\n  script.src = "${src}";\n  script.dataset.projectKey = "${projectKey}";\n  document.body.appendChild(script);\n});`;
  }
}

type StepProps = {
  number: number;
  title: string;
  isDone: boolean;
  children: ReactNode;
};

// Garis jejak vertikal menghubungkan langkah. Langkah selesai diberi tanda centang, bukan hanya warna.
function Step({ number, title, isDone, children }: StepProps) {
  return (
    <li className="relative flex gap-4 pb-8 last:pb-0">
      <span aria-hidden="true" className="absolute bottom-0 left-[11px] top-7 w-px bg-border-control last:hidden" />
      <span
        className={cn(
          "z-10 flex size-6 shrink-0 items-center justify-center rounded-xs border font-mono text-caption",
          isDone ? "border-success-text bg-success-bg text-success-text" : "border-border-control bg-canvas text-charcoal",
        )}
      >
        {isDone ? <CheckCircle2 className="size-3.5" aria-hidden="true" /> : number}
      </span>
      <div className="flex min-w-0 flex-1 flex-col gap-3">
        <h2 className="text-heading-md font-semibold text-ink">
          {title}
          {isDone ? <span className="sr-only"> (selesai)</span> : null}
        </h2>
        {children}
      </div>
    </li>
  );
}

function CheckResult({ state, siteUrl }: { state: CheckState; siteUrl: string }) {
  return (
    <div role="status" aria-live="polite" className="min-h-5">
      {state === "checking" ? (
        <div className="flex flex-col gap-2">
          <p className="text-caption text-mute">Menghubungi server dan mencari sesi dari {siteUrl}…</p>
          <div className="h-1 overflow-hidden rounded-xs bg-surface-active">
            <div className="animate-skeleton h-full w-1/3 rounded-xs bg-primary" />
          </div>
        </div>
      ) : null}
      {state === "found" ? (
        <p className="flex items-start gap-2 text-body text-success-text">
          <CheckCircle2 className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
          Sesi pertama dari {siteUrl} sudah masuk. Ikhtisar akan terisi dalam beberapa menit.
        </p>
      ) : null}
      {state === "not-found" ? (
        <p className="flex items-start gap-2 text-body text-warning-text">
          <TriangleAlert className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
          Belum ada sesi dari website Anda. Muat ulang halaman website setelah snippet terpasang, lalu periksa lagi.
          Jika tetap kosong, pastikan origin cocok persis.
        </p>
      ) : null}
      {state === "no-origin" ? (
        <p className="flex items-start gap-2 text-body text-warning-text">
          <TriangleAlert className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
          Belum ada origin terdaftar, jadi sesi dari website akan ditolak. Selesaikan langkah 2 dahulu.
        </p>
      ) : null}
    </div>
  );
}

function InstallationPage() {
  const { role } = useDemo();
  const { project, installation } = useActiveProject();
  const { config, update } = useProjectConfig(project?.id ?? "");
  const [framework, setFramework] = useState<Framework>("html");
  const [check, setCheck] = useState<CheckState>("idle");
  const timerRef = useRef<number | null>(null);

  useEffect(
    () => () => {
      if (timerRef.current !== null) window.clearTimeout(timerRef.current);
    },
    [],
  );

  if (project === null) return null;

  const canEdit = role === "pemilik";
  const isDetected = installation === "detected";
  const hasOrigin = config.origins.length > 0;
  const siteUrl = config.origins[0] ?? "website Anda";
  const projectKey = `pk_${project.id.replace(/-/g, "_")}_8f3a21`;

  const handleCheck = () => {
    if (check === "checking") return;
    setCheck("checking");
    timerRef.current = window.setTimeout(() => {
      if (!hasOrigin) setCheck("no-origin");
      else setCheck(isDetected ? "found" : "not-found");
    }, CHECK_MIN_MS);
  };

  const isVerified = isDetected || check === "found";

  return (
    <div className="flex max-w-3xl flex-col gap-6">
      <header className="flex flex-col gap-2">
        <div className="flex flex-wrap items-center gap-3">
          <h1 className="text-page-title font-semibold text-ink">Pemasangan</h1>
          {isVerified ? (
            <StatusBadge kind="success" icon={CheckCircle2}>
              Terpasang
            </StatusBadge>
          ) : (
            <StatusBadge kind="warning" icon={Clock}>
              Menunggu sesi pertama
            </StatusBadge>
          )}
        </div>
        <p className="font-mono text-caption text-mute">{project.name}</p>
        <p className="max-w-prose text-body text-mute">
          Tiga langkah singkat. Setelah selesai, sesi dari website mulai muncul di Ikhtisar dan Histori Sesi.
        </p>
      </header>

      <ol className="flex flex-col">
        <Step number={1} title="Tempel snippet di website" isDone={isVerified}>
          <Segmented label="Jenis website" value={framework} options={FRAMEWORK_OPTIONS} onChange={setFramework} />
          <p className="max-w-prose text-body text-mute">{FRAMEWORK_HINT[framework]}</p>
          <CodeBlock label={`snippet pemasangan ${FRAMEWORK_OPTIONS.find((item) => item.value === framework)?.label ?? ""}`} text={snippetFor(framework, projectKey)} />
        </Step>

        <Step number={2} title="Daftarkan origin website" isDone={hasOrigin}>
          <p className="max-w-prose text-body text-mute">
            Hanya website dengan origin terdaftar yang boleh memulai sesi. Daftarkan versi dengan dan tanpa www jika
            keduanya dipakai.
          </p>
          <OriginEditor
            label="Origin sesi terdaftar"
            origins={config.origins}
            onChange={(origins) => update({ origins })}
            canEdit={canEdit}
            emptyText={canEdit ? "Belum ada origin. Tambahkan origin website Anda di bawah." : "Belum ada origin. Minta pemilik project menambahkannya."}
          />
        </Step>

        <Step number={3} title="Periksa pemasangan" isDone={isVerified}>
          <p className="max-w-prose text-body text-mute">
            Muat ulang halaman website Anda, lalu periksa. Pemeriksaan mencari sesi masuk dari origin terdaftar.
          </p>
          <div>
            <Button variant="primary" onClick={handleCheck} disabled={check === "checking"} aria-busy={check === "checking"}>
              {check === "checking" ? "Memeriksa pemasangan…" : "Periksa pemasangan"}
            </Button>
          </div>
          <CheckResult state={check} siteUrl={siteUrl} />
        </Step>
      </ol>
    </div>
  );
}

export { InstallationPage };
