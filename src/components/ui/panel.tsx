import { useId } from "react";
import { Istilah } from "@/components/ui/istilah";
import type { GlossaryKey } from "@/lib/glossary";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

type PanelProps = {
  title: string;
  // Bila diisi, judul diberi penjelasan istilah
  term?: GlossaryKey;
  // Label kecil bergaya mono di kanan judul: jumlah baris, zona waktu, rentang
  meta?: ReactNode;
  children: ReactNode;
  className?: string;
};

function Panel({ title, term, meta, children, className }: PanelProps) {
  const headingId = useId();
  return (
    <section
      aria-labelledby={headingId}
      className={cn("flex flex-col gap-4 rounded-lg border border-hairline bg-canvas p-5", className)}
    >
      <header className="flex items-baseline justify-between gap-3">
        <h2 id={headingId} className="text-heading-md font-semibold text-ink">
          {term === undefined ? title : <Istilah term={term}>{title}</Istilah>}
        </h2>
        {meta === undefined ? null : <span className="font-mono text-caption text-mute">{meta}</span>}
      </header>
      {children}
    </section>
  );
}

export { Panel };
