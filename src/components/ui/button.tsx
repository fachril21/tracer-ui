import { cva } from "class-variance-authority";
import type { VariantProps } from "class-variance-authority";
import type { ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex shrink-0 items-center justify-center gap-2 whitespace-nowrap rounded-md text-body font-semibold transition-colors duration-[var(--motion-fast)] disabled:pointer-events-none disabled:opacity-50 [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        primary: "bg-primary text-on-primary hover:bg-primary-pressed",
        secondary: "border border-border-control bg-canvas text-ink hover:bg-surface-hover",
        ghost: "text-charcoal hover:bg-surface-hover hover:text-ink",
        destructive:
          "border border-danger-text bg-canvas text-danger-text hover:bg-danger-bg",
      },
      size: {
        // Di layar sentuh semua ukuran naik ke 40–44px agar mudah ditekan
        sm: "h-7 px-2.5 text-caption pointer-coarse:h-10",
        md: "h-[34px] px-3.5 pointer-coarse:h-11",
        lg: "h-11 px-5",
        icon: "size-[34px] pointer-coarse:size-11",
      },
    },
    defaultVariants: { variant: "secondary", size: "md" },
  },
);

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & VariantProps<typeof buttonVariants>;

function Button({ className, variant, size, type = "button", ...props }: ButtonProps) {
  return <button type={type} className={cn(buttonVariants({ variant, size }), className)} {...props} />;
}

export { Button, buttonVariants };
