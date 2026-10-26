import { cn } from "@/lib/utils";

// Huruf T dari bar dan batang yang terpotong diagonal, dengan satu node kotak biru sebagai titik jejak.
// Warna mengikuti tema: batang memakai warna teks, node memakai warna utama.
function LogoMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 160 144" aria-hidden="true" focusable="false" className={cn("h-5 w-auto shrink-0", className)}>
      <path fill="currentColor" d="M0 0H156V40H0Z M52 40H96V64L52 102Z M52 120L96 82V144H52Z" />
      <rect className="fill-primary" x="108" y="88" width="52" height="56" />
    </svg>
  );
}

type WordmarkProps = {
  className?: string;
  // Hanya tanda tanpa tulisan, untuk sidebar yang dilipat
  isMarkOnly?: boolean;
};

function Wordmark({ className, isMarkOnly = false }: WordmarkProps) {
  return (
    <span className={cn("flex items-center gap-2.5 text-ink", className)}>
      <LogoMark />
      {isMarkOnly ? <span className="sr-only">Tracer</span> : <span className="text-heading-md font-semibold">Tracer</span>}
    </span>
  );
}

export { LogoMark, Wordmark };
