import type { HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

function Skeleton({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      aria-hidden="true"
      className={cn("animate-skeleton rounded-md bg-surface-active", className)}
      {...props}
    />
  );
}

export { Skeleton };
