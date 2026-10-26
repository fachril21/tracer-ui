import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

type StatusKind = "success" | "warning" | "danger" | "neutral";

const KIND_CLASS: Record<StatusKind, string> = {
  success: "bg-success-bg text-success-text",
  warning: "bg-warning-bg text-warning-text",
  danger: "bg-danger-bg text-danger-text",
  neutral: "bg-surface-soft text-charcoal",
};

type StatusBadgeProps = {
  kind: StatusKind;
  // Ikon wajib: status tidak boleh hanya dibedakan lewat warna
  icon: LucideIcon;
  children: string;
  className?: string;
};

function StatusBadge({ kind, icon: Icon, children, className }: StatusBadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-caption font-medium",
        KIND_CLASS[kind],
        className,
      )}
    >
      <Icon className="size-3.5 shrink-0" aria-hidden="true" />
      {children}
    </span>
  );
}

export { StatusBadge };
export type { StatusKind };
