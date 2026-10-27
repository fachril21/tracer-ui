import type { ReactNode } from "react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { useMediaQuery } from "@/hooks/use-media-query";
import { GLOSSARY } from "@/lib/glossary";
import type { GlossaryKey } from "@/lib/glossary";
import { cn } from "@/lib/utils";

const TRIGGER_CLASS =
  "inline cursor-help rounded-xs text-left underline decoration-stone decoration-dotted underline-offset-4 hover:decoration-ink";

type IstilahProps = {
  term: GlossaryKey;
  children: ReactNode;
  className?: string;
};

// Membungkus label yang butuh penjelasan. Hover atau fokus di desktop, ketuk di layar sentuh.
function Istilah({ term, children, className }: IstilahProps) {
  const isTouch = useMediaQuery("(pointer: coarse)");
  const text = GLOSSARY[term];

  if (isTouch) {
    return (
      <Popover>
        <PopoverTrigger asChild>
          <button type="button" className={cn(TRIGGER_CLASS, className)}>
            {children}
          </button>
        </PopoverTrigger>
        <PopoverContent className="w-64 text-caption text-charcoal">{text}</PopoverContent>
      </Popover>
    );
  }

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <button type="button" className={cn(TRIGGER_CLASS, className)}>
          {children}
        </button>
      </TooltipTrigger>
      <TooltipContent className="max-w-64 px-2.5 py-1.5 leading-snug">{text}</TooltipContent>
    </Tooltip>
  );
}

export { Istilah };
