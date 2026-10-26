import { useEffect, useRef, useState } from "react";
import { Check, Copy } from "lucide-react";
import { Button } from "@/components/ui/button";

const COPIED_VISIBLE_MS = 2000;

type CodeBlockProps = {
  label: string;
  text: string;
};

function CodeBlock({ label, text }: CodeBlockProps) {
  const [isCopied, setCopied] = useState(false);
  const timerRef = useRef<number | null>(null);

  useEffect(
    () => () => {
      if (timerRef.current !== null) window.clearTimeout(timerRef.current);
    },
    [],
  );

  const handleCopy = () => {
    const finish = () => {
      setCopied(true);
      if (timerRef.current !== null) window.clearTimeout(timerRef.current);
      timerRef.current = window.setTimeout(() => setCopied(false), COPIED_VISIBLE_MS);
    };
    // Clipboard bisa ditolak di konteks tidak aman, umpan balik tetap muncul agar alur demo terasa utuh
    navigator.clipboard.writeText(text).then(finish, finish);
  };

  return (
    <div className="relative rounded-md border border-hairline bg-surface-soft">
      <pre
        tabIndex={0}
        aria-label={label}
        className="overflow-x-auto p-3 pr-24 font-mono text-mono text-ink"
      >
        <code>{text}</code>
      </pre>
      <Button
        variant="ghost"
        size="sm"
        onClick={handleCopy}
        className="absolute right-1.5 top-1.5 bg-surface-soft"
        aria-label={`Salin ${label}`}
      >
        {isCopied ? <Check aria-hidden="true" /> : <Copy aria-hidden="true" />}
        {isCopied ? "Tersalin" : "Salin"}
      </Button>
      <span role="status" className="sr-only">
        {isCopied ? "Tersalin ke papan klip" : ""}
      </span>
    </div>
  );
}

export { CodeBlock };
