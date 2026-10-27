import { Fragment, useEffect } from "react";
import { CircleCheck, Clock, Menu, PanelLeft, Sparkles } from "lucide-react";
import { Link, useLocation } from "react-router";
import { AccountMenu } from "@/components/shell/account-menu";
import { ThemeToggle } from "@/components/shell/theme-toggle";
import { Button } from "@/components/ui/button";
import { Istilah } from "@/components/ui/istilah";
import { StatusBadge } from "@/components/ui/status-badge";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { useAssistant } from "@/state/assistant-context";
import { useDemo } from "@/state/demo-context";
import { SECTION_LABELS } from "@/lib/route-labels";
import { useActiveProject } from "@/state/use-active-project";

type Crumb = { label: string; to?: string };

function buildCrumbs(pathname: string, projectName: string | null, projectPath: string | null): Crumb[] {
  const segments = pathname.split("/").filter((segment) => segment !== "");
  if (pathname.startsWith("/admin/projects")) return [{ label: "Semua project" }];
  if (pathname.startsWith("/allowlist")) return [{ label: "Allowlist Email" }];
  if (pathname.startsWith("/undangan")) return [{ label: "Undangan project" }];
  if (projectName === null || projectPath === null) return [];
  // /p/:projectId/<bagian>
  const section = segments[2];
  if (section === undefined) return [{ label: projectName }, { label: "Ikhtisar" }];
  return [{ label: projectName, to: projectPath }, { label: SECTION_LABELS[section] ?? section }];
}

type TopbarProps = {
  onOpenDrawer: () => void;
};

function Topbar({ onOpenDrawer }: TopbarProps) {
  const location = useLocation();
  const { sidebarCollapsed, setSidebarCollapsed } = useDemo();
  const { project, installation } = useActiveProject();
  const { isOpen: isAssistantOpen, setOpen: setAssistantOpen } = useAssistant();
  const hasProject = project !== null;

  useEffect(() => {
    if (!hasProject) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setAssistantOpen(!isAssistantOpen);
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [hasProject, isAssistantOpen, setAssistantOpen]);

  const projectPath = project === null ? null : `/p/${project.id}`;
  const crumbs = buildCrumbs(location.pathname, project?.name ?? null, projectPath);

  return (
    <header className="sticky top-0 z-30 flex h-[52px] shrink-0 items-center gap-2 border-b border-hairline bg-canvas px-4 lg:px-6">
      <Button variant="ghost" size="icon" className="lg:hidden" onClick={onOpenDrawer} aria-label="Buka navigasi">
        <Menu />
      </Button>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="hidden lg:inline-flex"
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            aria-label={sidebarCollapsed ? "Perluas sidebar" : "Lipat sidebar"}
            aria-pressed={sidebarCollapsed}
          >
            <PanelLeft />
          </Button>
        </TooltipTrigger>
        <TooltipContent>{sidebarCollapsed ? "Perluas sidebar" : "Lipat sidebar"}</TooltipContent>
      </Tooltip>

      <nav aria-label="Jejak navigasi" className="min-w-0 flex-1">
        <ol className="flex items-center gap-1.5 text-body text-mute">
          <li className="hidden font-mono text-caption uppercase tracking-[0.06em] text-stone sm:block">Tracer</li>
          {crumbs.map((crumb, index) => {
            const isLast = index === crumbs.length - 1;
            return (
              <Fragment key={crumb.label}>
                <li aria-hidden="true" className="hidden text-faint sm:block">
                  /
                </li>
                <li className={isLast ? "truncate font-semibold text-ink" : "hidden truncate sm:block"}>
                  {crumb.to === undefined || isLast ? (
                    <span aria-current={isLast ? "page" : undefined}>{crumb.label}</span>
                  ) : (
                    <Link to={crumb.to} className="hover:text-ink hover:underline">
                      {crumb.label}
                    </Link>
                  )}
                </li>
              </Fragment>
            );
          })}
        </ol>
      </nav>

      {project === null ? null : installation === "detected" ? (
        <>
          <StatusBadge kind="success" icon={CircleCheck} className="sm:hidden">
            Terpasang
          </StatusBadge>
          <Istilah term="terdeteksi" className="hidden sm:inline-flex">
            <StatusBadge kind="success" icon={CircleCheck}>
              Pemasangan terdeteksi
            </StatusBadge>
          </Istilah>
        </>
      ) : (
        <>
          <StatusBadge kind="warning" icon={Clock} className="sm:hidden">
            Menunggu
          </StatusBadge>
          <StatusBadge kind="warning" icon={Clock} className="hidden sm:inline-flex">
            Menunggu pemasangan
          </StatusBadge>
        </>
      )}
      {project === null ? null : (
        <Button variant="secondary" size="sm" onClick={() => setAssistantOpen(!isAssistantOpen)} aria-expanded={isAssistantOpen} aria-keyshortcuts="Control+K">
          <Sparkles aria-hidden="true" />
          <span className="hidden sm:inline">Tanya</span>
          <span className="sr-only sm:hidden">Tanya asisten</span>
        </Button>
      )}
      <ThemeToggle />
      <AccountMenu />
    </header>
  );
}

export { Topbar };
