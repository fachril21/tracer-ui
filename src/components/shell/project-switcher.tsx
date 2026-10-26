import { useState } from "react";
import { Check, ChevronsUpDown, MailOpen, Plus } from "lucide-react";
import { useNavigate } from "react-router";
import { CreateProjectDialog } from "@/components/project/create-project-dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { MockProject } from "@/mock/types";
import { useAuth } from "@/state/auth-context";
import { cn } from "@/lib/utils";

function Monogram({ project }: { project: MockProject | null }) {
  const initial = (project?.name ?? "?").slice(0, 1).toUpperCase();
  return (
    <span
      aria-hidden="true"
      className="flex size-8 shrink-0 items-center justify-center rounded-sm bg-ink text-body font-semibold text-paper"
    >
      {initial}
    </span>
  );
}

type ProjectSwitcherProps = {
  project: MockProject | null;
  collapsed: boolean;
  onNavigate?: () => void;
};

function ProjectSwitcher({ project, collapsed, onNavigate }: ProjectSwitcherProps) {
  const navigate = useNavigate();
  const { projects, invitations, canCreateProject } = useAuth();
  const [isCreateOpen, setCreateOpen] = useState(false);

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger
          aria-label={project === null ? "Pilih project" : `Project aktif: ${project.name}. Ganti project`}
          className={cn(
            "flex w-full items-center gap-2.5 rounded-md p-1.5 text-left transition-colors duration-[var(--motion-fast)] hover:bg-surface-hover",
            collapsed && "justify-center",
          )}
        >
          <Monogram project={project} />
          {collapsed ? null : (
            <>
              <span className="flex min-w-0 flex-1 flex-col">
                <span className="truncate text-body font-semibold text-ink">
                  {project?.name ?? "Pilih project"}
                </span>
                <span className="truncate font-mono text-caption text-mute">{project?.siteUrl ?? "-"}</span>
              </span>
              <ChevronsUpDown className="size-4 shrink-0 text-stone" aria-hidden="true" />
            </>
          )}
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="w-64">
          <DropdownMenuLabel>Project</DropdownMenuLabel>
          {projects.length === 0 ? <p className="px-2 py-1.5 text-caption text-mute">Belum ada project.</p> : null}
          {projects.map((item) => (
            <DropdownMenuItem
              key={item.id}
              onSelect={() => {
                navigate(`/p/${item.id}`);
                onNavigate?.();
              }}
            >
              <Monogram project={item} />
              <span className="flex min-w-0 flex-1 flex-col">
                <span className="truncate font-medium">{item.name}</span>
                <span className="truncate font-mono text-caption text-mute">{item.siteUrl}</span>
              </span>
              {item.id === project?.id ? <Check className="!text-primary" aria-label="Project aktif" /> : null}
            </DropdownMenuItem>
          ))}
          <DropdownMenuSeparator />
          {invitations.length === 0 ? null : (
            <DropdownMenuItem
              onSelect={() => {
                navigate("/undangan");
                onNavigate?.();
              }}
            >
              <MailOpen aria-hidden="true" />
              <span className="flex-1">Undangan</span>
              <span className="font-mono text-caption text-primary-pressed">{invitations.length}</span>
            </DropdownMenuItem>
          )}
          <DropdownMenuItem onSelect={() => setCreateOpen(true)}>
            <Plus aria-hidden="true" />
            <span className="flex-1">Buat project baru</span>
            {canCreateProject ? null : <span className="text-caption text-mute">Batas penuh</span>}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      <CreateProjectDialog
        isOpen={isCreateOpen}
        onOpenChange={(open) => {
          setCreateOpen(open);
          if (!open) onNavigate?.();
        }}
      />
    </>
  );
}

export { ProjectSwitcher };
