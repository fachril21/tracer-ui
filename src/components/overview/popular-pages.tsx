import { MousePointerClick, ScrollText } from "lucide-react";
import { Link } from "react-router";
import { buttonVariants } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { formatCount } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { PopularPage } from "@/mock/types";

function ShortcutLink({ to, label, children }: { to: string; label: string; children: React.ReactNode }) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Link
          to={to}
          aria-label={label}
          className={cn(buttonVariants({ variant: "ghost", size: "icon" }), "size-8")}
        >
          {children}
        </Link>
      </TooltipTrigger>
      <TooltipContent>{label}</TooltipContent>
    </Tooltip>
  );
}

type PopularPagesProps = {
  pages: PopularPage[];
  projectId: string;
  selectedPath?: string;
  onToggle: (path: string) => void;
};

function PopularPages({ pages, projectId, selectedPath, onToggle }: PopularPagesProps) {
  const topSessions = Math.max(...pages.map((page) => page.sessions), 1);

  return (
    <ul className="flex flex-col divide-y divide-hairline">
      {pages.map((page) => {
        const query = `?page=${encodeURIComponent(page.path)}`;
        return (
          <li key={page.path} className="flex items-center gap-3 py-2.5">
            <div className="flex min-w-0 flex-1 flex-col gap-1.5">
              <div className="flex items-baseline justify-between gap-3">
                <button
                  type="button"
                  aria-pressed={page.path === selectedPath}
                  aria-label={`Saring berdasarkan halaman ${page.path}`}
                  onClick={() => onToggle(page.path)}
                  className={cn(
                    "-mx-1 min-h-7 min-w-7 truncate rounded-sm px-1 py-1 text-left pointer-coarse:min-h-10 font-mono text-mono text-ink transition-colors duration-[var(--motion-fast)] hover:bg-surface-hover",
                    page.path === selectedPath && "bg-primary-soft",
                  )}
                >
                  {page.path}
                </button>
                <span className="font-mono text-caption tabular-nums text-mute">
                  {`${formatCount(page.sessions)} sesi`}
                </span>
              </div>
              <div
                role="presentation"
                className="h-1 overflow-hidden rounded-xs bg-surface-active"
              >
                <div
                  className="h-full rounded-xs bg-primary"
                  style={{ width: `${(page.sessions / topSessions) * 100}%` }}
                />
              </div>
            </div>
            <div className="flex shrink-0 items-center">
              <ShortcutLink to={`/p/${projectId}/click-map${query}`} label={`Buka Peta Klik untuk ${page.path}`}>
                <MousePointerClick />
              </ShortcutLink>
              <ShortcutLink to={`/p/${projectId}/scroll-map${query}`} label={`Buka Peta Gulir untuk ${page.path}`}>
                <ScrollText />
              </ShortcutLink>
            </div>
          </li>
        );
      })}
    </ul>
  );
}

export { PopularPages };
