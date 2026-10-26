import { useEffect } from "react";
import type { ReactNode } from "react";
import { buildDocumentTitle } from "@/lib/route-labels";
import { Wordmark } from "@/components/brand/logo";
import { TraceStage } from "@/components/auth/trace-stage";
import { DemoPanel } from "@/components/demo/demo-panel";
import { ThemeToggle } from "@/components/shell/theme-toggle";

// Dua kolom di layar lebar: panggung jejak di kiri, formulir di kanan. Di layar sempit hanya formulir.
function AuthLayout({ children }: { children: ReactNode }) {
  useEffect(() => {
    document.title = buildDocumentTitle("/login", null);
  }, []);

  return (
    <div className="grid min-h-svh bg-canvas lg:grid-cols-[minmax(0,5fr)_minmax(0,6fr)]">
      <aside className="hidden border-r border-hairline bg-paper lg:block">
        <TraceStage />
      </aside>

      <div className="flex min-w-0 flex-col">
        <header className="flex h-[52px] items-center justify-between px-4 lg:px-8">
          <Wordmark />
          <ThemeToggle />
        </header>
        <main id="konten-utama" className="flex flex-1 items-center justify-center px-4 py-8 lg:px-8">
          <div className="flex w-full max-w-sm flex-col gap-6">{children}</div>
        </main>
        <footer className="px-4 py-4 text-caption text-mute lg:px-8">Tracer · rekaman sesi, peta klik, peta gulir</footer>
      </div>
      <DemoPanel />
    </div>
  );
}

export { AuthLayout };
