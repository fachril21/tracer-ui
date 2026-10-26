import { Dialog as DialogPrimitive } from "radix-ui";
import type { ComponentProps } from "react";
import { cn } from "@/lib/utils";

const Sheet = DialogPrimitive.Root;
const SheetTrigger = DialogPrimitive.Trigger;
const SheetClose = DialogPrimitive.Close;
const SheetTitle = DialogPrimitive.Title;
const SheetDescription = DialogPrimitive.Description;

type SheetContentProps = ComponentProps<typeof DialogPrimitive.Content> & {
  side?: "left" | "right";
  // Panel demo tidak boleh mengunci halaman di belakangnya
  showOverlay?: boolean;
};

function SheetContent({
  className,
  side = "left",
  showOverlay = true,
  children,
  ...props
}: SheetContentProps) {
  return (
    <DialogPrimitive.Portal>
      {showOverlay ? (
        <DialogPrimitive.Overlay className="fixed inset-0 z-40 bg-ink/40 animate-[fade-in_var(--motion-base)_var(--ease-out)]" />
      ) : null}
      <DialogPrimitive.Content
        className={cn(
          "fixed inset-y-0 z-50 flex flex-col bg-canvas shadow-overlay outline-none",
          side === "left"
            ? "left-0 animate-[sheet-in-left_var(--motion-panel)_var(--ease-out)] border-r border-hairline"
            : "right-0 animate-[sheet-in-right_var(--motion-panel)_var(--ease-out)] border-l border-hairline",
          className,
        )}
        {...props}
      >
        {children}
      </DialogPrimitive.Content>
    </DialogPrimitive.Portal>
  );
}

export { Sheet, SheetClose, SheetContent, SheetDescription, SheetTitle, SheetTrigger };
