import { useState } from "react";
import { Eye, FolderX } from "lucide-react";
import { Link, Outlet, useMatch } from "react-router";
import { DemoPanel } from "@/components/demo/demo-panel";
import { SidebarContent } from "@/components/shell/sidebar";
import { Topbar } from "@/components/shell/topbar";
import { buttonVariants } from "@/components/ui/button";
import { Sheet, SheetContent, SheetDescription, SheetTitle } from "@/components/ui/sheet";
import { useDocumentTitle } from "@/hooks/use-document-title";
import { cn } from "@/lib/utils";
import { useAuth } from "@/state/auth-context";
import { AssistantPanel } from "@/components/assistant/assistant-panel";
import { AssistantProvider } from "@/state/assistant-context";
import { LiveProvider } from "@/state/live-context";
import { useDemo } from "@/state/demo-context";
import { useActiveProject } from "@/state/use-active-project";

function AdminViewBanner() {
  return (
    <p
      role="note"
      className="flex items-start gap-2 rounded-lg border border-hairline bg-warning-bg p-3 text-body text-warning-text"
    >
      <Eye className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
      Anda melihat project ini sebagai admin. Perubahan hanya dapat dilakukan oleh pemilik project.
    </p>
  );
}

function ProjectNotFound() {
  const { projects } = useAuth();
  const first = projects[0];
  return (
    <section
      aria-label="Project tidak ditemukan"
      className="flex flex-col items-center gap-2 rounded-lg border border-hairline bg-canvas px-6 py-14 text-center"
    >
      <FolderX className="size-5 text-stone" aria-hidden="true" />
      <p className="text-heading-sm font-semibold text-ink">Project tidak ditemukan</p>
      <p className="max-w-sm text-body text-mute">Project ini tidak ada atau Anda tidak punya akses ke sana.</p>
      <Link
        to={first === undefined ? "/" : `/p/${first.id}`}
        className={cn(buttonVariants({ variant: "secondary" }), "mt-2")}
      >
        Kembali ke beranda
      </Link>
    </section>
  );
}

function AppShell() {
  const { sidebarCollapsed, role } = useDemo();
  const { project } = useActiveProject();
  const isProjectRoute = useMatch("/p/:projectId/*") !== null;
  const [isDrawerOpen, setDrawerOpen] = useState(false);
  useDocumentTitle();

  return (
    <LiveProvider>
    <AssistantProvider>
    <div className="flex min-h-svh lg:h-svh lg:overflow-hidden">
      <a
        href="#konten-utama"
        className="sr-only focus:not-sr-only focus:fixed focus:left-3 focus:top-3 focus:z-50 focus:rounded-md focus:bg-canvas focus:px-3 focus:py-2 focus:text-body focus:shadow-overlay"
      >
        Lewati ke konten
      </a>

      <aside
        className={cn(
          "hidden shrink-0 border-r border-hairline bg-paper lg:block",
          sidebarCollapsed ? "w-14" : "w-60",
        )}
      >
        <SidebarContent collapsed={sidebarCollapsed} />
      </aside>

      <Sheet open={isDrawerOpen} onOpenChange={setDrawerOpen}>
        <SheetContent side="left" className="w-[280px] max-w-[85vw] bg-paper lg:hidden">
          <SheetTitle className="sr-only">Navigasi utama</SheetTitle>
          <SheetDescription className="sr-only">Pilih halaman atau ganti project.</SheetDescription>
          <SidebarContent collapsed={false} onNavigate={() => setDrawerOpen(false)} />
        </SheetContent>
      </Sheet>

      <div className="flex min-w-0 flex-1 flex-col">
        <Topbar onOpenDrawer={() => setDrawerOpen(true)} />
        <main
          id="konten-utama"
          tabIndex={-1}
          className="flex-1 px-4 py-6 outline-none lg:min-h-0 lg:overflow-y-auto lg:px-8"
        >
          <div className="mx-auto flex max-w-[1440px] flex-col gap-4">
            {isProjectRoute && project === null ? (
              <ProjectNotFound />
            ) : (
              <>
                {isProjectRoute && role === "admin" ? <AdminViewBanner /> : null}
                <Outlet />
              </>
            )}
          </div>
        </main>
      </div>
      <AssistantPanel />
      <DemoPanel />
    </div>
    </AssistantProvider>
    </LiveProvider>
  );
}

export { AppShell };
