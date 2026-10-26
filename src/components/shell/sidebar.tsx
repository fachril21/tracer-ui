import { Link, NavLink } from "react-router";
import type { LucideIcon } from "lucide-react";
import { Wordmark } from "@/components/brand/logo";
import { ProjectSwitcher } from "@/components/shell/project-switcher";
import { ADMIN_ITEMS, PROJECT_FOOTER_ITEMS, PROJECT_GROUPS } from "@/components/shell/nav-config";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { useDemo } from "@/state/demo-context";
import { useActiveProject } from "@/state/use-active-project";
import type { InstallationStatus } from "@/mock/types";

type EntryProps = {
  to: string;
  label: string;
  icon: LucideIcon;
  collapsed: boolean;
  end?: boolean;
  installation?: InstallationStatus;
  onNavigate?: () => void;
};

function NavEntry({ to, label, icon: Icon, collapsed, end, installation, onNavigate }: EntryProps) {
  const link = (
    <NavLink
      to={to}
      end={end}
      onClick={onNavigate}
      className={({ isActive }) =>
        cn(
          "relative flex h-[34px] w-full items-center gap-3 rounded-md px-3 text-body transition-colors duration-[var(--motion-fast)]",
          collapsed && "justify-center px-0",
          isActive
            ? "bg-surface-active font-semibold text-ink before:absolute before:inset-y-1.5 before:left-0 before:w-0.5 before:rounded-full before:bg-primary"
            : "text-charcoal hover:bg-surface-hover hover:text-ink",
        )
      }
    >
      {({ isActive }) => (
        <>
          <Icon
            className={cn("size-[18px] shrink-0", isActive ? "text-ink" : "text-stone")}
            aria-hidden="true"
          />
          {collapsed ? <span className="sr-only">{label}</span> : <span className="flex-1 truncate">{label}</span>}
          {installation === undefined ? null : (
            <span
              role="img"
              aria-label={installation === "detected" ? "Pemasangan terdeteksi" : "Menunggu pemasangan"}
              className={cn(
                "size-2 shrink-0 rounded-xs",
                installation === "detected" ? "bg-success-solid" : "animate-pulse-dot bg-warning-solid",
                collapsed && "absolute right-2 top-2",
              )}
            />
          )}
        </>
      )}
    </NavLink>
  );

  if (!collapsed) return link;
  return (
    <Tooltip>
      <TooltipTrigger asChild>{link}</TooltipTrigger>
      <TooltipContent side="right">{label}</TooltipContent>
    </Tooltip>
  );
}

function GroupLabel({ children, collapsed }: { children: string; collapsed: boolean }) {
  if (collapsed) return <div aria-hidden="true" className="mx-3 mb-1 h-px bg-hairline" />;
  return (
    <p className="px-3 pb-1 font-mono text-label uppercase tracking-[0.06em] text-stone">{children}</p>
  );
}

type SidebarContentProps = {
  collapsed: boolean;
  onNavigate?: () => void;
};

function SidebarContent({ collapsed, onNavigate }: SidebarContentProps) {
  const { role } = useDemo();
  const { project, installation } = useActiveProject();
  const base = project === null ? null : `/p/${project.id}`;

  return (
    <nav aria-label="Navigasi utama" className="flex h-full flex-col gap-5 overflow-y-auto p-3">
      <Link to="/" onClick={onNavigate} aria-label="Tracer, ke beranda" className={cn("rounded-md px-1.5 py-1 hover:bg-surface-hover", collapsed && "flex justify-center")}>
        <Wordmark isMarkOnly={collapsed} />
      </Link>
      <ProjectSwitcher project={project} collapsed={collapsed} onNavigate={onNavigate} />

      {base === null
        ? null
        : PROJECT_GROUPS.map((group) => (
            <section key={group.id} aria-label={group.label ?? "Ringkasan"}>
              {group.label === null ? null : <GroupLabel collapsed={collapsed}>{group.label}</GroupLabel>}
              <ul className="flex flex-col gap-0.5">
                {group.items.map((item) => (
                  <li key={item.id}>
                    <NavEntry
                      to={`${base}${item.path}`}
                      end={item.path === ""}
                      label={item.label}
                      icon={item.icon}
                      collapsed={collapsed}
                      onNavigate={onNavigate}
                    />
                  </li>
                ))}
              </ul>
            </section>
          ))}

      <div className="mt-auto flex flex-col gap-5">
        {base === null ? null : (
          <section aria-label="Project">
            <ul className="flex flex-col gap-0.5">
              {PROJECT_FOOTER_ITEMS.map((item) => (
                <li key={item.id}>
                  <NavEntry
                    to={`${base}${item.path}`}
                    label={item.label}
                    icon={item.icon}
                    collapsed={collapsed}
                    installation={item.indicator === "installation" ? installation : undefined}
                    onNavigate={onNavigate}
                  />
                </li>
              ))}
            </ul>
          </section>
        )}

        {role === "admin" ? (
          <section aria-label="Admin">
            <GroupLabel collapsed={collapsed}>Admin</GroupLabel>
            <ul className="flex flex-col gap-0.5">
              {ADMIN_ITEMS.map((item) => (
                <li key={item.id}>
                  <NavEntry
                    to={item.to}
                    label={item.label}
                    icon={item.icon}
                    collapsed={collapsed}
                    onNavigate={onNavigate}
                  />
                </li>
              ))}
            </ul>
          </section>
        ) : null}
      </div>
    </nav>
  );
}

export { SidebarContent };
