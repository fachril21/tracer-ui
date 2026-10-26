import type { ReactNode } from "react";
import { CircleAlert, Info } from "lucide-react";
import { cn } from "@/lib/utils";

type AuthNoticeProps = {
  tone: "info" | "danger" | "warning";
  children: ReactNode;
  action?: ReactNode;
};

const TONE: Record<AuthNoticeProps["tone"], string> = {
  info: "bg-surface-soft text-charcoal",
  danger: "bg-danger-bg text-danger-text",
  warning: "bg-warning-bg text-warning-text",
};

// Galat dan pemberitahuan memakai ikon dan teks, bukan warna saja
function AuthNotice({ tone, children, action }: AuthNoticeProps) {
  const Icon = tone === "info" ? Info : CircleAlert;
  return (
    <div
      role={tone === "info" ? "status" : "alert"}
      className={cn("flex items-start gap-2 rounded-md border border-hairline p-3 text-body", TONE[tone])}
    >
      <Icon className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
      <div className="flex min-w-0 flex-1 flex-col gap-2">
        <p>{children}</p>
        {action}
      </div>
    </div>
  );
}

export { AuthNotice };
